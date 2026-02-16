# Phase 2 Requirements

## Product Direction
- Story-first itinerary planning, not only place listing.
- Mood tags for filtering and discovery.

## Functional Scope
- Create trips with date range and base location.
- Add places (restaurant, cafe, activity).
- Add route options with time-based activities.
- Add comments and optional ratings.
- Add shared todo list.

## Auth and Access
- Public read access.
- Authenticated write access.
- Comments are private: each user can only read their own comments.
- Use Supabase RLS policies.

## UI Scope
- Hub page with list of trips.
- Viewer page with map, tabs, filters, and route sections.
- Auth widget and modal.
