/* ============================================================================
 *  TEST-RECORD GENERATOR — pure APDU + test-record builder
 * ----------------------------------------------------------------------------
 *  No dependencies. Given a coin codec entry (coins.js), an unsigned-transaction
 *  hex string and a BIP32 path, produces the  { log_txt, cmds:[...] }  object
 *  that drops straight into a (Coin)_test_profile.json  "test_cases" array.
 *
 *  Path encoding (uniform across every coin):
 *      depth(1 byte) ‖ step×depth   — each step a 4-byte big-endian uint,
 *      hardened steps OR'd with 0x80000000.
 *  Verified against derivation_path_reformat() in every *_apdu_handlers.c.
 * ========================================================================== */

const FIRST_HARDENED = 0x80000000

/* ---- hex helpers ---- */
export function normalizeHex(s) {
  if (s == null) return ''
  const h = String(s).replace(/0x/gi, '').replace(/[\s,:_-]/g, '')
  if (!/^[0-9a-fA-F]*$/.test(h)) throw new Error('input contains non-hex characters')
  if (h.length % 2 !== 0) throw new Error('hex has an odd number of nibbles')
  return h.toLowerCase()
}

function u8(n) {
  return (n & 0xff).toString(16).padStart(2, '0')
}
function u16be(n) {
  if (n < 0 || n > 0xffff) throw new Error(`length ${n} does not fit in a u16`)
  return n.toString(16).padStart(4, '0')
}
function u32be(n) {
  return (n >>> 0).toString(16).padStart(8, '0')
}
/* 8-byte little-endian — Bitcoin SIGN-input UTXO amount (satoshis). */
function u64le(value) {
  let n = BigInt(value)
  if (n < 0n) throw new Error('amount cannot be negative')
  if (n > 0xffffffffffffffffn) throw new Error('amount exceeds 64 bits')
  return n.toString(16).padStart(16, '0').match(/../g).reverse().join('')
}
function u64be64(value) {
  let n = BigInt(value)
  if (n < 0n) throw new Error('amount cannot be negative')
  if (n > 0xffffffffffffffffn) throw new Error('amount exceeds 64 bits')
  return n.toString(16).padStart(16, '0')
}
const byteLen = (hex) => hex.length / 2

/* ---- BIP32 path -> { depth, hex } ----
 * Accepts  m/44'/60'/0'/0/0  | 44'/60'/0'/0/0  | with h / H instead of '.
 */
export function encodePath(pathStr) {
  const raw = String(pathStr || '').trim()
  if (!raw) throw new Error('signing path is empty')
  const parts = raw
    .replace(/^m\//i, '')
    .replace(/^m$/i, '')
    .split('/')
    .filter((p) => p.length > 0)
  if (parts.length === 0) throw new Error('signing path has no steps')
  if (parts.length > 10) throw new Error('signing path has too many steps (max 10)')

  let hex = ''
  for (const part of parts) {
    const hardened = /['hH]$/.test(part)
    const numStr = part.replace(/['hH]$/, '')
    if (!/^\d+$/.test(numStr)) throw new Error(`invalid path step "${part}"`)
    let v = Number(numStr)
    if (v >= FIRST_HARDENED) throw new Error(`path step "${part}" is out of range`)
    if (hardened) v = (v + FIRST_HARDENED) >>> 0
    hex += u32be(v)
  }
  return { depth: parts.length, hex }
}

/* ---- wrap the raw tx + path into the data field per coin layout ---- */
export function buildTxData(coin, txHex, pathStr) {
  const tx = normalizeHex(txHex)
  if (!tx) throw new Error('unsigned transaction is empty')
  const { depth, hex: pathHex } = encodePath(pathStr)
  const depthByte = u8(depth)

  if (coin.txLayout === 'len16') {
    return u16be(byteLen(tx)) + tx + depthByte + pathHex
  }
  // 'raw'
  return tx + depthByte + pathHex
}

/* ---- frame one APDU: header + Lc + data ---- */
export function frame(coin, ins, p1, p2, dataHex = '') {
  const data = dataHex || ''
  const head = coin.cla + ins + p1 + p2
  if (!data) {
    // empty command (confirm / sign): no Lc, matches existing profile records
    return (head).toLowerCase()
  }
  const len = byteLen(data)
  if (coin.header === 'sol' || coin.header === 'avax') {
    // CLA INS P1 P2 00 ‖ u16(BE) total-length ‖ data
    return (head + '00' + u16be(len) + data).toLowerCase()
  }
  // 'short' header: single-byte Lc when it fits, otherwise the device's
  // extended-length form  00 ‖ u16(BE)  (the 0x00 marker tells the APDU layer a
  // 2-byte length follows). This is what the wallet sends for large token-info
  // chunks, e.g. Tron 05 05 / Ethereum 01 08.
  if (len > 0xff) {
    return (head + '00' + u16be(len) + data).toLowerCase()
  }
  return (head + u8(len) + data).toLowerCase()
}

/* ---- build a full test record { log_txt, cmds } ----
 * opts: { mode: 'normal'|'token', txHex, path, tokenChunkHex, logLabel }
 */
export function buildRecord(coin, opts) {
  const mode = opts.mode === 'token' ? 'token' : 'normal'
  if (mode === 'token' && !coin.tokenSupported) {
    throw new Error(`${coin.name} does not support a token flow`)
  }

  const flow = mode === 'token' ? coin.tokenFlow : coin.txFlow
  const dataHex = buildTxData(coin, opts.txHex, opts.path)
  const tokenChunk = opts.tokenChunkHex ? normalizeHex(opts.tokenChunkHex) : ''

  const cmds = []
  for (const step of flow) {
    if (step.role === 'tokenInfo') {
      if (!tokenChunk) {
        // user did not supply the certificate chunk — emit a placeholder note
        cmds.push({
          apdu: '',
          expected_resp_code: '9000',
          _note:
            'Paste the host-signed token info chunk (certificate ‖ version ‖ tokenType ‖ tokenId ‖ address ‖ dataLen ‖ data ‖ signature) here; it cannot be derived from the unsigned tx alone.',
        })
      } else {
        cmds.push({ apdu: frame(coin, step.ins, step.p1, step.p2, tokenChunk), expected_resp_code: '9000' })
      }
      continue
    }
    if (step.role === 'tx') {
      cmds.push({ apdu: frame(coin, step.ins, step.p1, step.p2, dataHex), expected_resp_code: '9000' })
      continue
    }
    if (step.role === 'sign') {
      cmds.push({
        apdu: frame(coin, step.ins, step.p1, step.p2),
        expected_resp_code: '9000',
        skip_compare_resp: true,
        delay_ms: coin.signDelayMs,
      })
      continue
    }
    // confirm
    cmds.push({ apdu: frame(coin, step.ins, step.p1, step.p2), expected_resp_code: '9000' })
  }

  const label =
    opts.logLabel && opts.logLabel.trim()
      ? opts.logLabel.trim()
      : mode === 'token'
      ? 'Token transaction'
      : 'Transaction'

  return { log_txt: [label], cmds }
}

/* ---- optional get-address / get-pubkey records (same path encoding) ---- */
export function buildGetAddressRecord(coin, pathStr, { showToUser = true, addrType = '01' } = {}) {
  const { depth, hex: pathHex } = encodePath(pathStr)
  const data = u8(depth) + pathHex + addrType + (showToUser ? '01' : '00')
  return {
    log_txt: [`Get Address for path ${pathStr} `],
    cmds: [{ apdu: frame(coin, '04', '00', '00', data), expected_resp_code: '9000', delay_ms: 1600 }],
  }
}

/* ============================================================================
 *  UTXO sign-transaction record builder (Bitcoin / Cardano / Avalanche)
 * ----------------------------------------------------------------------------
 *  opts:
 *    currentTxHex : the unsigned current transaction (raw serialized bytes)
 *    inputs       : [{ path, prevTxHex?, scriptPubKeyHex?, amount?, utxoIndex? }]
 *                   - Bitcoin  : path + prevTxHex + scriptPubKeyHex + amount(+utxoIndex)
 *                   - Cardano  : path + prevTxHex + utxoIndex
 *                   - Avalanche: path only
 *    changePath   : single change / internal-output BIP32 path (optional)
 *    changeIndex  : output index for the change output (default 1; Cardano/AVAX use it)
 *    sigHash      : sighash hex (Bitcoin only; default coin.utxo.defaultSigHash)
 *    outputCount  : total outputs in the current tx (for the START metadata)
 *    logLabel     : optional log_txt label
 *  Emits an ARRAY of records (START, [CONT...], REQUEST, [SIGN...], FINISH),
 *  one per log step — matching how the profiles split the flow into test cases.
 * ========================================================================== */
export function buildUtxoRecord(coin, opts) {
  const u = coin.utxo
  if (!u) throw new Error(`${coin.name} is not a UTXO coin`)

  const currentTx = normalizeHex(opts.currentTxHex)
  if (!currentTx) throw new Error('current (unsigned) transaction is empty')

  const inputs = Array.isArray(opts.inputs) ? opts.inputs : []
  if (inputs.length === 0) throw new Error('at least one input is required')
  if (inputs.length > 64) throw new Error('too many inputs (max 64)')

  // ---- change / internal-output path (the user said: should be ONE) ----
  const hasChange = !!(opts.changePath && opts.changePath.trim())
  const changeIndex = Number.isInteger(opts.changeIndex) ? opts.changeIndex : 1

  // total outputs: user-provided count, else (change ? 2 : 1) as a sane default
  const outputCount = Number.isInteger(opts.outputCount)
    ? opts.outputCount
    : hasChange
    ? 2
    : 1

  const records = []
  const label = (opts.logLabel && opts.logLabel.trim()) || 'Transaction'

  /* ---------------- START ---------------- */
  let startData = u32be(byteLen(currentTx)) // total tx length, u32 BE
  startData += u8(inputs.length) // input count
  startData += u8(outputCount) // output count

  if (u.inMaskBytes > 0) {
    // internal-inputs bitmask: every input we hold (all of them here) -> low bits set.
    // Bitcoin reads it as a byte array (LSB-first per byte); Cardano reads GETU64B
    // (big-endian u64). Pick the matching encoding.
    startData += u.maskStyle === 'u64be'
      ? mask64be(inputs.map((_, i) => i))
      : maskHex(inputs.map((_, i) => i), u.inMaskBytes)
  }

  if (u.outMaskBytes > 0) {
    // Bitcoin: 32-byte internal-outputs mask, then per-output depth‖steps (no idx)
    const outBits = hasChange ? [changeIndex] : []
    startData += maskHex(outBits, u.outMaskBytes)
    if (hasChange) {
      const { depth, hex } = encodePath(opts.changePath)
      startData += u8(depth) + hex
    }
  } else {
    // Cardano / Avalanche: internal-output COUNT, then per-output idx‖depth‖steps
    startData += u8(hasChange ? 1 : 0)
    if (hasChange) {
      const { depth, hex } = encodePath(opts.changePath)
      startData += u8(changeIndex) + u8(depth) + hex
    }
  }

  // chunk: Avalanche carries the raw tx with no inner chunk-length prefix;
  // Bitcoin/Cardano prefix the chunk with its u16 length.
  if (u.startNoChunkPrefix) {
    startData += currentTx
  } else {
    startData += u16be(byteLen(currentTx)) + currentTx
  }
  // START framing: Avalanche uses an extended-length header (00 ‖ u16 len) with
  // P2 = chunk index; everyone else uses the coin default short Lc.
  const startApdu = u.startExtendedLen
    ? (coin.cla + u.ins.start + '00' + '00' + '00' + u16be(byteLen(startData)) + startData).toLowerCase()
    : frame(coin, u.ins.start, '00', '00', startData)
  records.push({
    log_txt: [`START SIGN DATA — ${label}`],
    cmds: [{ apdu: startApdu, expected_resp_code: '9000' }],
  })

  /* ---------------- CONT (one per input that supplies a previous tx) ----------------
   * Bitcoin always carries prevTx; Cardano carries it only when the device needs
   * the UTXO to be validated. An input without prevTx simply skips its CONT. */
  if (u.hasContPrevTx) {
    inputs.forEach((inp, i) => {
      const prevTx = inp.prevTxHex ? normalizeHex(inp.prevTxHex) : ''
      if (!prevTx) {
        if (u.inputNeeds.includes('prevTx') && coin.id === 'bitcoin') {
          throw new Error(`input ${i}: previous transaction (prevTx) is required`)
        }
        return // no prevTx for this input -> no CONT command
      }
      const utxoIndex = Number.isInteger(inp.utxoIndex) ? inp.utxoIndex : 0
      let d = u32be(i) + u32be(utxoIndex) + u32be(byteLen(prevTx))
      d += u16be(byteLen(prevTx)) + prevTx
      records.push({
        log_txt: [`CONT SIGN DATA — input ${i}`],
        cmds: [{ apdu: frame(coin, u.ins.cont, '00', '00', d), expected_resp_code: '9000' }],
      })
    })
  }

  /* ---------------- REQUEST ---------------- */
  records.push({
    log_txt: [`REQUEST SIGN — ${label}`],
    cmds: [{ apdu: frame(coin, u.ins.request, '00', '00'), expected_resp_code: '9000' }],
  })

  /* ---------------- SIGN (one per input) ---------------- */
  inputs.forEach((inp, i) => {
    const { depth, hex: pathHex } = encodePath(inp.path)
    let d
    if (u.signHasScriptAmount) {
      // Bitcoin: sighash ‖ inIdx ‖ lockLen(u16) ‖ script ‖ amount(8 LE) ‖ depth ‖ path ‖ txLen ‖ chunkLen ‖ tx
      const script = normalizeHex(inp.scriptPubKeyHex)
      if (!script) throw new Error(`input ${i}: scriptPubKey is required`)
      if (inp.amount === undefined || inp.amount === null || inp.amount === '')
        throw new Error(`input ${i}: amount (satoshis) is required`)
      const sigHash = (opts.sigHash && normalizeHex(opts.sigHash)) || u.defaultSigHash || '00000000'
      d = sigHash + u32be(i) + u16be(byteLen(script)) + script
      d += (u.amountEndian === 'le' ? u64le(inp.amount) : u64be64(inp.amount))
      d += u8(depth) + pathHex
      d += u32be(byteLen(currentTx)) + u16be(byteLen(currentTx)) + currentTx
    } else {
      // Cardano / Avalanche: idx(1) ‖ depth(1) ‖ path
      d = u8(i) + u8(depth) + pathHex
    }
    records.push({
      log_txt: [`SIGN — input ${i}`],
      cmds: [{ apdu: frame(coin, u.ins.sign, '00', '00', d), expected_resp_code: '9000' }],
    })
  })

  /* ---------------- FINISH ---------------- */
  records.push({
    log_txt: [`FINISH SIGN — ${label}`],
    cmds: [{ apdu: frame(coin, u.ins.finish, '00', '00'), expected_resp_code: '9000' }],
  })

  return records
}

/* build a little-/big-endian-agnostic byte bitmask: set the given bit indices,
 * emit `bytes` bytes. Bit i lives in byte (i>>3), LSB-first within the byte —
 * matching the device's TWI_COUNT_BITS over a byte array. */
function maskHex(bitIndices, bytes) {
  const arr = new Array(bytes).fill(0)
  for (const i of bitIndices) {
    if (i < 0 || i >= bytes * 8) throw new Error(`mask bit ${i} out of range`)
    arr[i >> 3] |= 1 << (i & 7)
  }
  return arr.map((b) => u8(b)).join('')
}

/* 8-byte big-endian bitmask (Cardano reads this with GETU64B). */
function mask64be(bitIndices) {
  let n = 0n
  for (const i of bitIndices) {
    if (i < 0 || i >= 64) throw new Error(`mask bit ${i} out of range`)
    n |= 1n << BigInt(i)
  }
  return n.toString(16).padStart(16, '0')
}


/* ---- pretty-print a record the way the profiles are formatted ---- */
export function recordToJson(record, indent = 4) {
  // strip private _note fields before emitting JSON
  const clean = {
    log_txt: record.log_txt,
    cmds: record.cmds.map((c) => {
      const { _note, ...rest } = c
      return rest
    }),
  }
  return JSON.stringify(clean, null, indent)
}
