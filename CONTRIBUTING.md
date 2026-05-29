# Contributing to axon

Thanks for your interest in contributing! axon is an open-source edge intelligence agent for air-gapped infrastructure. We welcome contributions of all kinds — probes, tools, docs, bug fixes, and ideas.

## Getting started

### Prerequisites

- Linux (amd64) with ≥ 4 GB free RAM
- [Ollama](https://ollama.com) ≥ 0.3.0
- Python ≥ 3.11 + [uv](https://docs.astral.sh/uv/)
- Node.js ≥ 20 + npm

### Setup

```bash
git clone https://github.com/SohaibAli9/axon.git
cd axon

# Pull the model
ollama pull qwen3:1.7b

# Install sensors
cd sensors && uv sync && cd ..

# Install agent
cd agent && npm install && cd ..
```

### Run

```bash
# Collect some data first
cd sensors && uv run collect.py --once

# Start the agent REPL
cd agent && npm run dev
```

## What to work on

| Area | Good for |
|---|---|
| **New probes** (`sensors/probes/`) | Python devs — add monitoring for ActiveMQ, IBA-PDA, journald, nginx, etc. |
| **New tools** (`agent/src/tools/`) | TypeScript devs — add read tools over SQLite or system state |
| **Data connectors** | Pipe external data into the `events` table |
| **Documentation** | Improve README, add tutorials, write migration guides |
| **Bug fixes** | Check the issue tracker for `good first issue` tags |

### Probes follow this contract

```python
# sensors/probes/my_service.py
def collect() -> list[dict]:
    """Return rows matching the metrics or events table schema."""
    return [{"ts": ..., "host": ..., "metric": ..., "value": ..., "unit": ...}]
```

Wire it in `sensors/collect.py`:

```python
from probes import system, my_service
for probe in [system, my_service]:
    write_metrics(con, probe.collect())
```

### Tools follow this contract

```typescript
// agent/src/tools/myTool.ts
export const definition = { type: "function", function: { name: "...", description: "...", parameters: {...} } };
export function call(args: unknown): string { /* query axon.db, return JSON */ }
```

Register it in `agent/src/brain.ts`:

```typescript
import * as myTool from "./tools/myTool.js";
const TOOLS: Tool[] = [ ..., myTool.definition ];
const TOOL_HANDLERS = { ..., myTool: myTool.call };
```

## Pull request guidelines

1. **Branch from `master`** — `git checkout -b feat/my-probe`
2. **Keep it focused** — one probe, one tool, or one fix per PR
3. **Follow existing patterns** — match the code style, TypeBox schemas, and Python conventions you see
4. **Write the PR description** — what it does, why, how to test it
5. **Don't break the DB schema** — schema changes go in numbered migration files, never ALTER TABLE in code

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold its terms.

## Questions?

Open an issue or start a discussion. We're friendly.
