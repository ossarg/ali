const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Role del usuario — en PoC se setea manualmente
// TODO: reemplazar con auth real
const USER_ROLE = import.meta.env.VITE_USER_ROLE || 'gerente'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Role': USER_ROLE,
      'X-User-Id': 'poc-user',
      ...options.headers,
    },
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json()
}

// Casos
export const getCasos = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  return request<{ data: any[]; total: number }>(`/api/casos${qs}`)
}

export const getCaso = (id: string | number) =>
  request<any>(`/api/casos/${id}`)

// Triage
export const getTriageRules = () =>
  request<any>('/api/triage/rules')

export const updateTriageRules = (rules: any) =>
  request('/api/triage/rules', { method: 'PUT', body: JSON.stringify({ rules }) })

// Métricas
export const getMetrics = () =>
  request<any>('/api/metrics')

// Agentes
export const getAgents = () =>
  request<any[]>('/api/agents')
