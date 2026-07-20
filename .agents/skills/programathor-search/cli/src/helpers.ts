export const BASE_URL = "https://programathor.com.br"

export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

export async function htmlFetch(url: string): Promise<string> {
  const maxRetries = 6
  let delay = 500
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      redirect: "follow",
    })
    if (response.status === 429 || response.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`)
      }
      const jitter = Math.floor(Math.random() * 500)
      await new Promise((resolve) => setTimeout(resolve, delay + jitter))
      delay = Math.min(delay * 2, 5000)
      continue
    }
    if (response.status === 404) {
      throw new Error(`Job not found`)
    }
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`)
    }
    return response.text()
  }
  throw new Error("Request failed after max retries")
}

export interface JobCard {
  id: string
  title: string
  company: string | null
  companyUrl: string | null
  location: string | null
  date: string | null
  url: string
  description: string | null
  level?: string | null
  contract?: string | null
  tags?: string[]
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&nbsp;/g, " ")
    .trim()
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim()
}

export function parseJobCards(html: string): JobCard[] {
  const results: JobCard[] = []

  // Split html into individual card blocks, avoiding matching cell-list-content
  const cardBlocks = html.split(/<div class="cell-list(?!-content)[^"]*">/)
  
  // The first chunk is everything before the first card, skip it
  for (let i = 1; i < cardBlocks.length; i++) {
    const cardHtml = cardBlocks[i].split(/<\/a>\s*<\/div>/)[0] // only parse within the card link

    // 1. Link / ID
    const hrefMatch = cardHtml.match(/href="\/jobs\/(\d+-[^"]+)"/i)
    if (!hrefMatch) continue
    const fullSlug = hrefMatch[1] // e.g. "33645-scrum-master"
    const idMatch = fullSlug.match(/^(\d+)/)
    if (!idMatch) continue
    const id = idMatch[1]
    const url = `${BASE_URL}/jobs/${fullSlug}`

    // 2. Title
    const titleMatch = cardHtml.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)
    if (!titleMatch) continue
    const title = decodeHtmlEntities(stripTags(titleMatch[1]))

    // 3. Company
    const companyMatch = cardHtml.match(/<i class=['"]fa fa-briefcase['"]><\/i>([\s\S]*?)<\/span>/i)
    const company = companyMatch ? decodeHtmlEntities(stripTags(companyMatch[1])) : null

    // 4. Location
    const locationMatch = cardHtml.match(/<i class=['"]fas fa-map-marker-alt['"]><\/i>([\s\S]*?)<\/span>/i)
    const location = locationMatch ? decodeHtmlEntities(stripTags(locationMatch[1])) : null

    // 5. Level
    const levelMatch = cardHtml.match(/<i class=['"]far fa-chart-bar['"]><\/i>([\s\S]*?)<\/span>/i)
    const level = levelMatch ? decodeHtmlEntities(stripTags(levelMatch[1])) : null

    // 6. Contract
    const contractMatch = cardHtml.match(/<i class=['"]far fa-file-alt['"]><\/i>([\s\S]*?)<\/span>/i)
    const contract = contractMatch ? decodeHtmlEntities(stripTags(contractMatch[1])) : null

    // 7. Tags
    const tagsMatches = [...cardHtml.matchAll(/<span class='tag-list[^']*'>([\s\S]*?)<\/span>/gi)]
    const tags = tagsMatches.map(m => decodeHtmlEntities(stripTags(m[1])))

    // Description constructor (Programathor doesn't show descriptions on listings, only details)
    const description = `Level: ${level || "—"} | Contract: ${contract || "—"} | Tags: ${tags.join(", ") || "—"}`

    results.push({
      id,
      title,
      company,
      companyUrl: null, // Programathor listings don't link company separately in this view easily
      location,
      date: new Date().toISOString().slice(0, 10), // Programathor does not expose exact post dates in search cards
      url,
      description,
      level,
      contract,
      tags
    })
  }

  return results
}
