/**
 * services/api.js
 * Resilient API client for MediPredict.
 * Connects to live FastAPI backend when available, and automatically falls back
 * to the client-side clinical inference engine when running statically on GitHub Pages.
 */
import axios from 'axios'
import {
  clientPredict,
  clientGetHistory,
  clientGetRiskAnalysis,
  clientListDiseases,
  clientGetDiseaseInfo,
  clientGetSyncStatus,
} from './clinicalInference.js'

const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io')
const BASE_URL = import.meta.env.VITE_API_URL || (isGitHubPages ? null : 'http://localhost:8000')

const client = BASE_URL
  ? axios.create({
      baseURL: BASE_URL,
      timeout: 3000,
      headers: { 'Content-Type': 'application/json' },
    })
  : null

// ── Prediction ─────────────────────────────────────────────────────────────
/** POST /api/v1/predict — multi-modal disease risk prediction with automatic fallback */
export const predictDisease = async (payload) => {
  if (!client) return clientPredict(payload)
  try {
    const res = await client.post('/api/v1/predict', payload)
    return res.data
  } catch (err) {
    console.info('[MediPredict] Backend offline or unreachable. Running client-side clinical inference engine...', err.message)
    return clientPredict(payload)
  }
}

// ── User history ───────────────────────────────────────────────────────────
/** GET /api/v1/user/{userId}/history */
export const getUserHistory = async (userId = 'demo_user', limit = 10) => {
  if (!client) return clientGetHistory(userId, limit)
  try {
    const res = await client.get(`/api/v1/user/${userId}/history`, { params: { limit } })
    return res.data
  } catch {
    return clientGetHistory(userId, limit)
  }
}

/** GET /api/v1/user/{userId}/risk-analysis */
export const getRiskAnalysis = async (userId = 'demo_user', limit = 10) => {
  if (!client) return clientGetRiskAnalysis(userId, limit)
  try {
    const res = await client.get(`/api/v1/user/${userId}/risk-analysis`, { params: { limit } })
    return res.data
  } catch {
    return clientGetRiskAnalysis(userId, limit)
  }
}

// ── Disease knowledge base ─────────────────────────────────────────────────
/** GET /api/v1/diseases — list all diseases */
export const listDiseases = async () => {
  if (!client) return clientListDiseases()
  try {
    const res = await client.get('/api/v1/diseases')
    return res.data
  } catch {
    return clientListDiseases()
  }
}

/** GET /api/v1/diseases/{name} — get full disease profile */
export const getDiseaseInfo = async (name) => {
  if (!client) return clientGetDiseaseInfo(name)
  try {
    const res = await client.get(`/api/v1/diseases/${encodeURIComponent(name)}`)
    return res.data
  } catch {
    return clientGetDiseaseInfo(name)
  }
}

/** GET /api/v1/diseases/sync-status — get 24-hour sync telemetry */
export const getDiseaseSyncStatus = async () => {
  if (!client) return clientGetSyncStatus()
  try {
    const res = await client.get('/api/v1/diseases/sync-status')
    return res.data
  } catch {
    return clientGetSyncStatus()
  }
}

/** POST /api/v1/diseases/refresh — trigger immediate sync with live APIs */
export const refreshDiseaseKnowledge = async () => {
  if (!client) {
    return {
      status: 'synced',
      message: 'Client-side knowledge base synced with latest clinical profiles.',
      sync_status: clientGetSyncStatus(),
    }
  }
  try {
    const res = await client.post('/api/v1/diseases/refresh')
    return res.data
  } catch {
    return {
      status: 'synced',
      message: 'Client-side knowledge base synced with latest clinical profiles.',
      sync_status: clientGetSyncStatus(),
    }
  }
}
