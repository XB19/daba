import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import Logo from '../components/Logo'
import { Spinner } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../lib/api'

export default function Login() {
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [mode, setMode] = useState('login')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const next = params.get('next')

  if (user) return <Navigate to={next || (user.role === 'ADMIN' ? '/admin' : '/account')} replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const u = mode === 'login' ? await login(form.email, form.password) : await register(form)
      toast.success(`Bienvenue ${u.fullName.split(' ')[0]} !`)
      navigate(next || (u.role === 'ADMIN' ? '/admin' : '/account'), { replace: true })
    } catch (err) {
      toast.error(errorMessage(err, 'Échec de la connexion'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-brand-950 lg:block">
        <img src="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1400&q=70" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/60 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo light />
          <div>
            <h2 className="font-display text-5xl font-extrabold leading-tight">Le goût du terroir,<br />livré chez vous.</h2>
            <p className="mt-4 max-w-md text-white/70">Suivez vos commandes, retrouvez votre historique et commandez plus vite.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 pt-28 pb-12 lg:pt-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <h1 className="text-3xl font-extrabold">Espace client</h1>
          <p className="mt-2 text-gray-500">{mode === 'login' ? 'Connectez-vous pour suivre vos commandes.' : 'Créez votre compte en quelques secondes.'}</p>

          <div className="relative mt-8 grid grid-cols-2 rounded-full bg-gray-100 p-1">
            {['login', 'register'].map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)} className={`relative z-10 rounded-full py-2.5 text-sm font-semibold transition ${mode === m ? 'text-ink' : 'text-gray-500'}`}>
                {mode === m && <motion.span layoutId="auth-tab" className="absolute inset-0 -z-10 rounded-full bg-white shadow" />}
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-8 space-y-5">
            {mode === 'register' && (
              <>
                <div><label className="label">Nom complet</label><input required value={form.fullName} onChange={set('fullName')} className="input" placeholder="Votre nom" /></div>
                <div><label className="label">Téléphone</label><input value={form.phone} onChange={set('phone')} className="input" placeholder="+228 XX XX XX XX" /></div>
              </>
            )}
            <div><label className="label">Email</label><input required type="email" value={form.email} onChange={set('email')} className="input" placeholder="votre@email.com" /></div>
            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <input required minLength={6} type={show ? 'text' : 'password'} value={form.password} onChange={set('password')} className="input pr-12" placeholder="••••••••" />
                <button type="button" onClick={() => setShow(!show)} className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400" aria-label="Afficher">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button disabled={busy} className="btn-primary w-full !py-4">
              {busy && <Spinner className="h-5 w-5" />} {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-gray-500"><Link to="/" className="font-semibold text-brand-600">← Retour au site</Link></p>
        </motion.div>
      </div>
    </section>
  )
}
