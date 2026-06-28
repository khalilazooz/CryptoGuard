/* ============================================================================
 *  compactu16.js — Solana "compact-u16" / ShortVec length encoding.
 *
 *  Solana serializes every array length (number of signatures, accounts,
 *  instructions, instruction accounts, instruction data bytes, address-table
 *  lookups, …) as a compact-u16: a base-128 varint, LSB group first, with the
 *  high bit (0x80) of each byte as a continuation flag — BUT bounded to a
 *  16-bit value, so it is at most 3 bytes:
 *
 *      0      .. 127    -> 1 byte
 *      128    .. 16383  -> 2 bytes
 *      16384  .. 65535  -> 3 bytes   (the 3rd byte carries only 2 payload bits)
 *
 *  It is the SAME wire shape as a Protobuf varint for values 0..65535, but:
 *    - the value is capped at u16 (0xFFFF); larger is invalid
 *    - the encoding MUST be minimal/canonical (no trailing 0x80 padding)
 *    - it is always unsigned (it's a length)
 *
 *  Ref: solana_sdk short_vec / serialize_utils encode_length.
 * ========================================================================== */

const U16_MAX = 0xffff

function cleanHex(s) {
  const h = String(s).trim().replace(/^0x/i, '').replace(/[\s,:_-]/g, '')
  if (h === '') return ''
  if (!/^[0-9a-fA-F]*$/.test(h)) throw new Error('input contains non-hex characters')
  if (h.length % 2 !== 0) throw new Error('hex must have an even number of digits')
  return h.toLowerCase()
}
function hexToBytes(hex) {
  const out = []
  for (let i = 0; i < hex.length; i += 2) out.push(parseInt(hex.slice(i, i + 2), 16))
  return out
}
function byte(n) { return n.toString(16).padStart(2, '0') }

function parseValue(s) {
  const t = String(s).trim().replace(/[_\s,]/g, '')
  if (t === '') throw new Error('enter a value')
  if (/^0x[0-9a-fA-F]+$/.test(t)) return Number(BigInt(t))
  if (/^\d+$/.test(t)) return Number(t)
  if (/^-/.test(t)) throw new Error('compact-u16 is a length — value must be >= 0')
  throw new Error('value must be a non-negative decimal or 0x-hex integer')
}

/* ------------------------------- encode --------------------------------- */
export function encode(input) {
  const v = parseValue(input)
  if (v < 0) throw new Error('compact-u16 is unsigned — value must be >= 0')
  if (v > U16_MAX) throw new Error(`value ${v} exceeds the u16 max (65535) — not a valid compact-u16`)

  // solana_sdk encode_length: emit 7 bits at a time, set 0x80 while more remain
  const bytes = []
  let rem = v
  for (;;) {
    let elem = rem & 0x7f
    rem >>= 7
    if (rem === 0) { bytes.push(elem); break }
    elem |= 0x80
    bytes.push(elem)
  }

  const hex = bytes.map(byte).join('')
  const groups = bytes.map((bb, i) => ({
    hex: byte(bb),
    cont: (bb & 0x80) !== 0,
    payload: (bb & 0x7f).toString(2).padStart(7, '0'),
    last: i === bytes.length - 1,
  }))

  return {
    value: v,
    hex,
    bytes: bytes.length,
    groups,
    note: bytes.length === 1
      ? `value < 128, so it fits in a single byte (no continuation).`
      : `${bytes.length} bytes: 7 payload bits each, LSB group first; high bit chains until the last byte.`,
  }
}

/* ------------------------------- decode --------------------------------- */
export function decode(input) {
  const hex = cleanHex(input)
  if (hex === '') throw new Error('enter hex bytes')
  const b = hexToBytes(hex)

  let v = 0, shift = 0, consumed = 0
  const groups = []
  for (let i = 0; i < b.length; i++) {
    const bb = b[i]
    // a compact-u16 is at most 3 bytes; the 3rd byte may only carry 2 bits
    if (consumed === 2 && (bb & 0x7f) > 0x03) {
      throw new Error(`3rd byte 0x${byte(bb)} carries more than 2 payload bits — value would exceed u16`)
    }
    if (consumed >= 3) throw new Error('compact-u16 is at most 3 bytes')
    v |= (bb & 0x7f) << shift
    groups.push({ hex: byte(bb), cont: (bb & 0x80) !== 0, payload: (bb & 0x7f).toString(2).padStart(7, '0'), last: (bb & 0x80) === 0 })
    consumed++
    if ((bb & 0x80) === 0) break
    shift += 7
  }
  if (consumed === 0 || (b[consumed - 1] & 0x80) !== 0) {
    throw new Error('truncated: last byte still has the continuation bit set')
  }
  v >>>= 0
  if (v > U16_MAX) throw new Error(`decoded value ${v} exceeds u16 max — invalid compact-u16`)

  // canonical check: Solana rejects non-minimal encodings (e.g. 0x8000 for 0)
  const canonical = encode(String(v))
  const nonCanonical = canonical.hex !== hex.slice(0, consumed * 2)

  return {
    value: v,
    consumed,
    extra: b.length - consumed,
    groups,
    nonCanonical,
    canonicalHex: canonical.hex,
    note: nonCanonical
      ? `non-canonical: value ${v} should encode as ${canonical.hex} (${canonical.bytes} byte${canonical.bytes === 1 ? '' : 's'}). Solana rejects non-minimal compact-u16.`
      : `${consumed} byte${consumed === 1 ? '' : 's'} -> length ${v}.`,
  }
}

/* The boundary table the UI shows so the 3 size tiers are obvious. */
export const TIERS = [
  { range: '0 … 127', bytes: 1, example: 5, hex: '05' },
  { range: '128 … 16383', bytes: 2, example: 300, hex: 'ac02' },
  { range: '16384 … 65535', bytes: 3, example: 65535, hex: 'ffff03' },
]
