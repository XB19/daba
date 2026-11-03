import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { BriefcaseBusiness, CalendarClock, ExternalLink, MapPin, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { api, errorMessage, formatDate } from '../lib/api'
import { confirmDelete, Empty, Field, Loading, Modal, PageTitle, Toggle } from './kit'

const CONTRACTS = ['CDI', 'CDD', 'Stage', 'Alternance', 'Prestataire']
const EMPTY = {
  title: '', department: '', location: 'Lomé', contractType: 'CDI', summary: '',
  missions: '', requirements: '', benefits: '', deadline: '', published: true,
}

export default function JobOffers() {
  const [list, setList] = useState(null)
  const [edit, setEdit] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => api.get('/admin/jobs').then((r) => setList(r.data))
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const body = { ...edit, deadline: edit.deadline || null }
      if (edit.id) await api.put(`/admin/jobs/${edit.id}`, body)
      else await api.post('/admin/jobs', body)
      toast.success(edit.id ? 'Offre mise à jour' : 'Offre publiée')
      setEdit(null)
      load()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const togglePublished = async (o) => {
    await api.put(`/admin/jobs/${o.id}`, { ...o, published: !o.published })
    load()
  }

  const remove = async (o) => {
    if (!confirmDelete(`l’offre « ${o.title} » (les candidatures reçues sont conservées)`)) return
    await api.delete(`/admin/jobs/${o.id}`)
    toast.success('Offre supprimée')
    load()
  }

  if (!list) return <Loading />
  const set = (k) => (e) => setEdit({ ...edit, [k]: e.target.value })
  const expired = (o) => o.deadline && new Date(o.deadline) < new Date(new Date().toDateString())

  return (
    <>
      <PageTitle title="Offres d’emploi" text={`${list.length} offre(s) · ${list.filter((x) => x.offer.published).length} publiée(s)`}>
        <button onClick={() => setEdit(EMPTY)} className="a-btn-primary"><Plus size={16} /> Nouvelle offre</button>
      </PageTitle>

      {list.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map(({ offer: o, applicationCount }) => (
            <div key={o.id} className={`a-card flex flex-col transition hover:shadow-md ${o.published ? '' : 'opacity-70'}`}>
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><BriefcaseBusiness size={22} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold">{o.title}</h3>
                    {o.contractType && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">{o.contractType}</span>}
                    {expired(o) && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">Expirée</span>}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    {o.location && <span className="flex items-center gap-1"><MapPin size={12} /> {o.location}</span>}
                    {o.deadline && <span className="flex items-center gap-1"><CalendarClock size={12} /> {formatDate(o.deadline, false)}</span>}
                    <span>Créée le {formatDate(o.createdAt, false)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                <span className="flex items-center gap-2 text-sm font-semibold text-brand-700"><Users size={15} /> {applicationCount} candidature(s)</span>
                <div className="flex items-center gap-1">
                  <Toggle checked={o.published} onChange={() => togglePublished(o)} label={o.published ? 'Publiée' : 'Brouillon'} />
                  {o.published && (
                    <a href={`/careers/jobs/${o.id}`} target="_blank" rel="noreferrer" className="ml-2 grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Voir sur le site"><ExternalLink size={16} /></a>
                  )}
                  <button onClick={() => setEdit({ ...EMPTY, ...o, deadline: o.deadline || '' })} className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-brand-50 hover:text-brand-600" aria-label="Modifier"><Pencil size={16} /></button>
                  <button onClick={() => remove(o)} className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600" aria-label="Supprimer"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="a-card"><Empty icon={BriefcaseBusiness} text="Aucune offre. Créez votre première offre d’emploi." /></div>
      )}

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Modifier l’offre' : 'Nouvelle offre d’emploi'} wide>
        {edit && (
          <form onSubmit={save} className="grid gap-5 sm:grid-cols-2">
            <Field label="Intitulé du poste *" className="sm:col-span-2"><input required value={edit.title} onChange={set('title')} className="a-input" placeholder="Ex. : Technicien d’élevage avicole" /></Field>
            <Field label="Service"><input value={edit.department || ''} onChange={set('department')} className="a-input" placeholder="Production, Logistique, Commercial…" /></Field>
            <Field label="Lieu"><input value={edit.location || ''} onChange={set('location')} className="a-input" /></Field>
            <Field label="Type de contrat">
              <select value={edit.contractType || ''} onChange={set('contractType')} className="a-input">
                {CONTRACTS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Date limite de candidature" hint="Facultatif : l’offre disparaît du site après cette date">
              <input type="date" value={edit.deadline || ''} onChange={set('deadline')} className="a-input" />
            </Field>
            <Field label="Résumé" className="sm:col-span-2"><textarea rows={2} value={edit.summary || ''} onChange={set('summary')} className="a-input resize-none" placeholder="Deux phrases pour présenter le poste" /></Field>
            <Field label="Missions" hint="Une mission par ligne" className="sm:col-span-2"><textarea rows={4} value={edit.missions || ''} onChange={set('missions')} className="a-input resize-y" /></Field>
            <Field label="Profil recherché" hint="Un critère par ligne" className="sm:col-span-2"><textarea rows={4} value={edit.requirements || ''} onChange={set('requirements')} className="a-input resize-y" /></Field>
            <Field label="Ce que nous offrons" hint="Un avantage par ligne (facultatif)" className="sm:col-span-2"><textarea rows={3} value={edit.benefits || ''} onChange={set('benefits')} className="a-input resize-y" /></Field>
            <div className="sm:col-span-2"><Toggle checked={edit.published} onChange={(v) => setEdit({ ...edit, published: v })} label="Publier sur le site" /></div>
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
