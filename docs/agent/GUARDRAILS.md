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

## Mobile Safety Rule
- Frontend changes must remain mobile-friendly by default
- iPhone Safari behavior is part of the baseline support target
- Do not mark a frontend task `done` if layout, tap targets, or viewport behavior are likely to break on narrow mobile screens
- Treat mobile regressions as product regressions, not optional polish

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
