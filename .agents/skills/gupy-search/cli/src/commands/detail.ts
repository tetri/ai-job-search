import { htmlFetch, writeError } from "../helpers.js"

export interface DetailOpts {
  id: string // This will be the full Gupy URL (or ID)
  format: "json" | "plain"
}

interface NEXTData {
  props?: {
    pageProps?: {
      job?: {
        id: number
        name: string
        description: string
        careerPage?: {
          name: string
        }
        publishedAt?: string
        jobUrl: string
        workplaceType: string
        addressCity: string
        addressState: string
        jobType: string
        expiresAt?: string
      }
    }
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  try {
    let url = opts.id
    // If the input is not a URL, we cannot resolve the Gupy company subdomain easily.
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      // Throw error indicating a full Gupy URL is required
      throw new Error("A full Gupy URL is required (e.g., https://company.gupy.io/job/hash)")
    }

    const html = await htmlFetch(url)
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)

    if (!match) {
      throw new Error("Failed to extract page data from Gupy job page")
    }

    const data: NEXTData = JSON.parse(match[1])
    const job = data.props?.pageProps?.job

    if (!job) {
      throw new Error("Job details not found in Gupy page data")
    }

    if (opts.format === "plain") {
      const cleanDesc = stripHtml(job.description || "")
      const location = [job.addressCity, job.addressState].filter(Boolean).join(" - ") || "Remoto"
      const output = [
        `Title: ${job.name}`,
        `Company: ${job.careerPage?.name || "—"}`,
        `Location: ${location} (${job.workplaceType})`,
        `Type: ${job.jobType || "—"}`,
        `Published: ${job.publishedAt ? job.publishedAt.slice(0, 10) : "—"}`,
        `Deadline: ${job.expiresAt ? job.expiresAt.slice(0, 10) : "—"}`,
        `URL: ${job.jobUrl || url}`,
        `\n--- DESCRIPTION ---\n`,
        cleanDesc
      ].join("\n")

      process.stdout.write(output + "\n")
    } else {
      process.stdout.write(JSON.stringify(job, null, 2) + "\n")
    }

    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "DETAIL_FAILED")
    return 1
  }
}
