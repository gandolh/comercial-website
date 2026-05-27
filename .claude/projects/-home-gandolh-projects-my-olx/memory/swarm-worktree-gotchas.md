---
name: swarm-worktree-gotchas
description: Pitfalls when orchestrating parallel haiku sub-agents across git worktrees on my-olx
metadata:
  type: feedback
---

When running a swarm of sub-agents in parallel git worktrees and merging into main:

- **Sub-agents sometimes create their OWN worktree** instead of using the one you `git worktree add`-ed for them. Look for stray checkouts under `.claude/worktrees/` (e.g. `agent-<id>` or a branch named after the task without your `wt/` prefix). Their work lands there, uncommitted. After dispatch, verify each assigned worktree actually changed (`git -C <wt> status`); if "nothing to commit", hunt for the real location with `find . -name <expected-new-file>`.
- **A self-created agent worktree may branch from a STALE base** (the repo HEAD at session start, not your current wave's main). Merging it silently reverts later waves. Always check `git merge-base <agent-branch> main` and confirm the branch contains prior waves' work before merging; if stale, discard and redo the task yourself.
- Add `.claude/worktrees` to `.gitignore` so a stray agent worktree can't get committed as an embedded gitlink.
- **Each agent reports its own build as green, but the COMBINED merge often fails.** Classic causes here: multiple agents each adding a conflicting `declare module "fastify"` augmentation (keep exactly ONE, in core); duplicate type definitions (e.g. two `ListingAsset`); JSON files (i18n `common.json`) edited by several agents.
- `tsc --noEmit` from one cwd can pass while `tsc -b` / `vite build` fails — always run the real project build at merge time, not just a typecheck.

**Why:** parallelism is fast but integration is where it breaks; budget orchestrator time to reconcile shared files and verify the merged build, not just trust per-agent green checks.
**How to apply:** after each wave, (1) locate real agent output, (2) check branch base freshness, (3) merge, (4) run the actual build + tests on merged main, (5) fix integration seams centrally.
