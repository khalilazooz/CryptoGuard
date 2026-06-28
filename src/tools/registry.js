import { lazy } from 'react'

/* ============================================================================
 *  TOOL REGISTRY  —  the ONE place you edit to add a tool.
 * ----------------------------------------------------------------------------
 *  To add a tool:
 *    1. Create  src/tools/<YourTool>.jsx  exporting a default React component.
 *    2. Append one entry to the TOOLS array below.
 *  The sidebar, routing, search, and category grouping update automatically.
 *
 *  Entry shape:
 *  {
 *    id:          'coin-parser',          // URL slug, must be unique
 *    name:        'Coin Parser',          // sidebar label
 *    description: 'One-line summary.',     // shown in the right panel header
 *    category:    'Parsing',              // groups items in the sidebar
 *    icon:        '🪙',                    // emoji or short text
 *    status:      'ready',                // 'ready' | 'soon' | 'idea'
 *    accent:      '#2563eb',              // optional per-tool accent color
 *    component:   lazy(() => import('./CoinParser.jsx')),  // omit if not ready
 *  }
 *
 *  status:
 *    ready -> selectable, renders its component
 *    soon  -> visible in sidebar, shows a "coming soon" stub when opened
 *    idea  -> visible in sidebar (dimmed), shows a "backlog" stub when opened
 * ========================================================================== */

export const TOOLS = [
  {
    id: 'ux-designer',
    name: 'UX Designer',
    description: 'Lay out, drag, and preview on-device screens, then generate the C context function.',
    category: 'Design',
    icon: '🎨',
    status: 'ready',
    accent: '#7c3aed',
    component: lazy(() => import('./UXDesigner.jsx')),
  },
  {
    id: 'flow-designer',
    name: 'Flow Designer',
    description: 'Wire saved screens into a navigable flow, run it live in one device, and generate twi_<coin>_ux.c + a per-coin .fig.',
    category: 'Design',
    icon: '🧭',
    status: 'ready',
    accent: '#7c3aed',
    component: lazy(() => import('./FlowDesigner.jsx')),
  },
  {
    id: "test-record-gen",
    name: "Test Record Generator",
    description: "Turn an unsigned transaction + signing path into a JSON test record for (Coin)/test/(Coin)_test_profile.json. Account-based coins: ETH, SOL, XRP, TRON.",
    category: "Testing",
    icon: "🧪",
    status: "ready",
    accent: "#0ea5e9",
    component: lazy(() => import("./TestRecordGen.jsx")),
  },
  {
    id: "ecdsa-tool",
    name: "EC Sign & Verify",
    description: "Multi-curve sign/verify: secp256k1 (ECDSA + Schnorr/BIP-340), secp256r1/P-256, P-384, P-521, and Ed25519. Public key auto-derives (uncompressed); compact / compact+v / DER with format auto-detection.",
    category: "Crypto",
    icon: "🔑",
    status: "ready",
    accent: "#0ea5e9",
    component: lazy(() => import("./EcdsaTool.jsx")),
  },
  {
    id: "hash-tool",
    name: "Hashing",
    description: "Hash any input across the full libbtc / trezor-crypto set: SHA-1/2/3, Keccak, RIPEMD-160, BLAKE / BLAKE2 / BLAKE3, MD5, device composites (HASH160, double-SHA256), plus HMAC and PBKDF2.",
    category: "Crypto",
    icon: "#️⃣",
    status: "ready",
    accent: "#10b981",
    component: lazy(() => import("./HashTool.jsx")),
  },
  {
    id: "base58-tool",
    name: "Base58 ⇄ Hex",
    description: "Convert between hex and Base58, with optional Base58Check (double-SHA256 checksum) — used for Bitcoin-style addresses and extended keys. Both directions, with checksum validation on decode.",
    category: "Crypto",
    icon: "🔤",
    status: "ready",
    accent: "#f59e0b",
    component: lazy(() => import("./Base58Tool.jsx")),
  },
  {
    id: "base64-tool",
    name: "Base64 ⇄ Hex",
    description: "Convert between hex and Base64 — standard (padded, + /) or Base64URL (URL-safe - _, no padding). Both directions; decode accepts either alphabet, padded or not.",
    category: "Crypto",
    icon: "🔡",
    status: "ready",
    accent: "#8b5cf6",
    component: lazy(() => import("./Base64Tool.jsx")),
  },
  {
    id: "coin-parser",
    name: "Coin Parser",
    description: "Paste any raw transaction; auto-detect the coin from its format and decode the key fields. Supports Bitcoin, Cardano, Avalanche, Ethereum, Solana, Ripple, Tron.",
    category: "Parsing",
    icon: "🪙",
    status: "ready",
    accent: "#2563eb",
    component: lazy(() => import("./CoinParser.jsx")),
  },
  {
    id: "apdu-parser",
    name: "APDU Parser",
    description: "Decode any APDU into generic ISO-7816 fields (CLA/INS/P1/P2/Lc/Data/Le/SW), then resolve the TWI CryptoGuard command, its class, and a per-command data breakdown — driven by the full TWI APDU spec.",
    category: "Parsing",
    icon: "🔬",
    status: "ready",
    accent: "#2563eb",
    component: lazy(() => import("./ApduParser.jsx")),
  },
  {
    id: "rlp-tool",
    name: "RLP Encoder / Decoder",
    description: "Encode and decode Ethereum RLP (Recursive Length Prefix) — strings, numbers, hex and nested lists — with a built-in explainer of how RLP works and how transactions are built from it.",
    category: "Crypto",
    icon: "🧬",
    status: "ready",
    accent: "#6366f1",
    component: lazy(() => import("./RlpTool.jsx")),
  },
  {
    id: "protobuf-parser",
    name: "Protobuf Parser",
    description: "Decode Protocol Buffers wire bytes against a .proto schema (Tron.proto loaded by default). Pick the root message; fields are named & typed, with google.protobuf.Any decoded recursively. Includes a how-protobuf-works explainer.",
    category: "Parsing",
    icon: "🧩",
    status: "ready",
    accent: "#2563eb",
    component: lazy(() => import("./ProtobufParser.jsx")),
  },
  {
    id: "varint-tool",
    name: "Varint Calculator",
    description: "Encode/decode variable-length integers in two schemes and compare them: Bitcoin CompactSize (1/3/5/9-byte little-endian tagged) and Protobuf base-128 varint (7-bit groups + continuation bit; two's-complement int and ZigZag sint). Includes a per-byte breakdown and an explainer of how the two differ.",
    category: "Crypto",
    icon: "🔢",
    status: "ready",
    accent: "#0d9488",
    component: lazy(() => import("./VarintTool.jsx")),
  },
  {
    id: "compact-u16-tool",
    name: "Compact-u16 Calculator",
    description: "Encode/decode Solana's compact-u16 (ShortVec) length prefix - the base-128 varint, capped at u16 (1-3 bytes), used for every array count in a Solana transaction. Per-byte breakdown, size-tier table, canonical-form check, and a step-by-step explainer of how it's computed.",
    category: "Crypto",
    icon: "📏",
    status: "ready",
    accent: "#14a89b",
    component: lazy(() => import("./CompactU16Tool.jsx")),
  },
  {
    id: "cbor-tool",
    name: "CBOR Decoder",
    description: "Decode CBOR (RFC 8949) hex into a typed tree - the format Cardano uses for transaction bodies, witness sets, metadata and Plutus data. Shows the major-type/additional-info breakdown of each initial byte, handles ints/bytes/text/arrays/maps/tags/floats and indefinite-length items, and explains how CBOR is calculated.",
    category: "Parsing",
    icon: "📦",
    status: "ready",
    accent: "#0b6efd",
    component: lazy(() => import("./CborTool.jsx")),
  },
  /* ─── append new tools below this line ─── */
]

// Preferred sidebar ordering; unknown categories fall in after these (sorted).
export const CATEGORY_ORDER = ['Design', 'Parsing', 'Testing', 'Crypto']

export const STATUS_META = {
  ready: { label: 'Ready', cls: 'ready' },
  soon:  { label: 'Soon', cls: 'soon' },
  idea:  { label: 'Backlog', cls: 'idea' },
}

export function getTool(id) {
  return TOOLS.find((t) => t.id === id)
}

export function groupedTools() {
  const groups = {}
  for (const t of TOOLS) (groups[t.category] ||= []).push(t)
  const known = CATEGORY_ORDER.filter((c) => groups[c])
  const extra = Object.keys(groups)
    .filter((c) => !CATEGORY_ORDER.includes(c))
    .sort()
  return [...known, ...extra].map((c) => ({ category: c, items: groups[c] }))
}
