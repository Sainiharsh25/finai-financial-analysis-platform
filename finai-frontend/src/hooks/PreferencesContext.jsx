
import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'finaiPreferences'

const DEFAULT_PREFERENCES = {
  aiExplanations: true,
  notifications: true,
  darkMode: false,
}

const PreferencesContext = createContext(null)

function readPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')

    return {
      ...DEFAULT_PREFERENCES,
      ...saved,
    }
  } catch {
    return { ...DEFAULT_PREFERENCES }
  }
}

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(readPreferences)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
    } catch {
      // Preferences still work for the current session.
    }

    document.documentElement.classList.toggle(
      'dark',
      preferences.darkMode
    )
  }, [preferences])

  const updatePreference = (key, value) => {
    if (!(key in DEFAULT_PREFERENCES)) return

    setPreferences(previous => ({
      ...previous,
      [key]: Boolean(value),
    }))
  }

  const toggleDarkMode = () => {
    setPreferences(previous => ({
      ...previous,
      darkMode: !previous.darkMode,
    }))
  }

  const resetPreferences = () => {
    setPreferences({ ...DEFAULT_PREFERENCES })
  }

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreference,
        toggleDarkMode,
        resetPreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)

  if (!context) {
    throw new Error(
      'usePreferences must be used inside PreferencesProvider'
    )
  }

  return context
}
