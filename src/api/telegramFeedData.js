/**
 * Telegram channel feed.
 * Primary: scrape t.me/s/<channel> public preview (via multiple CORS proxies).
 * Fallback: RSS-Bridge / RSSHub instances.
 */

import { getSeverity, SEVERITY_DISPLAY } from '../data/wallMapConfig'

const CORS_PROXIES = [
  (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
]

export const TELEGRAM_CHANNELS = [
  { username: 'jacksonhinkle', label: 'Jackson Hinkle' },
  { username: 'Irfan_Newboys', label: 'Irfan Newboys' },
  { username: 'DDGeopolitics', label: 'DD Geopolitics' },
  { username: 'geopolitics_prime', label: 'Geopolitics Prime' },
  { username: 'Middle_East_Spectator', label: 'Middle East Spectator' },
]

export function getTelegramChannelUrl(username) {
  return `https://t.me/s/${encodeURIComponent(username)}`
}

export function getTelegramAppUrl(username) {
  return `tg://resolve?domain=${encodeURIComponent(username)}`
}

function getTimeAgo(ms) {
  const sec = Math.floor((Date.now() - ms) / 1000)
  if (sec < 60) return 'now'
  if (sec < 3600) return `${Math.floor(sec / 60)}m`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`
  return `${Math.floor(sec / 86400)}d`
}

function decodeHtmlEntities(text) {
  if (!text || typeof text !== 'string') return ''
  return text
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
}

function formatItem(raw, username, label) {
  const text = [raw.title, raw.description].filter(Boolean).join(' ')
  const severity = getSeverity(text)
  const content = decodeHtmlEntities((raw.description || raw.title || '').trim())
  return {
    ...raw,
    channelUsername: username,
    channelName: label || username,
    content: content || raw.title || '—',
    severity,
    severityLabel: SEVERITY_DISPLAY[severity] || severity,
    timeAgo: getTimeAgo(raw.published),
    id: `${username}-${(raw.link || raw.published || '').toString().replace(/[^a-zA-Z0-9-]/g, '_').slice(0, 80)}`,
  }
}

/* ── Fetch HTML via multiple CORS proxies (try each until one works) ── */

async function fetchHtmlViaProxy(targetUrl, timeoutMs = 15000) {
  for (const proxyFn of CORS_PROXIES) {
    const proxyUrl = proxyFn(targetUrl)
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeoutMs)
      const res = await fetch(proxyUrl, { signal: controller.signal })
      clearTimeout(timer)
      if (!res.ok) continue

      const raw = await res.text()
      if (!raw || raw.length < 100) continue

      // allorigins /get endpoint returns JSON { contents: "..." }
      if (proxyUrl.includes('/get?url=')) {
        try {
          const json = JSON.parse(raw)
          if (json.contents && typeof json.contents === 'string') return json.contents
        } catch {
          continue
        }
      }

      return raw
    } catch {
      continue
    }
  }
  return null
}

/* ── Primary: scrape t.me/s/<channel> ── */

function parseMessages(html) {
  if (!html) return []
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Telegram uses several possible selectors depending on page version
  let messages = doc.querySelectorAll('.tgme_widget_message_wrap')
  if (!messages.length) messages = doc.querySelectorAll('.tgme_widget_message_bubble')
  if (!messages.length) messages = doc.querySelectorAll('[data-post]')
  if (!messages.length) return []

  const items = []
  for (const el of messages) {
    const msgEl = el.querySelector?.('[data-post]') || (el.hasAttribute?.('data-post') ? el : null)
    const container = msgEl || el

    const dataPost = container.getAttribute?.('data-post') || ''
    const link = dataPost ? `https://t.me/${dataPost}` : ''

    // Try multiple text selectors
    const textEl = container.querySelector('.tgme_widget_message_text')
      || container.querySelector('.message_media_not_supported_label')
      || container.querySelector('.tgme_widget_message_sticker')
    const rawHtml = textEl ? textEl.innerHTML : ''
    const plainText = rawHtml
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim()

    // Accept messages with text OR images
    const photoEl = container.querySelector('.tgme_widget_message_photo_wrap')
      || container.querySelector('[style*="background-image"]')
    let image = null
    if (photoEl) {
      const style = photoEl.getAttribute('style') || ''
      const imgMatch = style.match(/url\(['"]?(https?:\/\/[^'")\s]+)['"]?\)/)
      if (imgMatch) image = imgMatch[1]
    }

    if (!plainText && !image) continue

    const timeEl = container.querySelector('time[datetime]')
      || container.querySelector('.tgme_widget_message_date time')
      || container.querySelector('.time')
    const datetime = timeEl?.getAttribute('datetime') || ''
    const published = datetime ? new Date(datetime).getTime() : Date.now()

    const title = plainText ? plainText.split('\n')[0].slice(0, 200) : '(media)'
    items.push({
      title,
      link,
      description: plainText || '',
      image,
      published,
      sourceKey: dataPost.split('/')[0] || 'telegram',
    })
  }

  return items
}

async function scrapeTelegramPreview(username) {
  const url = `https://t.me/s/${username}`
  const html = await fetchHtmlViaProxy(url)
  if (!html) return []
  return parseMessages(html)
}

/* ── Fallback: RSS-Bridge / RSSHub ── */

const RSS_BRIDGE_BASES = [
  'https://rsshub.app',
  'https://rss-bridge.org/bridge01',
  'https://rss-bridge.bb8.fun',
  'https://rss-bridge.sans-nuage.fr',
]

async function fetchRssUrl(feedUrl, timeoutMs = 12000) {
  // Try direct first, then each CORS proxy
  const attempts = [
    feedUrl,
    ...CORS_PROXIES.map((fn) => fn(feedUrl)),
  ]
  for (const url of attempts) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeoutMs)
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timer)
      if (!res.ok) continue
      let text = await res.text()

      // Handle allorigins /get JSON wrapper
      if (url.includes('/get?url=')) {
        try {
          const json = JSON.parse(text)
          text = json.contents || text
        } catch {}
      }

      if (text && (text.includes('<item') || text.includes('<entry') || text.includes('<rss') || text.includes('<feed'))) {
        return text
      }
    } catch {}
  }
  return null
}

function parseFeedXml(xmlText) {
  if (!xmlText || typeof xmlText !== 'string') return []
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'text/xml')
  if (doc.querySelector('parsererror')) return []
  const nodes = doc.querySelectorAll('item').length
    ? doc.querySelectorAll('item')
    : doc.querySelectorAll('entry')
  const out = []
  const now = Date.now()
  for (const node of nodes) {
    const title = node.querySelector('title')?.textContent?.trim() || ''
    if (!title) continue
    let link = node.querySelector('link')?.textContent?.trim() || ''
    if (!link) link = node.querySelector('link')?.getAttribute('href') || ''
    const pubDate = node.querySelector('pubDate')?.textContent?.trim()
      || node.querySelector('updated')?.textContent?.trim()
    const descEl = node.querySelector('description') || node.querySelector('summary') || node.querySelector('content')
    const description = (descEl?.textContent?.trim() ?? '').replace(/<[^>]+>/g, '').trim()
    const published = pubDate ? new Date(pubDate).getTime() : now
    out.push({ title, link, description, published })
  }
  return out
}

async function fetchChannelViaRss(username) {
  for (const base of RSS_BRIDGE_BASES) {
    let feedUrl
    if (base.includes('rsshub')) {
      feedUrl = `${base}/telegram/channel/${username}`
    } else {
      feedUrl = `${base}/?action=display&bridge=Telegram&context=Channel&u=${username}&format=Rss`
    }
    const xml = await fetchRssUrl(feedUrl, 10000)
    if (!xml) continue
    const items = parseFeedXml(xml)
    if (items.length > 0) {
      return items.map((it) => ({ ...it, sourceKey: username }))
    }
  }
  return []
}

/* ── Combined: scrape first, RSS fallback ── */

async function fetchChannelFeed({ username, label }) {
  // Method 1: direct scrape
  try {
    const scraped = await scrapeTelegramPreview(username)
    if (scraped.length > 0) {
      return scraped.map((raw) => formatItem(raw, username, label))
    }
  } catch { /* fall through */ }

  // Method 2: RSS bridges
  try {
    const rssItems = await fetchChannelViaRss(username)
    if (rssItems.length > 0) {
      return rssItems.map((raw) => formatItem(raw, username, label))
    }
  } catch {}

  return []
}

export async function fetchCombinedTelegramFeed() {
  const results = await Promise.allSettled(
    TELEGRAM_CHANNELS.map((ch) => fetchChannelFeed(ch)),
  )
  const all = []
  results.forEach((r) => {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) all.push(...r.value)
  })
  all.sort((a, b) => (b.published || 0) - (a.published || 0))
  return all
}
