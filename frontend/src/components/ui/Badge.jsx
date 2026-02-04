function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

const variants = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
  info: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  danger: 'border-rose-200 bg-rose-50 text-rose-700',
}

export default function Badge({ variant = 'neutral', className, children, ...props }) {
  return (
    <span
      {...props}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
        variants[variant] || variants.neutral,
        className,
      )}
    >
      {children}
    </span>
  )
}

