export const BASE_URL = "https://www.apinfo.com"

export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

export async function htmlFetch(url: string, isPost = false, bodyParams?: Record<string, string>): Promise<string> {
  const maxRetries = 3
  let delay = 2000 // Start with a larger delay for APInfo to avoid rate limits
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    }

    let fetchOpts: RequestInit = {
      headers,
      redirect: "follow",
    }

    if (isPost && bodyParams) {
      headers["Content-Type"] = "application/x-www-form-urlencoded"
      fetchOpts.method = "POST"
      fetchOpts.body = new URLSearchParams(bodyParams).toString()
    }

    const response = await fetch(url, fetchOpts)

    if (response.status === 429 || response.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`)
      }
      const jitter = Math.floor(Math.random() * 1000)
      await new Promise((resolve) => setTimeout(resolve, delay + jitter))
      delay = Math.min(delay * 2, 8000)
      continue
    }

    if (response.status === 404) {
      throw new Error(`Job not found`)
    }

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`)
    }

    // Decode ISO-8859-1 response body correctly
    const arrayBuffer = await response.arrayBuffer()
    const decoder = new TextDecoder("iso-8859-1")
    return decoder.decode(arrayBuffer)
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

  // Check for rate limit error
  if (html.includes("limite de consultas") || html.includes("temporariamente esgotado") || html.includes("Limite Excedido")) {
    throw new Error("APInfo rate limit exceeded. Please try again later.")
  }

  // Split by the modern card block container class
  const blocks = html.split(/<div class="box-vagas[^"]*">/gi)
  
  for (let i = 1; i < blocks.length; i++) {
    const blockHtml = blocks[i].split(/<\/div>\s*<\/div>/)[0] // split at outer div close

    // 1. Title/Cargo
    const titleMatch = blockHtml.match(/<div class="cargo[^"]*">([\s\S]*?)<\/div>/i)
    if (!titleMatch) continue
    const title = decodeHtmlEntities(stripTags(titleMatch[1]))

    // 2. Info Date (Location and Date)
    const infoDataMatch = blockHtml.match(/<div class="info-data">([\s\S]*?)<\/div>/i)
    let location = "Brasil"
    let date = new Date().toISOString().slice(0, 10)
    if (infoDataMatch) {
      const infoText = decodeHtmlEntities(stripTags(infoDataMatch[1]))
      const parts = infoText.split("-")
      if (parts.length >= 2) {
        date = parts[parts.length - 1].trim()
        // Format date to standard format if it matches DD/MM/YY
        const dateMatch = date.match(/(\d{2})\/(\d{2})\/(\d{2})/)
        if (dateMatch) {
          date = `20${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`
        }
        location = parts.slice(0, parts.length - 1).join("-").trim()
      } else {
        location = infoText
      }
    }

    // 3. Company
    const companyMatch = blockHtml.match(/Empresa \.{3,}:<\/strong>\s*([^<BR\n]+)/i) || 
                         blockHtml.match(/Empresa:<\/strong>\s*([^<BR\n]+)/i)
    const company = companyMatch ? decodeHtmlEntities(stripTags(companyMatch[1])) : "Confidencial"

    // 4. Code / ID
    const codeMatch = blockHtml.match(/C.digo \.{3,}:<\/strong>\s*([^<BR\n]+)/i) ||
                      blockHtml.match(/C.digo:<\/strong>\s*([^<BR\n]+)/i)
    const id = codeMatch ? decodeHtmlEntities(stripTags(codeMatch[1])) : String(Math.floor(Math.random() * 100000))

    // 5. Description
    const textMatch = blockHtml.match(/<p style="white-space:pre-wrap;[^"]*">([\s\S]*?)<\/p>/i) ||
                      blockHtml.match(/<div class="texto">([\s\S]*?)<\/div>/i)
    const cleanDesc = textMatch ? stripHtml(textMatch[1]) : ""

    // 6. Apply link (enviecv.cfm)
    const applyMatch = blockHtml.match(/href="([^"]*enviecv\.cfm\?codvaga=\d+[^"]*)"/i)
    const url = applyMatch ? decodeHtmlEntities(applyMatch[1]) : `${BASE_URL}/apinfo/inc/enviecv.cfm?codvaga=${id}`

    results.push({
      id,
      title,
      company,
      companyUrl: null,
      location,
      date,
      url,
      description: cleanDesc,
    })
  }

  // Fallback to legacy parser / global link matching if no blocks found
  if (results.length === 0) {
    const globalMatches = [...html.matchAll(/<a[^>]+href="[^"]*ofedisp\.cfm\?ofession=(\d+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    for (const match of globalMatches) {
      const id = match[1]
      const title = decodeHtmlEntities(stripTags(match[2]))
      results.push({
        id,
        title,
        company: "Confidencial",
        companyUrl: null,
        location: "Brasil",
        date: new Date().toISOString().slice(0, 10),
        url: `${BASE_URL}/apinfo/inc/enviecv.cfm?codvaga=${id}`,
        description: `APInfo ID: ${id}`
      })
    }
  }

  return results
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
}
