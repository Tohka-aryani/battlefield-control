import { useMemo } from 'react'
import { EXCHANGES, getExchangeStatus } from '../../data/stocksConfig'

const TZ_LABELS = {
  'America/New_York': 'EST',
  'America/Toronto': 'EST',
  'America/Mexico_City': 'CST',
  'America/Sao_Paulo': 'BRT',
  'Europe/London': 'GMT',
  'Europe/Berlin': 'CET',
  'Europe/Paris': 'CET',
  'Europe/Zurich': 'CET',
  'Europe/Moscow': 'MSK',
  'Asia/Tokyo': 'JST',
  'Asia/Hong_Kong': 'HKT',
  'Asia/Shanghai': 'CST',
  'Asia/Seoul': 'KST',
  'Australia/Sydney': 'AEDT',
  'Asia/Kolkata': 'IST',
  'Asia/Singapore': 'SGT',
}

export default function StocksExchanges() {
  const withStatus = useMemo(() => {
    return EXCHANGES.map((ex) => ({
      ...ex,
      status: getExchangeStatus(ex.tz),
      tzLabel: TZ_LABELS[ex.tz] || ex.tz,
    }))
  }, [])

  const openCount = withStatus.filter((e) => e.status === 'OPEN').length

  const byRegion = useMemo(() => {
    const map = {}
    withStatus.forEach((e) => {
      if (!map[e.region]) map[e.region] = []
      map[e.region].push(e)
    })
    return map
  }, [withStatus])

  return (
    <div className="stocks-exchanges">
      <h4 className="stocks-section-title">GLOBAL EXCHANGES {openCount}/{EXCHANGES.length} open</h4>
      <div className="stocks-exchange-list">
        {['AMERICAS', 'EUROPE', 'ASIA PACIFIC'].map((region) => (
          <div key={region} className="stocks-exchange-region">
            <h5 className="stocks-exchange-region-title">{region}</h5>
            <ul>
              {byRegion[region]?.map((ex) => (
                <li key={ex.abbrev} className="stocks-exchange-item">
                  <span className="stocks-exchange-abbrev">{ex.abbrev}</span>
                  <span className="stocks-exchange-name">{ex.name}</span>
                  <span className="stocks-exchange-tz">{ex.tzLabel}</span>
                  <span className={`stocks-exchange-status status-${ex.status.toLowerCase()}`}>
                    {ex.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
