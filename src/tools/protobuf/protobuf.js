/* ============================================================================
 *  Protobuf parser engine — decode wire bytes against a user .proto schema.
 * ----------------------------------------------------------------------------
 *  Built on protobufjs (proto2/3, maps, repeated, enums, google.protobuf.Any).
 *  Two layers:
 *    loadProto(text)  -> { root, messages[] }   parse a .proto into a usable root
 *    decode(...)      -> a normalized field tree for the UI, with recursive
 *                        google.protobuf.Any decoding + raw fallback.
 *
 *  Real-world .proto files (e.g. Tron.proto) `import` files we don't have. We
 *  strip the import lines and stub the few external types they reference so the
 *  schema still resolves; anything still unknown is shown as raw bytes.
 * ========================================================================== */
import protobuf from 'protobufjs'

export function normHex(s) {
  if (s == null) return ''
  const h = String(s).replace(/0x/gi, '').replace(/[\s,:_-]/g, '')
  if (h && !/^[0-9a-fA-F]+$/.test(h)) throw new Error('not a hex string')
  if (h.length % 2 !== 0) throw new Error('hex has an odd number of nibbles')
  return h.toLowerCase()
}
const hexToBytes = (h) => { const b = new Uint8Array(h.length / 2); for (let i = 0; i < b.length; i++) b[i] = parseInt(h.substr(i * 2, 2), 16); return b }
const toHex = (b) => Array.from(b).map((x) => x.toString(16).padStart(2, '0')).join('')

/* ---- make an arbitrary .proto loadable: strip imports, stub external types ---- */
function preprocessProto(text) {
  let t = String(text || '')
  // remove import lines (we don't have the imported files)
  t = t.replace(/^\s*import\s+(?:public\s+|weak\s+)?"[^"]*"\s*;/gm, '')
  // rewrite google.protobuf.Any -> a local stub we define below (keeps decoding working)
  const usesAny = /google\.protobuf\.Any/.test(t)
  if (usesAny) t = t.replace(/google\.protobuf\.Any/g, '__GP_Any')
  // collect type names that ARE defined in this file (messages + enums + map — best effort)
  const defined = new Set()
  for (const m of t.matchAll(/^\s*(?:message|enum)\s+([A-Za-z_][\w]*)/gm)) defined.add(m[1])
  // find type tokens used as field types that are NOT defined and not scalars/maps
  const SCALARS = new Set(['double', 'float', 'int32', 'int64', 'uint32', 'uint64', 'sint32', 'sint64', 'fixed32', 'fixed64', 'sfixed32', 'sfixed64', 'bool', 'string', 'bytes'])
  const unknown = new Set()
  // field line:  [repeated|optional|required] Type name = n;
  for (const m of t.matchAll(/^\s*(?:repeated\s+|optional\s+|required\s+)?([A-Za-z_][\w.]*)\s+[A-Za-z_]\w*\s*=\s*\d+/gm)) {
    let ty = m[1]
    if (SCALARS.has(ty) || ty === 'map' || ty === '__GP_Any' || ty === 'oneof' || ty === 'group') continue
    // a dotted type whose first segment is defined here is fine; otherwise unknown
    const head = ty.split('.')[0]
    if (!defined.has(head) && !defined.has(ty)) unknown.add(ty.replace(/\./g, '_'))
    // also rewrite dotted unknowns in the text so they match our stub name
    if (!defined.has(head) && ty.includes('.')) {
      t = t.replace(new RegExp(ty.replace(/\./g, '\\.'), 'g'), ty.replace(/\./g, '_'))
    }
  }
  // build stubs: Any (type_url+value) + one empty message per unknown type. An
  // empty message decodes any sub-bytes as unknown fields (shown raw), which is
  // exactly the graceful behaviour we want.
  let stubs = ''
  if (usesAny) stubs += 'message __GP_Any { string type_url = 1; bytes value = 2; }\n'
  for (const u of unknown) if (u !== '__GP_Any') stubs += `message ${u} {}\n`
  // insert stubs right after the package line (or at top if none)
  if (/^\s*package\s+[\w.]+\s*;/m.test(t)) t = t.replace(/(^\s*package\s+[\w.]+\s*;)/m, `$1\n${stubs}`)
  else t = stubs + t
  return { text: t, anyTypeName: usesAny ? '__GP_Any' : null }
}

/* parse a .proto -> { root, messages:[{fullName,name}], anyTypeName, warnings } */
export function loadProto(protoText) {
  const { text, anyTypeName } = preprocessProto(protoText)
  let root
  try { root = protobuf.parse(text, { keepCase: true }).root } catch (e) { throw new Error('proto parse error: ' + e.message) }
  try { root.resolveAll() } catch (e) { /* leave partially resolved; decode still works for resolvable types */ }
  const messages = []
  ;(function walk(ns) {
    for (const k in (ns.nested || {})) {
      const o = ns.nested[k]
      if (o.fieldsArray) messages.push({ fullName: o.fullName.replace(/^\./, ''), name: o.name })
      walk(o)
    }
  })(root)
  // sort, but keep a stable, useful order
  messages.sort((a, b) => a.fullName.localeCompare(b.fullName))
  return { root, messages, anyTypeName }
}

/* ---- decode bytes against a chosen root message ---- */
/* returns a tree of rows: { name, type, value, kind, children?, raw? } */
export function decodeMessage(root, messageFullName, hexInput, anyTypeName) {
  const Type = root.lookupType(messageFullName)
  const bytes = hexToBytes(normHex(hexInput))
  const msg = Type.decode(bytes)
  return messageToRows(root, Type, msg, anyTypeName)
}

/* Safe decode: try the bytes as-is; if protobufjs throws (e.g. the blob carries
 * a leading length prefix), retry after skipping 1-3 leading bytes. Returns
 * { rows, note } or throws a clean error. */
export function decodeSafe(root, messageFullName, hexInput, anyTypeName) {
  const hex = normHex(hexInput)
  if (!hex) throw new Error('no data to decode')
  const attempts = [{ hex, note: '' }]
  for (const skip of [2, 1, 3]) {
    if (hex.length > skip * 2) attempts.push({ hex: hex.slice(skip * 2), note: ' (skipped ' + skip + ' leading byte' + (skip > 1 ? 's' : '') + ')' })
  }
  let lastErr
  for (const a of attempts) {
    try { return { rows: decodeMessage(root, messageFullName, a.hex, anyTypeName), note: a.note } }
    catch (e) { lastErr = e }
  }
  throw new Error('could not decode as ' + messageFullName + ': ' + (lastErr && lastErr.message ? lastErr.message : 'invalid protobuf'))
}

function messageToRows(root, Type, msg, anyTypeName) {
  const obj = Type.toObject(msg, { longs: String, enums: String, bytes: 'array', defaults: false, arrays: true, objects: true })
  const rows = []
  for (const field of Type.fieldsArray) {
    const name = field.name
    if (!(name in obj)) continue
    let val = obj[name]
    const ftype = field.repeated ? `repeated ${field.type}` : field.type
    if (field.map) {
      rows.push({ name, type: `map<${field.keyType},${field.type}>`, kind: 'map', value: JSON.stringify(mapPreview(val)) })
      continue
    }
    if (field.repeated) {
      const arr = Array.isArray(val) ? val : [val]
      const children = arr.map((v, i) => oneValueRow(root, field, v, `[${i}]`, anyTypeName))
      rows.push({ name, type: ftype, kind: 'repeated', count: arr.length, children })
      continue
    }
    rows.push(oneValueRow(root, field, val, name, anyTypeName))
  }
  return rows
}

function oneValueRow(root, field, val, label, anyTypeName) {
  const t = field.type
  // bytes -> hex (+ recursive guess / ASCII)
  if (t === 'bytes') {
    const hex = Array.isArray(val) ? toHex(Uint8Array.from(val)) : toHex(val)
    const row = { name: label, type: 'bytes', kind: 'bytes', value: '0x' + hex, bytesLen: hex.length / 2 }
    const ascii = asciiPreview(hex)
    if (ascii) row.ascii = ascii
    // try to recursively decode as a nested message (the "Any value"/embedded-msg case)
    const guess = tryDecodeNested(root, hex)
    if (guess) row.children = guess
    return row
  }
  // nested message
  if (field.resolvedType && field.resolvedType.fieldsArray) {
    // google.protobuf.Any stub: decode the value against its type_url
    if (anyTypeName && (field.type === anyTypeName || field.resolvedType.name === anyTypeName)) {
      return anyRow(root, val, label, anyTypeName)
    }
    const sub = root.lookupType(field.resolvedType.fullName)
    const children = messageToRows(root, sub, sub.fromObject(val), anyTypeName)
    return { name: label, type: field.type, kind: 'message', children }
  }
  // enum / scalar
  return { name: label, type: t, kind: field.resolvedType ? 'enum' : 'scalar', value: String(val) }
}

/* google.protobuf.Any: { type_url, value }. Resolve the type from the url's last
 * path segment and decode value against it if we have that message. */
function anyRow(root, val, label, anyTypeName) {
  const typeUrl = val.type_url || val.typeUrl || ''
  const valueHex = Array.isArray(val.value) ? toHex(Uint8Array.from(val.value)) : toHex(val.value || new Uint8Array())
  const row = { name: label, type: 'google.protobuf.Any', kind: 'any', typeUrl, value: '0x' + valueHex, children: [] }
  const typeName = typeUrl.split('/').pop() // e.g. protocol.TransferContract
  let decoded = null
  if (typeName) { try { const T = root.lookupType(typeName); decoded = messageToRows(root, T, T.decode(hexToBytes(valueHex)), anyTypeName) } catch { /* not in schema */ } }
  if (!decoded) decoded = tryDecodeNested(root, valueHex) // generic raw walk
  row.children = decoded || []
  row.resolvedType = decoded && typeName ? typeName : null
  return row
}

/* Generic schema-less walk of length-delimited bytes — used for Any values and
 * unknown `bytes` fields. Returns rows or null if it doesn't look like protobuf. */
function tryDecodeNested(root, hex) {
  const bytes = hexToBytes(hex)
  if (bytes.length < 2) return null
  try {
    const rows = []
    let p = 0
    while (p < bytes.length) {
      const [key, kp] = readVarint(bytes, p); p = kp
      const field = Number(key >> 3n), wire = Number(key & 7n)
      if (field === 0) return null
      if (wire === 0) { const [v, np] = readVarint(bytes, p); p = np; rows.push({ name: `#${field}`, type: 'varint', kind: 'scalar', value: v.toString() }) }
      else if (wire === 2) { const [len, lp] = readVarint(bytes, p); p = lp; const n = Number(len); if (p + n > bytes.length) return null; const sub = bytes.subarray(p, p + n); p += n; const sh = toHex(sub); const r = { name: `#${field}`, type: 'bytes', kind: 'bytes', value: '0x' + sh, bytesLen: n }; const a = asciiPreview(sh); if (a) r.ascii = a; const inner = tryDecodeNested(root, sh); if (inner) r.children = inner; rows.push(r) }
      else if (wire === 5) { if (p + 4 > bytes.length) return null; rows.push({ name: `#${field}`, type: 'fixed32', kind: 'scalar', value: '0x' + toHex(bytes.subarray(p, p + 4)) }); p += 4 }
      else if (wire === 1) { if (p + 8 > bytes.length) return null; rows.push({ name: `#${field}`, type: 'fixed64', kind: 'scalar', value: '0x' + toHex(bytes.subarray(p, p + 8)) }); p += 8 }
      else return null
    }
    return rows.length ? rows : null
  } catch { return null }
}
function readVarint(b, p) { let shift = 0n, res = 0n, c = 0; for (;;) { if (p >= b.length) throw new Error('eof'); const x = b[p++]; res |= BigInt(x & 0x7f) << shift; if (!(x & 0x80)) break; shift += 7n; if (++c > 10) throw new Error('varint too long') } return [res, p] }

function asciiPreview(hex) {
  if (!hex) return ''
  let s = ''
  for (let i = 0; i < hex.length; i += 2) { const c = parseInt(hex.slice(i, i + 2), 16); if (c < 0x20 || c > 0x7e) return ''; s += String.fromCharCode(c) }
  return s.length >= 2 ? s : ''
}
function mapPreview(m) { const o = {}; for (const k in m) o[k] = Array.isArray(m[k]) ? '0x' + toHex(Uint8Array.from(m[k])) : m[k]; return o }
