/* ============================================================================
 *  TEST-RECORD GENERATOR — per-coin codec table
 * ----------------------------------------------------------------------------
 *  Single source of truth for how each coin frames its sign-transaction APDUs.
 *  Adding a coin = append one entry here. Everything in apdu.js + the UI is
 *  driven from this table.
 *
 *  The framing was reverse-engineered from, and verified byte-for-byte against,
 *  each coin's  (Coin)/test/(Coin)_test_profile.json  and the matching
 *  *_apdu_handlers.c  CMD_LEN macros.
 *
 *  Field reference (ACCOUNT coins)
 *  -------------------------------
 *  cla            : APDU class byte (hex string, 2 chars).
 *  txLayout       : how the data field wraps the raw unsigned-tx bytes
 *                     'len16' -> u16(BE) txLen ‖ tx ‖ depth ‖ steps   (ETH, SOL)
 *                     'raw'   -> tx ‖ depth ‖ steps                    (XRP, TRON)
 *  header         : APDU header style
 *                     'short' -> CLA INS P1 P2  Lc(1 byte)            (ETH, XRP, TRON)
 *                     'sol'   -> CLA INS P1 P2  00  len(u16 BE)        (SOLANA, AVAX)
 *  txFlow         : ordered list of {ins,p1,p2,role} commands for a NORMAL tx.
 *                   role 'tx' carries the data; 'confirm'/'sign' are empty.
 *                   The last command (sign) gets skip_compare_resp + delay_ms.
 *  tokenSupported : whether the coin has a token sign flow in its profile.
 *  tokenFlow      : ordered commands for a TOKEN tx. role 'tokenInfo' is the
 *                   leading certificate chunk (supplied verbatim by the user);
 *                   'tx' carries the unsigned tx; then confirm + sign.
 *  signDelayMs    : delay_ms placed on the final sign command.
 *  samplePath     : default BIP32 path shown in the UI for this coin.
 *  brand          : UI theming — gradient endpoints, accent, glyph.
 *
 *  coinType       : 'account' (single tx blob + path, default) or 'utxo'.
 *
 *  UTXO coins (Bitcoin / Cardano / Avalanche)
 *  ------------------------------------------
 *  Carry a `utxo` sub-config (see apdu.js buildUtxoRecord). Verified layouts:
 *
 *  BITCOIN  (cla 00, short header)
 *    START 01 : txlen(u32BE) ‖ inCnt(1) ‖ outCnt(1) ‖ inMask(8B) ‖ outMask(32B)
 *               ‖ [per internal output: depth(1) ‖ steps]  ‖ chunkLen(u16BE) ‖ chunk
 *    CONT  02 : inputIdx(u32BE) ‖ utxoIdx(u32BE) ‖ prevTxLen(u32BE)
 *               ‖ chunkLen(u16BE) ‖ prevtx        (one per input)
 *    REQ   03 : (empty)
 *    SIGN  04 : sighash(u32BE) ‖ inIdx(u32BE) ‖ lockLen(u16BE) ‖ scriptPubKey
 *               ‖ amount(8B LE) ‖ depth(1) ‖ path ‖ txLen(u32BE) ‖ chunkLen(u16BE) ‖ chunk
 *    FIN   05 : (empty)
 *
 *  CARDANO  (cla 04, short header) — like Bitcoin but no scriptPubKey/amount,
 *    and internal-output / sign-input entries carry a 1-byte index:
 *    START 01 : txlen(u32BE) ‖ inCnt(1) ‖ outCnt(1) ‖ inMask(8B)
 *               ‖ intOutCnt(1) ‖ [per internal output: idx(1) ‖ depth(1) ‖ steps]
 *               ‖ chunkLen(u16BE) ‖ chunk
 *    CONT  02 : inputIdx(u32BE) ‖ utxoIdx(u32BE) ‖ prevTxLen(u32BE) ‖ chunkLen(u16BE) ‖ prevtx
 *    REQ   03 : (empty)   SIGN 04 : idx(1) ‖ depth(1) ‖ path   FIN 05 : (empty)
 *
 *  AVALANCHE (cla 06, EXTENDED header 00‖u16; P2 = chunk index) — signs the tx
 *    blob directly, no prev-tx, no scriptPubKey/amount:
 *    START 01 : txlen(u32BE) ‖ inInCnt(1) ‖ inOutCnt(1)
 *               ‖ [per internal output: idx(1) ‖ depth(1) ‖ steps] ‖ chunk
 *    REQ   02 : (empty)   SIGN 03 : idx(1) ‖ depth(1) ‖ path   FIN 04 : (empty)
 * ========================================================================== */

export const COINS = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    coinType: 'account',
    cla: '01',
    txLayout: 'len16',
    header: 'short',
    txFlow: [
      { ins: '01', p1: '00', p2: '00', role: 'tx' },
      { ins: '02', p1: '00', p2: '00', role: 'confirm' },
      { ins: '03', p1: '00', p2: '00', role: 'sign' },
    ],
    tokenSupported: true,
    tokenFlow: [
      { ins: '08', p1: '00', p2: '00', role: 'tokenInfo' },
      { ins: '09', p1: '00', p2: '00', role: 'tx' },
      { ins: '0a', p1: '00', p2: '00', role: 'confirm' },
      { ins: '0b', p1: '00', p2: '00', role: 'sign' },
    ],
    signDelayMs: 4600,
    samplePath: "m/44'/60'/0'/0/0",
    brand: { from: '#2b2f6e', to: '#627eea', accent: '#627eea', glyph: 'Ξ' },
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    coinType: 'account',
    cla: '02',
    txLayout: 'len16',
    header: 'sol',
    txFlow: [
      { ins: '01', p1: '01', p2: '00', role: 'tx' },
      { ins: '02', p1: '00', p2: '00', role: 'confirm' },
      { ins: '05', p1: '00', p2: '00', role: 'sign' },
    ],
    tokenSupported: true,
    tokenFlow: [
      { ins: '06', p1: '00', p2: '00', role: 'tokenInfo' },
      { ins: '07', p1: '01', p2: '00', role: 'tx' },
      { ins: '08', p1: '00', p2: '00', role: 'confirm' },
      { ins: '09', p1: '00', p2: '00', role: 'sign' },
    ],
    signDelayMs: 4600,
    samplePath: "m/44'/501'/0'/2'",
    brand: { from: '#0a2e2a', to: '#9945ff', accent: '#14f195', glyph: '◎' },
  },
  {
    id: 'ripple',
    name: 'Ripple',
    symbol: 'XRP',
    coinType: 'account',
    cla: '03',
    txLayout: 'raw',
    header: 'short',
    txFlow: [
      { ins: '01', p1: '00', p2: '00', role: 'tx' },
      { ins: '02', p1: '00', p2: '00', role: 'confirm' },
      { ins: '03', p1: '00', p2: '00', role: 'sign' },
    ],
    tokenSupported: false,
    tokenFlow: null,
    signDelayMs: 4600,
    samplePath: "m/44'/144'/0'/0/0",
    brand: { from: '#0b0d17', to: '#23292f', accent: '#23a3ff', glyph: '✕' },
  },
  {
    id: 'tron',
    name: 'Tron',
    symbol: 'TRX',
    coinType: 'account',
    cla: '05',
    txLayout: 'raw',
    header: 'short',
    txFlow: [
      { ins: '01', p1: '00', p2: '00', role: 'tx' },
      { ins: '02', p1: '00', p2: '00', role: 'confirm' },
      { ins: '03', p1: '00', p2: '00', role: 'sign' },
    ],
    tokenSupported: true,
    tokenFlow: [
      { ins: '05', p1: '00', p2: '00', role: 'tokenInfo' },
      { ins: '06', p1: '00', p2: '00', role: 'tx' },
      { ins: '07', p1: '00', p2: '00', role: 'confirm' },
      { ins: '08', p1: '00', p2: '00', role: 'sign' },
    ],
    signDelayMs: 4600,
    samplePath: "m/44'/195'/0'/0/0",
    brand: { from: '#2a0a0d', to: '#eb0029', accent: '#ff3b4e', glyph: '⟁' },
  },

  /* ───────────────────────── UTXO-based coins ───────────────────────── */
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    coinType: 'utxo',
    cla: '00',
    header: 'short',
    utxo: {
      // INS map + which fields each input needs
      ins: { start: '01', cont: '02', request: '03', sign: '04', finish: '05' },
      hasContPrevTx: true,    // CONT carries the previous transaction per input
      inputNeeds: ['prevTx', 'scriptPubKey', 'amount', 'path'],
      inMaskBytes: 32,        // internal-inputs mask width (verified from profile)
      maskStyle: "bytes",     // Bitcoin reads inMask as a byte array (LSB-first)
      outMaskBytes: 32,       // internal-outputs mask present in START
      internalOutHasIndex: false, // BTC internal-output entry = depth ‖ steps (no idx byte)
      signHasScriptAmount: true,  // SIGN carries scriptPubKey + amount(LE) + current tx
      defaultSigHash: '00000000',
    },
    signDelayMs: 0,
    samplePath: "m/86'/0'/0'/0/0",
    sampleChangePath: "m/86'/0'/0'/1/0",
    brand: { from: '#5a2d00', to: '#f7931a', accent: '#f7931a', glyph: '₿' },
  },
  {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ADA',
    coinType: 'utxo',
    cla: '04',
    header: 'short',
    utxo: {
      ins: { start: '01', cont: '02', request: '03', sign: '04', finish: '05' },
      hasContPrevTx: true,
      inputNeeds: ["prevTx", "utxoIndex"],   // no scriptPubKey / amount
      inMaskBytes: 8,
      maskStyle: "u64be",        // Cardano reads inMask via GETU64B (big-endian)
      outMaskBytes: 0,            // Cardano START has intOutCnt(1) instead of a 32B mask
      internalOutHasIndex: true,  // entry = idx ‖ depth ‖ steps
      signHasScriptAmount: false, // SIGN = idx(1) ‖ depth(1) ‖ path
      defaultSigHash: null,
    },
    signDelayMs: 0,
    samplePath: "m/1852'/1815'/0'/0/0",
    sampleChangePath: "m/1852'/1815'/0'/1/0",
    brand: { from: '#08183a', to: '#0033ad', accent: '#3468d1', glyph: '₳' },
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    coinType: 'utxo',
    cla: '06',
    header: 'short', // SIGN/REQUEST/FINISH use short Lc; only START is extended-length
    utxo: {
      ins: { start: '01', cont: null, request: '02', sign: '03', finish: '04' },
      hasContPrevTx: false,       // no previous-tx step; START carries the whole tx
      inputNeeds: ['path'],       // only the signing path per internal input
      startExtendedLen: true,     // START header = CLA INS P1 P2 00 ‖ u16(BE) len ; P2 = chunk idx
      startNoChunkPrefix: true,   // START carries the raw tx with no inner u16 chunk-length
      inMaskBytes: 0,             // START uses inInputCnt(1) + inOutputCnt(1), no masks
      outMaskBytes: 0,
      internalOutHasIndex: true,  // entry = idx ‖ depth ‖ steps
      signHasScriptAmount: false, // SIGN = idx(1) ‖ depth(1) ‖ path
      defaultSigHash: null,
    },
    signDelayMs: 0,
    samplePath: "m/44'/9000'/0'/0/0",
    sampleChangePath: "m/44'/9000'/0'/1/0",
    brand: { from: '#3a0a0d', to: '#e84142', accent: '#ff5b5b', glyph: '🔺' },
  },
]

export function getCoin(id) {
  return COINS.find((c) => c.id === id)
}

export const ACCOUNT_COINS = COINS.filter((c) => c.coinType !== 'utxo')
export const UTXO_COINS = COINS.filter((c) => c.coinType === 'utxo')
