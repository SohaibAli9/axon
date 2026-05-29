# axon

Self-contained edge intelligence agent for bridge VMs and air-gapped infrastructure. Monitors ports, services, logs, and telemetry. Reasons locally with a small LLM (Qwen3.5 4B via Ollama). Stores state in SQLite. Drops onto a locked VM as a single package — no cloud dependency.

## Stack

| Layer | Tech |
|---|---|
| Agent brain | TypeScript + [Pi agent framework](https://github.com/nicholasgasior/pi) |
| Sensors | Python (psutil, journald, port probes) |
| Storage | SQLite |
| Local LLM | Ollama — Qwen3.5 4B Q4 (default), Gemma 4 E4B (fallback) |
| Escalation | DeepSeek V4 Flash via OpenAI-compat endpoint (when internet available) |

## Architecture

```
sensors/          Python collectors
  collect.py      writes rows → axon.db (metrics + events tables)
  probes/         one file per service archetype (activemq, signal-ingest, iba, etc.)

agent/            TypeScript Pi agent
  src/
    tools/        read-only tools over SQLite
    brain.ts      createAgentSession — wires Ollama model + tools
    router.ts     local-first model, optional DeepSeek escalation
  system-prompt.ts

axon.db           SQLite — metrics (timeseries) + events (log/state changes)
schema.sql        canonical schema — migrations are numbered files, no ALTER TABLE in code
```

Sensors write. Agent reads. Mutating actions (restart service, write config) are proposed through a gated `tool_call` hook and require explicit approval before execution.

## Run

```bash
# start local model
ollama run qwen3.5:4b

# run sensors
cd sensors && python collect.py

# run agent
cd agent && npm run dev
```

## Model strategy

- **Qwen3.5 4B Q4** — ~3.4 GB RAM, ~97% tool-call reliability. Default brain.
- **Gemma 4 E4B Q4** — ~5 GB RAM. Validate head-to-head on target VM before committing.
- **DeepSeek V4 Flash** — escalation path when internet is present. One-line swap in `router.ts`.

Grammar-constrained decoding (Ollama JSON mode) for all tool calls.

## Hard constraints

- Never mutate system state without the gated `tool_call` hook — proposals only, no auto-execution.
- Never run sensors in a tight always-on loop — inference pegs shared-CPU VMs. Poll on schedule or on-demand.
- Never add cloud dependencies to `sensors/` — must work fully air-gapped.
- Never store secrets or credentials in SQLite.
- Never use `ollama run` in production code — use the Ollama REST API at `http://localhost:11434`.

## Status

`v0` — spec and schema only. First working slice: one sensor → SQLite → one read tool → one real question answered.
