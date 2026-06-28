/* ============================================================================
 *  figExport.js — per-coin SVG board export for the Flow Designer.
 * ----------------------------------------------------------------------------
 *  Emits a real, openable SVG: one rectangle per screen (with its pixel-accurate
 *  LVGL thumbnail) laid out on a board, plus connector arrows for every wired
 *  flow transition. Figma imports SVG natively (drag-drop, or File › Place),
 *  so this opens cleanly there and anywhere else.
 *
 *  buildScene()    -> a portable scene (frames + positions + connectors).
 *  buildBoardSvg() -> the SVG string (screens + arrows), thumbnails embedded
 *                     as data-URI <image> when the caller supplies them.
 *  NOTE: a native Figma .fig is a proprietary fig-kiwi binary (undocumented,
 *  version-specific Kiwi schema), so SVG is the reliable interchange format.
 * ========================================================================== */

import { screenPorts, edgeTarget } from './flowModel.js'

const SCREEN_W = 320
const SCREEN_H = 170

/* ---- scene model ---------------------------------------------------------- */
/* A portable scene: one FRAME per screen on a grid, plus CONNECTOR edges. This
 * is exactly what a Figma plugin needs to rebuild the board. */
export function buildScene(flow, screensById) {
  const COLS = 4
  const GAP_X = 120
  const GAP_Y = 140
  const order = flow.nodes
  const pos = {}
  const frames = order.map((n, i) => {
    const scr = screensById[n.screenId]
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const x = 80 + col * (SCREEN_W + GAP_X)
    const y = 80 + row * (SCREEN_H + GAP_Y)
    pos[n.nodeId] = { x, y }
    return {
      id: n.nodeId,
      name: scr?.name || n.nodeId,
      template: scr?.model?.template || 'unknown',
      role: n.role,
      x, y, width: SCREEN_W, height: SCREEN_H,
      buttons: screenPorts(scr?.model).map((p) => ({ id: p.id, label: p.label, kind: p.kind })),
    }
  })
  const connectors = []
  for (const n of order) {
    const scr = screensById[n.screenId]
    const ports = screenPorts(scr?.model)
    if (n.role === 'splash' || n.role === 'status') ports.push({ id: 'timeout', label: '⏱ timeout', kind: 'timeout' })
    for (const p of ports) {
      const to = edgeTarget(flow, n.nodeId, p.id)
      if (to) connectors.push({ from: n.nodeId, fromPort: p.id, label: p.label, to })
    }
  }
  return {
    name: `${flow.coin || 'coin'}_ux`,
    coin: flow.coin || 'coin',
    device: { width: SCREEN_W, height: SCREEN_H },
    startNodeId: flow.startNodeId,
    frames, connectors, positions: pos,
  }
}

/* ---- SVG board ------------------------------------------------------------ */
/* renderPng(model) -> dataURL is supplied by the caller (the LVGL engine), so we
 * can embed pixel-accurate screen images. Falls back to a labelled rectangle. */
export function buildBoardSvg(scene, screensById, thumbs) {
  const pad = 40
  const maxX = Math.max(...scene.frames.map((f) => f.x + f.width), 400) + pad
  const maxY = Math.max(...scene.frames.map((f) => f.y + f.height + 30), 300) + pad
  const parts = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${maxX}" height="${maxY}" viewBox="0 0 ${maxX} ${maxY}" font-family="sans-serif">`)
  parts.push(`<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,3 L0,6 Z" fill="#7c3aed"/></marker></defs>`)
  parts.push(`<rect width="${maxX}" height="${maxY}" fill="#f4f6f9"/>`)

  /* connectors first (under frames) */
  for (const c of scene.connectors) {
    const a = scene.positions[c.from], b = scene.positions[c.to]
    if (!a || !b) continue
    const x1 = a.x + SCREEN_W / 2, y1 = a.y + SCREEN_H
    const x2 = b.x + SCREEN_W / 2, y2 = b.y
    const midY = (y1 + y2) / 2
    parts.push(`<path d="M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}" fill="none" stroke="#7c3aed" stroke-width="1.5" marker-end="url(#arrow)" opacity="0.8"/>`)
    parts.push(`<text x="${(x1 + x2) / 2}" y="${midY - 3}" font-size="11" fill="#7c3aed" text-anchor="middle">${esc(c.label)}</text>`)
  }
  /* frames */
  for (const f of scene.frames) {
    const isHome = f.role === 'home' || f.id === scene.startNodeId
    parts.push(`<g>`)
    parts.push(`<rect x="${f.x}" y="${f.y}" width="${f.width}" height="${f.height}" rx="6" fill="#ffffff" stroke="${isHome ? '#7c3aed' : '#cbd2dc'}" stroke-width="${isHome ? 2.5 : 1}"/>`)
    const t = thumbs && thumbs[f.id]
    if (t) parts.push(`<image x="${f.x}" y="${f.y}" width="${f.width}" height="${f.height}" href="${t}" preserveAspectRatio="xMidYMid slice"/>`)
    parts.push(`<text x="${f.x + 6}" y="${f.y - 8}" font-size="13" font-weight="600" fill="#1c2430">${esc(f.name)}${isHome ? '  ★' : ''}</text>`)
    parts.push(`</g>`)
  }
  parts.push(`</svg>`)
  return parts.join('\n')
}
function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

/* Trigger a browser download of an arbitrary blob/string. */
export function download(name, content, mime) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime || 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = name
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
