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

## Output Contract
Each loop should leave behind:
- Code or docs changes if safe
- A worklog entry
- Updated task status
- Clear remaining risks
