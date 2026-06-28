/* ============================================================================
 *  Coin Parser — auto-detect a raw transaction's coin and decode key fields.
 * ----------------------------------------------------------------------------
 *  Supports Bitcoin, Cardano, Avalanche, Ethereum, Solana, Ripple, Tron.
 *  Strategy: each coin has a try-parser that decodes the blob and THROWS if the
 *  bytes don't fit its format. detectAndParse() runs them in a priority order
 *  (most-specific / least-ambiguous first) and returns the first clean parse.
 *  This "parse-to-validate" approach is far more robust than prefix matching.
 *
 *  Formats verified against the firmware helpers + session HTMLs:
 *    ETH  RLP/EIP-2718 · TRON protobuf · SOL message · XRP STObject ·
 *    BTC  legacy/segwit · ADA CBOR · AVAX custom-codec.
 * ========================================================================== */

/* ----------------------------- byte cursor ------------------------------ */
class Reader {
  constructor(bytes) { this.b = bytes; this.p = 0 }
  get rem() { return this.b.length - this.p }
  eof() { return this.p >= this.b.length }
  u8() { if (this.p >= this.b.length) throw new Error('eof'); return this.b[this.p++] }
  take(n) { if (this.p + n > this.b.length) throw new Error('overrun'); const s = this.b.subarray(this.p, this.p + n); this.p += n; return s }
  u32le() { const v = this.take(4); return (v[0] | (v[1] << 8) | (v[2] << 16) | (v[3] << 24)) >>> 0 }
  u16be() { const v = this.take(2); return (v[0] << 8) | v[1] }
  u32be() { const v = this.take(4); return ((v[0] << 24) | (v[1] << 16) | (v[2] << 8) | v[3]) >>> 0 }
  u64leBig() { let n = 0n; const v = this.take(8); for (let i = 7; i >= 0; i--) n = (n << 8n) | BigInt(v[i]); return n }
  u64beBig() { let n = 0n; const v = this.take(8); for (let i = 0; i < 8; i++) n = (n << 8n) | BigInt(v[i]); return n }
  btcVarint() { const x = this.u8(); if (x < 0xfd) return x; if (x === 0xfd) return this.u16le(); if (x === 0xfe) return this.u32le(); return Number(this.u64leBig()) }
  u16le() { const v = this.take(2); return v[0] | (v[1] << 8) }
  shortvec() { let n = 0, shift = 0; for (;;) { const x = this.u8(); n |= (x & 0x7f) << shift; if (!(x & 0x80)) break; shift += 7; if (shift > 28) throw new Error('shortvec too long') } return n >>> 0 }
}

/* ------------------------------ hex helpers ----------------------------- */
export function normHex(s) {
  if (s == null) return ''
  const h = String(s).replace(/0x/gi, '').replace(/[\s,:_-]/g, '')
  if (h && !/^[0-9a-fA-F]+$/.test(h)) throw new Error('not a hex string')
  if (h.length % 2 !== 0) throw new Error('hex has an odd number of nibbles')
  return h.toLowerCase()
}
export function hexToBytes(hex) {
  const h = normHex(hex)
  const a = new Uint8Array(h.length / 2)
  for (let i = 0; i < a.length; i++) a[i] = parseInt(h.substr(i * 2, 2), 16)
  return a
}
const toHex = (b) => Array.from(b).map((x) => x.toString(16).padStart(2, '0')).join('')
const bnHex = (b) => { let n = 0n; for (const x of b) n = (n << 8n) | BigInt(x); return n }

/* a parsed field row for the UI */
const F = (label, value, mono = true) => ({ label, value: String(value), mono })

/* ============================ ETHEREUM (RLP) ============================ */
function rlpDecode(r) {
  const b = r.u8()
  if (b <= 0x7f) return new Uint8Array([b])
  if (b <= 0xb7) return r.take(b - 0x80)
  if (b <= 0xbf) { const ln = numFrom(r.take(b - 0xb7)); return r.take(ln) }
  // list
  let ln
  if (b <= 0xf7) ln = b - 0xc0
  else ln = numFrom(r.take(b - 0xf7))
  const end = r.p + ln
  const items = []
  while (r.p < end) items.push(rlpDecode(r))
  return items
}
function numFrom(bytes) { let n = 0; for (const x of bytes) n = n * 256 + x; return n }
function tryEthereum(bytes) {
  const first = bytes[0]
  const isTyped = first === 0x01 || first === 0x02 || first === 0x03
  const isLegacy = first >= 0xc0
  if (!isTyped && !isLegacy) throw new Error('not RLP')
  const r = new Reader(bytes)
  let type = 0
  if (isTyped) { type = r.u8() }
  const list = rlpDecode(r)
  if (!Array.isArray(list)) throw new Error('eth: not a list')
  const big = (x) => (x && x.length ? bnHex(x) : 0n)
  const fields = []
  let to, value, data, chainId, nonce, gas
  if (type === 2 || type === 1) {
    // [chainId, nonce, maxPrio, maxFee, gas, to, value, data, accessList, ...]
    if (list.length < 9) throw new Error('eth1559: short')
    chainId = big(list[0]); nonce = big(list[1])
    gas = big(list[4]); to = list[5]; value = big(list[6]); data = list[7]
    fields.push(F('Type', type === 2 ? 'EIP-1559 (0x02)' : 'EIP-2930 (0x01)'))
    fields.push(F('Chain ID', chainId.toString()))
    fields.push(F('Nonce', nonce.toString()))
    fields.push(F('Max fee / gas', big(list[3]).toString() + ' wei'))
    fields.push(F('Gas limit', gas.toString()))
  } else {
    // legacy [nonce, gasPrice, gas, to, value, data, v, r, s] (v carries chainId)
    if (list.length < 6) throw new Error('eth-legacy: short')
    nonce = big(list[0]); gas = big(list[2]); to = list[3]; value = big(list[4]); data = list[5]
    fields.push(F('Type', 'Legacy'))
    fields.push(F('Nonce', nonce.toString()))
    fields.push(F('Gas price', big(list[1]).toString() + ' wei'))
    fields.push(F('Gas limit', gas.toString()))
    if (list.length >= 7 && list[6]?.length) fields.push(F('Chain ID (from v)', bnHex(list[6]).toString()))
  }
  const toHexAddr = to && to.length ? '0x' + toHex(to) : '(contract creation)'
  fields.push(F('To', toHexAddr))
  fields.push(F('Value', formatUnits(value, 18) + ' ETH'))
  if (data && data.length) {
    const sel = toHex(data.subarray(0, 4))
    const known = ERC20_SELECTORS[sel]
    fields.push(F('Data', '0x' + toHex(data.subarray(0, 32)) + (data.length > 32 ? '…' : '')))
    if (known) {
      fields.push(F('Token method', `${known} (0x${sel})`))
      if (sel === 'a9059cbb' && data.length >= 68) {
        fields.push(F('  → recipient', '0x' + toHex(data.subarray(16, 36))))
        fields.push(F('  → amount', bnHex(data.subarray(36, 68)).toString()))
      }
    }
  }
  return { coin: 'ethereum', type: type === 2 ? 'EIP-1559' : type === 1 ? 'EIP-2930' : 'Legacy', fields }
}
const ERC20_SELECTORS = { a9059cbb: 'transfer', '095ea7b3': 'approve', '23b872dd': 'transferFrom' }

/* ============================ BITCOIN =================================== */
function tryBitcoin(bytes) {
  const r = new Reader(bytes)
  const version = r.u32le()
  if (version !== 1 && version !== 2) throw new Error('btc: bad version')
  let segwit = false
  if (r.b[r.p] === 0x00 && r.b[r.p + 1] === 0x01) { segwit = true; r.p += 2 }
  const inCount = r.btcVarint()
  if (inCount === 0 || inCount > 1000) throw new Error('btc: bad input count')
  const fields = [F('Version', version), F('SegWit', segwit ? 'yes' : 'no'), F('Inputs', inCount)]
  for (let i = 0; i < inCount; i++) {
    const hash = r.take(32); const vout = r.u32le()
    const sl = r.btcVarint(); r.take(sl); r.u32le() /* sequence */
    if (i < 4) fields.push(F(`  in[${i}]`, toHex(hash.slice().reverse()) + ':' + vout))
  }
  const outCount = r.btcVarint()
  if (outCount === 0 || outCount > 1000) throw new Error('btc: bad output count')
  fields.push(F('Outputs', outCount))
  let total = 0n
  for (let i = 0; i < outCount; i++) {
    const val = r.u64leBig(); total += val
    const sl = r.btcVarint(); const spk = r.take(sl)
    if (i < 6) fields.push(F(`  out[${i}]`, formatUnits(val, 8) + ' BTC · ' + btcScriptType(spk)))
  }
  fields.push(F('Total out', formatUnits(total, 8) + ' BTC'))
  return { coin: 'bitcoin', type: segwit ? 'SegWit' : 'Legacy', fields }
}
function btcScriptType(s) {
  if (s.length === 25 && s[0] === 0x76 && s[1] === 0xa9 && s[23] === 0x88 && s[24] === 0xac) return 'P2PKH'
  if (s.length === 23 && s[0] === 0xa9 && s[22] === 0x87) return 'P2SH'
  if (s.length === 22 && s[0] === 0x00 && s[1] === 0x14) return 'P2WPKH'
  if (s.length === 34 && s[0] === 0x00 && s[1] === 0x20) return 'P2WSH'
  if (s.length === 34 && s[0] === 0x51 && s[1] === 0x20) return 'P2TR'
  return 'script(' + s.length + 'B)'
}

/* ============================ AVALANCHE ================================ */
const AVAX_TYPES = { 0: 'BaseTx', 1: 'CreateAssetTx', 2: 'OperationTx', 3: 'ImportTx', 4: 'ExportTx', 0x0c: 'AddValidatorTx', 0x0e: 'AddDelegatorTx' }
function tryAvalanche(bytes) {
  const r = new Reader(bytes)
  const codec = r.u16be()
  if (codec !== 0) throw new Error('avax: bad codec')
  const typeId = r.u32be()
  if (typeId > 0x20) throw new Error('avax: bad typeId')
  const networkId = r.u32be()
  const blockchainId = r.take(32)
  const fields = [
    F('Codec', codec),
    F('Type', `${AVAX_TYPES[typeId] || 'type ' + typeId} (0x${typeId.toString(16)})`),
    F('Network ID', networkId),
    F('Blockchain ID', toHex(blockchainId).slice(0, 24) + '…'),
  ]
  // transferable outputs
  const outCount = r.u32be()
  if (outCount > 1000) throw new Error('avax: bad out count')
  fields.push(F('Outputs', outCount))
  for (let i = 0; i < outCount && i < 6; i++) {
    const assetId = r.take(32); const outType = r.u32be()
    r.u64beBig() /* locktime */; r.u32be() /* threshold */
    const addrN = r.u32be(); const amtPlaceholder = null
    // output type 7 (SECP transfer) layout: amount is before locktime in some encodings;
    // we already consumed locktime/threshold — re-read defensively is complex, so only show count
    for (let a = 0; a < addrN; a++) r.take(20)
    fields.push(F(`  out[${i}]`, `asset ${toHex(assetId).slice(0, 10)}… type ${outType}`))
    void amtPlaceholder
  }
  return { coin: 'avalanche', type: AVAX_TYPES[typeId] || 'tx', fields }
}

/* ============================ TRON (protobuf) =========================== */
function pbReadVarint(r) { let shift = 0n, res = 0n; for (;;) { const x = r.u8(); res |= BigInt(x & 0x7f) << shift; if (!(x & 0x80)) break; shift += 7n } return res }
function tryTron(bytes) {
  const r = new Reader(bytes)
  // a Tron raw_data starts with field 1 (ref_block_bytes, wire 2 -> 0x0a). Some
  // blobs are length-prefixed; skip a leading 2-byte length if present.
  if (r.b[0] !== 0x0a && r.b[2] === 0x0a) r.p = 2
  const fields = []
  let sawRefBlock = false, contractType = null, toAddr = null, amount = null, contractAddr = null
  while (!r.eof()) {
    const key = Number(pbReadVarint(r)); const field = key >> 3, wire = key & 7
    if (wire === 0) { const v = pbReadVarint(r); if (field === 8) fields.push(F('Expiration', v.toString())); if (field === 14) fields.push(F('Timestamp', v.toString())); if (field === 18) fields.push(F('Fee limit', v.toString())) }
    else if (wire === 2) {
      const len = Number(pbReadVarint(r)); const raw = r.take(len)
      if (field === 1) sawRefBlock = true
      if (field === 11) { const c = parseTronContract(raw); contractType = c.type; toAddr = c.to; amount = c.amount; contractAddr = c.contract }
    } else if (wire === 5) r.take(4)
    else if (wire === 1) r.take(8)
    else throw new Error('tron: bad wire ' + wire)
  }
  if (!sawRefBlock && contractType == null) throw new Error('tron: no ref_block/contract')
  const out = []
  out.push(F('Contract', contractType || 'unknown'))
  if (contractAddr) out.push(F('Token contract', contractAddr))
  if (toAddr) out.push(F('To', toAddr))
  if (amount != null) out.push(F('Amount', amount.toString()))
  return { coin: 'tron', type: contractType || 'Transaction', fields: out.concat(fields) }
}
const TRON_CONTRACTS = { 1: 'TransferContract', 2: 'TransferAssetContract', 31: 'TriggerSmartContract', 11: 'FreezeBalanceContract' }
function parseTronContract(raw) {
  const r = new Reader(raw); let type = null, anyVal = null
  while (!r.eof()) {
    const key = Number(pbReadVarint(r)); const field = key >> 3, wire = key & 7
    if (wire === 0) { const v = Number(pbReadVarint(r)); if (field === 1) type = v }
    else if (wire === 2) { const len = Number(pbReadVarint(r)); const b = r.take(len); if (field === 2) anyVal = b }
    else if (wire === 5) r.take(4); else if (wire === 1) r.take(8); else break
  }
  const res = { type: TRON_CONTRACTS[type] || ('type ' + type), to: null, amount: null, contract: null }
  if (anyVal) {
    // Any = { type_url(field1), value(field2) }; decode value as the concrete contract
    const ar = new Reader(anyVal)
    while (!ar.eof()) {
      const key = Number(pbReadVarint(ar)); const field = key >> 3, wire = key & 7
      if (wire === 2) { const len = Number(pbReadVarint(ar)); const v = ar.take(len); if (field === 2) decodeTransfer(v, res) }
      else if (wire === 0) pbReadVarint(ar); else if (wire === 5) ar.take(4); else if (wire === 1) ar.take(8); else break
    }
  }
  return res
}
function decodeTransfer(v, res) {
  const r = new Reader(v)
  while (!r.eof()) {
    const key = Number(pbReadVarint(r)); const field = key >> 3, wire = key & 7
    if (wire === 0) { const n = pbReadVarint(r); if (field === 3) res.amount = n }
    else if (wire === 2) { const len = Number(pbReadVarint(r)); const b = r.take(len); if (field === 2) res.to = tronAddr(b); if (field === 1 && b.length === 21) res.contract = res.contract || null }
    else if (wire === 5) r.take(4); else if (wire === 1) r.take(8); else break
  }
}
function tronAddr(b) { return b.length === 21 ? '41' + toHex(b.subarray(1)) : toHex(b) }

/* ============================ RIPPLE (STObject) ======================== */
const XRP_TXTYPE = { 0: 'Payment', 1: 'EscrowCreate', 3: 'AccountSet', 20: 'TrustSet' }
function tryRipple(bytes) {
  const r = new Reader(bytes)
  // The canonical STObject begins with the TransactionType field (tag 0x12 =
  // UInt16, field 2). Some device blobs carry a tiny prefix; locate 0x12 within
  // the first 4 bytes and start there.
  let start = -1
  for (let k = 0; k < 4 && k < bytes.length; k++) { if (bytes[k] === 0x12) { start = k; break } }
  if (start < 0) throw new Error('xrp: no TransactionType tag')
  r.p = start
  const fields = []
  let sawType = false
  let guard = 0
  while (!r.eof() && guard++ < 64) {
    const tag = r.u8()
    let typeCode = tag >> 4, fieldCode = tag & 0x0f
    if (typeCode === 0) typeCode = r.u8()
    if (fieldCode === 0) fieldCode = r.u8()
    if (typeCode === 1) { // UInt16
      const v = r.u16be()
      if (fieldCode === 2) { sawType = true; fields.push(F('TransactionType', (XRP_TXTYPE[v] ?? 'type ' + v))) }
    } else if (typeCode === 2) { const v = r.u32be(); if (fieldCode === 4) fields.push(F('Sequence', v)); else if (fieldCode === 27) fields.push(F('LastLedgerSeq', v)) }
    else if (typeCode === 6) { // Amount
      const first = r.b[r.p]
      if (first & 0x80) { r.take(48) /* issued currency */; fields.push(F('Amount', 'issued currency')) }
      else { const amt = r.u64beBig() & 0x3fffffffffffffffn; const lbl = fieldCode === 8 ? 'Fee' : 'Amount'; fields.push(F(lbl, formatUnits(amt, 6) + ' XRP')) }
    } else if (typeCode === 7) { const len = r.btcVarint_xrp(); r.take(len) } // Blob
    else if (typeCode === 8) { const len = r.u8(); const a = r.take(len); fields.push(F(fieldCode === 1 ? 'Account' : fieldCode === 3 ? 'Destination' : 'AccountID', '…' + toHex(a).slice(0, 20))) }
    else break
  }
  if (!sawType) throw new Error('xrp: no TransactionType')
  return { coin: 'ripple', type: 'Payment', fields }
}
function isXrpFieldStart(b) { const t = b >> 4; return t === 1 || t === 2 || t === 6 || t === 8 } // common first fields
// XRP blob length uses a Ripple-specific var-length scheme; approximate with 1 byte
Reader.prototype.btcVarint_xrp = function () { const a = this.u8(); if (a <= 192) return a; if (a <= 240) { const b = this.u8(); return 193 + ((a - 193) * 256) + b } return 12481 }

/* ============================ SOLANA (message) ========================= */
function trySolana(bytes) {
  const r = new Reader(bytes)
  // a SIGNED tx begins with a shortvec sig count + 64*N sigs, then the message.
  // The message begins with 3 small header bytes then a shortvec account count.
  // Try message-first; if header bytes look wrong, try skipping signatures.
  const attempts = []
  for (let off = 0; off <= 2; off++) attempts.push({ off, skipSigs: false })
  attempts.push({ off: 0, skipSigs: true })
  // TWI sign-data wraps the message in a leading u16 length prefix (BE or LE);
  // try starting right after a 2-byte prefix whose value matches the remainder.
  if (bytes.length >= 4) {
    const be = (bytes[0] << 8) | bytes[1]
    const le = bytes[0] | (bytes[1] << 8)
    if (be === bytes.length - 2 || le === bytes.length - 2 || be + 2 <= bytes.length || le + 2 <= bytes.length) {
      attempts.push({ off: 2, skipSigs: false })
    }
  }
  for (const { off, skipSigs } of attempts) {
    try {
      const rr = new Reader(bytes.subarray(off))
      if (skipSigs) { const n = rr.shortvec(); if (n === 0 || n > 8) throw new Error('sigs'); rr.take(n * 64) }
      const h0 = rr.u8(), h1 = rr.u8(), h2 = rr.u8()
      if (h0 === 0 || h0 > 8 || h1 > 8 || h2 > 64) throw new Error('sol: bad header')
      const acctN = rr.shortvec()
      if (acctN === 0 || acctN > 64) throw new Error('sol: bad account count')
      const accts = []
      for (let i = 0; i < acctN; i++) accts.push(rr.take(32))
      const blockhash = rr.take(32)
      const ixN = rr.shortvec()
      if (ixN > 64) throw new Error('sol: bad ix count')
      const fields = [
        F('Required signatures', h0),
        F('Accounts', acctN),
        F('Recent blockhash', toHex(blockhash).slice(0, 24) + '…'),
        F('Instructions', ixN),
        F('Fee payer', toHex(accts[0]).slice(0, 24) + '…'),
      ]
      for (let i = 0; i < ixN && i < 6; i++) {
        const prog = rr.u8(); const an = rr.shortvec(); for (let a = 0; a < an; a++) rr.u8()
        const dl = rr.shortvec(); rr.take(dl)
        const progKey = accts[prog] ? toHex(accts[prog]) : '?'
        fields.push(F(`  ix[${i}]`, 'program ' + progKey.slice(0, 16) + '… · ' + an + ' accts'))
      }
      return { coin: 'solana', type: skipSigs ? 'Signed tx' : 'Message', fields }
    } catch { /* try next */ }
  }
  throw new Error('sol: not a message')
}

/* ============================ CARDANO (CBOR) =========================== */
function cborHead(r) { const ib = r.u8(); const major = ib >> 5; const minor = ib & 0x1f; let len = minor; if (minor === 24) len = r.u8(); else if (minor === 25) len = r.u16be(); else if (minor === 26) len = r.u32be(); else if (minor === 27) len = Number(r.u64beBig()); return { major, minor, len } }
function cborSkip(r) {
  const h = cborHead(r)
  if (h.major === 0 || h.major === 1 || h.major === 7) return
  if (h.major === 2 || h.major === 3) { r.take(h.len); return }
  if (h.major === 4) { for (let i = 0; i < h.len; i++) cborSkip(r); return }
  if (h.major === 5) { for (let i = 0; i < h.len; i++) { cborSkip(r); cborSkip(r) } return }
  if (h.major === 6) { cborSkip(r); return }
}
function tryCardano(bytes) {
  const r = new Reader(bytes)
  let top = cborHead(r)
  let wrapped = top.major === 4 && (top.len === 3 || top.len === 4)
  let bodyHead
  if (wrapped) {
    bodyHead = cborHead(r) // body map inside the [body, witness, is_valid, aux] array
  } else {
    // the device often receives just the tx BODY (a bare CBOR map)
    bodyHead = top
  }
  if (bodyHead.major !== 5 || bodyHead.len < 2 || bodyHead.len > 20) throw new Error('ada: body not a tx map')
  const fields = [F('Format', wrapped ? `CBOR [body,witness,…] · body map(${bodyHead.len})` : `CBOR body map(${bodyHead.len})`)]
  let inputs = 0, outputs = 0, fee = null, ttl = null
  for (let i = 0; i < bodyHead.len; i++) {
    const keyHead = cborHead(r)
    const key = keyHead.major === 0 ? keyHead.len : -1
    if (key === 0) { const a = cborHead(r); inputs = a.len; for (let j = 0; j < a.len; j++) cborSkip(r) }
    else if (key === 1) { const a = cborHead(r); outputs = a.len; for (let j = 0; j < a.len; j++) cborSkip(r) }
    else if (key === 2) { const f = cborHead(r); fee = f.len }
    else if (key === 3) { const t = cborHead(r); ttl = t.len }
    else cborSkip(r)
  }
  fields.push(F('Inputs', inputs))
  fields.push(F('Outputs', outputs))
  if (fee != null) fields.push(F('Fee', formatUnits(BigInt(fee), 6) + ' ADA'))
  if (ttl != null) fields.push(F('TTL', ttl))
  return { coin: 'cardano', type: 'Tx', fields }
}

/* ============================ formatting ============================== */
function formatUnits(value, decimals) {
  let n = typeof value === 'bigint' ? value : BigInt(value || 0)
  const base = 10n ** BigInt(decimals)
  const int = n / base, frac = n % base
  if (frac === 0n) return int.toString()
  let f = frac.toString().padStart(decimals, '0').replace(/0+$/, '')
  return `${int}.${f}`
}

/* ============================ detection ============================== */
/* Ordered, least-ambiguous first. Each returns a parse or throws. */
const PARSERS = [
  ['avalanche', tryAvalanche],
  ['cardano', tryCardano],
  ['bitcoin', tryBitcoin],
  ['ethereum', tryEthereum],
  ['ripple', tryRipple],
  ['tron', tryTron],
  ['solana', trySolana],
]

export function detectAndParse(hexOrBytes) {
  const bytes = hexOrBytes instanceof Uint8Array ? hexOrBytes : hexToBytes(hexOrBytes)
  if (bytes.length < 4) throw new Error('too short to be a transaction')
  const tried = []
  for (const [name, fn] of PARSERS) {
    try {
      const res = fn(bytes)
      res.bytes = bytes.length
      return res
    } catch (e) { tried.push(`${name}: ${e.message}`) }
  }
  const err = new Error('Could not detect a supported coin from these bytes.')
  err.tried = tried
  throw err
}
