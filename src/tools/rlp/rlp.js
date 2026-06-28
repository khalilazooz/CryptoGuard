/* ============================================================================
 *  RLP (Recursive Length Prefix) — Ethereum's serialization, encode + decode.
 * ----------------------------------------------------------------------------
 *  RLP encodes two kinds of item: a BYTE STRING and a LIST (of items, possibly
 *  nested). Numbers/addresses/etc. are first turned into big-endian byte
 *  strings, then RLP-encoded. The rules (Ethereum Yellow Paper, Appendix B):
 *
 *    • a single byte 0x00–0x7f          -> itself (no prefix)
 *    • string 0–55 bytes                -> 0x80+len, then the bytes        (0x80–0xb7)
 *    • string > 55 bytes                -> 0xb7+lenOfLen, BE len, bytes    (0xb8–0xbf)
 *    • list, payload 0–55 bytes         -> 0xc0+len, then items            (0xc0–0xf7)
 *    • list, payload > 55 bytes         -> 0xf7+lenOfLen, BE len, items    (0xf8–0xff)
 *
 *  This module works on a tree:  string = { str: hex }  ·  list = [ ...items ].
 *  No dependencies.
 * ========================================================================== */

export function normHex(s) {
  if (s == null) return ''
  const h = String(s).replace(/0x/gi, '').replace(/[\s,:_-]/g, '')
  if (h && !/^[0-9a-fA-F]+$/.test(h)) throw new Error('not a hex string')
  if (h.length % 2 !== 0) throw new Error('hex has an odd number of nibbles')
  return h.toLowerCase()
}
const hexToBytes = (h) => { const b = new Uint8Array(h.length / 2); for (let i = 0; i < b.length; i++) b[i] = parseInt(h.substr(i * 2, 2), 16); return b }
const toHex = (b) => Array.from(b).map((x) => x.toString(16).padStart(2, '0')).join('')
const concat = (...arrs) => { const n = arrs.reduce((a, x) => a + x.length, 0); const o = new Uint8Array(n); let p = 0; for (const a of arrs) { o.set(a, p); p += a.length } return o }

/* big-endian minimal-length encoding of a non-negative integer length */
function encodeLength(len, offset) {
  if (len < 56) return new Uint8Array([offset + len])
  // long form: lenOfLen bytes of big-endian length
  let lenHex = len.toString(16)
  if (lenHex.length % 2) lenHex = '0' + lenHex
  const lenBytes = hexToBytes(lenHex)
  return concat(new Uint8Array([offset + 55 + lenBytes.length]), lenBytes)
}

/* ---------------------------- ENCODE ---------------------------- */
/* item: { str: <hex> }  (a byte string)  OR  an array of items (a list). */
export function rlpEncode(item) {
  if (Array.isArray(item)) {
    const payload = concat(...item.map(rlpEncode))
    return concat(encodeLength(payload.length, 0xc0), payload)
  }
  // byte string
  const hex = normHex(item.str ?? item)
  const bytes = hexToBytes(hex)
  // single byte < 0x80 is its own encoding
  if (bytes.length === 1 && bytes[0] < 0x80) return bytes
  return concat(encodeLength(bytes.length, 0x80), bytes)
}
export function rlpEncodeHex(item) { return toHex(rlpEncode(item)) }

/* ---------------------------- DECODE ---------------------------- */
/* returns { tree, consumed } where tree mirrors the encode shape, but decoded
 * nodes also carry metadata for the UI: { type:'str', hex, bytes, prefix } and
 * { type:'list', items, bytes, prefix }. */
export function rlpDecode(hexIn) {
  const bytes = hexToBytes(normHex(hexIn))
  const { node, end } = decodeItem(bytes, 0)
  if (end !== bytes.length) throw new Error(`trailing bytes after the RLP item (decoded ${end} of ${bytes.length})`)
  return node
}
function decodeItem(b, p) {
  if (p >= b.length) throw new Error('unexpected end of input')
  const first = b[p]
  if (first <= 0x7f) {
    return { node: { type: 'str', hex: toHex(b.subarray(p, p + 1)), bytes: 1, prefix: '' }, end: p + 1 }
  }
  if (first <= 0xb7) {
    const len = first - 0x80
    const start = p + 1, end = start + len
    if (end > b.length) throw new Error('string overruns input')
    return { node: { type: 'str', hex: toHex(b.subarray(start, end)), bytes: len, prefix: toHex(b.subarray(p, p + 1)) }, end }
  }
  if (first <= 0xbf) {
    const lenOfLen = first - 0xb7
    const lenStart = p + 1, dataStart = lenStart + lenOfLen
    if (dataStart > b.length) throw new Error('string length-prefix overruns input')
    const len = numFrom(b.subarray(lenStart, dataStart))
    const end = dataStart + len
    if (end > b.length) throw new Error('long string overruns input')
    return { node: { type: 'str', hex: toHex(b.subarray(dataStart, end)), bytes: len, prefix: toHex(b.subarray(p, dataStart)) }, end }
  }
  // list
  let listLen, headerEnd
  if (first <= 0xf7) { listLen = first - 0xc0; headerEnd = p + 1 }
  else {
    const lenOfLen = first - 0xf7
    const lenStart = p + 1, dataStart = lenStart + lenOfLen
    if (dataStart > b.length) throw new Error('list length-prefix overruns input')
    listLen = numFrom(b.subarray(lenStart, dataStart))
    headerEnd = dataStart
  }
  const listEnd = headerEnd + listLen
  if (listEnd > b.length) throw new Error('list overruns input')
  const items = []
  let q = headerEnd
  while (q < listEnd) { const r = decodeItem(b, q); items.push(r.node); q = r.end }
  if (q !== listEnd) throw new Error('list items do not align with the declared list length')
  return { node: { type: 'list', items, bytes: listLen, prefix: toHex(b.subarray(p, headerEnd)) }, end: listEnd }
}
function numFrom(bytes) { let n = 0; for (const x of bytes) n = n * 256 + x; return n }

/* ---------------------------- pretty helpers ---------------------------- */
/* render a decoded tree as an indented, human-readable outline */
export function treeToText(node, indent = 0) {
  const pad = '  '.repeat(indent)
  if (node.type === 'str') {
    const ascii = asciiPreview(node.hex)
    return `${pad}str(${node.bytes}B): 0x${node.hex || ''}${ascii ? `   "${ascii}"` : ''}`
  }
  const head = `${pad}list(${node.items.length} item${node.items.length === 1 ? '' : 's'}, ${node.bytes}B payload):`
  return [head, ...node.items.map((c) => treeToText(c, indent + 1))].join('\n')
}
function asciiPreview(hex) {
  if (!hex) return ''
  let s = ''
  for (let i = 0; i < hex.length; i += 2) { const c = parseInt(hex.slice(i, i + 2), 16); s += (c >= 0x20 && c <= 0x7e) ? String.fromCharCode(c) : '' }
  // only show if it's mostly printable and reasonably long
  return (s.length >= 2 && s.length >= hex.length / 2 - 1) ? s : ''
}

/* ---------------------------- input parsing for the UI ----------------------------
 * The encoder takes a JSON-ish description. We accept a friendly syntax:
 *   - a hex string "0x..."  -> a byte string
 *   - a quoted string "abc" -> its UTF-8 bytes as a byte string
 *   - a decimal number 123  -> its minimal big-endian bytes
 *   - a JSON array [ ... ]   -> a list (recursive)
 * parseEncodeInput(text) -> the item tree for rlpEncode.
 */
export function parseEncodeInput(text) {
  const t = String(text || '').trim()
  if (!t) throw new Error('nothing to encode')
  let json
  try { json = JSON.parse(t) } catch { /* not JSON — treat as a single scalar */ json = t }
  return toItem(json)
}
function toItem(v) {
  if (Array.isArray(v)) return v.map(toItem)
  if (typeof v === 'number') {
    if (!Number.isInteger(v) || v < 0) throw new Error(`unsupported number ${v} (use a non-negative integer or a hex string)`)
    let h = v.toString(16); if (h === '0') h = ''; if (h.length % 2) h = '0' + h
    return { str: h }
  }
  if (typeof v === 'boolean') return { str: v ? '01' : '' }
  if (v == null) return { str: '' }
  const s = String(v).trim()
  if (/^0x[0-9a-fA-F]*$/.test(s) || /^[0-9a-fA-F]+$/.test(s.replace(/^0x/, '')) && /^0x/.test(s)) return { str: normHex(s) }
  if (/^0x$/i.test(s)) return { str: '' }
  // bare hex (even length, hex chars) -> treat as hex; else UTF-8 text
  if (/^[0-9a-fA-F]+$/.test(s) && s.length % 2 === 0) return { str: s.toLowerCase() }
  return { str: toHex(new TextEncoder().encode(s)) }
}
