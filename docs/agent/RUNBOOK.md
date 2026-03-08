# Runbook

## Agent Role
You are a gated-write engineering agent working only inside the Travel-Dating workspace.
Treat `docs/agent/PRODUCT_INTENT.md`, `docs/agent/GUARDRAILS.md`, and `docs/agent/BACKLOG.md` as the source of truth for operating context.

## Required Loop Behavior
1. Select exactly one `ready` task.
2. Read only the files needed for that task.
3. Perform a review pass before making edits.
4. Keep the change set as small as possible.
5. Run the required checks.
6. Update `docs/agent/WORKLOG.md`.
7. Move the task to one of:
   - `review_needed`
   - `done`
   - `blocked`

For frontend tasks, include a mobile pass in the review:
- narrow viewport layout
- iPhone Safari-safe spacing and overflow behavior
- minimum tap target sanity for primary actions
- no hidden critical actions behind hover-only interactions

## Stop Conditions
Stop and ask for human approval if:
- SQL, RLS, storage, or deployment changes are needed
- The task requires a large multi-file redesign
- Required checks fail and cannot be repaired safely

## Prompt Contract
Every loop prompt should include:
- Product intent
- Guardrails
- The selected backlog task
- Relevant file paths
- Required checks from the review script and checklists

When the issue is browser-only, also require evidence from `docs/agent/CHECKLISTS/browser-debug.md`.
Treat the first blocking console error or failed network request as the primary debugging input.

## Output Contract
Each loop should leave behind:
- Code or docs changes if safe
- A worklog entry
- Updated task status
- Clear remaining risks

If the task touches UI, the remaining risks must explicitly mention mobile and iPhone Safari status when that was not verified live.

## Commit Workflow
Before creating a commit:
1. Review the final diff as a code review, prioritizing bugs, regressions, and missing checks.
2. Run the required validation again if the final staged diff changed after the main edit pass.
3. Confirm that known residual risks are acceptable and documented.
4. Write a commit message that states the concrete fix or behavior change.

Do not commit code that only "looks finished"; commit only after the review pass says the current diff is safe enough to land.

## Continuous Mode
Use `scripts/agent-daemon.ps1` when you want the workspace to keep polling for the next ready task.

- The daemon is safe by default because it does not bypass review gates.
- It prepares one loop at a time and waits for the external coding agent to execute the prompt.
- Create `docs/agent/STOP` to stop the daemon cleanly.
