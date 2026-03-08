# Backlog

Use one task per loop. The parser expects each task to start with `## T-...` and include `status:` and `risk_level:` lines.

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

## T-002
status: ready
risk_level: low
goal: Harden the detail page regression surface around empty states, auth-gated actions, and mobile panel transitions.
files: view.html, app.js, components/reviews.js, style.css
constraints:
- Preserve the current trip summary and highlight UX
- Keep changes local to the detail experience
acceptance_criteria:
- Empty data states render cleanly
- Review CTAs reflect auth state correctly
- Mobile overview, places, and map transitions remain consistent
requires_human_if:
- Fix requires new backend fields

## T-003
status: ready
risk_level: medium
goal: Improve the home archive cards only if regressions from T-001 are clear, otherwise defer and log why.
files: index.html
constraints:
- Do not expand scope into new trip creation flows
- Preserve current read-only archive behavior
acceptance_criteria:
- Card status, review count, and freshness indicators stay internally consistent
- No syntax or rendering regressions are introduced
requires_human_if:
- Fix requires changing trip or place schema
