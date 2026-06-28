import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { listScreens } from './ux/screenStore.js'
import { getEngine } from './ux/lvglEngine.js'
import {
  emptyFlow, addNode, moveNode, updateNode, removeNode, getNode,
  setEdge, clearEdge, edgeTarget, nodePorts, portRects, validateFlow,
  DEFAULT_SPLASH_MS,
} from './flow/flowModel.js'
import { listFlows, getFlow, saveFlow, renameFlow, removeFlow } from './flow/flowStore.js'
import { generateUxC } from './flow/generateUxC.js'
import { buildScene, buildBoardSvg, download } from './flow/figExport.js'
import './flow/flow.css'

/* ============================================================================
 *  Flow Designer — wires saved UX-Designer screens into a navigable flow, then
 *  runs it in a live device and generates twi_<coin>_ux.c + a per-coin .fig.
 *
 *  Canvas behaves like a Figma viewer: an infinite, pannable, zoomable world.
 *    - Drag empty canvas (or middle-mouse / space-drag) to pan.
 *    - Wheel to zoom toward the cursor; +/-/fit controls bottom-right.
 *    - Screens float in WORLD coordinates; the side menu (screens/flows) is a
 *      collapsible overlay so the canvas owns the whole area.
 *
 *  Pipeline:
 *    1. Pick saved screens from the side menu (each becomes a draggable node).
 *    2. Click a button port on a node -> every OTHER node highlights; click one
 *       to wire (button -> target screen).
 *    3. Mark splash/status screens (auto-advance on a timeout).
 *    4. Run: opens the flow in one device; click on-device buttons to navigate.
 *    5. Generate twi_<coin>_ux.c, and export a per-coin .fig.
 * ========================================================================== */

const SCREEN_W = 320
const SCREEN_H = 170
const THUMB_SCALE = 0.5   // node thumbnail render scale (world units)
const NODE_W = SCREEN_W * THUMB_SCALE
const NODE_H = SCREEN_H * THUMB_SCALE
const MIN_ZOOM = 0.2
const MAX_ZOOM = 2.5

export default function FlowDesigner() {
  const [screens, setScreens] = useState(() => listScreens())
  const screensById = useMemo(() => Object.fromEntries(screens.map((s) => [s.id, s])), [screens])

  const [flow, setFlow] = useState(() => emptyFlow())
  const [savedFlows, setSavedFlows] = useState(() => listFlows())
  const refreshFlows = useCallback(() => setSavedFlows(listFlows()), [])

  const [engine, setEngine] = useState(null)
  const [wiring, setWiring] = useState(null)   // { from, port, label } while picking a target
  const [running, setRunning] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [selectedNode, setSelectedNode] = useState(null)
  const [menuOpen, setMenuOpen] = useState(true)        // side menu collapse
  const [view, setView] = useState({ x: 40, y: 40, zoom: 1 })  // pan/zoom of the world
  const [fullscreen, setFullscreen] = useState(false)   // expand canvas to fill the window

  useEffect(() => {
    let alive = true
    getEngine().then((e) => alive && setEngine(e)).catch(() => {})
    return () => { alive = false }
  }, [])

  // Esc exits full-screen.
  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e) => { if (e.key === 'Escape') setFullscreen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullscreen])

  const warnings = useMemo(() => validateFlow(flow, screensById), [flow, screensById])
  const code = useMemo(() => generateUxC(flow, screensById), [flow, screensById])

  /* ---- screen library actions ---- */
  function reloadScreens() { setScreens(listScreens()) }
  function addScreen(id) {
    // drop new nodes into the current view centre (world coords), fanned out
    setFlow((f) => {
      const i = f.nodes.length
      const wx = Math.round((-view.x + 120 + (i % 4) * (NODE_W + 90)) / view.zoom)
      const wy = Math.round((-view.y + 120 + Math.floor(i / 4) * (NODE_H + 120)) / view.zoom)
      return addNode(f, id, wx, wy)
    })
  }
  const usedIds = new Set(flow.nodes.map((n) => n.nodeId))

  /* ---- wiring ---- */
  function beginWire(nodeId, port) {
    setWiring((w) => (w && w.from === nodeId && w.port === port.id ? null : { from: nodeId, port: port.id, label: port.label }))
  }
  function completeWire(toNodeId) {
    if (!wiring) return
    if (toNodeId === wiring.from) { setWiring(null); return }
    setFlow((f) => setEdge(f, wiring.from, wiring.port, toNodeId))
    setWiring(null)
  }
  function unwire(nodeId, portId) { setFlow((f) => clearEdge(f, nodeId, portId)) }

  /* ---- node ops ---- */
  function dropNode(nodeId) { setFlow((f) => removeNode(f, nodeId)); if (selectedNode === nodeId) setSelectedNode(null) }
  function setRole(nodeId, role) { setFlow((f) => updateNode(f, nodeId, { role })) }
  function setTimeout_(nodeId, ms) { setFlow((f) => updateNode(f, nodeId, { timeoutMs: ms })) }
  function setStart(nodeId) { setFlow((f) => ({ ...f, startNodeId: nodeId })) }

  /* ---- view (pan/zoom) ---- */
  function resetView() { setView({ x: 40, y: 40, zoom: 1 }) }
  function fitView(viewportW, viewportH) {
    if (!flow.nodes.length) return resetView()
    const xs = flow.nodes.map((n) => n.x), ys = flow.nodes.map((n) => n.y)
    const minX = Math.min(...xs), minY = Math.min(...ys)
    const maxX = Math.max(...xs.map((v, i) => v + NODE_W)), maxY = Math.max(...ys.map((v) => v + NODE_H + 120))
    const w = maxX - minX, h = maxY - minY
    const pad = 80
    const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min((viewportW - pad * 2) / w, (viewportH - pad * 2) / h, 1.2)))
    setView({ x: pad - minX * zoom, y: pad - minY * zoom, zoom })
  }

  /* ---- flow library ---- */
  function saveCurrent() {
    const name = window.prompt('Save flow as:', flow.name || `${flow.coin}_flow`)
    if (name == null) return
    const stored = saveFlow({ ...flow, name }, Date.now())
    setFlow(stored); refreshFlows()
  }
  function loadFlow(id) {
    const e = getFlow(id); if (!e) return
    setFlow(structuredClone(e)); setSelectedNode(null); setWiring(null); resetView()
  }
  function deleteFlow(id) {
    const e = getFlow(id); if (!e) return
    if (!window.confirm(`Delete flow "${e.name}"?`)) return
    removeFlow(id); if (flow.id === id) setFlow(emptyFlow()); refreshFlows()
  }
  function newFlow() { setFlow(emptyFlow()); setSelectedNode(null); setWiring(null); resetView() }

  /* ---- exports ---- */
  function downloadC() {
    download(`twi_${(flow.coin || 'coin').toLowerCase()}_ux.c`, code, 'text/x-c')
  }
  async function exportSvg() {
    // Export a real SVG board: Figma imports SVG natively (drag-drop, or
    // File › Place image). Each screen is drawn pixel-accurate with its wired
    // flow arrows. (A native .fig is Figma's proprietary fig-kiwi binary whose
    // schema is undocumented and version-specific, so SVG is the reliable path.)
    const thumbs = engine ? await buildThumbs(engine, flow, screensById) : null
    const scene = buildScene(flow, screensById)
    const svg = buildBoardSvg(scene, screensById, thumbs)
    download(`${(flow.coin || 'coin').toLowerCase()}_ux.svg`, svg, 'image/svg+xml')
  }

  return (
    <div className={'flow' + (fullscreen ? ' flow-fullscreen' : '')}>
      {/* ---- toolbar ---- */}
      <div className="flow-toolbar">
        <div className="flow-tb-left">
          <button className="mini btn-like" onClick={() => setMenuOpen((v) => !v)} title="Toggle the screens menu">
            {menuOpen ? '◀ Menu' : '☰ Menu'}
          </button>
          <label className="mini">Coin&nbsp;
            <input className="mini-in" value={flow.coin}
              onChange={(e) => setFlow((f) => ({ ...f, coin: e.target.value }))} />
          </label>
          <span className="flow-tb-name">{flow.name ? `Flow: ${flow.name}` : 'Unsaved flow'}</span>
        </div>
        <div className="flow-tb-right">
          <button className="mini btn-like" onClick={newFlow}>＋ New</button>
          <button className="mini btn-like" onClick={saveCurrent}>💾 Save flow…</button>
          <button className="mini btn-like" disabled={!flow.nodes.length} onClick={() => setRunning(true)}>▶ Run</button>
          <button className="mini btn-like" disabled={!flow.nodes.length} onClick={() => setShowCode(true)}>{'</>'} Generate C</button>
          <button className="mini btn-like" disabled={!flow.nodes.length} onClick={exportSvg} title="Export an SVG board (opens in Figma via drag-drop or File › Place)">⬡ Export SVG</button>
          <button className="mini btn-like" onClick={() => setFullscreen((v) => !v)} title="Toggle full-screen canvas (Esc to exit)">{fullscreen ? '🗗 Exit full screen' : '⛶ Full screen'}</button>
        </div>
      </div>

      {/* ---- canvas with floating side menu ---- */}
      <FlowCanvas
        flow={flow} screensById={screensById} engine={engine}
        wiring={wiring} selectedNode={selectedNode}
        view={view} setView={setView} onFit={fitView} onResetView={resetView}
        onMoveNode={(id, x, y) => setFlow((f) => moveNode(f, id, x, y))}
        onBeginWire={beginWire} onCompleteWire={completeWire} onUnwire={unwire}
        onSelectNode={setSelectedNode} onDropNode={dropNode}
        onSetRole={setRole} onSetTimeout={setTimeout_} onSetStart={setStart}
        onCancelWire={() => setWiring(null)}
        menu={
          menuOpen && (
            <SideMenu
              screens={screens} savedFlows={savedFlows} flow={flow} warnings={warnings}
              usedIds={usedIds} onReload={reloadScreens} onAddScreen={addScreen}
              onLoadFlow={loadFlow} onDeleteFlow={deleteFlow} onClose={() => setMenuOpen(false)}
            />
          )
        }
      />

      {running && (
        <RunModal flow={flow} screensById={screensById} engine={engine} onClose={() => setRunning(false)} />
      )}
      {showCode && (
        <CodeModal code={code} coin={flow.coin} onDownload={downloadC} onClose={() => setShowCode(false)} />
      )}
    </div>
  )
}

/* ===========================================================================
 *  SIDE MENU — collapsible overlay: saved screens, saved flows, warnings.
 * ========================================================================= */
function SideMenu({ screens, savedFlows, flow, warnings, usedIds, onReload, onAddScreen, onLoadFlow, onDeleteFlow, onClose }) {
  return (
    <aside className="flow-menu" onPointerDown={(e) => e.stopPropagation()} onWheel={(e) => e.stopPropagation()}>
      <div className="flow-menu-head">
        <span>Screens & Flows</span>
        <button className="flow-menu-close" onClick={onClose} title="Hide menu">✕</button>
      </div>
      <div className="flow-menu-body">
        <fieldset className="pg">
          <legend>Saved screens ({screens.length})</legend>
          <button className="mini-x-wide" onClick={onReload} title="Re-read screens saved in the UX Designer">⟲ Refresh</button>
          {screens.length === 0 ? (
            <p className="hint">No saved screens. Create them in the UX Designer first.</p>
          ) : (
            <ul className="flow-screenlist">
              {screens.map((s) => (
                <li key={s.id}>
                  <button className="flow-screenadd" disabled={usedIds.has(s.id)}
                    onClick={() => onAddScreen(s.id)}
                    title={usedIds.has(s.id) ? 'Already on the canvas' : 'Add to flow'}>
                    <span className="flow-screenname">{s.name}</span>
                    <span className="flow-screenmeta">{shortTmpl(s.model?.template)}{usedIds.has(s.id) ? ' · added' : ''}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        <fieldset className="pg">
          <legend>Saved flows ({savedFlows.length})</legend>
          {savedFlows.length === 0 ? <p className="hint">No saved flows yet.</p> : (
            <ul className="flow-screenlist">
              {savedFlows.map((e) => (
                <li key={e.id} className={'flow-flowrow' + (e.id === flow.id ? ' active' : '')}>
                  <button className="flow-screenadd" onClick={() => onLoadFlow(e.id)}>
                    <span className="flow-screenname">{e.name}</span>
                    <span className="flow-screenmeta">{e.coin} · {e.nodes?.length || 0} screens</span>
                  </button>
                  <button className="saved-act danger" onClick={() => onDeleteFlow(e.id)} title="Delete">🗑</button>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        {warnings.length > 0 && (
          <fieldset className="pg flow-warns">
            <legend>To finish ({warnings.length})</legend>
            <ul>{warnings.slice(0, 8).map((w, i) => <li key={i}>{w}</li>)}</ul>
            {warnings.length > 8 && <p className="hint">…and {warnings.length - 8} more.</p>}
          </fieldset>
        )}
      </div>
    </aside>
  )
}

/* ===========================================================================
 *  CANVAS — Figma-style infinite viewport. A fixed viewport contains a "world"
 *  plane translated+scaled by `view`; nodes live in world coordinates.
 * ========================================================================= */
function FlowCanvas({
  flow, screensById, engine, wiring, selectedNode,
  view, setView, onFit, onResetView,
  onMoveNode, onBeginWire, onCompleteWire, onUnwire, onSelectNode, onDropNode,
  onSetRole, onSetTimeout, onSetStart, onCancelWire, menu,
}) {
  const viewportRef = useRef(null)
  const nodeDrag = useRef(null)   // dragging a node (world coords)
  const lastNodeDrag = useRef(null) // the most recent node drag (read by onNodeClick)
  const panDrag = useRef(null)    // panning the canvas
  const [ctxMenu, setCtxMenu] = useState(null) // { nodeId, x, y } screen coords

  function onNodeContextMenu(e, node) {
    e.preventDefault(); e.stopPropagation()
    onSelectNode(node.nodeId)
    const rect = viewportRef.current?.getBoundingClientRect()
    setCtxMenu({ nodeId: node.nodeId, x: e.clientX - (rect?.left || 0), y: e.clientY - (rect?.top || 0) })
  }
  function closeCtx() { setCtxMenu(null) }
  function ctxSetHome(nodeId) { onSetStart(nodeId); onSetRole(nodeId, 'home'); closeCtx() }
  function ctxSetNormal(nodeId) { onSetRole(nodeId, 'normal'); closeCtx() }
  function ctxMakeSplash(nodeId, cur) {
    const ms = window.prompt('Splash duration before auto-advancing (ms):', String(cur ?? DEFAULT_SPLASH_MS))
    if (ms == null) { closeCtx(); return }
    const n = parseInt(ms, 10)
    onSetTimeout(nodeId, Number.isFinite(n) && n > 0 ? n : DEFAULT_SPLASH_MS)
    onSetRole(nodeId, 'splash')
    closeCtx()
  }
  function ctxMakeStatus(nodeId, cur) {
    const ms = window.prompt('Status screen — time on screen before returning Home (ms):', String(cur ?? DEFAULT_SPLASH_MS))
    if (ms == null) { closeCtx(); return }
    const n = parseInt(ms, 10)
    onSetTimeout(nodeId, Number.isFinite(n) && n > 0 ? n : DEFAULT_SPLASH_MS)
    onSetRole(nodeId, 'status')
    closeCtx()
  }

  /* --- click on a node: hit-test x/y against the screen's button rects ---
   * The screen itself has no overlay elements; we map the click position to a
   * fraction of the screen (0..1) and find which button rectangle it lands in.
   * - clicking a button starts (or re-targets) wiring from that button
   * - clicking anywhere while this node is a wiring target completes the wire
   * - a click that was actually a drag is ignored (handled by onNodePointerDown)
   */
  function onNodeClick(e, node) {
    e.stopPropagation()
    if (lastNodeDrag.current && lastNodeDrag.current.moved) return // it was a drag, not a click
    const isTarget = wiring && wiring.from !== node.nodeId
    if (isTarget) { onCompleteWire(node.nodeId); return }

    const scr = screensById[node.screenId]
    const rects = portRects(scr?.model)
    if (!rects.length) return
    const thumb = e.currentTarget.querySelector('.flow-thumb')
    const r = (thumb || e.currentTarget).getBoundingClientRect()
    const fx = (e.clientX - r.left) / r.width
    const fy = (e.clientY - r.top) / r.height
    const hit = rects.find((p) => fx >= p.x && fx <= p.x + p.w && fy >= p.y && fy <= p.y + p.h)
    if (hit) onBeginWire(node.nodeId, hit)
  }

  /* --- hover: pointer cursor when the mouse is over one of the screen's
   * buttons (same x/y hit-test as the click), otherwise the drag cursor. --- */
  function onNodeMouseMove(e, node) {
    if (nodeDrag.current) return // dragging -> leave cursor as grabbing
    const scr = screensById[node.screenId]
    const rects = portRects(scr?.model)
    const thumb = e.currentTarget.querySelector('.flow-thumb')
    const r = (thumb || e.currentTarget).getBoundingClientRect()
    const fx = (e.clientX - r.left) / r.width
    const fy = (e.clientY - r.top) / r.height
    const over = rects.some((p) => fx >= p.x && fx <= p.x + p.w && fy >= p.y && fy <= p.y + p.h)
    e.currentTarget.style.cursor = over ? 'pointer' : (wiring ? 'crosshair' : 'grab')
  }

  /* --- node drag: convert screen delta to world delta (÷zoom) --- */
  function onNodePointerDown(e, node) {
    e.stopPropagation()
    onSelectNode(node.nodeId)
    e.currentTarget.setPointerCapture?.(e.pointerId)
    nodeDrag.current = { id: node.nodeId, startX: e.clientX, startY: e.clientY, origX: node.x, origY: node.y, moved: false }
  }

  /* --- pan: drag the empty canvas (or middle mouse anywhere) --- */
  function onCanvasPointerDown(e) {
    if (ctxMenu) setCtxMenu(null)
    // Only the empty background should pan. A pointerdown that lands on a node,
    // port button, menu, or control must pass through untouched so its click
    // fires (the viewport must NOT capture the pointer in that case).
    const onBackground = e.target === viewportRef.current
      || e.target.classList?.contains('flow-world')
      || e.target.classList?.contains('flow-edges')
    const middle = e.button === 1
    if (!onBackground && !middle) return
    if (wiring && e.button === 0) { onCancelWire(); return }
    if (e.button === 0 || e.button === 1) {
      panDrag.current = { startX: e.clientX, startY: e.clientY, origX: view.x, origY: view.y }
      viewportRef.current?.setPointerCapture?.(e.pointerId)
    }
  }
  function onPointerMove(e) {
    if (nodeDrag.current) {
      const d = nodeDrag.current
      if (Math.abs(e.clientX - d.startX) > 3 || Math.abs(e.clientY - d.startY) > 3) d.moved = true
      if (!d.moved) return // below threshold -> treat as a click, do not move yet
      onMoveNode(d.id,
        Math.round(d.origX + (e.clientX - d.startX) / view.zoom),
        Math.round(d.origY + (e.clientY - d.startY) / view.zoom))
      return
    }
    if (panDrag.current) {
      const d = panDrag.current
      setView((v) => ({ ...v, x: d.origX + (e.clientX - d.startX), y: d.origY + (e.clientY - d.startY) }))
    }
  }
  function onPointerUp() { lastNodeDrag.current = nodeDrag.current; nodeDrag.current = null; panDrag.current = null }

  /* --- wheel zoom toward the cursor (Figma-style) --- */
  function onWheel(e) {
    e.preventDefault()
    const rect = viewportRef.current.getBoundingClientRect()
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top
    const factor = Math.exp(-e.deltaY * 0.0015)
    setView((v) => {
      const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, v.zoom * factor))
      // keep the world point under the cursor fixed
      const wx = (cx - v.x) / v.zoom
      const wy = (cy - v.y) / v.zoom
      return { zoom, x: cx - wx * zoom, y: cy - wy * zoom }
    })
  }

  function doFit() {
    const r = viewportRef.current?.getBoundingClientRect()
    onFit(r?.width || 1000, r?.height || 600)
  }

  const worldStyle = {
    transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
    transformOrigin: '0 0',
  }

  return (
    <div className={'flow-viewport' + (wiring ? ' wiring' : '')}
      ref={viewportRef}
      onPointerDown={onCanvasPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={onWheel}>

      {/* floating side menu overlay */}
      {menu}

      {/* the pannable/zoomable world */}
      <div className="flow-world" style={worldStyle}>
        <FlowEdges flow={flow} screensById={screensById} w={NODE_W} h={NODE_H} />

        {flow.nodes.map((node) => {
          const scr = screensById[node.screenId]
          const isTarget = wiring && wiring.from !== node.nodeId
          const isStart = flow.startNodeId === node.nodeId
          return (
            <div key={node.nodeId}
              className={'flow-node'
                + (selectedNode === node.nodeId ? ' sel' : '')
                + (isTarget ? ' targetable' : '')
                + (isStart ? ' start' : '')
                + (node.role === 'splash' ? ' splash' : '')
                + (node.role === 'status' ? ' status' : '')}
              style={{ left: node.x, top: node.y, width: NODE_W, height: NODE_H }}
              title={scr?.name || node.nodeId}
              onPointerDown={(e) => onNodePointerDown(e, node)}
              onContextMenu={(e) => onNodeContextMenu(e, node)}
              onMouseMove={(e) => onNodeMouseMove(e, node)}
              onClick={(e) => onNodeClick(e, node)}>

              {/* the screen itself IS the node — nothing drawn over it. Clicks are
                  hit-tested by x/y against the screen's button rectangles. */}
              <div className="flow-thumb bare" style={{ width: NODE_W, height: NODE_H }}>
                <Thumb engine={engine} model={scr?.model} w={NODE_W} h={NODE_H} />
              </div>
            </div>
          )
        })}
      </div>

      {flow.nodes.length === 0 && (
        <div className="flow-empty">Open the menu and add saved screens to start building the flow.<br />Drag the empty canvas to pan · scroll to zoom.</div>
      )}

      {wiring && (
        <div className="flow-wire-banner">
          Wiring <strong>{wiring.label}</strong> — click a highlighted screen to connect, or click empty canvas to cancel.
        </div>
      )}

      {ctxMenu && (() => {
        const node = flow.nodes.find((n) => n.nodeId === ctxMenu.nodeId)
        if (!node) return null
        const scr = screensById[node.screenId]
        const isHome = flow.startNodeId === node.nodeId
        return (
          <div className="flow-ctx" style={{ left: ctxMenu.x, top: ctxMenu.y }}
            onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
            <div className="flow-ctx-title">{scr?.name || node.nodeId}</div>
            <button onClick={() => ctxSetHome(node.nodeId)} disabled={isHome}>⌂ Set as Home screen</button>
            <button onClick={() => ctxMakeSplash(node.nodeId, node.timeoutMs)}>⏱ Make Splash screen…</button>
            <button onClick={() => ctxMakeStatus(node.nodeId, node.timeoutMs)}>⏱⌂ Make Status screen…</button>
            <button onClick={() => ctxSetNormal(node.nodeId)} disabled={node.role === 'normal' && !isHome}>↺ Make Normal</button>
            <div className="flow-ctx-sep" />
            <button className="danger" onClick={() => { onDropNode(node.nodeId); closeCtx() }}>🗑 Remove from flow</button>
          </div>
        )
      })()}

      {/* zoom / view controls */}
      <div className="flow-zoom" onPointerDown={(e) => e.stopPropagation()}>
        <button onClick={() => setView((v) => zoomTo(v, v.zoom * 1.2))} title="Zoom in">＋</button>
        <button className="flow-zoom-pct" onClick={onResetView} title="Reset to 100%">{Math.round(view.zoom * 100)}%</button>
        <button onClick={() => setView((v) => zoomTo(v, v.zoom / 1.2))} title="Zoom out">－</button>
        <button onClick={doFit} title="Zoom to fit all screens">⤢</button>
      </div>
    </div>
  )
}

/* zoom keeping the viewport centre stable (used by the +/- buttons). */
function zoomTo(v, target) {
  const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, target))
  return { ...v, zoom }
}

/* SVG layer drawing curved arrows between wired ports and their targets. Lives
 * inside the transformed world plane, so arrows pan/zoom with everything else. */
function FlowEdges({ flow, screensById, w, h }) {
  const segs = []
  for (const node of flow.nodes) {
    const scr = screensById[node.screenId]
    const rects = portRects(scr?.model)
    const ports = nodePorts(node, scr?.model)
    ports.forEach((p) => {
      const to = edgeTarget(flow, node.nodeId, p.id)
      if (!to) return
      const tnode = getNode(flow, to)
      if (!tnode) return
      // start point: the centre of this button hotspot ON the screen; timeout
      // (splash) ports have no hotspot -> start from the screen bottom-centre.
      const r = rects.find((x) => x.id === p.id)
      const x1 = r ? node.x + (r.x + r.w) * w : node.x + w / 2
      const y1 = r ? node.y + (r.y + r.h / 2) * h : node.y + h
      // target: nearest of the destination screen left/centre
      const x2 = tnode.x
      const y2 = tnode.y + h / 2
      const dx = Math.max(40, Math.abs(x2 - x1) / 2)
      segs.push({ key: `${node.nodeId}.${p.id}`, d: `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}` })
    })
  }
  return (
    <svg className="flow-edges" width="100%" height="100%">
      <defs>
        <marker id="fl-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L7,3 L0,6 Z" fill="#7c3aed" />
        </marker>
      </defs>
      {segs.map((s) => <path key={s.key} d={s.d} className="flow-edge" markerEnd="url(#fl-arrow)" />)}
    </svg>
  )
}

/* A node thumbnail rendered via the real LVGL engine (falls back to blank). */
function Thumb({ engine, model, w, h }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!engine || !model || !ref.current) return
    let cancelled = false
    renderWithLogo(engine, model).then((img) => {
      if (cancelled || !img || !ref.current) return
      const cv = ref.current
      cv.width = SCREEN_W; cv.height = SCREEN_H
      cv.getContext('2d').putImageData(img, 0, 0)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [engine, model, model?.logo?.dataUrl])
  if (!engine || !model) return <div className="flow-thumb-blank">{model?.template ? shortTmpl(model.template) : 'screen'}</div>
  return <canvas ref={ref} style={{ width: w, height: h, imageRendering: 'pixelated' }} />
}

/* ===========================================================================
 *  RUN MODE — faithful navigation in one device frame.
 * ========================================================================= */
function RunModal({ flow, screensById, engine, onClose }) {
  const [current, setCurrent] = useState(() => flow.startNodeId || flow.nodes[0]?.nodeId || null)
  const timerRef = useRef(null)
  const canvasRef = useRef(null)

  const node = current ? getNode(flow, current) : null
  const scr = node ? screensById[node.screenId] : null

  // render current screen (with this screen's own logo)
  useEffect(() => {
    if (!engine || !scr?.model || !canvasRef.current) return
    let cancelled = false
    renderWithLogo(engine, scr.model).then((img) => {
      if (cancelled || !img || !canvasRef.current) return
      const cv = canvasRef.current
      cv.width = SCREEN_W; cv.height = SCREEN_H
      cv.getContext('2d').putImageData(img, 0, 0)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [engine, scr])

  // splash/status auto-advance on a timer (faithful to firmware)
  useEffect(() => {
    clearTimeout(timerRef.current)
    if (!node) return
    if (node.role === 'splash') {
      const to = edgeTarget(flow, node.nodeId, 'timeout')
      if (to) timerRef.current = setTimeout(() => go(to), node.timeoutMs || DEFAULT_SPLASH_MS)
    } else if (node.role === 'status') {
      const home = flow.startNodeId || flow.nodes[0]?.nodeId
      if (home) timerRef.current = setTimeout(() => go(home), node.timeoutMs || DEFAULT_SPLASH_MS)
    }
    return () => clearTimeout(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  function go(to) { if (to) setCurrent(to) }
  function reset() { clearTimeout(timerRef.current); setCurrent(flow.startNodeId || flow.nodes[0]?.nodeId) }

  const rects = node ? portRects(scr?.model) : []

  /* press a button by hit-testing the click x/y against the screen's button rects */
  function onScreenClick(e) {
    const r = canvasRef.current?.getBoundingClientRect()
    if (!r) return
    const fx = (e.clientX - r.left) / r.width
    const fy = (e.clientY - r.top) / r.height
    const hit = rects.find((p) => fx >= p.x && fx <= p.x + p.w && fy >= p.y && fy <= p.y + p.h)
    if (hit) go(edgeTarget(flow, current, hit.id))
  }
  function onScreenMove(e) {
    const r = canvasRef.current?.getBoundingClientRect()
    if (!r) return
    const fx = (e.clientX - r.left) / r.width
    const fy = (e.clientY - r.top) / r.height
    const over = rects.some((p) => fx >= p.x && fx <= p.x + p.w && fy >= p.y && fy <= p.y + p.h)
    e.currentTarget.style.cursor = over ? 'pointer' : 'default'
  }

  return (
    <div className="ux-modal-overlay" onClick={onClose}>
      <div className="ux-modal flow-run" onClick={(e) => e.stopPropagation()}>
        <div className="ux-modal-head">
          <span className="field-label">▶ Running flow — <strong>{scr?.name || '—'}</strong>
            {node?.role === 'splash' && <em> (splash, auto-advancing…)</em>}
            {node?.role === 'status' && <em> (status, returning home…)</em>}
          </span>
          <div className="ux-modal-actions">
            <button className="btn ghost" onClick={reset}>⟲ Restart</button>
            <button className="btn ghost" onClick={onClose}>Close ✕</button>
          </div>
        </div>
        <div className="flow-run-body single">
          <div className="flow-run-device">
            <div className="device-screen real" style={{ width: SCREEN_W, height: SCREEN_H, position: 'relative' }}>
              <canvas ref={canvasRef}
                style={{ width: SCREEN_W, height: SCREEN_H, imageRendering: 'pixelated' }}
                onClick={onScreenClick} onMouseMove={onScreenMove} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===========================================================================
 *  CODE MODAL
 * ========================================================================= */
function CodeModal({ code, coin, onDownload, onClose }) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="ux-modal-overlay" onClick={onClose}>
      <div className="ux-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ux-modal-head">
          <span className="field-label">Generated flow driver — <code>twi_{(coin || 'coin').toLowerCase()}_ux.c</code></span>
          <div className="ux-modal-actions">
            <button className="btn" onClick={() => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1200) }}>{copied ? 'Copied ✓' : 'Copy C'}</button>
            <button className="btn" onClick={onDownload}>⬇ Download .c</button>
            <button className="btn ghost" onClick={onClose}>Close ✕</button>
          </div>
        </div>
        <pre className="ux-c mono">{code}</pre>
      </div>
    </div>
  )
}

/* ---- helpers -------------------------------------------------------------- */

/* The LVGL engine keeps ONE global logo buffer, and render(model) uses whatever
 * logo is currently set. Each saved screen can carry its own model.logo
 * ({ dataUrl, name }) from the UX Designer, so before rendering a screen we must
 * apply THAT screen's logo first — otherwise every screen shows the same icon.
 *
 * Loads are cached by dataUrl, and every (setLogo -> render) pair is serialized
 * through one promise chain so concurrent renders can't clobber each other's
 * logo between set and render (the buffer is shared global state). */
const _logoImgCache = new Map()
function _loadLogo(dataUrl) {
  if (_logoImgCache.has(dataUrl)) return Promise.resolve(_logoImgCache.get(dataUrl))
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => { _logoImgCache.set(dataUrl, img); resolve(img) }
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}
let _renderChain = Promise.resolve()
/* renderWithLogo(engine, model) -> Promise<ImageData>. Applies model.logo (or
 * clears it) then renders, atomically. */
function renderWithLogo(engine, model) {
  const run = async () => {
    const url = model?.logo?.dataUrl || null
    if (url) {
      const img = await _loadLogo(url)
      if (img) engine.setLogo(img); else engine.clearLogo()
    } else {
      engine.clearLogo()
    }
    return engine.render(model)
  }
  const next = _renderChain.then(run, run)
  // keep the chain alive but don't let a rejection poison it
  _renderChain = next.then(() => {}, () => {})
  return next
}

function shortTmpl(t) {
  return t === 'TWI_TEMP_CHOICE_INFO' ? 'Choice Info'
    : t === 'TWI_TEMP_CONFIRMATION' ? 'Confirmation'
    : t === 'TWI_TEMP_LIST' ? 'List' : 'Screen'
}

/* Render every screen to a PNG data URL via the engine, for the .fig board. */
async function buildThumbs(engine, flow, screensById) {
  const out = {}
  const cv = document.createElement('canvas')
  cv.width = SCREEN_W; cv.height = SCREEN_H
  const ctx = cv.getContext('2d')
  for (const n of flow.nodes) {
    const m = screensById[n.screenId]?.model
    if (!m) continue
    try {
      const img = await renderWithLogo(engine, m)   // each screen's own logo
      if (!img) continue
      ctx.putImageData(img, 0, 0)
      out[n.nodeId] = cv.toDataURL('image/png')
    } catch { /* skip */ }
  }
  return out
}
