import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Copy, Download, Mail, Trash2 } from 'lucide-react'
import { api, formatDate } from '../lib/api'
import { confirmDelete, Empty, Loading, PageTitle } from './kit'

export default function Subscribers() {
  const [list, setList] = useState(null)
  const load = () => api.get('/admin/subscribers').then((r) => setList(r.data))
  useEffect(() => { load() }, [])

  const copyAll = async () => {
    await navigator.clipboard.writeText(list.map((s) => s.email).join(', '))
    toast.success('Adresses copiées')
  }

  const exportCsv = () => {
    const csv = ['email;date', ...list.map((s) => `${s.email};${formatDate(s.createdAt)}`)].join('\n')
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
    Object.assign(document.createElement('a'), { href: url, download: 'newsletter-daba.csv' }).click()
    URL.revokeObjectURL(url)
  }

  const remove = async (s) => {
    if (!confirmDelete(s.email)) return
    await api.delete(`/admin/subscribers/${s.id}`)
    load()
  }

  if (!list) return <Loading />

  return (
    <>
      <PageTitle title="Newsletter" text={`${list.length} abonné(s)`}>
        <button disabled={!list.length} onClick={copyAll} className="a-btn-light"><Copy size={16} /> Copier les emails</button>
        <button disabled={!list.length} onClick={exportCsv} className="a-btn-light"><Download size={16} /> Export CSV</button>
      </PageTitle>
      <div className="a-card overflow-hidden !p-0">
        {list.length ? (
          <table className="w-full">
            <thead className="bg-gray-50/80"><tr><th className="a-th">Email</th><th className="a-th">Inscrit le</th><th className="a-th" /></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/60">
                  <td className="a-td font-medium">{s.email}</td>
                  <td className="a-td text-gray-500">{formatDate(s.createdAt)}</td>
                  <td className="a-td text-right">
                    <button onClick={() => remove(s)} className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label="Supprimer"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty icon={Mail} text="Aucun abonné pour le moment." />
        )}
      </div>
    </>
  )
}
