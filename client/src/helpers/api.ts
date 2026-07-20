const primaryApiUrl = import.meta.env.VITE_PRIMARY_API_URL ?? 'http://localhost:8008'
const secondaryApiUrl = import.meta.env.VITE_SECONDARY_API_URL ?? 'http://localhost:8008'

const buildApiUrl = (baseUrl: string, path: string) => `${baseUrl.replace(/\/+$/, '')}${path}`

export const apiFetch = async (path: string, init?: RequestInit): Promise<Response> => {
  try {
    return await fetch(buildApiUrl(primaryApiUrl, path), init)
  } catch {
    return fetch(buildApiUrl(secondaryApiUrl, path), init)
  }
}
