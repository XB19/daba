import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { LogOut, Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api, formatDate, formatPrice, ORDER_STATUS } from '../lib/api'
import { Spinner } from '../components/ui'

export function StatusBadge({ status }) {
  const s = ORDER_STATUS[status] || ORDER_STATUS.EN_ATTENTE
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${s.cls}`}>{s.label}</span>
}

export default function Account() {
  const { user, ready, logout } = useAuth()
  const [orders, setOrders] = useState(null)

  useEffect(() => {
    if (user) api.get('/me/orders').then((r) => setOrders(r.data)).catch(() => setOrders([]))
  }, [user])

  if (ready && !user) return <Navigate to="/login" replace />

  return (
    <section className="bg-gray-50/70 pt-32 pb-20 lg:pt-36">
      <div className="container-x">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-500 text-xl font-bold text-white">{user?.fullName?.[0]}</span>
            <div>
              <h1 className="text-2xl font-extrabold">Bonjour {user?.fullName}</h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {user?.role === 'ADMIN' && <Link to="/admin" className="btn-primary">Administration</Link>}
            <button onClick={logout} className="btn-outline"><LogOut size={16} /> Déconnexion</button>
          </div>
        </div>

        <h2 className="mb-4 text-xl font-bold">Mes commandes</h2>
        {!orders ? (
          <div className="grid place-items-center py-20"><Spinner className="h-8 w-8 text-brand-500" /></div>
        ) : !orders.length ? (
          <div className="rounded-3xl bg-white py-16 text-center shadow-sm">
            <Package size={44} className="mx-auto text-gray-300" />
            <p className="mt-4 font-semibold">Aucune commande pour le moment</p>
            <Link to="/products" className="btn-primary mt-6">Découvrir nos produits</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <details key={o.id} className="group rounded-3xl bg-white p-5 shadow-sm open:shadow-md">
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-mono font-bold">{o.reference}</p>
                    <p className="text-sm text-gray-500">{formatDate(o.createdAt)} · {o.items.length} article(s)</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={o.status} />
                    <span className="font-extrabold text-brand-600">{formatPrice(o.total)}</span>
                  </div>
                </summary>
                <ul className="mt-4 divide-y divide-gray-100 border-t border-gray-100 pt-2">
                  {o.items.map((it) => (
                    <li key={it.id} className="flex justify-between py-2 text-sm">
                      <span>{it.quantity} × {it.productName}</span>
                      <span className="font-semibold">{formatPrice(it.lineTotal)}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
