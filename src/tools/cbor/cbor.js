/* ============================================================================
 *  cbor.js - a self-contained CBOR (RFC 8949) decoder for the tool hub.
 *
 *  Cardano serializes everything - transaction bodies, witness sets, metadata,
 *  Plutus data - as CBOR. CBOR is a binary format where every item starts with
 *  one "initial byte" split into:
 *
 *      high 3 bits = MAJOR TYPE (0..7)
 *      low  5 bits = ADDITIONAL INFO (the "argument", or how to read it)
 *
 *  Major types:
 *      0  unsigned int          argument = the value
 *      1  negative int          value = -1 - argument
 *      2  byte string           argument = length, then that many bytes
 *      3  text string (UTF-8)   argument = length, then that many bytes
 *      4  array                 argument = item count
 *      5  map                   argument = pair count (key,value each)
 *      6  tag                   argument = tag number, then 1 tagged item
 *      7  simple/float          22=null 21=true 20=false; 25/26/27 = float16/32/64
 *
 *  The 5-bit additional info encodes the argument:
 *      0..23   -> the argument IS that value (no extra bytes)
 *      24      -> argument in next 1 byte
 *      25      -> next 2 bytes (uint16, big-endian)
 *      26      -> next 4 bytes (uint32)
 *      27      -> next 8 bytes (uint64)
 *      31      -> "indefinite length" (items until a 0xFF break)
 *
 *  This decoder returns a tree of nodes plus a per-node "header explanation" so
 *  the UI can show exactly how each byte was read.
 * ========================================================================== */

const MAJOR_NAMES = ['uint', 'negint', 'bytes', 'text', 'array', 'map', 'tag', 'simple/float']

export function normHex(s) {
  const h = String(s).trim().replace(/^0x/i, '').replace(/[\s,:_-]/g, '')
  if (h === '') return ''
  if (!/^[0-9a-fA-F]*$/.test(h)) throw new Error('input contains non-hex characters')
  if (h.length % 2 !== 0) throw new Error('hex must have an even number of digits')
  return h.toLowerCase()
}
function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16)
  return out
}
function toHex(bytes) {
  let s = ''
  for (const b of bytes) s += b.toString(16).padStart(2, '0')
  return s
}
function asciiOf(bytes) {
  let s = ''
  for (const c of bytes) { if (c < 0x20 || c > 0x7e) return null; s += String.fromCharCode(c) }
  return s
}

class Reader {
  constructor(bytes) { this.b = bytes; this.p = 0 }
  get done() { return this.p >= this.b.length }
  u8() { if (this.p >= this.b.length) throw new Error('unexpected end of CBOR data'); return this.b[this.p++] }
  take(n) { if (this.p + n > this.b.length) throw new Error(`needed ${n} more byte(s) but input ended`); const v = this.b.subarray(this.p, this.p + n); this.p += n; return v }
  bigBE(n) { let x = 0n; const v = this.take(n); for (const byte of v) x = (x << 8n) | BigInt(byte); return x }
}

/* read the argument for a given additional-info value; returns { arg, indefinite, headerExtra } */
function readArgument(r, ai) {
  if (ai < 24) return { arg: BigInt(ai), indefinite: false, extraBytes: 0 }
  if (ai === 24) { const v = r.u8(); return { arg: BigInt(v), indefinite: false, extraBytes: 1 } }
  if (ai === 25) { return { arg: r.bigBE(2), indefinite: false, extraBytes: 2 } }
  if (ai === 26) { return { arg: r.bigBE(4), indefinite: false, extraBytes: 4 } }
  if (ai === 27) { return { arg: r.bigBE(8), indefinite: false, extraBytes: 8 } }
  if (ai === 31) return { arg: null, indefinite: true, extraBytes: 0 }
  throw new Error(`reserved/invalid additional info ${ai}`)
}

function f16(bytes) {
  // IEEE 754 half-precision
  const h = (bytes[0] << 8) | bytes[1]
  const sign = (h & 0x8000) ? -1 : 1
  const exp = (h >> 10) & 0x1f
  const frac = h & 0x3ff
  if (exp === 0) return sign * Math.pow(2, -14) * (frac / 1024)
  if (exp === 31) return frac ? NaN : sign * Infinity
  return sign * Math.pow(2, exp - 15) * (1 + frac / 1024)
}

let nodeId = 0

function decodeItem(r) {
  const startP = r.p
  const ib = r.u8()
  const major = ib >> 5
  const ai = ib & 0x1f
  const id = nodeId++

  const headerHex = ib.toString(16).padStart(2, '0')
  const node = { id, major, majorName: MAJOR_NAMES[major], ai, headerHex }

  // simple / float (major 7) has its own argument meaning
  if (major === 7) {
    if (ai === 20) return finish({ ...node, type: 'simple', value: false, render: 'false' })
    if (ai === 21) return finish({ ...node, type: 'simple', value: true, render: 'true' })
    if (ai === 22) return finish({ ...node, type: 'simple', value: null, render: 'null' })
    if (ai === 23) return finish({ ...node, type: 'simple', value: undefined, render: 'undefined' })
    if (ai === 25) { const fv = f16(r.take(2)); return finish({ ...node, type: 'float', value: fv, render: String(fv), bits: 16 }) }
    if (ai === 26) { const dv = new DataView(r.take(4).slice().buffer).getFloat32(0, false); return finish({ ...node, type: 'float', value: dv, render: String(dv), bits: 32 }) }
    if (ai === 27) { const dv = new DataView(r.take(8).slice().buffer).getFloat64(0, false); return finish({ ...node, type: 'float', value: dv, render: String(dv), bits: 64 }) }
    if (ai === 24) { const sv = r.u8(); return finish({ ...node, type: 'simple', value: sv, render: 'simple(' + sv + ')' }) }
    if (ai === 31) return finish({ ...node, type: 'break', render: 'break (0xff)' })
    return finish({ ...node, type: 'simple', value: ai, render: 'simple(' + ai + ')' })
  }

  const { arg, indefinite, extraBytes } = readArgument(r, ai)
  node.arg = arg
  node.indefinite = indefinite
  node.argBytes = extraBytes

  switch (major) {
    case 0: // unsigned
      return finish({ ...node, type: 'uint', value: arg, render: arg.toString() })
    case 1: // negative: -1 - arg
      return finish({ ...node, type: 'negint', value: -1n - arg, render: (-1n - arg).toString() })
    case 2: { // byte string
      if (indefinite) { const chunks = readChunks(r, 2); const all = concat(chunks); return finish({ ...node, type: 'bytes', value: all, render: '0x' + toHex(all), bytes: all.length, indefiniteChunks: chunks.length }) }
      const v = r.take(Number(arg)); const copy = v.slice()
      return finish({ ...node, type: 'bytes', value: copy, render: '0x' + toHex(copy), bytes: copy.length })
    }
    case 3: { // text string
      if (indefinite) { const chunks = readChunks(r, 3); const all = concat(chunks); const t = new TextDecoder().decode(all); return finish({ ...node, type: 'text', value: t, render: JSON.stringify(t), bytes: all.length, indefiniteChunks: chunks.length }) }
      const v = r.take(Number(arg)); const t = new TextDecoder().decode(v)
      return finish({ ...node, type: 'text', value: t, render: JSON.stringify(t), bytes: v.length })
    }
    case 4: { // array
      const items = []
      if (indefinite) { while (true) { if (r.done) throw new Error('indefinite array missing break'); if (r.b[r.p] === 0xff) { r.p++; break } items.push(decodeItem(r)) } }
      else { for (let i = 0n; i < arg; i++) items.push(decodeItem(r)) }
      return finish({ ...node, type: 'array', items, count: items.length })
    }
    case 5: { // map
      const pairs = []
      if (indefinite) { while (true) { if (r.done) throw new Error('indefinite map missing break'); if (r.b[r.p] === 0xff) { r.p++; break } const k = decodeItem(r); const val = decodeItem(r); pairs.push([k, val]) } }
      else { for (let i = 0n; i < arg; i++) { const k = decodeItem(r); const val = decodeItem(r); pairs.push([k, val]) } }
      return finish({ ...node, type: 'map', pairs, count: pairs.length })
    }
    case 6: { // tag
      const inner = decodeItem(r)
      return finish({ ...node, type: 'tag', tag: arg, item: inner, render: 'tag ' + arg })
    }
    default:
      throw new Error('unhandled major type ' + major)
  }

  function finish(n) { n.byteLen = r.p - startP; return n }
}

function readChunks(r, expectMajor) {
  const chunks = []
  while (true) {
    if (r.done) throw new Error('indefinite string missing break')
    if (r.b[r.p] === 0xff) { r.p++; break }
    const ib = r.u8(); const major = ib >> 5; const ai = ib & 0x1f
    if (major !== expectMajor) throw new Error('indefinite string chunk has wrong major type')
    const { arg } = readArgument(r, ai)
    chunks.push(r.take(Number(arg)).slice())
  }
  return chunks
}
function concat(arrs) {
  const len = arrs.reduce((a, x) => a + x.length, 0)
  const out = new Uint8Array(len); let o = 0
  for (const a of arrs) { out.set(a, o); o += a.length }
  return out
}

export function decodeCbor(input) {
  const hex = normHex(input)
  if (hex === '') throw new Error('enter CBOR hex')
  nodeId = 0
  const r = new Reader(hexToBytes(hex))
  const root = decodeItem(r)
  const trailing = r.b.length - r.p
  return { root, totalBytes: r.b.length, consumed: r.p, trailing }
}

/* additional-info -> how the argument was read (for the header explainer) */
export function aiExplain(ai) {
  if (ai < 24) return `value ${ai} is in the low 5 bits (no extra bytes)`
  if (ai === 24) return 'argument is the next 1 byte (uint8)'
  if (ai === 25) return 'argument is the next 2 bytes (uint16, big-endian)'
  if (ai === 26) return 'argument is the next 4 bytes (uint32, big-endian)'
  if (ai === 27) return 'argument is the next 8 bytes (uint64, big-endian)'
  if (ai === 31) return 'indefinite length - items follow until a 0xFF break'
  return `reserved additional info ${ai}`
}

export { toHex, asciiOf, MAJOR_NAMES }
