import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CURVE_LIST,
  getCurve,
  publicKeyFromPrivate,
  resolveMessage,
  sign as curveSign,
  verify as curveVerify,
  parseSignature,
  formatSignature,
  normHex,
  HASH_ALGOS,
} from './ecdsa/ecdsa.js'
import './ecdsa/ecdsa.css'

const FORMAT_LABEL = {
  compact: 'Compact (r‖s)',
  compact_v: 'Compact + v (r‖s‖v)',
  der: 'DER',
}

/* ============================================================================
 *  Multi-curve signature tool — secp256k1/P-256/P-384/P-521 ECDSA,
 *  secp256k1 Schnorr (BIP-340), Ed25519 EdDSA.
 * ========================================================================== */
export default function EcdsaTool() {
  const [curveId, setCurveId] = useState('secp256k1')
  const curve = getCurve(curveId)

  const [priv, setPriv] = useState('')
  const [pub, setPub] = useState('')
  const [pubAuto, setPubAuto] = useState(false)
  const [pubForm, setPubForm] = useState('uncompressed64') // 'uncompressed64' | 'compressed' (ECDSA only)

  const [msg, setMsg] = useState('')
  const [msgMode, setMsgMode] = useState('message') // 'message' | 'digest'
  const [msgIsText, setMsgIsText] = useState(false)
  const [hashAlgo, setHashAlgo] = useState(curve.defaultHash || 'sha256')

  const [sig, setSig] = useState('')
  const [sigType, setSigType] = useState(curve.formats[0])

  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const lastRs = useRef(null)
  const prevCurve = useRef(curveId)

  // hashing only matters for ECDSA message-mode (Schnorr hashes to 32B itself, Ed25519 hashes internally)
  const showHash = curve.scheme === 'ecdsa' && msgMode === 'message'

  // reset per-curve dependent state on curve change
  useEffect(() => {
    if (prevCurve.current !== curveId) {
      setHashAlgo(curve.defaultHash || 'sha256')
      setSigType(curve.formats[0])
      setResult(null)
      prevCurve.current = curveId
      // re-derive pub if a valid priv is present (key length may differ)
      reDerive(priv)
    }
  }, [curveId]) // eslint-disable-line react-hooks/exhaustive-deps

  function reDerive(p) {
    const h = (() => { try { return normHex(p) } catch { return null } })()
    if (h && h.length === curve.privBytes * 2) {
      try { setPub(publicKeyFromPrivate(curve, h, pubForm)); setPubAuto(true); return } catch { /* fall */ }
    }
    if (pubAuto) { setPub(''); setPubAuto(false) }
  }
  useEffect(() => { reDerive(priv) }, [priv]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (curve.scheme === 'ecdsa') reDerive(priv) }, [pubForm]) // eslint-disable-line react-hooks/exhaustive-deps

  function onSigChange(value) {
    setSig(value); setResult(null)
    try {
      const det = parseSignature(curve, value)
      setSigType(det.type)
      lastRs.current = { r: det.r, s: det.s, recovery: det.v != null ? Number('0x' + det.v) - 0x1b : null }
    } catch { /* keep selector */ }
  }
  function onSigTypeChange(type) {
    setSigType(type)
    const rs = lastRs.current
    if (curve.scheme === 'ecdsa' && rs && rs.r && rs.s) {
      setSig(formatSignature(curve, rs.r, rs.s, rs.recovery, type))
    }
  }

  const hashOptions = useMemo(() => Object.entries(HASH_ALGOS).map(([k, v]) => [k, v.label]), [])

  function getMessage() {
    return resolveMessage(curve, { value: msg, isDigest: msgMode === 'digest', isText: msgIsText, hashAlgo })
  }

  function doSign() {
    setResult(null)
    try {
      const message = getMessage()
      const out = curveSign(curve, { privHex: priv, message, outType: sigType, pubForm })
      setSig(out.signatureHex)
      if (out.r) lastRs.current = { r: out.r, s: out.s, recovery: out.recovery }
      if (!pub || pubAuto) setPub(out.publicKey)
      const recTxt = out.recovery != null ? ` · recovery id = ${out.recovery} (v=${0x1b + out.recovery})` : ''
      setResult({ kind: 'ok', text: `Signed with ${curve.label}${recTxt}` })
    } catch (e) { setResult({ kind: 'err', text: e.message || String(e) }) }
  }

  function doVerify() {
    setResult(null)
    try {
      const message = getMessage()
      const { valid, detectedType } = curveVerify(curve, { sigInput: sig, message, pubHex: pub })
      if (detectedType) setSigType(detectedType)
      setResult(valid
        ? { kind: 'ok', text: `Signature is VALID for this public key (${curve.label}).` }
        : { kind: 'bad', text: `Signature is INVALID for this public key (${curve.label}).` })
    } catch (e) { setResult({ kind: 'err', text: e.message || String(e) }) }
  }

  function copySig() {
    if (!sig) return
    navigator.clipboard?.writeText(sig).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400) })
  }

  const privBits = curve.privBytes * 8
  const pubHint = curve.scheme === 'schnorr' ? '32-byte x-only'
    : curve.scheme === 'eddsa' ? '32-byte'
    : `uncompressed ${curve.fieldBytes * 2}-byte (X‖Y); compressed / 04-prefixed also accepted`
  const msgIs32 = curve.scheme === 'schnorr'

  return (
    <div className="ec">
      <div className="ec-bg" />
      <div className="ec-card">
        <h2 className="ec-title">EC Signatures · multi-curve</h2>
        <p className="ec-sub">Sign or verify across the curves used by the wallet stack. Public key auto-derives from the private key (uncompressed); signature format is detected on paste.</p>

        {/* CURVE */}
        <label className="ec-field">
          <span className="ec-label">Curve / scheme</span>
          <select className="ec-curve" value={curveId} onChange={(e) => setCurveId(e.target.value)}>
            {CURVE_LIST.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>

        {/* PRIVATE KEY */}
        <label className="ec-field">
          <span className="ec-label">Private key <em>· {curve.privBytes}-byte hex ({privBits}-bit), optional for verify</em></span>
          <input className="ec-mono" spellCheck={false} placeholder={`${curve.privBytes * 2} hex chars`}
            value={priv} onChange={(e) => { setPriv(e.target.value); setResult(null) }} />
        </label>

        {/* PUBLIC KEY */}
        <label className="ec-field">
          <span className="ec-label">
            Public key <em>· {pubAuto ? 'auto-derived' : pubHint}</em>
            {curve.scheme === 'ecdsa' && (
              <span className="ec-inline-ctl">
                <select value={pubForm} onChange={(e) => { setPubForm(e.target.value); setResult(null) }}
                  title="public key encoding">
                  <option value="uncompressed64">Uncompressed ({curve.fieldBytes * 2}B, X‖Y)</option>
                  <option value="compressed">Compressed ({curve.fieldBytes + 1}B)</option>
                </select>
              </span>
            )}
          </span>
          <input className={'ec-mono' + (pubAuto ? ' ec-auto' : '')} spellCheck={false}
            placeholder="paste a public key to verify, or set a private key above"
            value={pub} readOnly={pubAuto}
            onChange={(e) => { setPub(e.target.value); setResult(null) }} />
        </label>

        {/* MESSAGE / DIGEST */}
        <label className="ec-field">
          <span className="ec-label">
            {msgMode === 'digest' ? (msgIs32 ? 'Message/Digest (32B)' : 'Digest') : 'Message'}
            <span className="ec-inline-ctl">
              <select value={msgMode} onChange={(e) => { setMsgMode(e.target.value); setResult(null) }}>
                <option value="message">Message</option>
                <option value="digest">{msgIs32 ? 'Message (32B)' : 'Digest'}</option>
              </select>
              <select value={msgIsText ? 'text' : 'hex'} onChange={(e) => setMsgIsText(e.target.value === 'text')}>
                <option value="hex">hex</option>
                <option value="text">text</option>
              </select>
              {showHash && (
                <select value={hashAlgo} onChange={(e) => setHashAlgo(e.target.value)} title="hash applied before signing">
                  {hashOptions.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                </select>
              )}
            </span>
          </span>
          <textarea className="ec-mono" rows={2} spellCheck={false}
            placeholder={msgMode === 'digest' ? 'digest in hex' : (msgIsText ? 'type your message' : 'message bytes in hex')}
            value={msg} onChange={(e) => { setMsg(e.target.value); setResult(null) }} />
          {curve.scheme === 'eddsa' && <span className="ec-foot">Ed25519 signs the message directly (internal SHA-512) — no pre-hash selector.</span>}
          {curve.scheme === 'schnorr' && <span className="ec-foot">BIP-340 signs a 32-byte message; non-32-byte input is SHA-256'd to 32 bytes.</span>}
        </label>

        {/* SIGNATURE */}
        <label className="ec-field">
          <span className="ec-label">
            Signature
            <span className="ec-inline-ctl">
              <select value={sigType} onChange={(e) => onSigTypeChange(e.target.value)} disabled={curve.formats.length === 1}>
                {curve.formats.map((f) => <option key={f} value={f}>{FORMAT_LABEL[f]}</option>)}
              </select>
              <button type="button" className="ec-mini" onClick={copySig} disabled={!sig}>{copied ? 'Copied ✓' : 'Copy'}</button>
            </span>
          </span>
          <textarea className="ec-mono" rows={3} spellCheck={false}
            placeholder="generated on Sign — or paste one to Verify (format auto-detected)"
            value={sig} onChange={(e) => onSigChange(e.target.value)} />
        </label>

        <div className="ec-actions">
          <button type="button" className="ec-btn ec-sign" onClick={doSign} disabled={!priv}>Sign</button>
          <button type="button" className="ec-btn ec-verify" onClick={doVerify} disabled={!pub || !sig}>Verify</button>
        </div>

        {result && (
          <div className={'ec-result ec-' + result.kind}>
            {result.kind === 'ok' && '✓ '}{result.kind === 'bad' && '✗ '}{result.kind === 'err' && '⚠ '}
            {result.text}
          </div>
        )}
      </div>
    </div>
  )
}
