export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-600">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-600" />
      </span>
      <span>{label}</span>
    </div>
  )
}
