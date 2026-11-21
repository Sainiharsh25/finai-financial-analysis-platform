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

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    const handleEscape = (event) => {
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

  // Update user information when storage changes
  useEffect(() => {
    const handleStorage = () => {
      try {
        setUser(JSON.parse(localStorage.getItem('user') || '{}'))
        setImageError(false)
      } catch {
        setUser({})
        setImageError(false)
      }
    }

    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const name =
    user.username ||
    user.name ||
    user.fullName ||
    user.email?.split('@')[0] ||
    'My Account'

  const email = user.email || ''

  const photo =
    user.picture ||
    user.photoURL ||
    user.profilePicture ||
    ''

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

  const handleLogout = () => {
    setOpen(false)
    setShowLogoutPopup(true)
  }

  const confirmLogout = () => {
    // Clear login session
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // Close popup and dropdown
    setShowLogoutPopup(false)
    setOpen(false)

    // Redirect to the public landing page
    window.location.replace(
      'https://finai-financial-analysis-platform.vercel.app'
    )
  }

  const panel = isDark
    ? 'border-slate-700 bg-slate-900 text-slate-100'
    : 'border-slate-200 bg-white text-slate-900'

  const mutedText = isDark
    ? 'text-slate-400'
    : 'text-slate-500'

  const hoverBg = isDark
    ? 'hover:bg-slate-800'
    : 'hover:bg-slate-50'

  const actionClass = `flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
    isDark
      ? 'text-slate-200 hover:bg-slate-800'
      : 'text-slate-700 hover:bg-slate-50'
  }`

  return (
    <>
      <div
        ref={menuRef}
        className="relative flex min-w-0 items-center justify-end gap-1 sm:gap-2"
      >
        {/* Global theme toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          aria-label={
            isDark ? 'Switch to light mode' : 'Switch to dark mode'
          }
          title={
            isDark ? 'Switch to light mode' : 'Switch to dark mode'
          }
          className={`mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition sm:mr-2 sm:h-11 sm:w-11 ${
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
          onClick={() => setOpen((previous) => !previous)}
          aria-expanded={open}
          aria-haspopup="true"
          aria-label="Open user profile menu"
          className={`flex min-w-0 items-center gap-2 rounded-xl px-1.5 py-1.5 transition sm:gap-3 sm:px-2 ${hoverBg}`}
        >
          {photo && !imageError ? (
            <img
              src={photo}
              alt={`${name}'s profile`}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className={`h-9 w-9 shrink-0 rounded-full border object-cover sm:h-10 sm:w-10 ${
                isDark
                  ? 'border-slate-700'
                  : 'border-slate-200'
              }`}
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white sm:h-10 sm:w-10">
              {initials || <UserRound size={19} />}
            </div>
          )}

          <div className="hidden min-w-0 text-left sm:block">
            <p
              className={`max-w-36 truncate text-sm font-semibold ${
                isDark ? 'text-slate-100' : 'text-slate-800'
              }`}
            >
              {name}
            </p>

            <p className={`max-w-36 truncate text-xs ${mutedText}`}>
              {email || 'My account'}
            </p>
          </div>

          <ChevronDown
            size={16}
            className={`shrink-0 transition ${mutedText} ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Profile dropdown */}
        {open && (
          <div
            role="menu"
            className={`absolute right-0 top-full z-[60] mt-2 w-[min(16rem,calc(100vw-2rem))] overflow-hidden rounded-xl border shadow-xl ${panel}`}
          >
            <div
              className={`border-b px-4 py-4 ${
                isDark
                  ? 'border-slate-700'
                  : 'border-slate-100'
              }`}
            >
              <p className="truncate text-sm font-semibold">
                {name}
              </p>

              <p className={`mt-1 truncate text-xs ${mutedText}`}>
                {email}
              </p>
            </div>

            <div className="p-2">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  navigate('/settings')
                }}
                className={actionClass}
              >
                <Settings size={17} />
                Settings
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
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
          onMouseDown={(event) => {
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
            className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl sm:p-7 ${panel}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  isDark ? 'bg-red-950/50' : 'bg-red-50'
                }`}
              >
                <ShieldCheck size={25} className="text-red-500" />
              </div>

              <button
                type="button"
                onClick={() => setShowLogoutPopup(false)}
                aria-label="Close logout confirmation"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition ${
                  isDark
                    ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            <h2
              id="logout-title"
              className="mt-5 text-lg font-bold sm:text-xl"
            >
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
                className={`min-h-11 rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${
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
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
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
