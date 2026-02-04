import { NavLink } from 'react-router-dom'
import logo from '../../assets/logo.svg'

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/employees', label: 'Employees' },
  { path: '/attendance', label: 'Attendance' },
]

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition',
          'border border-transparent',
          isActive
            ? 'bg-indigo-500/20 text-white shadow-sm'
            : 'text-white/80 hover:bg-white/10 hover:text-white',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-full flex-col bg-slate-900 px-4 py-4 text-white lg:w-64 lg:px-5 lg:py-6">
      {/* LOGO */}
      <div className="flex items-center gap-3 px-1">
        <img
          src={logo}
          alt="HRMS Lite"
          className="h-9 w-9 rounded-xl bg-white/10 p-1.5"
        />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">HRMS Lite</div>
          <div className="truncate text-xs text-white/60">Admin Console</div>
        </div>
      </div>

      {/* NAV */}
      <nav className="mt-6 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavItem key={item.path} to={item.path}>
            {item.label}
          </NavItem>
        ))}
      </nav>

      {/* PUSHES ADMIN TO BOTTOM */}
      <div className="mt-auto pt-6">
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/20 text-sm font-bold">
              A
            </div>

            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-semibold">Admin</div>
              <div className="truncate text-xs text-white/60">
                Single Admin · No login
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
