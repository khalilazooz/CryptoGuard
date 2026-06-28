/* ============================================================================
 *  flowStore.js — local (localStorage) library of saved flows.
 *
 *  Each entry is the full flow object from flowModel.js (id/name/coin/nodes/
 *  edges/startNodeId/savedAt). Mirrors screenStore.js so the two libraries feel
 *  identical. Nothing leaves the browser.
 * ========================================================================== */

const KEY = 'twi.ux.savedFlows.v1'

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function write(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch (e) { console.error('saveFlows failed', e) }
  return list
}

function newId(existing) {
  let n = existing.length + 1
  let id = `f${n}`
  const ids = new Set(existing.map((e) => e.id))
  while (ids.has(id)) { n++; id = `f${n}` }
  return id
}

export function listFlows() {
  return read().slice().sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))
}

export function getFlow(id) {
  return read().find((e) => e.id === id) || null
}

/* Save a flow. If it already has an id present in the store, overwrite it;
 * otherwise mint a new id. Returns the stored flow. `now` is passed in so the
 * component owns Date.now(). */
export function saveFlow(flow, now) {
  const list = read()
  const stored = structuredClone(flow)
  stored.savedAt = now || 0
  const idx = stored.id ? list.findIndex((e) => e.id === stored.id) : -1
  if (idx >= 0) {
    list[idx] = stored
  } else {
    stored.id = newId(list)
    list.push(stored)
  }
  write(list)
  return stored
}

export function renameFlow(id, name) {
  const list = read()
  const e = list.find((x) => x.id === id)
  if (!e) return null
  e.name = (name || '').trim() || e.name
  write(list)
  return e
}

export function removeFlow(id) {
  write(read().filter((e) => e.id !== id))
}
