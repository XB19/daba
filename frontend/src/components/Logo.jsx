import { Link } from 'react-router-dom'

export default function Logo({ light = false, className = '' }) {
  return (
    <Link to="/" className={`group flex items-center gap-3 ${className}`}>
      <img
        src="/logo.png"
        alt="DABA"
        className="h-14 w-14 shrink-0 rounded-full bg-white shadow-lg ring-2 ring-white/60 transition-transform duration-500 group-hover:rotate-[-6deg] group-hover:scale-105"
      />
      <span className="leading-none">
        <span className={`block text-2xl font-black tracking-tight ${light ? 'text-white' : 'text-ink'}`}>DABA</span>
        <span className={`block text-[10px] font-semibold tracking-[0.22em] uppercase ${light ? 'text-brand-200' : 'text-brand-600'}`}>
          Le goût du terroir
        </span>
      </span>
    </Link>
  )
}
