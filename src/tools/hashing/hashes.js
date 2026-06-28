/* ============================================================================
 *  Hashing helper — mirrors the hash set in libbtc / trezor-crypto.
 * ----------------------------------------------------------------------------
 *  Pure JS via @noble/hashes. Covers the trezor `hasher.h` enum + the standalone
 *  hash modules, EXCEPT Groestl-512 (HASHER_GROESTLD_TRUNC) which has no audited
 *  JS implementation — it is listed but disabled rather than hand-ported.
 *
 *  Categories:
 *    plain     : digest(message)
 *    composite : trezor hasher compositions (double-sha256, hash160, double-blake,
 *                blake+ripemd) — these match the device's HASHER_* enum
 *    keyed     : HMAC-SHA256 / HMAC-SHA512  (need a key)
 *    kdf       : PBKDF2-HMAC-SHA256 / -SHA512 (need a key/salt + iterations)
 * ========================================================================== */
import { sha1 } from '@noble/hashes/legacy'
import { md5, ripemd160 } from '@noble/hashes/legacy'
import { sha224, sha256 } from '@noble/hashes/sha256'
import { sha384, sha512, sha512_256 } from '@noble/hashes/sha512'
import {
  sha3_224, sha3_256, sha3_384, sha3_512,
  keccak_224, keccak_256, keccak_384, keccak_512,
} from '@noble/hashes/sha3'
import { blake256 } from '@noble/hashes/blake1'
import { blake2b } from '@noble/hashes/blake2b'
import { blake2s } from '@noble/hashes/blake2s'
import { blake3 } from '@noble/hashes/blake3'
import { hmac } from '@noble/hashes/hmac'
import { pbkdf2 } from '@noble/hashes/pbkdf2'
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils'

export const toHex = bytesToHex

export function normHex(s) {
  if (s == null) return ''
  const h = String(s).replace(/0x/gi, '').replace(/[\s,:_-]/g, '')
  if (h && !/^[0-9a-fA-F]+$/.test(h)) throw new Error('not a hex string')
  if (h.length % 2 !== 0) throw new Error('hex has an odd number of nibbles')
  return h.toLowerCase()
}

/* turn the user input into bytes (hex or utf-8 text) */
export function inputToBytes(value, isText) {
  return isText ? utf8ToBytes(value || '') : hexToBytes(normHex(value))
}

/* composite helpers (trezor HASHER_* compositions) */
const sha2d = (b) => sha256(sha256(b))           // HASHER_SHA2D
const hash160 = (b) => ripemd160(sha256(b))      // HASHER_SHA2_RIPEMD (a.k.a. hash160)
const blaked = (b) => blake256(blake256(b))      // HASHER_BLAKED
const blakeRipemd = (b) => ripemd160(blake256(b)) // HASHER_BLAKE_RIPEMD

/* ============================ algorithm registry ============================
 * Each entry: { id, label, group, out (bytes, null=variable), fn(bytes)->bytes,
 *               trezor? (the HASHER_* / source name) , disabled? }
 */
export const ALGOS = [
  // --- SHA-2 family ---
  { id: 'sha256', label: 'SHA-256', group: 'SHA-2', out: 32, fn: sha256, trezor: 'HASHER_SHA2 / sha2.c' },
  { id: 'sha512', label: 'SHA-512', group: 'SHA-2', out: 64, fn: sha512, trezor: 'sha2.c' },
  { id: 'sha224', label: 'SHA-224', group: 'SHA-2', out: 28, fn: sha224 },
  { id: 'sha384', label: 'SHA-384', group: 'SHA-2', out: 48, fn: sha384 },
  { id: 'sha512_256', label: 'SHA-512/256', group: 'SHA-2', out: 32, fn: sha512_256 },
  { id: 'sha1', label: 'SHA-1', group: 'Legacy', out: 20, fn: sha1, trezor: 'sha2.c (sha1_*)' },
  { id: 'md5', label: 'MD5', group: 'Legacy', out: 16, fn: md5 },
  { id: 'ripemd160', label: 'RIPEMD-160', group: 'Legacy', out: 20, fn: ripemd160, trezor: 'ripemd160.c' },

  // --- SHA-3 (NIST) ---
  { id: 'sha3_224', label: 'SHA3-224', group: 'SHA-3 / Keccak', out: 28, fn: sha3_224 },
  { id: 'sha3_256', label: 'SHA3-256', group: 'SHA-3 / Keccak', out: 32, fn: sha3_256, trezor: 'HASHER_SHA3' },
  { id: 'sha3_384', label: 'SHA3-384', group: 'SHA-3 / Keccak', out: 48, fn: sha3_384 },
  { id: 'sha3_512', label: 'SHA3-512', group: 'SHA-3 / Keccak', out: 64, fn: sha3_512 },
  // --- Keccak (pre-NIST, Ethereum) ---
  { id: 'keccak_224', label: 'Keccak-224', group: 'SHA-3 / Keccak', out: 28, fn: keccak_224 },
  { id: 'keccak_256', label: 'Keccak-256', group: 'SHA-3 / Keccak', out: 32, fn: keccak_256, trezor: 'HASHER_SHA3K' },
  { id: 'keccak_384', label: 'Keccak-384', group: 'SHA-3 / Keccak', out: 48, fn: keccak_384 },
  { id: 'keccak_512', label: 'Keccak-512', group: 'SHA-3 / Keccak', out: 64, fn: keccak_512 },

  // --- BLAKE family ---
  { id: 'blake256', label: 'BLAKE-256', group: 'BLAKE', out: 32, fn: blake256, trezor: 'HASHER_BLAKE / blake256.c' },
  { id: 'blake2b', label: 'BLAKE2b-512', group: 'BLAKE', out: 64, fn: (b) => blake2b(b), trezor: 'blake2b.c' },
  { id: 'blake2b_256', label: 'BLAKE2b-256', group: 'BLAKE', out: 32, fn: (b) => blake2b(b, { dkLen: 32 }) },
  { id: 'blake2s', label: 'BLAKE2s-256', group: 'BLAKE', out: 32, fn: (b) => blake2s(b), trezor: 'blake2s.c' },
  { id: 'blake3', label: 'BLAKE3-256', group: 'BLAKE', out: 32, fn: (b) => blake3(b) },

  // --- composite (trezor HASHER_* compositions) ---
  { id: 'sha2d', label: 'Double SHA-256', group: 'Composite', out: 32, fn: sha2d, trezor: 'HASHER_SHA2D' },
  { id: 'hash160', label: 'HASH160 (RIPEMD160∘SHA256)', group: 'Composite', out: 20, fn: hash160, trezor: 'HASHER_SHA2_RIPEMD' },
  { id: 'blaked', label: 'Double BLAKE-256', group: 'Composite', out: 32, fn: blaked, trezor: 'HASHER_BLAKED' },
  { id: 'blake_ripemd', label: 'RIPEMD160∘BLAKE-256', group: 'Composite', out: 20, fn: blakeRipemd, trezor: 'HASHER_BLAKE_RIPEMD' },

  // --- not available in JS ---
  { id: 'groestld_trunc', label: 'Groestl-512 d-trunc (Groestlcoin)', group: 'Composite', out: 32, fn: null, trezor: 'HASHER_GROESTLD_TRUNC', disabled: true,
    note: 'Groestl-512 has no audited JS implementation; intentionally not hand-ported.' },
]

export const ALGO_GROUPS = (() => {
  const order = ['SHA-2', 'SHA-3 / Keccak', 'BLAKE', 'Composite', 'Legacy']
  const groups = {}
  for (const a of ALGOS) (groups[a.group] ||= []).push(a)
  return order.filter((g) => groups[g]).map((g) => ({ group: g, items: groups[g] }))
})()

export function getAlgo(id) { return ALGOS.find((a) => a.id === id) }

/* hash one input with all (or a chosen subset of) plain/composite algos */
export function hashAll(value, isText) {
  const bytes = inputToBytes(value, isText)
  return ALGOS.map((a) => ({
    id: a.id, label: a.label, group: a.group, out: a.out, trezor: a.trezor,
    disabled: !!a.disabled, note: a.note,
    digest: a.disabled || !a.fn ? null : toHex(a.fn(bytes)),
  }))
}

export function hashOne(id, value, isText) {
  const a = getAlgo(id)
  if (!a) throw new Error(`unknown algorithm ${id}`)
  if (a.disabled || !a.fn) throw new Error(`${a.label} is not available`)
  return toHex(a.fn(inputToBytes(value, isText)))
}

/* ---- keyed: HMAC ---- */
export const HMAC_ALGOS = [
  { id: 'hmac_sha256', label: 'HMAC-SHA256', out: 32, h: sha256, trezor: 'hmac.c' },
  { id: 'hmac_sha512', label: 'HMAC-SHA512', out: 64, h: sha512, trezor: 'hmac.c' },
]
export function hmacHash(id, { key, keyIsText, message, msgIsText }) {
  const a = HMAC_ALGOS.find((x) => x.id === id)
  if (!a) throw new Error(`unknown HMAC ${id}`)
  return toHex(hmac(a.h, inputToBytes(key, keyIsText), inputToBytes(message, msgIsText)))
}

/* ---- KDF: PBKDF2 ---- */
export const PBKDF2_ALGOS = [
  { id: 'pbkdf2_sha256', label: 'PBKDF2-HMAC-SHA256', h: sha256 },
  { id: 'pbkdf2_sha512', label: 'PBKDF2-HMAC-SHA512', h: sha512 },
]
export function pbkdf2Hash(id, { password, pwIsText, salt, saltIsText, iterations, dkLen }) {
  const a = PBKDF2_ALGOS.find((x) => x.id === id)
  if (!a) throw new Error(`unknown PBKDF2 ${id}`)
  const c = Number(iterations) || 1
  const len = Number(dkLen) || 32
  return toHex(pbkdf2(a.h, inputToBytes(password, pwIsText), inputToBytes(salt, saltIsText), { c, dkLen: len }))
}
