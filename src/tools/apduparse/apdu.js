import SPEC from './apduSpec.json' with { type: 'json' }
/* ============================================================================
 *  APDU parser — generic ISO 7816-4 layer + TWI CryptoGuard spec layer.
 * ----------------------------------------------------------------------------
 *  parseGeneric(hex)  -> { cla, ins, p1, p2, lc, data, le, fields, raw, kind }
 *    Decodes the command header and body structure with no coin knowledge:
 *    CLA INS P1 P2 [Lc data] [Le]. Handles:
 *      - header only (4 bytes)                     -> CLA INS P1 P2
 *      - short Lc (1 byte) + data
 *      - TWI extended length (Lc marker 0x00 + u16 BE length) + data  ← TWI uses this
 *      - trailing Le
 *      - a response trailer SW1-SW2 (if the blob is exactly 2 bytes or flagged)
 *
 *  enrich(parsed, spec)  -> adds TWI meaning: class name, command name +
 *    description, P1/P2 notes, and the per-command input-data field breakdown
 *    from the spec (apduSpec.json). Also decodes an SW1-SW2 response.
 * ========================================================================== */

export function normHex(s) {
  if (s == null) return ''
  const h = String(s).replace(/0x/gi, '').replace(/[\s,:_-]/g, '')
  if (h && !/^[0-9a-fA-F]+$/.test(h)) throw new Error('not a hex string')
  if (h.length % 2 !== 0) throw new Error('hex has an odd number of nibbles')
  return h.toLowerCase()
}
const byteAt = (h, i) => h.slice(i * 2, i * 2 + 2)
const u8 = (h, i) => parseInt(h.slice(i * 2, i * 2 + 2), 16)
const u16be = (h, i) => parseInt(h.slice(i * 2, i * 2 + 4), 16)

/* Decode the generic command APDU. `lengthStyle`:
 *   'auto'  — detect: if the byte after P2 is 0x00 and 2 more bytes follow that
 *             plausibly equal the remaining length, treat as TWI extended (00‖u16);
 *             else short Lc.
 *   'short' — force 1-byte Lc.   'twi' — force 00‖u16 extended.   'none' — header only.
 */
export function parseGeneric(hexIn, lengthStyle = 'auto') {
  const h = normHex(hexIn)
  const nbytes = h.length / 2
  if (nbytes < 4) {
    if (nbytes === 2) return { kind: 'response', sw: h, data: '', fields: swFields(h), raw: h, nbytes }
    throw new Error(`APDU too short (${nbytes} bytes); need at least the 4-byte header`)
  }

  const cla = byteAt(h, 0), ins = byteAt(h, 1), p1 = byteAt(h, 2), p2 = byteAt(h, 3)
  const fields = [
    { label: 'CLA', value: cla, note: 'class' },
    { label: 'INS', value: ins, note: 'instruction' },
    { label: 'P1', value: p1, note: 'param 1' },
    { label: 'P2', value: p2, note: 'param 2' },
  ]
  let p = 4
  let lc = null, data = '', le = null, lcStyle = 'none'

  const remAfterHeader = nbytes - 4
  if (remAfterHeader > 0) {
    // choose length encoding: prefer the one whose declared body length exactly
    // consumes the remaining bytes (optionally leaving one trailing Le byte).
    let style = lengthStyle
    if (style === 'auto') {
      const shortLc = u8(h, 4)
      const shortFits = shortLc === remAfterHeader - 1 || shortLc === remAfterHeader - 2
      const twiPossible = shortLc === 0x00 && nbytes >= 7
      const twiLen = twiPossible ? u16be(h, 5) : -1
      const twiFits = twiPossible && (twiLen === nbytes - 7 || twiLen === nbytes - 8)
      if (twiFits) style = 'twi'
      else if (shortFits) style = 'short'
      else if (twiPossible) style = 'twi'   // 0x00 marker present but lengths loose -> extended
      else style = 'short'
    }

    if (style === 'twi') {
      // CLA INS P1 P2 | 00 | Lc(u16 BE) | data
      lcStyle = 'twi-extended'
      lc = u16be(h, 5)
      fields.push({ label: 'Lc marker', value: '00', note: 'TWI extended-length marker' })
      fields.push({ label: 'Lc', value: byteAt(h, 5) + byteAt(h, 6), note: `${lc} bytes (u16 BE)` })
      p = 7
      data = h.slice(p * 2, p * 2 + lc * 2)
      p += lc
    } else {
      // short: CLA INS P1 P2 | Lc(1) | data | [Le]
      lcStyle = 'short'
      lc = u8(h, 4)
      fields.push({ label: 'Lc', value: byteAt(h, 4), note: `${lc} bytes` })
      p = 5
      data = h.slice(p * 2, p * 2 + lc * 2)
      p += lc
    }
    // trailing Le
    if (p < nbytes) {
      le = byteAt(h, p)
      fields.push({ label: 'Le', value: le, note: 'expected response length' })
      p += 1
    }
    if (lc != null) {
      fields.splice(4 + (lcStyle === 'twi-extended' ? 2 : 1), 0, { label: 'Data', value: data || '(empty)', note: `${data.length / 2} bytes`, isData: true })
    }
  }

  return { kind: 'command', cla, ins, p1, p2, lc, lcStyle, data, le, fields, raw: h, nbytes, trailingBytes: p < nbytes ? h.slice(p * 2) : '' }
}

function swFields(sw) {
  return [{ label: 'SW1-SW2', value: sw, note: 'status word' }]
}


/* ============================================================================
 *  TWI CryptoGuard layer — resolve the generic parse against apduSpec.json.
 * ========================================================================== */

const CLASS_BY_CLA = Object.fromEntries(SPEC.classes.map((c) => [c.cla.toLowerCase(), c]))
const CMD_BY_KEY = Object.fromEntries(SPEC.commands.map((c) => [`${c.cla.toLowerCase()}:${c.ins.toLowerCase()}`, c]))
const SW_BY_CODE = Object.fromEntries(SPEC.statusWords.map((s) => [s.sw.toLowerCase(), s]))

export const APDU_FORMAT = SPEC.apduFormat
export const STATUS_WORDS = SPEC.statusWords
export const CLASSES = SPEC.classes

/* Look up a 2-byte SW1-SW2 (hex string, 4 chars). */
export function lookupSW(swHex) {
  const sw = (swHex || '').toLowerCase().replace(/[^0-9a-f]/g, '')
  if (sw.length !== 4) return null
  return SW_BY_CODE[sw] || null
}

/* Given a generic parse from parseGeneric(), attach TWI meaning:
 *   class (name/desc), command (name/desc), per-command input-data field
 *   breakdown mapped onto the actual data bytes, and SW decoding for responses. */
export function enrich(parsed) {
  if (!parsed) return parsed
  if (parsed.kind === 'response') {
    const sw = lookupSW(parsed.sw)
    return { ...parsed, twi: { sw: sw || { sw: parsed.sw, name: 'UNKNOWN', desc: 'Not a documented TWI status word.' } } }
  }
  const claKey = parsed.cla.toLowerCase()
  const cls = CLASS_BY_CLA[claKey] || null
  const cmd = CMD_BY_KEY[`${claKey}:${parsed.ins.toLowerCase()}`] || null

  const breakdown = cmd ? mapDataFields(cmd.inputData, parsed.data) : null
  const isTokenStart = cmd && /START_SIGN_TOKEN_TX/i.test(cmd.name)
  const twi = {
    class: cls,                       // { cla, name, desc } or null
    command: cmd,                     // full spec command or null
    dataBreakdown: breakdown,
    // Token-info commands are decoded inline (decimals + ASCII ticker / NFT
    // collection name) rather than handed to the Coin Parser.
    tokenData: isTokenStart ? decodeTokenInfo(parsed, breakdown) : null,
    // Coin-Parser handoff only for real signing-transaction commands (not token).
    transaction: cmd && !isTokenStart ? extractTransaction(parsed, cmd, breakdown) : null,
  }
  return { ...parsed, twi }
}

/* Pull the Token Type + Token Data fields out of a START_SIGN_TOKEN_TX breakdown
 * and decode them (see decodeTokenData). */
function decodeTokenInfo(parsed, breakdown) {
  if (!breakdown?.rows?.length) return null
  const ttRow = breakdown.rows.find((r) => /token type/i.test(r.field))
  const tdRow = breakdown.rows.find((r) => /^token data$/i.test(r.field) || (/token data/i.test(r.field) && !/length/i.test(r.field)))
  if (!ttRow || !tdRow || !tdRow.value) return null
  try { return decodeTokenData(ttRow.value, parsed.cla, tdRow.value) } catch { return null }
}

/* CLA -> coin id understood by the Coin Parser tool. */
const CLA_COIN = { '00': 'bitcoin', '01': 'ethereum', '02': 'solana', '03': 'ripple', '04': 'cardano', '05': 'tron', '06': 'avalanche' }

/* For sign-transaction commands, pull the embedded raw transaction so the UI can
 * offer to open it in the Coin Parser (which decodes the tx itself). The byte
 * layout of the tx inside the APDU is what the Test Record Generator builds:
 *   - a "Signing Transaction" field in the spec breakdown -> use that slice;
 *   - else (spec lacks a data table, e.g. Solana FINISH_SIGN_TX which re-sends
 *     the message) -> the data minus a trailing BIP32 path (depth byte + steps),
 *     and minus a leading u16 length prefix if one is present. */
/* For UTXO START commands, the tx is the trailing "Transaction chunk" whose
 * length is the u16 "Chunk Length" field just before it. The chunk length is
 * the last u16 before the chunk; the chunk runs to the end of the data. We find
 * it by reading the LTx (first u32 = whole-tx length) — when single-chunk the
 * chunk == LTx == the trailing LTx bytes. */
function findTrailingChunk(data) {
  if (!data || data.length < 8) return null
  // LTx is the first 4 bytes (u32). Bitcoin/Cardano/Avax store it big-endian.
  const ltxBE = parseInt(data.slice(0, 8), 16)
  const ltxLE = parseInt(data.slice(0, 8).match(/../g).reverse().join(''), 16)
  const totalBytes = data.length / 2
  for (const ltx of [ltxBE, ltxLE]) {
    if (ltx > 0 && ltx < totalBytes && ltx >= 8) {
      // the tx is the trailing ltx bytes (the chunk); preceded by a 2-byte chunk len
      const cand = data.slice((totalBytes - ltx) * 2)
      // sanity: the 2 bytes before the chunk should equal ltx (chunk length)
      const clHexBE = ((totalBytes - ltx - 2) >= 0) ? data.slice((totalBytes - ltx - 2) * 2, (totalBytes - ltx) * 2) : ''
      const cl = clHexBE ? parseInt(clHexBE, 16) : -1
      if (cl === ltx || cl === -1) return cand
      return cand
    }
  }
  return null
}
function extractTransaction(parsed, cmd, breakdown) {
  const name = (cmd.name || '').toUpperCase()
  const isSign = /SIGN_TX|SIGN_TOKEN_TX|SIGN_MSG|REQUEST_SIGN/.test(name) || name.includes('SIGN_INPUT')
  if (!isSign) return null
  const coin = CLA_COIN[parsed.cla.toLowerCase()] || null
  const data = parsed.data || ''
  if (!data) return null

  // 0) Solana (CLA 02): data is  u16 msgLen ‖ message ‖ [depth ‖ path].
  //    Strip the leading u16 length (it equals the message length, with or
  //    without a trailing BIP32 path) and return the message.
  if (parsed.cla.toLowerCase() === '02' && data.length >= 6) {
    const total = data.length / 2
    const lenBE = parseInt(data.slice(0, 4), 16)
    const lenLE = parseInt(data.slice(0, 4).match(/../g).reverse().join(''), 16)
    for (const L of [lenBE, lenLE]) {
      if (L > 4 && 2 + L <= total) {
        const msg = data.slice(4, 4 + L * 2)
        // a Solana message begins with a small header (numRequiredSignatures,
        // 1..8). If so it is a clean signing message; otherwise it is a token
        // payload we still hand off but label honestly.
        const h0 = parseInt(msg.slice(0, 2), 16)
        const clean = h0 >= 1 && h0 <= 8
        return { hex: msg, coin, source: clean ? 'message (Solana u16-prefixed)' : 'token payload', clean }
      }
    }
  }
  // 1a) UTXO START pattern: a "Chunk Length" (u16) field followed by the
  //     "Transaction chunk" -> the tx is the trailing chunkLen bytes of the data.
  if (cmd.inputData?.some((f) => /chunk length/i.test(f.field)) && cmd.inputData?.some((f) => /transaction chunk/i.test(f.field))) {
    const tail = findTrailingChunk(parsed.data)
    if (tail) return { hex: tail, coin, source: 'Transaction chunk' }
  }
  // 1b) explicit transaction field from the breakdown (account coins: the
  //     "Signing Transaction" slice is exact when LTx resolved correctly).
  if (breakdown?.rows?.length) {
    const txRow = breakdown.rows.find((r) => /transaction|token data|raw tx|message/i.test(r.field) && !/length|chunk length/i.test(r.field))
    if (txRow && txRow.value && txRow.bytes > 0 && txRow.bytes < (parsed.data.length / 2)) return { hex: txRow.value, coin, source: txRow.field }
  }

  // 2) fall back: strip a trailing path (depth + 4*depth) and a leading u16 len.
  let body = data
  // trailing path: try depths 1..10, pick the one where depth byte matches.
  for (let d = 10; d >= 1; d--) {
    const pathBytes = 1 + 4 * d
    if (body.length / 2 <= pathBytes + 1) continue
    const depthByteHex = body.slice((body.length / 2 - pathBytes) * 2, (body.length / 2 - pathBytes) * 2 + 2)
    if (parseInt(depthByteHex, 16) === d) { body = body.slice(0, (body.length / 2 - pathBytes) * 2); break }
  }
  // leading u16 length prefix if it equals the remaining length (BE or LE)
  if (body.length >= 4) {
    const be = parseInt(body.slice(0, 4), 16)
    const le = parseInt(body.slice(0, 4).match(/../g).reverse().join(''), 16)
    const rest = body.length / 2 - 2
    if (be === rest || le === rest) body = body.slice(4)
  }
  if (!body) return null
  return { hex: body, coin, source: 'data (path stripped)' }
}

/* Map the spec's inputData field list onto the actual data hex, consuming bytes
 * field-by-field. Fixed-length fields show their slice; variable/length-named
 * fields (len not a plain number) take the remaining bytes (best-effort). The
 * goal is a readable, faithful breakdown — not a strict validator. */
function mapDataFields(inputData, dataHex) {
  if (!inputData || !inputData.length || !dataHex) {
    return { rows: [], consumed: 0, total: (dataHex || '').length / 2, leftover: dataHex || '' }
  }
  const rows = []
  let p = 0 // byte cursor into dataHex
  const total = dataHex.length / 2
  // captured length values keyed by symbol; store BOTH big- and little-endian
  // readings because TWI mixes them (e.g. ETH tx length is BE, token TDL is LE).
  const lenVars = {} // sym -> { be, le }
  for (let fi = 0; fi < inputData.length; fi++) {
    const f = inputData[fi]
    const fixed = fixedLen(f.len)

    // Repeated field (BIP32 path "Step i" / "Step 0 .. Step N-1"): emit one row
    // per element, each of size 'fixed', counted by a captured symbol (N/NIS).
    const rep = repeatInfo(f, lenVars, fixed, total - p)
    if (rep) {
      for (let i = 0; i < rep.count && p + fixed <= total; i++) {
        const slice = dataHex.slice(p * 2, (p + fixed) * 2)
        rows.push({ field: stepName(f.field, i), len: f.len, desc: f.desc, value: slice, bytes: fixed, offset: p })
        p += fixed
      }
      if (p >= total) break
      continue
    }

    let n = fixed
    if (n == null) {
      const trailingFixed = sumFixedAfter(inputData, fi + 1)
      n = resolveLenRef(f.len, lenVars, total - p - trailingFixed)
    }
    let slice, consumed
    if (n != null && n >= 0 && p + n <= total) { slice = dataHex.slice(p * 2, (p + n) * 2); consumed = n }
    else { slice = dataHex.slice(p * 2); consumed = total - p }
    rows.push({ field: f.field, len: f.len, desc: f.desc, value: slice, bytes: consumed, offset: p })
    if (consumed > 0 && consumed <= 4) {
      const be = parseInt(slice, 16)
      const le = parseInt(slice.match(/../g).reverse().join(''), 16)
      for (const sym of symbolsIn(f.field)) lenVars[sym] = { be, le }
    }
    p += consumed
    if (p >= total) break
  }
  return { rows, consumed: p, total, leftover: p < total ? dataHex.slice(p * 2) : '' }
}
/* a "fixed" length is a plain integer (possibly with a 'byte(s)' suffix). */
function fixedLen(len) {
  if (len == null) return null
  const m = /^(\d+)\s*(?:byte|bytes|b)?$/i.exec(String(len).trim())
  return m ? parseInt(m[1], 10) : null
}
function symbolsIn(name) {
  return [...String(name || '').matchAll(/(([A-Za-z][A-Za-z0-9_]*))/g)].map((m) => m[1].toUpperCase())
}
function resolveLenRef(len, lenVars, fits) {
  if (len == null) return null
  const syms = [...String(len).matchAll(/([A-Za-z][A-Za-z0-9_]*)/g)].map((m) => m[1].toUpperCase())
  for (const s of syms) {
    const v = lenVars[s]
    if (v == null) continue
    // prefer the endianness that fits the remaining room (after trailing fixed fields)
    if (typeof v === 'number') return v
    if (fits != null && v.be >= 0 && v.be <= fits) return v.be
    if (fits != null && v.le >= 0 && v.le <= fits) return v.le
    return v.be // fallback
  }
  return null
}
/* sum of fixed (plain-integer) lengths of fields from index i onward. */
function sumFixedAfter(inputData, i) {
  let s = 0
  for (let k = i; k < inputData.length; k++) { const n = fixedLen(inputData[k].len); if (n != null) s += n }
  return s
}
/* Decide whether a field is a repeated element (e.g. BIP32 path steps) and how
 * many times it repeats. Triggered when the field name/desc looks like an
 * indexed step ("Step i", "Step 0 .. Step N-1", "for i = 0 .. N-1"); the count
 * comes from a previously-captured symbol (N, NIS, …) referenced in the text,
 * else the last captured count. Only repeats fixed-size fields >1 time. */
function repeatInfo(field, lenVars, fixed, remaining) {
  if (fixed == null || fixed <= 0) return null
  const text = ((field.field || '') + ' ' + (field.desc || ''))
  const looksRepeated = /\bStep\b.*\b(i|0)\b|\bfor\s+i\s*=|0\s*\.\.|\bi\s*=\s*0\b|each step|per step/i.test(text)
  if (!looksRepeated) return null
  // count symbol: from the text (N / NIS / depth var) else any captured length var
  const syms = [...text.matchAll(/\b([A-Z][A-Z0-9_]*)\b/g)].map((m) => m[1].toUpperCase())
  const fitMax = Math.floor(remaining / fixed)
  let count = null
  for (const sym of syms) {
    const v = lenVars[sym]
    if (v == null) continue
    const cand = typeof v === 'number' ? v : (v.be >= 0 && v.be <= fitMax ? v.be : v.le)
    if (cand != null && cand >= 0 && cand <= fitMax) { count = cand; break }
  }
  if (count == null) {
    // fall back to the single most-recent captured count that fits
    for (const k of Object.keys(lenVars)) {
      const v = lenVars[k]; const cand = typeof v === 'number' ? v : v.be
      if (cand >= 1 && cand <= fitMax) { count = cand; break }
    }
  }
  if (count == null || count < 1) return null
  return { count }
}
/* name a repeated element with its index: "Step i" -> "Step 0", "Step 1", … */
function stepName(name, i) {
  if (/\bStep\s+i\b/i.test(name)) return name.replace(/\bStep\s+i\b/i, 'Step ' + i)
  return name.replace(/\bi\b/, String(i)) + (/(\bi\b)/.test(name) ? '' : '') || (name + ' [' + i + ']')
}


/* Full parse + enrich in one call. lengthStyle passes through to parseGeneric. */
export function parseApdu(hex, lengthStyle = 'auto') {
  return enrich(parseGeneric(hex, lengthStyle))
}


/* ============================================================================
 *  Token Data decoder — visualizes the START_SIGN_TOKEN_TX "Token Data" field.
 * ----------------------------------------------------------------------------
 *  Layout depends on the Token Type byte (per the TWI APDU spec):
 *    fungible (ERC20=0 / TRX-20=3 / SPL=4 / Jetton): Decimal(4, LE) ‖ Ticker(ASCII)
 *    NFT      (NFT/ERC721=1 / EIP1155=2):            Collection Name(ASCII)
 *    TON Jetton variant (CLA 07, type 0):
 *      Decimal(4,LE) ‖ JCL(2,BE) ‖ JettonCode(JCL) ‖ MaxDepth(2) ‖ State(1) ‖ Ticker(rest,ASCII)
 *  Decimal is little-endian u32; names are raw ASCII.
 * ========================================================================== */
const tdU32le = (hex4) => parseInt(hex4.match(/../g).reverse().join(''), 16)
const tdU16be = (hex2) => parseInt(hex2, 16)
function asciiOf(hex) {
  let s = ''
  for (let i = 0; i < hex.length; i += 2) {
    const c = parseInt(hex.slice(i, i + 2), 16)
    s += (c >= 0x20 && c <= 0x7e) ? String.fromCharCode(c) : '·'
  }
  return s
}
/* token type byte (number) + CLA -> { category, label } */
function tokenKind(typeByte, cla) {
  const t = typeByte
  // SOL: only SPL=4 ; TRON: only TRX-20=3 ; ETH/TON: 0/1/2
  if (t === 4) return { category: 'fungible', label: 'SPL' }
  if (t === 3) return { category: 'fungible', label: 'TRX-20' }
  if (t === 0) return { category: 'fungible', label: cla === '07' ? 'Jetton (TON)' : 'ERC-20' }
  if (t === 1) return { category: 'nft', label: cla === '05' ? 'TRC-721' : 'ERC-721 / NFT' }
  if (t === 2) return { category: 'nft', label: 'EIP-1155 / ERC-1155' }
  return { category: 'unknown', label: 'type ' + t }
}

/* decode the Token Data hex given the token-type byte + CLA. Returns rows for
 * the UI: [{ field, value, bytes, note }]. */
export function decodeTokenData(tokenTypeHex, cla, tokenDataHex) {
  const data = (tokenDataHex || '').toLowerCase()
  const type = parseInt(tokenTypeHex, 16)
  const kind = tokenKind(type, (cla || '').toLowerCase())
  const rows = []
  rows.push({ field: 'Token kind', value: kind.label, note: kind.category })

  if (kind.category === 'nft') {
    // whole Token Data is the Collection Name (ASCII)
    rows.push({ field: 'Collection Name', value: asciiOf(data), bytes: data.length / 2, note: 'ASCII · ' + data })
    return { kind, rows }
  }

  // fungible: Decimal(4, LE) then the ticker (ASCII). TON Jetton has extra fields.
  if (data.length < 8) { rows.push({ field: 'Token Data', value: data, note: 'too short' }); return { kind, rows } }
  const decHex = data.slice(0, 8)
  rows.push({ field: 'Decimals', value: String(tdU32le(decHex)), bytes: 4, note: 'u32 LE (' + decHex + ')' })
  let p = 8
  if ((cla || '').toLowerCase() === '07' && type === 0 && data.length >= (8 + 4 + 2 + 1) * 2) {
    // TON Jetton: JCL(2) JettonCode(JCL) MaxDepth(2) State(1) Ticker(rest)
    const jcl = tdU16be(data.slice(p, p + 4)); p += 4
    rows.push({ field: 'Jetton Code Length', value: String(jcl), bytes: 2 })
    const code = data.slice(p, p + jcl * 2); p += jcl * 2
    rows.push({ field: 'Jetton Code', value: code, bytes: jcl, note: 'raw' })
    const maxDepth = tdU16be(data.slice(p, p + 4)); p += 4
    rows.push({ field: 'Max Depth', value: String(maxDepth), bytes: 2 })
    const state = data.slice(p, p + 2); p += 2
    rows.push({ field: 'State assembler', value: state, bytes: 1 })
  }
  const tickerHex = data.slice(p)
  rows.push({ field: 'Ticker Name', value: asciiOf(tickerHex), bytes: tickerHex.length / 2, note: 'ASCII · ' + tickerHex })
  return { kind, rows }
}
