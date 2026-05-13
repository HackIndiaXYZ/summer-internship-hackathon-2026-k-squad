import { create } from 'zustand'
import api from '../lib/api'

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('tracky_token'),
  isAuthenticated: !!localStorage.getItem('tracky_token'),
  loading: false,
  error: null,

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('tracky_token', data.token)
      localStorage.setItem('tracky_refresh', data.refreshToken)
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false })
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed'
      set({ error: msg, loading: false })
      return { success: false, error: msg }
    }
  },

  // ─── SIGNUP ───────────────────────────────────────────────────────────────
  signup: async (name, email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/signup', { name, email, password })
      localStorage.setItem('tracky_token', data.token)
      localStorage.setItem('tracky_refresh', data.refreshToken)
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false })
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.error || 'Signup failed'
      set({ error: msg, loading: false })
      return { success: false, error: msg }
    }
  },

  // ─── GOOGLE OAUTH ─────────────────────────────────────────────────────────
  googleLogin: async (idToken) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/google', { idToken })
      localStorage.setItem('tracky_token', data.token)
      localStorage.setItem('tracky_refresh', data.refreshToken)
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false })
      return { success: true }
    } catch (err) {
      set({ error: 'Google login failed', loading: false })
      return { success: false }
    }
  },

  // ─── FETCH CURRENT USER ───────────────────────────────────────────────────
  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.user, isAuthenticated: true })
    } catch {
      get().logout()
    }
  },

  // ─── UPDATE PROFILE ───────────────────────────────────────────────────────
  updateProfile: async (updates) => {
    try {
      const { data } = await api.patch('/auth/profile', updates)
      set({ user: data.user })
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.error }
    }
  },

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
  logout: () => {
    localStorage.removeItem('tracky_token')
    localStorage.removeItem('tracky_refresh')
    set({ user: null, token: null, isAuthenticated: false, error: null })
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore
