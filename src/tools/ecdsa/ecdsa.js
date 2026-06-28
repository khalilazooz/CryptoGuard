/* ============================================================================
 *  Multi-curve signature helper — secp256k1 / P-256 / P-384 / P-521 (ECDSA),
 *  secp256k1 Schnorr (BIP-340), and Ed25519 (EdDSA).
 * ----------------------------------------------------------------------------
 *  Curve set mirrors the platform-SDK crypto (libbtc/trezor-crypto: secp256k1
 *  ECDSA + Schnorr, nist256p1 = P-256, ed25519-donna; mbedtls additionally
 *  enables P-384/P-521). Pure JS via @noble/curves + @noble/hashes.
 *
 *  Signature formats (ECDSA only):
 *    - compact   : r ‖ s                (2 × fieldBytes)
 *    - compact_v : r ‖ s ‖ v            (+1 recovery byte; secp256k1/P-256 only)
 *    - der       : ASN.1 DER
 *  Schnorr and Ed25519 are fixed 64-byte signatures (no DER/recovery).
 * ========================================================================== */
import { secp256k1, schnorr } from '@noble/curves/secp256k1'
import { p256 } from '@noble/curves/p256'
import { p384 } from '@noble/curves/p384'
import { p521 } from '@noble/curves/p521'
import { ed25519 } from '@noble/curves/ed25519'
import { sha256 } from '@noble/hashes/sha256'
import { sha384, sha512 } from '@noble/hashes/sha512'
import { keccak_256 } from '@noble/hashes/sha3'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'

export const toHex = bytesToHex

export function normHex(s) {
  if (s == null) return ''
  const h = String(s).replace(/0x/gi, '').replace(/[\s,:_-]/g, '')
  if (h && !/^[0-9a-fA-F]+$/.test(h)) throw new Error('not a hex string')
  if (h.length % 2 !== 0) throw new Error('hex has an odd number of nibbles')
  return h.toLowerCase()
}
const fromHex = (h) => hexToBytes(normHex(h))

/* ---- selectable pre-hash (ECDSA/Schnorr message mode) ---- */
export const HASH_ALGOS = {
  sha256: { label: 'SHA-256', fn: (b) => sha256(b) },
  keccak256: { label: 'Keccak-256', fn: (b) => keccak_256(b) },
  dsha256: { label: 'Double SHA-256', fn: (b) => sha256(sha256(b)) },
  sha384: { label: 'SHA-384', fn: (b) => sha384(b) },
  sha512: { label: 'SHA-512', fn: (b) => sha512(b) },
}

/* ============================ curve registry ============================ */
/*
 * Each entry describes one selectable curve+scheme. `lib` is the noble object.
 * scheme: 'ecdsa' | 'schnorr' | 'eddsa'
 * fieldBytes: size of r/s (and the digest ECDSA consumes)
 * privBytes: private-key length
 * hashes: ECDSA pre-hash, ie. signs hash(message) for message mode; for digest
 *         mode the digest is used as-is. Schnorr/Ed25519 ignore the selector
 *         (Schnorr signs a 32-byte message/digest directly; Ed25519 hashes
 *         internally with SHA-512).
 * formats: which signature encodings apply.
 * recovery: whether a recovery byte (v) is available -> enables compact_v.
 */
export const CURVES = {
  secp256k1: {
    id: 'secp256k1', label: 'secp256k1 · ECDSA', lib: secp256k1, scheme: 'ecdsa',
    fieldBytes: 32, privBytes: 32, recovery: true, defaultHash: 'sha256',
    formats: ['compact', 'compact_v', 'der'],
  },
  'secp256k1-schnorr': {
    id: 'secp256k1-schnorr', label: 'secp256k1 · Schnorr (BIP-340)', lib: schnorr, scheme: 'schnorr',
    fieldBytes: 32, privBytes: 32, recovery: false, defaultHash: 'sha256',
    formats: ['compact'], xOnlyPub: true, msgBytes: 32,
  },
  secp256r1: {
    id: 'secp256r1', label: 'secp256r1 / P-256 · ECDSA', lib: p256, scheme: 'ecdsa',
    fieldBytes: 32, privBytes: 32, recovery: true, defaultHash: 'sha256',
    formats: ['compact', 'compact_v', 'der'],
  },
  secp384r1: {
    id: 'secp384r1', label: 'secp384r1 / P-384 · ECDSA', lib: p384, scheme: 'ecdsa',
    fieldBytes: 48, privBytes: 48, recovery: false, defaultHash: 'sha384',
    formats: ['compact', 'der'],
  },
  secp521r1: {
    id: 'secp521r1', label: 'secp521r1 / P-521 · ECDSA', lib: p521, scheme: 'ecdsa',
    fieldBytes: 66, privBytes: 66, recovery: false, defaultHash: 'sha512',
    formats: ['compact', 'der'],
  },
  ed25519: {
    id: 'ed25519', label: 'Ed25519 · EdDSA', lib: ed25519, scheme: 'eddsa',
    fieldBytes: 32, privBytes: 32, recovery: false, defaultHash: null,
    formats: ['compact'],
  },
}
export const CURVE_LIST = Object.values(CURVES)
export function getCurve(id) {
  const c = CURVES[id]
  if (!c) throw new Error(`unknown curve ${id}`)
  return c
}

/* ============================ message / digest ============================ */
/* For ECDSA: returns the digest bytes to sign. For Schnorr: returns the 32-byte
 * message. For Ed25519: returns the raw message bytes (Ed25519 hashes itself). */
export function resolveMessage(curve, { value, isDigest, isText, hashAlgo }) {
  if (curve.scheme === 'eddsa') {
    // Ed25519 signs the message bytes directly (no external hash)
    return isText ? new TextEncoder().encode(value || '') : fromHex(value)
  }
  if (isDigest) {
    const d = fromHex(value)
    if (curve.scheme === 'schnorr' && d.length !== 32)
      throw new Error('Schnorr message/digest must be 32 bytes')
    if (curve.scheme === 'ecdsa' && d.length !== curve.fieldBytes)
      throw new Error(`digest must be ${curve.fieldBytes} bytes for ${curve.id}`)
    return d
  }
  const bytes = isText ? new TextEncoder().encode(value || '') : fromHex(value)
  if (curve.scheme === 'schnorr') {
    // BIP-340 signs a 32-byte message; hash arbitrary input to 32 bytes
    return sha256(bytes)
  }
  const algo = HASH_ALGOS[hashAlgo] || HASH_ALGOS[curve.defaultHash] || HASH_ALGOS.sha256
  return algo.fn(bytes)
}

/* ============================ public key ============================ */
export function publicKeyFromPrivate(curve, privHex, form = 'uncompressed64') {
  const h = normHex(privHex)
  if (h.length !== curve.privBytes * 2)
    throw new Error(`private key must be ${curve.privBytes} bytes (${curve.privBytes * 2} hex chars)`)
  const priv = hexToBytes(h)
  if (curve.scheme === 'schnorr') return toHex(curve.lib.getPublicKey(priv)) // x-only 32B
  if (curve.scheme === 'eddsa') return toHex(curve.lib.getPublicKey(priv)) // 32B
  if (form === 'compressed') return toHex(curve.lib.getPublicKey(priv, true))
  const unc = toHex(curve.lib.getPublicKey(priv, false)) // 04 ‖ X ‖ Y (65B)
  // 'uncompressed64' -> raw X ‖ Y with the 0x04 prefix stripped
  return form === 'uncompressed' ? unc : unc.replace(/^04/, '')
}

/* Normalise a public key for verify: accept compressed (prefix 02/03),
 * uncompressed (04 ‖ X ‖ Y), or raw 64-byte X ‖ Y (re-add 04). */
export function normalizePublicKey(curve, pubHex) {
  let h = normHex(pubHex)
  if (curve.scheme === 'schnorr' || curve.scheme === 'eddsa') return h
  const fb = curve.fieldBytes
  if (h.length === fb * 4) h = '04' + h // raw X‖Y (64B for 32B field) -> add 04 prefix
  return h
}

/* ============================ DER <-> (r,s) ============================ */
function trimInt(hex) {
  let x = hex.replace(/^(00)+/, '')
  if (x === '') x = '00'
  if (x.length % 2) x = '0' + x
  if (parseInt(x.slice(0, 2), 16) >= 0x80) x = '00' + x
  return x
}
export function rsToDer(rHex, sHex) {
  const r = trimInt(rHex), s = trimInt(sHex)
  const body =
    '02' + (r.length / 2).toString(16).padStart(2, '0') + r +
    '02' + (s.length / 2).toString(16).padStart(2, '0') + s
  const len = body.length / 2
  const lenHex = len < 0x80 ? len.toString(16).padStart(2, '0')
    : '81' + len.toString(16).padStart(2, '0')
  return '30' + lenHex + body
}
export function derToRs(derHex, fieldBytes) {
  const b = fromHex(derHex)
  let p = 0
  if (b[p++] !== 0x30) throw new Error('DER: expected SEQUENCE (0x30)')
  let seqLen = b[p++]
  if (seqLen & 0x80) { let n = seqLen & 0x7f; seqLen = 0; while (n--) seqLen = (seqLen << 8) | b[p++] }
  if (b[p++] !== 0x02) throw new Error('DER: expected INTEGER for r')
  let rl = b[p++]; const r = b.slice(p, p + rl); p += rl
  if (b[p++] !== 0x02) throw new Error('DER: expected INTEGER for s')
  let sl = b[p++]; const s = b.slice(p, p + sl); p += sl
  const w = (fieldBytes || 32) * 2
  return {
    r: toHex(r).replace(/^00/, '').padStart(w, '0'),
    s: toHex(s).replace(/^00/, '').padStart(w, '0'),
  }
}

/* ============================ format detection ============================ */
/* Decide which signature encoding a pasted blob is, for the given curve. */
export function detectSignature(curve, input) {
  const h = normHex(input)
  if (!h) throw new Error('signature is empty')
  const len = h.length / 2
  const fb = curve.fieldBytes
  const compactLen = fb * 2

  if (curve.formats.includes('der') && h.startsWith('30')) {
    try { const { r, s } = derToRs(h, fb); return { type: 'der', r, s } } catch { /* try compact */ }
  }
  if (len === fb * 2) return { type: 'compact', r: h.slice(0, compactLen), s: h.slice(compactLen, compactLen * 2) }
  if (curve.recovery && len === fb * 2 + 1)
    return { type: 'compact_v', r: h.slice(0, compactLen), s: h.slice(compactLen, compactLen * 2), v: h.slice(compactLen * 2) }
  if (curve.formats.includes('der') && h.startsWith('30')) {
    const { r, s } = derToRs(h, fb); return { type: 'der', r, s }
  }
  throw new Error(`unrecognised ${curve.id} signature (${len} bytes)`)
}

export function formatSignature(curve, r, s, recovery, type) {
  if (type === 'der') return rsToDer(r, s)
  if (type === 'compact_v') {
    const v = recovery == null ? 0 : recovery
    return r + s + (0x1b + v).toString(16).padStart(2, '0')
  }
  return r + s
}

/* ============================ sign / verify ============================ */
export function sign(curve, { privHex, message, outType, pubForm = 'uncompressed64' }) {
  const h = normHex(privHex)
  if (h.length !== curve.privBytes * 2)
    throw new Error(`private key must be ${curve.privBytes} bytes`)
  const priv = hexToBytes(h)
  const type = outType && curve.formats.includes(outType) ? outType : curve.formats[0]

  if (curve.scheme === 'eddsa') {
    const sig = curve.lib.sign(message, priv)
    return { type: 'compact', signatureHex: toHex(sig), publicKey: publicKeyFromPrivate(curve, h) }
  }
  if (curve.scheme === 'schnorr') {
    const sig = curve.lib.sign(message, priv)
    return { type: 'compact', signatureHex: toHex(sig), publicKey: publicKeyFromPrivate(curve, h) }
  }
  // ECDSA
  const sig = curve.lib.sign(message, priv) // low-S, RFC6979
  const r = sig.r.toString(16).padStart(curve.fieldBytes * 2, '0')
  const s = sig.s.toString(16).padStart(curve.fieldBytes * 2, '0')
  return {
    r, s, recovery: sig.recovery, type,
    signatureHex: formatSignature(curve, r, s, sig.recovery, type),
    publicKey: publicKeyFromPrivate(curve, h, pubForm),
  }
}

export function verify(curve, { sigInput, message, pubHex }) {
  const pub = fromHex(normalizePublicKey(curve, pubHex))
  if (curve.scheme === 'eddsa') {
    const sig = fromHex(sigInput)
    return { valid: curve.lib.verify(sig, message, pub), detectedType: 'compact' }
  }
  if (curve.scheme === 'schnorr') {
    const sig = fromHex(sigInput)
    return { valid: curve.lib.verify(sig, message, pub), detectedType: 'compact' }
  }
  const det = detectSignature(curve, sigInput)
  const sig = new curve.lib.Signature(BigInt('0x' + det.r), BigInt('0x' + det.s))
  return { valid: curve.lib.verify(sig, message, pub), detectedType: det.type, r: det.r, s: det.s, v: det.v }
}

export function parseSignature(curve, input) {
  if (curve.scheme === 'eddsa' || curve.scheme === 'schnorr') {
    const h = normHex(input)
    if (h.length / 2 !== 64) throw new Error(`${curve.id} signature must be 64 bytes`)
    return { type: 'compact', r: h.slice(0, 64), s: h.slice(64) }
  }
  return detectSignature(curve, input)
}
