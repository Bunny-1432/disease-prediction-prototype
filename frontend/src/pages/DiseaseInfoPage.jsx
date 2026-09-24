import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Activity,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  FileText,
  Clock,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  FlaskConical,
  Stethoscope,
  HeartPulse,
  Sparkles,
} from 'lucide-react'
import { getDiseaseInfo, refreshDiseaseKnowledge, getDiseaseSyncStatus } from '../services/api.js'

const ALL_DISEASES = [
  'Type 2 Diabetes',
  'Hypertension',
  'Chronic Kidney Disease',
  'COPD',
  'Coronary Artery Disease',
  'Healthy / Optimal Baseline',
]

const SEV_COLOR = {
  'Life-Threatening Emergency': '#dc2626',
  'Critical': '#ea580c',
  'Serious': '#d97706',
  'Low Risk / Optimal': '#059669',
  'Optimal': '#059669',
}

const ORGAN_ICONS = {
  'Retina': '👁️',
  'Eyes': '👁️',
  'Renal': '🫘',
  'Kidneys': '🫘',
  'Brain': '🧠',
  'Cerebrovascular': '🧠',
  'Heart': '🫀',
  'Coronary': '🫀',
  'Aorta': '🫀',
  'Lungs': '🫁',
  'Airways': '🫁',
  'Alveolar': '🫁',
  'Nerves': '⚡',
  'Peripheral': '⚡',
  'Metabolic': '🧬',
  'Skeletal': '🦴',
  'Whole body': '✨',
  'Cardiovascular': '🫀',
}

function getOrganIcon(organName = '') {
  for (const [key, icon] of Object.entries(ORGAN_ICONS)) {
    if (organName.toLowerCase().includes(key.toLowerCase())) return icon
  }
  return '🩺'
}

function formatDateTime(isoString) {
  if (!isoString) return 'Pending Sync'
  try {
    const d = new Date(isoString)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoString
  }
}

export default function DiseaseInfoPage() {
  const { name } = useParams()
  const navigate = useNavigate()

  const currentDiseaseName = decodeURIComponent(name || 'Type 2 Diabetes')
  const [disease, setDisease] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('')
  const [error, setError] = useState(null)

  const fetchDiseaseData = (diseaseName) => {
    setLoading(true)
    setError(null)
    Promise.all([
      getDiseaseInfo(diseaseName),
      getDiseaseSyncStatus().catch(() => null),
    ])
      .then(([info, status]) => {
        setDisease(info)
        if (status) setSyncStatus(status)
      })
      .catch((e) => {
        setError(e.response?.data?.detail || 'Disease not found in knowledge base.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDiseaseData(currentDiseaseName)
  }, [currentDiseaseName])

  const handleManualSync = async () => {
    try {
      setSyncing(true)
      setSyncSuccessMsg('')
      const res = await refreshDiseaseKnowledge()
      if (res.sync_status) setSyncStatus(res.sync_status)
      setSyncSuccessMsg('Knowledge base synced with live ClinicalTrials.gov and PubMed feeds!')
      const updated = await getDiseaseInfo(currentDiseaseName)
      setDisease(updated)
      setTimeout(() => setSyncSuccessMsg(''), 6000)
    } catch (e) {
      console.error('Sync failed:', e)
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center' }}
        >
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', fontWeight: 600 }}>
            Synchronizing live clinical intelligence...
          </p>
        </motion.div>
      </div>
    )
  }

  if (error || !disease) {
    return (
      <div className="page">
        <div className="container" style={{ paddingTop: 60, textAlign: 'center', maxWidth: 600 }}>
          <div className="kokonut-card" style={{ padding: 36 }}>
            <AlertTriangle size={36} style={{ color: 'var(--accent-red)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--accent-red)', fontWeight: 600, fontSize: '1.05rem', marginBottom: 16 }}>
              {error || 'Disease profile unavailable.'}
            </p>
            <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={16} />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const sevColor = SEV_COLOR[disease.severity] || 'var(--accent-orange)'

  return (
    <div className="page" style={{ paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 1140 }}>

        {/* ── Breadcrumb & Top Action Bar ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, paddingTop: 32, marginBottom: 20 }}>
          <Link
            to="/"
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.86rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={15} />
            <span>Dashboard</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              VERIFIED SOURCES:
            </span>
            <span style={{
              background: '#e0f2fe',
              color: '#0369a1',
              border: '1px solid #bae6fd',
              borderRadius: 6,
              padding: '2px 8px',
              fontSize: '0.76rem',
              fontWeight: 700,
            }}>
              NCBI / CLINICALTRIALS.GOV
            </span>
          </div>
        </div>

        {/* ── 24-Hour Automated Synchronization Telemetry Bar (KokonutUI Style) ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="kokonut-card kokonut-glow-green mb-6"
          style={{ padding: '16px 22px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                position: 'relative',
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.25)',
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: '#10b981',
                  animation: 'pulseGlow 2.5s infinite',
                }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
                    AUTOMATED 24-HOUR SYNC ACTIVE
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: '#ecfdf5',
                    color: '#059669',
                    border: '1px solid #a7f3d0',
                    borderRadius: 4,
                    padding: '1px 6px',
                  }}>
                    EVERY 24 HOURS
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Last Synced: <strong style={{ color: 'var(--text-secondary)' }}>{formatDateTime(syncStatus?.last_synced_at || disease.realtime_feed?.last_synced_at)}</strong>
                  {' • '}
                  Next Auto-Update: <strong style={{ color: 'var(--text-secondary)' }}>{formatDateTime(syncStatus?.next_sync_at || disease.realtime_feed?.next_sync_at)}</strong>
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="btn-sync-knowledge"
                onClick={handleManualSync}
                disabled={syncing}
                className="btn btn-secondary"
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 16px',
                  cursor: syncing ? 'not-allowed' : 'pointer',
                }}
              >
                <motion.div
                  animate={{ rotate: syncing ? 360 : 0 }}
                  transition={{ repeat: syncing ? Infinity : 0, duration: 1, ease: 'linear' }}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <RefreshCw size={14} />
                </motion.div>
                <span>{syncing ? 'Syncing Live Feeds...' : 'Sync Live Data Now'}</span>
              </motion.button>
            </div>
          </div>

          {syncSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{
                marginTop: 12,
                padding: '8px 14px',
                borderRadius: 6,
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#15803d',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle2 size={15} />
              <span>{syncSuccessMsg}</span>
            </motion.div>
          )}
        </motion.div>

        {/* ── Segmented Disease Navigation Tabs (Shadcn Style) ── */}
        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 8,
          marginBottom: 24,
          scrollbarWidth: 'thin',
        }}>
          {ALL_DISEASES.map((dName) => {
            const isActive = dName.toLowerCase() === currentDiseaseName.toLowerCase()
            return (
              <motion.button
                key={dName}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/disease/${encodeURIComponent(dName)}`)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 10,
                  fontSize: '0.86rem',
                  fontWeight: isActive ? 700 : 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: isActive ? '1px solid #1a56db' : '1px solid #cbd5e1',
                  background: isActive
                    ? 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)'
                    : 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  boxShadow: isActive
                    ? 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 5px rgba(29,78,216,0.25)'
                    : 'inset 0 1px 0 #ffffff, 0 1px 2px rgba(15,23,42,0.04)',
                  transition: 'all 0.15s ease',
                }}
              >
                {dName}
              </motion.button>
            )
          })}
        </div>

        {/* ── Main Identity & Pathology Hero Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="kokonut-card mb-6"
          style={{ padding: 30 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                <h1 style={{
                  fontSize: '2.15rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}>
                  {disease.name}
                </h1>
                <span className={`badge badge-${(disease.category || '').toLowerCase()}`} style={{ fontSize: '0.78rem' }}>
                  {disease.category}
                </span>
                <span style={{
                  background: `${sevColor}15`,
                  color: sevColor,
                  border: `1px solid ${sevColor}40`,
                  borderRadius: 6,
                  padding: '3px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}>
                  {disease.severity}
                </span>
              </div>
              {disease.types && disease.types.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {disease.types.map((t, idx) => (
                    <span key={idx} style={{
                      fontSize: '0.76rem',
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                      background: 'rgba(15,23,42,0.04)',
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      padding: '3px 8px',
                    }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <p style={{
            fontSize: '1.02rem',
            lineHeight: 1.8,
            color: 'var(--text-secondary)',
            marginBottom: 24,
          }}>
            {disease.description}
          </p>

          <div style={{
            background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            boxShadow: 'inset 0 1px 0 #ffffff',
          }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#eff6ff',
              color: 'var(--accent-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Stethoscope size={20} />
            </div>
            <div>
              <p style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                RECOMMENDED CLINICAL ACTION
              </p>
              <p style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {disease.recommended_action}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── POINT 1: KEY BIOMARKER GAUGES & VISUAL RANGES ── */}
        {disease.biomarkers && disease.biomarkers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="kokonut-card mb-6"
            style={{ padding: 26 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={19} style={{ color: 'var(--accent-blue)' }} />
                  Point 1: Key Diagnostic Biomarkers & Reference Gauges
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Calibrated physiological thresholds: Normal vs Borderline vs Critical diagnostic levels.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 16 }}>
              {disease.biomarkers.map((b, i) => {
                const isCritical = b.status === 'Critical'
                const isBorderline = b.status === 'Borderline'
                const statusColor = isCritical ? '#dc2626' : isBorderline ? '#d97706' : '#059669'

                return (
                  <motion.div
                    key={i}
                    whileHover={{ y: -2 }}
                    style={{
                      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                      border: '1px solid #cbd5e1',
                      borderRadius: 12,
                      padding: '16px 18px',
                      boxShadow: 'inset 0 1px 0 #ffffff, 0 2px 6px rgba(15,23,42,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{b.name}</p>
                        <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Unit: {b.unit}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: '1.05rem',
                          fontWeight: 800,
                          fontFamily: 'var(--font-telemetry)',
                          color: statusColor,
                        }}>
                          {b.typical_value}
                        </span>
                        <span style={{
                          display: 'block',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: statusColor,
                          textTransform: 'uppercase',
                        }}>
                          {b.status}
                        </span>
                      </div>
                    </div>

                    {/* Visual Meter Track */}
                    <div style={{ position: 'relative', marginTop: 14, marginBottom: 12 }}>
                      <div style={{
                        height: 10,
                        borderRadius: 6,
                        display: 'flex',
                        overflow: 'hidden',
                        boxShadow: 'inset 0 1px 3px rgba(15,23,42,0.15)',
                        background: '#e2e8f0',
                      }}>
                        <div style={{ width: '40%', background: '#10b981' }} title="Normal Zone" />
                        <div style={{ width: '30%', background: '#f59e0b' }} title="Borderline Zone" />
                        <div style={{ width: '30%', background: '#ef4444' }} title="Critical Zone" />
                      </div>

                      {/* Needle / Marker indicator */}
                      <motion.div
                        initial={{ left: '0%' }}
                        animate={{ left: `${Math.min(Math.max(b.percentile || 50, 5), 95)}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        style={{
                          position: 'absolute',
                          top: -5,
                          transform: 'translateX(-50%)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{
                          width: 4,
                          height: 20,
                          background: '#0f172a',
                          borderRadius: 2,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                        }} />
                      </motion.div>
                    </div>

                    {/* Zone Legend */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      marginBottom: 8,
                      fontWeight: 500,
                    }}>
                      <span>Norm: {b.normal}</span>
                      <span>Bord: {b.borderline}</span>
                      <span>Crit: {b.critical}</span>
                    </div>

                    <p style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: 8,
                    }}>
                      {b.interpretation}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ── POINT 2: CLINICAL PROGRESSION STAGES STEPPER ── */}
        {disease.stages && disease.stages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="kokonut-card mb-6"
            style={{ padding: 26 }}
          >
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Activity size={19} style={{ color: 'var(--accent-orange)' }} />
              Point 2: Clinical Progression Stages & Pathological Stepper
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Chronological transition from initial cellular insult to irreversible end-organ damage.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              {disease.stages.map((stg) => {
                const stageColors = {
                  1: { border: '#10b981', bg: '#ecfdf5', text: '#065f46' },
                  2: { border: '#f59e0b', bg: '#fffbeb', text: '#92400e' },
                  3: { border: '#f97316', bg: '#fff7ed', text: '#9a3412' },
                  4: { border: '#ef4444', bg: '#fef2f2', text: '#991b1b' },
                }[stg.stage] || { border: '#64748b', bg: '#f8fafc', text: '#1e293b' }

                return (
                  <motion.div
                    key={stg.stage}
                    whileHover={{ y: -2 }}
                    style={{
                      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                      border: `1px solid ${stageColors.border}40`,
                      borderTop: `4px solid ${stageColors.border}`,
                      borderRadius: 10,
                      padding: '16px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 6px rgba(15,23,42,0.04)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{
                          background: stageColors.bg,
                          color: stageColors.text,
                          fontWeight: 800,
                          fontSize: '0.74rem',
                          padding: '2px 8px',
                          borderRadius: 4,
                          border: `1px solid ${stageColors.border}60`,
                        }}>
                          STAGE {stg.stage}
                        </span>
                        <span style={{ fontSize: '0.74rem', fontWeight: 600, color: stageColors.text }}>
                          {stg.severity}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.3 }}>
                        {stg.title}
                      </h3>

                      <div style={{ marginBottom: 10 }}>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CRITERIA</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{stg.criteria}</p>
                      </div>

                      <div style={{ marginBottom: 10 }}>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>SYMPTOMS</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{stg.symptoms}</p>
                      </div>
                    </div>

                    <div style={{
                      marginTop: 12,
                      padding: '6px 10px',
                      borderRadius: 6,
                      background: 'rgba(15,23,42,0.03)',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.3,
                    }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Reversibility:</strong> {stg.reversibility}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ── POINT 3: EARLY WARNING VS ACUTE EMERGENCY SYMPTOMS ── */}
        {disease.symptoms_breakdown && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.25 }}
            className="kokonut-card mb-6"
            style={{ padding: 26 }}
          >
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <AlertTriangle size={19} style={{ color: '#d97706' }} />
              Point 3: Early Warning vs Acute Emergency Symptoms
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Differentiate insidious early markers from life-threatening red-flag presentations.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
              {/* Early Warning Card */}
              <div style={{
                background: 'linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)',
                border: '1px solid #fde68a',
                borderRadius: 12,
                padding: '20px',
                boxShadow: '0 2px 6px rgba(245,158,11,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <AlertTriangle size={18} style={{ color: '#b45309' }} />
                  <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Early Warning & Insidious Signs
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {disease.symptoms_breakdown.early_warning?.map((item, idx) => (
                    <div key={idx} style={{
                      background: '#ffffff',
                      border: '1px solid #fef3c7',
                      borderRadius: 8,
                      padding: '10px 12px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                        <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>{item.sign}</strong>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: '#fef3c7',
                          color: '#b45309',
                          padding: '1px 6px',
                          borderRadius: 4,
                          whiteSpace: 'nowrap',
                        }}>
                          {item.urgency}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {item.mechanism}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acute Emergency Card */}
              <div style={{
                background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)',
                border: '1px solid #fecaca',
                borderRadius: 12,
                padding: '20px',
                boxShadow: '0 2px 6px rgba(239,68,68,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <ShieldAlert size={18} style={{ color: '#dc2626' }} />
                  <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Acute Emergency & Red-Flag Alerts
                  </h3>
                </div>

                {disease.symptoms_breakdown.acute_emergency && disease.symptoms_breakdown.acute_emergency.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {disease.symptoms_breakdown.acute_emergency.map((item, idx) => (
                      <div key={idx} style={{
                        background: '#ffffff',
                        border: '1px solid #fee2e2',
                        borderRadius: 8,
                        padding: '10px 12px',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                          <strong style={{ fontSize: '0.86rem', color: '#991b1b' }}>{item.sign}</strong>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            background: '#fee2e2',
                            color: '#dc2626',
                            padding: '1px 6px',
                            borderRadius: 4,
                            whiteSpace: 'nowrap',
                          }}>
                            {item.urgency}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {item.mechanism}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    padding: 24,
                    textAlign: 'center',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 8,
                    color: '#15803d',
                  }}>
                    <CheckCircle2 size={32} style={{ margin: '0 auto 8px', color: '#16a34a' }} />
                    <strong style={{ fontSize: '0.88rem' }}>Optimal Homeostatic Reserve</strong>
                    <p style={{ fontSize: '0.78rem', color: '#166534', marginTop: 4 }}>
                      No acute emergency pathologies triggered under optimal lifestyle maintenance.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── POINT 4: TARGET ORGAN DAMAGE & COMPLICATIONS ── */}
        {disease.target_organs && disease.target_organs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.3 }}
            className="kokonut-card mb-6"
            style={{ padding: 26 }}
          >
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <HeartPulse size={19} style={{ color: 'var(--accent-pink)' }} />
              Point 4: Target Organ Damage & Systemic Complications
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Microvascular and macrovascular anatomical structures at highest risk of degenerative remodeling.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              {disease.target_organs.map((org, idx) => {
                const isCrit = org.risk_level === 'Critical'
                const isHigh = org.risk_level === 'High'
                const rColor = isCrit ? '#dc2626' : isHigh ? '#ea580c' : '#059669'

                return (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -2 }}
                    style={{
                      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                      border: '1px solid #cbd5e1',
                      borderRadius: 10,
                      padding: '16px',
                      boxShadow: '0 2px 4px rgba(15,23,42,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: '1.4rem' }}>{getOrganIcon(org.organ)}</span>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: `${rColor}15`,
                        color: rColor,
                        border: `1px solid ${rColor}35`,
                        borderRadius: 4,
                        padding: '1px 6px',
                      }}>
                        {org.risk_level}
                      </span>
                    </div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>
                      {org.organ}
                    </strong>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {org.damage_mechanism}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ── POINT 5: ACTIONABLE PROTOCOLS: DOs AND DONTs ── */}
        {disease.actionable_protocol && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.35 }}
            className="kokonut-card mb-6"
            style={{ padding: 26 }}
          >
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <ShieldCheck size={19} style={{ color: '#059669' }} />
              Point 5: Actionable Daily Protocols: The DO's & The DON'Ts
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Physiologically verified therapeutic actions to institute versus hazardous pitfalls to eliminate.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
              {/* DOs Card */}
              <div style={{
                background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
                border: '1px solid #bbf7d0',
                borderRadius: 12,
                padding: '20px',
                boxShadow: '0 2px 6px rgba(16,185,129,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <CheckCircle2 size={20} style={{ color: '#16a34a' }} />
                  <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    The Clinical DO's (Priority Actions)
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {disease.actionable_protocol.dos?.map((item, idx) => (
                    <div key={idx} style={{
                      background: '#ffffff',
                      border: '1px solid #dcfce7',
                      borderRadius: 8,
                      padding: '10px 12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '1px 6px', borderRadius: 4 }}>
                          {item.category}
                        </span>
                      </div>
                      <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>
                        {item.action}
                      </strong>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* DON'Ts Card */}
              <div style={{
                background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)',
                border: '1px solid #fecaca',
                borderRadius: 12,
                padding: '20px',
                boxShadow: '0 2px 6px rgba(239,68,68,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <XCircle size={20} style={{ color: '#dc2626' }} />
                  <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    The Critical DON'Ts (Hazardous Pitfalls)
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {disease.actionable_protocol.donts?.map((item, idx) => (
                    <div key={idx} style={{
                      background: '#ffffff',
                      border: '1px solid #fee2e2',
                      borderRadius: 8,
                      padding: '10px 12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#dc2626', background: '#fef2f2', padding: '1px 6px', borderRadius: 4 }}>
                          {item.category}
                        </span>
                      </div>
                      <strong style={{ fontSize: '0.86rem', color: '#991b1b', display: 'block', marginBottom: 2 }}>
                        {item.action}
                      </strong>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── POINT 6: DIAGNOSTIC & SCREENING REGIMEN ── */}
        {disease.diagnostic_tests && disease.diagnostic_tests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.4 }}
            className="kokonut-card mb-6"
            style={{ padding: 26 }}
          >
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Calendar size={19} style={{ color: 'var(--accent-cyan)' }} />
              Point 6: Recommended Diagnostic & Surveillance Schedule
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Evidence-based laboratory screening intervals and target therapeutic endpoints.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 700 }}>CLINICAL ASSAY / TEST</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 700 }}>FREQUENCY</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 700 }}>TARGET ENDPOINT</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 700 }}>IMPORTANCE & RATIONALE</th>
                  </tr>
                </thead>
                <tbody>
                  {disease.diagnostic_tests.map((t, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {t.test}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          background: '#e0f2fe',
                          color: '#0369a1',
                          borderRadius: 6,
                          padding: '3px 8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                        }}>
                          {t.frequency}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-telemetry)', color: 'var(--accent-blue)', fontWeight: 600 }}>
                        {t.target}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {t.importance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── POINT 7: REAL-TIME CLINICAL TRIALS FEED ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.45 }}
          className="kokonut-card mb-6"
          style={{ padding: 26 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FlaskConical size={19} style={{ color: 'var(--accent-blue)' }} />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Point 7: Real-Time Active Clinical Trials
                </h2>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: '#dbeafe',
                  color: '#1d4ed8',
                  padding: '1px 6px',
                  borderRadius: 4,
                }}>
                  ClinicalTrials.gov APIv2
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Live active interventional protocols evaluating therapeutics and lifestyle cures.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {disease.realtime_feed?.clinical_trials?.map((trial, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -2 }}
                style={{
                  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                  border: '1px solid #cbd5e1',
                  borderRadius: 10,
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  <a
                    href={trial.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'var(--font-telemetry)',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: 'var(--accent-blue)',
                      textDecoration: 'none',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      padding: '2px 8px',
                      borderRadius: 4,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>{trial.nct_id}</span>
                    <ExternalLink size={12} />
                  </a>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: '#ecfdf5',
                      color: '#059669',
                      border: '1px solid #a7f3d0',
                      padding: '1px 6px',
                      borderRadius: 4,
                    }}>
                      {trial.status}
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      background: '#f1f5f9',
                      color: 'var(--text-muted)',
                      border: '1px solid #cbd5e1',
                      padding: '1px 6px',
                      borderRadius: 4,
                    }}>
                      {trial.phase}
                    </span>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.4 }}>
                  {trial.title}
                </h4>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Lead Sponsor: <strong style={{ color: 'var(--text-secondary)' }}>{trial.sponsor}</strong>
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── POINT 8: PEER-REVIEWED RESEARCH FEED (NCBI PUBMED) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.5 }}
          className="kokonut-card mb-6"
          style={{ padding: 26 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={19} style={{ color: '#b45309' }} />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Point 8: Landmark & Recent Research (NCBI PubMed)
                </h2>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: '#fef3c7',
                  color: '#b45309',
                  padding: '1px 6px',
                  borderRadius: 4,
                }}>
                  NCBI E-utilities
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Peer-reviewed medical literature, clinical guidelines, and meta-analyses.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {disease.realtime_feed?.pubmed_research?.map((paper, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -2 }}
                style={{
                  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                  border: '1px solid #cbd5e1',
                  borderRadius: 10,
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'var(--font-telemetry)',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: '#b45309',
                      textDecoration: 'none',
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      padding: '2px 8px',
                      borderRadius: 4,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>PMID: {paper.pmid}</span>
                    <ExternalLink size={12} />
                  </a>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {paper.pub_date}
                  </span>
                </div>

                <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.4 }}>
                  {paper.title}
                </h4>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Journal: <strong style={{ color: 'var(--text-secondary)' }}>{paper.journal}</strong>
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Legal & Clinical Disclaimer ── */}
        <div className="disclaimer" style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: 10,
          padding: '14px 18px',
          fontSize: '0.82rem',
          color: '#92400e',
          lineHeight: 1.5,
        }}>
          ⚠️ <strong>Medical Disclaimer:</strong> This Disease Knowledge Base integrates automated 24-hour feeds from National Library of Medicine (PubMed) and ClinicalTrials.gov for educational and research synthesis purposes only. It does NOT constitute medical advice, clinical diagnosis, or treatment prescription. Always consult a qualified board-certified physician or specialist for personal healthcare decisions.
        </div>

      </div>
    </div>
  )
}
