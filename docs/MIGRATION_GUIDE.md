# Migration Guide

## Goal
Move local itinerary data into Supabase tables.

## Steps
1. Backup current data.
2. Run `docs/setup_database.sql`.
3. Run `docs/phase2_schema.sql`.
4. Run `docs/reviews_schema.sql`.
5. Run `docs/update_rls_policies.sql`.
6. Upload local data through migration tool.
7. Validate row counts and sample queries.

## Validation
- `trips`, `places`, `routes` contain expected rows.
- `tags` table contains tag seed rows.
- `reviews` and `review_photos` tables exist.
- RLS allows public read for itinerary data and private access for reviews.
