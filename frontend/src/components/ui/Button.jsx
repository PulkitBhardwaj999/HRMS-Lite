function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

const variants = {
  primary:
    'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-indigo-100 border border-transparent',
  secondary:
    'bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus:ring-indigo-100 border border-slate-200',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-50 focus:ring-indigo-100 border border-slate-200',
  danger:
    'bg-rose-50 text-rose-700 shadow-sm hover:bg-rose-100 focus:ring-rose-100 border border-rose-200',
}

const sizes = {
  sm: 'px-3 py-2 text-sm rounded-xl',
  md: 'px-4 py-2 text-sm rounded-xl',
  icon: 'p-2 text-sm rounded-lg',
}

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className,
  type,
  ...props
}) {
  const isNativeButton = Component === 'button'

  return (
    <Component
      {...props}
      type={isNativeButton ? type || 'button' : undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60',
        sizes[size] || sizes.md,
        variants[variant] || variants.primary,
        className,
      )}
    />
  )
}

