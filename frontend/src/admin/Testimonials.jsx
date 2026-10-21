import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil, Plus, Quote, Star, Trash2 } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import { useSite } from '../context/SiteContext'
import { Stars } from '../components/ui'
import { confirmDelete, Empty, Field, Loading, Modal, PageTitle, Toggle } from './kit'

export default function Testimonials() {
  const { reload } = useSite()
  const [list, setList] = useState(null)
  const [edit, setEdit] = useState(null)

  const load = () => api.get('/admin/testimonials').then((r) => setList(r.data))
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    try {
      if (edit.id) await api.put(`/admin/testimonials/${edit.id}`, edit)
      else await api.post('/admin/testimonials', edit)
      toast.success('Témoignage enregistré')
      setEdit(null)
      load()
      reload()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  const persist = async (t) => {
    await api.put(`/admin/testimonials/${t.id}`, t)
    load()
    reload()
  }

  const remove = async (t) => {
    if (!confirmDelete(`l’avis de ${t.name}`)) return
    await api.delete(`/admin/testimonials/${t.id}`)
    load()
    reload()
  }

  if (!list) return <Loading />

  return (
    <>
      <PageTitle title="Témoignages" text="Avis clients affichés sur la page d’accueil.">
        <button onClick={() => setEdit({ name: '', role: '', comment: '', rating: 5, visible: true })} className="a-btn-primary"><Plus size={16} /> Nouvel avis</button>
      </PageTitle>
      {list.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((t) => (
            <div key={t.id} className={`a-card flex flex-col transition ${t.visible ? '' : 'opacity-60'}`}>
              <div className="flex items-start justify-between">
                <Quote className="text-brand-300" size={28} />
                <Stars value={t.rating} size={14} />
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">“{t.comment}”</p>
              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <div><p className="font-bold">{t.name}</p><p className="text-xs text-gray-400">{t.role}</p></div>
                <div className="flex items-center gap-1">
                  <Toggle checked={t.visible} onChange={(v) => persist({ ...t, visible: v })} />
                  <button onClick={() => setEdit(t)} className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-brand-50 hover:text-brand-600" aria-label="Modifier"><Pencil size={16} /></button>
                  <button onClick={() => remove(t)} className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600" aria-label="Supprimer"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="a-card"><Empty icon={Quote} text="Aucun témoignage." /></div>
      )}

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Modifier l’avis' : 'Nouvel avis'}>
        {edit && (
          <form onSubmit={save} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nom *"><input required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className="a-input" /></Field>
              <Field label="Fonction"><input value={edit.role || ''} onChange={(e) => setEdit({ ...edit, role: e.target.value })} className="a-input" placeholder="Chef, gérant, particulier…" /></Field>
            </div>
            <Field label="Avis *"><textarea required rows={4} value={edit.comment} onChange={(e) => setEdit({ ...edit, comment: e.target.value })} className="a-input resize-none" /></Field>
            <Field label="Note">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} onClick={() => setEdit({ ...edit, rating: n })} aria-label={`${n} étoiles`}>
                    <Star size={26} className={n <= edit.rating ? 'fill-sun-400 text-sun-400' : 'text-gray-200'} />
                  </button>
                ))}
              </div>
            </Field>
            <Toggle checked={edit.visible} onChange={(v) => setEdit({ ...edit, visible: v })} label="Visible sur le site" />
            <div className="flex justify-end gap-2 border-t border-gray-100 pt-5">
              <button type="button" onClick={() => setEdit(null)} className="a-btn-light">Annuler</button>
              <button className="a-btn-primary">Enregistrer</button>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}
