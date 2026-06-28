/* ============================================================================
 *  wasm_harness.c — render API exposed to JS.
 *
 *  Drives the REAL TWI template engine + LVGL to draw a screen into an
 *  offscreen 320x170 RGB565 framebuffer, which JS blits to a canvas.
 *
 *  Flow per render:
 *    reset engine/screen -> build the template's input struct from params
 *    -> twi_temp_engine_start_temp() -> pump ticks+dispatch until drawn
 *    -> g_framebuffer is filled by sdl_display_flush (in wasm_stubs.c)
 *
 *  Strings are passed via a shared scratch buffer (set_str) so JS doesn't deal
 *  with malloc. Each render call names which scratch slots to use.
 * ========================================================================== */
#include <stdint.h>
#include <string.h>
#include <emscripten.h>

#include "lvgl.h"
#include "twi_types.h"
#include "twi_retval.h"
#include "twi_ui_template_engine.h"
#include "twi_template_common.h"
#include "twi_template_choice_info.h"
#include "twi_template_confirmation.h"
#include "twi_template_list.h"

extern twi_s32 twi_lvgl_interface_init(void);
extern void    twi_lvgl_interface_ntfy_with_tick(twi_u32 ms);
extern void    twi_lvgl_interface_dispatcher(void);
extern uint16_t g_framebuffer[];

/* ---- image assets used by GET_LOGO substitute -----------------------------*/
extern const lv_img_dsc_t supported_coins_icon; /* default placeholder logo */

/* ---- user-supplied logo (real coin icon injected from JS) -----------------*/
#define LOGO_MAX_W 64
#define LOGO_MAX_H 64
static lv_color_t g_logo_px[LOGO_MAX_W * LOGO_MAX_H];
static lv_img_dsc_t g_logo_dsc;
static twi_bool g_has_logo = TWI_FALSE;

/* JS hands us an RGB565 buffer (w*h) it wrote into WASM heap via the returned
   pointer from logo_buf(). After filling it, call set_logo(w,h). Pass w<=0 to
   clear and fall back to the placeholder icon. */
EMSCRIPTEN_KEEPALIVE lv_color_t* logo_buf(void) { return g_logo_px; }
EMSCRIPTEN_KEEPALIVE int logo_cap(void) { return LOGO_MAX_W * LOGO_MAX_H; }
EMSCRIPTEN_KEEPALIVE void set_logo(int w, int h) {
    if (w <= 0 || h <= 0 || w > LOGO_MAX_W || h > LOGO_MAX_H) { g_has_logo = TWI_FALSE; return; }
    memset(&g_logo_dsc, 0, sizeof(g_logo_dsc));
    g_logo_dsc.header.cf = LV_IMG_CF_TRUE_COLOR;
    g_logo_dsc.header.w = w;
    g_logo_dsc.header.h = h;
    g_logo_dsc.data_size = (uint32_t)w * h * sizeof(lv_color_t);
    g_logo_dsc.data = (const uint8_t*)g_logo_px;
    g_has_logo = TWI_TRUE;
}
static const lv_img_dsc_t* current_logo(void) {
    return g_has_logo ? &g_logo_dsc : &supported_coins_icon;
}

/* ---- shared string scratch ------------------------------------------------*/
#define NSTR 16
#define STRLEN 96
static char g_str[NSTR][STRLEN];

EMSCRIPTEN_KEEPALIVE void set_str(int slot, const char* s) {
    if (slot < 0 || slot >= NSTR) return;
    strncpy(g_str[slot], s, STRLEN - 1); g_str[slot][STRLEN - 1] = 0;
}
static const char* S(int slot) { return (slot >= 0 && slot < NSTR) ? g_str[slot] : ""; }

EMSCRIPTEN_KEEPALIVE uint16_t* get_framebuffer(void) { return g_framebuffer; }
EMSCRIPTEN_KEEPALIVE int fb_w(void) { return 320; }
EMSCRIPTEN_KEEPALIVE int fb_h(void) { return 170; }

/* ---- engine plumbing ------------------------------------------------------*/
static tstr_ui_temp g_temp;
static twi_bool g_inited = TWI_FALSE;

/* runtime-data storage the engine passes to each template's pf_start (the
   template writes its state through this pointer; must NOT be NULL). */
static tstr_temp_choice_info_runtime_data  g_ci_rt;
static tstr_temp_confirmation_runtime_data g_cf_rt;
static tstr_temp_list_runtime_data         g_ls_rt;

static void engine_cb(tstr_twi_ui_template_engine_event* pstr_event) { (void)pstr_event; }

static void ensure_init(void) {
    if (g_inited) return;
    twi_lvgl_interface_init();
    twi_temp_engine_init(engine_cb);
    g_inited = TWI_TRUE;
}

static void pump(void) {
    /* clear FB to white first so untouched pixels match the screen bg */
    for (int i = 0; i < 320 * 170; i++) g_framebuffer[i] = 0xFFFF;
    for (int i = 0; i < 8; i++) {       /* a few cycles to fully draw + flush */
        twi_lvgl_interface_ntfy_with_tick(30);
        twi_lvgl_interface_dispatcher();
    }
}

extern int g_flush_calls; /* in wasm_stubs.c */
static int g_last_start_ret = -999;
static int g_last_child_cnt = -1;
EMSCRIPTEN_KEEPALIVE int dbg_start_ret(void) { return g_last_start_ret; }
EMSCRIPTEN_KEEPALIVE int dbg_flush_calls(void) { return g_flush_calls; }
EMSCRIPTEN_KEEPALIVE int dbg_child_cnt(void) { return g_last_child_cnt; }

static void start_and_draw(void) {
    /* Clean slate each render: clear the active screen's children (removes the
       previous template's objects) and re-init the engine so its template list
       head is NULL. Then start fresh. Avoids stop_temp on an unlisted node. */
    lv_obj_clean(lv_scr_act());
    twi_temp_engine_init(engine_cb);
    g_flush_calls = 0;
    g_last_start_ret = (int)twi_temp_engine_start_temp(&g_temp);
    g_last_child_cnt = (int)lv_obj_get_child_cnt(lv_scr_act());
    lv_obj_invalidate(lv_scr_act());
    pump();
}

/* ===========================================================================
 *  CHOICE INFO
 *  items: up to 3, each kind(int enum)/y(int)/strSlot(int, -1 = none/logo)
 *  flags packed; buttons: text slots (-1 none), buttonsY, width/height/x flags
 * ===========================================================================*/
static tstr_temp_choice_info_in g_ci;

EMSCRIPTEN_KEEPALIVE void render_choice_info(
    int k0,int y0,int s0, int k1,int y1,int s1, int k2,int y2,int s2,
    int hasStatus,int hasBack,int hasMenu,
    int hasBtnW,int hasBtnH,int hasBtnX,
    int b0s,int b1s, int btnY,
    int b0w,int b1w,int b0h,int b1h,int b0x,int b1x)
{
    ensure_init();
    memset(&g_ci, 0, sizeof(g_ci));
    memset(&g_temp, 0, sizeof(g_temp));

    int ks[3] = {k0,k1,k2}, ys[3] = {y0,y1,y2}, ss[3] = {s0,s1,s2};
    for (int i = 0; i < 3; i++) {
        g_ci.aenu_items[i] = (tenu_temp_choice_info_item)ks[i];
        g_ci.as16_items_y_coord[i] = (twi_s16_coord)ys[i];
        if (ks[i] == TEMP_CHOICE_INFO_IMAGE)
            g_ci.auni_item_info[i].pstr_image = current_logo();
        else if (ks[i] != TEMP_CHOICE_INFO_INVALID)
            g_ci.auni_item_info[i].pu8_text = (const twi_u8*)S(ss[i]);
    }
    g_ci.b_has_back_button   = hasBack ? TWI_TRUE : TWI_FALSE;
    g_ci.b_has_menue_button  = hasMenu ? TWI_TRUE : TWI_FALSE;
    g_ci.b_has_status_bar    = hasStatus ? TWI_TRUE : TWI_FALSE;
    g_ci.b_has_button_width  = hasBtnW ? TWI_TRUE : TWI_FALSE;
    g_ci.b_has_button_height = hasBtnH ? TWI_TRUE : TWI_FALSE;
    g_ci.b_has_button_x_coords = hasBtnX ? TWI_TRUE : TWI_FALSE;
    g_ci.as16_buttons_width[0]=(twi_s16_coord)b0w; g_ci.as16_buttons_width[1]=(twi_s16_coord)b1w;
    g_ci.as16_buttons_height[0]=(twi_s16_coord)b0h; g_ci.as16_buttons_height[1]=(twi_s16_coord)b1h;
    g_ci.as16_buttons_x_coords[0]=(twi_s16_coord)b0x; g_ci.as16_buttons_x_coords[1]=(twi_s16_coord)b1x;
    g_ci.s16_buttons_y_coord = (twi_s16_coord)btnY;
    g_ci.apu8_button_text[0] = (b0s >= 0) ? (const twi_u8*)S(b0s) : NULL;
    g_ci.apu8_button_text[1] = (b1s >= 0) ? (const twi_u8*)S(b1s) : NULL;
    g_ci.pstr_background_img = NULL;

    g_temp.enu_template_id = TWI_TEMP_CHOICE_INFO;
    g_temp.pv_template_in = (void*)&g_ci;
    memset(&g_ci_rt, 0, sizeof(g_ci_rt)); g_temp.pv_template_runtime_data = &g_ci_rt;
    g_temp.pf_template_finish_cb = NULL;
    start_and_draw();
}

/* ===========================================================================
 *  CONFIRMATION
 *  lines: 2, each align(int)/y(int)/strSlot(int)/scroll(int); line1Title
 * ===========================================================================*/
static tstr_temp_confirmation_in g_cf;

EMSCRIPTEN_KEEPALIVE void render_confirmation(
    int line1Title,
    int a0,int cy0,int t0,int sc0,
    int a1,int cy1,int t1,int sc1,
    int lbtn,int rbtn)
{
    ensure_init();
    memset(&g_cf, 0, sizeof(g_cf));
    memset(&g_temp, 0, sizeof(g_temp));

    g_cf.b_is_line1_title = line1Title ? TWI_TRUE : TWI_FALSE;
    g_cf.aenu_label_txt_algin[0] = (tenu_tmp_confirmation_label_txt_align_t)a0;
    g_cf.aenu_label_txt_algin[1] = (tenu_tmp_confirmation_label_txt_align_t)a1;
    g_cf.as16_line_y_coord[0] = (twi_s16_coord)cy0;
    g_cf.as16_line_y_coord[1] = (twi_s16_coord)cy1;
    g_cf.apu8_obj_text[0] = (twi_u8*)S(t0);
    g_cf.apu8_obj_text[1] = (twi_u8*)S(t1);
    g_cf.ab_is_scrollable[0] = sc0 ? TWI_TRUE : TWI_FALSE;
    g_cf.ab_is_scrollable[1] = sc1 ? TWI_TRUE : TWI_FALSE;
    g_cf.pu8_left_btn_text  = (twi_u8*)S(lbtn);
    g_cf.pu8_right_btn_text = (twi_u8*)S(rbtn);

    g_temp.enu_template_id = TWI_TEMP_CONFIRMATION;
    g_temp.pv_template_in = (void*)&g_cf;
    memset(&g_cf_rt, 0, sizeof(g_cf_rt)); g_temp.pv_template_runtime_data = &g_cf_rt;
    g_temp.pf_template_finish_cb = NULL;
    start_and_draw();
}

/* ===========================================================================
 *  LIST (styles 2 only need text; 1/3/4 have icon arrays — we render the
 *  chrome/title/buttons we can, matching what's deterministic without assets)
 * ===========================================================================*/
static tstr_temp_list_in g_ls;

EMSCRIPTEN_KEEPALIVE void render_list_style2(
    int hasBack, int titleSlot, int b1, int b2, int b3)
{
    ensure_init();
    memset(&g_ls, 0, sizeof(g_ls));
    memset(&g_temp, 0, sizeof(g_temp));
    g_ls.enu_style = TEMP_LIST_STYLE_2;
    g_ls.uni_info.str_style2.pu8_title_text = (const twi_u8*)S(titleSlot);
    g_ls.uni_info.str_style2.pu8_1st_button_text = (const twi_u8*)S(b1);
    g_ls.uni_info.str_style2.pu8_2nd_button_text = (const twi_u8*)S(b2);
    g_ls.uni_info.str_style2.pu8_3rd_button_text = (b3 >= 0) ? (const twi_u8*)S(b3) : NULL;
    *(twi_bool*)&g_ls.uni_info.str_style2.b_has_back_button = hasBack ? TWI_TRUE : TWI_FALSE;

    g_temp.enu_template_id = TWI_TEMP_LIST;
    g_temp.pv_template_in = (void*)&g_ls;
    memset(&g_ls_rt, 0, sizeof(g_ls_rt)); g_temp.pv_template_runtime_data = &g_ls_rt;
    g_temp.pf_template_finish_cb = NULL;
    start_and_draw();
}
