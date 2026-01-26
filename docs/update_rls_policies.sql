-- Updated RLS Policies for Authentication
-- Run this in Supabase SQL Editor to enable auth-only editing

-- Drop old public write policies
DROP POLICY IF EXISTS "Public insert for todos" ON todos;
DROP POLICY IF EXISTS "Public update for todos" ON todos;
DROP POLICY IF EXISTS "Public insert for comments" ON comments;

-- Todos: Auth required for write operations
CREATE POLICY "Auth users can insert todos" ON todos 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auth users can update todos" ON todos 
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth users can delete todos" ON todos 
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Comments: Auth required for write operations
CREATE POLICY "Auth users can insert comments" ON comments 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auth users can delete comments" ON comments 
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Trips, Places, Routes: Keep as read-only for now (admin only via dashboard)
-- These don't need auth policies since users won't edit them directly
