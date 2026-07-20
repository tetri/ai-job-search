#!/usr/bin/env bun
// Self-contained CLI for searching and viewing jobs on Inhire,
// used by many Brazilian companies. Zero runtime dependencies.

import { runSearch, type SearchOpts } from "./commands/search.ts";
import { runDetail, type DetailOpts } from "./commands/detail.ts";
import { writeError } from "./helpers.ts";

interface Flags {
  _: string[];
  [k: string]: string | boolean | string[];
}

function parseFlags(argv: string[]): Flags {
  const flags: Flags = { _: [] };
  const alias: Record<string, string> = { q: "query", c: "company", n: "limit" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--") || a.startsWith("-")) {
      const key = alias[a.replace(/^-+/, "")] ?? a.replace(/^-+/, "");
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("-")) {
        flags[key] = true;
      } else {
        flags[key] = next;
        i++;
      }
    } else {
      ;(flags._ as string[]).push(a);
    }
  }
  return flags;
}

const HELP = `inhire-cli — search and detail jobs on the Inhire platform

USAGE
  bun run src/cli.ts search --company <subdomain> [flags]
  bun run src/cli.ts detail <id|url> [--company <subdomain>] [--format json|plain]

SEARCH FLAGS
  --company, -c <text>    Company subdomain on inhire.app (e.g., idwall, nomad). REQUIRED.
  --query, -q <text>      Filter jobs by keywords (client-side title match).
  --limit, -n <n>         Cap results printed.
  --format <fmt>          json (default) | table | plain.

DETAIL FLAGS
  --company, -c <text>    Company subdomain (only needed if UUID is passed instead of URL).
  --format <fmt>          json (default) | plain.

EXAMPLES
  bun run src/cli.ts search -c idwall -q "Engineer" --format table
  bun run src/cli.ts detail https://idwall.inhire.app/vagas/a4b4b23d-fca4-47e0-980e-8c094ac608e9 --format plain
`;

async function main(): Promise<number> {
  const argv = process.argv.slice(2);
  const flags = parseFlags(argv);
  const cmd = (flags._ as string[])[0];

  if (!cmd || flags.help || flags.h) {
    process.stdout.write(HELP);
    return cmd ? 0 : 1;
  }

  if (cmd === "search") {
    const company = typeof flags.company === "string" ? flags.company : undefined;
    if (!company) {
      writeError("the --company/-c flag is required for searching inhire (e.g. -c idwall)", "MISSING_COMPANY");
      return 1;
    }
    const fmt = (flags.format as string) || "json";
    
    let limit: number | undefined;
    if (flags.limit !== undefined) {
      const val = parseInt(flags.limit as string, 10);
      if (isNaN(val)) {
        writeError(`--limit must be a number, got "${flags.limit}"`, "BAD_ARG");
        return 1;
      }
      limit = val;
    }

    const opts: SearchOpts = {
      company,
      query: typeof flags.query === "string" ? flags.query : undefined,
      limit,
      format: (["json", "table", "plain"].includes(fmt) ? fmt : "json") as SearchOpts["format"],
    };
    return runSearch(opts);
  }

  if (cmd === "detail") {
    const id = (flags._ as string[])[1];
    if (!id) {
      writeError("detail requires a vacancy URL or UUID", "NO_ID");
      return 1;
    }
    const company = typeof flags.company === "string" ? flags.company : undefined;
    const fmt = (flags.format as string) || "json";

    const opts: DetailOpts = {
      id,
      company,
      format: (fmt === "plain" ? "plain" : "json") as DetailOpts["format"],
    };
    return runDetail(opts);
  }

  writeError(`Unknown command "${cmd}"`, "BAD_CMD");
  return 1;
}

main().then((code) => process.exit(code));
