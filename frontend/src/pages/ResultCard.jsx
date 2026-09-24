import { useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Activity,
  ShieldAlert,
  Brain,
  Pill,
  ExternalLink,
  ArrowLeft,
  Home,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Stethoscope,
} from 'lucide-react'

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

function RiskGauge({ score, tier }) {
  const tierColor = TIER_COLORS[tier] || '#d97706'
  const radius = 64
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto 16px' }}>
        <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#e2e8f0"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Animated score circle */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            stroke={tierColor}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>

        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
              lineHeight: 1,
            }}
          >
            {score}
          </motion.span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
            / 100
          </span>
        </div>
      </div>

      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: TIER_BG[tier] || '#f8fafc',
        color: tierColor,
        border: `1px solid ${tierColor}40`,
        borderRadius: 20,
        padding: '5px 16px',
        fontSize: '0.84rem',
        fontWeight: 700,
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: tierColor }} />
        {tier} Risk Tier
      </span>
    </div>
  )
}

function AccordionItem({ title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{
      border: '1px solid #cbd5e1',
      borderRadius: 10,
      marginBottom: 10,
      overflow: 'hidden',
      background: '#ffffff',
    }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.9rem',
          color: 'var(--text-primary)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {Icon && <Icon size={16} style={{ color: 'var(--accent-blue)' }} />}
          {title}
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div style={{ padding: '16px 18px', borderTop: '1px solid #f1f5f9', background: '#fafbfc' }}>
          {children}
        </div>
      )}
    </div>
  )
}

export default function ResultCard() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const result = state?.result

  if (!result) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: 'center', paddingTop: 80, maxWidth: 500 }}>
          <div className="kokonut-card" style={{ padding: 36 }}>
            <AlertTriangle size={36} style={{ color: 'var(--accent-orange)', margin: '0 auto 12px' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8 }}>No Assessment Data</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 20 }}>
              Please initiate a multi-disease prediction from the diagnostic entry form.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/predict')}>
              Start Diagnostic Run
            </button>
          </div>
        </div>
      </div>
    )
  }

  const top = result.top_predictions?.[0]
  const xai = result.explainability
  const profile = result.disease_profile
  const maxFeature = Math.max(...Object.values(xai?.top_features || { x: 0.01 }))

  return (
    <div className="page" style={{ paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 940 }}>

        {/* ── Top Header Actions ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          padding: '36px 0 20px',
        }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.86rem' }}
              onClick={() => navigate('/predict')}
            >
              <ArrowLeft size={15} />
              <span>New Assessment</span>
            </button>
            <button
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.86rem' }}
              onClick={() => navigate('/')}
            >
              <Home size={15} />
              <span>Dashboard</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              PREDICTION ID:
            </span>
            <span style={{
              fontFamily: 'var(--font-telemetry)',
              fontSize: '0.76rem',
              fontWeight: 700,
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              padding: '2px 8px',
              borderRadius: 6,
            }}>
              {result.prediction_id}
            </span>
          </div>
        </div>

        {/* ── Title Banner ── */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.2rem)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}>
            Clinical Inference Report
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 4 }}>
            Timestamp: {new Date(result.timestamp).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </div>

        {/* ── Bento Grid: Risk Gauge & SHAP XAI ── */}
        <div className="grid-2 mb-6">
          {/* Risk Gauge Panel */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="kokonut-card"
            style={{ padding: 26, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                CALIBRATED RISK ASSESSMENT
              </span>
              <span className={`badge badge-${(result.category || 'lifestyle').toLowerCase()}`} style={{ fontSize: '0.72rem' }}>
                {result.category}
              </span>
            </div>

            <RiskGauge score={top?.risk_score ?? 0} tier={top?.risk_tier ?? 'Medium'} />

            <div style={{
              width: '100%',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '14px 16px',
              marginTop: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Top Diagnosis:</span>
                <strong style={{ color: 'var(--accent-blue)' }}>{top?.disease}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Model Confidence:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{((top?.confidence ?? 0) * 100).toFixed(1)}%</strong>
              </div>
            </div>
          </motion.div>

          {/* Explainability (SHAP XAI) Panel */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="kokonut-card"
            style={{ padding: 26 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Brain size={18} style={{ color: 'var(--accent-purple)' }} />
              <h2 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Explainable AI (SHAP Weights)
              </h2>
            </div>

            <div style={{
              background: 'linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1px solid #bfdbfe',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 16,
            }}>
              <p style={{ fontSize: '0.86rem', fontStyle: 'italic', color: '#1e40af', fontWeight: 500, lineHeight: 1.45, margin: 0 }}>
                "{xai?.summary}"
              </p>
            </div>

            <p style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 10,
            }}>
              TOP INFLUENCING BIOMARKERS
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(xai?.top_features ?? {}).slice(0, 5).map(([feat, val]) => {
                const pct = Math.min((Math.abs(val) / (maxFeature || 1)) * 100, 100)
                return (
                  <div key={feat} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {feat.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontFamily: 'var(--font-telemetry)', fontWeight: 700, color: 'var(--accent-blue)' }}>
                        {(Math.abs(val) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div style={{
                      height: 6,
                      borderRadius: 3,
                      background: '#e2e8f0',
                      overflow: 'hidden',
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* ── Diagnostic Disease Profile Card ── */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="kokonut-card mb-6"
            style={{ padding: 28 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {profile.name}
                  </h2>
                  <span className={`badge badge-${(profile.category || 'lifestyle').toLowerCase()}`}>
                    {profile.category}
                  </span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Comprehensive Pathological Profile & Live Research Synchronizer
                </p>
              </div>

              <Link
                to={`/disease/${encodeURIComponent(profile.name)}`}
                className="btn btn-shimmer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.84rem',
                  padding: '9px 18px',
                  textDecoration: 'none',
                }}
              >
                <span>Explore Full 24h Guide</span>
                <ExternalLink size={14} />
              </Link>
            </div>

            <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
              {profile.description}
            </p>

            <AccordionItem title="Targeted Pharmaceutical Interventions" icon={Pill} defaultOpen>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(profile.treatment_options || []).map(t => (
                  <span key={t} style={{
                    background: 'linear-gradient(180deg, #ffffff 0%, #eff6ff 100%)',
                    border: '1px solid #bfdbfe',
                    borderRadius: 6,
                    padding: '6px 12px',
                    fontSize: '0.82rem',
                    color: '#1e40af',
                    fontWeight: 600,
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </AccordionItem>

            <AccordionItem title="Evidence-Based Prevention Strategies" icon={CheckCircle2}>
              <ul style={{ paddingLeft: 18, color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                {(profile.prevention_strategies || []).map(p => <li key={p}>{p}</li>)}
              </ul>
            </AccordionItem>

            <AccordionItem title="Degenerative Complications & Risks" icon={AlertTriangle}>
              <ul style={{ paddingLeft: 18, color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                {(profile.possible_complications || []).map(c => <li key={c}>{c}</li>)}
              </ul>
            </AccordionItem>
          </motion.div>
        )}

        {/* ── Clinical Action Directive ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="kokonut-card mb-6"
          style={{
            padding: 24,
            background: top?.risk_tier === 'Critical'
              ? 'linear-gradient(180deg, #fef2f2 0%, #fee2e2 100%)'
              : 'linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)',
            borderColor: top?.risk_tier === 'Critical' ? '#fca5a5' : '#86efac',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Stethoscope size={20} style={{ color: top?.risk_tier === 'Critical' ? '#991b1b' : '#166534' }} />
            <h2 style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: top?.risk_tier === 'Critical' ? '#991b1b' : '#166534',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              Recommended Clinical Directive
            </h2>
          </div>
          <p style={{
            fontSize: '0.94rem',
            color: top?.risk_tier === 'Critical' ? '#7f1d1d' : '#14532d',
            lineHeight: 1.6,
            fontWeight: 500,
            margin: 0,
          }}>
            {profile?.recommended_action || 'Consult a qualified healthcare provider for personalized medical evaluation.'}
          </p>
        </motion.div>

        {/* ── Disclaimer ── */}
        <div className="disclaimer">
          ⚠️ {result.disclaimer}
        </div>

      </div>
    </div>
  )
}
