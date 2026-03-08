# Supabase Safety Checklist

## Must Stay True
- No schema changes without approval
- No RLS policy changes without approval
- No storage policy changes without approval
- Auth-gated actions must fail safely
- Public read flows must not assume authenticated state

## Review Questions
- Did any code change assume a new column?
- Did any code change assume a new table?
- Did any code change widen write capability?
- Did any code change bypass an auth or ownership check?
