import { createContext, useContext, useState, useEffect } from 'react'

const STORAGE_KEY = 'gods-eye-settings'

const defaults = {
  timezone: 'Asia/Kuala_Lumpur',
  dateLocale: 'en-MY',
}

function load() {
  try {
    const s = window.localStorage.getItem(STORAGE_KEY)
    if (!s) return defaults
    const parsed = JSON.parse(s)
    return { ...defaults, ...parsed }
  } catch {
    return defaults
  }
}

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [timezone, setTimezone] = useState(() =>
    typeof window !== 'undefined' ? load().timezone : defaults.timezone
  )
  const [dateLocale, setDateLocale] = useState(() =>
    typeof window !== 'undefined' ? load().dateLocale : defaults.dateLocale
  )

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ timezone, dateLocale }))
  }, [timezone, dateLocale])

  return (
    <SettingsContext.Provider value={{ timezone, setTimezone, dateLocale, setDateLocale }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
