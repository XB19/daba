import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Package, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { api, errorMessage, formatPrice } from '../lib/api'
import { useSite } from '../context/SiteContext'
import { confirmDelete, Empty, Field, ImageInput, Loading, Modal, PageTitle, SearchBox, Toggle } from './kit'

const EMPTY = { name: '', description: '', price: 0, unit: 'Sachet', imageUrl: '', available: true, featured: false, stock: 100, category: null }

export default function Products() {
  const { reload } = useSite()
  const [products, setProducts] = useState(null)
  const [categories, setCategories] = useState([])
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [edit, setEdit] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [p, c] = await Promise.all([api.get('/public/products'), api.get('/public/categories')])
    setProducts(p.data)
    setCategories(c.data)
  }
  useEffect(() => { load() }, [])

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return (products || [])
      .filter((p) => cat === 'all' || String(p.category?.id) === cat)
      .filter((p) => !s || p.name.toLowerCase().includes(s))
  }, [products, q, cat])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const body = { ...edit, price: Number(edit.price), stock: Number(edit.stock) }
      if (edit.id) await api.put(`/admin/products/${edit.id}`, body)
      else await api.post('/admin/products', body)
      toast.success(edit.id ? 'Produit mis à jour' : 'Produit créé')
      setEdit(null)
      load()
      reload()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (p, field) => {
    const { data } = await api.patch(`/admin/products/${p.id}/toggle?field=${field}`)
    setProducts((all) => all.map((x) => (x.id === data.id ? data : x)))
    reload()
  }

  const remove = async (p) => {
    if (!confirmDelete(`« ${p.name} »`)) return
    await api.delete(`/admin/products/${p.id}`)
    toast.success('Produit supprimé')
    load()
    reload()
  }

  if (!products) return <Loading />

  return (
    <>
      <PageTitle title="Produits" text={`${products.length} produit(s) au catalogue`}>
        <SearchBox value={q} onChange={setQ} />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="a-input !w-auto">
          <option value="all">Toutes catégories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={() => setEdit({ ...EMPTY, category: categories[0] || null })} className="a-btn-primary"><Plus size={16} /> Nouveau produit</button>
      </PageTitle>

      <div className="a-card overflow-hidden !p-0">
        {list.length ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80">
                <tr><th className="a-th">Produit</th><th className="a-th">Catégorie</th><th className="a-th">Prix</th><th className="a-th">Disponible</th><th className="a-th">Mis en avant</th><th className="a-th" /></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/60">
                    <td className="a-td">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl || undefined} alt="" className="h-12 w-12 rounded-lg object-cover" />
                        <div className="min-w-0"><p className="font-semibold">{p.name}</p><p className="max-w-xs truncate text-xs text-gray-400">{p.description}</p></div>
                      </div>
                    </td>
                    <td className="a-td"><span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{p.category?.name || '—'}</span></td>
                    <td className="a-td font-bold whitespace-nowrap">{formatPrice(p.price)}<span className="block text-xs font-normal text-gray-400">/ {p.unit}</span></td>
                    <td className="a-td"><Toggle checked={p.available} onChange={() => toggle(p, 'available')} /></td>
                    <td className="a-td">
                      <button onClick={() => toggle(p, 'featured')} aria-label="Mettre en avant">
                        <Star size={20} className={p.featured ? 'fill-sun-400 text-sun-400' : 'text-gray-300 hover:text-sun-400'} />
                      </button>
                    </td>
                    <td className="a-td">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setEdit(p)} className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-brand-50 hover:text-brand-600" aria-label="Modifier"><Pencil size={16} /></button>
                        <button onClick={() => remove(p)} className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600" aria-label="Supprimer"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon={Package} text="Aucun produit." />
        )}
      </div>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Modifier le produit' : 'Nouveau produit'} wide>
        {edit && (
          <form onSubmit={save} className="grid gap-5 sm:grid-cols-2">
            <Field label="Nom *" className="sm:col-span-2"><input required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className="a-input" /></Field>
            <Field label="Description" className="sm:col-span-2"><textarea rows={3} value={edit.description || ''} onChange={(e) => setEdit({ ...edit, description: e.target.value })} className="a-input resize-none" /></Field>
            <Field label="Prix (FCFA) *"><input required type="number" min={0} value={edit.price} onChange={(e) => setEdit({ ...edit, price: e.target.value })} className="a-input" /></Field>
            <Field label="Unité"><input value={edit.unit || ''} onChange={(e) => setEdit({ ...edit, unit: e.target.value })} className="a-input" placeholder="Sachet, kg, Boîte…" list="units" />
              <datalist id="units">{['Sachet', 'kg', 'Boîte', 'Paquet', 'Pièce'].map((u) => <option key={u} value={u} />)}</datalist>
            </Field>
            <Field label="Catégorie">
              <select value={edit.category?.id || ''} onChange={(e) => setEdit({ ...edit, category: categories.find((c) => String(c.id) === e.target.value) || null })} className="a-input">
                <option value="">— Aucune —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Stock"><input type="number" min={0} value={edit.stock} onChange={(e) => setEdit({ ...edit, stock: e.target.value })} className="a-input" /></Field>
            <Field label="Image" className="sm:col-span-2"><ImageInput value={edit.imageUrl} onChange={(v) => setEdit({ ...edit, imageUrl: v })} /></Field>
            <div className="flex flex-wrap gap-6 sm:col-span-2">
              <Toggle checked={edit.available} onChange={(v) => setEdit({ ...edit, available: v })} label="Disponible à la vente" />
              <Toggle checked={edit.featured} onChange={(v) => setEdit({ ...edit, featured: v })} label="Mis en avant sur l’accueil" />
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
