# Agent Loop Prompt

## Runbook
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


## Product Intent
# Product Intent

## Purpose
Travel-Dating is a memory-first trip archive for two operators.
The product is not a generic social app or public planner.
It exists to capture places, reviews, photos, and lightweight shared trip context.

## Primary Users
- Two operators maintaining the site and its content
- Read-only visitors who may browse existing memories

## Product Priorities
1. Stable read experience
2. Safe content editing for authenticated users
3. Clear trip summaries, highlights, and review flows
4. Small, reversible improvements over large rewrites

## Non-Goals
- Multi-tenant collaboration for many users
- Full autonomous deployment
- Schema churn without explicit approval
- Feature work that weakens existing review, auth, or Supabase flows

## Quality Bar
- No broken home/detail/review flow
- No unsafe HTML rendering or unsafe external links
- Empty states must render cleanly
- Authenticated actions must fail safely
- Mobile detail navigation must stay usable


## Guardrails
# Guardrails

## Default Mode
`gated write`

The agent may modify code and documentation inside this workspace, but must stop for approval when a task crosses a defined risk boundary.

## Allowed Without Human Approval
- Small frontend fixes and UI improvements
- Refactors that preserve behavior
- Static analysis and local validation
- Worklog and backlog updates
- Adding or updating test and checklist infrastructure

## Always Requires Human Approval
- SQL schema changes
- RLS policy changes
- Storage bucket or storage policy changes
- Deployment changes
- Destructive git commands
- Deleting large files or restructuring major areas of the app

## Escalation Triggers
Stop and request approval when any of the following are true:
- Database shape changes
- Existing data meaning changes
- More than 3 major product files need coordinated structural edits
- Required checks fail and the agent cannot close the gap safely
- A fix depends on an unverified external service assumption

## Safe Completion Rule
Do not mark a task `done` unless:
- The task acceptance criteria are met
- Required checks passed
- Remaining risks are documented in `docs/agent/WORKLOG.md`


## Selected Task
## T-001
status: ready
risk_level: low
goal: Run a review-first pass against the current home, detail, and review flows and capture concrete defects before new feature work.
files: index.html, view.html, app.js, components/reviews.js, style.css
constraints:
- Do not change SQL or RLS
- Focus on reproducible defects, regressions, and unsafe behavior
- Prefer small fixes over structural rewrites
acceptance_criteria:
- At least one concrete issue is confirmed or explicitly ruled out per flow
- Findings are logged in WORKLOG with file references
- If a fix is made, required checks pass
requires_human_if:
- Fix requires backend contract changes
- Findings imply data migration or policy change

## Required Checks
- Run scripts/agent-review.ps1 after changes
- Update docs/agent/WORKLOG.md
- Move the task to done, review_needed, or blocked
