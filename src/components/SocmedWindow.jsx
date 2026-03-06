import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchCombinedSocmedFeed } from '../api/socmedFeedData'
import { TELEGRAM_CHANNELS, getTelegramChannelUrl, getTelegramAppUrl, fetchCombinedTelegramFeed } from '../api/telegramFeedData'

const TWITTER_ACCOUNTS = [
  { username: 'Marchforward', label: 'March Forward' },
  { username: 'realDonaldTrump', label: 'Donald Trump' },
  { username: 'sentdefender', label: 'sentdefender' },
  { username: 'noctu_mind', label: 'noctu_mind' },
  { username: 'MenchOsint', label: 'MenchOsint' },
  { username: 'Pataramesh', label: 'Pataramesh' },
  { username: 'war_noir', label: 'war_noir' },
]

const TWITTER_WIDGETS_URL = 'https://platform.twitter.com/widgets.js'

const TWITTER_AVATAR_URL = (username) =>
  `https://unavatar.io/twitter/${encodeURIComponent(username)}`

const SOURCE_LABELS = {
  Marchforward: { rep: 'OSINT', topic: 'INTEL' },
  realDonaldTrump: { rep: 'HIGH REP', topic: 'POLITICS' },
  sentdefender: { rep: 'OSINT', topic: 'DEFENSE' },
  noctu_mind: { rep: 'OSINT', topic: 'INTEL' },
  MenchOsint: { rep: 'OSINT', topic: 'INTEL' },
  Pataramesh: { rep: 'OSINT', topic: 'INTEL' },
  war_noir: { rep: 'OSINT', topic: 'CONFLICT' },
}

/* ── Drag / resize helpers ── */

const STORAGE_KEY = 'godseye-socmed-window'
const MIN_W = 360
const MIN_H = 340
const DEFAULT_W = 460
const DEFAULT_H = 520

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const v = JSON.parse(raw)
    if (typeof v?.x === 'number') return { x: v.x, y: v.y, w: v.w, h: v.h }
  } catch {}
  return null
}

function saveState(pos, size) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...pos, ...size })) } catch {}
}

function clampSize(w, h) {
  const maxW = typeof window !== 'undefined' ? Math.min(640, window.innerWidth * 0.9) : 640
  const maxH = typeof window !== 'undefined' ? Math.min(820, window.innerHeight * 0.9) : 820
  return { w: Math.max(MIN_W, Math.min(maxW, w)), h: Math.max(MIN_H, Math.min(maxH, h)) }
}

function clampPos(x, y) {
  const maxX = typeof window !== 'undefined' ? window.innerWidth - 60 : 800
  const maxY = typeof window !== 'undefined' ? window.innerHeight - 60 : 600
  return { x: Math.max(0, Math.min(maxX, x)), y: Math.max(0, Math.min(maxY, y)) }
}

function defaultPos() {
  const x = typeof window !== 'undefined' ? Math.max(60, window.innerWidth - DEFAULT_W - 80) : 400
  return { x, y: 60 }
}

/* ── Tweet helpers ── */

function parseTweetContent(text) {
  if (!text || typeof text !== 'string') return [{ type: 'text', value: '—' }]
  const parts = []
  const re = /(@\w+)|(https?:\/\/[^\s]+)/gi
  let lastIndex = 0
  let match
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }
    if (match[0].startsWith('@')) {
      parts.push({ type: 'mention', value: match[0].slice(1), raw: match[0] })
    } else {
      parts.push({ type: 'url', value: match[0] })
    }
    lastIndex = re.lastIndex
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) })
  }
  return parts.length ? parts : [{ type: 'text', value: text }]
}

function TweetContent({ text }) {
  const segments = parseTweetContent(text)
  return (
    <div className="socmed-card-content">
      {segments.map((seg, i) => {
        if (seg.type === 'text') return <span key={i}>{seg.value}</span>
        if (seg.type === 'mention') {
          return (
            <a key={i} href={`https://twitter.com/${seg.value}`} target="_blank" rel="noopener noreferrer" className="socmed-card-mention" onClick={(e) => e.stopPropagation()}>
              @{seg.value}
            </a>
          )
        }
        if (seg.type === 'url') {
          return (
            <a key={i} href={seg.value} target="_blank" rel="noopener noreferrer" className="socmed-card-url" onClick={(e) => e.stopPropagation()}>
              {seg.value}
            </a>
          )
        }
        return null
      })}
    </div>
  )
}

function TweetCard({ item }) {
  const displayName = TWITTER_ACCOUNTS.find((a) => a.username === item.username)?.label || item.username
  const labels = SOURCE_LABELS[item.username] || { rep: 'TWEET', topic: '' }
  const initial = (displayName || item.username).charAt(0).toUpperCase()
  const content = (item.title || item.description || '').trim() || '—'
  const tweetUrl = item.link || '#'

  return (
    <article className="socmed-card">
      <div className="socmed-card-inner">
        <a href={tweetUrl} target="_blank" rel="noopener noreferrer" className="socmed-card-header-link">
          <div className="socmed-card-header">
            <div className="socmed-card-avatar" aria-hidden="true">
              <img
                src={TWITTER_AVATAR_URL(item.username)}
                alt="" loading="lazy"
                onError={(e) => { e.target.style.display = 'none'; const fb = e.target.nextElementSibling; if (fb) fb.style.display = 'flex' }}
              />
              <span className="socmed-card-avatar-fallback" style={{ display: 'none' }}>{initial}</span>
            </div>
            <div className="socmed-card-meta">
              <span className="socmed-card-name">{displayName}</span>
              <span className="socmed-card-handle">@{item.username}</span>
              <span className="socmed-card-time">{item.timeAgo}</span>
            </div>
          </div>
        </a>
        <div className="socmed-card-labels">
          <span className="socmed-card-badge socmed-badge-tweet">
            <span className="socmed-badge-x" aria-hidden="true">X</span>
            TWEET
          </span>
          {labels.rep && <span className="socmed-card-badge socmed-badge-rep">{labels.rep}</span>}
          {labels.topic && <span className="socmed-card-badge socmed-badge-topic">{labels.topic}</span>}
        </div>
        <div className="socmed-card-body">
          <TweetContent text={content} />
        </div>
        {item.image && (
          <a href={tweetUrl} target="_blank" rel="noopener noreferrer" className="socmed-card-media-link">
            <div className="socmed-card-media"><img src={item.image} alt="" loading="lazy" /></div>
          </a>
        )}
      </div>
    </article>
  )
}

const TELEGRAM_ICON_PATH = 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z'

function TelegramCard({ item }) {
  const [expanded, setExpanded] = useState(false)
  const content = (item.content || item.title || '').trim() || '—'
  const TRUNCATE_LEN = 320
  const isLong = content.length > TRUNCATE_LEN
  const displayContent = isLong && !expanded ? content.slice(0, TRUNCATE_LEN) : content
  const channelDisplay = item.channelName || item.channelUsername
  return (
    <article className="socmed-card socmed-card-telegram">
      <div className="socmed-card-inner">
        <a href={item.link || getTelegramChannelUrl(item.channelUsername)} target="_blank" rel="noopener noreferrer" className="socmed-card-header-link">
          <div className="socmed-card-header socmed-card-header-telegram">
            <div className="socmed-card-telegram-avatar" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d={TELEGRAM_ICON_PATH} /></svg>
            </div>
            <div className="socmed-card-meta">
              <span className="socmed-card-name">{channelDisplay}</span>
              <span className="socmed-card-time-sep" aria-hidden="true"> • </span>
              <span className="socmed-card-time">{item.timeAgo}</span>
            </div>
          </div>
        </a>
        <div className="socmed-card-labels">
          <span className="socmed-card-badge socmed-badge-telegram">
            <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10" aria-hidden="true"><path d={TELEGRAM_ICON_PATH} /></svg>
            TELEGRAM
          </span>
          <span className="socmed-card-badge socmed-badge-severity">{item.severityLabel}</span>
        </div>
        <div className="socmed-card-body">
          <div className="socmed-card-content socmed-card-content-telegram">{displayContent}</div>
          {isLong && (
            <button type="button" className="socmed-card-expand" onClick={(e) => { e.preventDefault(); setExpanded((x) => !x) }}>
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
        {item.image && (
          <a href={item.link || getTelegramChannelUrl(item.channelUsername)} target="_blank" rel="noopener noreferrer" className="socmed-card-media-link">
            <div className="socmed-card-media"><img src={item.image} alt="" loading="lazy" /></div>
          </a>
        )}
      </div>
    </article>
  )
}

/* ── Main floating window ── */

export default function SocmedWindow({ onClose }) {
  const saved = loadSaved()
  const initSize = saved ? clampSize(saved.w, saved.h) : { w: DEFAULT_W, h: DEFAULT_H }
  const initPos = saved ? clampPos(saved.x, saved.y) : defaultPos()

  const [position, setPosition] = useState(initPos)
  const [size, setSize] = useState(initSize)
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizing, setResizing] = useState(null)
  const [resizeStart, setResizeStart] = useState(null)

  const [activeTab, setActiveTab] = useState('twitter')
  const [feedItems, setFeedItems] = useState([])
  const [telegramItems, setTelegramItems] = useState([])
  const [telegramLoading, setTelegramLoading] = useState(false)
  const [telegramError, setTelegramError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const embedRef = useRef(null)
  const showEmbedFallback = !loading && feedItems.length === 0

  const persist = useCallback(() => saveState(position, size), [position, size])
  useEffect(() => { if (!dragging && !resizing) persist() }, [dragging, resizing, persist])

  useEffect(() => {
    if (!dragging && !resizing) return
    const onMove = (e) => {
      if (dragging) {
        setPosition(() => clampPos(e.clientX - dragStart.x, e.clientY - dragStart.y))
      }
      if (resizing) {
        setSize((prev) => {
          let w = prev.w, h = prev.h
          if (resizing === 'r' || resizing === 'br') w = resizeStart.w + (e.clientX - resizeStart.x)
          if (resizing === 'b' || resizing === 'br') h = resizeStart.h + (e.clientY - resizeStart.y)
          return clampSize(w, h)
        })
      }
    }
    const onUp = () => { setDragging(false); setResizing(null); setResizeStart(null) }
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
    document.addEventListener('pointerleave', onUp)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerleave', onUp)
    }
  }, [dragging, dragStart, resizing, resizeStart])

  const onTitleDown = useCallback((e) => {
    if (e.button !== 0) return
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    setDragging(true)
  }, [position.x, position.y])

  const onResizeDown = useCallback((edge, e) => {
    if (e.button !== 0) return
    e.stopPropagation()
    setResizing(edge)
    setResizeStart({ x: e.clientX, y: e.clientY, w: size.w, h: size.h })
  }, [size.w, size.h])

  useEffect(() => {
    setLoading(true)
    fetchCombinedSocmedFeed(TWITTER_ACCOUNTS)
      .then((items) => setFeedItems(items || []))
      .catch(() => setFeedItems([]))
      .finally(() => setLoading(false))
  }, [])

  const loadTelegramFeed = useCallback(() => {
    setTelegramError(null)
    setTelegramLoading(true)
    fetchCombinedTelegramFeed()
      .then((items) => {
        setTelegramItems(items || [])
        if (!items?.length) setTelegramError('No posts loaded. Open the channel in your browser or Telegram app below.')
      })
      .catch(() => {
        setTelegramItems([])
        setTelegramError('Feed unavailable. Open the channel in your browser or Telegram app below.')
      })
      .finally(() => setTelegramLoading(false))
  }, [])

  useEffect(() => {
    if (activeTab === 'telegram') loadTelegramFeed()
  }, [activeTab, loadTelegramFeed])

  useEffect(() => {
    if (!showEmbedFallback) return
    if (document.querySelector(`script[src="${TWITTER_WIDGETS_URL}"]`)) {
      setScriptLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = TWITTER_WIDGETS_URL
    script.async = true
    script.charset = 'utf-8'
    script.onload = () => setScriptLoaded(true)
    document.body.appendChild(script)
  }, [showEmbedFallback])

  useEffect(() => {
    if (!showEmbedFallback || !scriptLoaded || !window.twttr?.widgets || !embedRef.current) return
    window.twttr.widgets.load(embedRef.current)
  }, [showEmbedFallback, scriptLoaded])

  return (
    <div
      className="socmed-float"
      style={{ left: position.x, top: position.y, width: size.w, height: size.h }}
      role="dialog"
      aria-label="Social media feeds"
    >
      <div className="socmed-resize-r" onPointerDown={(e) => onResizeDown('r', e)} aria-hidden />
      <div className="socmed-resize-b" onPointerDown={(e) => onResizeDown('b', e)} aria-hidden />
      <div className="socmed-resize-br" onPointerDown={(e) => onResizeDown('br', e)} aria-hidden />

      <div className="socmed-window">
        <div
          className="socmed-window-titlebar"
          onPointerDown={(e) => { if (!e.target.closest('button')) onTitleDown(e) }}
          style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        >
          <div className="socmed-window-title">
            <span className="socmed-window-dot" />
            <span>SOCMED</span>
          </div>
          <div className="socmed-window-controls">
            <button type="button" className="socmed-window-btn socmed-window-close" aria-label="Close" onClick={onClose} />
          </div>
        </div>

        <div className="socmed-tabs">
          <button type="button" className={`socmed-tab ${activeTab === 'twitter' ? 'active' : ''}`} onClick={() => setActiveTab('twitter')} aria-selected={activeTab === 'twitter'}>
            <span className="socmed-tab-icon socmed-tab-icon-x" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </span>
            <span>Twitter</span>
          </button>
          <button type="button" className={`socmed-tab ${activeTab === 'telegram' ? 'active' : ''}`} onClick={() => setActiveTab('telegram')} aria-selected={activeTab === 'telegram'}>
            <span className="socmed-tab-icon socmed-tab-icon-telegram" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d={TELEGRAM_ICON_PATH} />
              </svg>
            </span>
            <span>Telegram</span>
          </button>
        </div>

        <div className="socmed-content socmed-feed">
          {activeTab === 'twitter' && (
            <>
              {loading && <div className="socmed-loading">Loading feed…</div>}
              {!loading && feedItems.length > 0 && (
                <div className="socmed-feed-list">
                  {feedItems.map((item) => <TweetCard key={item.id} item={item} />)}
                </div>
              )}
              {showEmbedFallback && (
                <div className="socmed-embed-stack" ref={embedRef}>
                  {TWITTER_ACCOUNTS.map(({ username, label }) => (
                    <div key={username} className="socmed-embed-block">
                      <div className="socmed-embed-label">@{username} — {label}</div>
                      <a className="twitter-timeline" href={`https://twitter.com/${username}`} data-chrome="nofooter noheader noborders" data-tweet-limit="8" data-dnt="true">
                        Tweets by {username}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'telegram' && (
            <div className="socmed-telegram">
              {telegramLoading && <div className="socmed-loading">Loading Telegram…</div>}
              {!telegramLoading && telegramItems.length > 0 && (
                <div className="socmed-feed-list">
                  {telegramItems.map((item) => <TelegramCard key={item.id} item={item} />)}
                </div>
              )}
              {!telegramLoading && telegramItems.length === 0 && (
                <div className="socmed-telegram-header">
                  {telegramError && <p className="socmed-telegram-desc socmed-telegram-error">{telegramError}</p>}
                  <button type="button" className="socmed-telegram-retry" onClick={loadTelegramFeed}>Retry load feed</button>
                  <p className="socmed-telegram-desc">Or open the channel directly:</p>
                  <div className="socmed-telegram-channels">
                    {TELEGRAM_CHANNELS.map(({ username, label }) => (
                      <div key={username} className="socmed-telegram-channel-row">
                        <span className="socmed-telegram-channel-label">{label}</span>
                        <a href={getTelegramChannelUrl(username)} target="_blank" rel="noopener noreferrer" className="socmed-telegram-channel">Open in browser</a>
                        <a href={getTelegramAppUrl(username)} target="_blank" rel="noopener noreferrer" className="socmed-telegram-channel">Open in Telegram app</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
