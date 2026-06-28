import { useEffect, useMemo, useRef, useState } from 'react'
import { COINS, getCoin } from './testgen/coins.js'
import {
  buildRecord,
  buildUtxoRecord,
  buildGetAddressRecord,
  recordToJson,
} from './testgen/apdu.js'
import './testgen/testgen.css'

/* ============================================================================
 *  Test Record Generator
 *  Turns an unsigned transaction (+ signing path, and for UTXO coins the
 *  previous tx / scriptPubKey / amount / change path) into the
 *  { log_txt, cmds } JSON record(s) for (Coin)/test/(Coin)_test_profile.json.
 * ========================================================================== */
export default function TestRecordGen() {
  const [coinId, setCoinId] = useState(COINS[0].id)
  const coin = getCoin(coinId)
  const isUtxo = coin.coinType === 'utxo'

  // ---- account-coin state ----
  const [mode, setMode] = useState('normal') // 'normal' | 'token'
  const [txHex, setTxHex] = useState('')
  const [path, setPath] = useState(coin.samplePath)
  const [tokenChunk, setTokenChunk] = useState('')

  // ---- utxo-coin state ----
  const [currentTx, setCurrentTx] = useState('')
  const [inputs, setInputs] = useState(() => [blankInput(coin)])
  const [changePath, setChangePath] = useState(coin.sampleChangePath || '')
  const [changeIndex, setChangeIndex] = useState(1)
  const [outputCount, setOutputCount] = useState('')
  const [sigHash, setSigHash] = useState('')

  // ---- shared ----
  const [logLabel, setLogLabel] = useState('')
  const [includeAddr, setIncludeAddr] = useState(false)
  const [copied, setCopied] = useState(false)

  const prevCoin = useRef(coinId)
  useEffect(() => {
    if (prevCoin.current !== coinId) {
      setPath(coin.samplePath)
      setChangePath(coin.sampleChangePath || '')
      setInputs([blankInput(coin)])
      if (mode === 'token' && !coin.tokenSupported) setMode('normal')
      prevCoin.current = coinId
    }
  }, [coinId]) // eslint-disable-line react-hooks/exhaustive-deps

  // -------- build the record(s) live --------
  const { json, error, noteCmds } = useMemo(() => {
    try {
      let records = []
      if (isUtxo) {
        if (!currentTx.trim()) return { json: '', error: '', noteCmds: [] }
        records = buildUtxoRecord(coin, {
          currentTxHex: currentTx,
          inputs: inputs.map((inp) => ({
            path: inp.path,
            prevTxHex: inp.prevTx || undefined,
            scriptPubKeyHex: inp.scriptPubKey || undefined,
            amount: inp.amount !== '' ? inp.amount : undefined,
            utxoIndex: inp.utxoIndex !== '' ? Number(inp.utxoIndex) : undefined,
          })),
          changePath: changePath || undefined,
          changeIndex: Number(changeIndex),
          outputCount: outputCount !== '' ? Number(outputCount) : undefined,
          sigHash: sigHash || undefined,
          logLabel,
        })
      } else {
        if (!txHex.trim()) return { json: '', error: '', noteCmds: [] }
        records = [buildRecord(coin, { mode, txHex, path, tokenChunkHex: tokenChunk, logLabel })]
      }
      if (includeAddr) records.push(buildGetAddressRecord(coin, isUtxo ? inputs[0].path : path))
      const notes = records.flatMap((r) => r.cmds.filter((c) => c._note).map((c) => c._note))
      const body = records.map((r) => indentBlock(recordToJson(r), 2)).join(',\n')
      return { json: body, error: '', noteCmds: notes }
    } catch (e) {
      return { json: '', error: e.message || String(e), noteCmds: [] }
    }
  }, [
    coin, isUtxo, mode, txHex, path, tokenChunk,
    currentTx, inputs, changePath, changeIndex, outputCount, sigHash,
    logLabel, includeAddr,
  ])

  function copy() {
    if (!json) return
    navigator.clipboard?.writeText(json).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    })
  }

  function updateInput(i, patch) {
    setInputs((arr) => arr.map((inp, j) => (j === i ? { ...inp, ...patch } : inp)))
  }
  function addInput() {
    setInputs((arr) => [...arr, blankInput(coin)])
  }
  function removeInput(i) {
    setInputs((arr) => (arr.length > 1 ? arr.filter((_, j) => j !== i) : arr))
  }

  const bg = coin.brand
  const needs = isUtxo ? coin.utxo.inputNeeds : []

  return (
    <div
      className="trg"
      style={{ '--coin-from': bg.from, '--coin-to': bg.to, '--coin-accent': bg.accent }}
    >
      <div key={coinId} className="trg-bg">
        <span className="trg-glyph trg-glyph-a">{bg.glyph}</span>
        <span className="trg-glyph trg-glyph-b">{bg.glyph}</span>
        <span className="trg-glyph trg-glyph-c">{bg.glyph}</span>
      </div>

      <div className="trg-card">
        <div className="trg-row">
          <label className="trg-field trg-coin">
            <span className="trg-label">Coin</span>
            <div className="trg-select-wrap">
              <span className="trg-select-glyph">{bg.glyph}</span>
              <select value={coinId} onChange={(e) => setCoinId(e.target.value)}>
                <optgroup label="Account-based">
                  {COINS.filter((c) => c.coinType !== 'utxo').map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.symbol})</option>
                  ))}
                </optgroup>
                <optgroup label="UTXO-based">
                  {COINS.filter((c) => c.coinType === 'utxo').map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.symbol})</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </label>

          {!isUtxo && (
            <div className="trg-field trg-flow">
              <span className="trg-label">Flow</span>
              <div className="trg-toggle">
                <button className={mode === 'normal' ? 'on' : ''} onClick={() => setMode('normal')} type="button">
                  Normal
                </button>
                <button
                  className={mode === 'token' ? 'on' : ''}
                  onClick={() => coin.tokenSupported && setMode('token')}
                  disabled={!coin.tokenSupported}
                  title={coin.tokenSupported ? '' : `${coin.name} has no token flow`}
                  type="button"
                >
                  Token
                </button>
              </div>
            </div>
          )}
          {isUtxo && <div className="trg-field trg-flow"><span className="trg-label">Type</span><div className="trg-badge">UTXO · multi-input</div></div>}
        </div>

        {/* ================= ACCOUNT COINS ================= */}
        {!isUtxo && (
          <>
            <label className="trg-field">
              <span className="trg-label">Unsigned transaction (raw signing-payload hex)</span>
              <textarea className="trg-mono" rows={5} spellCheck={false}
                placeholder="e.g. 02ee010183f06a80850966768ec7…"
                value={txHex} onChange={(e) => setTxHex(e.target.value)} />
            </label>
            <div className="trg-row">
              <label className="trg-field trg-grow">
                <span className="trg-label">Signing path (BIP32)</span>
                <input className="trg-mono" spellCheck={false} value={path} onChange={(e) => setPath(e.target.value)} />
              </label>
              <label className="trg-field trg-grow">
                <span className="trg-label">Log label (optional)</span>
                <input spellCheck={false} placeholder={mode === 'token' ? 'Token transaction' : 'Transaction'}
                  value={logLabel} onChange={(e) => setLogLabel(e.target.value)} />
              </label>
            </div>
            {mode === 'token' && (
              <label className="trg-field">
                <span className="trg-label">Token info chunk (hex) — host-signed certificate blob, supplied verbatim</span>
                <textarea className="trg-mono" rows={3} spellCheck={false}
                  placeholder="optional — leave blank to emit a placeholder note"
                  value={tokenChunk} onChange={(e) => setTokenChunk(e.target.value)} />
              </label>
            )}
          </>
        )}

        {/* ================= UTXO COINS ================= */}
        {isUtxo && (
          <>
            <label className="trg-field">
              <span className="trg-label">Current (unsigned) transaction — raw serialized hex</span>
              <textarea className="trg-mono" rows={4} spellCheck={false}
                placeholder="the transaction being signed"
                value={currentTx} onChange={(e) => setCurrentTx(e.target.value)} />
            </label>

            <div className="trg-inputs-head">
              <span className="trg-label">Inputs ({inputs.length})</span>
              <button className="trg-add" type="button" onClick={addInput}>+ Add input</button>
            </div>

            {inputs.map((inp, i) => (
              <div className="trg-input-card" key={i}>
                <div className="trg-input-top">
                  <span className="trg-input-idx">#{i}</span>
                  {inputs.length > 1 && (
                    <button className="trg-rm" type="button" onClick={() => removeInput(i)}>✕</button>
                  )}
                </div>
                <label className="trg-field">
                  <span className="trg-sublabel">Signing path</span>
                  <input className="trg-mono" spellCheck={false} value={inp.path}
                    onChange={(e) => updateInput(i, { path: e.target.value })} />
                </label>
                {needs.includes('prevTx') && (
                  <label className="trg-field">
                    <span className="trg-sublabel">
                      Previous transaction (hex){coin.id === 'cardano' ? '' : ' — required'}
                    </span>
                    <textarea className="trg-mono" rows={2} spellCheck={false}
                      placeholder="the prev tx that created this UTXO"
                      value={inp.prevTx} onChange={(e) => updateInput(i, { prevTx: e.target.value })} />
                  </label>
                )}
                <div className="trg-row">
                  {(needs.includes('prevTx') || needs.includes('utxoIndex')) && (
                    <label className="trg-field trg-grow">
                      <span className="trg-sublabel">Prev output index (UTXO)</span>
                      <input className="trg-mono" spellCheck={false} placeholder="0"
                        value={inp.utxoIndex} onChange={(e) => updateInput(i, { utxoIndex: e.target.value })} />
                    </label>
                  )}
                  {needs.includes('amount') && (
                    <label className="trg-field trg-grow">
                      <span className="trg-sublabel">Amount (satoshis)</span>
                      <input className="trg-mono" spellCheck={false} placeholder="e.g. 85695"
                        value={inp.amount} onChange={(e) => updateInput(i, { amount: e.target.value })} />
                    </label>
                  )}
                </div>
                {needs.includes('scriptPubKey') && (
                  <label className="trg-field">
                    <span className="trg-sublabel">scriptPubKey (hex)</span>
                    <input className="trg-mono" spellCheck={false}
                      placeholder="the prev output lock script"
                      value={inp.scriptPubKey} onChange={(e) => updateInput(i, { scriptPubKey: e.target.value })} />
                  </label>
                )}
              </div>
            ))}

            <div className="trg-row">
              <label className="trg-field trg-grow">
                <span className="trg-label">Change / internal-output path (one)</span>
                <input className="trg-mono" spellCheck={false} placeholder="leave blank if no change output"
                  value={changePath} onChange={(e) => setChangePath(e.target.value)} />
              </label>
              <label className="trg-field">
                <span className="trg-label">Change output index</span>
                <input className="trg-mono" style={{ width: 90 }} spellCheck={false}
                  value={changeIndex} onChange={(e) => setChangeIndex(e.target.value)} />
              </label>
            </div>

            <div className="trg-row">
              <label className="trg-field">
                <span className="trg-label">Total outputs (optional)</span>
                <input className="trg-mono" style={{ width: 110 }} spellCheck={false}
                  placeholder={changePath ? '2' : '1'}
                  value={outputCount} onChange={(e) => setOutputCount(e.target.value)} />
              </label>
              {coin.utxo.signHasScriptAmount && (
                <label className="trg-field">
                  <span className="trg-label">SigHash (hex, u32 BE)</span>
                  <input className="trg-mono" style={{ width: 130 }} spellCheck={false}
                    placeholder={coin.utxo.defaultSigHash || '00000000'}
                    value={sigHash} onChange={(e) => setSigHash(e.target.value)} />
                </label>
              )}
              <label className="trg-field trg-grow">
                <span className="trg-label">Log label (optional)</span>
                <input spellCheck={false} placeholder="Transaction"
                  value={logLabel} onChange={(e) => setLogLabel(e.target.value)} />
              </label>
            </div>

            {coin.utxo.startExtendedLen && (
              <div className="trg-note">
                ℹ Avalanche streams the tx in multiple START chunks on-device; this tool emits one
                START with the full tx — semantically identical and accepted by the parser.
              </div>
            )}
          </>
        )}

        <label className="trg-check">
          <input type="checkbox" checked={includeAddr} onChange={(e) => setIncludeAddr(e.target.checked)} />
          <span>Also append a Get-Address record for {isUtxo ? "input #0's path" : 'this path'}</span>
        </label>

        {error && <div className="trg-err">⚠ {error}</div>}
        {noteCmds.map((n, i) => (<div key={i} className="trg-note">ℹ {n}</div>))}

        <div className="trg-out-head">
          <span className="trg-label">Test record{isUtxo ? 's (one per flow step)' : ''}</span>
          <button className="trg-copy" onClick={copy} disabled={!json} type="button">
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        </div>
        <pre className="trg-out trg-mono">
          {json || `// fill in ${isUtxo ? 'the current transaction + at least one input' : 'an unsigned transaction'} to generate the record`}
        </pre>
      </div>
    </div>
  )
}

function blankInput(coin) {
  return {
    path: coin.samplePath || '',
    prevTx: '',
    scriptPubKey: '',
    amount: '',
    utxoIndex: '0',
  }
}

/* indent a multi-line JSON block so it reads like a child of "test_cases": [ … ] */
function indentBlock(s, n) {
  const pad = ' '.repeat(n)
  return s.split('\n').map((l) => pad + l).join('\n')
}
