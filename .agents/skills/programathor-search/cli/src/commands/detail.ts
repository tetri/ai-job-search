import { htmlFetch, writeError, BASE_URL } from "../helpers.js"

export interface DetailOpts {
  id: string // full URL or numeric ID
  format: "json" | "plain"
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim()
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  try {
    let url = opts.id
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      // It's a numeric ID
      url = `${BASE_URL}/jobs/${opts.id}`
    }

    const html = await htmlFetch(url)

    // Extract title
    const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title>([\s\S]*?)<\/title>/i)
    const title = titleMatch ? stripHtml(titleMatch[1]).split(" | ")[0] : "—"

    // Extract job details block (usually inside class line-height-2-4)
    const descMatch = html.match(/<div class="line-height-2-4">([\s\S]*?)<\/div>/i)
    if (!descMatch) {
      throw new Error("Could not extract job description from Programathor page")
    }

    const cleanDesc = stripHtml(descMatch[1])

    if (opts.format === "plain") {
      const output = [
        `Title: ${title}`,
        `URL: ${url}`,
        `\n--- DESCRIPTION ---\n`,
        cleanDesc
      ].join("\n")
      process.stdout.write(output + "\n")
    } else {
      process.stdout.write(
        JSON.stringify(
          {
            id: opts.id,
            title,
            url,
            description: cleanDesc,
          },
          null,
          2,
        ) + "\n",
      )
    }

    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "DETAIL_FAILED")
    return 1
  }
}
