import { useState } from 'react'
import { useWallMap } from '../context/WallMapContext'
import { WALL_CATEGORIES, SEVERITY_COLORS } from '../data/wallMapConfig'

const CATEGORY_COLORS = {
  Conflict: '#dc2626',
  Political: '#a855f7',
  Humanitarian: '#14b8a6',
  Economic: '#22c55e',
  Disaster: '#ea580c',
}

export default function MapLegend() {
  const {
    wallItems, filterSeverity, setFilterSeverity,
    filterCategory, setFilterCategory,
  } = useWallMap()
  const [legendOpen, setLegendOpen] = useState(true)
  const [categoriesOpen, setCategoriesOpen] = useState(true)
  const [severityOpen, setSeverityOpen] = useState(true)

  const categoryCounts = WALL_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = wallItems.filter((i) => i.category === cat).length
    return acc
  }, {})

  return (
    <div className="map-legend">
      <button
        type="button"
        className="map-legend-main-heading"
        onClick={() => setLegendOpen((o) => !o)}
        aria-expanded={legendOpen}
      >
        <span>LEGEND</span>
        <span className="map-legend-chevron" aria-hidden="true">
          {legendOpen ? '▼' : '▶'}
        </span>
      </button>
      {legendOpen && (
        <>
      <section className="map-legend-section">
        <button
          type="button"
          className="map-legend-heading"
          onClick={() => setCategoriesOpen((o) => !o)}
          aria-expanded={categoriesOpen}
        >
          <span>CATEGORIES</span>
          <span className="map-legend-chevron">{categoriesOpen ? '▼' : '▶'}</span>
        </button>
        {categoriesOpen && (
          <ul className="map-legend-categories">
            <li className="map-legend-cat-row">
              <button
                type="button"
                className={`map-legend-cat-btn ${filterCategory === null ? 'active' : ''}`}
                onClick={() => setFilterCategory(null)}
              >
                <span className="map-legend-cat-dot map-legend-cat-dot-all" aria-hidden="true" />
                <span className="map-legend-cat-name">All</span>
                <span className="map-legend-cat-count">{wallItems.length}</span>
              </button>
            </li>
            {WALL_CATEGORIES.map((cat) => (
              <li key={cat} className="map-legend-cat-row">
                <button
                  type="button"
                  className={`map-legend-cat-btn ${filterCategory === cat ? 'active' : ''}`}
                  onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
                >
                  <span className="map-legend-cat-dot" style={{ backgroundColor: CATEGORY_COLORS[cat] }} aria-hidden="true" />
                  <span className="map-legend-cat-name">{cat}</span>
                  <span className="map-legend-cat-count">{categoryCounts[cat] ?? 0}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="map-legend-section">
        <button
          type="button"
          className="map-legend-heading"
          onClick={() => setSeverityOpen((o) => !o)}
          aria-expanded={severityOpen}
        >
          <span>SEVERITY</span>
          <span className="map-legend-chevron">{severityOpen ? '▼' : '▶'}</span>
        </button>
        {severityOpen && (
          <div className="map-legend-severity">
            <button
              type="button"
              className={`map-legend-sev-btn map-legend-sev-all ${filterSeverity === null ? 'active' : ''}`}
              onClick={() => setFilterSeverity(null)}
            >
              ALL
            </button>
            {(['T1', 'T2', 'T3', 'T4', 'T5']).map((s) => (
              <button
                key={s}
                type="button"
                className={`map-legend-sev-btn ${filterSeverity === s ? 'active' : ''}`}
                style={{ backgroundColor: SEVERITY_COLORS[s] }}
                onClick={() => setFilterSeverity(filterSeverity === s ? null : s)}
              >
                S{s.slice(1)}
              </button>
            ))}
          </div>
        )}
      </section>
        </>
      )}
    </div>
  )
}
