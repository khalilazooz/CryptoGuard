import { useMemo, useState } from 'react'
import {
  ALGO_GROUPS,
  hashAll,
  HMAC_ALGOS,
  hmacHash,
  PBKDF2_ALGOS,
  pbkdf2Hash,
} from './hashing/hashes.js'
import './hashing/hashing.css'

/* ============================================================================
 *  Hashing tool — every hash the libbtc / trezor-crypto stack supports.
 * ========================================================================== */
export default function HashTool() {
  const [input, setInput] = useState('')
  const [isText, setIsText] = useState(true)
  const [mode, setMode] = useState('hash') // 'hash' | 'hmac' | 'pbkdf2'
  const [copiedId, setCopiedId] = useState(null)

  // HMAC state
  const [hmacAlgo, setHmacAlgo] = useState('hmac_sha256')
  const [hmacKey, setHmacKey] = useState('')
  const [hmacKeyText, setHmacKeyText] = useState(true)

  // PBKDF2 state
  const [pbAlgo, setPbAlgo] = useState('pbkdf2_sha256')
  const [pbSalt, setPbSalt] = useState('')
  const [pbSaltText, setPbSaltText] = useState(true)
  const [pbIters, setPbIters] = useState('2048')
  const [pbLen, setPbLen] = useState('32')

  const rows = useMemo(() => {
    if (mode !== 'hash') return []
    if (!input) return []
    try { return hashAll(input, isText) } catch { return null /* invalid input */ }
  }, [input, isText, mode])

  const inputErr = mode === 'hash' && input && rows === null

  const hmacResult = useMemo(() => {
    if (mode !== 'hmac' || !input) return null
    try { return { value: hmacHash(hmacAlgo, { key: hmacKey, keyIsText: hmacKeyText, message: input, msgIsText: isText }) } }
    catch (e) { return { error: e.message } }
  }, [mode, hmacAlgo, hmacKey, hmacKeyText, input, isText])

  const pbResult = useMemo(() => {
    if (mode !== 'pbkdf2' || !input) return null
    try { return { value: pbkdf2Hash(pbAlgo, { password: input, pwIsText: isText, salt: pbSalt, saltIsText: pbSaltText, iterations: pbIters, dkLen: pbLen }) } }
    catch (e) { return { error: e.message } }
  }, [mode, pbAlgo, input, isText, pbSalt, pbSaltText, pbIters, pbLen])

  function copy(id, text) {
    if (!text) return
    navigator.clipboard?.writeText(text).then(() => { setCopiedId(id); setTimeout(() => setCopiedId(null), 1200) })
  }

  return (
    <div className="hs">
      <div className="hs-bg" />
      <div className="hs-card">
        <h2 className="hs-title">Hashing · libbtc / trezor-crypto set</h2>
        <p className="hs-sub">Hash any input across every algorithm the wallet stack supports — SHA-1/2/3, Keccak, RIPEMD-160, BLAKE / BLAKE2 / BLAKE3, plus device composites (HASH160, double-SHA256), HMAC and PBKDF2.</p>

        {/* mode tabs */}
        <div className="hs-tabs">
          {[['hash', 'Hash'], ['hmac', 'HMAC'], ['pbkdf2', 'PBKDF2']].map(([m, label]) => (
            <button key={m} type="button" className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>{label}</button>
          ))}
        </div>

        {/* input */}
        <label className="hs-field">
          <span className="hs-label">
            {mode === 'pbkdf2' ? 'Password' : mode === 'hmac' ? 'Message' : 'Input'}
            <span className="hs-inline">
              <select value={isText ? 'text' : 'hex'} onChange={(e) => setIsText(e.target.value === 'text')}>
                <option value="text">text</option>
                <option value="hex">hex</option>
              </select>
            </span>
          </span>
          <textarea className="hs-mono" rows={3} spellCheck={false}
            placeholder={isText ? 'type your input' : 'input bytes in hex'}
            value={input} onChange={(e) => setInput(e.target.value)} />
          {inputErr && <span className="hs-err">⚠ input is not valid hex</span>}
        </label>

        {/* HMAC extra inputs */}
        {mode === 'hmac' && (
          <div className="hs-row">
            <label className="hs-field hs-grow">
              <span className="hs-label">Key
                <span className="hs-inline">
                  <select value={hmacKeyText ? 'text' : 'hex'} onChange={(e) => setHmacKeyText(e.target.value === 'text')}>
                    <option value="text">text</option><option value="hex">hex</option>
                  </select>
                </span>
              </span>
              <input className="hs-mono" spellCheck={false} value={hmacKey} onChange={(e) => setHmacKey(e.target.value)} />
            </label>
            <label className="hs-field">
              <span className="hs-label">Algorithm</span>
              <select className="hs-sel" value={hmacAlgo} onChange={(e) => setHmacAlgo(e.target.value)}>
                {HMAC_ALGOS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </label>
          </div>
        )}

        {/* PBKDF2 extra inputs */}
        {mode === 'pbkdf2' && (
          <>
            <div className="hs-row">
              <label className="hs-field hs-grow">
                <span className="hs-label">Salt
                  <span className="hs-inline">
                    <select value={pbSaltText ? 'text' : 'hex'} onChange={(e) => setPbSaltText(e.target.value === 'text')}>
                      <option value="text">text</option><option value="hex">hex</option>
                    </select>
                  </span>
                </span>
                <input className="hs-mono" spellCheck={false} value={pbSalt} onChange={(e) => setPbSalt(e.target.value)} />
              </label>
              <label className="hs-field">
                <span className="hs-label">Algorithm</span>
                <select className="hs-sel" value={pbAlgo} onChange={(e) => setPbAlgo(e.target.value)}>
                  {PBKDF2_ALGOS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
              </label>
            </div>
            <div className="hs-row">
              <label className="hs-field">
                <span className="hs-label">Iterations</span>
                <input className="hs-mono" style={{ width: 130 }} value={pbIters} onChange={(e) => setPbIters(e.target.value)} />
              </label>
              <label className="hs-field">
                <span className="hs-label">Output length (bytes)</span>
                <input className="hs-mono" style={{ width: 130 }} value={pbLen} onChange={(e) => setPbLen(e.target.value)} />
              </label>
            </div>
          </>
        )}

        {/* ---- HASH results (all algorithms) ---- */}
        {mode === 'hash' && (
          <div className="hs-results">
            {!input && <p className="hs-empty">Enter an input to hash it with every algorithm at once.</p>}
            {input && rows && ALGO_GROUPS.map(({ group }) => (
              <div className="hs-group" key={group}>
                <div className="hs-group-title">{group}</div>
                {rows.filter((r) => r.group === group).map((r) => (
                  <div className={'hs-result' + (r.disabled ? ' hs-disabled' : '')} key={r.id}>
                    <div className="hs-result-head">
                      <span className="hs-algo">{r.label} <em>· {r.out}B</em></span>
                      {!r.disabled && (
                        <button type="button" className="hs-copy" onClick={() => copy(r.id, r.digest)}>
                          {copiedId === r.id ? '✓' : 'copy'}
                        </button>
                      )}
                    </div>
                    {r.disabled
                      ? <div className="hs-note">{r.note}</div>
                      : <div className="hs-digest hs-mono">{r.digest}</div>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ---- HMAC result ---- */}
        {mode === 'hmac' && hmacResult && (
          <ResultBox label={HMAC_ALGOS.find((a) => a.id === hmacAlgo).label} result={hmacResult}
            copied={copiedId === 'hmac'} onCopy={() => copy('hmac', hmacResult.value)} />
        )}

        {/* ---- PBKDF2 result ---- */}
        {mode === 'pbkdf2' && pbResult && (
          <ResultBox label={PBKDF2_ALGOS.find((a) => a.id === pbAlgo).label} result={pbResult}
            copied={copiedId === 'pb'} onCopy={() => copy('pb', pbResult.value)} />
        )}
      </div>
    </div>
  )
}

function ResultBox({ label, result, copied, onCopy }) {
  return (
    <div className="hs-result">
      <div className="hs-result-head">
        <span className="hs-algo">{label}</span>
        {result.value && <button type="button" className="hs-copy" onClick={onCopy}>{copied ? '✓' : 'copy'}</button>}
      </div>
      {result.error
        ? <div className="hs-err">⚠ {result.error}</div>
        : <div className="hs-digest hs-mono">{result.value}</div>}
    </div>
  )
}
