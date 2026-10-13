
import { Moon, Sun } from 'lucide-react'
import { usePreferences } from '../hooks/PreferencesContext'

function ThemeToggle() {
  const {
    preferences,
    toggleDarkMode,
  } = usePreferences()

  const isDark = preferences.darkMode

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="rounded-lg border border-slate-200 bg-white
        p-2 text-slate-700 hover:bg-slate-100
        dark:border-slate-700 dark:bg-slate-900
        dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}

export default ThemeToggle
