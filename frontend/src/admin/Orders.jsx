import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Download, Eye, MapPin, Phone, ShoppingBag, Trash2 } from 'lucide-react'
import { api, errorMessage, formatDate, formatPrice, ORDER_STATUS, PAYMENT_LABELS } from '../lib/api'
import { StatusBadge } from '../pages/Account'
import { confirmDelete, Empty, Loading, Modal, PageTitle, SearchBox } from './kit'

export default function Orders() {
  const [orders, setOrders] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [q, setQ] = useState('')
  const [current, setCurrent] = useState(null)

  const load = () => api.get('/admin/orders').then((r) => setOrders(r.data))
  useEffect(() => { load() }, [])

  const list = useMemo(() => {
    if (!orders) return []
    const s = q.trim().toLowerCase()
    return orders
      .filter((o) => filter === 'ALL' || o.status === filter)
      .filter((o) => !s || [o.reference, o.customerName, o.phone, o.email].some((v) => v?.toLowerCase().includes(s)))
  }, [orders, filter, q])

  const setStatus = async (order, status) => {
    try {
      const { data } = await api.patch(`/admin/orders/${order.id}/status`, { status })
      setOrders((all) => all.map((o) => (o.id === data.id ? data : o)))
      if (current?.id === data.id) setCurrent(data)
      toast.success('Statut mis à jour')
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  const remove = async (order) => {
    if (!confirmDelete(`la commande ${order.reference}`)) return
    await api.delete(`/admin/orders/${order.id}`)
    setCurrent(null)
    load()
    toast.success('Commande supprimée')
  }

  const exportCsv = () => {
    const rows = [['Référence', 'Date', 'Client', 'Téléphone', 'Email', 'Adresse', 'Mode', 'Paiement', 'Statut', 'Total']]
    list.forEach((o) => rows.push([o.reference, formatDate(o.createdAt), o.customerName, o.phone, o.email || '', o.address || '', o.deliveryMode, PAYMENT_LABELS[o.paymentMethod] || o.paymentMethod, ORDER_STATUS[o.status].label, o.total]))
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n')
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
    Object.assign(document.createElement('a'), { href: url, download: 'commandes-daba.csv' }).click()
    URL.revokeObjectURL(url)
  }

  if (!orders) return <Loading />

  const counts = orders.reduce((acc, o) => ({ ...acc, [o.status]: (acc[o.status] || 0) + 1 }), {})

  return (
    <>
      <PageTitle title="Commandes" text={`${orders.length} commande(s) enregistrée(s)`}>
        <SearchBox value={q} onChange={setQ} placeholder="Réf., client, téléphone…" />
        <button onClick={exportCsv} className="a-btn-light"><Download size={16} /> Export CSV</button>
      </PageTitle>

      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {[['ALL', 'Toutes', orders.length], ...Object.entries(ORDER_STATUS).map(([k, v]) => [k, v.label, counts[k] || 0])].map(([k, label, n]) => (
          <button key={k} onClick={() => setFilter(k)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${filter === k ? 'bg-ink text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            {label} <span className="ml-1 opacity-60">{n}</span>
          </button>
        ))}
      </div>

      <div className="a-card overflow-hidden !p-0">
        {list.length ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80">
                <tr><th className="a-th">Référence</th><th className="a-th">Client</th><th className="a-th">Date</th><th className="a-th">Réception</th><th className="a-th">Total</th><th className="a-th">Statut</th><th className="a-th" /></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/60">
                    <td className="a-td font-mono text-xs font-semibold">{o.reference}</td>
                    <td className="a-td"><p className="font-semibold">{o.customerName}</p><p className="text-xs text-gray-400">{o.phone}</p></td>
                    <td className="a-td whitespace-nowrap text-gray-500">{formatDate(o.createdAt)}</td>
                    <td className="a-td">{o.deliveryMode === 'pickup' ? 'Retrait' : 'Livraison'}</td>
                    <td className="a-td font-bold whitespace-nowrap">{formatPrice(o.total)}</td>
                    <td className="a-td">
                      <select value={o.status} onChange={(e) => setStatus(o, e.target.value)} className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold outline-none focus:border-brand-500">
                        {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </td>
                    <td className="a-td text-right">
                      <button onClick={() => setCurrent(o)} className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-brand-50 hover:text-brand-600" aria-label="Détails"><Eye size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon={ShoppingBag} text="Aucune commande ne correspond." />
        )}
      </div>

      <Modal open={!!current} onClose={() => setCurrent(null)} title={current ? `Commande ${current.reference}` : ''} wide>
        {current && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusBadge status={current.status} />
              <span className="text-sm text-gray-500">{formatDate(current.createdAt)}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-4 text-sm">
                <p className="font-bold">{current.customerName}</p>
                <p className="mt-1 flex items-center gap-2 text-gray-600"><Phone size={14} /> {current.phone}</p>
                {current.email && <p className="mt-1 text-gray-600">{current.email}</p>}
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-sm">
                <p className="font-bold">{current.deliveryMode === 'pickup' ? 'Retrait en agence' : 'Livraison à domicile'}</p>
                {current.address && <p className="mt-1 flex items-start gap-2 text-gray-600"><MapPin size={14} className="mt-0.5" /> {current.address}</p>}
                <p className="mt-1 text-gray-600">{PAYMENT_LABELS[current.paymentMethod]}</p>
              </div>
            </div>
            {current.note && <p className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">📝 {current.note}</p>}
            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100">
              {current.items.map((it) => (
                <li key={it.id} className="flex items-center gap-3 p-3 text-sm">
                  {it.imageUrl && <img src={it.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                  <span className="flex-1"><b>{it.productName}</b><span className="block text-xs text-gray-400">{it.quantity} × {formatPrice(it.unitPrice)}</span></span>
                  <span className="font-semibold">{formatPrice(it.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="ml-auto max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Sous-total</dt><dd>{formatPrice(current.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Livraison</dt><dd>{formatPrice(current.deliveryFee)}</dd></div>
              <div className="flex justify-between border-t pt-2 text-base font-extrabold"><dt>Total</dt><dd className="text-brand-600">{formatPrice(current.total)}</dd></div>
            </dl>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
              <button onClick={() => remove(current)} className="a-btn-danger"><Trash2 size={16} /> Supprimer</button>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ORDER_STATUS).filter(([k]) => k !== current.status).map(([k, v]) => (
                  <button key={k} onClick={() => setStatus(current, k)} className="a-btn-light !px-3 !py-2 text-xs">→ {v.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
