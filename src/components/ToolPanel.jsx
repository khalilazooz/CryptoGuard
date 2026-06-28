import { Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { getTool, STATUS_META } from '../tools/registry.js'
import Welcome from './Welcome.jsx'

export default function ToolPanel() {
  const { id } = useParams()
  const tool = getTool(id)

  if (!tool) {
    return (
      <div className="panel-inner">
        <div className="stub">
          <h2>Tool not found</h2>
          <p>No tool is registered under <code>{id}</code>.</p>
        </div>
      </div>
    )
  }

  const st = STATUS_META[tool.status] || STATUS_META.idea
  const Component = tool.component

  return (
    <div className="panel-inner" style={{ '--accent': tool.accent || '#2563eb' }}>
      <header className="panel-head">
        <div className="panel-head-icon">{tool.icon || '🔧'}</div>
        <div className="panel-head-text">
          <h1>{tool.name}</h1>
          <p>{tool.description}</p>
        </div>
        <span className={'panel-status ' + st.cls}>{st.label}</span>
      </header>

      <section className="panel-body">
        {Component ? (
          <Suspense fallback={<div className="stub"><p>Loading {tool.name}…</p></div>}>
            <Component tool={tool} />
          </Suspense>
        ) : (
          <NotReadyStub tool={tool} status={tool.status} />
        )}
      </section>
    </div>
  )
}

function NotReadyStub({ tool, status }) {
  const isIdea = status === 'idea'
  return (
    <div className="stub">
      <div className="stub-emoji">{isIdea ? '💡' : '🛠️'}</div>
      <h2>{isIdea ? 'On the backlog' : 'Coming soon'}</h2>
      <p>
        <strong>{tool.name}</strong> {isIdea ? 'is a planned tool' : 'is under construction'}.
        Its component isn’t wired up yet.
      </p>
      <p className="stub-hint">
        To build it: create <code>src/tools/{toComponentName(tool.id)}.jsx</code> and set its{' '}
        <code>component</code> +<code> status: 'ready'</code> in{' '}
        <code>src/tools/registry.js</code>.
      </p>
    </div>
  )
}

function toComponentName(id) {
  return id
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('')
}
