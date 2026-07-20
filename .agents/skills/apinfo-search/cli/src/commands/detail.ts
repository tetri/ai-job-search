import { htmlFetch, writeError, BASE_URL } from "../helpers.js"

export interface DetailOpts {
  id: string // full URL or numeric ID
  format: "json" | "plain"
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/td>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim()
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  try {
    let url = opts.id
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `${BASE_URL}/apinfo/inc/ofedisp.cfm?ofession=${opts.id}`
    }

    const html = await htmlFetch(url)

    // Check for rate limit error
    if (html.includes("limite de consultas") || html.includes("temporariamente esgotado") || html.includes("Limite Excedido")) {
      throw new Error("APInfo rate limit exceeded. Please try again later.")
    }

    // Extract title
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i)
    let title = titleMatch ? stripHtml(titleMatch[1]).replace("APinfo - ", "") : "—"

    // Extract the main container block (inside class container m-t)
    const contentMatch = html.match(/<div class="container m-t">([\s\S]*?)<\/div>\s*(?:<!--|\s*<\/body>)/i) || 
                         html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
                         
    if (!contentMatch) {
      throw new Error("Could not extract job detail content from APInfo page")
    }

    const cleanContent = stripHtml(contentMatch[1])

    if (opts.format === "plain") {
      const output = [
        `Title: ${title}`,
        `URL: ${url}`,
        `\n--- DESCRIPTION ---\n`,
        cleanContent
      ].join("\n")
      process.stdout.write(output + "\n")
    } else {
      process.stdout.write(
        JSON.stringify(
          {
            id: opts.id,
            title,
            url,
            description: cleanContent,
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
