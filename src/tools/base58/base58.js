/* ============================================================================
 *  Base58 / Base58Check codec  (Hex <-> Base58)
 * ----------------------------------------------------------------------------
 *  Base58 uses the Bitcoin alphabet. Base58Check appends a 4-byte checksum =
 *  first 4 bytes of double-SHA256(payload), then Base58-encodes payload‖checksum
 *  — matching libbtc / trezor-crypto base58 (TWI_DOUBLE_SHA256).
 * ========================================================================== */
import { sha256 } from '@noble/hashes/sha256'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const BASE = 58n
const ALPHA_MAP = (() => {
  const m = {}
  for (let i = 0; i < ALPHABET.length; i++) m[ALPHABET[i]] = i
  return m
})()

export const toHex = bytesToHex

export function normHex(s) {
  if (s == null) return ''
  const h = String(s).replace(/0x/gi, '').replace(/[\s,:_-]/g, '')
  if (h && !/^[0-9a-fA-F]+$/.test(h)) throw new Error('not a hex string')
  if (h.length % 2 !== 0) throw new Error('hex has an odd number of nibbles')
  return h.toLowerCase()
}

/* ---- raw Base58 ---- */
export function base58Encode(bytes) {
  if (!(bytes instanceof Uint8Array)) bytes = Uint8Array.from(bytes)
  // count leading zero bytes -> leading '1's
  let zeros = 0
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++

  // base-256 -> base-58 via big integer
  let num = 0n
  for (const b of bytes) num = num * 256n + BigInt(b)
  let out = ''
  while (num > 0n) {
    const rem = Number(num % BASE)
    num = num / BASE
    out = ALPHABET[rem] + out
  }
  return '1'.repeat(zeros) + out
}

export function base58Decode(str) {
  str = String(str || '').trim()
  if (str === '') return new Uint8Array(0)
  let zeros = 0
  while (zeros < str.length && str[zeros] === '1') zeros++

  let num = 0n
  for (const ch of str) {
    const v = ALPHA_MAP[ch]
    if (v === undefined) throw new Error(`invalid Base58 character "${ch}"`)
    num = num * BASE + BigInt(v)
  }
  // big int -> bytes
  const bytes = []
  while (num > 0n) {
    bytes.unshift(Number(num % 256n))
    num = num / 256n
  }
  return Uint8Array.from([...new Array(zeros).fill(0), ...bytes])
}

/* ---- Base58Check ---- */
function checksum(payload) {
  return sha256(sha256(payload)).slice(0, 4)
}
export function base58checkEncode(bytes) {
  if (!(bytes instanceof Uint8Array)) bytes = Uint8Array.from(bytes)
  const full = new Uint8Array(bytes.length + 4)
  full.set(bytes)
  full.set(checksum(bytes), bytes.length)
  return base58Encode(full)
}
export function base58checkDecode(str) {
  const full = base58Decode(str)
  if (full.length < 4) throw new Error('Base58Check string is too short to contain a checksum')
  const payload = full.slice(0, full.length - 4)
  const got = full.slice(full.length - 4)
  const want = checksum(payload)
  for (let i = 0; i < 4; i++) {
    if (got[i] !== want[i]) {
      throw new Error(`bad Base58Check checksum (have ${toHex(got)}, expected ${toHex(want)})`)
    }
  }
  return payload
}

/* ============================ high-level convert ============================
 * convert(input, { from, to, mode })
 *   from/to : 'hex' | 'base58'
 *   mode    : 'base58' | 'base58check'   (only matters when base58 is involved)
 * Returns the converted string, or throws with a clear message.
 */
export function hexToBase58(hex, mode = 'base58') {
  const bytes = hexToBytes(normHex(hex))
  return mode === 'base58check' ? base58checkEncode(bytes) : base58Encode(bytes)
}
export function base58ToHex(str, mode = 'base58') {
  const bytes = mode === 'base58check' ? base58checkDecode(str) : base58Decode(str)
  return toHex(bytes)
}
