/**
 * Combined Twitter/X feed: fetch user timelines via Nitter RSS, merge and sort.
 * Fallback: returns [] so UI can show embedded timelines instead.
 */

import { fetchRssFeed } from './rssData'

const NITTER_INSTANCES = [
  'https://nitter.net',
  'https://nitter.poast.org',
]

function getTimeAgo(ms) {
  const sec = Math.floor((Date.now() - ms) / 1000)
  if (sec < 60) return 'now'
  if (sec < 3600) return `${Math.floor(sec / 60)}m`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`
  return `${Math.floor(sec / 86400)}d`
}

async function fetchUserFeed(username) {
  for (const base of NITTER_INSTANCES) {
    try {
      const url = `${base}/${username}/rss`
      const items = await fetchRssFeed(url, username)
      if (items && items.length > 0) return items
    } catch (_) {}
  }
  return []
}

/**
 * Fetch and merge tweets from multiple Twitter usernames into one chronological feed.
 * Returns array of { id, username, title, link, description, image, published, timeAgo }.
 */
export async function fetchCombinedSocmedFeed(usernames) {
  const results = await Promise.allSettled(
    usernames.map((u) => fetchUserFeed(typeof u === 'string' ? u : u.username))
  )
  const all = []
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      const username = typeof usernames[i] === 'string' ? usernames[i] : usernames[i].username
      r.value.forEach((item) => {
        all.push({
          ...item,
          username,
          id: `${username}-${(item.link || item.published || '').toString().replace(/[^a-zA-Z0-9-]/g, '_').slice(0, 80)}`,
        })
      })
    }
  })
  all.sort((a, b) => (b.published || 0) - (a.published || 0))
  return all.map((item) => ({ ...item, timeAgo: getTimeAgo(item.published) }))
}
