import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { CircleCheck, FileText, Send, Upload, X } from 'lucide-react'
import { Spinner } from '../../components/ui'
import { api, errorMessage } from '../../lib/api'

const ACCEPT = '.pdf,.doc,.docx'
const MAX_MB = 5
const EMPTY = { fullName: '', email: '', phone: '', city: '', desiredPosition: '', message: '' }

/** Formulaire commun : candidature à une offre (offer) ou spontanée (sans offer). */
export default function ApplicationForm({ offer }) {
  const [form, setForm] = useState(EMPTY)
  const [cv, setCv] = useState(null)
  const [drag, setDrag] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const input = useRef(null)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const pick = (file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'doc', 'docx'].includes(ext)) return toast.error('Format accepté : PDF, DOC ou DOCX')
    if (file.size > MAX_MB * 1024 * 1024) return toast.error(`Le CV ne doit pas dépasser ${MAX_MB} Mo`)
    setCv(file)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!cv) return toast.error('Merci de joindre votre CV')
    setSending(true)
    try {
      const body = new FormData()
      Object.entries(form).forEach(([k, v]) => v && body.append(k, v))
      if (offer) body.append('offerId', offer.id)
      body.append('cv', cv)
      await api.post('/public/jobs/apply', body)
      setSent(true)
      setForm(EMPTY)
      setCv(null)
    } catch (err) {
      toast.error(errorMessage(err, 'La candidature n’a pas pu être envoyée'))
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="card p-10 text-center">
        <motion.span
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.15 }}
          className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand-500 text-white shadow-2xl shadow-brand-500/40"
        >
          <CircleCheck size={40} />
        </motion.span>
        <h3 className="mt-6 text-2xl font-extrabold">Candidature envoyée !</h3>
        <p className="mx-auto mt-3 max-w-md text-gray-500">
          Merci pour l’intérêt que vous portez à DABA. Notre équipe étudie chaque dossier avec attention et vous recontactera si votre profil correspond.
        </p>
        <button onClick={() => setSent(false)} className="btn-outline mt-8">Envoyer une autre candidature</button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={submit} className="card p-6 sm:p-10">
      <h2 className="text-2xl font-bold">{offer ? 'Postuler à cette offre' : 'Votre candidature'}</h2>
      <p className="mt-1 mb-8 text-gray-500">
        {offer ? <>Poste : <b className="text-ink">{offer.title}</b></> : 'Tous les champs marqués * sont obligatoires.'}
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="label">Nom complet *</label><input required value={form.fullName} onChange={set('fullName')} className="input" placeholder="Prénom et nom" /></div>
        <div><label className="label">Email *</label><input required type="email" value={form.email} onChange={set('email')} className="input" placeholder="votre@email.com" /></div>
        <div><label className="label">Téléphone</label><input value={form.phone} onChange={set('phone')} className="input" placeholder="+228 XX XX XX XX" /></div>
        <div><label className="label">Ville</label><input value={form.city} onChange={set('city')} className="input" placeholder="Lomé, Kara…" /></div>
        {!offer && (
          <div className="sm:col-span-2">
            <label className="label">Poste ou domaine souhaité *</label>
            <input required value={form.desiredPosition} onChange={set('desiredPosition')} className="input" placeholder="Ex. : technicien d’élevage, commercial, logisticien…" />
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="label">{offer ? 'Message de motivation' : 'Présentez-vous en quelques lignes'}</label>
          <textarea rows={5} value={form.message} onChange={set('message')} className="input resize-none" placeholder="Votre parcours, vos motivations, vos disponibilités…" />
        </div>

        <div className="sm:col-span-2">
          <label className="label">CV * <span className="font-normal text-gray-400">(PDF, DOC ou DOCX – {MAX_MB} Mo max.)</span></label>
          <AnimatePresence mode="wait">
            {cv ? (
              <motion.div key="file" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-4 rounded-2xl border-2 border-brand-200 bg-brand-50/60 p-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-500 text-white"><FileText size={22} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{cv.name}</span>
                  <span className="text-xs text-gray-500">{(cv.size / 1024 / 1024).toFixed(2)} Mo</span>
                </span>
                <button type="button" onClick={() => setCv(null)} className="grid h-9 w-9 place-items-center rounded-full text-gray-400 hover:bg-white hover:text-accent-500" aria-label="Retirer le CV">
                  <X size={18} />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="drop"
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => input.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]) }}
                className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                  drag ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-400 hover:bg-gray-50'
                }`}
              >
                <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600"><Upload size={24} /></span>
                <span className="font-semibold">Glissez votre CV ici ou <span className="text-brand-600 underline">parcourez</span></span>
                <span className="text-xs text-gray-400">Un seul fichier</span>
              </motion.button>
            )}
          </AnimatePresence>
          <input ref={input} type="file" accept={ACCEPT} hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = '' }} />
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-400">
        Vos données sont utilisées uniquement pour le traitement de votre candidature par l’équipe DABA.
      </p>
      <button disabled={sending} className="btn-primary mt-6 w-full !py-4 sm:w-auto sm:!px-10">
        {sending ? <Spinner className="h-5 w-5" /> : <Send size={18} />} Envoyer ma candidature
      </button>
    </form>
  )
}
