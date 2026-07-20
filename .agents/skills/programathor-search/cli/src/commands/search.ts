import { htmlFetch, parseJobCards, writeError, type JobCard } from "../helpers.js"

export interface SearchOpts {
  query?: string
  contract?: "CLT" | "PJ" | "Estágio"
  level?: "Júnior" | "Pleno" | "Sênior"
  remote?: boolean
  page: number
  limit?: number
  format: "json" | "table" | "plain"
}

function buildUrl(opts: SearchOpts): string {
  let path = "/jobs"
  
  if (opts.query) {
    const q = opts.query.toLowerCase().trim()
    // Map popular technologies to their Programathor path slug
    const techMap: Record<string, string> = {
      python: "python",
      react: "reactjs",
      node: "node-js",
      nodejs: "node-js",
      javascript: "javascript",
      js: "javascript",
      typescript: "typescript",
      ts: "typescript",
      php: "php",
      java: "java",
      csharp: "c",
      "c#": "c",
      ruby: "ruby",
      rails: "ruby-on-rails",
      flutter: "flutter",
      ios: "ios",
      android: "android",
      angular: "angular",
      vue: "vuejs",
      devops: "devops",
    }
    if (techMap[q]) {
      path = `/jobs-${techMap[q]}`
    }
  }

  // Handle pagination in the path: /jobs/page/2 or /jobs-python/page/2
  if (opts.page > 1) {
    path += `/page/${opts.page}`
  }

  const params = new URLSearchParams()
  if (opts.contract) params.set("contract_type", opts.contract)
  if (opts.level) params.set("expertise", opts.level)
  if (opts.remote) params.set("remoto", "true")

  const qs = params.toString()
  return `https://programathor.com.br${path}${qs ? "?" + qs : ""}`
}

function renderTable(cards: JobCard[]): string {
  if (cards.length === 0) return "No results."
  const rows = cards.map((c) => {
    const title = (c.title || "").slice(0, 42).padEnd(42)
    const company = (c.company || "—").slice(0, 26).padEnd(26)
    const loc = (c.location || "—").slice(0, 24).padEnd(24)
    const contract = (c.contract || "—").slice(0, 10).padEnd(10)
    return `${c.id.padEnd(11)} ${title} ${company} ${loc} ${contract}`
  })
  const header =
    "ID".padEnd(11) +
    " " +
    "TITLE".padEnd(42) +
    " " +
    "COMPANY".padEnd(26) +
    " " +
    "LOCATION".padEnd(24) +
    " CONTRACT"
  return [header, "-".repeat(header.length), ...rows].join("\n")
}

export async function runSearch(opts: SearchOpts): Promise<number> {
  try {
    const url = buildUrl(opts)
    const html = await htmlFetch(url)
    let cards = parseJobCards(html)

    // If query was specified but did not map to a technology path slug,
    // filter results client-side by title/tags matching the query words.
    if (opts.query) {
      const q = opts.query.toLowerCase().trim()
      const techMapKeys = ["python", "react", "node", "nodejs", "javascript", "js", "typescript", "ts", "php", "java", "csharp", "c#", "ruby", "rails", "flutter", "ios", "android", "angular", "vue", "devops"]
      if (!techMapKeys.includes(q)) {
        cards = cards.filter((c) => {
          const inTitle = (c.title || "").toLowerCase().includes(q)
          const inTags = (c.tags || []).some((t) => t.toLowerCase().includes(q))
          const inCompany = (c.company || "").toLowerCase().includes(q)
          return inTitle || inTags || inCompany
        })
      }
    }

    if (opts.limit && opts.limit > 0) {
      cards = cards.slice(0, opts.limit)
    }

    if (opts.format === "table") {
      process.stdout.write(renderTable(cards) + "\n")
    } else if (opts.format === "plain") {
      process.stdout.write(
        cards
          .map(
            (c) =>
              `${c.title}\n  ${c.company || "—"} · ${c.location || "—"} · ${c.contract || "—"}\n  id: ${c.id}\n  ${c.url}\n  Description: ${c.description}`,
          )
          .join("\n\n") + "\n",
      )
    } else {
      process.stdout.write(
        JSON.stringify(
          { meta: { count: cards.length, page: opts.page }, results: cards },
          null,
          2,
        ) + "\n",
      )
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "SEARCH_FAILED")
    return 1
  }
}
