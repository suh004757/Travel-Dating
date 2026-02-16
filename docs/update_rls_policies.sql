-- Updated RLS policies
-- Run this in Supabase SQL Editor

-- Ensure RLS is enabled
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Drop old policies if present
DROP POLICY IF EXISTS "Public read trips" ON trips;
DROP POLICY IF EXISTS "Public read places" ON places;
DROP POLICY IF EXISTS "Public read routes" ON routes;
DROP POLICY IF EXISTS "Public read comments" ON comments;
DROP POLICY IF EXISTS "Public read todos" ON todos;

DROP POLICY IF EXISTS "Public insert for todos" ON todos;
DROP POLICY IF EXISTS "Public update for todos" ON todos;
DROP POLICY IF EXISTS "Public insert for comments" ON comments;

DROP POLICY IF EXISTS "Auth users can insert todos" ON todos;
DROP POLICY IF EXISTS "Auth users can update todos" ON todos;
DROP POLICY IF EXISTS "Auth users can delete todos" ON todos;

DROP POLICY IF EXISTS "Auth users can insert comments" ON comments;
DROP POLICY IF EXISTS "Auth users can delete comments" ON comments;

DROP POLICY IF EXISTS "Users can read their own comments" ON comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- Public read for itinerary data
CREATE POLICY "Public read trips" ON trips
  FOR SELECT USING (true);

CREATE POLICY "Public read places" ON places
  FOR SELECT USING (true);

CREATE POLICY "Public read routes" ON routes
  FOR SELECT USING (true);

-- Todos: authenticated users can manage
CREATE POLICY "Auth users can insert todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auth users can update todos" ON todos
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth users can delete todos" ON todos
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Comments: private to each author
CREATE POLICY "Users can read their own comments" ON comments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);
