import { useMemo, useState } from 'react'
import { rlpEncodeHex, rlpDecode, parseEncodeInput, treeToText } from './rlp/rlp.js'
import './rlp/rlp.css'

/* ============================================================================
 *  RLP Encoder / Decoder — Ethereum's Recursive Length Prefix serialization.
 * ========================================================================== */
export default function RlpTool() {
  const [mode, setMode] = useState('encode') // 'encode' | 'decode'
  const [showHelp, setShowHelp] = useState(true)
  const [copied, setCopied] = useState(false)

  // encode
  const [enc, setEnc] = useState('["cat", "dog"]')
  // decode
  const [dec, setDec] = useState('0xc88363617483646f67')

  const encoded = useMemo(() => {
    if (mode !== 'encode' || !enc.trim()) return null
    try { return { ok: true, hex: rlpEncodeHex(parseEncodeInput(enc)) } }
    catch (e) { return { ok: false, error: e.message } }
  }, [mode, enc])

  const decoded = useMemo(() => {
    if (mode !== 'decode' || !dec.trim()) return null
    try { const tree = rlpDecode(dec); return { ok: true, tree, text: treeToText(tree) } }
    catch (e) { return { ok: false, error: e.message } }
  }, [mode, dec])

  function copy(text) {
    if (!text) return
    navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1300) })
  }

  return (
    <div className="rlp">
      <div className="rlp-bg" />
      <div className="rlp-card">
        <h2 className="rlp-title">RLP · Recursive Length Prefix</h2>
        <p className="rlp-sub">Encode and decode Ethereum’s RLP — the serialization used for transactions, blocks, account state and trie nodes. Everything in Ethereum that’s hashed or stored is RLP first.</p>

        {/* explainer */}
        <button className="rlp-help-toggle" type="button" onClick={() => setShowHelp((v) => !v)}>
          {showHelp ? '▾' : '▸'} How RLP works
        </button>
        {showHelp && <Explainer />}

        {/* mode */}
        <div className="rlp-tabs">
          <button className={mode === 'encode' ? 'on' : ''} onClick={() => setMode('encode')} type="button">Encode</button>
          <button className={mode === 'decode' ? 'on' : ''} onClick={() => setMode('decode')} type="button">Decode</button>
        </div>

        {mode === 'encode' && (
          <>
            <label className="rlp-field">
              <span className="rlp-label">Input <em>· JSON: a string, number, hex, or nested array</em></span>
              <textarea className="rlp-mono" rows={4} spellCheck={false} value={enc} onChange={(e) => setEnc(e.target.value)}
                placeholder='e.g. ["cat", "dog"]  ·  1024  ·  "0xdeadbeef"  ·  [[], [[]], "hi"]' />
              <span className="rlp-foot">Strings → UTF-8 bytes · numbers → minimal big-endian · <code>"0x…"</code> → raw bytes · arrays → lists (nestable).</span>
            </label>
            <div className="rlp-out-head">
              <span className="rlp-label">RLP (hex)</span>
              <button className="rlp-copy" type="button" disabled={!encoded?.ok} onClick={() => copy('0x' + encoded.hex)}>{copied ? 'Copied ✓' : 'Copy'}</button>
            </div>
            {encoded?.ok
              ? <pre className="rlp-out mono">0x{encoded.hex}<span className="rlp-bytes">  ({encoded.hex.length / 2} bytes)</span></pre>
              : encoded && <div className="rlp-err">⚠ {encoded.error}</div>}
          </>
        )}

        {mode === 'decode' && (
          <>
            <label className="rlp-field">
              <span className="rlp-label">RLP (hex)</span>
              <textarea className="rlp-mono" rows={3} spellCheck={false} value={dec} onChange={(e) => setDec(e.target.value)}
                placeholder="paste RLP bytes in hex, e.g. 0xc88363617483646f67" />
            </label>
            {decoded?.ok
              ? <>
                  <div className="rlp-section-title">Decoded structure</div>
                  <pre className="rlp-tree mono">{decoded.text}</pre>
                  <TreeView node={decoded.tree} />
                </>
              : decoded && <div className="rlp-err">⚠ {decoded.error}</div>}
          </>
        )}
      </div>
    </div>
  )
}

/* nested visual tree of the decoded RLP */
function TreeView({ node }) {
  return <div className="rlp-treeview"><Node node={node} /></div>
}
function Node({ node }) {
  if (node.type === 'str') {
    const ascii = asciiOf(node.hex)
    return (
      <div className="rlp-node str">
        <span className="rlp-node-tag">str · {node.bytes}B</span>
        <span className="rlp-node-val mono">0x{node.hex || '(empty)'}</span>
        {ascii && <span className="rlp-node-ascii">“{ascii}”</span>}
        {node.prefix && <span className="rlp-node-prefix">prefix {node.prefix}</span>}
      </div>
    )
  }
  return (
    <div className="rlp-node list">
      <div className="rlp-node-head"><span className="rlp-node-tag list">list · {node.items.length} · {node.bytes}B</span>{node.prefix && <span className="rlp-node-prefix">prefix {node.prefix}</span>}</div>
      <div className="rlp-node-children">{node.items.map((c, i) => <Node key={i} node={c} />)}</div>
    </div>
  )
}
function asciiOf(hex) {
  if (!hex) return ''
  let s = ''
  for (let i = 0; i < hex.length; i += 2) { const c = parseInt(hex.slice(i, i + 2), 16); if (c < 0x20 || c > 0x7e) return ''; s += String.fromCharCode(c) }
  return s.length >= 2 ? s : ''
}

function Explainer() {
  return (
    <div className="rlp-help">
      <p><b>RLP</b> (Recursive Length Prefix) serializes just two things: a <b>byte string</b> and a <b>list</b> of items (which may nest). It encodes <i>structure</i>, not types — numbers, addresses and hashes are first turned into big-endian byte strings, then RLP’d.</p>
      <p className="rlp-help-rules-title">The five rules (first byte tells you which):</p>
      <table className="rlp-rules">
        <thead><tr><th>First byte</th><th>Meaning</th><th>Encoding</th></tr></thead>
        <tbody>
          <tr><td><code>0x00–0x7f</code></td><td>a single byte &lt; 0x80</td><td>the byte itself, no prefix</td></tr>
          <tr><td><code>0x80–0xb7</code></td><td>string, 0–55 bytes</td><td><code>0x80+len</code>, then the bytes</td></tr>
          <tr><td><code>0xb8–0xbf</code></td><td>string, &gt; 55 bytes</td><td><code>0xb7+lenOfLen</code>, BE length, then bytes</td></tr>
          <tr><td><code>0xc0–0xf7</code></td><td>list, payload 0–55 bytes</td><td><code>0xc0+len</code>, then the items’ RLP</td></tr>
          <tr><td><code>0xf8–0xff</code></td><td>list, payload &gt; 55 bytes</td><td><code>0xf7+lenOfLen</code>, BE length, then items</td></tr>
        </tbody>
      </table>
      <p className="rlp-help-ex"><b>Examples.</b> <code>"dog"</code> → <code>0x83 64 6f 67</code> (string of 3 → <code>0x80+3</code> then <code>dog</code>). <code>["cat","dog"]</code> → <code>0xc8 83636174 83646f67</code> (list, 8-byte payload → <code>0xc0+8</code>). Empty string → <code>0x80</code>; empty list → <code>0xc0</code>; the byte <code>0x00</code> stays <code>0x00</code>.</p>
      <p className="rlp-help-note">To build an Ethereum tx you RLP a <i>list</i> of its fields in order — e.g. legacy <code>[nonce, gasPrice, gas, to, value, data, v, r, s]</code> — then keccak-256 the result. Type-prefixed (EIP-2718) txs prepend a type byte (<code>0x02</code> = EIP-1559) before the RLP list.</p>
    </div>
  )
}
