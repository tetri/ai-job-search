---
name: inhire-search
description: Search and view jobs from the Inhire recruitment platform (ATS) used by many companies in Brazil.
version: 1.0.0
context: fork
allowed-tools:
  - Bash(bun run .agents/skills/inhire-search/cli/src/cli.ts *)
---

# /inhire-search - Search and view jobs on the Inhire platform

Use this skill to search for open job listings on Inhire's decentralized applicant tracking system (ATS) or to extract full descriptions for a specific vacancy URL.

## Command Reference

### Search
Searches public jobs page for a specific company (tenant) on Inhire. Since Inhire is decentralized, the `--company` flag is required to specify which organization to query.

```bash
bun run .agents/skills/inhire-search/cli/src/cli.ts search --company <subdomain> [flags]
```

**Flags:**
*   `--company, -c <subdomain>`: The subdomain of the company career portal (e.g. `idwall`, `nomad`, `amaggi`). **Required**.
*   `--query, -q <text>`: Keywords to filter jobs (job title/department) client-side.
*   `--limit, -n <number>`: Limit the number of results printed.
*   `--format <json|table|plain>`: Output format (default: `json`).

### Detail
Fetches and structures the full job description, contract type, workplace type, and application requirements from a specific job URL or ID.

```bash
bun run .agents/skills/inhire-search/cli/src/cli.ts detail <url-or-id> [--company <subdomain>] [flags]
```

**Arguments:**
*   `<url-or-id>`: Either a full Inhire job URL (e.g., `https://idwall.inhire.app/vagas/a4b4b23d-fca4-47e0-980e-8c094ac608e9`) or a raw job UUID. If a UUID is passed, `--company` is required.

**Flags:**
*   `--company, -c <subdomain>`: Subdomain of the career portal (only needed if a raw UUID is passed).
*   `--format <json|plain>`: Output format (default: `json`).

## Examples

```bash
# Search for Java jobs at idwall
bun run .agents/skills/inhire-search/cli/src/cli.ts search -c idwall -q "Java" --format table

# Get details of a job using its public URL
bun run .agents/skills/inhire-search/cli/src/cli.ts detail https://idwall.inhire.app/vagas/a4b4b23d-fca4-47e0-980e-8c094ac608e9 --format plain
```
