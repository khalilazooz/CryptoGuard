import { useMemo, useState } from 'react'
import {
  bitcoinEncode, bitcoinDecode,
  protobufEncode, protobufDecode,
  compareSchemes, PROTOBUF_TYPES,
} from './varint/varint.js'
import './varint/varint.css'

/* ============================================================================
 *  Varint Calculator — Bitcoin CompactSize vs Protobuf base-128 varint.
 *  Encode a number to bytes, decode bytes to a number, and compare the two
 *  schemes side by side (with an explainer of how they differ).
 * ========================================================================== */
export default function VarintTool() {
  const [scheme, setScheme] = useState('bitcoin') // 'bitcoin' | 'protobuf' | 'compare'
  const [mode, setMode] = useState('encode')      // 'encode' | 'decode'
  const [pbType, setPbType] = useState('uint64')
  const [showHelp, setShowHelp] = useState(true)
  const [copied, setCopied] = useState('')

  const [numIn, setNumIn] = useState('515')   // value to encode
  const [hexIn, setHexIn] = useState('fd0302') // bytes to decode

  function copy(text, tag) {
    if (!text) return
    navigator.clipboard?.writeText(text).then(() => { setCopied(tag); setTimeout(() => setCopied(''), 1300) })
  }

  /* ---- Bitcoin ---- */
  const btcEnc = useMemo(() => {
    if (scheme !== 'bitcoin' || mode !== 'encode' || !numIn.trim()) return null
    try { return { ok: true, r: bitcoinEncode(numIn) } } catch (e) { return { ok: false, error: e.message } }
  }, [scheme, mode, numIn])
  const btcDec = useMemo(() => {
    if (scheme !== 'bitcoin' || mode !== 'decode' || !hexIn.trim()) return null
    try { return { ok: true, r: bitcoinDecode(hexIn) } } catch (e) { return { ok: false, error: e.message } }
  }, [scheme, mode, hexIn])

  /* ---- Protobuf ---- */
  const pbEnc = useMemo(() => {
    if (scheme !== 'protobuf' || mode !== 'encode' || !numIn.trim()) return null
    try { return { ok: true, r: protobufEncode(numIn, pbType) } } catch (e) { return { ok: false, error: e.message } }
  }, [scheme, mode, numIn, pbType])
  const pbDec = useMemo(() => {
    if (scheme !== 'protobuf' || mode !== 'decode' || !hexIn.trim()) return null
    try { return { ok: true, r: protobufDecode(hexIn, pbType) } } catch (e) { return { ok: false, error: e.message } }
  }, [scheme, mode, hexIn, pbType])

  /* ---- Compare ---- */
  const cmp = useMemo(() => {
    if (scheme !== 'compare' || !numIn.trim()) return null
    try { return { ok: true, r: compareSchemes(numIn) } } catch (e) { return { ok: false, error: e.message } }
  }, [scheme, numIn])

  return (
    <div className="vi">
      <div className="vi-bg" />
      <div className="vi-card">
        <h2 className="vi-title">Varint Calculator</h2>
        <p className="vi-sub">
          Encode an integer to its variable-length byte form, or decode bytes back —
          for both <b>Bitcoin CompactSize</b> and <b>Protobuf base-128 varint</b>. The two
          look similar but are completely different on the wire; the comparison tab and the
          explainer below show exactly how.
        </p>

        <button className="vi-help-toggle" type="button" onClick={() => setShowHelp((v) => !v)}>
          {showHelp ? '▾' : '▸'} Bitcoin CompactSize vs Protobuf varint — what’s the difference?
        </button>
        {showHelp && <Explainer />}

        {/* scheme tabs */}
        <div className="vi-tabs vi-scheme">
          <button className={scheme === 'bitcoin' ? 'on' : ''} type="button" onClick={() => setScheme('bitcoin')}>₿ Bitcoin CompactSize</button>
          <button className={scheme === 'protobuf' ? 'on' : ''} type="button" onClick={() => setScheme('protobuf')}>🧩 Protobuf varint</button>
          <button className={scheme === 'compare' ? 'on' : ''} type="button" onClick={() => setScheme('compare')}>⇄ Compare</button>
        </div>

        {/* encode / decode toggle (not in compare) */}
        {scheme !== 'compare' && (
          <div className="vi-tabs vi-mode">
            <button className={mode === 'encode' ? 'on' : ''} type="button" onClick={() => setMode('encode')}>Encode (number → bytes)</button>
            <button className={mode === 'decode' ? 'on' : ''} type="button" onClick={() => setMode('decode')}>Decode (bytes → number)</button>
          </div>
        )}

        {/* protobuf type picker */}
        {scheme === 'protobuf' && (
          <label className="vi-field vi-type">
            <span className="vi-label">Protobuf field type</span>
            <select className="vi-select" value={pbType} onChange={(e) => setPbType(e.target.value)}>
              {PROTOBUF_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <span className="vi-foot">
              {pbType.startsWith('sint')
                ? 'sint uses ZigZag: small negatives stay small.'
                : (pbType.startsWith('int') || pbType === 'enum')
                  ? 'int/enum uses two’s complement: negatives always take 10 bytes.'
                  : 'unsigned: straight base-128, no sign handling.'}
            </span>
          </label>
        )}

        {/* ---------------- inputs ---------------- */}
        {scheme === 'compare' || mode === 'encode' ? (
          <label className="vi-field">
            <span className="vi-label">Value <em>· decimal or 0x-hex integer</em></span>
            <input className="vi-mono vi-input" spellCheck={false} value={numIn}
              onChange={(e) => setNumIn(e.target.value)} placeholder="e.g. 515  ·  1000000  ·  -1  ·  0xdeadbeef" />
          </label>
        ) : (
          <label className="vi-field">
            <span className="vi-label">Bytes <em>· hex</em></span>
            <input className="vi-mono vi-input" spellCheck={false} value={hexIn}
              onChange={(e) => setHexIn(e.target.value)} placeholder="e.g. fd0302  ·  ac02  ·  ffffffffffffffffff01" />
          </label>
        )}

        {/* ---------------- Bitcoin output ---------------- */}
        {scheme === 'bitcoin' && mode === 'encode' && btcEnc && (
          btcEnc.ok ? (
            <ResultBytes
              hex={btcEnc.r.hex} bytes={btcEnc.r.bytes} note={btcEnc.r.note}
              copied={copied === 'be'} onCopy={() => copy(btcEnc.r.hex, 'be')}
              chips={[btcEnc.r.prefix ? `tag 0x${btcEnc.r.prefix}` : 'no tag (1 byte)', `${btcEnc.r.bytes} byte(s)`]}
            />
          ) : <div className="vi-err">⚠ {btcEnc.error}</div>
        )}
        {scheme === 'bitcoin' && mode === 'decode' && btcDec && (
          btcDec.ok ? (
            <ResultValue
              dec={btcDec.r.value.toString()} hex={'0x' + btcDec.r.value.toString(16)} note={btcDec.r.note}
              copied={copied === 'bd'} onCopy={() => copy(btcDec.r.value.toString(), 'bd')}
              chips={[
                btcDec.r.prefix ? `tag 0x${btcDec.r.prefix}` : 'no tag',
                `${btcDec.r.consumed} byte(s) read`,
                btcDec.r.extra > 0 ? `${btcDec.r.extra} trailing byte(s) ignored` : null,
                btcDec.r.nonCanonical ? '⚠ non-canonical' : 'canonical ✓',
              ].filter(Boolean)}
            />
          ) : <div className="vi-err">⚠ {btcDec.error}</div>
        )}

        {/* ---------------- Protobuf output ---------------- */}
        {scheme === 'protobuf' && mode === 'encode' && pbEnc && (
          pbEnc.ok ? (
            <>
              <ResultBytes
                hex={pbEnc.r.hex} bytes={pbEnc.r.bytes}
                note={pbEnc.r.zigzag != null
                  ? `ZigZag-mapped ${pbEnc.r.value} → unsigned ${pbEnc.r.zigzag}, then base-128.`
                  : `value → unsigned bit pattern ${pbEnc.r.encodedUnsigned}, then base-128 (7 bits/byte, LSB first).`}
                copied={copied === 'pe'} onCopy={() => copy(pbEnc.r.hex, 'pe')}
                chips={[`${pbEnc.r.bytes} byte(s)`, pbEnc.r.zigzag != null ? 'ZigZag' : null].filter(Boolean)}
              />
              <GroupView groups={pbEnc.r.groups} />
            </>
          ) : <div className="vi-err">⚠ {pbEnc.error}</div>
        )}
        {scheme === 'protobuf' && mode === 'decode' && pbDec && (
          pbDec.ok ? (
            <>
              <ResultValue
                dec={pbDec.r.value.toString()} hex={signedHex(pbDec.r.value)}
                note={`unsigned varint = ${pbDec.r.unsigned}; interpreted as ${pbDec.r.type} → ${pbDec.r.value}.`}
                copied={copied === 'pd'} onCopy={() => copy(pbDec.r.value.toString(), 'pd')}
                chips={[
                  `${pbDec.r.consumed} byte(s) read`,
                  pbDec.r.extra > 0 ? `${pbDec.r.extra} trailing byte(s)` : null,
                ].filter(Boolean)}
              />
              <GroupView groups={pbDec.r.groups} />
            </>
          ) : <div className="vi-err">⚠ {pbDec.error}</div>
        )}

        {/* ---------------- Compare ---------------- */}
        {scheme === 'compare' && cmp && (
          cmp.ok ? (
            <div className="vi-compare">
              <table className="vi-cmp-table">
                <thead><tr><th>Scheme</th><th>Encoded (hex)</th><th>Bytes</th></tr></thead>
                <tbody>
                  {cmp.r.rows.map((row, i) => (
                    <tr key={i}>
                      <td>{row.scheme}</td>
                      <td className="mono">{row.err ? <span className="vi-cmp-na">{row.hex} <em>· {row.err}</em></span> : row.hex}</td>
                      <td className="vi-cmp-bytes">{row.bytes == null ? '—' : row.bytes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="vi-cmp-note">
                Same number, four encodings. For small positive numbers Protobuf is usually equal or shorter;
                CompactSize jumps in fixed 1/3/5/9-byte steps. For negatives, <code>int64</code> balloons to 10 bytes
                while <code>sint64</code> (ZigZag) stays tiny — and Bitcoin CompactSize can’t represent them at all.
              </p>
            </div>
          ) : <div className="vi-err">⚠ {cmp.error}</div>
        )}
      </div>
    </div>
  )
}

function signedHex(v) {
  return v < 0n ? '-0x' + (-v).toString(16) : '0x' + v.toString(16)
}

/* encoded-bytes result block */
function ResultBytes({ hex, bytes, note, chips, copied, onCopy }) {
  return (
    <div className="vi-result">
      <div className="vi-out-head">
        <span className="vi-label">Encoded bytes</span>
        <button className="vi-copy" type="button" onClick={onCopy}>{copied ? 'Copied ✓' : 'Copy'}</button>
      </div>
      <pre className="vi-out mono">{spaceHex(hex)}<span className="vi-bytes">  ({bytes} byte{bytes === 1 ? '' : 's'})</span></pre>
      <div className="vi-chips">{chips.map((c, i) => <span key={i} className="vi-chip">{c}</span>)}</div>
      <p className="vi-note">{note}</p>
    </div>
  )
}

/* decoded-value result block */
function ResultValue({ dec, hex, note, chips, copied, onCopy }) {
  return (
    <div className="vi-result">
      <div className="vi-out-head">
        <span className="vi-label">Decoded value</span>
        <button className="vi-copy" type="button" onClick={onCopy}>{copied ? 'Copied ✓' : 'Copy'}</button>
      </div>
      <pre className="vi-out mono">{dec}<span className="vi-bytes">  ({hex})</span></pre>
      <div className="vi-chips">{chips.map((c, i) => <span key={i} className="vi-chip">{c}</span>)}</div>
      <p className="vi-note">{note}</p>
    </div>
  )
}

/* per-byte breakdown of a protobuf base-128 varint */
function GroupView({ groups }) {
  return (
    <div className="vi-groups">
      <div className="vi-groups-title">Per-byte breakdown (LSB group first)</div>
      <div className="vi-groups-row">
        {groups.map((g, i) => (
          <div key={i} className={'vi-group' + (g.last ? ' last' : '')}>
            <div className="vi-group-hex mono">0x{g.hex}</div>
            <div className="vi-group-bits mono">
              <span className={'vi-cont' + (g.cont ? ' on' : '')}>{g.cont ? '1' : '0'}</span>
              <span className="vi-payload">{g.payload}</span>
            </div>
            <div className="vi-group-tag">{g.cont ? 'more →' : 'last'}</div>
          </div>
        ))}
      </div>
      <div className="vi-groups-legend"><span className="vi-cont on">■</span> continuation bit · <span className="vi-payload">■</span> 7-bit payload</div>
    </div>
  )
}

function spaceHex(hex) {
  return (hex.match(/.{1,2}/g) || []).join(' ')
}

function Explainer() {
  return (
    <div className="vi-help">
      <p>
        Both are ways to store an integer in <b>as few bytes as possible</b> instead of a fixed 4 or 8.
        But they were designed by different people for different jobs, so the byte layout is unrelated.
      </p>

      <div className="vi-help-cols">
        <div className="vi-help-col">
          <h4>₿ Bitcoin CompactSize</h4>
          <ul>
            <li><b>Tagged, not bit-packed.</b> The first byte is either the value (if &lt; 0xFD) or a <i>tag</i> (0xFD/0xFE/0xFF) saying “a fixed 2/4/8-byte little-endian integer follows.”</li>
            <li><b>Sizes jump:</b> 1, 3, 5, or 9 bytes — nothing in between.</li>
            <li><b>Little-endian</b> payload, <b>unsigned only</b>, max 2⁶⁴−1.</li>
            <li>Must be <b>minimal/canonical</b> — consensus rejects a value padded into a wider form.</li>
            <li>Used for <i>counts &amp; lengths</i> in tx serialization: number of inputs/outputs, script length, witness item counts.</li>
          </ul>
        </div>
        <div className="vi-help-col">
          <h4>🧩 Protobuf varint</h4>
          <ul>
            <li><b>Bit-packed base-128.</b> Every byte holds 7 payload bits; its top bit (0x80) is a <i>continuation flag</i> — 1 = more bytes, 0 = stop.</li>
            <li><b>Sizes grow smoothly:</b> 1 byte per 7 bits, so 1…10 bytes for a 64-bit value.</li>
            <li><b>Little-endian groups</b> (LSB 7 bits first).</li>
            <li><b>Signed support:</b> <code>int*</code> uses two’s complement (negatives → always 10 bytes); <code>sint*</code> uses <b>ZigZag</b> so small negatives stay small.</li>
            <li>Used for <i>field values</i> (wire type 0): int32/64, uint32/64, bool, enum, sint32/64.</li>
          </ul>
        </div>
      </div>

      <table className="vi-help-diff">
        <thead><tr><th></th><th>Bitcoin CompactSize</th><th>Protobuf varint</th></tr></thead>
        <tbody>
          <tr><td>First byte</td><td>value or 0xFD/FE/FF tag</td><td>7 payload bits + continuation bit</td></tr>
          <tr><td>Granularity</td><td>1 / 3 / 5 / 9 bytes</td><td>any length 1…10 bytes</td></tr>
          <tr><td>Bit-packing</td><td>no (whole bytes)</td><td>yes (7 bits/byte)</td></tr>
          <tr><td>Signed?</td><td>no — unsigned only</td><td>yes (two’s-comp or ZigZag)</td></tr>
          <tr><td>Example: 515</td><td className="mono">fd 03 02 (3 B)</td><td className="mono">83 04 (2 B)</td></tr>
          <tr><td>Example: 300</td><td className="mono">fd 2c 01 (3 B)</td><td className="mono">ac 02 (2 B)</td></tr>
        </tbody>
      </table>
      <p className="vi-help-note">
        Rule of thumb: if you see a leading <code>0xFD/FE/FF</code> followed by little-endian bytes, it’s
        Bitcoin. If each byte’s high bit chains into the next, it’s a Protobuf varint.
      </p>
    </div>
  )
}
