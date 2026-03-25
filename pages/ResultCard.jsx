import { useLocation, Link, useNavigate } from 'react-router-dom'

const TIER_CLASS = { Low: 'low', Medium: 'medium', High: 'high', Critical: 'critical' }

function RiskGauge({ score, tier }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{
        width: 140, height: 140, borderRadius: '50%', margin: '0 auto 16px',
        background: `conic-gradient(var(--accent-${tier === 'Low' ? 'green' : tier === 'Medium' ? 'orange' : 'red'}) ${score * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 40px rgba(${tier === 'Low' ? '16,185,129' : tier === 'Medium' ? '245,158,11' : '239,68,68'},0.3)`
      }}>
        <div style={{
          width: 110, height: 110, borderRadius: '50%',
          background: 'var(--bg-secondary)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{score}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ 100</span>
        </div>
      </div>
      <span className={`badge badge-${TIER_CLASS[tier] || 'medium'}`} style={{ fontSize: '0.85rem', padding: '6px 18px' }}>
        {tier} Risk
      </span>
    </div>
  )
}

function AccordionItem({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="accordion-item">
      <div className="accordion-header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
      </div>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  )
}

import { useState } from 'react'

export default function ResultCard() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const result = state?.result

  if (!result) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: 'center', paddingTop: 80 }}>
          <p className="text-muted mb-4">No result data. Please run a prediction first.</p>
          <button className="btn btn-primary" onClick={() => navigate('/predict')}>Run Prediction</button>
        </div>
      </div>
    )
  }

  const top = result.top_predictions?.[0]
  const xai = result.explainability
  const profile = result.disease_profile
  const maxFeature = Math.max(...Object.values(xai?.top_features || { x: 0.01 }))

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        <div style={{ padding: '40px 0 24px' }}>
          <div className="flex items-center gap-4 mb-2">
            <button className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={() => navigate('/predict')}>← New Prediction</button>
            <button className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={() => navigate('/')}>Dashboard</button>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', marginTop: 16 }}>Prediction Results</h1>
          <p className="text-muted text-sm">ID: {result.prediction_id} · {new Date(result.timestamp).toLocaleString()}</p>
        </div>

        <div className="grid-2 mb-6">
          {/* Risk Gauge */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ alignSelf: 'flex-start', marginBottom: 0, fontSize: '1rem' }}>⚠️ Risk Assessment</h2>
            <RiskGauge score={top?.risk_score ?? 0} tier={top?.risk_tier ?? 'Medium'} />
            <div className="w-full">
              <p className="text-sm text-muted mb-2">Category: <strong style={{ color: 'var(--text-primary)' }}>{result.category}</strong></p>
              <p className="text-sm text-muted">Top Prediction: <strong style={{ color: 'var(--accent-blue)' }}>{top?.disease}</strong></p>
              <p className="text-sm text-muted">Confidence: <strong style={{ color: 'var(--text-primary)' }}>{((top?.confidence ?? 0) * 100).toFixed(1)}%</strong></p>
            </div>
          </div>

          {/* XAI */}
          <div className="card">
            <h2 style={{ marginBottom: 16, fontSize: '1rem' }}>🧠 AI Explanation (SHAP)</h2>
            <div className="card-glass mb-4" style={{ background: 'rgba(79,142,247,0.06)', borderColor: 'rgba(79,142,247,0.2)' }}>
              <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>"{xai?.summary}"</p>
            </div>
            <p className="text-xs text-muted mb-3" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Top Contributing Features</p>
            {Object.entries(xai?.top_features ?? {}).slice(0, 5).map(([feat, val]) => (
              <div key={feat} className="feature-bar">
                <span className="feature-name">{feat.replace(/_/g, ' ')}</span>
                <div className="feature-track">
                  <div className="feature-fill" style={{ width: `${Math.min(Math.abs(val) / (maxFeature || 1) * 100, 100)}%` }} />
                </div>
                <span className="feature-pct">{(Math.abs(val) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disease Profile */}
        {profile && (
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 style={{ fontSize: '1.3rem', marginBottom: 4 }}>{profile.name}</h2>
                <span className={`badge badge-${(profile.category || 'lifestyle').toLowerCase()}`}>{profile.category}</span>
              </div>
              <Link
                to={`/disease/${encodeURIComponent(profile.name)}`}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                Full Profile →
              </Link>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>{profile.description}</p>

            <AccordionItem title="💊 Treatment Options" defaultOpen>
              <ul style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(profile.treatment_options || []).map(t => (
                  <li key={t} style={{ background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.2)', borderRadius: 6, padding: '4px 10px', fontSize: '0.82rem', color: '#93bbff' }}>{t}</li>
                ))}
              </ul>
            </AccordionItem>
            <AccordionItem title="🛡️ Prevention Strategies">
              <ul style={{ paddingLeft: 16 }}>{(profile.prevention_strategies || []).map(p => <li key={p}>{p}</li>)}</ul>
            </AccordionItem>
            <AccordionItem title="⚡ Possible Complications">
              <ul style={{ paddingLeft: 16 }}>{(profile.possible_complications || []).map(c => <li key={c}>{c}</li>)}</ul>
            </AccordionItem>
          </div>
        )}

        {/* Recommended Action */}
        <div className={`card mb-6`} style={{
          background: top?.risk_tier === 'Critical' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.06)',
          borderColor: top?.risk_tier === 'Critical' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.2)'
        }}>
          <h2 style={{ marginBottom: 12, fontSize: '1rem' }}>📋 Recommended Action</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{profile?.recommended_action || 'Please consult a qualified healthcare provider for personalised advice.'}</p>
        </div>

        <div className="disclaimer">
          ⚠️ {result.disclaimer}
        </div>
      </div>
    </div>
  )
}
