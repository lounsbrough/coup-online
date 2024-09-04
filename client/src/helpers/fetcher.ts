export const fetcher = (endpoint: string, init?: RequestInit) => fetch(new URL(endpoint, process.env.REACT_APP_API_BASE_URL), init).then(res => res.json())
