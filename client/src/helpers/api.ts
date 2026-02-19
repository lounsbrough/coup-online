export const getBaseUrl = () =>
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8008';
