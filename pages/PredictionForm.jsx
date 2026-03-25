import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { predictDisease } from '../services/api.js'

const SYMPTOMS = [
  'fatigue', 'chest pain', 'shortness of breath', 'dizziness', 'nausea',
  'headache', 'fever', 'blurred vision', 'frequent urination', 'excessive thirst',
  'weight gain', 'weight loss', 'joint pain', 'itching', 'cough', 'wheezing',
  'swelling', 'palpitations', 'numbness', 'abdominal pain'
]

const STEPS = ['Patient Data', 'Symptoms', 'Lifestyle', 'Review & Submit']

function StepIndicator({ current }) {
  return (
    <div className="step-indicator">
      {STEPS.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? '1' : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div className={`step-dot ${i < current ? 'done' : i === current ? 'active' : 'todo'}`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '0.68rem', color: i === current ? 'var(--accent-blue)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && <div className={`step-line ${i < current ? 'done' : ''}`} style={{ marginBottom: 20 }} />}
        </div>
      ))}
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
    setLoading(true); setError(null)
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
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div style={{ padding: '48px 0 32px' }}>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: 8 }}>
            🔬 New Prediction
          </h1>
          <p className="text-muted" style={{ marginBottom: 32, fontSize: '0.95rem' }}>
            Enter your health data across all modalities for a comprehensive disease risk assessment.
          </p>
          <StepIndicator current={step} />
        </div>

        {/* Step 0: Patient Data */}
        {step === 0 && (
          <div className="card animate-fadeInUp">
            <h2 style={{ marginBottom: 24, fontSize: '1.1rem' }}>🏥 Patient & Vital Data</h2>
            <div className="grid-2 mb-4">
              <div className="form-group">
                <label className="form-label">Age</label>
                <input id="input-age" type="number" className="form-input" placeholder="e.g. 45"
                  value={form.age} onChange={e => set('age', e.target.value)} min={0} max={120} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select id="select-gender" className="form-select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">BMI</label>
                <input id="input-bmi" type="number" step="0.1" className="form-input" placeholder="e.g. 27.5"
                  value={form.bmi} onChange={e => set('bmi', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Blood Pressure (Sys/Dia)</label>
                <input id="input-bp" type="text" className="form-input" placeholder="e.g. 120/80"
                  value={form.blood_pressure} onChange={e => set('blood_pressure', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Glucose (mg/dL)</label>
                <input id="input-glucose" type="number" className="form-input" placeholder="e.g. 95"
                  value={form.glucose} onChange={e => set('glucose', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Cholesterol (mg/dL)</label>
                <input id="input-cholesterol" type="number" className="form-input" placeholder="e.g. 190"
                  value={form.cholesterol} onChange={e => set('cholesterol', e.target.value)} />
              </div>
            </div>
            <div className="form-group mb-6">
              <label className="form-label">Wearable Data (Optional)</label>
              <div className="grid-3" style={{ marginTop: 8 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>Resting HR (bpm)</label>
                  <input type="number" className="form-input" value={form.heart_rate} onChange={e => set('heart_rate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>ECG Events</label>
                  <input type="number" className="form-input" value={form.ecg_events} onChange={e => set('ecg_events', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>Daily Steps</label>
                  <input type="number" className="form-input" value={form.steps} onChange={e => set('steps', e.target.value)} />
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <span />
              <button id="btn-next-step1" className="btn btn-primary" onClick={() => setStep(1)}>Next: Symptoms →</button>
            </div>
          </div>
        )}

        {/* Step 1: Symptoms */}
        {step === 1 && (
          <div className="card animate-fadeInUp">
            <h2 style={{ marginBottom: 8, fontSize: '1.1rem' }}>🤒 Symptoms</h2>
            <p className="text-muted text-sm mb-6">Select all symptoms you are currently experiencing.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
              {SYMPTOMS.map(s => (
                <button id={`symptom-${s.replace(/\s/g,'-')}`} key={s} type="button"
                  className={`symptom-tag${form.symptoms.includes(s) ? ' selected' : ''}`}
                  onClick={() => toggleSymptom(s)}>
                  {form.symptoms.includes(s) ? '✓ ' : ''}{s}
                </button>
              ))}
            </div>
            <div className="card-glass mb-6">
              <p className="text-sm text-muted">Selected: <strong style={{ color: 'var(--accent-blue)' }}>{form.symptoms.length}</strong> symptom{form.symptoms.length !== 1 ? 's' : ''}</p>
              {form.symptoms.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {form.symptoms.map(s => (
                    <span key={s} className="badge" style={{ background: 'rgba(79,142,247,0.15)', color: '#93bbff', border: '1px solid rgba(79,142,247,0.3)' }}>{s}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <button className="btn btn-secondary" onClick={() => setStep(0)}>← Back</button>
              <button id="btn-next-step2" className="btn btn-primary" onClick={() => setStep(2)}>Next: Lifestyle →</button>
            </div>
          </div>
        )}

        {/* Step 2: Lifestyle */}
        {step === 2 && (
          <div className="card animate-fadeInUp">
            <h2 style={{ marginBottom: 24, fontSize: '1.1rem' }}>🏃 Lifestyle Factors</h2>
            <div className="form-group mb-4">
              <label className="form-checkbox">
                <input id="checkbox-smoking" type="checkbox" checked={form.smoking} onChange={e => set('smoking', e.target.checked)} />
                <span>Current or former smoker</span>
              </label>
            </div>
            <div className="grid-2 mb-6">
              <div className="form-group">
                <label className="form-label">Exercise (hours/week)</label>
                <input id="input-exercise" type="range" min="0" max="20" step="0.5" value={form.exercise}
                  onChange={e => set('exercise', e.target.value)} style={{ accentColor: 'var(--accent-blue)' }} />
                <span className="text-sm text-muted">{form.exercise} hrs/week</span>
              </div>
              <div className="form-group">
                <label className="form-label">Sleep (hours/night)</label>
                <input id="input-sleep" type="range" min="3" max="12" step="0.5" value={form.sleep}
                  onChange={e => set('sleep', e.target.value)} style={{ accentColor: 'var(--accent-blue)' }} />
                <span className="text-sm text-muted">{form.sleep} hrs/night</span>
              </div>
              <div className="form-group">
                <label className="form-label">Alcohol (units/week)</label>
                <input id="input-alcohol" type="range" min="0" max="50" step="1" value={form.alcohol}
                  onChange={e => set('alcohol', e.target.value)} style={{ accentColor: 'var(--accent-blue)' }} />
                <span className="text-sm text-muted">{form.alcohol} units</span>
              </div>
              <div className="form-group">
                <label className="form-label">Diet Quality (0=poor, 10=excellent)</label>
                <input id="input-diet" type="range" min="0" max="10" step="0.5" value={form.diet}
                  onChange={e => set('diet', e.target.value)} style={{ accentColor: 'var(--accent-blue)' }} />
                <span className="text-sm text-muted">{form.diet}/10</span>
              </div>
            </div>
            <div className="flex justify-between">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button id="btn-next-step3" className="btn btn-primary" onClick={() => setStep(3)}>Review →</button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="card animate-fadeInUp">
            <h2 style={{ marginBottom: 20, fontSize: '1.1rem' }}>📋 Review & Submit</h2>
            <div className="grid-2 mb-6">
              <div className="card-glass">
                <p className="text-sm font-semibold mb-2">Vitals</p>
                <p className="text-sm text-muted">Age: {form.age || '—'} | Gender: {form.gender} | BMI: {form.bmi || '—'}</p>
                <p className="text-sm text-muted">BP: {form.blood_pressure} | Glucose: {form.glucose || '—'} | Cholesterol: {form.cholesterol || '—'}</p>
              </div>
              <div className="card-glass">
                <p className="text-sm font-semibold mb-2">Lifestyle</p>
                <p className="text-sm text-muted">Smoking: {form.smoking ? 'Yes' : 'No'} | Exercise: {form.exercise} h/wk</p>
                <p className="text-sm text-muted">Sleep: {form.sleep} h/night | Diet: {form.diet}/10</p>
              </div>
            </div>
            <div className="card-glass mb-6">
              <p className="text-sm font-semibold mb-2">Symptoms ({form.symptoms.length})</p>
              {form.symptoms.length === 0
                ? <p className="text-sm text-muted">No symptoms selected</p>
                : <p className="text-sm text-muted">{form.symptoms.join(', ')}</p>
              }
            </div>
            <div className="disclaimer mb-6">
              ⚠️ This prediction is for informational use only and is NOT a medical diagnosis. Always consult a healthcare professional.
            </div>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#fca5a5', fontSize: '0.85rem' }}>
                ❌ {error}
              </div>
            )}
            <div className="flex justify-between">
              <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
              <button id="btn-submit-prediction" className="btn btn-primary btn-lg" onClick={submit} disabled={loading}>
                {loading ? <><span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Analysing...</> : '🔬 Analyse Now'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
