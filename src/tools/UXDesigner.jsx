import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import {
  SCREEN_W, SCREEN_H, STATUS_BAR_H, FONTS,
  CHOICE_ITEM_KINDS, TEXT_ALIGN, LIST_STYLES, TEMPLATE_KINDS,
  makeDefault, layout, screenToModel, generateC,
} from './ux/uxModel.js'
import { getEngine } from './ux/lvglEngine.js'
import { listScreens, saveScreen, updateScreenModel, renameScreen, removeScreen, getScreen } from './ux/screenStore.js'
import { useHistory } from './ux/useHistory.js'
import { TEMPLATE_ICONS } from './ux/templateIcons.js'
import './ux/ux.css'

/* ============================================================================
 *  UX Designer — visual editor for TWI CryptoGuard on-device screens.
 *
 *  Left  : the device (320x170) rendered pixel-accurately at a chosen zoom.
 *          Drag elements to move them; their coordinates update live.
 *  Mid   : a properties panel exposing EVERY parameter the firmware template
 *          structs accept (mirrors tstr_temp_choice_info_in / _confirmation_in
 *          / _list_in). Edit a value -> the device redraws instantly.
 *  Right : the generated `prepare_<coin>_<screen>_temp()` C, ready to paste
 *          into twi_<coin>_ux_contexts.c.
 *
 *  Moving an object on the screen and typing a value into the panel are two
 *  views of the same model, so they stay in sync both ways.
 * ========================================================================== */


export default function UXDesigner() {
  // model state with undo/redo history. `setModel` records history (Ctrl+Z);
  // drag uses history.begin()+setTransient to collapse a drag into one step.
  const history = useHistory(makeDefault('TWI_TEMP_CHOICE_INFO'))
  const model = history.model
  const setModel = history.set
  const zoom = 1   // fixed display scale (0.5× of the previous 2×); canvas
                   // renders at native 320×170 and is shown at that 1:1 size
  const [selected, setSelected] = useState(null)
  const [copied, setCopied] = useState(false)
  const [showCode, setShowCode] = useState(false)  // C-code popup visibility
  const [realMode, setRealMode] = useState(true)   // render with real LVGL WASM
  const [engine, setEngine] = useState(null)
  const [engineErr, setEngineErr] = useState(null)

  const els = useMemo(() => layout(model), [model])
  const code = useMemo(() => generateC(model), [model])

  // Keyboard: Ctrl/Cmd+Z = undo, Ctrl+Y or Ctrl/Cmd+Shift+Z = redo.
  // Ignored while typing in a text field so it doesn't fight native text undo.
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase()
      if (!(e.ctrlKey || e.metaKey) || (k !== 'z' && k !== 'y')) return
      const t = e.target
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
      if (typing) return
      e.preventDefault()
      if (k === 'y' || (k === 'z' && e.shiftKey)) history.redo()
      else history.undo()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [history])

  // The coin icon is part of the model (model.logo = { dataUrl, name }) so it
  // is saved/loaded with the configuration. logoName is derived for the toolbar.
  const logoName = model.logo?.name || null
  const [logoTick, setLogoTick] = useState(0)   // bump to force re-render after logo applied to engine

  // saved-screens library (localStorage)
  const [saved, setSaved] = useState(() => listScreens())
  const [loadedId, setLoadedId] = useState(null)   // which saved entry is currently loaded
  const refreshSaved = useCallback(() => setSaved(listScreens()), [])

  function saveCurrent() {
    const def = model.screenName || 'Screen'
    const name = window.prompt('Save screen as:', loadedId ? (getScreen(loadedId)?.name || def) : def)
    if (name == null) return
    const entry = saveScreen(name, model, Date.now())
    setLoadedId(entry.id)
    refreshSaved()
  }
  function updateCurrent() {
    if (!loadedId) return saveCurrent()
    updateScreenModel(loadedId, model, Date.now())
    refreshSaved()
  }
  function loadSaved(id) {
    const e = getScreen(id)
    if (!e) return
    setModel(structuredClone(e.model))
    setLoadedId(id)
    setSelected(null)
  }
  function renameSaved(id) {
    const e = getScreen(id); if (!e) return
    const name = window.prompt('Rename screen:', e.name)
    if (name == null) return
    renameScreen(id, name)
    refreshSaved()
  }
  function removeSaved(id) {
    const e = getScreen(id); if (!e) return
    if (!window.confirm(`Delete saved screen "${e.name}"?`)) return
    removeScreen(id)
    if (loadedId === id) setLoadedId(null)
    refreshSaved()
  }

  // load the LVGL WASM engine once
  useEffect(() => {
    let alive = true
    getEngine().then((e) => { if (alive) setEngine(e) })
      .catch((err) => { if (alive) { setEngineErr(String(err)); setRealMode(false) } })
    return () => { alive = false }
  }, [])

  // The coin icon (model.logo) can be: an uploaded image, a built-in template
  // icon, or the default placeholder. For built-ins we also store the C symbol
  // so the generated code references it (e.g. &confirm_icon_image).
  function onLogoFile(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setModel((m) => ({ ...m, logo: { dataUrl: String(reader.result), name: file.name } }))
    reader.readAsDataURL(file)
  }
  function setBuiltinLogo(icon) {
    setModel((m) => ({ ...m, logo: { dataUrl: icon.dataUrl, name: icon.symbol, symbol: '&' + icon.symbol } }))
  }
  function clearLogo() {
    setModel((m) => { const n = { ...m }; delete n.logo; return n })
  }

  // Apply model.logo to the engine whenever it changes (covers upload, loading
  // a saved screen, and template switches). Falls back to the placeholder when
  // there's no logo. logoTick bumps so the canvas re-renders once applied.
  const appliedLogoRef = useRef(undefined)
  useEffect(() => {
    if (!engine) return
    const url = model.logo?.dataUrl || null
    if (appliedLogoRef.current === url) return
    appliedLogoRef.current = url
    if (!url) { engine.clearLogo(); setLogoTick((t) => t + 1); return }
    const img = new Image()
    img.onload = () => { engine.setLogo(img); setLogoTick((t) => t + 1) }
    img.src = url
  }, [engine, model.logo])

  const patch = useCallback((p) => setModel((m) => ({ ...m, ...p })), [])

  function switchTemplate(t) {
    const next = makeDefault(t)
    // keep coin + screen name + logo across template switches
    next.coin = model.coin
    next.screenName = model.screenName
    if (model.logo) next.logo = model.logo
    setModel(next)
    setSelected(null)
  }

  /* drag handling — converts pointer delta (screen px) into device px and
     writes back the dragged element's coordinate(s) into the model. */
  const dragRef = useRef(null)
  function onPointerDown(e, el) {
    setSelected(el.id)
    if (!el.draggable) return
    e.preventDefault()
    e.target.setPointerCapture?.(e.pointerId)
    dragRef.current = { el, startX: e.clientX, startY: e.clientY, origX: el.x, origY: el.y }
  }
  function onPointerMove(e) {
    const d = dragRef.current
    if (!d) return
    const dx = Math.round((e.clientX - d.startX) / zoom)
    const dy = Math.round((e.clientY - d.startY) / zoom)
    const allowX = d.el.axis === 'x' || d.el.axis === 'xy'
    const allowY = d.el.axis === 'y' || d.el.axis === 'xy'
    // clamp so the box stays on-screen (negative tops like the status chrome
    // are allowed via the element's own y, but dragged items stay visible)
    const nx = allowX ? clamp(d.origX + dx, 0, SCREEN_W - d.el.w) : d.origX
    const ny = allowY ? clamp(d.origY + dy, 0, SCREEN_H - d.el.h) : d.origY
    if (nx === d.origX && ny === d.origY && !d.moved) return
    // snapshot ONCE at the first actual move so the whole drag is one undo step
    if (!d.moved) { d.moved = true; history.begin() }
    writeElementPos(d.el, nx, ny)
  }
  function onPointerUp() { history.end(); dragRef.current = null }

  function writeElementPos(el, nx, ny) {
    const { x: mx, y: my } = screenToModel(el, nx, ny)
    history.setTransient((m) => {
      const next = structuredClone(m)
      if (el.group === 'item' && next.items) {
        next.items[el.index].y = my
      } else if (el.group === 'line' && next.lines) {
        next.lines[el.index].y = my
      } else if (el.group === 'button' && next.template === 'TWI_TEMP_CHOICE_INFO') {
        // choice_info buttons share one Y; X is per-button only if enabled
        next.buttonsY = my
        if (next.hasButtonXCoords && next.buttons[el.index]) next.buttons[el.index].x = mx
      }
      return next
    })
  }

  return (
    <div className="ux">
      {/* ---- toolbar ---- */}
      <div className="ux-toolbar">
        <div className="seg">
          {TEMPLATE_KINDS.map((t) => (
            <button
              key={t.value}
              className={'seg-btn' + (model.template === t.value ? ' on' : '')}
              onClick={() => switchTemplate(t.value)}
            >{t.label}</button>
          ))}
        </div>
        <div className="ux-toolbar-right">
          <button className="mini-icon" title="Undo (Ctrl+Z)" disabled={!history.canUndo} onClick={history.undo}>↶</button>
          <button className="mini-icon" title="Redo (Ctrl+Y)" disabled={!history.canRedo} onClick={history.redo}>↷</button>
          <label className="mini">Coin&nbsp;
            <input className="mini-in" value={model.coin}
              onChange={(e) => patch({ coin: e.target.value })} />
          </label>
          <label className="mini">Screen&nbsp;
            <input className="mini-in wide" value={model.screenName}
              onChange={(e) => patch({ screenName: e.target.value })} />
          </label>
          <label className="mini" title={engineErr || 'Render with the real LVGL engine (WASM) — pixel-identical to the device'}>
            <input type="checkbox" checked={realMode} disabled={!engine && !engineErr}
              onChange={(e) => setRealMode(e.target.checked)} />
            &nbsp;Real&nbsp;LVGL{!engine && !engineErr ? ' …' : ''}
          </label>
          <LogoPicker logo={model.logo} disabled={!engine}
            onBuiltin={setBuiltinLogo} onUpload={onLogoFile} onDefault={clearLogo} />
          <button className="mini btn-like" title="Save this screen configuration locally" onClick={saveCurrent}>💾 Save as…</button>
          {loadedId && <button className="mini btn-like" title="Overwrite the loaded saved screen" onClick={updateCurrent}>Update</button>}
        </div>
      </div>

      <div className="ux-body">
        {/* ---- device canvas ---- */}
        <div className="ux-stage">
          <DeviceScreen
            model={model} els={els} zoom={zoom} selected={selected}
            realMode={realMode && !!engine} engine={engine} logoTick={logoTick}
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
          />
          <div className="ux-stage-cap">
            320 × 170 px · drag the highlighted items to move them
            {realMode && engine ? ' · rendered by real LVGL (WASM)' : engineErr ? ' · schematic (WASM failed to load)' : ''}
          </div>
        </div>

        {/* ---- properties + saved screens ---- */}
        <div className="ux-props">
          <SavedScreens
            saved={saved} loadedId={loadedId}
            onSaveAs={saveCurrent} onLoad={loadSaved} onRename={renameSaved} onRemove={removeSaved}
          />
          <Props model={model} patch={patch} setModel={setModel} selected={selected} />
        </div>
      </div>

      {/* ---- generate C: a button that opens the code in a popup ---- */}
      <div className="ux-codebar">
        <button className="btn" onClick={() => setShowCode(true)}>
          {'</>'} Generate C code
        </button>
        <span className="ux-codebar-hint">
          the <code>prepare_{(model.coin || 'coin').toLowerCase()}_{(model.screenName || 'screen').toLowerCase()}_temp()</code> context function
        </span>
      </div>

      {showCode && (
        <CodeModal
          code={code} coin={model.coin} copied={copied}
          onCopy={() => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1200) }}
          onClose={() => setShowCode(false)}
        />
      )}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 *  Code popup — modal showing the generated context function.
 * ------------------------------------------------------------------------- */
function CodeModal({ code, coin, copied, onCopy, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="ux-modal-overlay" onClick={onClose}>
      <div className="ux-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ux-modal-head">
          <span className="field-label">Generated context function — paste into <code>twi_{coin}_ux_contexts.c</code></span>
          <div className="ux-modal-actions">
            <button className="btn" onClick={onCopy}>{copied ? 'Copied ✓' : 'Copy C'}</button>
            <button className="btn ghost" onClick={onClose}>Close ✕</button>
          </div>
        </div>
        <pre className="ux-c mono">{code}</pre>
      </div>
    </div>
  )
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

/* ---------------------------------------------------------------------------
 *  Logo / coin-icon picker — choose a built-in template icon (dropdown grid),
 *  upload a custom image, or use the default placeholder. Built-in icons are
 *  the real LVGL assets from twi_LVGL_templates (deduped by C symbol).
 * ------------------------------------------------------------------------- */
const BUILTIN_ICONS = (() => {
  const seen = new Set(); const out = []
  for (const ic of TEMPLATE_ICONS) { if (seen.has(ic.symbol)) continue; seen.add(ic.symbol); out.push(ic) }
  return out
})()
function LogoPicker({ logo, disabled, onBuiltin, onUpload, onDefault }) {
  const [open, setOpen] = useState(false)
  const fileRef = useRef(null)
  const wrapRef = useRef(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    window.addEventListener('mousedown', onDoc)
    return () => window.removeEventListener('mousedown', onDoc)
  }, [open])
  const label = logo ? (logo.name.length > 12 ? logo.name.slice(0, 11) + '…' : logo.name) : 'Coin icon…'
  return (
    <span className="logo-picker" ref={wrapRef}>
      <button className="mini btn-like" disabled={disabled} onClick={() => setOpen((o) => !o)} title="Choose a built-in icon or upload one">
        {logo?.dataUrl
          ? <img className="logo-thumb" src={logo.dataUrl} alt="" />
          : <span>🪙</span>} {label} ▾
      </button>
      {open && (
        <div className="logo-pop">
          <div className="logo-pop-actions">
            <button className="btn ghost" onClick={() => { fileRef.current?.click() }}>⤓ Custom image…</button>
            <button className="btn ghost" onClick={() => { onDefault(); setOpen(false) }}>Default (GET_LOGO)</button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); setOpen(false) }} />
          </div>
          <div className="logo-pop-grid">
            {BUILTIN_ICONS.map((ic) => (
              <button key={ic.symbol} className={'logo-cell' + (logo?.symbol === '&' + ic.symbol ? ' on' : '')}
                title={`${ic.symbol} (${ic.w}×${ic.h})`}
                onClick={() => { onBuiltin(ic); setOpen(false) }}>
                <img src={ic.dataUrl} alt={ic.symbol} />
                <span>{ic.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </span>
  )
}

/* ---------------------------------------------------------------------------
 *  Saved screens — a localStorage library. Click a row to load it; rename or
 *  delete via the row actions. Save the current screen from the toolbar.
 * ------------------------------------------------------------------------- */
const TEMPLATE_SHORT = {
  TWI_TEMP_CHOICE_INFO: 'Choice Info',
  TWI_TEMP_CONFIRMATION: 'Confirmation',
  TWI_TEMP_LIST: 'List',
}
function SavedScreens({ saved, loadedId, onSaveAs, onLoad, onRename, onRemove }) {
  return (
    <fieldset className="pg saved-pg">
      <legend>Saved screens ({saved.length})</legend>
      <button className="btn saved-saveas" onClick={onSaveAs}>💾 Save current screen…</button>
      {saved.length === 0 ? (
        <p className="hint">No saved screens yet. Configure a screen and click “Save current screen…”. They’re stored locally in your browser.</p>
      ) : (
        <ul className="saved-list">
          {saved.map((e) => (
            <li key={e.id} className={'saved-row' + (e.id === loadedId ? ' active' : '')}>
              <button className="saved-load" title="Load this screen" onClick={() => onLoad(e.id)}>
                <span className="saved-name">{e.name}</span>
                <span className="saved-meta">{TEMPLATE_SHORT[e.model?.template] || 'Screen'}{e.model?.coin ? ' · ' + e.model.coin : ''}</span>
              </button>
              <span className="saved-actions">
                <button className="saved-act" title="Rename" onClick={() => onRename(e.id)}>✎</button>
                <button className="saved-act danger" title="Delete" onClick={() => onRemove(e.id)}>🗑</button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  )
}

/* ---------------------------------------------------------------------------
 *  Device frame — the user-supplied bezel SVG, rendered UNDISTORTED at its true
 *  aspect. Measured path bbox: x:[187.01,841.50] y:[244.39,523.04]
 *  (w=654.49, h=278.65). The bezel is scaled so its HEIGHT equals the screen
 *  height (device height == screen height — a tight frame), and the screen
 *  fills that full height, centred horizontally. The left/right bezel remains
 *  (the body is wider than the screen) but top/bottom is minimal.
 * ------------------------------------------------------------------------- */
const FRAME = {
  bbX: 187.01, bbY: 244.39, bbW: 654.49, bbH: 278.65, // measured path bounding box
}
// Path string of the supplied bezel (the rounded device body).
const FRAME_PATH =
  'M 240.5 244.967 C 213.077 248.226 194.339 265.066 188.92 291.323 ' +
  'C 187.151 299.896 187.025 305.984 187.013 383.792 C 186.998 477.066 186.916 475.802 194 490.554 ' +
  'C 201.191 505.53 215.206 516.575 232.7 521.053 C 240.403 523.025 243.897 523.05 514.277 523.041 ' +
  'C 758.456 523.032 788.78 522.863 794.777 521.475 C 817.417 516.235 834.287 499.246 839.681 476.254 ' +
  'C 841.365 469.077 841.5 462.172 841.5 383.5 C 841.5 298.516 841.5 298.498 839.239 289.626 ' +
  'C 833.34 266.471 819.716 252.508 796.985 246.322 C 790.869 244.657 775.029 244.548 518.5 244.405 ' +
  'C 368.9 244.322 243.8 244.575 240.5 244.967'

function DeviceScreen({ model, els, zoom, selected, realMode, engine, logoTick, onPointerDown, onPointerMove, onPointerUp }) {
  const W = SCREEN_W * zoom
  const H = SCREEN_H * zoom
  const canvasRef = useRef(null)

  // Render the model with the real LVGL engine into the canvas whenever the
  // model changes (or real mode turns on). Pixel-identical to the device.
  useEffect(() => {
    if (!realMode || !engine || !canvasRef.current) return
    let img
    try { img = engine.render(model) } catch (e) { console.error('LVGL render failed', e); return }
    const cv = canvasRef.current
    cv.width = SCREEN_W; cv.height = SCREEN_H
    const ctx = cv.getContext('2d')
    ctx.putImageData(img, 0, 0)
  }, [realMode, engine, model, logoTick])

  // The screen occupies SCREEN_FILL of the device — so a thin bezel surrounds
  // it (e.g. 0.9 => screen is 90% of the device, ~5% bezel top/bottom). The
  // bezel is scaled so the screen fills SCREEN_FILL of its height, then the
  // screen is centred both ways inside the frame.
  const SCREEN_FILL = 0.9
  const frameH = H / SCREEN_FILL
  const s = frameH / FRAME.bbH
  const frameW = FRAME.bbW * s
  const screenLeft = (frameW - W) / 2
  const screenTop = (frameH - H) / 2

  // viewBox = EXACTLY the path bbox so the SVG coordinate space maps 1:1 to the
  // frame box at scale s (no preserveAspectRatio letterboxing). This makes the
  // bezel's true centre and the centred screen coincide precisely.
  const vb = `${FRAME.bbX} ${FRAME.bbY} ${FRAME.bbW} ${FRAME.bbH}`

  return (
    <div className="device-frame" style={{ width: frameW, height: frameH }}>
      <svg className="device-frame-svg" viewBox={vb} width={frameW} height={frameH}
        preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <linearGradient id="bezelGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2b3645" />
            <stop offset="1" stopColor="#10161f" />
          </linearGradient>
        </defs>
        <path d={FRAME_PATH} fill="url(#bezelGrad)" stroke="#000" strokeWidth="2" />
      </svg>
      <div
        className={'device-screen' + (realMode ? ' real' : '')}
        style={{ width: W, height: H, left: screenLeft, top: screenTop }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* REAL mode: the actual LVGL framebuffer, scaled up (nearest-neighbour
            so pixels are crisp). Drag handles overlay on top. */}
        {realMode && (
          <canvas ref={canvasRef} className="dv-canvas"
            style={{ width: W, height: H }} />
        )}
        {/* SCHEMATIC mode: the CSS approximation (only when real mode is off) */}
        {!realMode && (
          <div className="dv-statusline" style={{ height: STATUS_BAR_H * zoom }} />
        )}
        {els.map((el) => (
          <Element key={el.id} el={el} zoom={zoom} selected={selected === el.id}
            handle={realMode} onPointerDown={onPointerDown} />
        ))}
      </div>
    </div>
  )
}

function Element({ el, zoom, selected, handle, onPointerDown }) {
  // In real-LVGL mode, only draggable elements appear — as transparent outlines
  // over the canvas. Non-draggable decor is already drawn by LVGL itself.
  if (handle) {
    if (!el.draggable) return null
    const hs = { left: el.x * zoom, top: el.y * zoom, width: el.w * zoom, height: el.h * zoom }
    return (
      <div className={'dv-handle' + (selected ? ' sel' : '')} style={hs}
        onPointerDown={(e) => onPointerDown(e, el)}
        title={`${el.id} @ (${el.x}, ${el.y}) ${el.w}×${el.h}`} />
    )
  }
  const f = FONTS[el.font] || { px: 14, weight: 400 }
  const style = {
    left: el.x * zoom, top: el.y * zoom, width: el.w * zoom, height: el.h * zoom,
    fontSize: f.px * zoom * 0.92, fontWeight: f.weight,
    cursor: el.draggable ? 'grab' : 'default',
  }
  const cls = ['dv-el', `dv-${el.kind}`, selected ? 'sel' : '', el.draggable ? 'drag' : '',
    el.accent ? 'accent' : '',
    el.group === 'line' ? 'dv-line' : '', el.bordered === false ? 'noborder' : '']
  // text alignment justifies the GLYPHS inside the (centered) box
  if ((el.kind === 'text' || el.kind === 'card') && el.textAlign) {
    style.justifyContent = el.textAlign === 'right' ? 'flex-end'
      : el.textAlign === 'center' ? 'center' : 'flex-start'
    style.textAlign = el.textAlign
  }
  const title = `${el.id} @ (${el.x}, ${el.y}) ${el.w}×${el.h}`
  return (
    <div className={cls.filter(Boolean).join(' ')} style={style}
      onPointerDown={(e) => onPointerDown(e, el)} title={title}>
      {el.kind === 'progress' ? (
        <div className="dv-prog-fill" />
      ) : el.kind === 'statusbar' ? (
        <span className="dv-batt" style={{ fontSize: 8 * zoom }}>▭ 100%</span>
      ) : el.kind === 'icon' ? (
        <span className="dv-icon-glyph">★</span>
      ) : el.label ? (
        <span className="dv-label">{el.label}</span>
      ) : null}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 *  Properties panel — per-template forms exposing all configurable parameters.
 * ------------------------------------------------------------------------- */
function Props({ model, patch, setModel, selected }) {
  if (model.template === 'TWI_TEMP_CHOICE_INFO') return <ChoiceInfoProps model={model} patch={patch} setModel={setModel} selected={selected} />
  if (model.template === 'TWI_TEMP_CONFIRMATION') return <ConfirmationProps model={model} patch={patch} setModel={setModel} selected={selected} />
  return <ListProps model={model} patch={patch} setModel={setModel} />
}

function Group({ title, children }) {
  return (
    <fieldset className="pg">
      <legend>{title}</legend>
      {children}
    </fieldset>
  )
}
function Row({ label, children }) {
  return <label className="prow"><span className="prow-l">{label}</span>{children}</label>
}
function Num({ value, onChange, min = -100, max = 400 }) {
  return <input className="pin num" type="number" value={value ?? 0} min={min} max={max}
    onChange={(e) => onChange(parseInt(e.target.value || '0', 10))} />
}
function Txt({ value, onChange, ph }) {
  return <input className="pin" value={value ?? ''} placeholder={ph} onChange={(e) => onChange(e.target.value)} />
}
function Chk({ value, onChange }) {
  return <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
}
function Sel({ value, onChange, options }) {
  return (
    <select className="pin" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function ChoiceInfoProps({ model, patch, setModel, selected }) {
  const setItem = (i, p) => setModel((m) => { const n = structuredClone(m); n.items[i] = { ...n.items[i], ...p }; return n })
  const setBtn = (i, p) => setModel((m) => { const n = structuredClone(m); n.buttons[i] = { ...n.buttons[i], ...p }; return n })
  return (
    <>
      <Group title="Items (top → bottom)">
        {model.items.map((it, i) => {
          const sel = selected === `item${i}`
          return (
            <div className={'subcard' + (sel ? ' sel' : '')} key={i}>
              <Row label={`Item ${i} type`}>
                <Sel value={it.kind} options={CHOICE_ITEM_KINDS} onChange={(v) => setItem(i, { kind: v })} />
              </Row>
              {it.kind !== 'TEMP_CHOICE_INFO_INVALID' && (
                <>
                  <Row label="Y coord"><Num value={it.y} onChange={(v) => setItem(i, { y: v })} /></Row>
                  {it.kind === 'TEMP_CHOICE_INFO_IMAGE' ? (
                    <Row label="Image expr"><Txt value={it.source} ph="GET_LOGO()" onChange={(v) => setItem(i, { source: v })} /></Row>
                  ) : (
                    <>
                      <Row label="Text"><Txt value={it.text} ph="literal text" onChange={(v) => setItem(i, { text: v })} /></Row>
                      <Row label="…or expr"><Txt value={it.source} ph="GET_FORMATTED(...)" onChange={(v) => setItem(i, { source: v })} /></Row>
                    </>
                  )}
                  <div className="prow-flags">
                    <label><Chk value={it.dynamic} onChange={(v) => setItem(i, { dynamic: v })} /> dynamic</label>
                    <label><Chk value={it.gesture} onChange={(v) => setItem(i, { gesture: v })} /> gesture</label>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </Group>

      <Group title="Buttons (bottom)">
        {model.buttons.map((b, i) => (
          <div className="subcard" key={i}>
            <Row label={`Button ${i} text`}><Txt value={b.text} ph="(empty = none)" onChange={(v) => setBtn(i, { text: v })} /></Row>
            {model.hasButtonWidth && <Row label="Width"><Num value={b.width} onChange={(v) => setBtn(i, { width: v })} /></Row>}
            {model.hasButtonHeight && <Row label="Height"><Num value={b.height} onChange={(v) => setBtn(i, { height: v })} /></Row>}
            {model.hasButtonXCoords && <Row label="X coord"><Num value={b.x} onChange={(v) => setBtn(i, { x: v })} /></Row>}
          </div>
        ))}
        <Row label="Buttons Y"><Num value={model.buttonsY} onChange={(v) => patch({ buttonsY: v })} /></Row>
      </Group>

      <Group title="Chrome & flags">
        <Row label="Status bar"><Chk value={model.hasStatusBar} onChange={(v) => patch({ hasStatusBar: v })} /></Row>
        <Row label="Back button"><Chk value={model.hasBackButton} onChange={(v) => patch({ hasBackButton: v })} /></Row>
        <Row label="Menu button"><Chk value={model.hasMenuButton} onChange={(v) => patch({ hasMenuButton: v })} /></Row>
        <Row label="Custom button width"><Chk value={model.hasButtonWidth} onChange={(v) => patch({ hasButtonWidth: v })} /></Row>
        <Row label="Custom button height"><Chk value={model.hasButtonHeight} onChange={(v) => patch({ hasButtonHeight: v })} /></Row>
        <Row label="Custom button X"><Chk value={model.hasButtonXCoords} onChange={(v) => patch({ hasButtonXCoords: v })} /></Row>
      </Group>

      <Group title="Background & callback">
        <Row label="Background img"><Chk value={model.hasBackgroundImg} onChange={(v) => patch({ hasBackgroundImg: v })} /></Row>
        <Row label="Background X"><Num value={model.backgroundX} onChange={(v) => patch({ backgroundX: v })} /></Row>
        <Row label="Background Y"><Num value={model.backgroundY} onChange={(v) => patch({ backgroundY: v })} /></Row>
        <Row label="Finish cb"><Txt value={model.finishCb} onChange={(v) => patch({ finishCb: v })} /></Row>
      </Group>
    </>
  )
}

function ConfirmationProps({ model, patch, setModel, selected }) {
  const setLine = (i, p) => setModel((m) => { const n = structuredClone(m); n.lines[i] = { ...n.lines[i], ...p }; return n })
  return (
    <>
      <Group title="Lines">
        <Row label="Line 1 is title"><Chk value={model.isLine1Title} onChange={(v) => patch({ isLine1Title: v })} /></Row>
        {model.lines.map((ln, i) => (
          <div className={'subcard' + (selected === `line${i}` ? ' sel' : '')} key={i}>
            <Row label={`Line ${i} text`}><Txt value={ln.text} ph="text (#RRGGBB …# colors)" onChange={(v) => setLine(i, { text: v })} /></Row>
            <Row label="…or expr"><Txt value={ln.source} ph="GET_FORMATTED(...)" onChange={(v) => setLine(i, { source: v })} /></Row>
            <Row label="Align"><Sel value={ln.align} options={TEXT_ALIGN} onChange={(v) => setLine(i, { align: v })} /></Row>
            <Row label="Y coord"><Num value={ln.y} onChange={(v) => setLine(i, { y: v })} /></Row>
            <Row label="Scrollable"><Chk value={ln.scrollable} onChange={(v) => setLine(i, { scrollable: v })} /></Row>
          </div>
        ))}
      </Group>
      <Group title="Buttons & callback">
        <Row label="Left button"><Txt value={model.leftBtnText} onChange={(v) => patch({ leftBtnText: v })} /></Row>
        <Row label="Right button"><Txt value={model.rightBtnText} onChange={(v) => patch({ rightBtnText: v })} /></Row>
        <Row label="Finish cb"><Txt value={model.finishCb} onChange={(v) => patch({ finishCb: v })} /></Row>
      </Group>
    </>
  )
}

function ListProps({ model, patch }) {
  const s = model.style
  return (
    <>
      <Group title="List">
        <Row label="Style"><Sel value={s} options={LIST_STYLES} onChange={(v) => patch({ style: v })} /></Row>
        <Row label="Back button"><Chk value={model.hasBackButton} onChange={(v) => patch({ hasBackButton: v })} /></Row>
        {s !== 'TEMP_LIST_STYLE_1' && <Row label="Title"><Txt value={model.title} onChange={(v) => patch({ title: v })} /></Row>}
      </Group>

      {s === 'TEMP_LIST_STYLE_1' && (
        <Group title="Style 1 — two big buttons">
          <Row label="Button 1 text"><Txt value={model.s1Label1} onChange={(v) => patch({ s1Label1: v })} /></Row>
          <Row label="Button 2 text"><Txt value={model.s1Label2} onChange={(v) => patch({ s1Label2: v })} /></Row>
          <Row label="Icon 1 Y"><Num value={model.icon1Y} onChange={(v) => patch({ icon1Y: v })} /></Row>
          <Row label="Icon 2 Y"><Num value={model.icon2Y} onChange={(v) => patch({ icon2Y: v })} /></Row>
          <Row label="Label 1 Y"><Num value={model.label1Y} onChange={(v) => patch({ label1Y: v })} /></Row>
          <Row label="Label 2 Y"><Num value={model.label2Y} onChange={(v) => patch({ label2Y: v })} /></Row>
        </Group>
      )}
      {(s === 'TEMP_LIST_STYLE_2' || s === 'TEMP_LIST_STYLE_3' || s === 'TEMP_LIST_STYLE_4') && (
        <Group title={s === 'TEMP_LIST_STYLE_2' ? 'Buttons (3rd optional)' : 'Items / labels'}>
          <Row label="Item 1"><Txt value={model.btn1} onChange={(v) => patch({ btn1: v })} /></Row>
          <Row label="Item 2"><Txt value={model.btn2} onChange={(v) => patch({ btn2: v })} /></Row>
          {s === 'TEMP_LIST_STYLE_2' && <Row label="Item 3"><Txt value={model.btn3} ph="(empty = 2 buttons)" onChange={(v) => patch({ btn3: v })} /></Row>}
          {s !== 'TEMP_LIST_STYLE_2' && <p className="hint">Styles 3 & 4 use dynamic item arrays at runtime; the generated C leaves a TODO for the array wiring.</p>}
        </Group>
      )}
      <Group title="Callback">
        <Row label="Finish cb"><Txt value={model.finishCb} onChange={(v) => patch({ finishCb: v })} /></Row>
      </Group>
    </>
  )
}
