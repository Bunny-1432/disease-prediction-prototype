import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Activity,
  Sparkles,
  HeartPulse,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Stethoscope,
  Calendar,
} from 'lucide-react'
import { getUserHistory, getRiskAnalysis, listDiseases } from '../services/api.js'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const USER_ID = 'demo_user'

const TIER_COLORS = {
  Low: '#059669',
  Medium: '#d97706',
  High: '#dc2626',
  Critical: '#db2777',
}

const TIER_BG = {
  Low: '#ecfdf5',
  Medium: '#fffbeb',
  High: '#fef2f2',
  Critical: '#fdf2f8',
}

function StatCard({ icon: Icon, label, value, unit = '', color, trend, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className="kokonut-card"
      style={{
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 120,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{
          fontSize: '0.78rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {label}
        </span>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: color ? `${color}15` : '#f1f5f9',
          color: color || 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={17} strokeWidth={2.2} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 12 }}>
        <span style={{
          fontSize: '1.95rem',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          color: color || 'var(--text-primary)',
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {unit}
          </span>
        )}
      </div>

      {trend && (
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>
          {trend}
        </div>
      )}
    </motion.div>
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
        listDiseases().catch(() => ({ diseases: [] })),
      ])
      setHistory(hist)
      setDiseases(dis.diseases || [])
      if (hist && hist.total_records > 0) {
        const anl = await getRiskAnalysis(USER_ID, 10).catch(() => null)
        setAnalysis(anl)
      }
    } catch {
      setError('Backend connection offline. Displaying local clinical telemetry.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const chartData = history?.records?.slice().reverse().map((r) => ({
    name: new Date(r.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    risk: r.risk_score,
    tier: r.risk_tier,
  })) || [
    { name: 'Jan 10', risk: 42 },
    { name: 'Jan 17', risk: 55 },
    { name: 'Jan 24', risk: 48 },
    { name: 'Feb 1', risk: 61 },
    { name: 'Feb 8', risk: 52 },
    { name: 'Feb 15', risk: 44 },
  ]

  return (
    <div className="page" style={{ paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 1160 }}>

        {/* ── Hero Section (Baklit & Shadcn Style) ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            padding: '44px 0 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 20,
            borderBottom: '1px solid #cbd5e1',
            marginBottom: 32,
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span style={{
                background: '#e0f2fe',
                color: '#0369a1',
                border: '1px solid #bae6fd',
                borderRadius: 20,
                padding: '3px 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0284c7' }} />
                MULTIMODAL XGBOOST + SHAP ENGINE
              </span>
            </div>
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 2.7rem)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}>
              Clinical Health Intelligence
            </h1>
            <p style={{
              fontSize: '1.02rem',
              color: 'var(--text-muted)',
              marginTop: 6,
              maxWidth: 620,
              lineHeight: 1.5,
            }}>
              Calibrated multi-disease risk forecasting, biomarker progression analytics, and live 24-hour clinical evidence.
            </p>
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              id="btn-new-prediction"
              className="btn btn-shimmer"
              onClick={() => navigate('/predict')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                fontSize: '0.94rem',
                cursor: 'pointer',
              }}
            >
              <Sparkles size={18} />
              <span>Run Diagnostic Assessment</span>
            </motion.button>
          </div>
        </motion.div>

        {error && (
          <div className="disclaimer mb-6" style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309' }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── KokonutUI Bento Stat Cards ── */}
        <div className="grid-4 mb-8">
          <StatCard
            icon={Activity}
            label="Total Predictions"
            value={history?.total_records ?? '0'}
            trend="Patient longitudinal log"
            delay={0.05}
          />
          <StatCard
            icon={TrendingUp}
            label="Average Risk Score"
            value={analysis?.average_risk_score ?? '—'}
            unit="/100"
            color="#d97706"
            trend="Calibrated multi-disease index"
            delay={0.1}
          />
          <StatCard
            icon={HeartPulse}
            label="Current Trend"
            value={analysis?.current_trend ?? 'Stable'}
            color={
              analysis?.current_trend === 'Improving'
                ? '#059669'
                : analysis?.current_trend === 'Worsening'
                ? '#dc2626'
                : '#2563eb'
            }
            trend="Rolling trajectory"
            delay={0.15}
          />
          <StatCard
            icon={ShieldAlert}
            label="Highest Risk Tier"
            value={analysis?.highest_risk_tier ?? 'Optimal'}
            color={TIER_COLORS[analysis?.highest_risk_tier] || '#059669'}
            trend="Triage severity"
            delay={0.2}
          />
        </div>

        {/* ── Interactive Risk Score Trend Chart (Swiss Precision Panel) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="kokonut-card mb-8"
          style={{ padding: '24px 28px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={18} style={{ color: 'var(--accent-blue)' }} />
                Longitudinal Risk Score Trajectory
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Sequential progression of calibrated composite risk scores across assessments (0–100).
              </p>
            </div>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              background: '#f1f5f9',
              color: 'var(--text-secondary)',
              border: '1px solid #cbd5e1',
              padding: '3px 10px',
              borderRadius: 6,
            }}>
              SERIAL TIME-SERIES
            </span>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
                  fontSize: '0.84rem',
                }}
                labelStyle={{ color: '#0f172a', fontWeight: 700 }}
                itemStyle={{ color: '#1d4ed8' }}
                formatter={(val) => [`${val} / 100`, 'Risk Score']}
              />
              <Line
                type="monotone"
                dataKey="risk"
                stroke="#1d4ed8"
                strokeWidth={3}
                dot={{ fill: '#1d4ed8', strokeWidth: 2, stroke: '#ffffff', r: 5 }}
                activeDot={{ r: 8, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ── Recent History & 24H Knowledge Base Bento ── */}
        <div className="grid-2">
          {/* Recent Predictions Panel */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="kokonut-card"
            style={{ padding: '24px 26px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={18} style={{ color: 'var(--accent-cyan)' }} />
                Recent Clinical Inferences
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {history?.records?.length || 0} logged
              </span>
            </div>

            {!history || !history.records || history.records.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
                <Stethoscope size={36} strokeWidth={1.5} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
                <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No previous assessments recorded</p>
                <p style={{ fontSize: '0.82rem', marginTop: 4 }}>Complete a prediction form to generate personalized analytics.</p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 16, fontSize: '0.86rem' }}
                  onClick={() => navigate('/predict')}
                >
                  Start Assessment
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(history.records || []).slice(0, 6).map((r) => {
                  const tColor = TIER_COLORS[r.risk_tier] || '#64748b'
                  const tBg = TIER_BG[r.risk_tier] || '#f8fafc'

                  return (
                    <div
                      key={r.prediction_id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 10,
                        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: 'inset 0 1px 0 #ffffff, 0 1px 2px rgba(15,23,42,0.04)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                          {r.top_disease}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          <Calendar size={12} />
                          <span>{new Date(r.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            fontSize: '1rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-telemetry)',
                            color: tColor,
                          }}>
                            {r.risk_score}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                            Score
                          </span>
                        </div>
                        <span style={{
                          background: tBg,
                          color: tColor,
                          border: `1px solid ${tColor}35`,
                          borderRadius: 6,
                          padding: '3px 8px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                        }}>
                          {r.risk_tier}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>

          {/* 24-Hour Disease Knowledge Base Directory */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="kokonut-card"
            style={{ padding: '24px 26px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={18} style={{ color: 'var(--accent-purple)' }} />
                  Disease Knowledge Base
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Point-by-point clinical breakdown & active live trial feeds.
                </p>
              </div>

              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                background: '#ecfdf5',
                color: '#059669',
                border: '1px solid #a7f3d0',
                borderRadius: 4,
                padding: '2px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                24H LIVE SYNC
              </span>
            </div>

            {diseases.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', padding: '20px 0' }}>
                Connecting to synchronized clinical repositories...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {diseases.map((d) => (
                  <Link
                    key={d.name}
                    to={`/disease/${encodeURIComponent(d.name)}`}
                    style={{
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                      border: '1px solid #cbd5e1',
                      boxShadow: 'inset 0 1px 0 #ffffff, 0 1px 3px rgba(15,23,42,0.04)',
                      transition: 'all 0.16s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#94a3b8'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {d.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {d.severity ? `Clinical Tier: ${d.severity}` : 'Point-by-point visual guide'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`badge badge-${d.category?.toLowerCase() || 'lifestyle'}`} style={{ fontSize: '0.72rem' }}>
                        {d.category}
                      </span>
                      <ArrowUpRight size={15} style={{ color: 'var(--accent-blue)' }} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Clinical Disclaimer ── */}
        <div className="disclaimer" style={{ marginTop: 32 }}>
          ⚠️ <strong>MediPredict AI</strong> is an investigational risk estimation apparatus powered by Machine Learning and SHAP explainability. It is NOT a clinical diagnosis or medical directive. Always consult a qualified board-certified physician.
        </div>

      </div>
    </div>
  )
}
