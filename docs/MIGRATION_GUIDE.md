# Migration Guide

## Goal
Move local itinerary data into Supabase tables.

## Steps
1. Backup current data.
2. Run `docs/setup_database.sql`.
3. Run `docs/phase2_schema.sql`.
4. Upload local data through migration tool.
5. Validate row counts and sample queries.

## Validation
- `trips`, `places`, `routes` contain expected rows.
- `tags` table contains tag seed rows.
- RLS allows read for public and write for authenticated users.
