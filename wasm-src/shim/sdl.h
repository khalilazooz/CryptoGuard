/* shim sdl.h — replaces both the platform SDL header and emscripten's fakesdl.
   The TWI interface (compiled with -DUSE_SDL) calls sdl_display_flush/_mouse_read/
   sdl_init; we declare them here and implement them in wasm_stubs.c (flush copies
   into our offscreen framebuffer). No real SDL is linked. */
#ifndef WASM_SDL_SHIM_H_
#define WASM_SDL_SHIM_H_
#include "lvgl.h"
void sdl_init(void);
void sdl_display_flush(lv_disp_drv_t * disp_drv, const lv_area_t * area, lv_color_t * color_p);
void sdl_display_flush2(lv_disp_drv_t * disp_drv, const lv_area_t * area, lv_color_t * color_p);
void sdl_mouse_read(lv_indev_drv_t * indev_drv, lv_indev_data_t * data);
#endif
