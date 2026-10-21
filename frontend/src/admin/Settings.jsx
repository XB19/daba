import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import { useSite } from '../context/SiteContext'
import { Field, ImageInput, Loading, PageTitle } from './kit'

/** Description des champs éditables, regroupés par onglet. type: text | area | image */
const TABS = [
  {
    id: 'home', label: 'Accueil', fields: [
      ['hero.badge', 'Badge du bandeau'], ['hero.title', 'Titre principal', 'area'], ['hero.subtitle', 'Sous-titre', 'area'], ['hero.image', 'Image du bandeau', 'image'],
      ['intro.title', 'Titre « Expertise »'], ['intro.text', 'Texte « Expertise »', 'area'],
      ['why.title', 'Titre « Pourquoi nous »'], ['why.text', 'Texte « Pourquoi nous »', 'area'], ['why.items', 'Points forts (un par ligne)', 'area'], ['why.image', 'Image « Pourquoi nous »', 'image'],
      ['cta.title', 'Titre appel à l’action'], ['cta.text', 'Texte appel à l’action', 'area'], ['cta.image', 'Image appel à l’action', 'image'],
    ],
  },
  {
    id: 'stats', label: 'Chiffres clés', fields: [1, 2, 3, 4].flatMap((n) => [[`stats.${n}.value`, `Chiffre ${n}`], [`stats.${n}.label`, `Libellé ${n}`]]),
  },
  {
    id: 'about', label: 'À propos', fields: [
      ['about.intro', 'Introduction', 'area'], ['about.history.1', 'Histoire – paragraphe 1', 'area'], ['about.history.2', 'Histoire – paragraphe 2', 'area'], ['about.image', 'Image', 'image'],
      ['about.mission', 'Mission', 'area'], ['about.vision', 'Vision', 'area'], ['about.values', 'Valeurs', 'area'],
      ...[1, 2, 3].flatMap((n) => [[`about.goal.${n}.title`, `Objectif ${n} – titre`], [`about.goal.${n}.text`, `Objectif ${n} – texte`, 'area']]),
    ],
  },
  {
    id: 'contact', label: 'Contact & réseaux', fields: [
      ['contact.phone', 'Téléphone'], ['contact.email', 'Email'], ['contact.address', 'Adresse'], ['contact.hours', 'Horaires'], ['contact.mapQuery', 'Lieu sur la carte (Google Maps)'],
      ['social.facebook', 'Facebook (URL)'], ['social.instagram', 'Instagram (URL)'], ['social.linkedin', 'LinkedIn (URL)'], ['social.whatsapp', 'WhatsApp (lien wa.me)'],
    ],
  },
  {
    id: 'shop', label: 'Boutique & pied de page', fields: [
      ['delivery.fee', 'Frais de livraison à domicile (FCFA)'], ['footer.text', 'Texte du pied de page', 'area'],
    ],
  },
]

export default function Settings() {
  const { reload } = useSite()
  const [values, setValues] = useState(null)
  const [tab, setTab] = useState('home')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/public/settings').then((r) => setValues(r.data))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/admin/settings', values)
      setValues(data)
      reload()
      toast.success('Contenu du site enregistré')
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (!values) return <Loading />
  const current = TABS.find((t) => t.id === tab)
  const set = (k, v) => setValues({ ...values, [k]: v })

  return (
    <>
      <PageTitle title="Contenu du site" text="Modifiez les textes, images et coordonnées affichés sur le site.">
        <button onClick={save} disabled={saving} className="a-btn-primary"><Save size={16} /> {saving ? 'Enregistrement…' : 'Enregistrer'}</button>
      </PageTitle>

      <div className="no-scrollbar mb-6 flex gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-sm">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`relative shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${tab === t.id ? 'text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            {tab === t.id && <motion.span layoutId="settings-tab" className="absolute inset-0 rounded-lg bg-brand-500" />}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="a-card grid gap-6 md:grid-cols-2">
        {current.fields.map(([key, label, type]) => (
          <Field key={key} label={label} className={type === 'area' || type === 'image' ? 'md:col-span-2' : ''}>
            {type === 'area' ? (
              <textarea rows={key === 'why.items' ? 5 : 3} value={values[key] || ''} onChange={(e) => set(key, e.target.value)} className="a-input resize-y" />
            ) : type === 'image' ? (
              <ImageInput value={values[key]} onChange={(v) => set(key, v)} />
            ) : (
              <input value={values[key] || ''} onChange={(e) => set(key, e.target.value)} className="a-input" />
            )}
          </Field>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={save} disabled={saving} className="a-btn-primary"><Save size={16} /> {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}</button>
      </div>
    </>
  )
}
