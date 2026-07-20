export const API_BASE = "https://api.inhire.app";

export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n");
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function apiFetch<T>(path: string, tenant: string): Promise<T | null> {
  const url = `${API_BASE}${path}`;
  const maxRetries = 6;
  let delay = 500;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, {
      headers: {
        "User-Agent": UA,
        "Accept": "application/json",
        "X-Tenant": tenant,
      },
      redirect: "follow",
    });
    if (response.status === 429 || response.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }
      const jitter = Math.floor(Math.random() * 500);
      await new Promise((r) => setTimeout(r, delay + jitter));
      delay = Math.min(delay * 2, 8000);
      continue;
    }
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  }
  throw new Error("Request failed after max retries");
}

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&#[xX]([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
}

export function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function clean(html: string): string {
  return decodeHtmlEntities(stripTags(html));
}

export interface InhireJobCard {
  id: string;
  title: string;
  company: string;
  location: string | null;
  workplaceType: string | null;
  url: string;
  date: string | null;
}

export interface InhireJobDetail extends InhireJobCard {
  description: string | null;
  contractType: string | null;
}
