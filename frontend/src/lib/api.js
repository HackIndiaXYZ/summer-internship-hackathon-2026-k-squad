import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
})

// ─── REQUEST — attach JWT ─────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tracky_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── RESPONSE — handle 401 refresh ───────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('tracky_refresh')
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          { refreshToken: refresh }
        )
        localStorage.setItem('tracky_token', data.token)
        original.headers.Authorization = `Bearer ${data.token}`
        return api(original)
      } catch {
        localStorage.removeItem('tracky_token')
        localStorage.removeItem('tracky_refresh')
        window.location.href = '/'
      }
    }
    return Promise.reject(err)
  }
)

export default api
