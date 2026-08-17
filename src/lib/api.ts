import type { ApiError } from '../types/api'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './tokens'

const BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

export class ApiErrorResponse extends Error {
  readonly status: number
  readonly details?: Record<string, string[]>

  constructor(status: number, error: string, details?: Record<string, string[]>) {
    super(error)
    this.name = 'ApiErrorResponse'
    this.status = status
    this.details = details
  }
}

let refreshPromise: Promise<string | null> | null = null

function refreshTokens(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    clearTokens()
    return Promise.resolve(null)
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('refresh failed')
        const data = (await res.json()) as { accessToken: string; refreshToken: string }
        setTokens(data.accessToken, data.refreshToken)
        return data.accessToken
      })
      .catch(() => {
        clearTokens()
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 401 && !path.startsWith('/auth/')) {
    const newToken = await refreshTokens()
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`)
      res = await fetch(`${BASE}${path}`, { ...options, headers })
    }
  }

  if (!res.ok) {
    let body: ApiError | null = null
    try {
      body = (await res.json()) as ApiError
    } catch {
      // respuesta sin cuerpo JSON
    }
    throw new ApiErrorResponse(res.status, body?.error ?? `Request failed (${res.status})`, body?.details)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return (await res.json()) as T
}