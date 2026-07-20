---
name: gupy-search
version: 1.0.0
description: >
  Search live job listings from Gupy (portal.gupy.io) in Brazil. Gupy is the #1
  careers portal in Brazil. Use this skill to search for tech, design, marketing,
  or corporate roles. No authentication required.
  Trigger phrases include: gupy, portal gupy, gupy.io, vagas gupy, emprego gupy,
  buscar vagas gupy, procurar emprego gupy, vagas brasil gupy, gupy jobs, gupy vagas.
context: fork
allowed-tools: Bash(bun run skills/gupy-search/cli/src/cli.ts *)
---

# Gupy Search Skill

Search live job listings from Gupy (portal.gupy.io), the leading Applicant Tracking System (ATS) in Brazil. 

## When to use this skill

Invoke this skill when the user wants to:
- Search for job openings on Gupy by keyword, role, or technology
- Filter jobs by remote/hybrid/on-site workplace type
- Get details of a specific Gupy job posting

## Commands

### Search job listings

```bash
bun run skills/gupy-search/cli/src/cli.ts search [flags]
```

Key flags:
- `--query <text>` / `-q <text>` — keyword search (role, skill, technology). **Required**.
- `--remote` — filter for remote jobs only
- `--page <n>` / `-p <n>` — page number (1-indexed, default: 1)
- `--limit <n>` / `-n <n>` — cap total results output
- `--format json|table|plain` — default `json`

### Fetch full job detail

```bash
bun run skills/gupy-search/cli/src/cli.ts detail <url> [--format json|plain]
```

Returns the full job description, company name, requirements, benefits, and apply link.

## Usage examples

```bash
# Search for React Developer jobs in Brazil
bun run skills/gupy-search/cli/src/cli.ts search -q "React" --format table

# Search for remote Node.js jobs
bun run skills/gupy-search/cli/src/cli.ts search -q "Node.js" --remote --format table

# Get details of a specific Gupy job
bun run skills/gupy-search/cli/src/cli.ts detail "https://luminiitsolutions.gupy.io/job/eyJqb2JJZCI6MTE1ODUxNjAsInNvdXJjZSI6Imd1cHlfcG9ydGFsIn0=" --format plain
```
