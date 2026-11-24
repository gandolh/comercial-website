# Task 29: The image's node base is pinned

**Depends on:** nothing. **Runs before:** nothing.
**Builder:** Sonnet.
**Before you start:** run `brief-board guide` (the repo's `CLAUDE.md` says so).

## Context

Filed 2026-11-24 from the estate's infra review. Every app image is built on the box by vps-deploy's `server`
phase. The same pin is filed in every repo with a Dockerfile.

- `infrastructure/Dockerfile` has three `FROM node:24-alpine` lines (31, 52, 73). The tag follows whatever it is
  on the build day: on the laptop on 2026-11-24 it is Node 24.21.0 on alpine 3.24.2, while imbatranimOS pins
  `node:24.22.1-alpine`. On the box that is two separate 171 MB bases, and two copies of the `apk add python3 make
  g++` layer, which is otherwise one cached layer shared by every alpine Dockerfile.
- vps-deploy's weekly housekeeping removes a base tag no image uses after two weeks; the next deploy pulls the
  tag's current image, every cache entry keyed on the old one is dead, and each app lands on a different Node
  patch depending on when it was last built. On 2026-11-23 the box's build cache reached 9.3 GB and its disk 90%.
- The image builds from `backend/`, its own lockfile with one workspace (`@mercatus/app`), so the build install
  has nothing to scope; the other repos' briefs scope theirs.

## Decisions

- All three `FROM` lines are `node:24.22.1-alpine`. The estate moves to a new patch in one sweep, not per repo.
- Nothing else in the Dockerfile changes.

## Files you OWN

- `infrastructure/Dockerfile`
- The closeout: the outcome note, `corpus/log.md`, `corpus/wiki/status.md`

## Files you must NOT touch

- Any `package.json` or `package-lock.json`; `infrastructure/docker-compose.yml`.

## What to do

1. Edit the three `FROM` lines.
2. Build the image on the laptop (`docker compose -f infrastructure/docker-compose.yml build piataro-api`) and start
   it on a scratch data folder: the container turns healthy and `/health` answers.

If your session can't build Docker images, make the edit, run the checks, and hand back with step 2 for the
controller.

## Acceptance

- The image builds and step 2 passes.
- `npm run check` exits 0; `bash corpus/lint.sh` passes.
- End move `ready_for_deploy`.

## Owner steps

- `node cli.ts piataro server` from vps-deploy. The image builds on the box.

## Outcome

Built 2026-11-24 by the controller (b5f412e). Ready for deploy: `node cli.ts piataro server` (brief 27's database
move comes first if it hasn't run yet).

- **Step 1**: the three `FROM` lines are `node:24.22.1-alpine`, with a comment on why the base is pinned.
- **Step 2**: the image builds (221 MB before, 222 MB after: the pinned Node patch). On a scratch data folder,
  with a throwaway `JWT_SECRET` (the API exits at start without one), it turned healthy; `/health` answered
  `{"status":"ok"}`; Node is v24.22.1. Test images and the container were removed.
- `npm run check` exits 0; `bash corpus/lint.sh` passes.
