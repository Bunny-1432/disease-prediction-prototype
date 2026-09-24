/**
 * services/api.js
 * Axios HTTP client for the FastAPI backend.
 * All API calls go through this single module — easy to mock in tests.
 */
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Prediction ─────────────────────────────────────────────────────────────
/** POST /api/v1/predict — multi-modal disease risk prediction */
export const predictDisease = (payload) =>
  client.post('/api/v1/predict', payload).then((r) => r.data)

// ── User history ───────────────────────────────────────────────────────────
/** GET /api/v1/user/{userId}/history */
export const getUserHistory = (userId, limit = 10) =>
  client.get(`/api/v1/user/${userId}/history`, { params: { limit } }).then((r) => r.data)

/** GET /api/v1/user/{userId}/risk-analysis */
export const getRiskAnalysis = (userId, limit = 10) =>
  client.get(`/api/v1/user/${userId}/risk-analysis`, { params: { limit } }).then((r) => r.data)

// ── Disease knowledge base ─────────────────────────────────────────────────
/** GET /api/v1/diseases — list all diseases */
export const listDiseases = () =>
  client.get('/api/v1/diseases').then((r) => r.data)

/** GET /api/v1/diseases/{name} — get full disease profile */
export const getDiseaseInfo = (name) =>
  client.get(`/api/v1/diseases/${encodeURIComponent(name)}`).then((r) => r.data)

/** GET /api/v1/diseases/sync-status — get 24-hour sync telemetry */
export const getDiseaseSyncStatus = () =>
  client.get('/api/v1/diseases/sync-status').then((r) => r.data)

/** POST /api/v1/diseases/refresh — trigger immediate sync with live APIs */
export const refreshDiseaseKnowledge = () =>
  client.post('/api/v1/diseases/refresh').then((r) => r.data)

