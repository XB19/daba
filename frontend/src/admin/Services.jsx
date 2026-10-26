import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil, Plus, Trash2, Wrench } from 'lucide-react'
import { api, errorMessage, assetUrl } from '../lib/api'
import { useSite } from '../context/SiteContext'
import { DynamicIcon, SERVICE_ICONS } from '../components/ui'
import { confirmDelete, Empty, Field, ImageInput, Loading, Modal, PageTitle, Toggle } from './kit'

const ICONS = Object.keys(SERVICE_ICONS)

export default function Services() {
  const { reload } = useSite()
  const [list, setList] = useState(null)
  const [edit, setEdit] = useState(null)

  const load = () => api.get('/public/services').then((r) => setList(r.data))
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    try {
      const body = { ...edit, position: Number(edit.position) || 0 }
      if (edit.id) await api.put(`/admin/services/${edit.id}`, body)
      else await api.post('/admin/services', body)
      toast.success('Service enregistré')
      setEdit(null)
      load()
      reload()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  const remove = async (s) => {
    if (!confirmDelete(`le service « ${s.title} »`)) return
    await api.delete(`/admin/services/${s.id}`)
    toast.success('Service supprimé')
    load()
    reload()
  }

  if (!list) return <Loading />

  return (
    <>
      <PageTitle title="Services" text="Domaines d’expertise affichés sur l’accueil et la page Services.">
        <button onClick={() => setEdit({ title: '', description: '', icon: 'Sprout', imageUrl: '', position: list.length + 1, showOnHome: true })} className="a-btn-primary"><Plus size={16} /> Nouveau service</button>
      </PageTitle>
      {list.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((s) => (
            <div key={s.id} className="a-card group overflow-hidden !p-0 transition hover:shadow-md">
              <div className="relative h-40">
                <img src={assetUrl(s.imageUrl)} alt="" className="h-full w-full object-cover" />
                <span className="absolute bottom-3 left-3 grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-white"><DynamicIcon name={s.icon} size={18} /></span>
                {s.showOnHome && <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-brand-700">Accueil</span>}
              </div>
              <div className="p-5">
                <h3 className="font-bold">{s.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{s.description}</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setEdit(s)} className="a-btn-light !py-2 text-xs"><Pencil size={14} /> Modifier</button>
                  <button onClick={() => remove(s)} className="a-btn-danger !py-2 text-xs"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="a-card"><Empty icon={Wrench} text="Aucun service." /></div>
      )}

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Modifier le service' : 'Nouveau service'} wide>
        {edit && (
          <form onSubmit={save} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Titre *" className="sm:col-span-2"><input required value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} className="a-input" /></Field>
              <Field label="Ordre"><input type="number" value={edit.position} onChange={(e) => setEdit({ ...edit, position: e.target.value })} className="a-input" /></Field>
            </div>
            <Field label="Description"><textarea rows={3} value={edit.description || ''} onChange={(e) => setEdit({ ...edit, description: e.target.value })} className="a-input resize-none" /></Field>
            <Field label="Icône">
              <div className="flex flex-wrap gap-2">
                {ICONS.map((name) => (
                  <button type="button" key={name} onClick={() => setEdit({ ...edit, icon: name })} className={`grid h-11 w-11 place-items-center rounded-xl border-2 transition ${edit.icon === name ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`} title={name}>
                    <DynamicIcon name={name} size={18} />
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Image"><ImageInput value={edit.imageUrl} onChange={(v) => setEdit({ ...edit, imageUrl: v })} /></Field>
            <Toggle checked={edit.showOnHome} onChange={(v) => setEdit({ ...edit, showOnHome: v })} label="Afficher sur la page d’accueil" />
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
