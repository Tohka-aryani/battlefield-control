import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import { TIMEZONE_OPTIONS, DATE_LOCALE_OPTIONS } from '../data/settingsOptions'

const CHECK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const MOON_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)
const SUN_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
)

function DateLocaleDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = options.find((o) => o.value === value) || { value, label: value }

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e) => {
      if (ref.current?.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div className="locale-dropdown" ref={ref}>
      <button
        type="button"
        className="locale-dropdown-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Date locale"
      >
        <span>{current.label}</span>
        <span className="locale-dropdown-arrow" aria-hidden>▼</span>
      </button>
      {open && (
        <ul
          className="locale-dropdown-list"
          role="listbox"
          aria-label="Date locale"
        >
          {options.map((opt) => (
            <li key={opt.value} role="option" aria-selected={opt.value === value}>
              <button
                type="button"
                className={`locale-dropdown-option ${opt.value === value ? 'selected' : ''}`}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
              >
                <span className="locale-dropdown-check">
                  {opt.value === value ? CHECK_ICON : null}
                </span>
                <span className="locale-dropdown-option-label">{opt.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function SettingsPanel({ onClose }) {
  const { theme, setTheme } = useTheme()
  const { timezone, setTimezone, dateLocale, setDateLocale } = useSettings()

  return (
    <div className="settings-window" role="dialog" aria-label="Settings">
      <div className="settings-window-titlebar">
        <div className="settings-window-title">
          <span className="settings-window-dot" />
          <span>SETTINGS</span>
        </div>
        <div className="settings-window-controls">
          <button type="button" className="settings-window-btn" aria-label="Minimize" />
          <button type="button" className="settings-window-btn" aria-label="Maximize" />
          <button
            type="button"
            className="settings-window-btn settings-window-close"
            aria-label="Close"
            onClick={onClose}
          />
        </div>
      </div>

      <div className="settings-window-body">
        <section className="settings-section">
          <h3 className="settings-section-heading">Timezone</h3>
          <select
            className="settings-select"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            aria-label="Timezone"
          >
            {!TIMEZONE_OPTIONS.some((o) => o.value === timezone) && (
              <option value={timezone}>{timezone}</option>
            )}
            {TIMEZONE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </section>

        <section className="settings-section">
          <h3 className="settings-section-heading">Date locale</h3>
          <DateLocaleDropdown
            value={dateLocale}
            options={
              DATE_LOCALE_OPTIONS.some((o) => o.value === dateLocale)
                ? DATE_LOCALE_OPTIONS
                : [{ value: dateLocale, label: dateLocale }, ...DATE_LOCALE_OPTIONS]
            }
            onChange={setDateLocale}
          />
        </section>

        <section className="settings-section">
          <h3 className="settings-section-heading">Theme</h3>
          <div className="settings-theme-buttons">
            <button
              type="button"
              className={`settings-theme-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
              aria-pressed={theme === 'dark'}
              aria-label="Dark mode"
            >
              {MOON_ICON}
              <span>DARK</span>
            </button>
            <button
              type="button"
              className={`settings-theme-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
              aria-pressed={theme === 'light'}
              aria-label="Light mode"
            >
              {SUN_ICON}
              <span>LIGHT</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
