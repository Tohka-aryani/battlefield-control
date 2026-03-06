import { useState, useEffect } from 'react'
import { useSettings } from '../context/SettingsContext'

export default function Header({ view, onViewChange }) {
  const { timezone } = useSettings()
  const [time, setTime] = useState('')

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    const tick = () => {
      const parts = formatter.formatToParts(new Date())
      const y = parts.find(p => p.type === 'year').value
      const m = parts.find(p => p.type === 'month').value
      const d = parts.find(p => p.type === 'day').value
      const h = parts.find(p => p.type === 'hour').value
      const min = parts.find(p => p.type === 'minute').value
      const s = parts.find(p => p.type === 'second').value
      setTime(`${y}-${m}-${d} ${h}:${min}:${s} ${timezone}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [timezone])

  return (
    <header className="header">
      <div className="header-left">
        <span className="status-dot" />
        <h1 className="title">Hyperion</h1>
      </div>
      <nav className="tabs">
        <button
          type="button"
          className={`tab ${view === 'map' ? 'active' : ''}`}
          onClick={() => onViewChange('map')}
        >
          THE MAP
        </button>
        <button
          type="button"
          className={`tab ${view === 'wall' ? 'active' : ''}`}
          onClick={() => onViewChange('wall')}
        >
          THE WALL
        </button>
      </nav>
      <div className="header-right">
        <time className="utc-time" dateTime={time || undefined}>
          {time || '—'}
        </time>
      </div>
    </header>
  )
}
