import { useMemo, useState } from 'react'
import { encode, decode, TIERS } from './compactu16/compactu16.js'
import './compactu16/compactu16.css'

/* ============================================================================
 *  Compact-u16 Calculator - Solana's ShortVec length prefix.
 *  Encode a length to bytes, decode bytes to a length, with a per-byte
 *  breakdown, the 3-tier size table, and an explainer of how it is computed.
 * ========================================================================== */
export default function CompactU16Tool() {
  const [mode, setMode] = useState('encode') // 'encode' | 'decode'
  const [showHelp, setShowHelp] = useState(true)
  const [copied, setCopied] = useState('')

  const [numIn, setNumIn] = useState('300')
  const [hexIn, setHexIn] = useState('ac02')

  function copy(text, tag) {
    if (!text) return
    navigator.clipboard?.writeText(text).then(() => { setCopied(tag); setTimeout(() => setCopied(''), 1300) })
  }

  const enc = useMemo(() => {
    if (mode !== 'encode' || !numIn.trim()) return null
    try { return { ok: true, r: encode(numIn) } } catch (e) { return { ok: false, error: e.message } }
  }, [mode, numIn])

  const dec = useMemo(() => {
    if (mode !== 'decode' || !hexIn.trim()) return null
    try { return { ok: true, r: decode(hexIn) } } catch (e) { return { ok: false, error: e.message } }
  }, [mode, hexIn])

  return (
    <div className="cu">
      <div className="cu-bg" />
      <div className="cu-card">
        <h2 className="cu-title">Compact-u16 Calculator</h2>
        <p className="cu-sub">
          Solana encodes every array length in a transaction - signatures, accounts, instructions,
          per-instruction account indexes and data bytes - as a <b>compact-u16</b> (a.k.a. ShortVec).
          It is a base-128 varint capped at 16 bits, so it is always <b>1-3 bytes</b>.
        </p>

        <button className="cu-help-toggle" type="button" onClick={() => setShowHelp((v) => !v)}>
          {showHelp ? '▾' : '▸'} How compact-u16 is calculated
        </button>
        {showHelp && <Explainer />}

        <div className="cu-tabs">
          <button className={mode === 'encode' ? 'on' : ''} type="button" onClick={() => setMode('encode')}>Encode (length → bytes)</button>
          <button className={mode === 'decode' ? 'on' : ''} type="button" onClick={() => setMode('decode')}>Decode (bytes → length)</button>
        </div>

        {mode === 'encode' ? (
          <label className="cu-field">
            <span className="cu-label">Length <em>· 0 … 65535 (decimal or 0x-hex)</em></span>
            <input className="cu-mono cu-input" spellCheck={false} value={numIn}
              onChange={(e) => setNumIn(e.target.value)} placeholder="e.g. 5  ·  300  ·  16384  ·  65535" />
          </label>
        ) : (
          <label className="cu-field">
            <span className="cu-label">Bytes <em>· hex (1-3 bytes)</em></span>
            <input className="cu-mono cu-input" spellCheck={false} value={hexIn}
              onChange={(e) => setHexIn(e.target.value)} placeholder="e.g. 05  ·  ac02  ·  ffff03" />
          </label>
        )}

        {mode === 'encode' && enc && (
          enc.ok ? (
            <div className="cu-result">
              <div className="cu-out-head">
                <span className="cu-label">Encoded bytes</span>
                <button className="cu-copy" type="button" onClick={() => copy(enc.r.hex, 'e')}>{copied === 'e' ? 'Copied ✓' : 'Copy'}</button>
              </div>
              <pre className="cu-out mono">{spaceHex(enc.r.hex)}<span className="cu-bytes">  ({enc.r.bytes} byte{enc.r.bytes === 1 ? '' : 's'})</span></pre>
              <GroupView groups={enc.r.groups} />
              <p className="cu-note">{enc.r.note}</p>
            </div>
          ) : <div className="cu-err">⚠ {enc.error}</div>
        )}

        {mode === 'decode' && dec && (
          dec.ok ? (
            <div className="cu-result">
              <div className="cu-out-head">
                <span className="cu-label">Decoded length</span>
                <button className="cu-copy" type="button" onClick={() => copy(String(dec.r.value), 'd')}>{copied === 'd' ? 'Copied ✓' : 'Copy'}</button>
              </div>
              <pre className="cu-out mono">{dec.r.value}<span className="cu-bytes">  (0x{dec.r.value.toString(16)})</span></pre>
              <div className="cu-chips">
                <span className="cu-chip">{dec.r.consumed} byte{dec.r.consumed === 1 ? '' : 's'} read</span>
                {dec.r.extra > 0 && <span className="cu-chip">{dec.r.extra} trailing byte{dec.r.extra === 1 ? '' : 's'}</span>}
                <span className={'cu-chip' + (dec.r.nonCanonical ? ' warn' : '')}>{dec.r.nonCanonical ? '⚠ non-canonical' : 'canonical ✓'}</span>
              </div>
              <GroupView groups={dec.r.groups} />
              <p className="cu-note">{dec.r.note}</p>
            </div>
          ) : <div className="cu-err">⚠ {dec.error}</div>
        )}

        <div className="cu-tiers">
          <div className="cu-tiers-title">Size tiers</div>
          <table className="cu-tier-table">
            <thead><tr><th>Length range</th><th>Bytes</th><th>Example</th><th>Encoded</th></tr></thead>
            <tbody>
              {TIERS.map((t, i) => (
                <tr key={i}>
                  <td className="mono">{t.range}</td>
                  <td className="cu-tier-bytes">{t.bytes}</td>
                  <td className="mono">{t.example}</td>
                  <td className="mono">{spaceHex(t.hex)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function GroupView({ groups }) {
  return (
    <div className="cu-groups">
      <div className="cu-groups-title">Per-byte breakdown (LSB group first)</div>
      <div className="cu-groups-row">
        {groups.map((g, i) => (
          <div key={i} className={'cu-group' + (g.last ? ' last' : '')}>
            <div className="cu-group-hex mono">0x{g.hex}</div>
            <div className="cu-group-bits mono">
              <span className={'cu-cont' + (g.cont ? ' on' : '')}>{g.cont ? '1' : '0'}</span>
              <span className="cu-payload">{g.payload}</span>
            </div>
            <div className="cu-group-tag">{g.cont ? 'more →' : 'last'}</div>
          </div>
        ))}
      </div>
      <div className="cu-groups-legend"><span className="cu-cont on">■</span> continuation bit · <span className="cu-payload">■</span> 7-bit payload</div>
    </div>
  )
}

function spaceHex(hex) { return (hex.match(/.{1,2}/g) || []).join(' ') }

function Explainer() {
  return (
    <div className="cu-help">
      <p>
        A compact-u16 stores a length (0-65535) in as few bytes as possible. The algorithm
        (solana_sdk <code>encode_length</code>) peels off <b>7 bits at a time</b>, low bits first:
      </p>
      <ol className="cu-steps">
        <li>Take the low 7 bits of the value → that is the byte payload.</li>
        <li>Shift the value right by 7.</li>
        <li>If anything remains, set the byte high bit (<code>0x80</code>) - the <b>continuation flag</b> - and repeat.</li>
        <li>If nothing remains, the high bit stays 0 and this is the last byte.</li>
      </ol>
      <p className="cu-help-ex">
        <b>Example - 300.</b> 300 = <code>1 0010 1100</code>. Low 7 bits = <code>0101100</code> = 0x2C, more remains
        → first byte <code>0xAC</code> (<code>0x2C | 0x80</code>). Shift right 7 → <code>10</code> = 2, nothing left
        → second byte <code>0x02</code>. Result: <code>AC 02</code>. Decode reverses it:
        <code>(0x2C) | (0x02 &lt;&lt; 7) = 44 + 256 = 300</code>.
      </p>
      <p>
        Because the value is capped at 16 bits, it never needs more than <b>3 bytes</b>, and the 3rd byte
        can only carry 2 payload bits (<code>0x00-0x03</code>). The encoding must be <b>minimal</b>: Solana
        rejects padded forms like <code>80 00</code> for 0.
      </p>
      <p className="cu-help-note">
        Same wire shape as a Protobuf varint for 0-65535, but compact-u16 is u16-bounded, always a length
        (unsigned), and strictly canonical. See the <b>Varint Calculator</b> tool for the general scheme and
        the Bitcoin CompactSize comparison.
      </p>
    </div>
  )
}
