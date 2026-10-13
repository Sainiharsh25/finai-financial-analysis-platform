
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
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
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  return (
    <>
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-white">
        {/* Logo */}
        <div className="shrink-0 border-b border-slate-800 px-6 py-5">
          <h1 className="text-2xl font-bold">FinAI</h1>
          <p className="mt-1 text-xs text-slate-400">
            Financial Intelligence
          </p>
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
                  className={({ isActive }) =>
                    `flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                      isActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="shrink-0 border-t border-slate-800">
          {/* Logout */}
          <div className="px-3 py-3">
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 transition hover:bg-red-900/30 hover:text-red-400"
            >
              <LogOut size={19} />
              <span>Logout</span>
            </button>
          </div>

          {/* AI Assistant */}
          <div className="border-t border-slate-800 p-4">
            <div className="rounded-lg bg-slate-900 p-3">
              <p className="text-sm font-medium">AI Assistant</p>
              <p className="mt-1 text-xs text-slate-400">
                Analyze your market data with AI
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }}
      />
    </>
  )
}

export default Sidebar
