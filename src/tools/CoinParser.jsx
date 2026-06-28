import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { detectAndParse } from './coinparse/parse.js'
import './coinparse/coinparse.css'

/* per-coin branding (gradient + glyph), keyed by the parser's coin id */
const BRAND = {
  bitcoin: { name: 'Bitcoin', symbol: 'BTC', from: '#5a2d00', to: '#f7931a', accent: '#f7931a', glyph: '₿' },
  ethereum: { name: 'Ethereum', symbol: 'ETH', from: '#2b2f6e', to: '#627eea', accent: '#627eea', glyph: 'Ξ' },
  solana: { name: 'Solana', symbol: 'SOL', from: '#0a2e2a', to: '#9945ff', accent: '#14f195', glyph: '◎' },
  ripple: { name: 'Ripple', symbol: 'XRP', from: '#0b0d17', to: '#23292f', accent: '#23a3ff', glyph: '✕' },
  tron: { name: 'Tron', symbol: 'TRX', from: '#2a0a0d', to: '#eb0029', accent: '#ff3b4e', glyph: '⟁' },
  cardano: { name: 'Cardano', symbol: 'ADA', from: '#08183a', to: '#0033ad', accent: '#3468d1', glyph: '₳' },
  avalanche: { name: 'Avalanche', symbol: 'AVAX', from: '#3a0a0d', to: '#e84142', accent: '#ff5b5b', glyph: '🔺' },
}
const NEUTRAL = { name: '', symbol: '', from: '#1b2330', to: '#2b3648', accent: '#64748b', glyph: '⧉' }

/* ============================================================================
 *  Coin Parser — paste any raw transaction; auto-detect the coin and decode it.
 * ========================================================================== */
export default function CoinParser() {
  const [params] = useSearchParams()
  const [input, setInput] = useState(() => params.get('tx') || '')

  const result = useMemo(() => {
    if (!input.trim()) return null
    try {
      const r = detectAndParse(input)
      return { ok: true, ...r }
    } catch (e) {
      return { ok: false, error: e.message, tried: e.tried }
    }
  }, [input])

  const brand = (result?.ok && BRAND[result.coin]) || NEUTRAL

  return (
    <div className="cp" style={{ '--cp-from': brand.from, '--cp-to': brand.to, '--cp-accent': brand.accent }}>
      <div key={result?.coin || 'none'} className="cp-bg">
        <span className="cp-glyph a">{brand.glyph}</span>
        <span className="cp-glyph b">{brand.glyph}</span>
      </div>

      <div className="cp-card">
        <h2 className="cp-title">Coin Parser</h2>
        <p className="cp-sub">Paste a raw transaction (hex) from any supported coin. The coin type is detected from the format, tagged, and decoded — Bitcoin, Cardano, Avalanche, Ethereum, Solana, Ripple, Tron.</p>

        <label className="cp-field">
          <span className="cp-label">Raw transaction (hex)</span>
          <textarea className="cp-mono" rows={5} spellCheck={false}
            placeholder="paste raw transaction bytes in hex…"
            value={input} onChange={(e) => setInput(e.target.value)} />
        </label>

        {result?.ok && (
          <>
            <div className="cp-detected">
              <span className="cp-coin-badge"><span className="cp-coin-glyph">{brand.glyph}</span>{brand.name}</span>
              <span className="cp-coin-sym">{brand.symbol}</span>
              <span className="cp-coin-type">{result.type}</span>
              <span className="cp-coin-bytes">{result.bytes} bytes</span>
            </div>
            <div className="cp-fields">
              {result.fields.map((f, i) => (
                <div className={'cp-row' + (f.label.startsWith('  ') ? ' sub' : '')} key={i}>
                  <span className="cp-row-k">{f.label.trim()}</span>
                  <span className={'cp-row-v' + (f.mono ? ' mono' : '')}>{f.value}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {result && !result.ok && (
          <div className="cp-err">
            ⚠ {result.error}
            {result.tried && (
              <details className="cp-tried"><summary>why each parser rejected it</summary>
                <ul>{result.tried.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
