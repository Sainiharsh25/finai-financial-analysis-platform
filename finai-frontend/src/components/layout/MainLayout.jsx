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

function Sidebar({ isOpen = false, onClose = () => {} }) {
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setShowLogoutModal(false)
    onClose()
    navigate('/', { replace: true })
  }

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleCancelLogout = () => {
    setShowLogoutModal(false)
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-dvh w-[min(18rem,85vw)] shrink-0 flex-col
          border-r border-slate-800 bg-slate-950 text-white
          transition-transform duration-200 ease-in-out
          md:sticky md:top-0 md:z-auto md:h-screen md:w-64
          md:translate-x-0
          ${
            isOpen
              ? 'translate-x-0'
              : '-translate-x-full md:translate-x-0'
          }
        `}
      >
        {/* Brand */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-800 px-5 py-5 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Fin<span className="text-blue-500">AI</span>
            </h1>

            <p className="mt-1 text-xs text-slate-400">
              Financial Intelligence
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="
              inline-flex min-h-11 min-w-11 items-center justify-center
              rounded-lg text-slate-400 transition
              hover:bg-slate-800 hover:text-white
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-blue-500
              md:hidden
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-5">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Menu
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `
                      flex min-h-11 w-full items-center gap-3
                      rounded-lg px-3 py-3 text-sm font-medium
                      transition-colors duration-150
                      focus-visible:outline-none
                      focus-visible:ring-2 focus-visible:ring-blue-500
                      ${
                        isActive
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }
                    `
                  }
                >
                  <Icon size={19} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              )
            })}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="shrink-0 border-t border-slate-800">
          {/* Logout */}
          <div className="px-3 py-3">
            <button
              type="button"
              onClick={handleLogoutClick}
              className="
                flex min-h-11 w-full items-center gap-3
                rounded-lg px-3 py-3 text-sm font-medium
                text-slate-300 transition-colors
                hover:bg-red-900/30 hover:text-red-400
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-red-500
              "
            >
              <LogOut size={19} className="shrink-0" />
              <span>Logout</span>
            </button>
          </div>

          {/* AI Assistant information */}
          <div className="border-t border-slate-800 p-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                  <TrendingUp size={16} className="text-blue-400" />
                </div>

                <p className="text-sm font-semibold text-white">
                  AI Assistant
                </p>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Analyze your market data with AI.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Logout confirmation */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onCancel={handleCancelLogout}
        onConfirm={handleLogout}
      />
    </>
  )
}

export default Sidebar
