/**
 * App.jsx — Precision Root Application Shell with Modern Floating Header
 * Inspired by shadcn/ui and kokonutui design patterns.
 */
import { BrowserRouter, Routes, Route, NavLink, Link } from 'react-router-dom'
import { Activity, LayoutDashboard, Stethoscope, Sparkles, Clock } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import PredictionForm from './pages/PredictionForm'
import ResultCard from './pages/ResultCard'
import DiseaseInfoPage from './pages/DiseaseInfoPage'

function Navbar() {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(255, 255, 255, 0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid #cbd5e1',
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(15, 23, 42, 0.03)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        padding: '0 20px',
      }}>
        {/* Brand / Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          }}>
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1.22rem',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}>
              MediPredict
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              padding: '2px 6px',
              borderRadius: 5,
            }}>
              AI 2.0
            </span>
          </div>
        </Link>

        {/* Navigation Tabs (Shadcn style) */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#f1f5f9',
          padding: '4px 6px',
          borderRadius: 12,
          border: '1px solid #cbd5e1',
        }}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `segmented-item ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            <LayoutDashboard size={15} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/predict"
            className={({ isActive }) => `segmented-item ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            <Sparkles size={15} />
            <span>New Prediction</span>
          </NavLink>
        </nav>

        {/* Telemetry Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '5px 12px',
            borderRadius: 20,
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #cbd5e1',
            boxShadow: 'inset 0 1px 0 #ffffff, 0 1px 2px rgba(15,23,42,0.05)',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.25)',
              display: 'inline-block',
            }} />
            <Clock size={13} style={{ color: 'var(--text-muted)' }} />
            <span>24h Live Sync Active</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/predict" element={<PredictionForm />} />
          <Route path="/result" element={<ResultCard />} />
          <Route path="/disease/:name" element={<DiseaseInfoPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
