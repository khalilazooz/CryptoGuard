/* ============================================================================
 *  generateUxC.js — emit twi_<coin>_ux.c, the flow/state-machine driver.
 * ----------------------------------------------------------------------------
 *  This is the COMPANION to uxModel.js's generateC(): that one emits the
 *  per-screen prepare_*_temp() CONTEXT functions (-> twi_<coin>_ux_contexts.c);
 *  this one emits the DRIVER that wires those screens into a navigable flow
 *  (-> twi_<coin>_ux.c), in the exact shape of the hand-written twi_aptos_ux.c.
 *
 *  Inputs:
 *    flow        — flowModel flow { coin, nodes[], edges[], startNodeId }
 *    screensById — { [screenId]: { id, name, model } } from screenStore
 *
 *  What we generate (the parts that depend on the flow graph):
 *    - tenu_<coin>_screens enum (one entry per node, in flow order, + INVALID)
 *    - the three completion callbacks (choice_info / confirmation / list) whose
 *      switch(genu_current_screen){...} bodies REPLACE_CURRENT_SCREEN_WITH the
 *      wired targets, honouring per-button transitions and splash/status roles
 *    - replace_current_screen_with(), the splash-timer helper, the dispatcher's
 *      splash/status handling, and the home-load + init/entry boilerplate
 *
 *  The non-flow plumbing (APDU contexts, sys-event handlers, format helpers) is
 *  emitted as clearly-marked scaffolding the engineer fills per coin — the same
 *  division the skill uses. The goal is a file that compiles in shape and reads
 *  like the existing coin drivers, with every screen transition already wired.
 * ========================================================================== */

import { screenPorts, nodePorts, edgeTarget } from './flowModel.js'

/* ---- naming helpers -------------------------------------------------------- */
const up = (s) => String(s || '').toUpperCase()
const low = (s) => String(s || '').toLowerCase()

/* SCREEN enum identifier for a node: <COIN>_<SCREENNAME>. The screen name comes
 * from the saved screen's model.screenName (already firmware-ish), uppercased. */
function screenEnum(coin, scr) {
  const name = up(scr?.model?.screenName || scr?.name || 'SCREEN').replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  return `${up(coin)}_${name}`
}

/* The C identifier base used across the file, e.g. "aptos". */
function coinId(coin) {
  return low(coin).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'coin'
}

/* Template of a node's saved screen. */
function tmplOf(scr) { return scr?.model?.template }

/* The completion-callback name a screen template routes through. Mirrors the
 * UX-Designer default callbacks: choice_info_temp_cb / confirmation_temp_cb /
 * list_temp_cb. */
function cbFor(tmpl) {
  if (tmpl === 'TWI_TEMP_CONFIRMATION') return 'confirmation_temp_cb'
  if (tmpl === 'TWI_TEMP_LIST') return 'list_temp_cb'
  return 'choice_info_temp_cb'
}

/* ============================================================================
 *  Build a normalized view of the flow for code-gen.
 * ========================================================================== */
function analyze(flow, screensById) {
  const CID = coinId(flow.coin)
  const COIN = up(CID)
  const nodes = flow.nodes
    .map((n) => {
      const scr = screensById[n.screenId]
      if (!scr) return null
      return {
        node: n,
        scr,
        tmpl: tmplOf(scr),
        enumName: screenEnum(flow.coin, scr),
        cb: cbFor(tmplOf(scr)),
      }
    })
    .filter(Boolean)

  const byNodeId = {}
  nodes.forEach((e) => { byNodeId[e.node.nodeId] = e })

  const homeEntry =
    nodes.find((e) => e.node.role === 'home') ||
    nodes.find((e) => e.node.nodeId === flow.startNodeId) ||
    nodes[0]

  return { CID, COIN, nodes, byNodeId, homeEntry }
}

/* The target enum a (node, port) edge points at, or null. */
function targetEnum(flow, byNodeId, fromNodeId, portId) {
  const to = edgeTarget(flow, fromNodeId, portId)
  if (to == null) return null
  return byNodeId[to]?.enumName || null
}

/* ============================================================================
 *  ENUM
 * ========================================================================== */
function genScreensEnum(a) {
  const L = []
  L.push(`/* On-device screens for the ${a.COIN} flow (generated from the Flow Designer). */`)
  L.push(`typedef enum`)
  L.push(`{`)
  a.nodes.forEach((e, i) => {
    const tag = e.node.role === 'home' ? '   /* boot / idle */'
      : e.node.role === 'splash' ? '   /* splash -> timeout target */'
      : e.node.role === 'status' ? '   /* status -> resets to home */' : ''
    L.push(`    ${e.enumName}${i === 0 ? ' = 0' : ''},${tag}`)
  })
  L.push(`    ${a.COIN}_INVALID_SCREEN`)
  L.push(`} tenu_${a.CID}_screens;`)
  return L.join('\n')
}

/* ============================================================================
 *  CALLBACKS — one switch(genu_current_screen) per template, listing only the
 *  screens that use that template.
 * ========================================================================== */

/* Emit the per-screen case body for a choice_info screen: map each present
 * button port to its wired transition (or a reject/exit if it's the back/1st
 * with no target on a request-style screen). */
function genChoiceInfoCb(a, flow) {
  const screens = a.nodes.filter((e) => e.tmpl === 'TWI_TEMP_CHOICE_INFO')
  const L = []
  L.push(`void choice_info_temp_cb(tenu_template_id enu_template, void* pv)`)
  L.push(`{`)
  L.push(`    tstr_temp_choice_info_out* pstr_out = (tstr_temp_choice_info_out*)pv;`)
  L.push(`    (void)enu_template;`)
  L.push(`    epstr_twi_apis->restart_sleep_timer();`)
  L.push(``)
  if (screens.length === 0) {
    L.push(`    (void)pstr_out;`)
    L.push(`}`)
    return L.join('\n')
  }
  L.push(`    switch (genu_current_screen)`)
  L.push(`    {`)
  screens.forEach((e) => {
    L.push(`        case ${e.enumName}:`)
    const ports = screenPorts(e.scr.model).filter((p) => p.kind === 'button')
    let first = true
    ports.forEach((p) => {
      const tgt = targetEnum(flow, a.byNodeId, e.node.nodeId, p.id)
      const cond = `pstr_out->enu_pressed_button == ${p.btnEnum}`
      L.push(`            ${first ? 'if' : 'else if'} (${cond})`)
      L.push(`            {`)
      L.push(`                /* ${p.label} */`)
      if (tgt) {
        L.push(`                REPLACE_CURRENT_SCREEN_WITH(${tgt});`)
        const tnode = a.nodes.find((x) => x.enumName === tgt)
        if (tnode && (tnode.node.role === 'splash' || tnode.node.role === 'status')) {
          L.push(`                ${a.CID}_transaction_splash_screen(${tnode.node.timeoutMs}U);`)
        }
      } else {
        L.push(`                /* TODO: wire this button in the Flow Designer (no target set). */`)
      }
      L.push(`            }`)
      first = false
    })
    L.push(`            break;`)
  })
  L.push(`        default:`)
  L.push(`            break;`)
  L.push(`    }`)
  L.push(`}`)
  return L.join('\n')
}

function genConfirmationCb(a, flow) {
  const screens = a.nodes.filter((e) => e.tmpl === 'TWI_TEMP_CONFIRMATION')
  const L = []
  L.push(`void confirmation_temp_cb(tenu_template_id enu_template, void* pv)`)
  L.push(`{`)
  L.push(`    tstr_temp_confirmation_out* pstr_out = (tstr_temp_confirmation_out*)pv;`)
  L.push(`    (void)enu_template;`)
  L.push(`    epstr_twi_apis->restart_sleep_timer();`)
  L.push(``)
  if (screens.length === 0) {
    L.push(`    (void)pstr_out;`)
    L.push(`}`)
    return L.join('\n')
  }
  L.push(`    switch (genu_current_screen)`)
  L.push(`    {`)
  screens.forEach((e) => {
    L.push(`        case ${e.enumName}:`)
    const left = targetEnum(flow, a.byNodeId, e.node.nodeId, 'left')
    const right = targetEnum(flow, a.byNodeId, e.node.nodeId, 'right')
    L.push(`            if (pstr_out->button_pressed_id == TWI_TEMPLATE_CONFIRMATION_BUTTON_LEFT)`)
    L.push(`            {`)
    L.push(`                /* ${e.scr.model.leftBtnText || 'Back'} */`)
    if (left) emitTransition(L, a, left, '                ')
    else L.push(`                /* TODO: wire the left button in the Flow Designer. */`)
    L.push(`            }`)
    L.push(`            else`)
    L.push(`            {`)
    L.push(`                /* ${e.scr.model.rightBtnText || 'Next'} */`)
    if (right) emitTransition(L, a, right, '                ')
    else L.push(`                /* TODO: wire the right button in the Flow Designer. */`)
    L.push(`            }`)
    L.push(`            break;`)
  })
  L.push(`        default:`)
  L.push(`            break;`)
  L.push(`    }`)
  L.push(`}`)
  return L.join('\n')
}

function genListCb(a, flow) {
  const screens = a.nodes.filter((e) => e.tmpl === 'TWI_TEMP_LIST')
  const L = []
  L.push(`void list_temp_cb(tenu_template_id enu_template, void* pv)`)
  L.push(`{`)
  L.push(`    tstr_temp_list_out* pstr_out = (tstr_temp_list_out*)pv;`)
  L.push(`    (void)enu_template;`)
  L.push(`    epstr_twi_apis->restart_sleep_timer();`)
  L.push(``)
  if (screens.length === 0) {
    L.push(`    (void)pstr_out;`)
    L.push(`}`)
    return L.join('\n')
  }
  L.push(`    switch (genu_current_screen)`)
  L.push(`    {`)
  screens.forEach((e) => {
    L.push(`        case ${e.enumName}:`)
    const ports = screenPorts(e.scr.model).filter((p) => p.kind === 'button')
    let first = true
    ports.forEach((p) => {
      const tgt = targetEnum(flow, a.byNodeId, e.node.nodeId, p.id)
      L.push(`            ${first ? 'if' : 'else if'} (pstr_out->enu_pressed_button == ${p.btnEnum})`)
      L.push(`            {`)
      L.push(`                /* ${p.label} */`)
      if (tgt) emitTransition(L, a, tgt, '                ')
      else L.push(`                /* TODO: wire this button in the Flow Designer. */`)
      L.push(`            }`)
      first = false
    })
    L.push(`            break;`)
  })
  L.push(`        default:`)
  L.push(`            break;`)
  L.push(`    }`)
  L.push(`}`)
  return L.join('\n')
}

/* A transition to `tgt` enum: switch screen, and if the target is a splash/
 * status screen, also kick its splash timer. */
function emitTransition(L, a, tgt, ind) {
  L.push(`${ind}REPLACE_CURRENT_SCREEN_WITH(${tgt});`)
  const tnode = a.nodes.find((x) => x.enumName === tgt)
  if (tnode && (tnode.node.role === 'splash' || tnode.node.role === 'status')) {
    L.push(`${ind}${a.CID}_transaction_splash_screen(${tnode.node.timeoutMs}U);`)
  }
}

/* ============================================================================
 *  DISPATCHER — splash/status screens auto-advance when their timer fires.
 *    splash : timeout -> its wired 'timeout' target
 *    status : timeout -> reset applet, back to Home
 * ========================================================================== */
function genDispatcher(a, flow) {
  const L = []
  const splashNodes = a.nodes.filter((e) => e.node.role === 'splash')
  const statusNodes = a.nodes.filter((e) => e.node.role === 'status')
  L.push(`static void twi_dispatcher(void)`)
  L.push(`{`)
  L.push(`    if (gb_handle_timer_cb)`)
  L.push(`    {`)
  L.push(`        gb_handle_timer_cb = TWI_FALSE;`)
  L.push(`        switch (genu_current_screen)`)
  L.push(`        {`)
  splashNodes.forEach((e) => {
    const tgt = targetEnum(flow, a.byNodeId, e.node.nodeId, 'timeout')
    L.push(`            case ${e.enumName}:`)
    if (tgt) emitTransition(L, a, tgt, '                ')
    else L.push(`                /* TODO: set this splash's timeout target in the Flow Designer. */`)
    L.push(`                break;`)
  })
  if (statusNodes.length) {
    statusNodes.forEach((e) => L.push(`            case ${e.enumName}:`))
    L.push(`                ${a.COIN}_APPLET_RESET();`)
    L.push(`                REPLACE_CURRENT_SCREEN_WITH(${a.homeEntry.enumName});`)
    L.push(`                break;`)
  }
  L.push(`            default:`)
  L.push(`                break;`)
  L.push(`        }`)
  L.push(`    }`)
  L.push(``)
  L.push(`    if (gb_pending_ui_req)`)
  L.push(`    {`)
  L.push(`        /* TODO: re-issue the pending UI request once back on Home. */`)
  L.push(`    }`)
  L.push(`}`)
  return L.join('\n')
}

/* ============================================================================
 *  TOP-LEVEL FILE
 * ========================================================================== */
export function generateUxC(flow, screensById) {
  const a = analyze(flow, screensById)
  if (a.nodes.length === 0) {
    return '/* Add screens to the flow first — nothing to generate. */\n'
  }
  const { CID, COIN } = a
  const home = a.homeEntry.enumName

  const parts = []

  parts.push(`/****************************************************************************/`)
  parts.push(`/* Copyright (c) 2026 Thirdwayv, Inc. All Rights Reserved.                  */`)
  parts.push(`/****************************************************************************/`)
  parts.push(`/**`)
  parts.push(` *  @file       twi_${CID}_ux.c`)
  parts.push(` *  @brief      ${COIN} applet UX driver — GENERATED by the Flow Designer.`)
  parts.push(` *`)
  parts.push(` *              The screen enum, the per-template completion callbacks, and`)
  parts.push(` *              the splash/status timer handling below are wired straight from`)
  parts.push(` *              the flow graph. The APDU-context / sys-event / format plumbing`)
  parts.push(` *              is scaffolding (mirrors twi_aptos_ux.c) — fill the TODOs with`)
  parts.push(` *              the coin specifics.`)
  parts.push(` */`)
  parts.push(``)
  parts.push(`#include "twi_${CID}_apdu_handlers.h"`)
  parts.push(`#include "timer_mgmt.h"`)
  parts.push(`#include "twi_sys_evt_handler.h"`)
  parts.push(`#include "twi_${CID}_ux.h"`)
  parts.push(`#include "twi_${CID}_ux_contexts.h"`)
  parts.push(`#include "twi_crypto_common.h"`)
  parts.push(`#include "twi_template_list.h"`)
  parts.push(`#include "twi_template_choice_info.h"`)
  parts.push(`#include "twi_template_confirmation.h"`)
  parts.push(``)
  parts.push(`/*---------------------------------------------------------*/`)
  parts.push(`/*- SCREENS (generated from the flow) ----------------------*/`)
  parts.push(`/*---------------------------------------------------------*/`)
  parts.push(genScreensEnum(a))
  parts.push(``)
  parts.push(`/*---------------------------------------------------------*/`)
  parts.push(`/*- STATIC STATE ------------------------------------------*/`)
  parts.push(`/*---------------------------------------------------------*/`)
  parts.push(`static tenu_${CID}_screens          genu_current_screen;`)
  parts.push(`static twi_bool                     gb_handle_timer_cb;`)
  parts.push(`static twi_bool                     gb_pending_ui_req;`)
  parts.push(`static tstr_timer_mgmt_timer        gstr_ux_timeout_timer;`)
  parts.push(`static tstr_twi_sys_events_handlers gstr_${CID}_sys_evt_hdlrs;`)
  parts.push(``)
  parts.push(`/*---------------------------------------------------------*/`)
  parts.push(`/*- SCREEN SWAP -------------------------------------------*/`)
  parts.push(`/*---------------------------------------------------------*/`)
  parts.push(`typedef void(*tpf_replace_current_screen_with)(tenu_${CID}_screens enu_screen);`)
  parts.push(`#define REPLACE_CURRENT_SCREEN_WITH(enu_screen) (TWI_PIC_FUN(replace_current_screen_with))(enu_screen)`)
  parts.push(`static void replace_current_screen_with(tenu_${CID}_screens enu_screen)`)
  parts.push(`{`)
  parts.push(`    TWI_APP_ASSERT(TWI_SUCCESS == epstr_twi_apis->engine_replace_temp(GET_TEMP_CONTEXT(genu_current_screen),`)
  parts.push(`                                                                      ALLOC_TEMP_CONTEXT(enu_screen)));`)
  parts.push(`    FREE_TEMP_CONTEXT_BY_SCREEN(genu_current_screen);`)
  parts.push(`    genu_current_screen = enu_screen;`)
  parts.push(`}`)
  parts.push(``)
  parts.push(`/* Arm the one-shot UX timer used by splash/status screens. */`)
  parts.push(`static void ux_timer_cb(void* pv) { (void)pv; gb_handle_timer_cb = TWI_TRUE; }`)
  parts.push(`static inline void ${CID}_transaction_splash_screen(twi_u32 u32_timeout)`)
  parts.push(`{`)
  parts.push(`    TWI_APP_ASSERT(TWI_SUCCESS == epstr_twi_apis->stop_app_timer(&gstr_ux_timeout_timer));`)
  parts.push(`    gb_handle_timer_cb = TWI_FALSE;`)
  parts.push(`    TWI_APP_ASSERT(TWI_SUCCESS == epstr_twi_apis->start_app_timer(&gstr_ux_timeout_timer,`)
  parts.push(`                                                                  (twi_s8*)TWI_PIC("${COIN}_UX"),`)
  parts.push(`                                                                  (twi_u8)TWI_TIMER_TYPE_ONE_SHOT,`)
  parts.push(`                                                                  u32_timeout,`)
  parts.push(`                                                                  TWI_PIC_FUN_CUSTOM(ux_timer_cb, tpf_generic_ptr_to_fun),`)
  parts.push(`                                                                  NULL));`)
  parts.push(`}`)
  parts.push(``)
  parts.push(`/*---------------------------------------------------------*/`)
  parts.push(`/*- TEMPLATE COMPLETION CALLBACKS (wired from the flow) -----*/`)
  parts.push(`/*---------------------------------------------------------*/`)
  parts.push(genChoiceInfoCb(a, flow))
  parts.push(``)
  parts.push(genConfirmationCb(a, flow))
  parts.push(``)
  parts.push(genListCb(a, flow))
  parts.push(``)
  parts.push(`/*---------------------------------------------------------*/`)
  parts.push(`/*- DISPATCHER (splash/status auto-advance) ----------------*/`)
  parts.push(`/*---------------------------------------------------------*/`)
  parts.push(genDispatcher(a, flow))
  parts.push(``)
  parts.push(`/*---------------------------------------------------------*/`)
  parts.push(`/*- HOME LOAD + INIT --------------------------------------*/`)
  parts.push(`/*---------------------------------------------------------*/`)
  parts.push(`typedef void(*tpf_twi_${CID}_home_load_temp)(void);`)
  parts.push(`#define TWI_${COIN}_HOME_LOAD_TEMP()    (TWI_PIC_FUN(twi_${CID}_home_load_temp))()`)
  parts.push(`static void twi_${CID}_home_load_temp(void)`)
  parts.push(`{`)
  parts.push(`    tenu_${CID}_screens enu_temp_screen = genu_current_screen;`)
  parts.push(`    genu_current_screen = ${home};`)
  parts.push(`    if (TWI_SUCCESS != epstr_twi_apis->engine_start_temp(ALLOC_TEMP_CONTEXT(${home})))`)
  parts.push(`    {`)
  parts.push(`        genu_current_screen = enu_temp_screen;`)
  parts.push(`    }`)
  parts.push(`}`)
  parts.push(``)
  parts.push(`static twi_s32 twi_${CID}_app_init(void)`)
  parts.push(`{`)
  parts.push(`    twi_s32 s32_retval;`)
  parts.push(`    TWI_APP_MEMSET(&gstr_ux_timeout_timer, 0, sizeof(gstr_ux_timeout_timer));`)
  parts.push(`    TWI_APP_MEMSET(&gstr_${CID}_sys_evt_hdlrs, 0, sizeof(gstr_${CID}_sys_evt_hdlrs));`)
  parts.push(`    genu_current_screen = ${COIN}_INVALID_SCREEN;`)
  parts.push(`    gb_handle_timer_cb = TWI_FALSE;`)
  parts.push(`    gb_pending_ui_req = TWI_FALSE;`)
  parts.push(``)
  parts.push(`    gstr_${CID}_sys_evt_hdlrs.pf_dispatcher = TWI_PIC_FUN_CUSTOM(twi_dispatcher, tpf_twi_form_dispatcher);`)
  parts.push(`    /* TODO: also register pf_on_data_rcv / pf_on_session_end (see twi_aptos_ux.c). */`)
  parts.push(``)
  parts.push(`    s32_retval = epstr_twi_apis->sys_evt_hdl_register(&gstr_${CID}_sys_evt_hdlrs);`)
  parts.push(`    if (s32_retval == TWI_SUCCESS)`)
  parts.push(`    {`)
  parts.push(`        INIT_TEMP_CONTEXT();`)
  parts.push(`        TWI_${COIN}_HOME_LOAD_TEMP();`)
  parts.push(`    }`)
  parts.push(`    return s32_retval;`)
  parts.push(`}`)
  parts.push(``)
  parts.push(`/*---------------------------------------------------------*/`)
  parts.push(`/*- ENTRY -------------------------------------------------*/`)
  parts.push(`/*---------------------------------------------------------*/`)
  parts.push(`__attribute__((section(".entry")))`)
  parts.push(`twi_s32 twi_entry(tstr_twi_sdk_apis* pstr_apis, tstr_app_info* pstr_app_info, void* pv_args, tpf_applet_exit_cb* ppf_applet_exit_cb)`)
  parts.push(`{`)
  parts.push(`    (void)pv_args;`)
  parts.push(`    epstr_app_info = pstr_app_info;`)
  parts.push(`    epstr_twi_apis = pstr_apis;`)
  parts.push(``)
  parts.push(`    /* TODO: ${CID}_supported_apdus_list_init(); ${COIN}_APDU_INIT_GLOBAL_VARIABLES(); */`)
  parts.push(``)
  parts.push(`    TWI_APP_ASSERT(ppf_applet_exit_cb != NULL);`)
  parts.push(`    *ppf_applet_exit_cb = TWI_PIC_FUN_CUSTOM(${CID}_applet_reset, tpf_applet_exit_cb);`)
  parts.push(``)
  parts.push(`    TWI_APP_ASSERT(TWI_SUCCESS == twi_${CID}_app_init());`)
  parts.push(`    return TWI_SUCCESS;`)
  parts.push(`}`)
  parts.push(``)

  return parts.join('\n')
}
