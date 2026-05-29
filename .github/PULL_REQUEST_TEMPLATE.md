## Description

<!-- What does this PR do? Why is it needed? -->

## Type of change

- [ ] Bug fix
- [ ] New probe (`sensors/probes/`)
- [ ] New tool (`agent/src/tools/`)
- [ ] Documentation
- [ ] Other

## How to test

<!-- Steps to verify the change works -->

```bash
# e.g.
cd sensors && uv run collect.py --once
cd agent && npm run dev
> ask a question that exercises the change
```

## Checklist

- [ ] Follows existing patterns (TypeBox schemas for tools, `collect() -> list[dict]` contract for probes)
- [ ] Works air-gapped (no cloud dependency unless opt-in)
- [ ] Does not mutate system state (unless adding a gated mutating tool with explicit approval)
- [ ] No ALTER TABLE — schema changes are in a numbered migration file
- [ ] Tested locally with `qwen3:1.7b`
