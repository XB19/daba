import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import { useSite } from '../context/SiteContext'
import { confirmDelete, Empty, Field, Loading, Modal, PageTitle } from './kit'

export default function Categories() {
  const { reload } = useSite()
  const [list, setList] = useState(null)
  const [edit, setEdit] = useState(null)

  const load = () => api.get('/admin/categories').then((r) => setList(r.data))
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    try {
      const body = { ...edit, position: Number(edit.position) || 0 }
      if (edit.id) await api.put(`/admin/categories/${edit.id}`, body)
      else await api.post('/admin/categories', body)
      toast.success('Catégorie enregistrée')
      setEdit(null)
      load()
      reload()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  const remove = async (c) => {
    if (!confirmDelete(`la catégorie « ${c.name} »`)) return
    try {
      await api.delete(`/admin/categories/${c.id}`)
      toast.success('Catégorie supprimée')
      load()
      reload()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  if (!list) return <Loading />

  return (
    <>
      <PageTitle title="Catégories" text="Organisez les gammes de votre catalogue.">
        <button onClick={() => setEdit({ name: '', description: '', position: list.length + 1 })} className="a-btn-primary"><Plus size={16} /> Nouvelle catégorie</button>
      </PageTitle>
      {list.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => (
            <div key={c.id} className="a-card group flex items-start gap-4 transition hover:shadow-md">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 font-black text-brand-600">{c.position}</span>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold">{c.name}</h3>
                <p className="mt-0.5 text-sm text-gray-500">{c.description || '—'}</p>
                <p className="mt-3 text-xs font-semibold text-brand-600">{c.productCount} produit(s)</p>
              </div>
              <div className="flex gap-1 opacity-60 transition group-hover:opacity-100">
                <button onClick={() => setEdit(c)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-brand-50 hover:text-brand-600" aria-label="Modifier"><Pencil size={16} /></button>
                <button onClick={() => remove(c)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-red-50 hover:text-red-600" aria-label="Supprimer"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="a-card"><Empty icon={Tags} text="Aucune catégorie." /></div>
      )}

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Modifier la catégorie' : 'Nouvelle catégorie'}>
        {edit && (
          <form onSubmit={save} className="space-y-5">
            <Field label="Nom *"><input required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className="a-input" /></Field>
            <Field label="Description"><input value={edit.description || ''} onChange={(e) => setEdit({ ...edit, description: e.target.value })} className="a-input" /></Field>
            <Field label="Ordre d’affichage"><input type="number" value={edit.position} onChange={(e) => setEdit({ ...edit, position: e.target.value })} className="a-input" /></Field>
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
