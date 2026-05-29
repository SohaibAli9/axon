<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)">
    <img alt="axon — edge intelligence agent" src="https://img.shields.io/badge/axon-edge%20intelligence-6366f1?style=for-the-badge&logo=activitypub&logoColor=white" height="64">
  </picture>
</p>

<p align="center">
  <strong>Self-contained edge intelligence for bridge VMs and air-gapped infrastructure.</strong>
  <br>
  Monitors ports, services, logs, and telemetry. Reasons locally. Ships as a single package.
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/version-0.1.0-6366f1?style=flat-square" alt="version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="license"></a>
  <a href="#"><img src="https://img.shields.io/badge/model-qwen3%3A1.7b-ff6b6b?style=flat-square" alt="model"></a>
  <a href="#"><img src="https://img.shields.io/badge/tool--call%20score-0.960-success?style=flat-square" alt="tool call score"></a>
  <a href="#"><img src="https://img.shields.io/badge/ram%20footprint-5.4%20GiB-informational?style=flat-square" alt="RAM"></a>
  <a href="#"><img src="https://img.shields.io/badge/platform-linux--amd64-lightgrey?style=flat-square" alt="platform"></a>
</p>

---

## What is axon?

axon is an edge intelligence agent built for **bridge VMs** — those locked-down, single-purpose machines that move data between security domains. It watches system health, collects telemetry, and answers questions *without ever phoning home*.

Drop it onto a VM. It monitors CPU, memory, disk, load, and services. It stores everything in SQLite. It answers questions using a local LLM (no cloud, no API keys). And when the internet is available, it can escalate to a larger model.

> **axiom:** *"a statement or proposition which is regarded as being established, accepted, or self-evidently true"* — axon observes, verifies, and reports what's true about your infrastructure.

---

## Features

| | | |
|---|---|---|
| ✈️ **Fully air-gapped** | No cloud dependency. No telemetry. No phone-home. Runs entirely on local CPU. |
| 🧠 **Local reasoning** | Qwen3 1.7B Q4_K_M via Ollama — 0.960 agent score, perfect tool-call restraint, ~15 tok/s on 2-core VMs. |
| 🔧 **Agentic tool loop** | Multi-turn, multi-tool. Calls read tools, interprets results, calls follow-ups. Built on the Pi agent framework in TypeScript. |
| 📊 **SQLite-native** | Metrics and events in a single file. Sensors write. Agent reads. Schema is versioned and indexed. |
| 🪶 **~1.5 GB on disk** | Model + agent + sensors + DB. Drops onto a locked VM without bloat. |
| 🛡️ **Gated mutations** | Read-only by default. Mutating actions (restart service, write config) require explicit approval through a `tool_call` hook. |
| 🔌 **Extensible probes** | One Python file per service archetype — system, ActiveMQ, Signal ingest, IBA, telemetry egress. Add yours. |
| 📡 **Escalation path** | When the internet is present, one-line swap in `router.ts` escalates to DeepSeek V4 Flash for high-confidence answers. |
| 🔄 **Multi-app serving** | Ollama exposes `localhost:11434` — any local app or agent can inference the model concurrently. |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        bridge VM                            │
│                                                             │
│  ┌──────────────┐     ┌──────────────┐     ┌─────────────┐ │
│  │   sensors/   │     │   agent/     │     │   ollama    │ │
│  │              │     │              │     │             │ │
│  │  collect.py  │────▶│  brain.ts    │────▶│ qwen3:1.7b  │ │
│  │  probes/     │write│  tools/      │REST │  (Q4_K_M)   │ │
│  │  · system    │     │  · metrics   │◀────│             │ │
│  │  · activemq  │     │  · snapshot  │ JSON│  localhost   │ │
│  │  · iba       │     │  router.ts   │     │   :11434     │ │
│  │  · signal    │     │              │     └─────────────┘ │
│  └──────┬───────┘     └──────┬───────┘                     │
│         │                    │                              │
│         ▼                    ▼                              │
│  ┌──────────────────────────────────────┐                  │
│  │              axon.db                 │                  │
│  │  ┌──────────┐  ┌──────────────────┐  │                  │
│  │  │ metrics  │  │     events       │  │                  │
│  │  │ (ts,host,│  │ (ts,host,level,  │  │                  │
│  │  │  metric, │  │  source,message) │  │                  │
│  │  │  value)  │  │                  │  │                  │
│  │  └──────────┘  └──────────────────┘  │                  │
│  └──────────────────────────────────────┘                  │
│                                                             │
│  ┌──────────────────────────────────────┐                  │
│  │  DeepSeek V4 Flash (optional, when   │                  │
│  │  internet present — one-line swap)    │                  │
│  └──────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

**Sensors write. Agent reads.** The only write path from the agent is through gated mutating tools — proposals only, no auto-execution.

---

## Quick Start

### Prerequisites

- Linux (amd64) with ≥ 4 GB free RAM (tested on AMD EPYC, 2-core shared VM)
- [Ollama](https://ollama.com) ≥ 0.3.0
- Python ≥ 3.11 + [uv](https://docs.astral.sh/uv/)
- Node.js ≥ 20 + npm

### 1. Clone & install

```bash
git clone https://github.com/SohaibAli9/axon.git
cd axon

# Pull the model (~1.4 GB)
ollama pull qwen3:1.7b

# Install sensors
cd sensors && uv sync && cd ..

# Install agent
cd agent && npm install && cd ..
```

### 2. Collect some data

```bash
# One-shot collection (writes to axon.db)
cd sensors && uv run collect.py --once

# Or poll continuously (default: every 60s)
uv run collect.py
```

### 3. Ask a question

```bash
cd agent && npm run dev
```

```
axon agent — model: qwen3:1.7b  ollama: http://localhost:11434
✓ Local model is present and reachable.
Ask a question about this machine, or type "exit" to quit.

> what's the CPU and memory situation?
CPU is at 34%, RAM at 42% — both within normal range. Load average is 0.5.
The machine is healthy.

> has anything anomalous happened in the last hour?
No errors in the last hour. CPU spiked to 92% at 14:00 but recovered
to 24% by 14:30. Swap increased from 15% to 28% — investigate memory
pressure during that window.
```

---

## Configuration

### Agent

| Env variable | Default | Description |
|---|---|---|
| `AXON_MODEL` | `qwen3:1.7b` | Ollama model name |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama server URL |
| `AXON_DB` | `../axon.db` | Path to SQLite database |
| `ESCALATION_MODEL` | `deepseek-chat` | Escalation model (when internet present) |
| `ESCALATION_API_KEY` | *(empty)* | API key for escalation endpoint |

### Sensors

| Env variable | Default | Description |
|---|---|---|
| `AXON_DB` | `../axon.db` | Path to SQLite database |
| `POLL_INTERVAL` | `60` | Seconds between sensor collections |

### Ollama tuning (set in `/etc/systemd/system/ollama.service.d/override.conf`)

```ini
[Service]
Environment="OLLAMA_KV_CACHE_TYPE=q4_0"    # 75% KV cache reduction
Environment="OLLAMA_NUM_PARALLEL=1"        # prevent context multiplication
Environment="OLLAMA_MAX_LOADED_MODELS=2"   # at most 2 models hot in RAM
```

---

## Model Strategy

axon is designed around the constraint that **7.7 GB RAM is the whole budget** and the model must **share with other processes**.

| | Default | Why |
|---|---|---|
| **Qwen3 1.7B Q4_K_M** | ✓ in use | #1 agent score (0.960) in Local Agent Bench Round 3 (Feb 2026). Perfect tool-call restraint. 2.0B params, ~1.4 GB on disk, ~5.4 GB total at load. Consistently ~14.5 tok/s on 2-core EPYC CPU. |
| **LFM 2.5 1.2B** | speed alternative | 0.920 agent score at 1,567 ms — nearly 7× faster than Qwen3. Agent score only 0.04 behind. |
| **Llama 3.2 3B** | fallback | ~2 GB, 128K context, broadest ecosystem. Proven on single-board computers. |
| **DeepSeek V4 Flash** | escalation | When internet is present and local model flags low confidence. One-line swap. |

> Benchmarks from [MikeVeerman/tool-calling-benchmark](https://github.com/MikeVeerman/tool-calling-benchmark) Round 3 and [juanluisbaptiste/ai-benchmarks](https://github.com/juanluisbaptiste/ai-benchmarks).

---

## Extending axon

### Adding a new probe

Create one file in `sensors/probes/`. Follow the contract: export a `collect() -> list[dict]` function that returns rows matching the `metrics` or `events` table schema.

```python
# sensors/probes/activemq.py
import socket, time, urllib.request

def collect() -> list[dict]:
    host = socket.gethostname()
    ts = int(time.time() * 1000)
    try:
        status = urllib.request.urlopen("http://localhost:8161/api").status
        return [{
            "ts": ts, "host": host,
            "metric": "activemq_status",
            "value": 1.0 if status == 200 else 0.0,
            "unit": "bool"
        }]
    except Exception:
        return []
```

Wire it in `collect.py`:

```python
from probes import system, activemq
# ...
for probe in [system, activemq]:
    write_metrics(con, probe.collect())
```

Future probes planned: **IBA-PDA** (industrial data connector), **Signal ingest** (journald/syslog watcher), **telemetry egress** (metrics forwarding).

### Adding a new agent tool

Create one file in `agent/src/tools/`. Export a `definition` (Ollama Tool schema) and a `call(args)` handler.

```typescript
// agent/src/tools/getServiceStatus.ts
import Database from "better-sqlite3";

export const definition = {
  type: "function" as const,
  function: {
    name: "get_service_status",
    description: "Check if a service is running by name (e.g., activemq, nginx)",
    parameters: {
      type: "object",
      properties: {
        service: { type: "string", description: "service name" },
      },
      required: ["service"],
    },
  },
};

export function call(args: unknown): string {
  // query axon.db events table, or probe live
  return JSON.stringify({ running: true });
}
```

Register it in `brain.ts`:

```typescript
import * as getServiceStatus from "./tools/getServiceStatus.js";

const TOOLS: Tool[] = [
  getRecentMetrics.definition,
  getLatestSnapshot.definition,
  getServiceStatus.definition,   // ← add here
];
```

### Data connectors

The `events` table (`ts, host, level, source, message`) is the integration point. Pipe anything into it:

```sql
INSERT INTO events (ts, host, level, source, message)
VALUES (unixepoch('now')*1000, 'bridge-01', 'warn', 'activemq',
        'queue dlq.backlog depth 5000 exceeds threshold 1000');
```

Run the agent. It'll see the event in the next `get_recent_metrics` call and reason about it.

---

## Project Structure

```
axon/
├── schema.sql              Canonical schema — migrations are numbered files, never ALTER TABLE
├── axon.db                 SQLite — metrics (timeseries) + events (log/state changes)
├── sensors/                Python collectors
│   ├── collect.py           Orchestrator — runs probes, writes rows
│   ├── config.py            env-driven config (DB path, poll interval)
│   ├── logger.py            Structured logger (console + file)
│   ├── pyproject.toml       uv-managed deps (psutil, python-dotenv)
│   └── probes/              One file per service archetype
│       └── system.py         CPU, RAM, disk, swap, load average
├── agent/                   TypeScript Pi agent
│   ├── src/
│   │   ├── brain.ts          Agentic tool loop — wires Ollama model + tools (max 8 turns)
│   │   ├── router.ts         Local-first model router, optional DeepSeek escalation
│   │   ├── system-prompt.ts  Loads prompt from prompts/system.txt
│   │   ├── index.ts          REPL entry point
│   │   └── tools/            Read-only tools over SQLite (never write from here)
│   │       ├── getRecentMetrics.ts   Time-series query with metric filter
│   │       └── getLatestSnapshot.ts  One-row-per-metric health snapshot
│   ├── prompts/
│   │   └── system.txt        Agent system prompt
│   ├── package.json          deps: ollama, better-sqlite3, typebox, ajv
│   └── tsconfig.json
├── CLAUDE.md                Claude Code project conventions
└── README.md                You are here
```

---

## Benchmarks

Measured on a **2-core AMD EPYC-Rome VM, 7.7 GiB RAM, no GPU, Qwen3 1.7B Q4_K_M**.

| Test | Result |
|---|---|
| **Inference speed** (short prompt) | **14.5 tok/s** |
| **Inference speed** (reasoning prompt) | **14.7 tok/s** |
| **Inference speed** (tool-call JSON) | **14.3 tok/s** |
| **Tool-call accuracy** (4 tests) | **4/4 (100%)** |
| **Required parameter inference** | ✓ Correct (`path: "/"` from context) |
| **Multi-tool parallel invocation** | ✓ Called 2 tools in single turn |
| **Multi-turn reasoning** | ✓ CPU+memory→ synthesis→ diagnosis |
| **RAM at load** (model + KV + graph) | **5.4 GiB** |
| **Model time-to-first-load** | **6.5 seconds** |

---

## Design Principles

- **No cloud dependency.** Everything works fully air-gapped. The escalation path is opt-in, not required.
- **Sensors write, agent reads.** Clean separation. The agent has no write path to the database — only read tools. Mutations go through a gated `tool_call` hook.
- **Low overhead.** The sensor poll interval defaults to 60 seconds. No tight loops. No inference pegging shared-CPU VMs.
- **Never `ollama run` in production.** Always the REST API at `http://localhost:11434`.
- **Schema is canonical.** `schema.sql` is the source of truth. Migrations are numbered files. No ALTER TABLE in code.
- **Tools are validated.** Every tool has a TypeBox schema. AJV validation runs on every call. Malformed tool args are rejected before they touch the database.

---

## Roadmap

| Milestone | Status |
|---|---|
| System probe → SQLite → read tool → real answer | ✅ v0.1 |
| ActiveMQ probe (queue depth, broker health) | 🔜 v0.2 |
| IBA-PDA connector (industrial data historian) | 🔜 v0.3 |
| Signal ingest probe (journald/syslog watcher) | 🔜 v0.3 |
| Events table integration + anomalous event detection | 🔜 v0.4 |
| Gated mutating tools (service restart, config write) | 📋 planned |
| Grammar-constrained decoding (GBNF) for tool calls | 📋 planned |
| Multi-node fleet dashboard | 📋 planned |

---

## Contributing

axon is an open-source project. Contributions welcome — especially new probes, tools, and data connectors.

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-probe`)
3. Add your probe or tool following the existing patterns
4. Submit a PR

---

## License

MIT © 2026 Sohaib Ali

---

<p align="center">
  <sub>Built with ❤️ for bridge VMs everywhere. No cloud required.</sub>
</p>
