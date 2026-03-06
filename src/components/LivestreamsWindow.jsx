import { useState } from 'react'
import { STREAM_CATEGORIES } from '../data/livestreamsConfig'

const allStreams = STREAM_CATEGORIES.flatMap((c) => c.streams)

export default function LivestreamsWindow({ onClose, onTitleBarPointerDown }) {
  const [selectedId, setSelectedId] = useState(allStreams[0]?.id ?? null)
  const selected = allStreams.find((s) => s.id === selectedId) ?? allStreams[0]

  return (
    <div className="livestreams-window" role="dialog" aria-label="Live streams">
      <div
        className="livestreams-window-titlebar"
        onPointerDown={(e) => {
          if (e.target.closest('button') || e.target.closest('select')) return
          onTitleBarPointerDown?.(e)
        }}
      >
        <div className="livestreams-window-title">
          <span className="livestreams-window-dot" />
          <span>LIVESTREAMS</span>
        </div>

        <select
          className="livestreams-dropdown"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {STREAM_CATEGORIES.map((cat) => (
            <optgroup key={cat.id} label={cat.label}>
              {cat.streams.map((stream) => (
                <option key={stream.id} value={stream.id}>
                  {stream.flag}  {stream.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <div className="livestreams-window-controls">
          <button
            type="button"
            className="livestreams-window-btn livestreams-window-close"
            aria-label="Close"
            onClick={onClose}
          />
        </div>
      </div>

      <div className="livestreams-player-wrap">
        {selected && (
          <>
            <iframe
              key={selected.id}
              title={selected.name}
              className="livestreams-iframe"
              src={`${selected.embedUrl}&autoplay=1&mute=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
            <div className="livestreams-player-footer">
              <span className="livestreams-now-playing">{selected.flag} {selected.name}</span>
              {selected.watchUrl && (
                <a
                  href={selected.watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="livestreams-external"
                >
                  Open in new tab →
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
