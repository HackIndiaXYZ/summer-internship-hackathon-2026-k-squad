import { create } from 'zustand'
import api from '../lib/api'
import { MOCK_TRANSACTIONS } from '../lib/constants'

const useTransactionStore = create((set, get) => ({
  transactions: MOCK_TRANSACTIONS, // pre-seeded with mock data
  loading: false,
  error: null,
  filters: { search: '', category: 'All', type: 'All' },
  pagination: { page: 1, limit: 50, total: 0, pages: 0 },

  // ─── FETCH ────────────────────────────────────────────────────────────────
  fetchTransactions: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get('/transactions', { params })
      set({ transactions: data.transactions, pagination: data.pagination, loading: false })
    } catch (err) {
      // fallback to mock data in dev
      set({ loading: false, error: err.response?.data?.error })
    }
  },

  // ─── CREATE ───────────────────────────────────────────────────────────────
  addTransaction: async (tx) => {
    try {
      const { data } = await api.post('/transactions', tx)
      set((s) => ({ transactions: [data.transaction, ...s.transactions] }))
      return { success: true, transaction: data.transaction }
    } catch {
      // optimistic local add
      const local = { ...tx, id: Date.now(), date: tx.date || new Date().toISOString().split('T')[0] }
      set((s) => ({ transactions: [local, ...s.transactions] }))
      return { success: true, transaction: local }
    }
  },

  // ─── LOCAL ADD (from SMS parse) ───────────────────────────────────────────
  addTransactionLocal: (tx) => {
    const t = { ...tx, id: Date.now(), date: tx.date || new Date().toISOString().split('T')[0] }
    set((s) => ({ transactions: [t, ...s.transactions] }))
    return t
  },

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  updateTransaction: async (id, updates) => {
    try {
      const { data } = await api.patch(`/transactions/${id}`, updates)
      set((s) => ({ transactions: s.transactions.map((t) => (t.id === id ? data.transaction : t)) }))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.error }
    }
  },

  // ─── DELETE ───────────────────────────────────────────────────────────────
  deleteTransaction: async (id) => {
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }))
    try {
      await api.delete(`/transactions/${id}`)
    } catch {
      // already removed from UI
    }
  },

  // ─── FILTERS ──────────────────────────────────────────────────────────────
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  resetFilters: () => set({ filters: { search: '', category: 'All', type: 'All' } }),

  // ─── COMPUTED ─────────────────────────────────────────────────────────────
  getFiltered: () => {
    const { transactions, filters } = get()
    return transactions.filter((tx) => {
      const matchSearch = !filters.search ||
        tx.merchant.toLowerCase().includes(filters.search.toLowerCase()) ||
        tx.bank?.toLowerCase().includes(filters.search.toLowerCase())
      const matchCat  = filters.category === 'All' || tx.category === filters.category
      const matchType = filters.type === 'All' || tx.type === filters.type
      return matchSearch && matchCat && matchType
    })
  },

  getSummary: () => {
    const { transactions } = get()
    const thisMonth = transactions.filter((t) => t.date?.startsWith('2025-05'))
    return {
      totalSpend:  thisMonth.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0),
      totalIncome: thisMonth.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0),
      count: thisMonth.length,
    }
  },
}))

export default useTransactionStore
