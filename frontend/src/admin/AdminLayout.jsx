import { useEffect, useState } from 'react'
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ExternalLink, Inbox, LayoutDashboard, LogOut, Mail, Menu, MessageSquare, Package, Settings, ShoppingBag, Star, Tags, Users, Wrench, X,
} from 'lucide-react'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui'
import { api } from '../lib/api'

const MENU = [
  { group: 'Pilotage', items: [{ to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true }] },
  {
    group: 'Ventes',
    items: [
      { to: '/admin/orders', label: 'Commandes', icon: ShoppingBag, badge: 'pendingOrders' },
      { to: '/admin/users', label: 'Utilisateurs', icon: Users },
    ],
  },
  {
    group: 'Catalogue',
    items: [
      { to: '/admin/products', label: 'Produits', icon: Package },
      { to: '/admin/categories', label: 'Catégories', icon: Tags },
      { to: '/admin/services', label: 'Services', icon: Wrench },
    ],
  },
  {
    group: 'Communication',
    items: [
      { to: '/admin/messages', label: 'Messages', icon: Inbox, badge: 'unreadMessages' },
      { to: '/admin/testimonials', label: 'Témoignages', icon: Star },
      { to: '/admin/subscribers', label: 'Newsletter', icon: Mail },
    ],
  },
  { group: 'Site', items: [{ to: '/admin/settings', label: 'Contenu du site', icon: Settings }] },
]

function Sidebar({ badges, onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-brand-950 text-white/70">
      <div className="flex h-20 items-center px-6">
        <Logo light />
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {MENU.map((section) => (
          <div key={section.group}>
            <p className="mb-2 px-3 text-[11px] font-bold tracking-[0.18em] text-white/30 uppercase">{section.group}</p>
            <ul className="space-y-1">
              {section.items.map(({ to, label, icon: Icon, end, badge }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        isActive ? 'text-white' : 'hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-xl bg-brand-500 shadow-lg shadow-brand-500/30" />}
                        <Icon size={18} className="relative" />
                        <span className="relative flex-1">{label}</span>
                        {badge && badges[badge] > 0 && (
                          <span className="relative rounded-full bg-accent-500 px-2 py-0.5 text-[10px] font-bold text-white">{badges[badge]}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <Link to="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/5 hover:text-white">
          <ExternalLink size={18} /> Voir le site
        </Link>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const { user, ready, isAdmin, logout } = useAuth()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [badges, setBadges] = useState({})

  useEffect(() => {
    if (isAdmin) api.get('/admin/stats').then((r) => setBadges(r.data)).catch(() => {})
  }, [isAdmin, pathname])

  if (!ready) return <div className="grid min-h-screen place-items-center"><Spinner className="h-8 w-8 text-brand-500" /></div>
  if (!isAdmin) return <Navigate to="/admin/login" replace />

  return (
    <div className="min-h-screen bg-[#f6f8f6]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">
        <Sidebar badges={badges} />
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-ink/50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden" initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
              <Sidebar badges={badges} onNavigate={() => setOpen(false)} />
              <button onClick={() => setOpen(false)} className="absolute top-6 -right-12 grid h-9 w-9 place-items-center rounded-full bg-white" aria-label="Fermer"><X size={18} /></button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-gray-100 bg-white/80 px-4 backdrop-blur-xl sm:px-8">
          <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-lg hover:bg-gray-100 lg:hidden" aria-label="Menu"><Menu size={20} /></button>
          <p className="hidden text-sm text-gray-500 sm:block">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <div className="flex items-center gap-3">
            <Link to="/admin/messages" className="relative grid h-10 w-10 place-items-center rounded-full text-gray-500 hover:bg-gray-100" aria-label="Messages">
              <MessageSquare size={19} />
              {badges.unreadMessages > 0 && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent-500" />}
            </Link>
            <div className="flex items-center gap-3 rounded-full border border-gray-100 bg-white py-1 pr-4 pl-1">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-500 text-sm font-bold text-white">{user.fullName[0]}</span>
              <div className="hidden leading-tight sm:block">
                <p className="text-sm font-semibold">{user.fullName}</p>
                <p className="text-[11px] text-gray-400">Administrateur</p>
              </div>
            </div>
            <button onClick={logout} className="grid h-10 w-10 place-items-center rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600" aria-label="Déconnexion" title="Déconnexion">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="p-4 sm:p-8">
          <motion.div key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
