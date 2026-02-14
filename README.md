# DateScape

DateScape is a story-driven date planner.

## Overview
- Plan date itineraries with places and route options.
- Show places on a map.
- Manage shared tasks and notes.
- Support auth-based editing with Supabase.

## Project Structure
- `index.html`: hub page
- `view.html`: itinerary viewer
- `app.js`: viewer logic
- `components/`: auth, weather, todos, comments
- `itineraries/`: local data backup
- `docs/`: setup and migration docs

## Setup
1. Create a Supabase project.
2. Run SQL files in `docs/setup_database.sql` and `docs/phase2_schema.sql`.
3. Fill API values in `config.js`.
4. Open `index.html` and verify loading.

## Notes
- Public users can read data.
- Logged-in users can create and edit data based on RLS policies.
