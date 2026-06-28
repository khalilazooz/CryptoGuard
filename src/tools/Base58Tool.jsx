import { useMemo, useState } from 'react'
import { hexToBase58, base58ToHex } from './base58/base58.js'
import './base58/base58.css'

/* ============================================================================
 *  Base58 / Base58Check converter — Hex <-> Base58, both directions.
 * ========================================================================== */
export default function Base58Tool() {
  const [dir, setDir] = useState('hex2b58') // 'hex2b58' | 'b582hex'
  const [mode, setMode] = useState('base58') // 'base58' | 'base58check'
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)

  const hexToB58 = dir === 'hex2b58'

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: '' }
    try {
      return { output: hexToB58 ? hexToBase58(input, mode) : base58ToHex(input, mode), error: '' }
    } catch (e) {
      return { output: '', error: e.message || String(e) }
    }
  }, [input, hexToB58, mode])

  function swap() {
    // flip direction and move the (valid) output into the input
    setDir(hexToB58 ? 'b582hex' : 'hex2b58')
    if (output) setInput(output)
  }
  function copy() {
    if (!output) return
    navigator.clipboard?.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1300) })
  }

  const inLabel = hexToB58 ? 'Hex' : (mode === 'base58check' ? 'Base58Check' : 'Base58')
  const outLabel = hexToB58 ? (mode === 'base58check' ? 'Base58Check' : 'Base58') : 'Hex'
  const inPlaceholder = hexToB58 ? 'hex bytes, e.g. 00010966776006953d5567439e5e39f86a0d273bee'
    : (mode === 'base58check' ? 'e.g. 16UwLL9Risc3QfPqBUvKofHmBQ7wMtjvM' : 'e.g. StV1DL6CwTryKyV')

  return (
    <div className="b58">
      <div className="b58-bg" />
      <div className="b58-card">
        <h2 className="b58-title">Base58 ⇄ Hex</h2>
        <p className="b58-sub">Convert between hex and Base58, with optional Base58Check (4-byte double-SHA256 checksum) — the encoding used for Bitcoin-style addresses and extended keys.</p>

        <div className="b58-controls">
          <div className="b58-seg">
            <button type="button" className={mode === 'base58' ? 'on' : ''} onClick={() => setMode('base58')}>Base58</button>
            <button type="button" className={mode === 'base58check' ? 'on' : ''} onClick={() => setMode('base58check')}>Base58Check</button>
          </div>
          <div className="b58-seg">
            <button type="button" className={hexToB58 ? 'on' : ''} onClick={() => setDir('hex2b58')}>Hex → Base58</button>
            <button type="button" className={!hexToB58 ? 'on' : ''} onClick={() => setDir('b582hex')}>Base58 → Hex</button>
          </div>
        </div>

        <label className="b58-field">
          <span className="b58-label">{inLabel} <em>· input</em></span>
          <textarea className="b58-mono" rows={3} spellCheck={false}
            placeholder={inPlaceholder} value={input} onChange={(e) => setInput(e.target.value)} />
        </label>

        <div className="b58-swap-row">
          <button type="button" className="b58-swap" onClick={swap} title="swap direction">⇅ Swap</button>
        </div>

        <label className="b58-field">
          <span className="b58-label">
            {outLabel} <em>· output</em>
            <button type="button" className="b58-copy" onClick={copy} disabled={!output}>{copied ? 'Copied ✓' : 'Copy'}</button>
          </span>
          {error
            ? <div className="b58-err">⚠ {error}</div>
            : <textarea className="b58-mono b58-out" rows={3} readOnly spellCheck={false}
                placeholder="result appears here" value={output} />}
        </label>

        {output && (
          <div className="b58-meta">
            {hexToB58
              ? `${input.replace(/0x/gi, '').replace(/[\s,:_-]/g, '').length / 2 | 0} input bytes → ${output.length} Base58 chars`
              : `${output.length / 2} output bytes`}
            {mode === 'base58check' && !hexToB58 && ' · checksum verified ✓'}
          </div>
        )}
      </div>
    </div>
  )
}
