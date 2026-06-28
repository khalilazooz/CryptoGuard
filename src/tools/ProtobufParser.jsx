import { useEffect, useMemo, useState } from 'react'
import { loadProto, decodeSafe } from './protobuf/protobuf.js'
import TRON_PROTO from './protobuf/Tron.proto?raw'
import './protobuf/protobuf.css'

/* the message we default the root selector to, for the bundled Tron schema */
const DEFAULT_ROOT = 'protocol.Transaction.raw'
const SAMPLE_TX = '0a02bb20220805f0a853eb134a3d4090b89ae4e4315a68080112640a2d747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e5472616e73666572436f6e747261637412330a154199dba6501d5fc2da5a68a49a8cfc63b452db509f1215415a9cf0e3610566f672c5d127e1c1d47036a4dbaa18e8eae10270c7e696e4e431'

/* ============================================================================
 *  Protobuf Parser — decode protobuf wire bytes against a .proto schema.
 * ========================================================================== */
export default function ProtobufParser() {
  const [protoText, setProtoText] = useState(TRON_PROTO)
  const [data, setData] = useState(SAMPLE_TX)
  const [rootMsg, setRootMsg] = useState(DEFAULT_ROOT)
  const [showHelp, setShowHelp] = useState(true)
  const [showProto, setShowProto] = useState(false)

  // parse the .proto (debounced via useMemo on text)
  const schema = useMemo(() => {
    if (!protoText.trim()) return { ok: false, error: 'paste a .proto schema' }
    try { return { ok: true, ...loadProto(protoText) } }
    catch (e) { return { ok: false, error: e.message } }
  }, [protoText])

  // keep the selected root valid; default to Transaction.raw when present
  useEffect(() => {
    if (!schema.ok) return
    const names = schema.messages.map((m) => m.fullName)
    if (!names.includes(rootMsg)) setRootMsg(names.includes(DEFAULT_ROOT) ? DEFAULT_ROOT : (names[0] || ''))
  }, [schema]) // eslint-disable-line react-hooks/exhaustive-deps

  const decoded = useMemo(() => {
    if (!schema.ok || !rootMsg || !data.trim()) return null
    try { return { ok: true, ...decodeSafe(schema.root, rootMsg, data, schema.anyTypeName) } }
    catch (e) { return { ok: false, error: e.message } }
  }, [schema, rootMsg, data])

  return (
    <div className="pb">
      <div className="pb-bg" />
      <div className="pb-card">
        <h2 className="pb-title">Protobuf Parser</h2>
        <p className="pb-sub">Decode Protocol Buffers wire bytes against a <code>.proto</code> schema. Paste the data and a schema (Tron’s is loaded by default), pick the message, and see every field named and typed — with <code>google.protobuf.Any</code> contents decoded recursively.</p>

        <button className="pb-help-toggle" type="button" onClick={() => setShowHelp((v) => !v)}>{showHelp ? '▾' : '▸'} How Protocol Buffers work</button>
        {showHelp && <Explainer />}

        {/* data */}
        <label className="pb-field">
          <span className="pb-label">Protobuf data (hex)</span>
          <textarea className="pb-mono" rows={3} spellCheck={false} value={data} onChange={(e) => setData(e.target.value)}
            placeholder="paste the serialized protobuf message in hex" />
        </label>

        {/* schema + root */}
        <div className="pb-row">
          <label className="pb-field pb-grow">
            <span className="pb-label">
              <span>.proto schema</span>
              <span className="pb-inline">
                {schema.ok && <span className="pb-schema-stat">{schema.messages.length} messages</span>}
                <button type="button" className="pb-mini" onClick={() => setShowProto((v) => !v)}>{showProto ? 'Hide' : 'Edit'} schema</button>
                <button type="button" className="pb-mini" onClick={() => setProtoText(TRON_PROTO)} title="reset to the bundled Tron.proto">Reset to Tron</button>
              </span>
            </span>
            {showProto && (
              <textarea className="pb-mono pb-proto" rows={10} spellCheck={false} value={protoText} onChange={(e) => setProtoText(e.target.value)}
                placeholder="paste a .proto schema (imports are stripped, unknown types stubbed)" />
            )}
          </label>
        </div>

        <div className="pb-row">
          <label className="pb-field pb-grow">
            <span className="pb-label">Root message <em>· decode the bytes as this message</em></span>
            <select className="pb-sel" value={rootMsg} onChange={(e) => setRootMsg(e.target.value)} disabled={!schema.ok}>
              {schema.ok && schema.messages.map((m) => <option key={m.fullName} value={m.fullName}>{m.fullName}</option>)}
            </select>
          </label>
        </div>

        {!schema.ok && <div className="pb-err">⚠ {schema.error}</div>}

        {decoded?.ok && (
          <>
            <div className="pb-section-title">Decoded <em>· {rootMsg}{decoded.note}</em></div>
            <FieldTree rows={decoded.rows} />
          </>
        )}
        {decoded && !decoded.ok && <div className="pb-err">⚠ {decoded.error}</div>}
      </div>
    </div>
  )
}

/* recursive field tree */
function FieldTree({ rows }) {
  return <div className="pb-tree">{rows.map((r, i) => <Row key={i} r={r} />)}</div>
}
function Row({ r }) {
  const kindCls = 'pb-node ' + (r.kind || 'scalar')
  return (
    <div className={kindCls}>
      <div className="pb-node-line">
        <span className="pb-name">{r.name}</span>
        <span className="pb-type">{r.type}</span>
        {r.kind === 'enum' && <span className="pb-badge enum">enum</span>}
        {r.kind === 'any' && <span className="pb-badge any">Any</span>}
        {r.count != null && <span className="pb-badge">×{r.count}</span>}
        {r.value !== undefined && <span className={'pb-val' + (r.kind === 'enum' ? ' enumval' : '')}>{r.value}</span>}
        {r.ascii && <span className="pb-ascii">“{r.ascii}”</span>}
        {r.typeUrl && <span className="pb-url">{r.typeUrl}{r.resolvedType ? ' ✓' : ' (raw)'}</span>}
      </div>
      {r.children && r.children.length > 0 && (
        <div className="pb-children">{r.children.map((c, i) => <Row key={i} r={c} />)}</div>
      )}
    </div>
  )
}

function Explainer() {
  return (
    <div className="pb-help">
      <p><b>Protocol Buffers</b> (protobuf) is Google’s compact binary serialization. A <code>.proto</code> schema declares <i>messages</i> (structs) whose fields each have a <b>name</b>, a <b>type</b>, and a small <b>field number</b>. The number — not the name — is what’s written on the wire, so messages stay tiny and forward-compatible.</p>
      <p className="pb-help-rules-title">On the wire, each field is <code>(field_number &lt;&lt; 3) | wire_type</code> as a varint “tag”, then the value:</p>
      <table className="pb-rules">
        <thead><tr><th>Wire type</th><th>Used for</th><th>Value encoding</th></tr></thead>
        <tbody>
          <tr><td><code>0</code> varint</td><td>int32/64, uint, sint, bool, enum</td><td>base-128, 7 bits/byte, MSB = “more”</td></tr>
          <tr><td><code>1</code> 64-bit</td><td>fixed64, sfixed64, double</td><td>8 little-endian bytes</td></tr>
          <tr><td><code>2</code> length-delimited</td><td>string, bytes, embedded message, packed repeated</td><td>a length varint, then that many bytes</td></tr>
          <tr><td><code>5</code> 32-bit</td><td>fixed32, sfixed32, float</td><td>4 little-endian bytes</td></tr>
        </tbody>
      </table>
      <p className="pb-help-ex"><b>Decoding needs the schema.</b> The bytes only carry field numbers + wire types — not names or exact types. To turn <code>0x08 96 01</code> into <code>amount = 150</code> you must know field 1 is an <code>int64</code> named “amount”. That’s why this tool takes a <code>.proto</code>: it maps numbers → names/types and recurses into embedded messages.</p>
      <p className="pb-help-note"><b>To generate protobuf</b>, you (or a library) take each field, write its tag byte then its value per the table above, and concatenate. Nested messages are just length-delimited (wire 2) fields whose bytes are themselves an encoded message. <code>google.protobuf.Any</code> wraps a <code>type_url</code> + the embedded message’s bytes, so a decoder can look up the real type — this tool resolves it against your schema and decodes the inner message too.</p>
      <p className="pb-help-foot">Tron is the example here: its transactions are protobuf. The default <code>Tron.proto</code> decodes a <code>Transaction.raw</code> — its <code>contract[].parameter</code> is an <code>Any</code> holding e.g. a <code>TransferContract</code>, which you’ll see expand inline.</p>
    </div>
  )
}
