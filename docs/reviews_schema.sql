-- Reviews & Photos schema for DateScape
-- Run this in Supabase SQL Editor after docs/setup_database.sql

-- Reviews table: one review per user per place
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    text TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(place_id, user_id)
);

-- Review photos table
CREATE TABLE IF NOT EXISTS review_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_photos ENABLE ROW LEVEL SECURITY;

-- Drop old/non-private policies if present
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

-- Reviews: public read
CREATE POLICY "reviews_select_own" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "reviews_insert_own" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own" ON reviews
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_delete_own" ON reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Review photos: public read
CREATE POLICY "review_photos_select_own" ON review_photos
    FOR SELECT USING (true);

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

-- Auto-update updated_at on reviews
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reviews_updated_at ON reviews;
CREATE TRIGGER reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();

-- Storage bucket for review photos (run via Supabase Dashboard or API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('review-photos', 'review-photos', true);
--
-- Storage policies:
-- CREATE POLICY "review_photos_upload" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'review-photos' AND auth.uid() IS NOT NULL);
-- CREATE POLICY "review_photos_read" ON storage.objects
--   FOR SELECT USING (bucket_id = 'review-photos');
-- CREATE POLICY "review_photos_delete" ON storage.objects
--   FOR DELETE USING (bucket_id = 'review-photos' AND auth.uid() IS NOT NULL);
