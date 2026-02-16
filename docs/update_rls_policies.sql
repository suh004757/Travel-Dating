-- Updated RLS policies
-- Run this after docs/setup_database.sql and docs/reviews_schema.sql

-- Ensure RLS is enabled
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_photos ENABLE ROW LEVEL SECURITY;

-- Drop old policies if present
DROP POLICY IF EXISTS "Public read trips" ON trips;
DROP POLICY IF EXISTS "Public read places" ON places;
DROP POLICY IF EXISTS "Public read routes" ON routes;

DROP POLICY IF EXISTS "Public insert for todos" ON todos;
DROP POLICY IF EXISTS "Public update for todos" ON todos;
DROP POLICY IF EXISTS "Auth users can insert todos" ON todos;
DROP POLICY IF EXISTS "Auth users can update todos" ON todos;
DROP POLICY IF EXISTS "Auth users can delete todos" ON todos;

DROP POLICY IF EXISTS "reviews_select" ON reviews;
DROP POLICY IF EXISTS "reviews_insert" ON reviews;
DROP POLICY IF EXISTS "reviews_update" ON reviews;
DROP POLICY IF EXISTS "reviews_delete" ON reviews;

DROP POLICY IF EXISTS "review_photos_select" ON review_photos;
DROP POLICY IF EXISTS "review_photos_insert" ON review_photos;
DROP POLICY IF EXISTS "review_photos_delete" ON review_photos;

DROP POLICY IF EXISTS "reviews_select_own" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_own" ON reviews;
DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
DROP POLICY IF EXISTS "reviews_delete_own" ON reviews;

DROP POLICY IF EXISTS "review_photos_select_own" ON review_photos;
DROP POLICY IF EXISTS "review_photos_insert_own" ON review_photos;
DROP POLICY IF EXISTS "review_photos_delete_own" ON review_photos;

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

-- Reviews: private notes (author only)
CREATE POLICY "reviews_select_own" ON reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "reviews_insert_own" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_delete_own" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Review photos: author only (through owning review)
CREATE POLICY "review_photos_select_own" ON review_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM reviews
      WHERE reviews.id = review_photos.review_id
        AND reviews.user_id = auth.uid()
    )
  );

CREATE POLICY "review_photos_insert_own" ON review_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM reviews
      WHERE reviews.id = review_photos.review_id
        AND reviews.user_id = auth.uid()
    )
  );

CREATE POLICY "review_photos_delete_own" ON review_photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM reviews
      WHERE reviews.id = review_photos.review_id
        AND reviews.user_id = auth.uid()
    )
  );
