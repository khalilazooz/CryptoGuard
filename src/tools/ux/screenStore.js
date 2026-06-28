/* ============================================================================
 *  screenStore.js — local (localStorage) library of saved screen configs.
 *
 *  Each entry: { id, name, model, savedAt }.  `model` is the editor's full
 *  screen model object (template + all params), so loading restores exactly.
 *  Everything lives in the browser; nothing leaves the machine.
 * ========================================================================== */

const KEY = 'twi.ux.savedScreens.v1'

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
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch (e) { console.error('saveScreens failed', e) }
  return list
}

/* a small id that doesn't need crypto/random APIs (those are fine in the
   browser, but keep it dependency-free + stable) */
function newId(existing) {
  let n = existing.length + 1
  let id = `s${n}`
  const ids = new Set(existing.map((e) => e.id))
  while (ids.has(id)) { n++; id = `s${n}` }
  return id
}

export function listScreens() {
  // newest first
  return read().slice().sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))
}

/* Save a new config (deep-cloned so later edits don't mutate it). Returns the
   new entry. `now` is passed in (Date.now from the component) to stay testable. */
export function saveScreen(name, model, now) {
  const list = read()
  const entry = {
    id: newId(list),
    name: (name || 'Untitled').trim() || 'Untitled',
    model: structuredClone(model),
    savedAt: now || 0,
  }
  list.push(entry)
  write(list)
  return entry
}

/* Overwrite an existing entry's model (used by "Update" on a loaded screen). */
export function updateScreenModel(id, model, now) {
  const list = read()
  const e = list.find((x) => x.id === id)
  if (!e) return null
  e.model = structuredClone(model)
  e.savedAt = now || e.savedAt
  write(list)
  return e
}

export function renameScreen(id, name) {
  const list = read()
  const e = list.find((x) => x.id === id)
  if (!e) return null
  e.name = (name || '').trim() || e.name
  write(list)
  return e
}

export function removeScreen(id) {
  write(read().filter((e) => e.id !== id))
}

export function getScreen(id) {
  return read().find((e) => e.id === id) || null
}
