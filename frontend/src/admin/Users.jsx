import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil, Plus, ShieldCheck, Trash2, Users as UsersIcon } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import { confirmDelete, Empty, Field, Loading, Modal, PageTitle, Toggle } from './kit'

export default function Users() {
  const [list, setList] = useState(null)
  const [edit, setEdit] = useState(null)
  const load = () => api.get('/admin/users').then((r) => setList(r.data))
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    try {
      if (edit.id) await api.put(`/admin/users/${edit.id}`, edit)
      else await api.post('/admin/users', edit)
      toast.success('Utilisateur enregistré')
      setEdit(null)
      load()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  const remove = async (u) => {
    if (!confirmDelete(`le compte de ${u.fullName}`)) return
    try {
      await api.delete(`/admin/users/${u.id}`)
      load()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  if (!list) return <Loading />

  return (
    <>
      <PageTitle title="Utilisateurs" text="Clients inscrits et administrateurs.">
        <button onClick={() => setEdit({ fullName: '', email: '', phone: '', password: '', role: 'ADMIN', active: true })} className="a-btn-primary"><Plus size={16} /> Nouvel utilisateur</button>
      </PageTitle>
      <div className="a-card overflow-hidden !p-0">
        {list.length ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80"><tr><th className="a-th">Nom</th><th className="a-th">Email</th><th className="a-th">Téléphone</th><th className="a-th">Rôle</th><th className="a-th">Statut</th><th className="a-th" /></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/60">
                    <td className="a-td"><span className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 font-bold text-brand-700">{u.fullName[0]}</span><b>{u.fullName}</b></span></td>
                    <td className="a-td">{u.email}</td>
                    <td className="a-td text-gray-500">{u.phone || '—'}</td>
                    <td className="a-td">
                      {u.role === 'ADMIN'
                        ? <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-white"><ShieldCheck size={12} /> Admin</span>
                        : <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">Client</span>}
                    </td>
                    <td className="a-td"><span className={`text-xs font-semibold ${u.active ? 'text-brand-600' : 'text-gray-400'}`}>{u.active ? '● Actif' : '○ Désactivé'}</span></td>
                    <td className="a-td">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setEdit({ ...u, password: '' })} className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-brand-50 hover:text-brand-600" aria-label="Modifier"><Pencil size={16} /></button>
                        <button onClick={() => remove(u)} className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600" aria-label="Supprimer"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon={UsersIcon} text="Aucun utilisateur." />
        )}
      </div>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Modifier l’utilisateur' : 'Nouvel utilisateur'}>
        {edit && (
          <form onSubmit={save} className="space-y-5">
            <Field label="Nom complet *"><input required value={edit.fullName} onChange={(e) => setEdit({ ...edit, fullName: e.target.value })} className="a-input" /></Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Email *"><input required type="email" value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} className="a-input" /></Field>
              <Field label="Téléphone"><input value={edit.phone || ''} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} className="a-input" /></Field>
            </div>
            <Field label={edit.id ? 'Nouveau mot de passe' : 'Mot de passe *'} hint={edit.id ? 'Laisser vide pour ne pas changer' : '6 caractères minimum'}>
              <input type="password" required={!edit.id} minLength={6} value={edit.password} onChange={(e) => setEdit({ ...edit, password: e.target.value })} className="a-input" />
            </Field>
            <Field label="Rôle">
              <select value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })} className="a-input">
                <option value="ADMIN">Administrateur</option>
                <option value="CUSTOMER">Client</option>
              </select>
            </Field>
            <Toggle checked={edit.active} onChange={(v) => setEdit({ ...edit, active: v })} label="Compte actif" />
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
