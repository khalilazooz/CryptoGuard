/* ============================================================================
 *  Base64 / Base64URL codec  (Hex <-> Base64)
 * ----------------------------------------------------------------------------
 *  - base64    : standard alphabet (A–Z a–z 0–9 + /), '=' padding.
 *  - base64url : URL-safe alphabet (A–Z a–z 0–9 - _), padding omitted by
 *                default (RFC 4648 §5). Decode tolerates padding either way and
 *                accepts both alphabets.
 *  No dependencies.
 * ========================================================================== */
const STD = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
const URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

const DECODE_MAP = (() => {
  const m = {}
  for (let i = 0; i < STD.length; i++) { m[STD[i]] = i }
  // URL-safe variants map to the same values
  m['-'] = 62
  m['_'] = 63
  return m
})()

export function normHex(s) {
  if (s == null) return ''
  const h = String(s).replace(/0x/gi, '').replace(/[\s,:_-]/g, '')
  if (h && !/^[0-9a-fA-F]+$/.test(h)) throw new Error('not a hex string')
  if (h.length % 2 !== 0) throw new Error('hex has an odd number of nibbles')
  return h.toLowerCase()
}
function hexToBytes(hex) {
  const h = normHex(hex)
  const out = new Uint8Array(h.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.substr(i * 2, 2), 16)
  return out
}
function bytesToHex(bytes) {
  let s = ''
  for (const b of bytes) s += b.toString(16).padStart(2, '0')
  return s
}

/* ---- encode bytes -> base64 / base64url ---- */
export function base64Encode(bytes, { urlSafe = false, pad = !urlSafe } = {}) {
  if (!(bytes instanceof Uint8Array)) bytes = Uint8Array.from(bytes)
  const alpha = urlSafe ? URL : STD
  let out = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0
    const n = (b0 << 16) | (b1 << 8) | b2
    out += alpha[(n >> 18) & 63] + alpha[(n >> 12) & 63]
    out += i + 1 < bytes.length ? alpha[(n >> 6) & 63] : (pad ? '=' : '')
    out += i + 2 < bytes.length ? alpha[n & 63] : (pad ? '=' : '')
  }
  return out
}

/* ---- decode base64 / base64url -> bytes (alphabet & padding tolerant) ---- */
export function base64Decode(str) {
  let s = String(str || '').trim().replace(/[\r\n\s]/g, '')
  s = s.replace(/=+$/, '') // drop any padding
  if (s === '') return new Uint8Array(0)

  const out = []
  let buffer = 0
  let bits = 0
  for (const ch of s) {
    const v = DECODE_MAP[ch]
    if (v === undefined) throw new Error(`invalid Base64 character "${ch}"`)
    buffer = (buffer << 6) | v
    bits += 6
    if (bits >= 8) {
      bits -= 8
      out.push((buffer >> bits) & 0xff)
    }
  }
  return Uint8Array.from(out)
}

/* ============================ high-level convert ============================ */
export function hexToBase64(hex, mode = 'base64') {
  return base64Encode(hexToBytes(hex), { urlSafe: mode === 'base64url' })
}
export function base64ToHex(str /*, mode */) {
  // decode is alphabet/padding tolerant, so mode isn't needed for decoding
  return bytesToHex(base64Decode(str))
}

export const toHex = bytesToHex
