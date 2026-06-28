/* ============================================================================
 *  lvglEngine.js — loads the real LVGL + TWI template engine compiled to WASM
 *  and renders a screen model to an RGBA buffer for a <canvas>.
 *
 *  The WASM module (public/wasm/twilvgl.{js,wasm}) is the ACTUAL firmware UI
 *  stack: LVGL 8.3.0, twi_lvgl_interface, the template engine, and the real
 *  SF-UI fonts — so output is pixel-identical to the device, not an emulation.
 *
 *  Exports a singleton `getEngine()` returning { render, W, H } once loaded.
 * ========================================================================== */

export const SCREEN_W = 320
export const SCREEN_H = 170

let _modPromise = null

/* string scratch slot allocation (must match wasm_harness.c NSTR=16) */
const SLOT = { /* assigned per render */ }

async function loadModule() {
  if (_modPromise) return _modPromise
  _modPromise = (async () => {
    // twilvgl.js is an Emscripten MODULARIZE bundle exporting global TwiLvgl.
    // Load it as a classic script (it attaches window.TwiLvgl), then instantiate.
    const base = import.meta.env.BASE_URL || '/'
    await new Promise((resolve, reject) => {
      if (window.TwiLvgl) return resolve()
      const s = document.createElement('script')
      s.src = `${base}wasm/twilvgl.js`
      s.onload = resolve
      s.onerror = () => reject(new Error('failed to load twilvgl.js'))
      document.head.appendChild(s)
    })
    const Module = await window.TwiLvgl({
      locateFile: (p) => `${import.meta.env.BASE_URL || '/'}wasm/${p}`,
    })
    const api = {
      set_str: Module.cwrap('set_str', null, ['number', 'string']),
      render_choice_info: Module.cwrap('render_choice_info', null, Array(24).fill('number')),
      render_confirmation: Module.cwrap('render_confirmation', null, Array(11).fill('number')),
      render_list_style2: Module.cwrap('render_list_style2', null, Array(5).fill('number')),
      get_fb: Module.cwrap('get_framebuffer', 'number', []),
      logo_buf: Module.cwrap('logo_buf', 'number', []),
      logo_cap: Module.cwrap('logo_cap', 'number', []),
      set_logo: Module.cwrap('set_logo', null, ['number', 'number']),
      Module,
    }
    return api
  })()
  return _modPromise
}

/* RGB565 -> RGBA8888 into the provided Uint8ClampedArray (W*H*4) */
function blitTo(rgba, fb) {
  for (let i = 0; i < SCREEN_W * SCREEN_H; i++) {
    const c = fb[i]
    rgba[i * 4] = (c >> 11 & 0x1f) << 3
    rgba[i * 4 + 1] = (c >> 5 & 0x3f) << 2
    rgba[i * 4 + 2] = (c & 0x1f) << 3
    rgba[i * 4 + 3] = 255
  }
}

/* template enum values (must match firmware) */
const CI_KIND = {
  TEMP_CHOICE_INFO_INVALID: 0,
  TEMP_CHOICE_INFO_IMAGE: 1,
  TEMP_CHOICE_INFO_BOLD_TEXT: 2,
  TEMP_CHOICE_INFO_LARGE_BOLD_TEXT: 3,
  TEMP_CHOICE_INFO_NORMAL_TEXT: 4,
  TEMP_CHOICE_INFO_PROGRESS_BAR: 5,
}
/* tenu_tmp_confirmation_label_txt_align_t maps to TWI_TEXT_ALIGN_* :
   LEFT/RIGHT/CENTER — resolve to the underlying lv text align ints used by the
   confirmation header (LEFT=…, see twi_lvgl_types). The harness passes them
   straight into aenu_label_txt_algin, so we use the same ordering as the enum
   in twi_template_confirmation.h: LEFT, RIGHT, CENTER. */
const CF_ALIGN = {
  TWI_CONFIRMATION_TEMP_TXT_ALIGN_LEFT: 0,
  TWI_CONFIRMATION_TEMP_TXT_ALIGN_RIGHT: 1,
  TWI_CONFIRMATION_TEMP_TXT_ALIGN_CENTER: 2,
}

export async function getEngine() {
  const api = await loadModule()
  const rgba = new Uint8ClampedArray(SCREEN_W * SCREEN_H * 4)

  function readFB() {
    const ptr = api.get_fb()
    const fb = new Uint16Array(api.Module.HEAPU16.buffer, ptr, SCREEN_W * SCREEN_H)
    blitTo(rgba, fb)
    return new ImageData(rgba, SCREEN_W, SCREEN_H)
  }

  /* render(model) -> ImageData. Maps the editor model to the WASM render call
     that mirrors the matching prepare_*_temp(). */
  function render(m) {
    if (m.template === 'TWI_TEMP_CONFIRMATION') {
      api.set_str(0, m.lines[0].text || '')
      api.set_str(1, m.lines[1].text || '')
      api.set_str(2, m.leftBtnText || '')
      api.set_str(3, m.rightBtnText || '')
      api.render_confirmation(
        m.isLine1Title ? 1 : 0,
        CF_ALIGN[m.lines[0].align] ?? 0, m.lines[0].y, 0, m.lines[0].scrollable ? 1 : 0,
        CF_ALIGN[m.lines[1].align] ?? 0, m.lines[1].y, 1, m.lines[1].scrollable ? 1 : 0,
        2, 3,
      )
    } else if (m.template === 'TWI_TEMP_LIST' && m.style === 'TEMP_LIST_STYLE_2') {
      api.set_str(7, m.title || '')
      api.set_str(8, m.btn1 || '')
      api.set_str(9, m.btn2 || '')
      const hasB3 = m.btn3 && m.btn3.trim()
      if (hasB3) api.set_str(10, m.btn3)
      api.render_list_style2(m.hasBackButton ? 1 : 0, 7, 8, 9, hasB3 ? 10 : -1)
    } else {
      // CHOICE INFO (and list styles 1/3/4 fall back to choice-info-less; we
      // render choice_info which covers the home/request/review screens)
      const items = m.items || []
      const kind = (i) => CI_KIND[items[i]?.kind] ?? 0
      // text slots 4,5,6 for the 3 items; button slots 5? avoid clash -> use 11,12 for buttons
      for (let i = 0; i < 3; i++) {
        const it = items[i]
        if (it && it.kind && it.kind !== 'TEMP_CHOICE_INFO_INVALID' && it.kind !== 'TEMP_CHOICE_INFO_IMAGE') {
          api.set_str(4 + i, it.text || it.source || '')
        }
      }
      const b = m.buttons || []
      const b0 = b[0]?.text?.trim() ? 13 : -1
      const b1 = b[1]?.text?.trim() ? 14 : -1
      if (b0 >= 0) api.set_str(13, b[0].text)
      if (b1 >= 0) api.set_str(14, b[1].text)
      const slot = (i) => (items[i] && items[i].kind === 'TEMP_CHOICE_INFO_IMAGE') ? -1 : (4 + i)
      api.render_choice_info(
        kind(0), items[0]?.y ?? 0, slot(0),
        kind(1), items[1]?.y ?? 0, slot(1),
        kind(2), items[2]?.y ?? 0, slot(2),
        m.hasStatusBar ? 1 : 0, m.hasBackButton ? 1 : 0, m.hasMenuButton ? 1 : 0,
        m.hasButtonWidth ? 1 : 0, m.hasButtonHeight ? 1 : 0, m.hasButtonXCoords ? 1 : 0,
        b0, b1, m.buttonsY ?? 0,
        b[0]?.width ?? 0, b[1]?.width ?? 0, b[0]?.height ?? 0, b[1]?.height ?? 0,
        b[0]?.x ?? 0, b[1]?.x ?? 0,
      )
    }
    return readFB()
  }

  /* Inject a real coin/app icon. Accepts an HTMLImageElement/Canvas/ImageBitmap.
     The image is fit into a max 64x64 box (preserving aspect), converted to
     RGB565, and handed to the engine so choice_info image items show it. */
  function setLogo(srcImg) {
    if (!srcImg) { api.set_logo(0, 0); return }
    const MAX = 56
    const iw = srcImg.width || srcImg.naturalWidth
    const ih = srcImg.height || srcImg.naturalHeight
    const scale = Math.min(MAX / iw, MAX / ih, 1)
    const w = Math.max(1, Math.round(iw * scale))
    const h = Math.max(1, Math.round(ih * scale))
    const oc = document.createElement('canvas')
    oc.width = w; oc.height = h
    const octx = oc.getContext('2d')
    octx.clearRect(0, 0, w, h)
    octx.drawImage(srcImg, 0, 0, w, h)
    const data = octx.getImageData(0, 0, w, h).data
    // write RGB565 into the WASM logo buffer (lv_color_t is 16-bit here)
    const ptr = api.logo_buf()
    const buf = new Uint16Array(api.Module.HEAPU16.buffer, ptr, api.logo_cap())
    for (let i = 0; i < w * h; i++) {
      const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2]
      buf[i] = ((r & 0xf8) << 8) | ((g & 0xfc) << 3) | (b >> 3)
    }
    api.set_logo(w, h)
  }
  function clearLogo() { api.set_logo(0, 0) }

  return { render, setLogo, clearLogo, W: SCREEN_W, H: SCREEN_H }
}
