import { Link } from 'react-router-dom'
import { TOOLS } from '../tools/registry.js'

export default function Welcome() {
  const ready = TOOLS.filter((t) => t.status === 'ready')
  return (
    <div className="panel-inner">
      <div className="welcome">
        <div className="welcome-badge">TWI CryptoGuard</div>
        <h1>ToolHub</h1>
        <p>
          A single launchpad for every CryptoGuard development, design, and testing
          utility. Pick a tool from the sidebar to open it here.
        </p>

        {ready.length > 0 && (
          <div className="welcome-quick">
            <span className="welcome-quick-label">Ready now</span>
            <div className="welcome-quick-row">
              {ready.map((t) => (
                <Link key={t.id} to={`/tool/${t.id}`} className="welcome-chip"
                      style={{ '--accent': t.accent || '#2563eb' }}>
                  <span>{t.icon}</span> {t.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="welcome-note">
          New tool? Add one entry to <code>src/tools/registry.js</code> — the sidebar,
          search, and routing pick it up automatically.
        </div>
      </div>
    </div>
  )
}
