import { useEffect, useState } from 'react'
import {
  UserRound,
  SlidersHorizontal,
  ShieldCheck,
  Info,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Eye,
  EyeOff,
  RotateCcw,
} from 'lucide-react'

import api from '../../services/api'
import { usePreferences } from '../../hooks/PreferencesContext'
import Navbar from '../../pages/Navbar/Navbar'

function Settings() {
  const { preferences, updatePreference, resetPreferences } =
    usePreferences()

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  })

  const [username, setUsername] = useState(
    user.username || user.name || user.email?.split('@')[0] || ''
  )
  const [email, setEmail] = useState(user.email || '')

  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [backendStatus, setBackendStatus] = useState('Checking...')
  const [savingPassword, setSavingPassword] = useState(false)

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // --------------------------------------------------
  // Load account and check backend
  // --------------------------------------------------

  useEffect(() => {
    let active = true

    api
      .get('/api/auth/me')
      .then((response) => {
        if (!active) return

        const account = response.data || {}
        const mergedUser = { ...user, ...account }

        setUser(mergedUser)
        setUsername(
          mergedUser.username ||
            mergedUser.name ||
            mergedUser.email?.split('@')[0] ||
            ''
        )
        setEmail(mergedUser.email || '')
        localStorage.setItem('user', JSON.stringify(mergedUser))
        setBackendStatus('Connected')
      })
      .catch(() => {
        api
          .get('/actuator/health')
          .then(() => {
            if (active) setBackendStatus('Connected')
          })
          .catch(() => {
            if (active) setBackendStatus('Unable to verify')
          })
      })

    return () => {
      active = false
    }
  }, [])

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  const showMessage = (text, type = 'success') => {
    setMessage(text)
    setMessageType(type)
  }

  // --------------------------------------------------
  // Preferences
  // --------------------------------------------------

  const handlePreferenceToggle = (key) => {
    updatePreference(key, !preferences[key])
    setMessage('')
  }

  const handleResetPreferences = () => {
    resetPreferences()
    showMessage('Preferences restored to defaults.')
  }

  // --------------------------------------------------
  // Profile
  // --------------------------------------------------

  const handleProfileUpdate = (event) => {
    event.preventDefault()
    setMessage('')

    const trimmedUsername = username.trim()
    const trimmedEmail = email.trim()

    if (!trimmedUsername || !trimmedEmail) {
      showMessage('Username and email are required.', 'error')
      return
    }

    const updatedUser = {
      ...user,
      username: trimmedUsername,
      email: trimmedEmail,
    }

    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)

    showMessage(
      'Profile saved on this device. Your server account was not changed.'
    )
  }

  // --------------------------------------------------
  // Change password
  // --------------------------------------------------

  const handlePasswordChange = async (event) => {
    event.preventDefault()
    setMessage('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage('Please complete all password fields.', 'error')
      return
    }

    if (newPassword.length < 8) {
      showMessage('New password must be at least 8 characters.', 'error')
      return
    }

    if (newPassword !== confirmPassword) {
      showMessage('New passwords do not match.', 'error')
      return
    }

    setSavingPassword(true)

    try {
      await api.put('/api/auth/change-password', {
        currentPassword,
        newPassword,
      })

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      showMessage('Password changed successfully.')
    } catch (error) {
      const status = error.response?.status

      if (status === 404 || status === 405) {
        showMessage(
          'Password change endpoint is not implemented in the backend yet.',
          'error'
        )
      } else {
        showMessage(
          error.response?.data?.message ||
            'Could not change password. Check your current password and try again.',
          'error'
        )
      }
    } finally {
      setSavingPassword(false)
    }
  }

  // --------------------------------------------------
  // Reusable toggle
  // --------------------------------------------------

  const Toggle = ({ checked, onChange, label }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
        checked ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  const cardClass =
    'rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900'

  const labelClass =
    'mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300'

  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-teal-900'

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-full bg-slate-50 p-4 dark:bg-slate-950 sm:p-6">
      {/* Header */}
      <div className="-mx-4 -mt-4 mb-6 border-b border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-900 sm:-mx-6 sm:-mt-6 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Page title */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Settings
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage your FinAI preferences and account.
            </p>
          </div>

          {/* Right-side actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleResetPreferences}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <RotateCcw size={16} />
              Reset preferences
            </button>

            <Navbar />
          </div>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div
          role="status"
          aria-live="polite"
          className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${
            messageType === 'error'
              ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
          }`}
        >
          {messageType === 'error' ? (
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          )}

          <span>{message}</span>
        </div>
      )}

      {/* Settings sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account */}
        <section className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
              <UserRound size={21} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Account
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your account information
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="mt-6 space-y-4">
            <div>
              <label htmlFor="settings-username" className={labelClass}>
                Username
              </label>
              <input
                id="settings-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className={inputClass}
                required
                maxLength={80}
              />
            </div>

            <div>
              <label htmlFor="settings-email" className={labelClass}>
                Email
              </label>
              <input
                id="settings-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
                required
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500"
            >
              Save Profile
            </button>

            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
              Profile changes are currently saved in this browser only.
            </p>
          </form>
        </section>

        {/* Preferences */}
        <section className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-violet-50 p-2.5 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
              <SlidersHorizontal size={21} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Preferences
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Customize your dashboard experience
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {[
              {
                key: 'aiExplanations',
                title: 'AI Explanations',
                description: 'Show explanations for technical indicators',
              },
              {
                key: 'notifications',
                title: 'Notifications',
                description: 'Enable strategy signal notifications',
              },
              {
                key: 'darkMode',
                title: 'Dark Mode',
                description: 'Use the dark theme throughout supported pages',
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {item.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>

                  <p className="mt-1 text-xs font-medium text-teal-700 dark:text-teal-300">
                    {preferences[item.key] ? 'Enabled' : 'Disabled'}
                  </p>
                </div>

                <Toggle
                  label={item.title}
                  checked={Boolean(preferences[item.key])}
                  onChange={() => handlePreferenceToggle(item.key)}
                />
              </div>
            ))}

            <p className="border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Settings are saved automatically on this device. The AI
              explanation and notification preferences affect those features
              only after they are connected to their display logic.
            </p>
          </div>
        </section>

        {/* Security */}
        <section className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              <ShieldCheck size={21} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Security
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage your account security
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
            <div>
              <label htmlFor="current-password" className={labelClass}>
                Current password
              </label>

              <div className="relative">
                <input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className={`${inputClass} pr-12`}
                  required
                />

                <button
                  type="button"
                  aria-label={
                    showCurrentPassword
                      ? 'Hide current password'
                      : 'Show current password'
                  }
                  onClick={() =>
                    setShowCurrentPassword((value) => !value)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  {showCurrentPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="new-password" className={labelClass}>
                New password
              </label>

              <div className="relative">
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className={`${inputClass} pr-12`}
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  aria-label={
                    showNewPassword
                      ? 'Hide new password'
                      : 'Show new password'
                  }
                  onClick={() => setShowNewPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  {showNewPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className={labelClass}>
                Confirm new password
              </label>

              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={inputClass}
                minLength={8}
                required
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {savingPassword && (
                <LoaderCircle size={16} className="animate-spin" />
              )}

              {savingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </section>

        {/* Application */}
        <section className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-sky-50 p-2.5 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
              <Info size={21} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Application
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                FinAI application information
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500 dark:text-slate-400">
                Version
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                1.0.0
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500 dark:text-slate-400">
                Backend
              </span>

              <span
                className={`font-medium ${
                  backendStatus === 'Connected'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : backendStatus === 'Checking...'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {backendStatus}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500 dark:text-slate-400">
                AI Engine
              </span>
              <span className="text-right font-medium text-slate-900 dark:text-white">
                Ollama / Llama 3.2
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Settings
