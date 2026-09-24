import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  User,
  Activity,
  HeartPulse,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Moon,
  Dumbbell,
  Apple,
  Cigarette,
  Wine,
  Stethoscope,
  ClipboardList,
} from 'lucide-react'
import { predictDisease } from '../services/api.js'

const SYMPTOMS = [
  'fatigue', 'chest pain', 'shortness of breath', 'dizziness', 'nausea',
  'headache', 'fever', 'blurred vision', 'frequent urination', 'excessive thirst',
  'weight gain', 'weight loss', 'joint pain', 'itching', 'cough', 'wheezing',
  'swelling', 'palpitations', 'numbness', 'abdominal pain'
]

const STEPS = [
  { label: 'Patient Vitals', icon: User },
  { label: 'Symptoms', icon: AlertCircle },
  { label: 'Lifestyle & Habits', icon: Dumbbell },
  { label: 'Review & Run', icon: Sparkles },
]

function StepIndicator({ current }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      marginBottom: 36,
    }}>
      {STEPS.map((s, i) => {
        const Icon = s.icon
        const isDone = i < current
        const isActive = i === current

        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: isActive ? '1px solid #1d4ed8' : isDone ? '1px solid #10b981' : '1px solid #cbd5e1',
                  background: isActive
                    ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                    : isDone
                    ? '#ecfdf5'
                    : '#ffffff',
                  color: isActive ? '#ffffff' : isDone ? '#059669' : '#64748b',
                  boxShadow: isActive ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {isDone ? <CheckCircle2 size={18} /> : <Icon size={16} />}
              </div>
              <span style={{
                fontSize: '0.74rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}>
                {s.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1,
                height: 2,
                background: isDone ? '#10b981' : '#cbd5e1',
                margin: '0 12px',
                marginBottom: 20,
                transition: 'background 0.3s ease',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function PredictionForm() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    user_id: 'demo_user',
    age: '', gender: 'M', bmi: '', blood_pressure: '120/80',
    glucose: '', cholesterol: '',
    symptoms: [],
    smoking: false, exercise: 3, sleep: 7, alcohol: 0, diet: 5,
    heart_rate: 72, ecg_events: 0, steps: 5000
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const toggleSymptom = (s) => set('symptoms', form.symptoms.includes(s)
    ? form.symptoms.filter(x => x !== s)
    : [...form.symptoms, s]
  )

  const buildPayload = () => ({
    user_id: form.user_id || 'demo_user',
    structured_data: {
      age: parseInt(form.age) || 40,
      gender: form.gender,
      bmi: parseFloat(form.bmi) || 22,
      blood_pressure: form.blood_pressure || '120/80',
      glucose: parseFloat(form.glucose) || 90,
      cholesterol: parseFloat(form.cholesterol) || 180
    },
    symptoms: form.symptoms,
    lifestyle_data: {
      smoking: form.smoking,
      exercise_hours_weekly: parseFloat(form.exercise),
      sleep_hours_nightly: parseFloat(form.sleep),
      alcohol_units_weekly: parseFloat(form.alcohol),
      diet_quality_score: parseFloat(form.diet)
    },
    wearable_data: {
      avg_resting_heart_rate: parseInt(form.heart_rate),
      abnormal_ecg_events: parseInt(form.ecg_events),
      daily_steps: parseInt(form.steps)
    }
  })

  const submit = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await predictDisease(buildPayload())
      navigate('/result', { state: { result } })
    } catch (e) {
      setError(e.response?.data?.detail || 'Prediction failed. Please check the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <div style={{ padding: '40px 0 24px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              borderRadius: 20,
              padding: '2px 10px',
              fontSize: '0.74rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <Stethoscope size={13} /> MULTI-MODAL INFERENCE
            </span>
          </div>
          <h1 style={{
            fontSize: 'clamp(1.9rem, 3.5vw, 2.3rem)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}>
            Multi-Disease Risk Diagnostic
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', maxWidth: 540, margin: '0 auto 28px' }}>
            Provide clinical vitals, symptom indications, and lifestyle indices for real-time XGBoost risk stratification.
          </p>
          <StepIndicator current={step} />
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Patient Vitals */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.25 }}
              className="kokonut-card"
              style={{ padding: 32 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#eff6ff',
                  color: 'var(--accent-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <User size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Patient Demographics & Vitals
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Core physiological measurements and laboratory markers.
                  </p>
                </div>
              </div>

              <div className="grid-2 mb-4">
                <div className="form-group">
                  <label className="form-label">Age (Years)</label>
                  <input id="input-age" type="number" className="form-input" placeholder="e.g. 45"
                    value={form.age} onChange={e => set('age', e.target.value)} min={0} max={120} />
                </div>
                <div className="form-group">
                  <label className="form-label">Biological Sex</label>
                  <select id="select-gender" className="form-select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Body Mass Index (BMI)</label>
                  <input id="input-bmi" type="number" step="0.1" className="form-input" placeholder="e.g. 26.5"
                    value={form.bmi} onChange={e => set('bmi', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Pressure (Sys/Dia mmHg)</label>
                  <input id="input-bp" type="text" className="form-input" placeholder="e.g. 120/80"
                    value={form.blood_pressure} onChange={e => set('blood_pressure', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fasting Glucose (mg/dL)</label>
                  <input id="input-glucose" type="number" className="form-input" placeholder="e.g. 95"
                    value={form.glucose} onChange={e => set('glucose', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Total / LDL Cholesterol (mg/dL)</label>
                  <input id="input-cholesterol" type="number" className="form-input" placeholder="e.g. 190"
                    value={form.cholesterol} onChange={e => set('cholesterol', e.target.value)} />
                </div>
              </div>

              {/* Wearable optional data */}
              <div style={{
                marginTop: 20,
                padding: '16px 18px',
                borderRadius: 10,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <Activity size={14} style={{ color: 'var(--accent-blue)' }} />
                  <span>Wearable Biosensor Metrics (Optional Telemetry)</span>
                </label>
                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.72rem' }}>Resting Heart Rate (bpm)</label>
                    <input type="number" className="form-input" value={form.heart_rate} onChange={e => set('heart_rate', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.72rem' }}>Abnormal ECG Events</label>
                    <input type="number" className="form-input" value={form.ecg_events} onChange={e => set('ecg_events', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.72rem' }}>Daily Steps</label>
                    <input type="number" className="form-input" value={form.steps} onChange={e => set('steps', e.target.value)} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button
                  id="btn-next-step1"
                  className="btn btn-primary"
                  onClick={() => setStep(1)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <span>Next: Symptom Survey</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 1: Symptoms */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.25 }}
              className="kokonut-card"
              style={{ padding: 32 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#fffbeb',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <AlertCircle size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Current Symptom Presentation
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Select any physiological or clinical symptoms experienced within the past 14 days.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
                {SYMPTOMS.map(s => {
                  const isSelected = form.symptoms.includes(s)
                  return (
                    <button
                      id={`symptom-${s.replace(/\s/g,'-')}`}
                      key={s}
                      type="button"
                      className={`symptom-tag${isSelected ? ' selected' : ''}`}
                      onClick={() => toggleSymptom(s)}
                      style={{
                        padding: '8px 14px',
                        fontSize: '0.84rem',
                        fontWeight: isSelected ? 700 : 500,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                      }}
                    >
                      {isSelected ? <CheckCircle2 size={14} /> : null}
                      <span>{s}</span>
                    </button>
                  )
                })}
              </div>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '14px 18px',
                marginBottom: 24,
              }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                  Selected Indicators: <strong style={{ color: 'var(--accent-blue)' }}>{form.symptoms.length}</strong> active complaint{form.symptoms.length !== 1 ? 's' : ''}
                </p>
                {form.symptoms.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {form.symptoms.map(s => (
                      <span key={s} style={{
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe',
                        padding: '2px 8px',
                        borderRadius: 6,
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setStep(0)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  id="btn-next-step2"
                  className="btn btn-primary"
                  onClick={() => setStep(2)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <span>Next: Lifestyle</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Lifestyle */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.25 }}
              className="kokonut-card"
              style={{ padding: 32 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Dumbbell size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Lifestyle & Behavioral Habits
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Daily physical activity, sleep hygiene, dietary compliance, and exposures.
                  </p>
                </div>
              </div>

              <div className="form-group mb-6" style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '14px 18px',
              }}>
                <label className="form-checkbox" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    id="checkbox-smoking"
                    type="checkbox"
                    checked={form.smoking}
                    onChange={e => set('smoking', e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--accent-blue)' }}
                  />
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Tobacco / Nicotine Exposure</span>
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>Current cigarette smoker or former smoker with pack-years history</p>
                  </div>
                </label>
              </div>

              <div className="grid-2 mb-6">
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Dumbbell size={14} style={{ color: 'var(--accent-blue)' }} /> Exercise
                    </label>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{form.exercise} hrs/week</span>
                  </div>
                  <input
                    id="input-exercise"
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    value={form.exercise}
                    onChange={e => set('exercise', e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--accent-blue)' }}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Moon size={14} style={{ color: 'var(--accent-purple)' }} /> Sleep
                    </label>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-purple)' }}>{form.sleep} hrs/night</span>
                  </div>
                  <input
                    id="input-sleep"
                    type="range"
                    min="3"
                    max="12"
                    step="0.5"
                    value={form.sleep}
                    onChange={e => set('sleep', e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Wine size={14} style={{ color: 'var(--accent-orange)' }} /> Alcohol Intake
                    </label>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-orange)' }}>{form.alcohol} units/wk</span>
                  </div>
                  <input
                    id="input-alcohol"
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={form.alcohol}
                    onChange={e => set('alcohol', e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--accent-orange)' }}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Apple size={14} style={{ color: '#10b981' }} /> Diet Quality
                    </label>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>{form.diet} / 10</span>
                  </div>
                  <input
                    id="input-diet"
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={form.diet}
                    onChange={e => set('diet', e.target.value)}
                    style={{ width: '100%', accentColor: '#10b981' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setStep(1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  id="btn-next-step3"
                  className="btn btn-primary"
                  onClick={() => setStep(3)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <span>Review Submission</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.25 }}
              className="kokonut-card"
              style={{ padding: 32 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#f3e8ff',
                  color: 'var(--accent-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <ClipboardList size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Review Clinical Parameters
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Confirm multimodal values prior to launching XGBoost inference.
                  </p>
                </div>
              </div>

              <div className="grid-2 mb-6">
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '16px',
                }}>
                  <p style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                    PATIENT VITALS
                  </p>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <strong>Age:</strong> {form.age || '40'} | <strong>Sex:</strong> {form.gender}<br />
                    <strong>BMI:</strong> {form.bmi || '22.0'} | <strong>BP:</strong> {form.blood_pressure}<br />
                    <strong>Glucose:</strong> {form.glucose || '90'} mg/dL | <strong>Chol:</strong> {form.cholesterol || '180'} mg/dL
                  </p>
                </div>

                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '16px',
                }}>
                  <p style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                    BEHAVIORAL LIFESTYLE
                  </p>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <strong>Smoking:</strong> {form.smoking ? 'Yes' : 'No'}<br />
                    <strong>Exercise:</strong> {form.exercise} hrs/wk | <strong>Sleep:</strong> {form.sleep} hrs/night<br />
                    <strong>Alcohol:</strong> {form.alcohol} units/wk | <strong>Diet:</strong> {form.diet}/10
                  </p>
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '14px 16px',
                marginBottom: 20,
              }}>
                <p style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                  INDICATED SYMPTOMS ({form.symptoms.length})
                </p>
                {form.symptoms.length === 0 ? (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>No active symptoms specified (Standard baseline mode)</p>
                ) : (
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-primary)', margin: 0 }}>{form.symptoms.join(', ')}</p>
                )}
              </div>

              {error && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 18,
                  color: '#991b1b',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setStep(2)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  id="btn-submit-prediction"
                  className="btn btn-shimmer"
                  onClick={submit}
                  disabled={loading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 26px',
                    fontSize: '0.94rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                      <span>Computing SHAP Inference...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={17} />
                      <span>Execute AI Diagnosis</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
