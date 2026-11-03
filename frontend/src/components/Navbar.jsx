import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BriefcaseBusiness, ChevronDown, Clock, FileUser, Mail, Menu, Phone, ShoppingBag, User, X } from 'lucide-react'
import Logo from './Logo'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useSite } from '../context/SiteContext'

export const NAV = [
  { to: '/', label: 'Accueil' },
  { to: '/about', label: 'À propos' },
  { to: '/products', label: 'Produits' },
  { to: '/services', label: 'Services' },
  { to: '/bons-plans', label: 'Bons plans' },
  {
    to: '/careers',
    label: 'Carrière',
    children: [
      { to: '/careers/jobs', label: 'Offres d’emploi', text: 'Découvrez nos postes ouverts', icon: BriefcaseBusiness },
      { to: '/careers/spontaneous', label: 'Candidature spontanée', text: 'Proposez-nous votre profil', icon: FileUser },
    ],
  },
  { to: '/contact', label: 'Contact' },
]

/** Liste à plat des liens (pied de page, plan du site). */
export const NAV_LINKS = NAV.flatMap((item) => item.children || [item])

const linkTone = (active, solid) =>
  active
    ? solid ? 'text-brand-600' : 'text-white'
    : solid ? 'text-gray-600 hover:text-brand-600' : 'text-white/75 hover:text-white'

function Underline({ solid }) {
  return (
    <motion.span
      layoutId="nav-pill"
      className={`absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full ${solid ? 'bg-brand-500' : 'bg-white'}`}
    />
  )
}

function DesktopDropdown({ item, solid }) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const timer = useRef(null)
  const active = pathname.startsWith(item.to)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const show = () => {
    clearTimeout(timer.current)
    setOpen(true)
  }
  const hide = () => {
    timer.current = setTimeout(() => setOpen(false), 120)
  }

  return (
    <li className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`relative flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors xl:px-4 ${linkTone(active, solid)}`}
      >
        {item.label}
        <ChevronDown size={15} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        {active && <Underline solid={solid} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-1/2 w-80 -translate-x-1/2 pt-3"
          >
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_25px_50px_-15px_rgba(15,26,18,0.3)]">
              {item.children.map(({ to, label, text, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `group flex items-center gap-4 rounded-xl p-3 transition ${isActive ? 'bg-brand-50' : 'hover:bg-gray-50'}`
                  }
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white">
                    <Icon size={20} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-ink">{label}</span>
                    <span className="block text-xs text-gray-500">{text}</span>
                  </span>
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

function MobileGroup({ item, delay }) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(pathname.startsWith(item.to))
  return (
    <motion.li initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 font-semibold ${
          pathname.startsWith(item.to) ? 'text-brand-700' : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        {item.label}
        <ChevronDown size={18} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            {item.children.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `ml-4 flex items-center gap-3 rounded-xl border-l-2 px-4 py-2.5 text-sm font-semibold ${
                      isActive ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-100 text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  <Icon size={16} className="text-brand-500" /> {label}
                </NavLink>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.li>
  )
}

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
        <div className="container-x flex h-20 items-center justify-between gap-4">
          <Logo light={!solid} />

          <ul className="hidden items-center lg:flex xl:gap-1">
            {NAV.map((item) =>
              item.children ? (
                <DesktopDropdown key={item.to} item={item} solid={solid} />
              ) : (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `relative rounded-full px-3 py-2 text-sm font-semibold transition-colors xl:px-4 ${linkTone(isActive, solid)}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {item.label}
                        {isActive && <Underline solid={solid} />}
                      </>
                    )}
                  </NavLink>
                </li>
              ),
            )}
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
            <Link to="/products" className="btn-accent ml-2 hidden !px-5 !py-2.5 md:inline-flex lg:hidden xl:inline-flex">
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
              className="max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-gray-100 bg-white lg:hidden"
            >
              <ul className="container-x space-y-1 py-4">
                {[...NAV, { to: user ? '/account' : '/login', label: 'Espace client' }].map((item, i) =>
                  item.children ? (
                    <MobileGroup key={item.to} item={item} delay={i * 0.04} />
                  ) : (
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
                  ),
                )}
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
