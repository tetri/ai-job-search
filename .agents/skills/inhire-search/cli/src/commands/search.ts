import { apiFetch, type InhireJobCard, writeError } from "../helpers.ts";

export interface SearchOpts {
  company: string;
  query?: string;
  limit?: number;
  format: "json" | "table" | "plain";
}

interface JobsPageResponse {
  tenantName?: string;
  jobsPage?: Array<{
    jobId: string;
    displayName: string;
    status: string;
    workplaceType?: string;
    location?: string;
  }>;
}

function renderTable(cards: InhireJobCard[]): string {
  if (cards.length === 0) return "No results.";
  const rows = cards.map((c) => {
    const title = (c.title || "").slice(0, 42).padEnd(42);
    const company = (c.company || "—").slice(0, 20).padEnd(20);
    const loc = `${c.workplaceType || "—"} (${c.location || "—"})`.slice(0, 24).padEnd(24);
    return `${c.id.slice(0, 8).padEnd(9)} ${title} ${company} ${loc}`;
  });
  const header =
    "ID".padEnd(9) +
    " " +
    "TITLE".padEnd(42) +
    " " +
    "COMPANY".padEnd(20) +
    " " +
    "LOCATION";
  return [header, "-".repeat(header.length + 10), ...rows].join("\n");
}

export async function runSearch(opts: SearchOpts): Promise<number> {
  try {
    const response = await apiFetch<JobsPageResponse>("/job-posts/public/pages", opts.company);
    if (!response || !response.jobsPage) {
      writeError(`No jobs or company found for tenant "${opts.company}"`, "NOT_FOUND");
      return 1;
    }

    let cards: InhireJobCard[] = response.jobsPage.map((j) => ({
      id: j.jobId,
      title: j.displayName,
      company: response.tenantName || opts.company,
      location: j.location || null,
      workplaceType: j.workplaceType || null,
      url: `https://${opts.company}.inhire.app/vagas/${j.jobId}`,
      date: null,
    }));

    if (opts.query) {
      const q = opts.query.toLowerCase();
      cards = cards.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.location && c.location.toLowerCase().includes(q))
      );
    }

    if (opts.limit && opts.limit > 0) {
      cards = cards.slice(0, opts.limit);
    }

    if (opts.format === "table") {
      process.stdout.write(renderTable(cards) + "\n");
    } else if (opts.format === "plain") {
      process.stdout.write(
        cards
          .map(
            (c) =>
              `${c.title}\n  ${c.company} · ${c.workplaceType || "—"} (${c.location || "—"})\n  id: ${c.id}\n  ${c.url}`
          )
          .join("\n\n") + "\n"
      );
    } else {
      process.stdout.write(
        JSON.stringify({ meta: { count: cards.length, company: opts.company }, results: cards }, null, 2) + "\n"
      );
    }
    return 0;
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "SEARCH_FAILED");
    return 1;
  }
}
