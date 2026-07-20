---
name: apinfo-search
version: 1.0.0
description: >
  Search live IT job listings from APInfo (apinfo.com) in Brazil.
  APInfo is one of the oldest and most traditional IT job boards in Brazil.
  Aggressive rate limiting applies; keep search frequency low.
  Trigger phrases include: apinfo, apinfo.com, vagas apinfo, emprego apinfo, apinfo vagas,
  vagas de ti apinfo, empregos ti apinfo, vagas informática brasil, vagas de informática,
  emprego informática, apinfo jobs, vagas pj apinfo, vagas clt apinfo, vagas ti brasil.
context: fork
allowed-tools: Bash(bun run skills/apinfo-search/cli/src/cli.ts *)
---

# APInfo Search Skill

Search live IT job listings from APInfo (apinfo.com) in Brazil. 

> [!WARNING]
> APInfo has aggressive rate limiting and IP blocking. The CLI includes automatic delays and error reporting when rate limits are hit. Keep usage volume low.

## When to use this skill

Invoke this skill when the user wants to:
- Search for contract (PJ) or full-time (CLT) IT jobs in Brazil on APInfo
- Get details of a specific APInfo job listing by its numeric ID

## Commands

### Search job listings

```bash
bun run skills/apinfo-search/cli/src/cli.ts search [flags]
```

Key flags:
- `--query <text>` / `-q <text>` — keyword search. **Required**.
- `--page <n>` — page number (default: 1)
- `--limit <n>` / `-n <n>` — cap total results output
- `--format json|table|plain` — default `json`

### Fetch full job detail

```bash
bun run skills/apinfo-search/cli/src/cli.ts detail <id|url> [--format json|plain]
```

Returns the full description, location, contract, and apply instructions for a specific APInfo job.

## Usage examples

```bash
# Search for Java jobs on APInfo
bun run skills/apinfo-search/cli/src/cli.ts search -q "Java" --format table

# Get details of a specific APInfo job
bun run skills/apinfo-search/cli/src/cli.ts detail 178076 --format plain
```
