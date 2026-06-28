import { useMemo, useState } from 'react'
import { decodeCbor, aiExplain } from './cbor/cbor.js'
import './cbor/cbor.css'

/* ============================================================================
 *  CBOR Decoder (Cardano) - decode any CBOR hex into a readable tree, with a
 *  per-byte header breakdown and an explainer of how CBOR is calculated.
 * ========================================================================== */
const SAMPLES = [
  { label: 'Cardano tx body (inputs/outputs/fee)', hex: 'a3008182582000000000000000000000000000000000000000000000000000000000000000000001818258390000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001a004c4b40021a0002a32d' },
  { label: 'array [1, [2,3], [4,5]]', hex: '8301820203820405' },
  { label: 'map {1:2, 3:4}', hex: 'a201020304' },
  { label: 'tagged datetime', hex: 'c074323031332d30332d32315432303a30343a30305a' },
]

export default function CborTool() {
  const [input, setInput] = useState(SAMPLES[0].hex)
  const [showHelp, setShowHelp] = useState(true)

  const result = useMemo(() => {
    if (!input.trim()) return null
    try { return { ok: true, r: decodeCbor(input) } } catch (e) { return { ok: false, error: e.message } }
  }, [input])

  return (
    <div className="cb">
      <div className="cb-bg" />
      <div className="cb-card">
        <h2 className="cb-title">CBOR Decoder · Cardano</h2>
        <p className="cb-sub">
          Cardano serializes everything - transaction bodies, witness sets, metadata, Plutus data -
          as <b>CBOR</b> (RFC 8949). Paste CBOR hex to decode it into a typed tree and see exactly how
          each byte is read.
        </p>

        <button className="cb-help-toggle" type="button" onClick={() => setShowHelp((v) => !v)}>
          {showHelp ? '▾' : '▸'} How CBOR is calculated
        </button>
        {showHelp && <Explainer />}

        <label className="cb-field">
          <span className="cb-label">CBOR <em>· hex</em></span>
          <textarea className="cb-mono" rows={4} spellCheck={false} value={input}
            onChange={(e) => setInput(e.target.value)} placeholder="paste CBOR bytes in hex, e.g. a201020304" />
        </label>

        <div className="cb-samples">
          {SAMPLES.map((s) => (
            <button key={s.label} type="button" className="cb-sample" onClick={() => setInput(s.hex)}>{s.label}</button>
          ))}
        </div>

        {result && (result.ok ? (
          <>
            <div className="cb-section-title">Decoded structure</div>
            <div className="cb-tree"><Node node={result.r.root} /></div>
            <div className="cb-meta">
              {result.r.consumed} byte{result.r.consumed === 1 ? '' : 's'} decoded
              {result.r.trailing > 0 && <span className="cb-trailing"> · ⚠ {result.r.trailing} trailing byte{result.r.trailing === 1 ? '' : 's'} ignored</span>}
              {result.r.trailing === 0 && <span> · clean ✓</span>}
            </div>
          </>
        ) : <div className="cb-err">⚠ {result.error}</div>)}
      </div>
    </div>
  )
}

function Node({ node }) {
  const header = (
    <span className="cb-hdr" title={`major ${node.major} (${node.majorName}), additional info ${node.ai}: ${aiExplain(node.ai)}`}>
      <span className="cb-hdr-byte mono">{node.headerHex}</span>
      <span className="cb-hdr-major">{node.majorName}</span>
    </span>
  )

  if (node.type === 'array') {
    return (
      <div className="cb-node cb-array">
        <div className="cb-node-head">{header}<span className="cb-tag arr">array · {node.count}{node.indefinite ? ' · indefinite' : ''}</span></div>
        <div className="cb-children">{node.items.map((c) => <Node key={c.id} node={c} />)}</div>
      </div>
    )
  }
  if (node.type === 'map') {
    return (
      <div className="cb-node cb-map">
        <div className="cb-node-head">{header}<span className="cb-tag map">map · {node.count} pair{node.count === 1 ? '' : 's'}{node.indefinite ? ' · indefinite' : ''}</span></div>
        <div className="cb-children">
          {node.pairs.map(([k, v], i) => (
            <div className="cb-pair" key={i}>
              <div className="cb-pair-key"><span className="cb-pair-label">key</span><Node node={k} /></div>
              <div className="cb-pair-val"><span className="cb-pair-label">val</span><Node node={v} /></div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (node.type === 'tag') {
    return (
      <div className="cb-node cb-tagnode">
        <div className="cb-node-head">{header}<span className="cb-tag tag">tag {node.tag.toString()}</span></div>
        <div className="cb-children"><Node node={node.item} /></div>
      </div>
    )
  }

  // leaf
  let cls = 'cb-leaf', val = node.render, ascii = null
  if (node.type === 'bytes') { cls += ' bytes'; ascii = asciiHint(node.value) }
  else if (node.type === 'text') cls += ' text'
  else if (node.type === 'uint' || node.type === 'negint') cls += ' num'
  else if (node.type === 'simple') cls += ' simple'
  else if (node.type === 'float') cls += ' float'

  return (
    <div className={'cb-node ' + cls}>
      <div className="cb-leaf-row">
        {header}
        <span className="cb-leaf-tag">{leafLabel(node)}</span>
        <span className="cb-leaf-val mono">{val}</span>
        {ascii && <span className="cb-leaf-ascii">“{ascii}”</span>}
      </div>
    </div>
  )
}

function leafLabel(n) {
  if (n.type === 'uint') return 'uint'
  if (n.type === 'negint') return 'negint'
  if (n.type === 'bytes') return `bytes · ${n.bytes}B`
  if (n.type === 'text') return `text · ${n.bytes}B`
  if (n.type === 'float') return `float${n.bits}`
  if (n.type === 'simple') return 'simple'
  return n.type
}
function asciiHint(bytes) {
  if (!bytes || bytes.length === 0 || bytes.length > 40) return null
  let s = ''
  for (const c of bytes) { if (c < 0x20 || c > 0x7e) return null; s += String.fromCharCode(c) }
  return s.length >= 2 ? s : null
}

function Explainer() {
  return (
    <div className="cb-help">
      <p>
        CBOR packs data into bytes. <b>Every item starts with one "initial byte"</b> whose
        high 3 bits are the <b>major type</b> and low 5 bits are the <b>additional info</b> (the argument,
        or how to read it):
      </p>
      <table className="cb-help-table">
        <thead><tr><th>Major</th><th>Type</th><th>Argument means</th></tr></thead>
        <tbody>
          <tr><td>0</td><td>unsigned int</td><td>the value</td></tr>
          <tr><td>1</td><td>negative int</td><td>value = −1 − arg</td></tr>
          <tr><td>2</td><td>byte string</td><td>length, then that many bytes</td></tr>
          <tr><td>3</td><td>text string</td><td>length, then UTF-8 bytes</td></tr>
          <tr><td>4</td><td>array</td><td>item count</td></tr>
          <tr><td>5</td><td>map</td><td>pair count (key+value each)</td></tr>
          <tr><td>6</td><td>tag</td><td>tag number, then 1 tagged item</td></tr>
          <tr><td>7</td><td>simple / float</td><td>20=false 21=true 22=null; 25/26/27=float16/32/64</td></tr>
        </tbody>
      </table>
      <p className="cb-help-ai">
        The 5-bit <b>additional info</b> says where the argument is: <code>0–23</code> = the value itself;
        <code>24</code> = next 1 byte; <code>25</code> = next 2; <code>26</code> = next 4; <code>27</code> = next 8
        (all big-endian); <code>31</code> = indefinite length (items until a <code>0xFF</code> break).
      </p>
      <p className="cb-help-ex">
        <b>Example.</b> <code>0x18 1a</code>: <code>0x18</code> = 000 11000 → major 0 (uint), additional info 24 →
        "argument is the next 1 byte", which is <code>0x1a</code> = 26. So it decodes to the integer <b>26</b>.
        A Cardano tx body is just major 5 (a map) whose integer keys (0=inputs, 1=outputs, 2=fee, 3=ttl, …)
        map to arrays and ints encoded the same way.
      </p>
    </div>
  )
}
