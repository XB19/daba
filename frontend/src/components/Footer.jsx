import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowRight, Mail, MapPin, Phone, Send } from 'lucide-react'
import Logo from './Logo'
import { NAV } from './Navbar'
import { SocialIcons } from './ui'
import { useSite } from '../context/SiteContext'
import { api, errorMessage } from '../lib/api'

export function SocialLinks({ className = '', dark = true }) {
  const { t } = useSite()
  return (
    <div className={`flex gap-3 ${className}`}>
      {['facebook', 'instagram', 'linkedin', 'whatsapp'].map((k) => {
        const href = t(`social.${k}`)
        if (!href) return null
        const Icon = SocialIcons[k]
        return (
          <a
            key={k}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={k}
            className={`grid h-10 w-10 place-items-center rounded-full transition hover:-translate-y-1 hover:bg-brand-500 hover:text-white ${
              dark ? 'bg-white/10 text-white' : 'bg-brand-50 text-brand-700'
            }`}
          >
            <Icon />
          </a>
        )
      })}
    </div>
  )
}

export default function Footer() {
  const { t, categories } = useSite()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)

  const subscribe = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      const { data } = await api.post('/public/newsletter', { email })
      toast.success(data.message)
      setEmail('')
    } catch (err) {
      toast.error(errorMessage(err, 'Adresse email invalide'))
    } finally {
      setSending(false)
    }
  }

  return (
    <footer className="relative overflow-hidden bg-brand-950 text-white/70">
      <div className="absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="container-x relative grid gap-12 py-20 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo light />
          <p className="mt-6 max-w-sm leading-relaxed">{t('footer.text')}</p>
          <SocialLinks className="mt-6" />
        </div>

        <div className="lg:col-span-2">
          <h4 className="mb-5 font-bold text-white">Navigation</h4>
          <ul className="space-y-3 text-sm">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="group inline-flex items-center gap-2 transition hover:text-brand-300">
                  <ArrowRight size={14} className="-ml-5 opacity-0 transition-all group-hover:ml-0 group-hover:opacity-100" />
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h4 className="mb-5 font-bold text-white">Nos gammes</h4>
          <ul className="space-y-3 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/products?category=${c.id}`} className="transition hover:text-brand-300">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4">
          <h4 className="mb-5 font-bold text-white">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3"><MapPin size={18} className="mt-0.5 shrink-0 text-brand-400" />{t('contact.address')}</li>
            <li className="flex items-center gap-3"><Phone size={18} className="text-brand-400" />{t('contact.phone')}</li>
            <li className="flex items-center gap-3"><Mail size={18} className="text-brand-400" />{t('contact.email')}</li>
          </ul>
          <h4 className="mt-8 mb-2 font-bold text-white">Newsletter</h4>
          <p className="mb-3 text-sm">Recevez nos offres et nouveautés en avant-première.</p>
          <form onSubmit={subscribe} className="flex rounded-full bg-white/10 p-1.5 ring-1 ring-white/10 focus-within:ring-brand-400">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email"
              className="min-w-0 flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/40"
            />
            <button disabled={sending} className="grid h-10 w-10 place-items-center rounded-full bg-brand-500 text-white transition hover:bg-brand-400" aria-label="S'abonner">
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} DABA SAS. Tous droits réservés.</p>
          <p>Fièrement produit au Togo 🇹🇬</p>
        </div>
      </div>
    </footer>
  )
}
