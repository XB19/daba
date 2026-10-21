import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Mail, Menu, Phone, ShoppingBag, User, X } from 'lucide-react'
import Logo from './Logo'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useSite } from '../context/SiteContext'

export const NAV = [
  { to: '/', label: 'Accueil' },
  { to: '/about', label: 'À propos' },
  { to: '/products', label: 'Produits' },
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const { count } = useCart()
  const { user, isAdmin } = useAuth()
  const { t } = useSite()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const solid = scrolled || open

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Barre d'infos */}
      <div
        className={`hidden overflow-hidden bg-brand-950 text-xs text-white/80 transition-all duration-500 md:block ${
          scrolled ? 'max-h-0' : 'max-h-10'
        }`}
      >
        <div className="container-x flex h-10 items-center justify-between">
          <div className="flex items-center gap-6">
            <a href={`tel:${t('contact.phone').replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-white">
              <Phone size={13} className="text-brand-400" /> {t('contact.phone')}
            </a>
            <a href={`mailto:${t('contact.email')}`} className="flex items-center gap-2 hover:text-white">
              <Mail size={13} className="text-brand-400" /> {t('contact.email')}
            </a>
          </div>
          <span className="flex items-center gap-2">
            <Clock size={13} className="text-brand-400" /> {t('contact.hours')}
          </span>
        </div>
      </div>

      <nav
        className={`transition-all duration-500 ${
          solid ? 'bg-white/90 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <div className="container-x flex h-20 items-center justify-between gap-6">
          <Logo light={!solid} />

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? solid
                          ? 'text-brand-600'
                          : 'text-white'
                        : solid
                          ? 'text-gray-600 hover:text-brand-600'
                          : 'text-white/75 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className={`absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full ${solid ? 'bg-brand-500' : 'bg-white'}`}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Link
              to={user ? (isAdmin ? '/admin' : '/account') : '/login'}
              className={`hidden h-11 w-11 place-items-center rounded-full transition sm:grid ${
                solid ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
              aria-label="Espace client"
            >
              <User size={20} />
            </Link>
            <Link
              to="/cart"
              className={`relative grid h-11 w-11 place-items-center rounded-full transition ${
                solid ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
              aria-label="Panier"
            >
              <ShoppingBag size={20} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-1 right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            <Link to="/products" className="btn-accent ml-2 hidden !px-5 !py-2.5 md:inline-flex">
              Commander
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              className={`grid h-11 w-11 place-items-center rounded-full lg:hidden ${solid ? 'text-ink' : 'text-white'}`}
              aria-label="Menu"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-gray-100 bg-white lg:hidden"
            >
              <ul className="container-x space-y-1 py-4">
                {[...NAV, { to: user ? '/account' : '/login', label: 'Espace client' }].map((item, i) => (
                  <motion.li key={item.to} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.04 }}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `block rounded-xl px-4 py-3 font-semibold ${isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </motion.li>
                ))}
                <li className="pt-2">
                  <Link to="/products" className="btn-accent w-full">Commander maintenant</Link>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
