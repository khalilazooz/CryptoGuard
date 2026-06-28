/* ============================================================================
 *  uxModel.js — single source of truth for the TWI on-device UX templates.
 * ----------------------------------------------------------------------------
 *  Geometry here is reverse-engineered DIRECTLY from the firmware renderers
 *  under utils/twi_ui_template_engine/.../twi_LVGL_templates/*.c so the editor
 *  draws screens pixel-for-pixel like the device, and the generated C matches
 *  the hand-written prepare_*_temp() functions in twi_<coin>_ux_contexts.c.
 *
 *  VERIFIED DEVICE FACTS
 *  ─────────────────────
 *  Screen ........ 320 x 170 px              (MY_DISP_HOR_RES / MY_DISP_VER_RES)
 *  Status bar .... 20 px tall, top strip     (STATUS_BAR_HEIGHT=20)
 *  Safe margin ... +5 px applied to all confirmation lines (STATUS_BAR_SAFE_MARGIN)
 *
 *  CONFIRMATION (twi_template_confirmation.c)
 *    Each line label is LV_ALIGN_CENTER into the 170px screen with
 *      y_offset = lineY - ((170 - h)/2) + 5
 *    The (170-h)/2 cancels LVGL's centering, so the on-screen TOP-y = lineY + 5.
 *    The box is ALWAYS centered horizontally: x = (320-240)/2 = 40, width 240.
 *    aenu_label_txt_algin only justifies the GLYPHS inside that 240px box
 *    (left/center/right) — it does NOT move the box. Buttons are fixed:
 *    left (40,110,100x40), right (180,110,100x40).
 *
 *  CHOICE_INFO (twi_template_choice_info.c)
 *    image/progress : LV_ALIGN_CENTER, y_offset = itemY - (170 - h)/2  → TOP at itemY
 *    text           : LV_ALIGN_CENTER, y_offset = itemY - 170/2        → CENTER at itemY
 *    buttons (setup_button):
 *       width==CENTERED & total 1 : x=40 w=240
 *       width==CENTERED & total 2 : idx0 x=40, idx1 x=180, w=100
 *       explicit width, x centered: idx0 x=10, idx1 x=320-w-10
 *       explicit width, explicit x: x as given
 *       height defaults to 40 (DEFAULT_BUTTON_HEIGHT) when not provided
 *    back button (common.c)  : x=20  y=-5 w=40 h=35  (icon 12x19)
 *    menu button             : x=138 y=-5 w=45 h=35  (icon 24x15)
 *
 *  LIST (twi_template_list_style_1..4.c)
 *    style1 : two buttons 120x110 at y=45(back)/30(no back), x=30 & x=170;
 *             icon TOP_MID @u16_icon*_y, label TOP_MID @u16_label*_y (w=96)
 *    style2 : title (40,20,240x25); 2 btns x=40/168 w=113 h=100 y=60,
 *             3 btns x=10/115/220 w=90 h=100 y=60
 *    style3 : scroll panel 320x120 @ (0,50); cards 120x90 @ y=10 in-panel
 *             (screen y=60), stride 150, x start 30; name@(10,40) desc@(10,61)
 *    style4 : title (40,20); prev (10,60,45x100) next (265,60,45x100);
 *             icons 45x45 start x=67 stride 47 y=60; selected label (67,115,186x45)
 *
 *  Three templates are modeled (the ones the coin applets actually use):
 *    TWI_TEMP_CHOICE_INFO / TWI_TEMP_CONFIRMATION / TWI_TEMP_LIST
 * ========================================================================== */

export const SCREEN_W = 320
export const SCREEN_H = 170
export const STATUS_BAR_H = 20
export const STATUS_BAR_SAFE_MARGIN = 5

/* ---- fonts (tenu in twi_lvgl_interface.h) -------------------------------- */
export const FONTS = {
  FONT_SF_UI_DISPLAY_13_SEMIBOLD: { label: '13 Semibold', px: 13, weight: 600 },
  FONT_SF_UI_DISPLAY_14_REGULAR: { label: '14 Regular', px: 14, weight: 400 },
  FONT_SF_UI_DISPLAY_15_SEMIBOLD: { label: '15 Semibold', px: 15, weight: 600 },
  FONT_SF_UI_DISPLAY_16_REGULAR: { label: '16 Regular', px: 16, weight: 400 },
  FONT_SF_UI_DISPLAY_16_BOLD: { label: '16 Bold', px: 16, weight: 700 },
  FONT_SF_UI_DISPLAY_20_BOLD: { label: '20 Bold', px: 20, weight: 700 },
}

/* logo (GET_LOGO) default dims — Solana app icon header is 29x22; configurable */
export const DEFAULT_LOGO = { w: 29, h: 22 }

/* ---- choice_info item kinds (tenu_temp_choice_info_item) ----------------- */
export const CHOICE_ITEM_KINDS = [
  { value: 'TEMP_CHOICE_INFO_INVALID', label: '— none —' },
  { value: 'TEMP_CHOICE_INFO_IMAGE', label: 'Image (logo)' },
  { value: 'TEMP_CHOICE_INFO_BOLD_TEXT', label: 'Bold text (16)' },
  { value: 'TEMP_CHOICE_INFO_LARGE_BOLD_TEXT', label: 'Large bold text (20)' },
  { value: 'TEMP_CHOICE_INFO_NORMAL_TEXT', label: 'Normal text (16)' },
  { value: 'TEMP_CHOICE_INFO_PROGRESS_BAR', label: 'Progress bar' },
]

/* ---- confirmation text alignment (tenu_tmp_confirmation_label_txt_align_t) */
export const TEXT_ALIGN = [
  { value: 'TWI_CONFIRMATION_TEMP_TXT_ALIGN_LEFT', label: 'Left' },
  { value: 'TWI_CONFIRMATION_TEMP_TXT_ALIGN_CENTER', label: 'Center' },
  { value: 'TWI_CONFIRMATION_TEMP_TXT_ALIGN_RIGHT', label: 'Right' },
]

/* ---- list styles (tenu_temp_list_style) ---------------------------------- */
export const LIST_STYLES = [
  { value: 'TEMP_LIST_STYLE_1', label: 'Style 1 — two big icon buttons' },
  { value: 'TEMP_LIST_STYLE_2', label: 'Style 2 — 2/3 buttons + title' },
  { value: 'TEMP_LIST_STYLE_3', label: 'Style 3 — scrolling cards + title' },
  { value: 'TEMP_LIST_STYLE_4', label: 'Style 4 — icon carousel + title' },
]

export const TEMPLATE_KINDS = [
  { value: 'TWI_TEMP_CHOICE_INFO', label: 'Choice Info' },
  { value: 'TWI_TEMP_CONFIRMATION', label: 'Confirmation' },
  { value: 'TWI_TEMP_LIST', label: 'List' },
]

const TRUE = 'TWI_TRUE'
const FALSE = 'TWI_FALSE'
const CENTER_X = SCREEN_W / 2

/* ============================================================================
 *  DEFAULT MODELS
 * ========================================================================== */

export function defaultChoiceInfo() {
  return {
    template: 'TWI_TEMP_CHOICE_INFO',
    screenName: 'TRANSACTION_REQUEST',
    coin: 'coin',
    hasStatusBar: true,
    hasBackButton: false,
    hasMenuButton: false,
    hasButtonWidth: false,
    hasButtonHeight: false,
    hasButtonXCoords: false,
    backgroundX: 0,
    backgroundY: 0,
    hasBackgroundImg: false,
    logoH: DEFAULT_LOGO.h,
    items: [
      { kind: 'TEMP_CHOICE_INFO_IMAGE', y: 30, text: '', source: 'GET_LOGO()', dynamic: false, gesture: false },
      { kind: 'TEMP_CHOICE_INFO_BOLD_TEXT', y: 90, text: 'Transaction Request', source: '', dynamic: false, gesture: false },
      { kind: 'TEMP_CHOICE_INFO_INVALID', y: 0, text: '', source: '', dynamic: false, gesture: false },
    ],
    buttons: [
      { text: 'Reject', width: 0, height: 40, x: 0 },
      { text: 'Review', width: 0, height: 40, x: 0 },
    ],
    buttonsY: 120,
    finishCb: 'choice_info_temp_cb',
  }
}

export function defaultConfirmation() {
  return {
    template: 'TWI_TEMP_CONFIRMATION',
    screenName: 'REVIEW_AMOUNT',
    coin: 'coin',
    isLine1Title: false,
    lines: [
      { text: 'Amount', align: 'TWI_CONFIRMATION_TEMP_TXT_ALIGN_LEFT', y: 20, scrollable: false, source: '' },
      { text: '#1A80C0 0.5 SOL#', align: 'TWI_CONFIRMATION_TEMP_TXT_ALIGN_LEFT', y: 63, scrollable: false, source: '' },
    ],
    leftBtnText: 'Back',
    rightBtnText: 'Next',
    finishCb: 'confirmation_temp_cb',
  }
}

export function defaultList() {
  return {
    template: 'TWI_TEMP_LIST',
    screenName: 'MAIN_MENU',
    coin: 'coin',
    style: 'TEMP_LIST_STYLE_2',
    hasBackButton: true,
    title: 'Select Option',
    btn1: 'Option A',
    btn2: 'Option B',
    btn3: '',
    s1Label1: 'Send', s1Label2: 'Receive',
    icon1Y: 18, icon2Y: 18, label1Y: 78, label2Y: 78,
    finishCb: 'list_temp_cb',
  }
}

export function makeDefault(template) {
  if (template === 'TWI_TEMP_CONFIRMATION') return defaultConfirmation()
  if (template === 'TWI_TEMP_LIST') return defaultList()
  return defaultChoiceInfo()
}

/* ============================================================================
 *  GEOMETRY
 *  Each element: { id, group, index, kind, label, font, textAlign,
 *                  x, y, w, h, draggable, axis, anchorY, accent, bordered }
 *  (x,y) is the on-screen TOP-LEFT in device pixels. `axis` tells the editor
 *  which coordinate(s) a drag may change ('y' | 'x' | 'xy' | 'none').
 *  `anchorY` records how the model Y relates to the on-screen top so a drag can
 *  be written back: 'top' (y==modelY) | 'center' (y==modelY - h/2) |
 *  'plus5' (y==modelY+5).
 * ========================================================================== */

function textFontFor(kind) {
  if (kind === 'TEMP_CHOICE_INFO_BOLD_TEXT') return { font: 'FONT_SF_UI_DISPLAY_16_BOLD', h: 22 }
  if (kind === 'TEMP_CHOICE_INFO_LARGE_BOLD_TEXT') return { font: 'FONT_SF_UI_DISPLAY_20_BOLD', h: 26 }
  return { font: 'FONT_SF_UI_DISPLAY_16_REGULAR', h: 22 } // normal
}

export function layoutChoiceInfo(m) {
  const els = []
  const logoH = m.logoH || DEFAULT_LOGO.h
  const logoW = DEFAULT_LOGO.w

  m.items.forEach((it, i) => {
    if (!it.kind || it.kind === 'TEMP_CHOICE_INFO_INVALID') return
    if (it.kind === 'TEMP_CHOICE_INFO_IMAGE') {
      // image: top at itemY, horizontally centered
      els.push({
        id: `item${i}`, group: 'item', index: i, kind: 'image', label: 'LOGO',
        x: Math.round(CENTER_X - logoW / 2), y: it.y, w: logoW, h: logoH,
        draggable: true, axis: 'y', anchorY: 'top', accent: true,
      })
    } else if (it.kind === 'TEMP_CHOICE_INFO_PROGRESS_BAR') {
      els.push({
        id: `item${i}`, group: 'item', index: i, kind: 'progress', label: '',
        x: Math.round(CENTER_X - 220 / 2), y: it.y, w: 220, h: 5,
        draggable: true, axis: 'y', anchorY: 'top',
      })
    } else {
      const { font, h } = textFontFor(it.kind)
      // text: CENTER-anchored at itemY → top = itemY - h/2
      els.push({
        id: `item${i}`, group: 'item', index: i, kind: 'text',
        label: it.text || it.source || '(text)', font, textAlign: 'center',
        x: Math.round(CENTER_X - 240 / 2), y: Math.round(it.y - h / 2), w: 240, h,
        draggable: true, axis: 'y', anchorY: 'center',
      })
    }
  })

  // buttons — replicate setup_button branches exactly
  const present = m.buttons.map((b, i) => ({ b, i })).filter((o) => o.b.text && o.b.text.trim())
  const total = present.length
  present.forEach(({ b, i }) => {
    let x, w
    const h = m.hasButtonHeight && b.height ? b.height : 40
    if (m.hasButtonWidth && b.width) {
      w = b.width
      if (m.hasButtonXCoords && b.x) x = b.x
      else x = i === 0 ? 10 : SCREEN_W - w - 10
    } else if (total === 1) {
      x = 40; w = 240
    } else {
      x = i === 0 ? 40 : 180; w = 100
    }
    els.push({
      id: `btn${i}`, group: 'button', index: i, kind: 'button', label: b.text,
      font: 'FONT_SF_UI_DISPLAY_15_SEMIBOLD', x, y: m.buttonsY, w, h,
      draggable: true, axis: m.hasButtonXCoords ? 'xy' : 'y', anchorY: 'top',
    })
  })

  if (m.hasBackButton) els.push(chrome('back', '‹', 20, -5, 40, 35))
  if (m.hasMenuButton) els.push(chrome('menu', '⋮', 138, -5, 45, 35))
  if (m.hasStatusBar) els.push(statusBarEl())
  return els
}

function chrome(id, label, x, y, w, h) {
  return { id, group: 'chrome', kind: id === 'menu' ? 'menu' : id === 'back' ? 'back' : 'nav', label, x, y, w, h, draggable: false, axis: 'none' }
}
function statusBarEl() {
  return { id: 'statusbar', group: 'chrome', kind: 'statusbar', label: '', x: 60, y: 0, w: 260, h: STATUS_BAR_H, draggable: false, axis: 'none' }
}

export function layoutConfirmation(m) {
  const els = []
  m.lines.forEach((ln, i) => {
    const isTitle = m.isLine1Title && i === 0
    // box always centered horizontally, width 240, top = lineY + 5
    const ta = ln.align.endsWith('RIGHT') ? 'right' : ln.align.endsWith('CENTER') ? 'center' : 'left'
    els.push({
      id: `line${i}`, group: 'line', index: i, kind: 'text',
      label: ln.text || ln.source || '(text)', font: 'FONT_SF_UI_DISPLAY_16_BOLD', textAlign: ta,
      x: 40, y: ln.y + STATUS_BAR_SAFE_MARGIN, w: 240, h: 37,
      bordered: !isTitle, draggable: true, axis: 'y', anchorY: 'plus5',
    })
  })
  els.push({ id: 'lbtn', group: 'button', index: 0, kind: 'button', label: m.leftBtnText || 'Back', font: 'FONT_SF_UI_DISPLAY_15_SEMIBOLD', x: 40, y: 110, w: 100, h: 40, draggable: false, axis: 'none' })
  els.push({ id: 'rbtn', group: 'button', index: 1, kind: 'button', label: m.rightBtnText || 'Next', font: 'FONT_SF_UI_DISPLAY_15_SEMIBOLD', x: 180, y: 110, w: 100, h: 40, draggable: false, axis: 'none' })
  // confirmation always draws the status bar
  els.push(statusBarEl())
  return els
}

export function layoutList(m) {
  const els = []
  const hasBack = m.hasBackButton
  if (m.style === 'TEMP_LIST_STYLE_1') {
    const y = hasBack ? 45 : 30
    const mk = (id, idx, label, x, iconY, labelY) => {
      els.push({ id, group: 'button', index: idx, kind: 'card', label: '', x, y, w: 120, h: 110, draggable: false, axis: 'none' })
      // icon TOP_MID @iconY, label TOP_MID @labelY (relative to the card)
      els.push({ id: id + '-ic', group: 'decor', kind: 'icon', label: 'icon', x: x + 60 - 16, y: y + (iconY || 0), w: 32, h: 32, draggable: false, axis: 'none', accent: true })
      els.push({ id: id + '-lb', group: 'decor', kind: 'text', label, font: 'FONT_SF_UI_DISPLAY_16_BOLD', textAlign: 'center', x: x + (120 - 96) / 2, y: y + (labelY || 0), w: 96, h: 20, draggable: false, axis: 'none' })
    }
    mk('s1b0', 0, m.s1Label1 || 'A', 30, m.icon1Y, m.label1Y)
    mk('s1b1', 1, m.s1Label2 || 'B', 170, m.icon2Y, m.label2Y)
  } else if (m.style === 'TEMP_LIST_STYLE_2') {
    els.push(listTitle(m.title))
    const three = m.btn3 && m.btn3.trim()
    if (three) {
      els.push(listBtn('b0', 0, m.btn1, 10, 60, 90, 100))
      els.push(listBtn('b1', 1, m.btn2, 115, 60, 90, 100))
      els.push(listBtn('b2', 2, m.btn3, 220, 60, 90, 100))
    } else {
      els.push(listBtn('b0', 0, m.btn1, 40, 60, 113, 100))
      els.push(listBtn('b1', 1, m.btn2, 168, 60, 113, 100))
    }
  } else if (m.style === 'TEMP_LIST_STYLE_3') {
    els.push(listTitle(m.title))
    // scroll panel 320x120 @ (0,50); cards 120x90 @ in-panel y=10 → screen 60; stride 150 from x=30
    const card = (id, idx, name, desc, x) => {
      els.push({ id, group: 'button', index: idx, kind: 'card', label: '', x, y: 60, w: 120, h: 90, draggable: false, axis: 'none' })
      els.push({ id: id + '-n', group: 'decor', kind: 'text', label: name || 'Name', font: 'FONT_SF_UI_DISPLAY_16_BOLD', textAlign: 'left', x: x + 10, y: 60 + 40, w: 100, h: 21, draggable: false, axis: 'none' })
      els.push({ id: id + '-d', group: 'decor', kind: 'text', label: desc || 'Description', font: 'FONT_SF_UI_DISPLAY_13_SEMIBOLD', textAlign: 'left', x: x + 10, y: 60 + 61, w: 100, h: 17, draggable: false, axis: 'none' })
    }
    card('card0', 0, m.btn1, m.btn2, 30)
    card('card1', 1, '', '', 30 + 150)
  } else if (m.style === 'TEMP_LIST_STYLE_4') {
    els.push(listTitle(m.title))
    els.push({ id: 'prev', group: 'chrome', kind: 'nav', label: '‹', x: 10, y: 60, w: 45, h: 100, draggable: false, axis: 'none' })
    els.push({ id: 'next', group: 'chrome', kind: 'nav', label: '›', x: 265, y: 60, w: 45, h: 100, draggable: false, axis: 'none' })
    let x = 67
    for (let i = 0; i < 4; i++) {
      els.push({ id: `tile${i}`, group: 'decor', kind: 'icon', label: '', x, y: i === 0 ? 50 : 60, w: 45, h: 45, draggable: false, axis: 'none', accent: i === 0 })
      x += 47
    }
    els.push({ id: 'sel', group: 'decor', kind: 'card', label: m.btn1 || 'Selected', x: 67, y: 115, w: 186, h: 45, draggable: false, axis: 'none', font: 'FONT_SF_UI_DISPLAY_16_BOLD', textAlign: 'center' })
  }
  if (hasBack && m.style !== 'TEMP_LIST_STYLE_4') els.push(chrome('back', '‹', 20, -5, 40, 35))
  return els
}

function listTitle(t) {
  return { id: 'title', group: 'title', kind: 'text', label: t || 'Title', font: 'FONT_SF_UI_DISPLAY_16_BOLD', textAlign: 'center', x: 40, y: 20, w: 240, h: 25, draggable: false, axis: 'none' }
}
function listBtn(id, idx, label, x, y, w, h) {
  return { id, group: 'button', index: idx, kind: 'button', label, font: 'FONT_SF_UI_DISPLAY_15_SEMIBOLD', x, y, w, h, draggable: false, axis: 'none' }
}

export function layout(m) {
  if (m.template === 'TWI_TEMP_CONFIRMATION') return layoutConfirmation(m)
  if (m.template === 'TWI_TEMP_LIST') return layoutList(m)
  return layoutChoiceInfo(m)
}

/* Given a dragged element's new on-screen top-left (nx, ny), return the model
 * coordinate value(s) to write. Inverts the anchorY mapping. */
export function screenToModel(el, nx, ny) {
  let modelY = ny
  if (el.anchorY === 'center') modelY = ny + Math.round(el.h / 2)
  else if (el.anchorY === 'plus5') modelY = ny - STATUS_BAR_SAFE_MARGIN
  return { x: nx, y: modelY }
}

/* ============================================================================
 *  CODE GENERATION — emit prepare_<coin>_<screen>_temp() in firmware style.
 * ========================================================================== */

function fnName(m) {
  const coin = (m.coin || 'coin').trim().toLowerCase()
  const screen = (m.screenName || 'screen').trim().toLowerCase()
  return `prepare_${coin}_${screen}_temp`
}
function cstr(s) { return s ? `(const twi_u8*)TWI_PIC("${String(s).replace(/"/g, '\\"')}")` : 'NULL' }
function cstrMut(s) { return s ? `(twi_u8*)TWI_PIC("${String(s).replace(/"/g, '\\"')}")` : 'NULL' }
function srcOr(source, str, mutable) {
  if (source && source.trim()) return source.trim()
  return mutable ? cstrMut(str) : cstr(str)
}
const B = (v) => (v ? TRUE : FALSE)

export function generateC(m) {
  if (m.template === 'TWI_TEMP_CONFIRMATION') return genConfirmation(m)
  if (m.template === 'TWI_TEMP_LIST') return genList(m)
  return genChoiceInfo(m)
}

function genChoiceInfo(m) {
  const f = fnName(m)
  const v = `pstr_${(m.screenName || 'screen').toLowerCase()}_in`
  const L = []
  L.push(`static void ${f}(tstr_ui_temp* pstr_temp)`)
  L.push(`{`)
  L.push(`\ttstr_temp_choice_info_in* ${v} = NULL;`)
  L.push(``)
  L.push(`\tTWI_APP_MEMSET(pstr_temp, 0, sizeof(tstr_ui_temp));`)
  L.push(``)
  L.push(`\t${v} = (tstr_temp_choice_info_in*)TWI_APP_CALLOC(1, sizeof(tstr_temp_choice_info_in));`)
  L.push(`\tTWI_APP_ASSERT(NULL != ${v});`)
  L.push(``)
  L.push(`\t/* Initialize the template in data */`)
  L.push(`\t{`)
  m.items.forEach((it, i) => L.push(`\t\t${v}->aenu_items[${i}] = ${it.kind || 'TEMP_CHOICE_INFO_INVALID'};`))
  L.push(``)
  L.push(`\t\t${v}->b_has_back_button   = ${B(m.hasBackButton)};`)
  L.push(`\t\t${v}->b_has_menue_button  = ${B(m.hasMenuButton)};`)
  L.push(`\t\t${v}->b_has_button_width  = ${B(m.hasButtonWidth)};`)
  L.push(`\t\t${v}->b_has_status_bar    = ${B(m.hasStatusBar)};`)
  if (m.hasButtonHeight) L.push(`\t\t${v}->b_has_button_height = ${B(m.hasButtonHeight)};`)
  if (m.hasButtonXCoords) L.push(`\t\t${v}->b_has_button_x_coords = ${B(m.hasButtonXCoords)};`)
  L.push(``)
  if (m.items.some((it) => it.gesture)) {
    m.items.forEach((it, i) => L.push(`\t\t${v}->ab_items_gesture_enable[${i}] = ${B(it.gesture)};`))
    L.push(``)
  }
  if (m.items.some((it) => it.dynamic)) {
    m.items.forEach((it, i) => L.push(`\t\t${v}->ab_dynamic_item[${i}] = ${B(it.dynamic)};`))
    L.push(``)
  }
  m.items.forEach((it, i) => L.push(`\t\t${v}->as16_items_y_coord[${i}] = ${emitY(it)};`))
  L.push(``)
  if (m.hasButtonWidth) {
    m.buttons.forEach((b, i) => L.push(`\t\t${v}->as16_buttons_width[${i}] = ${b.width || 0};`))
  } else {
    L.push(`\t\t${v}->as16_buttons_width[0] = 0;`)
    L.push(`\t\t${v}->as16_buttons_width[1] = 0;`)
  }
  if (m.hasButtonHeight) m.buttons.forEach((b, i) => L.push(`\t\t${v}->as16_buttons_height[${i}] = ${b.height || 0};`))
  if (m.hasButtonXCoords) m.buttons.forEach((b, i) => L.push(`\t\t${v}->as16_buttons_x_coords[${i}] = ${b.x || 0};`))
  L.push(`\t\t${v}->s16_buttons_y_coord = ${m.buttonsY || 0};`)
  L.push(``)
  L.push(`\t\t${v}->s16_background_x_coord = ${m.backgroundX || 0};`)
  L.push(`\t\t${v}->s16_background_y_coord = ${m.backgroundY || 0};`)
  L.push(``)
  m.items.forEach((it, i) => {
    if (!it.kind || it.kind === 'TEMP_CHOICE_INFO_INVALID') return
    if (it.kind === 'TEMP_CHOICE_INFO_IMAGE') {
      // priority: a custom item expr (not the GET_LOGO default) -> the chosen
      // built-in icon symbol -> GET_LOGO(). So picking a built-in icon in the
      // toolbar emits e.g. &confirm_icon_image instead of GET_LOGO().
      const src = (it.source || '').trim()
      const hasCustom = src && src !== 'GET_LOGO()'
      const img = hasCustom ? src : (m.logo && m.logo.symbol) ? m.logo.symbol : 'GET_LOGO()'
      L.push(`\t\t${v}->auni_item_info[${i}].pstr_image = ${img};`)
    } else if (it.kind === 'TEMP_CHOICE_INFO_PROGRESS_BAR') {
      L.push(`\t\t${v}->auni_item_info[${i}].pu8_progress = ${srcOr(it.source, it.text, false)};`)
    } else {
      L.push(`\t\t${v}->auni_item_info[${i}].pu8_text = ${srcOr(it.source, it.text, false)};`)
    }
  })
  L.push(``)
  m.buttons.forEach((b, i) => L.push(`\t\t${v}->apu8_button_text[${i}] = ${b.text && b.text.trim() ? cstr(b.text) : 'NULL'};`))
  L.push(``)
  L.push(`\t\t${v}->pstr_background_img = ${m.hasBackgroundImg ? 'GET_BACKGROUND_IMG()' : 'NULL'};`)
  L.push(`\t}`)
  L.push(``)
  L.push(`\tpstr_temp->enu_template_id = TWI_TEMP_CHOICE_INFO;`)
  L.push(`\tpstr_temp->pv_template_in = (void*)${v};`)
  L.push(`\tpstr_temp->pf_template_finish_cb = TWI_PIC_FUN_CUSTOM(${m.finishCb || 'choice_info_temp_cb'}, tpf_template_finish_cb);`)
  L.push(`}`)
  return wrapHeader(m) + L.join('\n') + '\n'
}

function emitY(it) {
  // Image rows in the applets are expressed relative to the logo height, e.g.
  //   as16_items_y_coord[0] = ((62 - 7) - GET_LOGO()->header.h);
  // The renderer top-anchors the image at this value. We keep the recognizable
  // firmware shape, letting itemY be the intended on-screen top.
  if (it.kind === 'TEMP_CHOICE_INFO_IMAGE') {
    return `((${it.y} + GET_LOGO()->header.h) - GET_LOGO()->header.h)`
  }
  return `${it.y}`
}

function genConfirmation(m) {
  const f = fnName(m)
  const v = `pstr_${(m.screenName || 'screen').toLowerCase()}_in`
  const L = []
  L.push(`static void ${f}(tstr_ui_temp* pstr_temp)`)
  L.push(`{`)
  L.push(`\ttstr_temp_confirmation_in* ${v} = NULL;`)
  L.push(``)
  L.push(`\tTWI_APP_MEMSET(pstr_temp, 0, sizeof(tstr_ui_temp));`)
  L.push(``)
  L.push(`\t${v} = (tstr_temp_confirmation_in*)TWI_APP_CALLOC(1, sizeof(tstr_temp_confirmation_in));`)
  L.push(`\tTWI_APP_ASSERT(NULL != ${v});`)
  L.push(``)
  L.push(`\t/* Initialize the template in data */`)
  L.push(`\t{`)
  L.push(`\t\t${v}->b_is_line1_title = ${B(m.isLine1Title)};`)
  L.push(``)
  m.lines.forEach((ln, i) => L.push(`\t\t${v}->aenu_label_txt_algin[${i}] = ${ln.align};`))
  L.push(``)
  m.lines.forEach((ln, i) => L.push(`\t\t${v}->apu8_obj_text[${i}] = ${srcOr(ln.source, ln.text, true)};`))
  L.push(``)
  m.lines.forEach((ln, i) => L.push(`\t\t${v}->as16_line_y_coord[${i}] = ${ln.y};`))
  L.push(``)
  m.lines.forEach((ln, i) => L.push(`\t\t${v}->ab_is_scrollable[${i}] = ${B(ln.scrollable)};`))
  L.push(``)
  L.push(`\t\t${v}->pu8_left_btn_text = ${cstrMut(m.leftBtnText)};`)
  L.push(`\t\t${v}->pu8_right_btn_text = ${cstrMut(m.rightBtnText)};`)
  L.push(`\t}`)
  L.push(``)
  L.push(`\tpstr_temp->enu_template_id = TWI_TEMP_CONFIRMATION;`)
  L.push(`\tpstr_temp->pv_template_in = (void*)${v};`)
  L.push(`\tpstr_temp->pf_template_finish_cb = TWI_PIC_FUN_CUSTOM(${m.finishCb || 'confirmation_temp_cb'}, tpf_template_finish_cb);`)
  L.push(`}`)
  return wrapHeader(m) + L.join('\n') + '\n'
}

function genList(m) {
  const f = fnName(m)
  const v = `pstr_${(m.screenName || 'screen').toLowerCase()}_in`
  const L = []
  L.push(`static void ${f}(tstr_ui_temp* pstr_temp)`)
  L.push(`{`)
  L.push(`\ttstr_temp_list_in* ${v} = NULL;`)
  L.push(``)
  L.push(`\tTWI_APP_MEMSET(pstr_temp, 0, sizeof(tstr_ui_temp));`)
  L.push(``)
  L.push(`\t${v} = (tstr_temp_list_in*)TWI_APP_CALLOC(1, sizeof(tstr_temp_list_in));`)
  L.push(`\tTWI_APP_ASSERT(NULL != ${v});`)
  L.push(``)
  L.push(`\t/* Initialize the template in data */`)
  L.push(`\t{`)
  L.push(`\t\t${v}->enu_style = ${m.style};`)
  if (m.style === 'TEMP_LIST_STYLE_1') {
    L.push(`\t\t${v}->uni_info.str_style1.pu8_1st_button_text = ${cstr(m.s1Label1)};`)
    L.push(`\t\t${v}->uni_info.str_style1.pstr_1st_button_img = NULL;`)
    L.push(`\t\t${v}->uni_info.str_style1.pu8_2nd_button_text = ${cstr(m.s1Label2)};`)
    L.push(`\t\t${v}->uni_info.str_style1.pstr_2nd_button_img = NULL;`)
    L.push(`\t\t${v}->uni_info.str_style1.b_has_back_button = ${B(m.hasBackButton)};`)
    L.push(`\t\t${v}->uni_info.str_style1.u16_icon1_y = ${m.icon1Y || 0};`)
    L.push(`\t\t${v}->uni_info.str_style1.u16_icon2_y = ${m.icon2Y || 0};`)
    L.push(`\t\t${v}->uni_info.str_style1.u16_label1_y = ${m.label1Y || 0};`)
    L.push(`\t\t${v}->uni_info.str_style1.u16_label2_y = ${m.label2Y || 0};`)
  } else if (m.style === 'TEMP_LIST_STYLE_2') {
    L.push(`\t\t${v}->uni_info.str_style2.pu8_title_text = ${cstr(m.title)};`)
    L.push(`\t\t${v}->uni_info.str_style2.pu8_1st_button_text = ${cstr(m.btn1)};`)
    L.push(`\t\t${v}->uni_info.str_style2.pu8_2nd_button_text = ${cstr(m.btn2)};`)
    L.push(`\t\t${v}->uni_info.str_style2.pu8_3rd_button_text = ${m.btn3 && m.btn3.trim() ? cstr(m.btn3) : 'NULL'};`)
    L.push(`\t\t${v}->uni_info.str_style2.b_has_back_button = ${B(m.hasBackButton)};`)
  } else if (m.style === 'TEMP_LIST_STYLE_3') {
    L.push(`\t\t${v}->uni_info.str_style3.pu8_title_text = ${cstr(m.title)};`)
    L.push(`\t\t/* TODO: fill ppstr_style3_items + pu8_items_count with your card array */`)
    L.push(`\t\t${v}->uni_info.str_style3.b_has_back_button = ${B(m.hasBackButton)};`)
  } else if (m.style === 'TEMP_LIST_STYLE_4') {
    L.push(`\t\t${v}->uni_info.str_style4.pu8_title_text = ${cstr(m.title)};`)
    L.push(`\t\t/* TODO: fill ppstr_style4_items + pu8_items_count with your icon array */`)
    L.push(`\t\t${v}->uni_info.str_style4.b_has_back_button = ${B(m.hasBackButton)};`)
  }
  L.push(`\t}`)
  L.push(``)
  L.push(`\tpstr_temp->enu_template_id = TWI_TEMP_LIST;`)
  L.push(`\tpstr_temp->pv_template_in = (void*)${v};`)
  L.push(`\tpstr_temp->pf_template_finish_cb = TWI_PIC_FUN_CUSTOM(${m.finishCb || 'list_temp_cb'}, tpf_template_finish_cb);`)
  L.push(`}`)
  return wrapHeader(m) + L.join('\n') + '\n'
}

function wrapHeader(m) {
  const coin = (m.coin || 'COIN').toUpperCase()
  const screen = (m.screenName || 'SCREEN').toUpperCase()
  return (
    `/*-**********************************************************************/\n` +
    `/* ${coin}_${screen}\t\t\t\t\t\t\t\t\t\t*/\n` +
    `/*-**********************************************************************/\n`
  )
}
