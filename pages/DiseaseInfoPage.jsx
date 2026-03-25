import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getDiseaseInfo } from '../services/api.js'

function InfoSection({ icon, title, items }) {
  if (!items || items.length === 0) return null
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
        {icon} {title}
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {items.map((item, i) => (
          <span key={i} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: '6px 12px', fontSize: '0.85rem', color: 'var(--text-secondary)'
          }}>{item}</span>
        ))}
      </div>
    </div>
  )
}

export default function DiseaseInfoPage() {
  const { name } = useParams()
  const [disease, setDisease] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    getDiseaseInfo(decodeURIComponent(name))
      .then(setDisease)
      .catch(e => setError(e.response?.data?.detail || 'Disease not found or database not seeded.'))
      .finally(() => setLoading(false))
  }, [name])

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="spinner" />
    </div>
  )

  if (error) return (
    <div className="page">
      <div className="container" style={{ paddingTop: 60, textAlign: 'center' }}>
        <p style={{ color: 'var(--accent-red)', marginBottom: 16 }}>{error}</p>
        <Link to="/" className="btn btn-secondary">← Dashboard</Link>
      </div>
    </div>
  )

  const SEV_COLOR = { 'Life-Threatening Emergency': '#f43f8e', 'Critical': '#ef4444', 'Serious': '#f59e0b' }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        <div style={{ padding: '48px 0 32px' }}>
          <Link to="/" className="btn btn-secondary" style={{ marginBottom: 24, display: 'inline-flex' }}>
            ← Dashboard
          </Link>
          <div className="flex items-center gap-4 mb-2" style={{ flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)' }}>{disease.name}</h1>
            <span className={`badge badge-${(disease.category || '').toLowerCase()}`}>{disease.category}</span>
          </div>
          {disease.types && disease.types.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {disease.types.map(t => (
                <span key={t} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: 6, padding: '2px 8px' }}>{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Description + Severity */}
        <div className="card mb-6">
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1rem', marginBottom: 20 }}>
            {disease.description}
          </p>
          <div className="divider" />
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-muted mb-1">SEVERITY</p>
              <p style={{ fontWeight: 600, color: SEV_COLOR[disease.severity] || 'var(--accent-orange)', fontSize: '0.95rem' }}>
                {disease.severity}
              </p>
            </div>
            <div className="divider" style={{ width: 1, height: 40, margin: '0 16px' }} />
            <div>
              <p className="text-xs text-muted mb-1">RECOMMENDED ACTION</p>
              <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {disease.recommended_action}
              </p>
            </div>
          </div>
        </div>

        <div className="grid-2 mb-6">
          <div className="card">
            <InfoSection icon="🦠" title="Causes" items={disease.causes} />
            <InfoSection icon="😷" title="Symptoms" items={disease.symptoms} />
            <InfoSection icon="⚠️" title="Risk Factors" items={disease.risk_factors} />
          </div>
          <div className="card">
            <InfoSection icon="🔬" title="Diagnostic Methods" items={disease.diagnostic_methods} />
            <InfoSection icon="💊" title="Treatment Options" items={disease.treatment_options} />
            <InfoSection icon="🛡️" title="Prevention" items={disease.prevention_strategies} />
          </div>
        </div>

        <div className="card mb-6">
          <InfoSection icon="⚡" title="Possible Complications" items={disease.possible_complications} />
        </div>

        <div className="disclaimer">
          ⚠️ This information is for educational purposes only. Always consult a qualified healthcare provider for diagnosis and treatment.
        </div>
      </div>
    </div>
  )
}
