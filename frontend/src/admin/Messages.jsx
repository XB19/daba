import { useEffect, useState } from 'react'
import { Inbox, Mail, MailOpen, Phone, Reply, Trash2 } from 'lucide-react'
import { api, formatDate } from '../lib/api'
import { confirmDelete, Empty, Loading, PageTitle } from './kit'

export default function Messages() {
  const [list, setList] = useState(null)
  const [current, setCurrent] = useState(null)

  const load = () => api.get('/admin/messages').then((r) => setList(r.data))
  useEffect(() => { load() }, [])

  const open = async (m) => {
    setCurrent(m)
    if (!m.read) {
      const { data } = await api.patch(`/admin/messages/${m.id}/read?read=true`)
      setList((all) => all.map((x) => (x.id === data.id ? data : x)))
    }
  }

  const markUnread = async (m) => {
    const { data } = await api.patch(`/admin/messages/${m.id}/read?read=false`)
    setList((all) => all.map((x) => (x.id === data.id ? data : x)))
    setCurrent(null)
  }

  const remove = async (m) => {
    if (!confirmDelete('ce message')) return
    await api.delete(`/admin/messages/${m.id}`)
    setCurrent(null)
    load()
  }

  if (!list) return <Loading />
  const unread = list.filter((m) => !m.read).length

  return (
    <>
      <PageTitle title="Messages" text={`${list.length} message(s) · ${unread} non lu(s)`} />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="a-card overflow-hidden !p-0 lg:col-span-2">
          {list.length ? (
            <ul className="max-h-[70vh] divide-y divide-gray-100 overflow-y-auto">
              {list.map((m) => (
                <li key={m.id}>
                  <button onClick={() => open(m)} className={`flex w-full items-start gap-3 p-4 text-left transition hover:bg-gray-50 ${current?.id === m.id ? 'bg-brand-50/60' : ''}`}>
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.read ? 'bg-transparent' : 'bg-accent-500'}`} />
                    <span className="min-w-0 flex-1">
                      <span className="flex justify-between gap-2">
                        <span className={`truncate text-sm ${m.read ? 'font-medium' : 'font-bold'}`}>{m.name}</span>
                        <span className="shrink-0 text-[11px] text-gray-400">{formatDate(m.createdAt, false)}</span>
                      </span>
                      <span className="block truncate text-sm text-gray-700">{m.subject || 'Sans objet'}</span>
                      <span className="block truncate text-xs text-gray-400">{m.message}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <Empty icon={Inbox} text="Aucun message reçu." />
          )}
        </div>

        <div className="a-card lg:col-span-3">
          {current ? (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-5">
                <div>
                  <h2 className="text-xl font-bold">{current.subject || 'Sans objet'}</h2>
                  <p className="mt-1 text-sm text-gray-500">{formatDate(current.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => markUnread(current)} className="a-btn-light !py-2 text-xs"><Mail size={14} /> Non lu</button>
                  <button onClick={() => remove(current)} className="a-btn-danger !py-2 text-xs"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 py-5 text-sm">
                <span className="flex items-center gap-2 font-semibold"><span className="grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-white">{current.name[0]}</span>{current.name}</span>
                <a href={`mailto:${current.email}`} className="flex items-center gap-2 text-brand-600"><Mail size={14} />{current.email}</a>
                {current.phone && <a href={`tel:${current.phone}`} className="flex items-center gap-2 text-brand-600"><Phone size={14} />{current.phone}</a>}
              </div>
              <p className="whitespace-pre-wrap rounded-xl bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">{current.message}</p>
              <a href={`mailto:${current.email}?subject=${encodeURIComponent('Re: ' + (current.subject || 'Votre message à DABA'))}`} className="a-btn-primary mt-5">
                <Reply size={16} /> Répondre par email
              </a>
            </div>
          ) : (
            <Empty icon={MailOpen} text="Sélectionnez un message pour le lire." />
          )}
        </div>
      </div>
    </>
  )
}
