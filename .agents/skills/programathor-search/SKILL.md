---
name: programathor-search
version: 1.0.0
description: >
  Search live job listings from Programathor (programathor.com.br) in Brazil.
  Programathor is a popular Brazilian job board focused on developers and IT professionals.
  No authentication required.
  Trigger phrases include: programathor, programathor.com.br, vagas programathor,
  emprego programathor, programathor jobs, vagas de desenvolvedor brasil,
  vagas de programador, programador vagas, dev jobs brasil, vagas ti brasil programathor,
  vagas de programação, emprego programador brasil, vagas de programação remoto.
context: fork
allowed-tools: Bash(bun run skills/programathor-search/cli/src/cli.ts *)
---

# Programathor Search Skill

Search live developer job listings from Programathor (programathor.com.br) in Brazil.

## When to use this skill

Invoke this skill when the user wants to:
- Search for developer openings on Programathor by keyword, technology, or location
- Filter jobs by contract type (CLT, PJ, Estágio), experience level (Júnior, Pleno, Sênior) or remote availability
- Get details of a specific Programathor job posting

## Commands

### Search job listings

```bash
bun run skills/programathor-search/cli/src/cli.ts search [flags]
```

Key flags:
- `--query <text>` / `-q <text>` — keyword search (role, skill, technology).
- `--contract <CLT|PJ|Estágio>` — filter by contract type.
- `--level <Júnior|Pleno|Sênior>` — filter by experience level.
- `--remote` — filter for remote jobs only.
- `--page <n>` — page number (default: 1).
- `--limit <n>` / `-n <n>` — cap total results output.
- `--format json|table|plain` — default `json`.

### Fetch full job detail

```bash
bun run skills/programathor-search/cli/src/cli.ts detail <id|url> [--format json|plain]
```

Returns the full description, company name, requirements, benefits, and apply link for a specific Programathor job.

## Usage examples

```bash
# Search for Python developer jobs
bun run skills/programathor-search/cli/src/cli.ts search -q "Python" --format table

# Search for remote senior React jobs
bun run skills/programathor-search/cli/src/cli.ts search -q "React" --level "Sênior" --remote --format table

# Get details of a specific job
bun run skills/programathor-search/cli/src/cli.ts detail 33645 --format plain
```
