# Show HN Post

## Title

```
Show HN: axon — edge AI agent for air-gapped VMs (local LLM, no cloud)
```

*(79 characters — under the 80-char HN limit)*

---

## URL

```
https://github.com/SohaibAli9/axon
```

---

## Founder Comment

*(Post immediately after submitting. Paste as the first comment.)*

---

I built axon because I have a bunch of bridge VMs — those single-purpose Linux boxes that sit between security domains moving data — and nobody watches them. They're too small for a monitoring stack, too locked-down for an agent that phones home, and too boring for anyone to check manually until something breaks at 3 AM.

axon is a self-contained agent that runs entirely on the machine. It collects system telemetry (CPU, memory, disk, load, services) via Python sensors, stores everything in a local SQLite database, and answers questions using a small LLM running on CPU — no GPU, no cloud, no API keys. You ask "is this machine healthy?" and it calls tools, reads the data, and tells you.

The model is Qwen3 1.7B Q4_K_M (~1.4 GB on disk, ~5.4 GB total RAM at load). On a 2-core AMD EPYC VM with 7.7 GB RAM, it runs at about 14.5 tok/s. Tool-call reliability has been 4/4 in my tests — it correctly picks the right tool, infers required parameters from context, and runs multi-turn loops (call CPU tool → get result → call memory tool → synthesize). The model scored 0.960 agent score in Local Agent Bench Round 3 — top of 21 models tested.

It's MIT licensed and the whole thing — sensors, agent, model, database — drops onto a locked VM as a single package. The sensors are extensible (one Python file per service — I have system, ActiveMQ, and IBA-PDA probes planned). The agent tools are TypeScript with TypeBox schemas and AJV validation.

Known limitations: it's CPU-only, so it's slow for long generations. The model is 1.7B — it's great at tool calling but not a reasoning powerhouse. No GPU support yet. Only tested on Linux/amd64. And the events table (for log-level anomaly detection) is defined in the schema but not wired into the agent yet — that's the next slice.

Would love feedback on the architecture, the tool-call loop design, and whether anyone else is running anything similar on locked-down infrastructure. Also curious if people think the model choice (1.7B Q4) is the right tradeoff or if I should be looking at something else.

---

## Timing

- **Post:** Tuesday, 9:00 AM ET
- **Have ready:** 3+ people to leave genuine comments in the first 30 minutes
- **Stay online:** reply to every comment for the first 2 hours

## Secondary posts

After the HN post goes live, cross-post the link to:

1. **r/LocalLLaMA** — "I put Qwen3 1.7B on a 2-core VM with no GPU — 0.96 tool score, 4/4 reliability. Here's the project."
2. **r/selfhosted** — "Built an AI agent for air-gapped VMs — no cloud, no GPU, just Python + SQLite + Ollama"
3. **Dev.to** — Write a 5-minute tutorial walkthrough

---

## Posting checklist

- [ ] Title under 80 chars ✓
- [ ] Founder comment written by hand ✓
- [ ] Schedule for Tuesday 9 AM ET
- [ ] README has install instructions with API key / model pull ✓
- [ ] GitHub topics set ✓
- [ ] LICENSE, CONTRIBUTING, CoC, CHANGELOG present ✓
- [ ] Issue/PR templates live ✓
- [ ] Awesome-list PRs drafted (awesome-llm, awesome-ollama, awesome-self-hosted)
