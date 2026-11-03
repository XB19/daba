import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CalendarClock, ExternalLink, Pencil, Plus, TicketPercent, Trash2 } from 'lucide-react'
import { api, assetUrl, errorMessage, formatDate } from '../lib/api'
import { confirmDelete, Empty, Field, ImageInput, Loading, Modal, PageTitle, Toggle } from './kit'

const EMPTY = {
  title: '', category: '', badge: 'Bon Plan', summary: '', content: '', imageUrl: '',
  ctaLabel: '', ctaUrl: '', startDate: '', endDate: '', featured: false, published: true, position: 0,
}

const today = () => new Date(new Date().toDateString())

function state(d) {
  if (!d.published) return { label: 'Brouillon', cls: 'bg-gray-100 text-gray-600' }
  if (d.startDate && new Date(d.startDate) > today()) return { label: 'Programmé', cls: 'bg-sky-50 text-sky-700' }
  if (d.endDate && new Date(d.endDate) < today()) return { label: 'Terminé', cls: 'bg-red-50 text-red-600' }
  return { label: 'En ligne', cls: 'bg-brand-50 text-brand-700' }
}

export default function Deals() {
  const [list, setList] = useState(null)
  const [edit, setEdit] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => api.get('/admin/deals').then((r) => setList(r.data))
  useEffect(() => { load() }, [])

  const payload = (d) => ({ ...d, startDate: d.startDate || null, endDate: d.endDate || null, position: Number(d.position) || 0 })

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (edit.id) await api.put(`/admin/deals/${edit.id}`, payload(edit))
      else await api.post('/admin/deals', payload(edit))
      toast.success('Bon plan enregistré')
      setEdit(null)
      load()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const quick = async (d, patch) => {
    try {
      await api.put(`/admin/deals/${d.id}`, payload({ ...d, ...patch }))
      load()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  const remove = async (d) => {
    if (!confirmDelete(`le bon plan « ${d.title} »`)) return
    await api.delete(`/admin/deals/${d.id}`)
    toast.success('Bon plan supprimé')
    load()
  }

  if (!list) return <Loading />
  const set = (k) => (e) => setEdit({ ...edit, [k]: e.target.value })

  return (
    <>
      <PageTitle title="Bons plans" text="Affiches et offres du groupe affichées sur la page Bons Plans & ZenCard.">
        <button onClick={() => setEdit({ ...EMPTY, position: list.length + 1 })} className="a-btn-primary"><Plus size={16} /> Nouveau bon plan</button>
      </PageTitle>

      {list.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((d) => {
            const st = state(d)
            return (
              <div key={d.id} className="a-card flex flex-col overflow-hidden !p-0 transition hover:shadow-md">
                <div className="relative h-48 bg-brand-50">
                  {d.imageUrl ? <img src={assetUrl(d.imageUrl)} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-brand-300"><TicketPercent size={40} /></div>}
                  <span className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-bold ${st.cls}`}>{st.label}</span>
                  {d.badge && <span className="absolute top-3 right-3 rounded-full bg-accent-500 px-2.5 py-1 text-[11px] font-black text-white">{d.badge}</span>}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-bold">{d.title}</h3>
                  <p className="mt-1 line-clamp-2 flex-1 text-sm text-gray-500">{d.summary}</p>
                  {(d.startDate || d.endDate) && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                      <CalendarClock size={13} /> {d.startDate ? formatDate(d.startDate, false) : '…'} → {d.endDate ? formatDate(d.endDate, false) : '…'}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4">
                    <Toggle checked={d.published} onChange={(v) => quick(d, { published: v })} label="Publié" />
                    <div className="flex gap-1">
                      <a href="/bons-plans" target="_blank" rel="noreferrer" className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Voir sur le site"><ExternalLink size={16} /></a>
                      <button onClick={() => setEdit({ ...EMPTY, ...d, startDate: d.startDate || '', endDate: d.endDate || '' })} className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-brand-50 hover:text-brand-600" aria-label="Modifier"><Pencil size={16} /></button>
                      <button onClick={() => remove(d)} className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600" aria-label="Supprimer"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="a-card"><Empty icon={TicketPercent} text="Aucun bon plan. Créez votre première promotion." /></div>
      )}

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Modifier le bon plan' : 'Nouveau bon plan'} wide>
        {edit && (
          <form onSubmit={save} className="grid gap-5 sm:grid-cols-2">
            <Field label="Titre *" className="sm:col-span-2"><input required value={edit.title} onChange={set('title')} className="a-input" placeholder="Ex. : Pack barbecue du week-end" /></Field>
            <Field label="Badge" hint="Ex. : ZenCard, Bon Plan, -10 %" className="sm:col-span-2"><input value={edit.badge || ''} onChange={set('badge')} className="a-input" list="deal-badges" />
              <datalist id="deal-badges">{['ZenCard', 'Bon Plan', 'Promotion', 'Nouveau'].map((c) => <option key={c} value={c} />)}</datalist>
            </Field>
            <Field label="Affiche" hint="Avec une affiche : carte image agrandissable. Sans affiche : carte texte avec description et lien." className="sm:col-span-2"><ImageInput value={edit.imageUrl} onChange={(v) => setEdit({ ...edit, imageUrl: v })} /></Field>
            <Field label="Description" hint="Affichée sur les cartes texte (sans affiche)" className="sm:col-span-2"><textarea rows={3} value={edit.summary || ''} onChange={set('summary')} className="a-input resize-none" /></Field>
            <Field label="Début" hint="Facultatif"><input type="date" value={edit.startDate || ''} onChange={set('startDate')} className="a-input" /></Field>
            <Field label="Fin" hint="Après cette date, l’offre disparaît du site"><input type="date" value={edit.endDate || ''} onChange={set('endDate')} className="a-input" /></Field>
            <Field label="Lien « Voir le détail »" hint="Cartes texte uniquement (facultatif)"><input value={edit.ctaUrl || ''} onChange={set('ctaUrl')} className="a-input" placeholder="https://… ou /products" /></Field>
            <Field label="Texte du lien" hint="Par défaut : « Voir le détail »"><input value={edit.ctaLabel || ''} onChange={set('ctaLabel')} className="a-input" /></Field>
            <Field label="Ordre d’affichage"><input type="number" value={edit.position} onChange={set('position')} className="a-input" /></Field>
            <div className="flex flex-col justify-end pb-1">
              <Toggle checked={edit.published} onChange={(v) => setEdit({ ...edit, published: v })} label="Publier sur le site" />
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 pt-5 sm:col-span-2">
              <button type="button" onClick={() => setEdit(null)} className="a-btn-light">Annuler</button>
              <button disabled={saving} className="a-btn-primary">Enregistrer</button>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}
