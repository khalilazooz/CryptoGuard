#!/usr/bin/env bash
# Build the TWI LVGL template engine + LVGL 8.3.0 to WASM.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
EMSDK="$CLAUDE_JOB_DIR/tmp/emsdk"
source "$EMSDK/emsdk_env.sh" >/dev/null 2>&1
EMCC="$EMSDK/upstream/emscripten/emcc"

SDK="/c/Workspace/Crypto/TWI_FW_SDK"
LV="C:/platform_sdk/LVGL_Graphichs_lib"
TPL="$SDK/utils/twi_ui_template_engine/twi_ui_template_router/twi_LVGL_templates"
ENG="$SDK/utils/twi_ui_template_engine"
RTR="$SDK/utils/twi_ui_template_engine/twi_ui_template_router"
IFACE="$SDK/utils/twi_lvgl_graphics_lib_interface"
FONTS="$IFACE/fonts"

OUT="$HERE/build"
mkdir -p "$OUT"

# Use the wallet twi_lv_conf.h as lv_conf.h (include-simple). Put a copy named
# lv_conf.h on the include path so lvgl's __has_include("lv_conf.h") finds it.
cp "$SDK/app/peripheral/twi_crypto_guard/WALLET_APP/Common/twi_lv_conf.h" "$OUT/lv_conf.h"

INCLUDES=(
  -I"$HERE/shim"                 # shim headers FIRST (twi_app.h, twi_lv_conf.h)
  -I"$OUT"                       # lv_conf.h
  -I"$LV"                        # lvgl.h
  -I"$SDK/common/include"        # twi_types/retval/compiler/common
  -I"$SDK/app/peripheral/twi_crypto_guard/WALLET_APP/Common/APPLETS/common/include" # empty platform_defines.h
  -I"$IFACE"                     # twi_lvgl_interface.h / twi_lvgl_types.h
  -I"$FONTS"
  -I"$ENG"
  -I"$RTR"
  -I"$TPL"
  -I"$SDK/utils/twi_debug"
  -I"$SDK/utils/twi_battery"
  -I"$SDK/utils/twi_timer_mgmt"
  -I"$SDK/utils/twi_system_event_handler"
)

DEFINES=(
  -DLV_CONF_INCLUDE_SIMPLE
  -DLV_LVGL_H_INCLUDE_SIMPLE
  -DUSE_SDL
  -DDISABLE_TWI_SECURE_REALLOC
  -DUSE_TEMP_CHOICE_INFO -DUSE_TEMP_LIST -DUSE_TEMP_CONFIRMATION
  -DUSE_TEMP_CHOICE_FROM_THREE -DUSE_TEMP_SHOW_WORDS -DUSE_TEMP_PIN_INSERTION
  -DUSE_KEYPAD_TEMP -DUSE_TEMP_SHOW_EDIT_WORDS_KEYPAD
  -DTEMP_LIST_STYLE_1_ENABLED -DTEMP_LIST_STYLE_2_ENABLED
  -DTEMP_LIST_STYLE_3_ENABLED -DTEMP_LIST_STYLE_4_ENABLED
  -DTWI_SOFTWARE_RESET_NO_DEBUG_BREAK
)

# Source files: all LVGL src + the UI subset + fonts + assets + harness/stubs.
SRC=()
while IFS= read -r f; do SRC+=("$f"); done < <(find "$LV/src" -name '*.c')

SRC+=( "$ENG/twi_ui_template_engine.c" )
SRC+=( "$RTR/twi_template_router.c" )
SRC+=( "$TPL/twi_template_common.c" )
SRC+=( "$IFACE/twi_lvgl_interface.c" )
SRC+=( "$TPL/twi_template_choice_info.c" )
SRC+=( "$TPL/twi_template_confirmation.c" )
SRC+=( "$TPL/twi_template_list.c" )
SRC+=( "$TPL/twi_template_list_style_1.c" )
SRC+=( "$TPL/twi_template_list_style_2.c" )
SRC+=( "$TPL/twi_template_list_style_3.c" )
SRC+=( "$TPL/twi_template_list_style_4.c" )

# fonts
for f in 13_semibold 14_regular 15_semibold 16_regular 16_bold 20_bold 30_bold_asterisk; do
  SRC+=( "$FONTS/sf_ui_display_$f.c" )
done

# image assets referenced by twi_template_common.c / choice_info / list
for a in back_icon_image menu_dots menue_icon_image next_icon_image \
         full_battery_image three_quadrate_battery_image half_battery_image \
         quadrate_battery_image empty_battery_image \
         full_battery_charge_image three_quadrate_battery_charge_image \
         half_battery_charge_image quadrate_battery_charge_image empty_battery_charge_image \
         ble_on_small ble_off_small ble_connected_small usb_on_image usb_off_image \
         arrow_next arrow_prev confirm_icon_image reject_icon_image supported_coins_icon; do
  [ -f "$TPL/$a.c" ] && SRC+=( "$TPL/$a.c" )
done

SRC+=( "$HERE/src/wasm_stubs.c" )
SRC+=( "$HERE/src/wasm_harness.c" )

echo "Compiling ${#SRC[@]} source files to WASM..."
"$EMCC" -Os \
  -include "$HERE/shim/wasm_force.h" \
  "${INCLUDES[@]}" "${DEFINES[@]}" \
  "${SRC[@]}" \
  -s WASM=1 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s MODULARIZE=1 -s 'EXPORT_NAME="TwiLvgl"' \
  -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","HEAPU16","HEAPU8","UTF8ToString","stringToUTF8"]' \
  -s EXPORTED_FUNCTIONS='["_render_choice_info","_render_confirmation","_render_list_style2","_set_str","_get_framebuffer","_fb_w","_fb_h","_logo_buf","_logo_cap","_set_logo","_dbg_start_ret","_dbg_flush_calls","_dbg_child_cnt","_malloc","_free"]' \
  -Wno-unused-command-line-argument \
  -o "$OUT/twilvgl.js" 2>"$OUT/build_err.log" || { echo "BUILD FAILED"; tail -40 "$OUT/build_err.log"; exit 1; }

echo "OK -> $OUT/twilvgl.js + twilvgl.wasm"
ls -la "$OUT"/twilvgl.* 2>/dev/null
