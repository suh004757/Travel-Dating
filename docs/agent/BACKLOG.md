# Backlog

Use one task per loop. The parser expects each task to start with `## T-...` and include `status:` and `risk_level:` lines.

## T-001
status: done
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
status: done
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
status: done
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

## T-004
status: done
risk_level: low
goal: Fix detail-page metadata formatting defects and remove any corrupted separator output in place summaries and highlight cards.
files: app.js
constraints:
- Keep the current summary and highlight structure
- Do not add backend dependencies
acceptance_criteria:
- Place review summary text uses a stable readable separator
- Highlight metadata uses the same stable separator
- No broken characters remain in the touched strings
requires_human_if:
- Fix requires changing stored data encoding

## T-005
status: done
risk_level: low
goal: Add a compact memory insights strip to the detail summary using existing review and photo statistics.
files: view.html, app.js, style.css
constraints:
- Reuse existing derived review stats only
- Keep the detail page layout readable on mobile
acceptance_criteria:
- The detail page shows extra quick stats for captured photos and rating-only stops
- Empty data still renders cleanly
- No existing summary cards regress
requires_human_if:
- Fix requires new backend fields

## T-006
status: done
risk_level: low
goal: Add a fast path from the detail page to the next unreviewed place so operators can keep filling gaps quickly.
files: view.html, app.js, style.css
constraints:
- Work with current filtering and sorting
- Do not change the review modal flow
acceptance_criteria:
- A clear jump action exists when at least one place is unreviewed
- The action targets the first currently relevant unreviewed card
- The button hides when every place has a review
requires_human_if:
- Fix requires changing review ownership rules

## T-007
status: done
risk_level: low
goal: Add a home archive search input that filters trip cards by title, subtitle, and status-facing text.
files: index.html
constraints:
- Keep the archive read-first
- Do not add external dependencies
acceptance_criteria:
- Users can filter trip cards with a text query
- Empty filter results show a friendly message
- Featured trip behavior stays intact
requires_human_if:
- Fix requires server-side search

## T-008
status: done
risk_level: low
goal: Add a top-level archive stats strip on the home page so the archive reads like a dashboard rather than a raw list.
files: index.html
constraints:
- Use existing loaded trip/place/review data only
- Keep the section lightweight and mobile-safe
acceptance_criteria:
- Home page shows total trips, total places, total reviews, and average rating
- Values stay consistent with the loaded archive data
- Empty state still renders cleanly
requires_human_if:
- Fix requires new aggregate API endpoints

## T-009
status: done
risk_level: low
goal: Make the home archive intentionally more compact on mobile instead of forcing the desktop card composition onto iPhone-sized screens.
files: index.html
constraints:
- Keep desktop behavior intact
- Do not change backend queries or data contracts
acceptance_criteria:
- Mobile cards expose a shorter quick summary line
- Mobile layout reduces clutter without hiding the primary trip link
- Desktop cards remain readable and unchanged in structure
requires_human_if:
- Fix requires a new backend field

## T-010
status: done
risk_level: low
goal: Align the detail highlight criteria with the section intent so very low-rated reviews do not surface as revisit-worthy highlights.
files: app.js
constraints:
- Keep the existing highlight section structure
- Use current review stats only
acceptance_criteria:
- Low-rated places are not selected for the positive rating highlight
- Photo and latest reflection highlights still render
- Empty and sparse review states still render cleanly
requires_human_if:
- Fix requires new sentiment fields

## T-011
status: done
risk_level: low
goal: Reword the detail highlight section so the copy stays neutral and does not overstate revisit-worthiness.
files: view.html, app.js
constraints:
- Keep the existing section placement and structure
- Update copy only
acceptance_criteria:
- Section heading is more neutral
- Highlight labels match the revised tone
- Empty state copy remains understandable
requires_human_if:
- Fix requires product terminology changes outside this flow

## T-012
status: done
risk_level: low
goal: Reduce perceived data density on the detail page by separating quick-glance information from optional detailed stats.
files: view.html, app.js, style.css
constraints:
- Keep the same underlying trip data
- Preserve desktop readability while reducing mobile overload
acceptance_criteria:
- The summary shows a lighter quick-glance layer first
- Detailed trip stats can be expanded or collapsed
- Mobile defaults to the lighter summary state
requires_human_if:
- Fix requires removing existing trip data

## T-013
status: done
risk_level: low
goal: Add a lightweight archive rewind module on the home page so the archive gives the couple a reason to revisit older trips, not just browse the latest one.
files: index.html
constraints:
- Reuse existing trip and review data only
- Keep the home page read-only
- Stay mobile-friendly, including iPhone-sized layouts
acceptance_criteria:
- The home page can surface one past trip that is close to today on the calendar
- The module hides cleanly when usable trip dates are missing
- The existing featured activity card and trip list continue to work
requires_human_if:
- Fix requires new reminder tables or notification infrastructure

## T-014
status: done
risk_level: low
goal: Make the detail page genuinely mobile-friendly by reducing top-of-page scroll pressure and tightening place card interactions for iPhone-sized layouts.
files: view.html, app.js, style.css
constraints:
- Keep the current desktop structure intact
- Do not change backend queries or review ownership behavior
- Prioritize tap comfort and scan speed on narrow screens
acceptance_criteria:
- Secondary detail sections can be collapsed on mobile
- Place cards use tighter mobile spacing and full-width primary actions
- Existing overview/places/map mobile workspace logic still works
requires_human_if:
- Fix requires removing existing detail content entirely
