import { apiFetch, type InhireJobDetail, clean, writeError } from "../helpers.ts";

export interface DetailOpts {
  id: string; // URL or UUID
  company?: string;
  format: "json" | "plain";
}

interface InhireJobDetailResponse {
  tenantName?: string;
  jobId: string;
  displayName: string;
  description: string;
  contractType?: string[];
  workplaceType?: string;
  location?: string;
}

export function parseInhireUrl(urlStr: string): { company: string; jobId: string } | null {
  try {
    const url = new URL(urlStr);
    const hostParts = url.hostname.split(".");
    if (hostParts.length < 3 || !url.hostname.includes("inhire.app")) {
      return null;
    }
    const company = hostParts[0];
    
    // UUID regex match
    const uuidMatch = url.pathname.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (!uuidMatch) return null;
    
    return { company, jobId: uuidMatch[1] };
  } catch {
    return null;
  }
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  let company = opts.company;
  let jobId = opts.id;

  if (opts.id.startsWith("http://") || opts.id.startsWith("https://")) {
    const parsed = parseInhireUrl(opts.id);
    if (!parsed) {
      writeError(`Could not parse Inhire vacancy URL: "${opts.id}"`, "BAD_URL");
      return 1;
    }
    company = parsed.company;
    jobId = parsed.jobId;
  }

  if (!company) {
    writeError("The company subdomain (X-Tenant) is required. Provide a full URL or specify --company flag.", "MISSING_COMPANY");
    return 1;
  }

  // Verify it's a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(jobId)) {
    writeError(`Invalid Job ID: "${jobId}". Must be a valid UUID.`, "INVALID_ID");
    return 1;
  }

  try {
    const data = await apiFetch<InhireJobDetailResponse>(`/job-posts/public/pages/${jobId}`, company);
    if (!data) {
      writeError("Job not found", "NOT_FOUND");
      return 1;
    }

    const job: InhireJobDetail = {
      id: data.jobId,
      title: data.displayName,
      company: data.tenantName || company,
      location: data.location || null,
      workplaceType: data.workplaceType || null,
      url: `https://${company}.inhire.app/vagas/${data.jobId}`,
      date: null,
      description: data.description ? clean(data.description) : null,
      contractType: data.contractType && data.contractType.length > 0 ? data.contractType.join(", ") : null,
    };

    if (opts.format === "plain") {
      const lines = [
        job.title,
        `${job.company} · ${job.workplaceType || "—"} (${job.location || "—"})`,
        job.contractType ? `Contract: ${job.contractType}` : "",
        "",
        job.description || "(no description)",
        "",
        `URL: ${job.url}`,
      ].filter((l) => l !== "");
      process.stdout.write(lines.join("\n") + "\n");
    } else {
      process.stdout.write(JSON.stringify(job, null, 2) + "\n");
    }
    return 0;
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "DETAIL_FAILED");
    return 1;
  }
}
