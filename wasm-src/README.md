# Real-LVGL WASM renderer for the UX Designer

The UX Designer renders device screens with the **actual firmware UI stack**
(LVGL 8.3.0 + twi_lvgl_interface + the template engine + real SF-UI fonts)
compiled to WebAssembly — so the preview is pixel-identical to the device.

## Artifacts (committed, served by Vite)
- `public/wasm/twilvgl.js`  — Emscripten loader (MODULARIZE, EXPORT_NAME=TwiLvgl)
- `public/wasm/twilvgl.wasm` — the compiled engine

## Rebuild
Requires Emscripten (emsdk) + LVGL source at `C:\platform_sdk\LVGL_Graphichs_lib`
and the SDK checkout. Then:
```
bash wasm-src/build.sh        # -> public/wasm/twilvgl.{js,wasm}
```
build.sh compiles all of LVGL src + the UI subset (templates, interface, engine,
fonts, image assets) + src/wasm_harness.c (render API) + src/wasm_stubs.c
(battery/ble/usb/display/timer no-ops + the framebuffer flush). Config comes from
`WALLET_APP/Common/twi_lv_conf.h` (RGB565, AA on, default font sf_ui_display_16_regular).

The harness exports render_choice_info / render_confirmation / render_list_style2,
set_str (string scratch), and get_framebuffer (RGB565 320x170). src/tools/ux/
lvglEngine.js loads it and blits the framebuffer to the canvas.
