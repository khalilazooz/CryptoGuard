/* force-included into every TU (-include) to satisfy platform macros that
   live in headers we deliberately don't pull into the WASM build. These are
   control-flow/timing helpers irrelevant to rendering. */
#ifndef WASM_FORCE_H_
#define WASM_FORCE_H_
#ifndef TWI_DELAY_MS
#define TWI_DELAY_MS(ms)   do { (void)(ms); } while (0)
#endif
#endif
