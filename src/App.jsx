import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import ToolPanel from './components/ToolPanel.jsx'
import Welcome from './components/Welcome.jsx'

export default function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="panel">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/tool/:id" element={<ToolPanel />} />
          <Route path="*" element={<Welcome />} />
        </Routes>
      </main>
    </div>
  )
}
