# Browser Debug Checklist

Use this checklist when a bug reproduces only in the browser or when static checks are not enough.

## What To Collect
- Exact page URL
- Exact action sequence that triggers the issue
- Whether the user was logged in or logged out
- Whether the issue happened on first load or after interaction
- Screenshot of the visible failure if helpful

## DevTools Console
- Capture the first red error line
- Expand the stack trace if present
- Include file name, line number, and message text
- Note whether the error happens before or after user interaction
- Ignore known low-signal warnings unless they appear to block runtime

## DevTools Network
- Check failed `trips`, `places`, `reviews`, auth, and storage requests
- Record request URL, status code, and response body when visible
- Confirm whether requests are pending forever, blocked, or returning an error
- Note CSP failures separately from API failures

## DevTools Application / Storage
- Check auth session presence in local storage only if auth looks broken
- Note if storage access is blocked by the browser
- Distinguish storage warnings from actual runtime exceptions

## Triage Rules
- `SyntaxError` or `ReferenceError` before first render is priority 1
- A failed `trips` request on the home page is priority 1
- A failed `places` or `reviews` request is priority 2 if base trip cards still render
- CSP violations are priority 1 only if they block required scripts or API calls
- Tracking prevention warnings alone are not enough to explain a broken page

## Agent Response Pattern
1. Restate the exact blocking error.
2. Map it to the file and initialization path.
3. Fix the smallest probable root cause.
4. Re-run static checks.
5. Ask for a fresh console capture only if the original blocking error is removed.

## Done Criteria
- The original blocking console error is removed or replaced with a more specific next error
- A non-blocking warning is not misclassified as the root cause
- The worklog records what browser evidence was used
