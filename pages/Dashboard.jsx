import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUserHistory, getRiskAnalysis, listDiseases } from '../services/api.js'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const USER_ID = 'demo_user'

const TIER_COLORS = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444', Critical: '#f43f8e' }

function StatCard({ label, value, unit = '', color }) {
  return (
    <div className="stat-card animate-fadeInUp">
      <span className="stat-label">{label}</span>
      <span className="stat-value" style={color ? { backgroundImage: `linear-gradient(135deg, ${color}, #4f8ef7)` } : {}}>
        {value}{unit}
      </span>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [history, setHistory] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [diseases, setDiseases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [hist, dis] = await Promise.all([
        getUserHistory(USER_ID, 15).catch(() => null),
        listDiseases().catch(() => ({ diseases: [] }))
      ])
      setHistory(hist)
      setDiseases(dis.diseases || [])
      if (hist && hist.total_records > 0) {
        const anl = await getRiskAnalysis(USER_ID, 10).catch(() => null)
        setAnalysis(anl)
      }
    } catch (e) {
      setError('Backend not connected. Showing demo data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Demo chart data for when backend is offline
  const chartData = history?.records?.slice().reverse().map((r, i) => ({
    name: new Date(r.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    risk: r.risk_score,
    tier: r.risk_tier
  })) || [
    { name: 'Jan 10', risk: 42 }, { name: 'Jan 17', risk: 55 },
    { name: 'Jan 24', risk: 48 }, { name: 'Feb 1', risk: 61 },
    { name: 'Feb 8', risk: 52 }, { name: 'Feb 15', risk: 44 }
  ]

  return (
    <div className="page">
      <div className="container">
        {/* Hero */}
        <div className="hero" style={{ textAlign: 'left', padding: '48px 0 32px' }}>
          <h1 className="hero-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
            Health Intelligence<br />Dashboard
          </h1>
          <p className="hero-subtitle" style={{ margin: '0 0 24px' }}>
            AI-powered multi-disease risk monitoring with real-time explainability.
          </p>
          <button id="btn-new-prediction" className="btn btn-primary btn-lg" onClick={() => navigate('/predict')}>
            🔬 Run New Prediction
          </button>
        </div>

        {error && (
          <div className="disclaimer mb-6">⚠️ {error}</div>
        )}

        {/* Stats Row */}
        <div className="grid-4 mb-8">
          <StatCard label="Total Predictions" value={history?.total_records ?? '—'} />
          <StatCard
            label="Average Risk Score"
            value={analysis?.average_risk_score ?? '—'}
            unit="/100"
            color="#f59e0b"
          />
          <StatCard
            label="Current Trend"
            value={analysis?.current_trend ?? 'N/A'}
            color={analysis?.current_trend === 'Improving' ? '#10b981' : analysis?.current_trend === 'Worsening' ? '#ef4444' : '#4f8ef7'}
          />
          <StatCard
            label="Highest Risk Tier"
            value={analysis?.highest_risk_tier ?? 'N/A'}
            color={TIER_COLORS[analysis?.highest_risk_tier] || '#4f8ef7'}
          />
        </div>

        {/* Risk Trend Chart */}
        <div className="card mb-8">
          <h2 style={{ marginBottom: 24, fontSize: '1.1rem' }}>📈 Risk Score Trend</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#8ba4c8" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} stroke="#8ba4c8" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                labelStyle={{ color: '#f0f6ff' }}
                formatter={(val) => [`${val}/100`, 'Risk Score']}
              />
              <Line
                type="monotone" dataKey="risk" stroke="url(#riskGradient)"
                strokeWidth={2.5} dot={{ fill: '#4f8ef7', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#00d4ff' }}
              />
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4f8ef7" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent History & Disease Directory */}
        <div className="grid-2">
          {/* Recent Predictions */}
          <div className="card">
            <h2 style={{ marginBottom: 20, fontSize: '1.1rem' }}>🕐 Recent Predictions</h2>
            {!history || history.total_records === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔬</div>
                <p>No predictions yet.</p>
                <button className="btn btn-primary mt-4" onClick={() => navigate('/predict')}>Start Prediction</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {history.records.slice(0, 6).map((r) => (
                  <div key={r.prediction_id} className="card-glass flex items-center justify-between" style={{ padding: '12px 16px' }}>
                    <div>
                      <div className="font-semibold" style={{ fontSize: '0.9rem' }}>{r.top_disease}</div>
                      <div className="text-sm text-muted">{new Date(r.timestamp).toLocaleDateString()}</div>
                    </div>
                    <span className={`badge badge-${r.risk_tier.toLowerCase()}`}>{r.risk_tier}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disease Directory */}
          <div className="card">
            <h2 style={{ marginBottom: 20, fontSize: '1.1rem' }}>📚 Disease Knowledge Base</h2>
            {diseases.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Seed the database to populate the knowledge base.
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {diseases.map((d) => (
                  <Link
                    key={d.name}
                    to={`/disease/${encodeURIComponent(d.name)}`}
                    className={`badge badge-${d.category.toLowerCase()}`}
                    style={{ textDecoration: 'none', cursor: 'pointer' }}
                  >
                    {d.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="disclaimer mt-4">
          ⚠️ MediPredict AI is for research and informational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
        </div>
      </div>
    </div>
  )
}
