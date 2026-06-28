/* ============================================================================
 *  flowModel.js — the data model for the Flow Designer.
 * ----------------------------------------------------------------------------
 *  A "flow" wires together saved UX-Designer screens into a navigable state
 *  machine — exactly the thing the firmware's twi_<coin>_ux.c driver encodes.
 *
 *  Each saved screen (from screenStore.js) exposes a set of PORTS:
 *    - one port per visible button (choice_info buttons / confirmation
 *      left+right / list buttons), keyed by the firmware button enum, and
 *    - an implicit "timeout" port for splash-style screens that auto-advance.
 *
 *  A flow EDGE connects (fromNode, port) -> toNode. The Run mode walks these
 *  edges; the code generator turns them into REPLACE_CURRENT_SCREEN_WITH
 *  transitions inside the per-template completion callbacks.
 *
 *  Everything mirrors the firmware vocabulary so the generated C reads like the
 *  hand-written drivers (see twi_aptos_ux.c).
 * ========================================================================== */

/* ----------------------------------------------------------------------------
 *  PORT EXTRACTION — given a screen's editor model, what can be wired from it?
 *
 *  Port shape: { id, label, kind, btnEnum }
 *    id      : stable per-screen key used in edges  (e.g. 'btn0', 'left', 'timeout')
 *    label   : human label for the UI               (the button text)
 *    kind    : 'button' | 'timeout'
 *    btnEnum : the firmware button identifier this port maps to, used by the
 *              code generator (e.g. TEMP_CHOICE_INFO_1ST_BUTTON). null for
 *              timeout ports (those fire from the splash timer, not a press).
 * ------------------------------------------------------------------------- */

/* choice_info press enums (tenu_temp_choice_info_pressed_button) */
const CI_BUTTON_ENUM = ['TEMP_CHOICE_INFO_1ST_BUTTON', 'TEMP_CHOICE_INFO_2ND_BUTTON']
const CI_BACK_ENUM = 'TEMP_CHOICE_INFO_BACK_BUTTON'
/* confirmation button ids (twi_template_confirmation) */
const CF_LEFT_ENUM = 'TWI_TEMPLATE_CONFIRMATION_BUTTON_LEFT'
const CF_RIGHT_ENUM = 'TWI_TEMPLATE_CONFIRMATION_BUTTON_RIGHT'
/* list press enums (tenu_temp_list_pressed_button) */
const LIST_BUTTON_ENUM = ['TEMP_LIST_1ST_BUTTON', 'TEMP_LIST_2ND_BUTTON', 'TEMP_LIST_3RD_BUTTON']
const LIST_BACK_ENUM = 'TEMP_LIST_BACK_BUTTON'

export function screenPorts(model) {
  if (!model) return []
  if (model.template === 'TWI_TEMP_CHOICE_INFO') return choiceInfoPorts(model)
  if (model.template === 'TWI_TEMP_CONFIRMATION') return confirmationPorts(model)
  if (model.template === 'TWI_TEMP_LIST') return listPorts(model)
  return []
}

function choiceInfoPorts(m) {
  const ports = []
  if (m.hasBackButton) ports.push({ id: 'back', label: '‹ Back', kind: 'button', btnEnum: CI_BACK_ENUM })
  ;(m.buttons || []).forEach((b, i) => {
    if (b && b.text && b.text.trim() && i < CI_BUTTON_ENUM.length) {
      ports.push({ id: `btn${i}`, label: b.text.trim(), kind: 'button', btnEnum: CI_BUTTON_ENUM[i] })
    }
  })
  return ports
}

function confirmationPorts(m) {
  return [
    { id: 'left', label: m.leftBtnText || 'Back', kind: 'button', btnEnum: CF_LEFT_ENUM },
    { id: 'right', label: m.rightBtnText || 'Next', kind: 'button', btnEnum: CF_RIGHT_ENUM },
  ]
}

function listPorts(m) {
  const ports = []
  const s = m.style
  if (m.hasBackButton) ports.push({ id: 'back', label: '‹ Back', kind: 'button', btnEnum: LIST_BACK_ENUM })
  if (s === 'TEMP_LIST_STYLE_1') {
    if (m.s1Label1?.trim()) ports.push({ id: 'btn0', label: m.s1Label1.trim(), kind: 'button', btnEnum: LIST_BUTTON_ENUM[0] })
    if (m.s1Label2?.trim()) ports.push({ id: 'btn1', label: m.s1Label2.trim(), kind: 'button', btnEnum: LIST_BUTTON_ENUM[1] })
  } else {
    const labels = [m.btn1, m.btn2, m.btn3]
    labels.forEach((t, i) => {
      if (t && t.trim()) ports.push({ id: `btn${i}`, label: t.trim(), kind: 'button', btnEnum: LIST_BUTTON_ENUM[i] })
    })
  }
  return ports
}

/* The full port list for a NODE, including its timeout port when the node is a
 * splash/status role (those auto-advance). Button ports come from the model. */
export function nodePorts(node, model) {
  const ports = screenPorts(model)
  if (node && (node.role === 'splash' || node.role === 'status')) {
    ports.push(timeoutPort())
  }
  return ports
}

/* The implicit auto-advance port for splash-style screens. */
export function timeoutPort() {
  return { id: 'timeout', label: '⏱ after timeout', kind: 'timeout', btnEnum: null }
}



/* ----------------------------------------------------------------------------
 *  PORT HOTSPOT GEOMETRY — the EXACT on-screen pixel rectangle of each button,
 *  taken from the TWI LVGL template sources (320x170 screen), converted to
 *  0..1 fractions. Used by the Flow Designer to hit-test clicks/hover against
 *  the screen's OWN buttons (no overlay elements are drawn). The engine renders
 *  confirmation, list-style-2, and everything-else-as-choice_info, so the rects
 *  here match those three render paths exactly.
 *    rect: { id, label, kind, btnEnum, x, y, w, h }   (x/y/w/h are 0..1)
 *  Sources: twi_template_confirmation.c, twi_template_choice_info.c,
 *  twi_template_list_style_1/2.c, twi_template_common.c (back button).
 * ------------------------------------------------------------------------- */
const SCR_W = 320, SCR_H = 170
const px = (x, y, w, h) => ({ x: x / SCR_W, y: y / SCR_H, w: w / SCR_W, h: h / SCR_H })
const BACK_RECT = px(20, 0, 40, 30) // common back button (y=-5,h=35 -> visible 0..30)

export function portRects(model) {
  if (!model) return []
  const ports = screenPorts(model)
  const byId = (id) => ports.find((p) => p.id === id)
  const out = []
  const add = (id, rect) => { const p = byId(id); if (p) out.push({ ...p, ...rect }) }

  if (model.template === 'TWI_TEMP_CONFIRMATION') {
    add('left', px(40, 110, 100, 40))
    add('right', px(180, 110, 100, 40))
    return out
  }

  if (model.template === 'TWI_TEMP_LIST' && model.style === 'TEMP_LIST_STYLE_2') {
    if (byId('back')) add('back', BACK_RECT)
    const rows = ports.filter((p) => p.id.startsWith('btn'))
    if (rows.length === 3) {
      const xs = [10, 115, 220]
      rows.forEach((p, i) => add(p.id, px(xs[i], 60, 90, 100)))
    } else {
      const xs = [40, 168]
      rows.forEach((p, i) => add(p.id, px(xs[i], 60, 113, 100)))
    }
    return out
  }

  if (model.template === 'TWI_TEMP_LIST') {
    // styles 1/3/4 render via the choice-info path; style-1 uses two side-by-side
    // big tiles (item0 left, item1 right).
    if (byId('back')) add('back', BACK_RECT)
    const hasBack = !!byId('back')
    const y = hasBack ? 45 : 30
    const rows = ports.filter((p) => p.id.startsWith('btn'))
    const xs = [30, 170]
    rows.forEach((p, i) => add(p.id, px(xs[i] ?? 30, y, 120, 110)))
    return out
  }

  // CHOICE_INFO (default). Back top-left; 1-2 action buttons at the model's
  // buttonsY (default near the bottom). Honour per-button x/width/height overrides.
  if (byId('back')) add('back', BACK_RECT)
  const acts = ports.filter((p) => p.id.startsWith('btn'))
  const b = model.buttons || []
  const defH = 40
  const by = (model.buttonsY && model.buttonsY > 0) ? model.buttonsY : 122 // sane default low on screen
  if (acts.length === 1) {
    const i = portIndex(acts[0].id)
    const w = (model.hasButtonWidth && b[i]?.width) ? b[i].width : 240
    const x = (model.hasButtonXCoords && b[i]?.x != null) ? b[i].x : 40
    const h = (model.hasButtonHeight && b[i]?.height) ? b[i].height : defH
    add(acts[0].id, px(x, by, w, h))
  } else {
    const defX = [40, 180]
    acts.forEach((p) => {
      const i = portIndex(p.id)
      const w = (model.hasButtonWidth && b[i]?.width) ? b[i].width : 100
      const x = (model.hasButtonXCoords && b[i]?.x != null) ? b[i].x : (defX[i] ?? 40)
      const h = (model.hasButtonHeight && b[i]?.height) ? b[i].height : defH
      add(p.id, px(x, by, w, h))
    })
  }
  return out
}
function portIndex(id) { const m = /^btn(\d+)$/.exec(id); return m ? Number(m[1]) : 0 }
/* ----------------------------------------------------------------------------
 *  NODE ROLES — how a screen behaves in the running state machine. These map
 *  onto the firmware's distinct screen categories (see twi_aptos_ux.c):
 *    home    : the idle screen the applet boots into and returns to
 *    normal  : an ordinary interactive screen
 *    splash  : auto-advances after a timeout to its wired target
 *    status  : a terminal splash that resets the applet back to Home
 * ------------------------------------------------------------------------- */
export const NODE_ROLES = [
  { value: 'normal', label: 'Normal' },
  { value: 'home', label: 'Home (boot screen)' },
  { value: 'splash', label: 'Splash → target' },
  { value: 'status', label: 'Status → Home' },
]

export const DEFAULT_SPLASH_MS = 3000

/* ----------------------------------------------------------------------------
 *  FLOW STRUCTURE
 *    flow = {
 *      id, name, coin, savedAt, startNodeId,
 *      nodes: [ { nodeId, screenId, role, timeoutMs, x, y } ],
 *      edges: [ { from: nodeId, port: portId, to: nodeId } ],
 *    }
 *  nodeId == screenId (a saved screen appears at most once on the canvas).
 * ------------------------------------------------------------------------- */

export function makeNode(screenId, x = 40, y = 40) {
  return { nodeId: screenId, screenId, role: 'normal', timeoutMs: DEFAULT_SPLASH_MS, x, y }
}

export function emptyFlow() {
  return { id: null, name: '', coin: 'coin', nodes: [], edges: [], startNodeId: null, savedAt: 0 }
}

/* Add / move / remove a node. Adding a duplicate screen is a no-op. */
export function addNode(flow, screenId, x, y) {
  if (flow.nodes.some((n) => n.nodeId === screenId)) return flow
  const node = makeNode(screenId, x, y)
  const startNodeId = flow.startNodeId || screenId
  return { ...flow, nodes: [...flow.nodes, node], startNodeId }
}
export function moveNode(flow, nodeId, x, y) {
  return { ...flow, nodes: flow.nodes.map((n) => (n.nodeId === nodeId ? { ...n, x, y } : n)) }
}
export function updateNode(flow, nodeId, patch) {
  return { ...flow, nodes: flow.nodes.map((n) => (n.nodeId === nodeId ? { ...n, ...patch } : n)) }
}
export function removeNode(flow, nodeId) {
  return {
    ...flow,
    nodes: flow.nodes.filter((n) => n.nodeId !== nodeId),
    edges: flow.edges.filter((e) => e.from !== nodeId && e.to !== nodeId),
    startNodeId: flow.startNodeId === nodeId ? (flow.nodes.find((n) => n.nodeId !== nodeId)?.nodeId ?? null) : flow.startNodeId,
  }
}
export function getNode(flow, nodeId) {
  return flow.nodes.find((n) => n.nodeId === nodeId) || null
}

/* Edge helpers — a (from, port) pair has exactly one target (replace-on-set). */
export function setEdge(flow, from, port, to) {
  const edges = flow.edges.filter((e) => !(e.from === from && e.port === port))
  if (to != null) edges.push({ from, port, to })
  return { ...flow, edges }
}
export function clearEdge(flow, from, port) {
  return { ...flow, edges: flow.edges.filter((e) => !(e.from === from && e.port === port)) }
}
export function edgeTarget(flow, from, port) {
  return flow.edges.find((e) => e.from === from && e.port === port)?.to ?? null
}

/* ----------------------------------------------------------------------------
 *  VALIDATION — surface gaps before generate / run. Returns string warnings.
 * ------------------------------------------------------------------------- */
export function validateFlow(flow, screensById) {
  const warns = []
  if (flow.nodes.length === 0) { warns.push('No screens added to the flow yet.'); return warns }
  if (!flow.startNodeId) warns.push('No start (Home) screen chosen.')
  for (const node of flow.nodes) {
    const scr = screensById[node.screenId]
    if (!scr) { warns.push(`Node "${node.nodeId}" references a deleted saved screen.`); continue }
    const ports = nodePorts(node, scr.model)
    for (const p of ports) {
      const to = edgeTarget(flow, node.nodeId, p.id)
      if (to == null && node.role !== 'status') {
        warns.push(`"${scr.name}" → ${p.label} is not wired to a screen.`)
      }
    }
    if (node.role === 'splash' && edgeTarget(flow, node.nodeId, 'timeout') == null) {
      warns.push(`Splash "${scr.name}" has no timeout target.`)
    }
  }
  return warns
}
