# axon

Self-contained edge intelligence agent for bridge VMs and air-gapped infrastructure. Monitors ports, services, logs, and telemetry. Reasons locally with a small LLM (Qwen3 1.7B Q4_K_M via Ollama). Stores state in SQLite. Can be dropped onto a locked VM as a single package with no cloud dependency.

Primary stack: TypeScript (Pi agent framework) + Python (sensor collectors) + SQLite + Ollama.

---

## Run

```bash
# start ollama model (service auto-starts on boot via systemd)
ollama pull qwen3:1.7b

# run sensors (Python)
cd sensors && python collect.py

# run agent (TypeScript)
cd agent && npm run dev
```

---

## Hard constraints

- Never mutate system state (kill process, restart service, write config) without going through the gated `tool_call` hook — tool calls must be proposed and approved, not auto-executed.
- Never run the collector in a tight always-on loop — inference pegs shared-CPU Vultr VMs for up to 48h. Poll on a schedule or on-demand.
- Never add cloud dependencies to the `sensors/` package — it must work fully air-gapped.
- Never store secrets or credentials in SQLite — the DB is plaintext on disk.
- Never use `ollama run` in production code; use the Ollama REST API (`http://localhost:11434`).

---

## Architecture

```
sensors/          Python collectors — psutil, journald, port probes, service checks
  collect.py      writes rows to axon.db (metrics + events tables)
  probes/         one file per service archetype (activemq, signal-ingest, iba, etc.)

agent/            TypeScript Pi agent
  src/
    tools/        read-only tools over SQLite (never write from here)
    brain.ts      createAgentSession — wires Ollama model + tools
    router.ts     local-first model, optional DeepSeek escalation when net present
  system-prompt.ts

axon.db           SQLite — metrics (timeseries rows) + events (log/state changes)
```

Sensors write. Agent reads. The only write path from the agent is through gated mutating tools.

---

## Model strategy

- **Default brain:** Qwen3 1.7B Q4_K_M (~1.4 GB disk, ~5.4 GB total RAM at load with 4K ctx). #1 agent score (0.960) in Local Agent Bench Round 3 (Feb 2026), 100% tool-call restraint, ~14-15 tok/s on this hardware (2-core EPYC, CPU-only).
  - Env: `AXON_MODEL=qwen3:1.7b` (set in `router.ts` default, or override via env).
- **Ollama tuning (set via /etc/systemd/system/ollama.service.d/override.conf):**
  - `OLLAMA_KV_CACHE_TYPE=q4_0` — 75% KV cache reduction
  - `OLLAMA_NUM_PARALLEL=1` — prevents context multiplication under concurrency
  - `OLLAMA_MAX_LOADED_MODELS=2` — at most 2 models hot in RAM
- **Escalation:** DeepSeek V4 Flash via OpenAI-compat endpoint when internet is available and local model flags low confidence. One-line swap in `router.ts`.
- Use grammar-constrained decoding (llama.cpp GBNF or Ollama JSON mode) for all tool calls.

---

## Workflow rules

- The first working slice is: one sensor → SQLite → one read tool → one real question answered. Do not expand scope until that works end-to-end.
- Probes are written for the bridge VM archetype: Signal ingest, IBA, ActiveMQ, telemetry egress. No generic "discover everything" probes in v1.
- SQLite schema lives in `schema.sql` — migrations are numbered files, never ALTER TABLE in code.
- Pi tools must have TypeBox schemas; AJV validation is the safety net, keep it.
