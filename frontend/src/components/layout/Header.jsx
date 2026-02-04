import { useLocation } from 'react-router-dom'
import Badge from '../ui/Badge.jsx'

const titles = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/attendance': 'Attendance',
}

export default function Header() {
  const { pathname } = useLocation()
  const title = titles[pathname] || 'HRMS Lite'

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-xs text-slate-500">Single-admin HRMS Lite workspace</div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">Single Admin</Badge>
        </div>
      </div>
    </header>
  )
}

