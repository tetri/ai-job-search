# inhire-cli

A CLI tool to search and detail vacancies from companies using the Inhire platform.

## Install dependencies
```bash
bun install
```

## Running the CLI
```bash
# Search for Java positions on idwall
bun run src/cli.ts search -c idwall -q "Java"

# Get details for a vacancy
bun run src/cli.ts detail https://idwall.inhire.app/vagas/a4b4b23d-fca4-47e0-980e-8c094ac608e9 --format plain
```
