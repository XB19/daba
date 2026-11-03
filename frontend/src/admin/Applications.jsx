import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Download, FileUser, Mail, MapPin, Phone, Save, Trash2 } from 'lucide-react'
import { api, errorMessage, formatDate } from '../lib/api'
import { Spinner } from '../components/ui'
import { confirmDelete, Empty, Loading, PageTitle, SearchBox } from './kit'

export const APPLICATION_STATUS = {
  NOUVELLE: { label: 'Nouvelle', cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
  EN_COURS: { label: 'En cours d’étude', cls: 'bg-sky-50 text-sky-700 ring-sky-200' },
  ENTRETIEN: { label: 'Entretien', cls: 'bg-violet-50 text-violet-700 ring-violet-200' },
  RETENUE: { label: 'Retenue', cls: 'bg-brand-50 text-brand-700 ring-brand-200' },
  REFUSEE: { label: 'Non retenue', cls: 'bg-gray-100 text-gray-600 ring-gray-200' },
}

function Badge({ status }) {
  const s = APPLICATION_STATUS[status] || APPLICATION_STATUS.NOUVELLE
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${s.cls}`}>{s.label}</span>
}

export default function Applications() {
  const [list, setList] = useState(null)
  const [current, setCurrent] = useState(null)
  const [note, setNote] = useState('')
  const [status, setStatus] = useState('ALL')
  const [kind, setKind] = useState('all')
  const [q, setQ] = useState('')
  const [downloading, setDownloading] = useState(false)

  const load = () => api.get('/admin/applications').then((r) => setList(r.data))
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return (list || [])
      .filter((a) => status === 'ALL' || a.status === status)
      .filter((a) => kind === 'all' || (kind === 'spontaneous' ? a.spontaneous : !a.spontaneous))
      .filter((a) => !s || [a.fullName, a.email, a.offerTitle, a.desiredPosition, a.city].some((v) => v?.toLowerCase().includes(s)))
  }, [list, status, kind, q])

  const open = (a) => {
    setCurrent(a)
    setNote(a.adminNote || '')
  }

  const patch = async (a, body, msg) => {
    try {
      const { data } = await api.patch(`/admin/applications/${a.id}`, body)
      setList((all) => all.map((x) => (x.id === data.id ? data : x)))
      setCurrent(data)
      if (msg) toast.success(msg)
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  const downloadCv = async (a) => {
    setDownloading(true)
    try {
      const { data } = await api.get(`/admin/applications/${a.id}/cv`, { responseType: 'blob' })
      const url = URL.createObjectURL(data)
      Object.assign(document.createElement('a'), { href: url, download: a.cvOriginalName || 'cv' }).click()
      URL.revokeObjectURL(url)
      if (a.status === 'NOUVELLE') patch(a, { status: 'EN_COURS' })
    } catch {
      toast.error('Impossible de télécharger le CV')
    } finally {
      setDownloading(false)
    }
  }

  const remove = async (a) => {
    if (!confirmDelete(`la candidature de ${a.fullName} et son CV`)) return
    await api.delete(`/admin/applications/${a.id}`)
    setCurrent(null)
    load()
    toast.success('Candidature supprimée')
  }

  if (!list) return <Loading />
  const counts = list.reduce((acc, a) => ({ ...acc, [a.status]: (acc[a.status] || 0) + 1 }), {})

  return (
    <>
      <PageTitle title="Candidatures" text={`${list.length} candidature(s) · ${counts.NOUVELLE || 0} nouvelle(s)`}>
        <SearchBox value={q} onChange={setQ} placeholder="Nom, email, poste…" />
        <select value={kind} onChange={(e) => setKind(e.target.value)} className="a-input !w-auto">
          <option value="all">Toutes</option>
          <option value="offer">Sur une offre</option>
          <option value="spontaneous">Spontanées</option>
        </select>
      </PageTitle>

      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {[['ALL', 'Tous statuts', list.length], ...Object.entries(APPLICATION_STATUS).map(([k, v]) => [k, v.label, counts[k] || 0])].map(([k, label, n]) => (
          <button key={k} onClick={() => setStatus(k)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${status === k ? 'bg-ink text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            {label} <span className="ml-1 opacity-60">{n}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="a-card overflow-hidden !p-0 lg:col-span-2">
          {filtered.length ? (
            <ul className="max-h-[70vh] divide-y divide-gray-100 overflow-y-auto">
              {filtered.map((a) => (
                <li key={a.id}>
                  <button onClick={() => open(a)} className={`flex w-full items-start gap-3 p-4 text-left transition hover:bg-gray-50 ${current?.id === a.id ? 'bg-brand-50/60' : ''}`}>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-500 font-bold text-white">{a.fullName[0]}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex justify-between gap-2">
                        <span className={`truncate text-sm ${a.status === 'NOUVELLE' ? 'font-bold' : 'font-medium'}`}>{a.fullName}</span>
                        <span className="shrink-0 text-[11px] text-gray-400">{formatDate(a.createdAt, false)}</span>
                      </span>
                      <span className="block truncate text-sm text-gray-600">{a.spontaneous ? `Spontanée · ${a.desiredPosition}` : a.offerTitle}</span>
                      <span className="mt-1.5 block"><Badge status={a.status} /></span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <Empty icon={FileUser} text={list.length ? 'Aucune candidature ne correspond.' : 'Aucune candidature reçue pour le moment.'} />
          )}
        </div>

        <div className="a-card lg:col-span-3">
          {current ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-5">
                <div>
                  <h2 className="text-xl font-bold">{current.fullName}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {current.spontaneous ? <>Candidature spontanée · <b>{current.desiredPosition}</b></> : <>Offre : <b>{current.offerTitle}</b></>}
                  </p>
                  <p className="text-xs text-gray-400">Reçue le {formatDate(current.createdAt)}</p>
                </div>
                <Badge status={current.status} />
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <a href={`mailto:${current.email}`} className="flex items-center gap-2 text-brand-600"><Mail size={14} />{current.email}</a>
                {current.phone && <a href={`tel:${current.phone}`} className="flex items-center gap-2 text-brand-600"><Phone size={14} />{current.phone}</a>}
                {current.city && <span className="flex items-center gap-2 text-gray-600"><MapPin size={14} />{current.city}</span>}
              </div>

              {current.message && <p className="rounded-xl bg-gray-50 p-5 text-sm leading-relaxed whitespace-pre-wrap text-gray-700">{current.message}</p>}

              {current.hasCv && (
                <button onClick={() => downloadCv(current)} disabled={downloading} className="flex w-full items-center gap-4 rounded-xl border-2 border-dashed border-brand-200 p-4 text-left transition hover:bg-brand-50/50">
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-500 text-white">{downloading ? <Spinner className="h-5 w-5" /> : <Download size={20} />}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{current.cvOriginalName}</span><span className="text-xs text-gray-500">Télécharger le CV</span></span>
                </button>
              )}

              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">Statut</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(APPLICATION_STATUS).map(([k, v]) => (
                    <button key={k} onClick={() => patch(current, { status: k }, 'Statut mis à jour')} className={`rounded-lg px-3 py-2 text-xs font-semibold ring-1 ring-inset transition ${current.status === k ? v.cls : 'bg-white text-gray-500 ring-gray-200 hover:bg-gray-50'}`}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">Note interne</p>
                <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="a-input resize-none" placeholder="Visible uniquement par l’équipe (impressions, date d’entretien…)" />
                <div className="mt-3 flex flex-wrap justify-between gap-2">
                  <button onClick={() => remove(current)} className="a-btn-danger"><Trash2 size={16} /> Supprimer</button>
                  <div className="flex gap-2">
                    <a href={`mailto:${current.email}?subject=${encodeURIComponent('Votre candidature chez DABA')}`} className="a-btn-light"><Mail size={16} /> Répondre</a>
                    <button onClick={() => patch(current, { adminNote: note }, 'Note enregistrée')} className="a-btn-primary"><Save size={16} /> Enregistrer la note</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Empty icon={FileUser} text="Sélectionnez une candidature pour voir le détail." />
          )}
        </div>
      </div>
    </>
  )
}
