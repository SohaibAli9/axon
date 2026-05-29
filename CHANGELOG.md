# Changelog

All notable changes to axon will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-05-29

### Added

- System resource probe (`sensors/probes/system.py`) — CPU, RAM, disk, swap, load average via psutil
- Sensor orchestrator (`sensors/collect.py`) — runs probes on interval or `--once`, writes to SQLite
- Structured logger (`sensors/logger.py`) — UTC-timestamped console + file output
- SQLite schema (`schema.sql`) — `metrics` (timeseries) and `events` (log/state changes) tables with indexes
- Agent brain (`agent/src/brain.ts`) — multi-turn tool-call loop over Ollama (max 8 turns)
- Read tools: `get_recent_metrics` (time-series query with metric filter) and `get_latest_snapshot` (health overview)
- Model router (`agent/src/router.ts`) — local-first with optional DeepSeek escalation path
- Interactive REPL (`agent/src/index.ts`) — ask questions about system health
- Local LLM presence check at startup
- Qwen3 1.7B Q4_K_M as default model (0.960 agent score, 4/4 tool-call reliability, 14.5 tok/s)
- Ollama systemd persistence with KV cache quantization (q4_0), NumParallel=1, MaxLoadedModels=2
- CLAUDE.md with project conventions and Claude Code guidance
- Full open-source foundation: LICENSE (MIT), CONTRIBUTING.md, CODE_OF_CONDUCT.md (Contributor Covenant 2.1), CHANGELOG.md
- GitHub issue and PR templates
