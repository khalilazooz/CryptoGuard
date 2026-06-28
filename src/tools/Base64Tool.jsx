import { useMemo, useState } from 'react'
import { hexToBase64, base64ToHex } from './base64/base64.js'
import './base64/base64.css'

/* ============================================================================
 *  Base64 / Base64URL converter — Hex <-> Base64, both directions.
 * ========================================================================== */
export default function Base64Tool() {
  const [dir, setDir] = useState('hex2b64') // 'hex2b64' | 'b642hex'
  const [mode, setMode] = useState('base64') // 'base64' | 'base64url'
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)

  const hexToB64 = dir === 'hex2b64'

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: '' }
    try {
      return { output: hexToB64 ? hexToBase64(input, mode) : base64ToHex(input), error: '' }
    } catch (e) {
      return { output: '', error: e.message || String(e) }
    }
  }, [input, hexToB64, mode])

  function swap() {
    setDir(hexToB64 ? 'b642hex' : 'hex2b64')
    if (output) setInput(output)
  }
  function copy() {
    if (!output) return
    navigator.clipboard?.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1300) })
  }

  const b64Label = mode === 'base64url' ? 'Base64URL' : 'Base64'
  const inLabel = hexToB64 ? 'Hex' : b64Label
  const outLabel = hexToB64 ? b64Label : 'Hex'
  const inPlaceholder = hexToB64
    ? 'hex bytes, e.g. 666f6f626172'
    : (mode === 'base64url' ? 'e.g. Zm9vYmFy (URL-safe, padding optional)' : 'e.g. Zm9vYmFy')

  return (
    <div className="b64">
      <div className="b64-bg" />
      <div className="b64-card">
        <h2 className="b64-title">Base64 ⇄ Hex</h2>
        <p className="b64-sub">Convert between hex and Base64. Choose standard Base64 (A–Z a–z 0–9 + /, padded) or Base64URL (URL-safe - _, no padding). Decoding accepts either alphabet, padded or not.</p>

        <div className="b64-controls">
          <div className="b64-seg">
            <button type="button" className={mode === 'base64' ? 'on' : ''} onClick={() => setMode('base64')}>Base64</button>
            <button type="button" className={mode === 'base64url' ? 'on' : ''} onClick={() => setMode('base64url')}>Base64URL</button>
          </div>
          <div className="b64-seg">
            <button type="button" className={hexToB64 ? 'on' : ''} onClick={() => setDir('hex2b64')}>Hex → {b64Label}</button>
            <button type="button" className={!hexToB64 ? 'on' : ''} onClick={() => setDir('b642hex')}>{b64Label} → Hex</button>
          </div>
        </div>

        <label className="b64-field">
          <span className="b64-label">{inLabel} <em>· input</em></span>
          <textarea className="b64-mono" rows={3} spellCheck={false}
            placeholder={inPlaceholder} value={input} onChange={(e) => setInput(e.target.value)} />
        </label>

        <div className="b64-swap-row">
          <button type="button" className="b64-swap" onClick={swap} title="swap direction">⇅ Swap</button>
        </div>

        <label className="b64-field">
          <span className="b64-label">
            {outLabel} <em>· output</em>
            <button type="button" className="b64-copy" onClick={copy} disabled={!output}>{copied ? 'Copied ✓' : 'Copy'}</button>
          </span>
          {error
            ? <div className="b64-err">⚠ {error}</div>
            : <textarea className="b64-mono b64-out" rows={3} readOnly spellCheck={false}
                placeholder="result appears here" value={output} />}
        </label>

        {output && (
          <div className="b64-meta">
            {hexToB64
              ? `${input.replace(/0x/gi, '').replace(/[\s,:_-]/g, '').length / 2 | 0} input bytes → ${output.length} ${b64Label} chars`
              : `${output.length / 2} output bytes`}
          </div>
        )}
      </div>
    </div>
  )
}
