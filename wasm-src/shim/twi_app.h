/* shim twi_app.h — only the state queries the UI templates call (stubbed in
   wasm_stubs.c). Avoids pulling the real applet/BLE/USB stack into the WASM. */
#ifndef TWI_APP_SHIM_H_
#define TWI_APP_SHIM_H_
#include "twi_types.h"
twi_bool twi_app_is_ble_connected(void);
twi_bool twi_ble_is_advertising(void);
twi_bool twi_app_is_usb_activated(void);
twi_bool twi_app_is_usb_communicating(void);
#endif
