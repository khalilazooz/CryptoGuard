import { useState, useCallback, useRef } from 'react'

/* ============================================================================
 *  useHistory — undo/redo for a single state object (the screen model).
 *
 *  - set(next)        : normal change. Pushes the current value onto the undo
 *                       stack and clears the redo stack. `next` may be a value
 *                       or an updater fn (prev => next), like setState.
 *  - setTransient(fn) : update WITHOUT recording history (used during a drag,
 *                       where one snapshot is taken at the start via begin()).
 *  - begin()          : snapshot the current value onto the undo stack now,
 *                       so the following setTransient() calls collapse into one
 *                       undo step. No-op-safe to call repeatedly per gesture.
 *  - undo() / redo()  : move between snapshots.
 *  - reset(value)     : replace the value and clear all history (e.g. on load).
 *
 *  Snapshots are structuredClone'd so later mutation can't corrupt history.
 *  The stack is capped to avoid unbounded growth.
 * ========================================================================== */

const LIMIT = 100

export function useHistory(initial) {
  const [present, setPresent] = useState(initial)
  const pastRef = useRef([])
  const futureRef = useRef([])
  const beganRef = useRef(false)   // a gesture snapshot is pending for this drag
  const [, force] = useState(0)
  const rerender = () => force((n) => n + 1)

  const snapshot = (v) => structuredClone(v)

  const pushPast = useCallback((v) => {
    pastRef.current.push(snapshot(v))
    if (pastRef.current.length > LIMIT) pastRef.current.shift()
    futureRef.current = []
  }, [])

  // normal, history-recording change
  const set = useCallback((next) => {
    setPresent((prev) => {
      const value = typeof next === 'function' ? next(prev) : next
      if (value === prev) return prev
      pushPast(prev)
      return value
    })
  }, [pushPast])

  // begin a coalesced gesture: snapshot once, mark so setTransient won't push
  const begin = useCallback(() => {
    if (beganRef.current) return
    beganRef.current = true
    setPresent((prev) => { pushPast(prev); return prev })
  }, [pushPast])

  // update during a gesture without adding history
  const setTransient = useCallback((next) => {
    setPresent((prev) => (typeof next === 'function' ? next(prev) : next))
  }, [])

  // end the gesture (next non-transient change starts a new history entry)
  const end = useCallback(() => { beganRef.current = false }, [])

  const undo = useCallback(() => {
    setPresent((prev) => {
      if (pastRef.current.length === 0) return prev
      const value = pastRef.current.pop()
      futureRef.current.push(snapshot(prev))
      rerender()
      return value
    })
  }, [])

  const redo = useCallback(() => {
    setPresent((prev) => {
      if (futureRef.current.length === 0) return prev
      const value = futureRef.current.pop()
      pastRef.current.push(snapshot(prev))
      rerender()
      return value
    })
  }, [])

  const reset = useCallback((value) => {
    pastRef.current = []
    futureRef.current = []
    beganRef.current = false
    setPresent(value)
    rerender()
  }, [])

  return {
    model: present,
    set, setTransient, begin, end,
    undo, redo, reset,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
  }
}
