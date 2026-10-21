import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Lock } from 'lucide-react'
import Logo from '../components/Logo'
import { Spinner } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../lib/api'

export default function AdminLogin() {
  const { isAdmin, login, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [busy, setBusy] = useState(false)

  if (isAdmin) return <Navigate to="/admin" replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const u = await login(form.email, form.password)
      if (u.role !== 'ADMIN') {
        logout()
        toast.error('Accès réservé aux administrateurs')
        return
      }
      navigate('/admin', { replace: true })
    } catch (err) {
      toast.error(errorMessage(err, 'Identifiants invalides'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-brand-950 px-4">
      <div className="absolute top-0 left-1/3 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl" />
      <div className="absolute right-1/4 bottom-0 h-72 w-72 rounded-full bg-sun-400/10 blur-3xl" />
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl sm:p-10"
      >
        <Logo />
        <h1 className="mt-8 text-2xl font-extrabold">Administration</h1>
        <p className="mt-1 text-sm text-gray-500">Connectez-vous pour gérer le site DABA.</p>
        <div className="mt-8 space-y-5">
          <div><label className="label">Email</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="admin@daba.tg" /></div>
          <div><label className="label">Mot de passe</label><input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" placeholder="••••••••" /></div>
        </div>
        <button disabled={busy} className="btn-primary mt-8 w-full !py-4">
          {busy ? <Spinner className="h-5 w-5" /> : <Lock size={16} />} Se connecter
        </button>
      </motion.form>
    </div>
  )
}
