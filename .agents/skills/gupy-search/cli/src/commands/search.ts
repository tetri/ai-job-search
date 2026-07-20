import { apiFetch, writeError, type JobCard } from "../helpers.js"

export interface SearchOpts {
  query: string
  page: number
  limit?: number
  remote?: boolean
  format: "json" | "table" | "plain"
}

interface GupyJob {
  id: number
  name: string
  description: string
  careerPageName: string
  careerPageUrl: string
  city: string
  state: string
  publishedDate: string
  jobUrl: string
  workplaceType: string
}

interface GupyResponse {
  data: GupyJob[]
  pagination: {
    total: number
    limit: number
    offset: number
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
}

function renderTable(cards: JobCard[]): string {
  if (cards.length === 0) return "No results."
  const rows = cards.map((c) => {
    const title = (c.title || "").slice(0, 42).padEnd(42)
    const company = (c.company || "—").slice(0, 26).padEnd(26)
    const loc = (c.location || "—").slice(0, 24).padEnd(24)
    const date = c.date ? c.date.slice(0, 10) : "—"
    return `${c.id.padEnd(11)} ${title} ${company} ${loc} ${date}`
  })
  const header =
    "ID".padEnd(11) +
    " " +
    "TITLE".padEnd(42) +
    " " +
    "COMPANY".padEnd(26) +
    " " +
    "LOCATION".padEnd(24) +
    " DATE"
  return [header, "-".repeat(header.length), ...rows].join("\n")
}

export async function runSearch(opts: SearchOpts): Promise<number> {
  try {
    const limit = opts.limit || 10
    const offset = (opts.page - 1) * limit

    const params: Record<string, string> = {
      jobName: opts.query,
      limit: String(limit),
      offset: String(offset),
    }

    if (opts.remote) {
      params.workplaceTypes = "remote"
    }

    // Gupy search uses /api/v1/jobs
    const response = await apiFetch<GupyResponse>("/api/v1/jobs", params)

    const rawJobs = response.data || []
    const cards: JobCard[] = rawJobs.map((job) => {
      const cleanDesc = job.description ? stripHtml(job.description) : ""
      const location = [job.city, job.state].filter(Boolean).join(" - ") || "Remoto"
      return {
        id: String(job.id),
        title: job.name,
        company: job.careerPageName,
        companyUrl: job.careerPageUrl,
        location: location,
        date: job.publishedDate,
        url: job.jobUrl,
        description: cleanDesc.substring(0, 300),
      }
    })

    if (opts.format === "table") {
      process.stdout.write(renderTable(cards) + "\n")
    } else if (opts.format === "plain") {
      process.stdout.write(
        cards
          .map(
            (c) =>
              `${c.title}\n  ${c.company || "—"} · ${c.location || "—"} · ${c.date ? c.date.slice(0, 10) : "—"}\n  id: ${c.id}\n  ${c.url}\n  Description: ${c.description}`,
          )
          .join("\n\n") + "\n",
      )
    } else {
      process.stdout.write(
        JSON.stringify(
          { meta: { count: cards.length, total: response.pagination?.total || cards.length, page: opts.page }, results: cards },
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
