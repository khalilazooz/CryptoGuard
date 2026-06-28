import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseApdu, lookupSW, APDU_FORMAT, CLASSES, STATUS_WORDS } from './apduparse/apdu.js'
import SPEC from './apduparse/apduSpec.json'
import './apduparse/apduparse.css'

/* ============================================================================
 *  APDU Parser — generic ISO 7816-4 decode + TWI CryptoGuard command lookup.
 *  Driven entirely by apduSpec.json (extracted from the TWI APDU spec doc).
 * ========================================================================== */
export default function ApduParser() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [lenStyle, setLenStyle] = useState('auto')
  const [showRef, setShowRef] = useState(false)

  const res = useMemo(() => {
    if (!input.trim()) return null
    try { return { ok: true, p: parseApdu(input, lenStyle) } }
    catch (e) { return { ok: false, error: e.message } }
  }, [input, lenStyle])

  const p = res?.ok ? res.p : null
  const twi = p?.twi

  return (
    <div className="ap">
      <div className="ap-bg" />
      <div className="ap-card">
        <h2 className="ap-title">APDU Parser</h2>
        <p className="ap-sub">Decode any APDU into its generic fields (CLA · INS · P1 · P2 · Lc · Data · Le · SW), then resolve the TWI CryptoGuard command, its class, and a field-by-field breakdown of the data — straight from the TWI APDU spec.</p>

        <label className="ap-field">
          <span className="ap-label">APDU (hex)
            <span className="ap-inline">
              <select value={lenStyle} onChange={(e) => setLenStyle(e.target.value)} title="length encoding">
                <option value="auto">auto length</option>
                <option value="short">short Lc (1 byte)</option>
                <option value="twi">TWI extended (00‖u16)</option>
                <option value="none">header only</option>
              </select>
            </span>
          </span>
          <textarea className="ap-mono" rows={3} spellCheck={false}
            placeholder="paste a command APDU (e.g. 0101000047…) or a 2-byte SW (e.g. 9000)"
            value={input} onChange={(e) => setInput(e.target.value)} />
        </label>

        {res && !res.ok && <div className="ap-err">⚠ {res.error}</div>}

        {/* ---- RESPONSE (SW) ---- */}
        {p?.kind === 'response' && (
          <div className="ap-detected">
            <span className="ap-tag resp">Response</span>
            <span className="ap-sw">{p.sw}</span>
            <span className={'ap-sw-name' + (twi.sw.name === 'UNKNOWN' ? ' unknown' : (p.sw.toLowerCase() === '9000' ? ' ok' : ' warn'))}>{twi.sw.name}</span>
            <span className="ap-sw-desc">{twi.sw.desc}</span>
          </div>
        )}

        {/* ---- COMMAND ---- */}
        {p?.kind === 'command' && (
          <>
            <div className="ap-detected">
              {twi.command
                ? <><span className="ap-tag cmd">{twi.command.name}</span>
                    <span className="ap-cls">{twi.class?.name || ('CLA ' + p.cla)}</span></>
                : <span className="ap-tag unknown">Unrecognised CLA/INS — generic decode only</span>}
              <span className="ap-bytes">{p.nbytes} bytes · Lc {p.lcStyle}</span>
            </div>

            {twi.command?.description && <div className="ap-desc">{twi.command.description}</div>}

            {/* generic header fields */}
            <div className="ap-section-title">Generic decode</div>
            <div className="ap-fields">
              {p.fields.map((f, i) => (
                <div className={'ap-row' + (f.isData ? ' data' : '')} key={i}>
                  <span className="ap-k">{f.label}</span>
                  <span className="ap-v mono">{f.value}</span>
                  <span className="ap-note">{f.note}</span>
                </div>
              ))}
            </div>

            {/* per-command data breakdown */}
            {twi?.dataBreakdown?.rows?.length > 0 && (
              <>
                <div className="ap-section-title">Data field breakdown <em>(per {twi.command.name})</em></div>
                <div className="ap-fields">
                  {twi.dataBreakdown.rows.map((r, i) => (
                    <div className="ap-row data" key={i}>
                      <span className="ap-k">{r.field}</span>
                      <span className="ap-v mono">{r.value || '(empty)'}</span>
                      <span className="ap-note">{r.bytes}B · len {r.len}{r.desc ? ' · ' + r.desc : ''}</span>
                    </div>
                  ))}
                  {twi.dataBreakdown.leftover && (
                    <div className="ap-row data leftover">
                      <span className="ap-k">… more / repeated</span>
                      <span className="ap-v mono">{twi.dataBreakdown.leftover}</span>
                      <span className="ap-note">{twi.dataBreakdown.leftover.length / 2}B remaining{twi.transaction ? ' (the embedded transaction — use the button below)' : ' (repeated fields / chunk tail)'}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* decoded token data (decimals + ticker, or NFT collection name) */}
            {twi?.tokenData && (
              <>
                <div className="ap-section-title">Token data <em>(decoded · {twi.tokenData.kind.label})</em></div>
                <div className="ap-fields">
                  {twi.tokenData.rows.map((r, i) => (
                    <div className={"ap-row data" + (/ticker|collection/i.test(r.field) ? " token-name" : "")} key={i}>
                      <span className="ap-k">{r.field}</span>
                      <span className="ap-v mono">{r.value}</span>
                      <span className="ap-note">{r.note || (r.bytes != null ? r.bytes + "B" : "")}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* recognized command but the spec has no data-field table */}
            {twi.command && (!twi?.dataBreakdown?.rows?.length) && p.data && (
              <>
                <div className="ap-section-title">Data <em>(no documented field layout in the spec)</em></div>
                <pre className="ap-tx-hex mono">{p.data}</pre>
              </>
            )}

            {/* embedded transaction -> hand off to the Coin Parser */}
            {twi?.transaction?.hex && (
              <div className="ap-tx">
                <div className="ap-tx-head">
                  <span className="ap-section-title" style={{ margin: 0 }}>Embedded transaction <em>({twi.transaction.hex.length / 2} bytes · {twi.transaction.source})</em></span>
                  <button type="button" className="ap-tx-btn"
                    onClick={() => navigate(`/tool/coin-parser?tx=${encodeURIComponent(twi.transaction.hex)}`)}>
                    Parse in Coin Parser →
                  </button>
                </div>
                <pre className="ap-tx-hex mono">{twi.transaction.hex}</pre>
              </div>
            )}

            {/* command's documented output data */}
            {twi.command?.outputData?.length > 0 && (
              <>
                <div className="ap-section-title">Expected response data <em>(per spec)</em></div>
                <div className="ap-fields">
                  {twi.command.outputData.map((f, i) => (
                    <div className="ap-row" key={i}>
                      <span className="ap-k">{f.field}</span>
                      <span className="ap-v">{f.len}</span>
                      <span className="ap-note">{f.desc}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ---- reference ---- */}
        <button className="ap-ref-toggle" type="button" onClick={() => setShowRef((v) => !v)}>
          {showRef ? '▾ Hide' : '▸ Show'} TWI APDU reference ({SPEC.classes.length} classes · {SPEC.commands.length} commands · {SPEC.statusWords.length} status words)
        </button>
        {showRef && <Reference />}
      </div>
    </div>
  )
}

function Reference() {
  const [q, setQ] = useState('')
  const ql = q.trim().toLowerCase()
  const cmds = SPEC.commands.filter((c) =>
    !ql || c.name.toLowerCase().includes(ql) || c.class.toLowerCase().includes(ql) ||
    `${c.cla}${c.ins}`.toLowerCase().includes(ql))
  return (
    <div className="ap-ref">
      <input className="ap-ref-search" placeholder="filter commands by name / class / CLA·INS…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="ap-ref-title">Status words</div>
      <div className="ap-fields small">
        {STATUS_WORDS.map((s) => (
          <div className="ap-row" key={s.sw}><span className="ap-k mono">{s.sw}</span><span className="ap-v">{s.name}</span><span className="ap-note">{s.desc}</span></div>
        ))}
      </div>
      <div className="ap-ref-title">Commands {ql && `· ${cmds.length} match`}</div>
      <div className="ap-fields small">
        {cmds.map((c) => (
          <div className="ap-row" key={`${c.cla}:${c.ins}:${c.name}`}>
            <span className="ap-k mono">{c.cla} {c.ins}</span>
            <span className="ap-v">{c.name}</span>
            <span className="ap-note">{c.class.replace(' commands', '')}{c.description ? ' · ' + c.description.slice(0, 70) : ''}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
