import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { ImagePlus, Search, Upload, X } from 'lucide-react'
import { api, errorMessage, assetUrl } from '../lib/api'
import { Spinner } from '../components/ui'

export function PageTitle({ title, text, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {text && <p className="mt-1 text-sm text-gray-500">{text}</p>}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide = false }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-ink/50 p-4 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            className={`my-8 w-full rounded-2xl bg-white shadow-2xl ${wide ? 'max-w-3xl' : 'max-w-lg'}`}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-bold">{title}</h2>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-gray-400 hover:bg-gray-100" aria-label="Fermer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Field({ label, children, hint, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
    </label>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="inline-flex items-center gap-3 text-sm font-medium text-gray-700">
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-brand-500' : 'bg-gray-200'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
      {label}
    </button>
  )
}

/** Champ image : téléversement local ou URL. */
export function ImageInput({ value, onChange }) {
  const ref = useRef(null)
  const [busy, setBusy] = useState(false)

  const upload = async (file) => {
    if (!file) return
    setBusy(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const { data } = await api.post('/admin/upload', body)
      onChange(data.url)
      toast.success('Image téléversée')
    } catch (err) {
      toast.error(errorMessage(err, 'Échec du téléversement'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex gap-4">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files?.[0]) }}
        className="group relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 hover:border-brand-400"
      >
        {value ? <img src={assetUrl(value)} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <ImagePlus size={24} />}
        <span className="absolute inset-0 grid place-items-center bg-ink/50 text-white opacity-0 transition group-hover:opacity-100">
          {busy ? <Spinner className="h-5 w-5" /> : <Upload size={20} />}
        </span>
      </button>
      <div className="flex-1 space-y-2">
        <input value={value || ''} onChange={(e) => onChange(e.target.value)} className="a-input" placeholder="https://… ou téléversez une image" />
        <button type="button" onClick={() => ref.current?.click()} className="a-btn-light !py-2 text-xs">
          <Upload size={14} /> Choisir un fichier
        </button>
        <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
      </div>
    </div>
  )
}

export function SearchBox({ value, onChange, placeholder = 'Rechercher…' }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="a-input w-64 pl-9" />
    </div>
  )
}

export function Empty({ icon: Icon, text }) {
  return (
    <div className="py-16 text-center text-gray-400">
      <Icon size={40} className="mx-auto" />
      <p className="mt-3 text-sm">{text}</p>
    </div>
  )
}

export function Loading() {
  return <div className="grid place-items-center py-24"><Spinner className="h-8 w-8 text-brand-500" /></div>
}

export const confirmDelete = (what = 'cet élément') => window.confirm(`Supprimer ${what} ? Cette action est irréversible.`)
