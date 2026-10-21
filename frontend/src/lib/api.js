import axios from 'axios'

export const TOKEN_KEY = 'daba_token'

export const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const errorMessage = (err, fallback = 'Une erreur est survenue') =>
  err?.response?.data?.message || fallback

export const formatPrice = (value) =>
  `${new Intl.NumberFormat('fr-FR').format(Number(value) || 0)} FCFA`

export const formatDate = (iso, withTime = true) =>
  new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })

export const ORDER_STATUS = {
  EN_ATTENTE: { label: 'En attente', cls: 'bg-amber-50 text-amber-700 ring-amber-200', color: '#f59e0b' },
  CONFIRMEE: { label: 'Confirmée', cls: 'bg-sky-50 text-sky-700 ring-sky-200', color: '#0ea5e9' },
  EN_PREPARATION: { label: 'En préparation', cls: 'bg-violet-50 text-violet-700 ring-violet-200', color: '#8b5cf6' },
  EN_LIVRAISON: { label: 'En livraison', cls: 'bg-indigo-50 text-indigo-700 ring-indigo-200', color: '#6366f1' },
  LIVREE: { label: 'Livrée', cls: 'bg-brand-50 text-brand-700 ring-brand-200', color: '#42b649' },
  ANNULEE: { label: 'Annulée', cls: 'bg-red-50 text-red-700 ring-red-200', color: '#e11d2e' },
}

export const PAYMENT_LABELS = {
  cash: 'Paiement à la livraison',
  tmoney: 'TMoney',
  flooz: 'Flooz',
  card: 'Carte bancaire',
}
