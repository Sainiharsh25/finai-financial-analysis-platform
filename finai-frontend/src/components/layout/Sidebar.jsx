import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  History,
  Briefcase,
  Star,
  Settings,
  LogOut,
  GraduationCap,
  Menu,
  X,
} from 'lucide-react'

import ConfirmModal from '../common/ConfirmModal'

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Finance Learning', icon: GraduationCap, path: '/learning' },
  { label: 'Stock Analysis', icon: BarChart3, path: '/analysis' },
  { label: 'Strategies', icon: TrendingUp, path: '/strategies' },
  { label: 'Backtesting', icon: History, path: '/backtesting' },
  { label: 'Portfolio', icon: Briefcase, path: '/portfolio' },
  { label: 'Watchlist', icon: Star, path: '/watchlist' },
  { label: 'Settings', icon: Settings, path: '/settings' },
]

function Sidebar() {
  const navigate = useNavigate()

  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setShowLogoutModal(false)
    setIsMobileOpen(false)

    navigate('/', { replace: true })
  }

  const closeMobileMenu = () => {
    setIsMobileOpen(false)
  }

  const SidebarContent = ({ mobile = false }) => (
    <>
      {/* Logo */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-800 px-6 py-5">
        <div>
          <h1 className="text-2xl font-bold">
            Fin<span className="text-blue-500">AI</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Financial Intelligence
          </p>
        </div>

        {mobile && (
          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close navigation menu"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X size={22} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Menu
        </p>

        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon size={19} className="shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="shrink-0 border-t border-slate-800">
        <div className="px-3 py-3">
          <button
            type="button"
            onClick={() => {
              setShowLogoutModal(true)
              setIsMobileOpen(false)
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 transition hover:bg-red-900/30 hover:text-red-400"
          >
            <LogOut size={19} className="shrink-0" />
            <span>Logout</span>
          </button>
        </div>

        <div className="border-t border-slate-800 p-4">
          <div className="rounded-lg bg-slate-900 p-3">
            <p className="text-sm font-medium">AI Assistant</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Analyze your market data with AI
            </p>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-white lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={isMobileOpen}
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-white shadow-lg transition hover:bg-slate-800 lg:hidden"
      >
        <Menu size={22} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 lg:hidden"
          onClick={closeMobileMenu}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            onClick={(event) => event.stopPropagation()}
            className="flex h-full w-[min(280px,85vw)] flex-col border-r border-slate-800 bg-slate-950 text-white shadow-2xl"
          >
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      {/* Logout Confirmation */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  )
}

export default Sidebar