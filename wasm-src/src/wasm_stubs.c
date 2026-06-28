/* ============================================================================
 *  wasm_stubs.c — minimal stand-ins for the non-UI platform deps the TWI LVGL
 *  template engine references, so the UI subset links standalone for WASM.
 *  These mirror the simulator's behaviour (battery 100%, no BLE/USB, no real
 *  display HW). The actual pixels come from real LVGL + real fonts.
 * ========================================================================== */
#include <stdint.h>
#include <string.h>
#include "lvgl.h"
#include "twi_types.h"
#include "twi_retval.h"

/* ---- our captured framebuffer (RGB565, 320x170), filled by sdl_display_flush */
#define FB_W 320
#define FB_H 170
uint16_t g_framebuffer[FB_W * FB_H];
int g_flush_calls = 0;

/* The interface is compiled with -DUSE_SDL, so my_flush_cb calls this. We copy
   the flushed area (LVGL native lv_color_t == RGB565 here) into the full FB. */
void sdl_display_flush(lv_disp_drv_t * disp_drv, const lv_area_t * area, lv_color_t * color_p)
{
    (void)disp_drv;
    g_flush_calls++;
    for (int32_t y = area->y1; y <= area->y2; y++) {
        if (y < 0 || y >= FB_H) { color_p += (area->x2 - area->x1 + 1); continue; }
        for (int32_t x = area->x1; x <= area->x2; x++) {
            if (x >= 0 && x < FB_W) g_framebuffer[y * FB_W + x] = color_p->full;
            color_p++;
        }
    }
}
void sdl_display_flush2(lv_disp_drv_t * d, const lv_area_t * a, lv_color_t * c) { sdl_display_flush(d, a, c); }
void sdl_mouse_read(lv_indev_drv_t * drv, lv_indev_data_t * data) { (void)drv; data->state = LV_INDEV_STATE_RELEASED; }
void sdl_init(void) {}
void monitor_init(void) {}

/* ---- battery: always full, not charging (matches sim default) ------------- */
twi_s32 twi_battery_get_status(twi_bool* pb_is_charging, twi_u8* pu8_level)
{ if (pb_is_charging) *pb_is_charging = TWI_FALSE; if (pu8_level) *pu8_level = 100; return TWI_SUCCESS; }
twi_s32 twi_battery_init(void) { return TWI_SUCCESS; }
twi_s32 twi_battery_update_charge_state(void) { return TWI_SUCCESS; }

/* ---- BLE / USB / app state: off ------------------------------------------- */
twi_bool twi_app_is_ble_connected(void) { return TWI_FALSE; }
twi_bool twi_ble_is_advertising(void) { return TWI_FALSE; }
twi_bool twi_app_is_usb_activated(void) { return TWI_FALSE; }
twi_bool twi_app_is_usb_communicating(void) { return TWI_FALSE; }

/* ---- timer mgmt: no-op ----------------------------------------------------- */
twi_s32 timer_mgmt_init(void) { return TWI_SUCCESS; }
twi_s32 timer_mgmt_enable_timer(void) { return TWI_SUCCESS; }
twi_s32 timer_mgmt_disable_timer(void) { return TWI_SUCCESS; }

/* ---- system event handler hooks: no-op ------------------------------------ */
twi_s32 twi_sys_evt_hndlr_dispatch(void) { return TWI_SUCCESS; }

/* ---- real impls behind TWI_MEMSET/MEMCPY/ASSERT macros (from twi_common.c) -*/
void twi_mem_set(twi_u8* pu8_dst, twi_u8 u8_val, twi_u32 u32_sz) { if (pu8_dst) memset(pu8_dst, u8_val, u32_sz); }
void twi_mem_cpy(twi_u8* pu8_dst, const twi_u8* pu8_src, twi_u32 u32_sz) { if (pu8_dst && pu8_src) memcpy(pu8_dst, pu8_src, u32_sz); }
void twi_assert(twi_bool b_cond, const twi_s8* ps8_func, const twi_u32 u32_line) { (void)b_cond; (void)ps8_func; (void)u32_line; }

/* ---- dummy interface structs for templates the router lists but we never
   start (pin/keypad/show_words/choice_from_three). Zeroed; never invoked. ---*/
#include "twi_template_common.h"
tstr_template_interface gstr_temp_pin_insertion_interface;
tstr_template_interface gstr_keypad_temp_interface;
tstr_template_interface gstr_temp_show_words_interface;
tstr_template_interface gstr_temp_show_words_keypad_interface;
tstr_template_interface gstr_temp_choice_from_three_interface;
