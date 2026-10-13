
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UserRound,
  Settings,
  LogOut,
  ChevronDown,
  X,
  ShieldCheck,
  Moon,
  Sun,
} from 'lucide-react'
import { usePreferences } from '../../hooks/PreferencesContext'

function Navbar() {
  const navigate = useNavigate()
  const menuRef = useRef(null)

  const { preferences, toggleDarkMode } = usePreferences()
  const isDark = preferences.darkMode

  const [open, setOpen] = useState(false)
  const [showLogoutPopup, setShowLogoutPopup] = useState(false)
  const [imageError, setImageError] = useState(false)

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  })

  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleEscape = event => {
      if (event.key === 'Escape') {
        setOpen(false)
        setShowLogoutPopup(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    const handleStorage = () => {
      try {
        setUser(JSON.parse(localStorage.getItem('user') || '{}'))
        setImageError(false)
      } catch {
        setUser({})
      }
    }

    window.addEventListener('storage', handleStorage)

    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const name =
    user.username ||
    user.name ||
    user.fullName ||
    user.email?.split('@')[0] ||
    'My Account'

  const email = user.email || ''
  const photo = user.picture || user.photoURL || user.profilePicture || ''

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('')

  const handleLogout = () => {
    setOpen(false)
    setShowLogoutPopup(true)
  }

  const confirmLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setShowLogoutPopup(false)
    navigate('/login', { replace: true })
  }

  const panel = isDark
    ? 'border-slate-700 bg-slate-900 text-slate-100'
    : 'border-slate-200 bg-white text-slate-900'

  const mutedText = isDark ? 'text-slate-400' : 'text-slate-500'

  const hoverBg = isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'

  return (
    <>
      <div
        ref={menuRef}
        className="relative flex items-center justify-end gap-1"
      >
        {/* Global theme toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`mr-2 rounded-xl border p-2.5 transition ${
            isDark
              ? 'border-slate-700 bg-slate-800 text-amber-300 hover:bg-slate-700'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          {isDark ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        {/* Profile button */}
        <button
          type="button"
          onClick={() => setOpen(previous => !previous)}
          aria-expanded={open}
          aria-label="Open user profile menu"
          className={`flex items-center gap-3 rounded-xl px-2 py-1.5 transition ${hoverBg}`}
        >
          {photo && !imageError ? (
            <img
              src={photo}
              alt={`${name}'s profile`}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className={`h-10 w-10 rounded-full border object-cover ${
                isDark ? 'border-slate-700' : 'border-slate-200'
              }`}
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white">
              {initials || <UserRound size={19} />}
            </div>
          )}

          <div className="hidden text-left sm:block">
            <p className={`max-w-36 truncate text-sm font-semibold ${
              isDark ? 'text-slate-100' : 'text-slate-800'
            }`}>
              {name}
            </p>
            <p className={`max-w-36 truncate text-xs ${mutedText}`}>
              {email || 'My account'}
            </p>
          </div>

          <ChevronDown
            size={16}
            className={`transition ${mutedText} ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Profile dropdown */}
        {open && (
          <div
            className={`absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border shadow-lg ${panel}`}
          >
            <div
              className={`border-b px-4 py-4 ${
                isDark ? 'border-slate-700' : 'border-slate-100'
              }`}
            >
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className={`mt-1 truncate text-xs ${mutedText}`}>
                {email}
              </p>
            </div>

            <div className="p-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  navigate('/settings')
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isDark
                    ? 'text-slate-200 hover:bg-slate-800'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Settings size={17} />
                Settings
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isDark
                    ? 'text-red-400 hover:bg-red-950/40'
                    : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout confirmation popup */}
      {showLogoutPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setShowLogoutPopup(false)
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            aria-describedby="logout-description"
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl sm:p-7 ${panel}`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  isDark ? 'bg-red-950/50' : 'bg-red-50'
                }`}
              >
                <ShieldCheck size={25} className="text-red-500" />
              </div>

              <button
                type="button"
                onClick={() => setShowLogoutPopup(false)}
                aria-label="Close logout confirmation"
                className={`rounded-lg p-2 transition ${
                  isDark
                    ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            <h2 id="logout-title" className="mt-5 text-xl font-bold">
              Logout from FinAI?
            </h2>

            <p
              id="logout-description"
              className={`mt-2 text-sm leading-6 ${mutedText}`}
            >
              Are you sure you want to logout from FinAI?
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowLogoutPopup(false)}
                className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${
                  isDark
                    ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmLogout}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <LogOut size={16} />
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
