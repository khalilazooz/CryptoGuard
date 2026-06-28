import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { groupedTools, STATUS_META } from '../tools/registry.js'

export default function Sidebar() {
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return groupedTools()
    return groupedTools()
      .map((g) => ({
        ...g,
        items: g.items.filter((t) =>
          (t.name + ' ' + t.description + ' ' + t.category).toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length)
  }, [query])

  const total = groups.reduce((n, g) => n + g.items.length, 0)

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo">TW</div>
        <div className="brand-text">
          <span className="name">TWI CryptoGuard</span>
          <span className="sub">ToolHub</span>
        </div>
      </div>

      <div className="sidebar-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search tools…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <nav className="sidebar-nav">
        {groups.length === 0 && <div className="nav-empty">No tools match.</div>}
        {groups.map((g) => (
          <div className="nav-group" key={g.category}>
            <div className="nav-group-title">{g.category}</div>
            {g.items.map((t) => {
              const st = STATUS_META[t.status] || STATUS_META.idea
              return (
                <NavLink
                  key={t.id}
                  to={`/tool/${t.id}`}
                  className={({ isActive }) =>
                    'nav-item' +
                    (isActive ? ' active' : '') +
                    (t.status === 'idea' ? ' dim' : '')
                  }
                  style={{ '--accent': t.accent || '#2563eb' }}
                >
                  <span className="nav-icon">{t.icon || '🔧'}</span>
                  <span className="nav-label">{t.name}</span>
                  <span className={'nav-status ' + st.cls}>{st.label}</span>
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        {total} tool{total === 1 ? '' : 's'} · add one in <code>tools/registry.js</code>
      </div>
    </aside>
  )
}
