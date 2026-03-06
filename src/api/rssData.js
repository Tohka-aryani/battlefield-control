/**
 * Fetch and parse RSS feeds for The Wall. Uses CORS proxy for cross-origin feeds.
 */

const PROXY_RAW = 'https://api.allorigins.win/raw?url='
const PROXY_GET = 'https://api.allorigins.win/get?url='
const PROXY_ALT = 'https://corsproxy.io/?'

async function fetchWithProxy(feedUrl) {
  const encoded = encodeURIComponent(feedUrl)
  const devProxy = typeof import.meta !== 'undefined' && import.meta.env?.DEV
    ? '/api/rss-proxy?url='
    : null
  const toTry = [
    devProxy ? () => fetch(devProxy + encoded).then((r) => (r.ok ? r.text() : Promise.reject(new Error(r.statusText)))) : null,
    () => fetch(PROXY_RAW + encoded).then((r) => (r.ok ? r.text() : Promise.reject(new Error(r.statusText)))),
    () => fetch(PROXY_GET + encoded).then(async (r) => {
      if (!r.ok) throw new Error(r.statusText)
      const data = await r.json()
      return data.contents || ''
    }),
    () => fetch(PROXY_ALT + feedUrl).then((r) => (r.ok ? r.text() : Promise.reject(new Error(r.statusText)))),
  ].filter(Boolean)
  for (const fn of toTry) {
    try {
      const text = await fn()
      if (text && text.trim().length > 0) return text
    } catch (_) {}
  }
  throw new Error('Could not fetch feed')
}

function parseRssXml(xmlText, sourceKey) {
  if (!xmlText || typeof xmlText !== 'string') return []
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'text/xml')
  const parseError = doc.querySelector('parsererror')
  if (parseError) return []
  const itemList = doc.querySelectorAll('item')
  const entryList = doc.querySelectorAll('entry')
  const items = itemList.length ? itemList : entryList
  const out = []
  const now = Date.now()
  for (const item of items) {
    const title = item.querySelector('title')?.textContent?.trim() || ''
    if (!title) continue
    let link = item.querySelector('link')?.textContent?.trim() || ''
    if (!link && item.querySelector('link')?.getAttribute('href')) link = item.querySelector('link').getAttribute('href')
    const pubDate = item.querySelector('pubDate')?.textContent?.trim() || item.querySelector('updated')?.textContent?.trim()
    const descEl = item.querySelector('description') || item.querySelector('summary') || item.querySelector('content')
    const description = descEl?.textContent?.trim()?.replace(/<[^>]+>/g, '').slice(0, 200) || ''
    let image = null
    const media = item.querySelector('media\\:content, content, enclosure')
    if (media) {
      image = media.getAttribute('url') || media.getAttribute('href')
    }
    if (!image && descEl) {
      const imgMatch = descEl.textContent?.match(/<img[^>]+src=["']([^"']+)["']/i)
      if (imgMatch) image = imgMatch[1]
    }
    const published = pubDate ? new Date(pubDate).getTime() : now
    out.push({
      id: `${sourceKey}-${link}-${published}`.replace(/[^a-zA-Z0-9-]/g, '_').slice(0, 120),
      title,
      link,
      description,
      image,
      sourceKey,
      published,
      pubDate,
    })
  }
  return out
}

function getTimeAgo(ms) {
  const sec = Math.floor((Date.now() - ms) / 1000)
  if (sec < 60) return 'Just now'
  if (sec < 3600) return `${Math.floor(sec / 60)}M AGO`
  if (sec < 86400) return `${Math.floor(sec / 3600)}H AGO`
  return `${Math.floor(sec / 86400)}D AGO`
}

export function timeAgo(ms) {
  return getTimeAgo(ms)
}

/**
 * Fetch one RSS feed and return items.
 */
export async function fetchRssFeed(feedUrl, sourceKey) {
  const text = await fetchWithProxy(feedUrl)
  return parseRssXml(text, sourceKey)
}

/**
 * Fetch all feeds and return merged items sorted by date (newest first).
 */
export async function fetchAllFeeds(feedList) {
  const results = await Promise.allSettled(
    feedList.map(({ url, sourceKey }) => fetchRssFeed(url, sourceKey))
  )
  const all = []
  results.forEach((r) => {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) all.push(...r.value)
  })
  all.sort((a, b) => b.published - a.published)
  return all.map((item) => ({ ...item, timeAgo: getTimeAgo(item.published) }))
}
