/**
 * DEFCON status and alerts. Uses live data from https://www.defconlevel.com/ when possible.
 * Source: defconlevel.com (OSINT estimate). Not official DoD data.
 */

const DEFCON_LEVELS = [
  { level: 1, name: 'COCKED PISTOL', color: '#dc2626', description: 'Nuclear war is imminent or has already begun. Maximum readiness.' },
  { level: 2, name: 'FAST PACE', color: '#ea580c', description: 'Armed Forces ready to deploy and engage in 6 hours.' },
  { level: 3, name: 'ROUND HOUSE', color: '#65a30d', description: 'Air Force ready to mobilize in 15 minutes. Increased readiness.' },
  { level: 4, name: 'DOUBLE TAKE', color: '#65a30d', description: 'Above normal readiness. Increased intelligence watch.' },
  { level: 5, name: 'FADE OUT', color: '#65a30d', description: 'Lowest state of readiness. Normal peacetime military posture.' },
]

const PROXY = 'https://api.allorigins.win/raw?url='
const CURRENT_URL = 'https://www.defconlevel.com/current-level'
const ALERTS_URL = 'https://www.defconlevel.com/alerts'

const DEFAULT_LEVEL = 3
const DEFAULT_UPDATED = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })

function parseCurrentLevelFromHtml(html) {
  if (!html || typeof html !== 'string') return null
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const body = doc.body?.innerText || ''
  const levelMatch = body.match(/\bDEFCON\s*(\d)\b/i) || doc.body?.innerHTML?.match(/defcon\s*(\d)/i)
  const num = levelMatch ? parseInt(levelMatch[1], 10) : null
  if (num >= 1 && num <= 5) return num
  const h1 = doc.querySelector('h1')
  if (h1) {
    const h1Match = h1.textContent?.match(/(\d)/)
    if (h1Match) return parseInt(h1Match[1], 10)
  }
  return null
}

function parseAlertsFromHtml(html) {
  if (!html || typeof html !== 'string') return []
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const items = []
  const articles = doc.querySelectorAll('article, .alert, .post, [class*="alert"], [class*="item"]')
  articles.forEach((el) => {
    const link = el.querySelector('a[href]')
    const titleEl = el.querySelector('h1, h2, h3, .title, [class*="title"]')
    const timeEl = el.querySelector('time, .date, [class*="date"]')
    const descEl = el.querySelector('p, .description, [class*="desc"]')
    const title = titleEl?.textContent?.trim() || link?.textContent?.trim() || ''
    const href = link?.getAttribute('href') || ''
    const time = timeEl?.textContent?.trim() || ''
    const description = descEl?.textContent?.trim() || ''
    if (title) {
      items.push({
        id: href || title.slice(0, 50),
        title,
        link: href.startsWith('http') ? href : `https://www.defconlevel.com${href.startsWith('/') ? '' : '/'}${href}`,
        time,
        timeAgo: '',
        description,
      })
    }
  })
  if (items.length > 0) return items.slice(0, 50)
  const links = doc.querySelectorAll('a[href*="defconlevel"]')
  links.forEach((a) => {
    const title = a.textContent?.trim()
    if (title && title.length > 20 && !items.some((i) => i.title === title)) {
      items.push({
        id: a.href + title.slice(0, 30),
        title,
        link: a.href,
        time: '',
        timeAgo: '',
        description: '',
      })
    }
  })
  return items.slice(0, 50)
}

export function getDefconLevels() {
  return DEFCON_LEVELS
}

export async function fetchDefconStatus() {
  const levelInfo = DEFCON_LEVELS.find((l) => l.level === DEFAULT_LEVEL) || DEFCON_LEVELS[2]
  let level = DEFAULT_LEVEL
  let updated = DEFAULT_UPDATED()

  try {
    const url = PROXY + encodeURIComponent(CURRENT_URL)
    const res = await fetch(url)
    if (res.ok) {
      const html = await res.text()
      const parsed = parseCurrentLevelFromHtml(html)
      if (parsed != null) level = parsed
      const found = DEFCON_LEVELS.find((l) => l.level === level)
      if (found) return { level, ...found, updated }
    }
  } catch (_) {}

  return { level, ...levelInfo, updated }
}

export async function fetchDefconAlerts() {
  try {
    const url = PROXY + encodeURIComponent(ALERTS_URL)
    const res = await fetch(url)
    if (res.ok) {
      const html = await res.text()
      const items = parseAlertsFromHtml(html)
      if (items.length > 0) {
        return items.map((a, i) => ({
          ...a,
          timeAgo: a.timeAgo || (i < 3 ? `${i + 1}d ago` : ''),
        }))
      }
    }
  } catch (_) {}

  return []
}
