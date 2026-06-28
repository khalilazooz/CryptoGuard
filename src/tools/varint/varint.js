/* ============================================================================
 *  varint.js — variable-length integer codecs for two very different schemes:
 *
 *    1. Bitcoin "CompactSize" (aka VarInt / var_int) — a length prefix used in
 *       the P2P / serialization format (number of inputs, script length, …).
 *       It is NOT base-128; it is a 1/3/5/9-byte little-endian tagged scheme.
 *
 *    2. Protobuf "varint" — the base-128, LSB-first, continuation-bit scheme
 *       (wire type 0) used for int32 / int64 / uint / bool / enum, and (with
 *       ZigZag) for sint32 / sint64.
 *
 *  All values are handled as BigInt internally so 64-bit quantities are exact.
 * ========================================================================== */

/* ----------------------------- helpers ----------------------------------- */

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
  let v
  if (/^-?0x[0-9a-fA-F]+$/.test(t)) v = BigInt(t)
  else if (/^-?\d+$/.test(t)) v = BigInt(t)
  else throw new Error('value must be a decimal or 0x-hex integer')
  return v
}

const U64_MAX = (1n << 64n) - 1n

/* ============================================================================
 *  BITCOIN CompactSize
 * ----------------------------------------------------------------------------
 *  Encoding (little-endian payloads):
 *    value  < 0xFD ............. 1 byte  : the value itself
 *    value <= 0xFFFF .......... 3 bytes  : 0xFD, then uint16 LE
 *    value <= 0xFFFFFFFF ...... 5 bytes  : 0xFE, then uint32 LE
 *    value <= 0xFFFFFFFFFFFFFFFF 9 bytes : 0xFF, then uint64 LE
 * ========================================================================== */

export function bitcoinEncode(input) {
  const v = parseValue(input)
  if (v < 0n) throw new Error('CompactSize is unsigned — value must be ≥ 0')
  if (v > U64_MAX) throw new Error('value exceeds 64-bit unsigned range')

  let prefix = null
  let widthBytes
  if (v < 0xfdn) { widthBytes = 1 }
  else if (v <= 0xffffn) { prefix = 0xfd; widthBytes = 2 }
  else if (v <= 0xffffffffn) { prefix = 0xfe; widthBytes = 4 }
  else { prefix = 0xff; widthBytes = 8 }

  // little-endian payload
  const le = []
  let tmp = v
  for (let i = 0; i < widthBytes; i++) { le.push(Number(tmp & 0xffn)); tmp >>= 8n }

  const bytes = prefix === null ? [Number(v)] : [prefix, ...le]
  const hex = bytes.map(byte).join('')

  return {
    value: v,
    hex,
    bytes: bytes.length,
    prefix: prefix === null ? null : byte(prefix),
    note: prefix === null
      ? `value < 0xFD, so it is stored as a single literal byte 0x${hex}.`
      : `tag 0x${byte(prefix)} marks a ${widthBytes}-byte little-endian uint${widthBytes * 8} payload (${le.map(byte).join(' ')}).`,
  }
}

export function bitcoinDecode(input) {
  const hex = cleanHex(input)
  if (hex === '') throw new Error('enter hex bytes')
  const b = hexToBytes(hex)
  const first = b[0]

  if (first < 0xfd) {
    return {
      value: BigInt(first),
      consumed: 1,
      prefix: null,
      width: 1,
      extra: b.length - 1,
      nonCanonical: false,
      note: `0x${byte(first)} < 0xFD, so the byte is the value itself (${first}).`,
    }
  }

  let widthBytes, prefix
  if (first === 0xfd) { widthBytes = 2; prefix = 0xfd }
  else if (first === 0xfe) { widthBytes = 4; prefix = 0xfe }
  else { widthBytes = 8; prefix = 0xff }

  const need = 1 + widthBytes
  if (b.length < need) throw new Error(`tag 0x${byte(first)} needs ${widthBytes} more byte(s); only ${b.length - 1} present`)

  let v = 0n
  for (let i = widthBytes - 1; i >= 0; i--) v = (v << 8n) | BigInt(b[1 + i]) // LE → BigInt
  const consumed = need

  // canonical-encoding check: Bitcoin requires the shortest form
  const canonical = bitcoinEncode('0x' + v.toString(16)).bytes
  const nonCanonical = canonical !== consumed

  return {
    value: v,
    consumed,
    prefix: byte(prefix),
    width: widthBytes,
    extra: b.length - consumed,
    nonCanonical,
    note: nonCanonical
      ? `⚠ non-canonical: value ${v} fits in ${canonical} byte(s) but was encoded in ${consumed}. Bitcoin consensus rejects non-minimal CompactSize.`
      : `tag 0x${byte(prefix)} → ${widthBytes}-byte LE uint = ${v}.`,
  }
}

/* ============================================================================
 *  PROTOBUF base-128 varint (wire type 0)
 * ----------------------------------------------------------------------------
 *  Each byte carries 7 bits of payload, LSB group first. The high bit (0x80)
 *  is a continuation flag: 1 = more bytes follow, 0 = last byte.
 *
 *  Signed handling:
 *    int32/int64  — two's complement, ALWAYS encoded as the full 10-byte 64-bit
 *                   form when negative (so -1 → ff ff ff ff ff ff ff ff ff 01).
 *    sint32/sint64 — ZigZag: (n << 1) ^ (n >> 63) maps small negatives to small
 *                   positives, then plain varint. Far more compact for negatives.
 * ========================================================================== */

function zigzagEncode(v) { return (v << 1n) ^ (v >> 63n) } // arithmetic shift on BigInt
function zigzagDecode(u) { return (u >> 1n) ^ -(u & 1n) }

function rawVarintEncode(u) {
  // u is a non-negative BigInt already reduced to its unsigned bit pattern
  const out = []
  let x = u
  do {
    let group = x & 0x7fn
    x >>= 7n
    if (x > 0n) group |= 0x80n
    out.push(Number(group))
  } while (x > 0n)
  return out
}

export function protobufEncode(input, type) {
  const v = parseValue(input)

  let u // unsigned BigInt to feed the raw encoder
  if (type === 'sint32' || type === 'sint64') {
    u = zigzagEncode(v) & U64_MAX
  } else if (type === 'int32' || type === 'int64' || type === 'enum') {
    // two's complement into 64 bits (negatives become large → 10 bytes)
    u = v & U64_MAX
  } else { // uint32 / uint64 / bool
    if (v < 0n) throw new Error(`${type} is unsigned — value must be ≥ 0`)
    u = v & U64_MAX
  }

  const bytes = rawVarintEncode(u)
  const hex = bytes.map(byte).join('')
  const groups = bytes.map((bb, i) => ({
    hex: byte(bb),
    cont: (bb & 0x80) !== 0,
    payload: (bb & 0x7f).toString(2).padStart(7, '0'),
    last: i === bytes.length - 1,
  }))

  return {
    value: v,
    encodedUnsigned: u,
    hex,
    bytes: bytes.length,
    groups,
    zigzag: (type === 'sint32' || type === 'sint64') ? (zigzagEncode(v) & U64_MAX) : null,
  }
}

export function protobufDecode(input, type) {
  const hex = cleanHex(input)
  if (hex === '') throw new Error('enter hex bytes')
  const b = hexToBytes(hex)

  let u = 0n, shift = 0n, consumed = 0
  const groups = []
  for (let i = 0; i < b.length; i++) {
    const bb = b[i]
    u |= BigInt(bb & 0x7f) << shift
    groups.push({ hex: byte(bb), cont: (bb & 0x80) !== 0, payload: (bb & 0x7f).toString(2).padStart(7, '0'), last: (bb & 0x80) === 0 })
    consumed++
    if ((bb & 0x80) === 0) break
    shift += 7n
    if (shift > 63n) throw new Error('varint is longer than 10 bytes (overflows 64 bits)')
  }
  if (consumed === 0 || (b[consumed - 1] & 0x80) !== 0) throw new Error('truncated varint: last byte still has the continuation bit set')

  u &= U64_MAX

  // interpret according to the chosen type
  let signed
  if (type === 'sint32' || type === 'sint64') {
    signed = zigzagDecode(u)
  } else if (type === 'int32' || type === 'int64' || type === 'enum') {
    // two's complement: top bit of the 64-bit value means negative
    signed = u >= (1n << 63n) ? u - (1n << 64n) : u
  } else {
    signed = u // unsigned
  }

  return { unsigned: u, value: signed, consumed, extra: b.length - consumed, groups, type }
}

export const PROTOBUF_TYPES = ['uint64', 'uint32', 'int64', 'int32', 'sint64', 'sint32', 'bool', 'enum']

/* convenience for the UI: one value compared across both schemes */
export function compareSchemes(input) {
  const v = parseValue(input)
  const rows = []
  try {
    if (v >= 0n && v <= U64_MAX) {
      const bc = bitcoinEncode('0x' + v.toString(16))
      rows.push({ scheme: 'Bitcoin CompactSize', hex: bc.hex, bytes: bc.bytes })
    } else {
      rows.push({ scheme: 'Bitcoin CompactSize', hex: '—', bytes: null, err: 'unsigned 0…2⁶⁴−1 only' })
    }
  } catch (e) { rows.push({ scheme: 'Bitcoin CompactSize', hex: '—', bytes: null, err: e.message }) }

  if (v >= 0n && v <= U64_MAX) {
    const pu = protobufEncode('0x' + v.toString(16), 'uint64')
    rows.push({ scheme: 'Protobuf varint (uint64)', hex: pu.hex, bytes: pu.bytes })
  } else {
    rows.push({ scheme: 'Protobuf varint (uint64)', hex: '—', bytes: null, err: 'unsigned only' })
  }

  const pi = protobufEncode(input, 'int64')
  rows.push({ scheme: 'Protobuf varint (int64, two’s-comp)', hex: pi.hex, bytes: pi.bytes })

  const ps = protobufEncode(input, 'sint64')
  rows.push({ scheme: 'Protobuf varint (sint64, ZigZag)', hex: ps.hex, bytes: ps.bytes })

  return { value: v, rows }
}
