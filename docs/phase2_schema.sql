-- =====================================================
-- DateScape Phase 2: Schema Migration
-- =====================================================
-- This script extends the existing database with:
-- 1. Tags table (emotion/context tags)
-- 2. Entity_tags table (many-to-many linking)
-- 3. Comments.rating column (1-5 star reviews)
-- 4. RLS policies for all new tables
-- 5. Initial tag data seeding
-- =====================================================

-- =====================================================
-- STEP 1: Create Tags Table
-- =====================================================
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Tags
CREATE POLICY "Public can read tags"
    ON tags FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert tags"
    ON tags FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update tags"
    ON tags FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete tags"
    ON tags FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- STEP 2: Create Entity_Tags Table (Junction Table)
-- =====================================================
CREATE TABLE IF NOT EXISTS entity_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('trip', 'place', 'comment')),
    entity_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tag_id, entity_type, entity_id)
);

-- Enable RLS
ALTER TABLE entity_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Entity_Tags
CREATE POLICY "Public can read entity_tags"
    ON entity_tags FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert entity_tags"
    ON entity_tags FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete entity_tags"
    ON entity_tags FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- STEP 3: Add Rating Column to Comments
-- =====================================================
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- =====================================================
-- STEP 4: Update RLS Policies for Existing Tables
-- =====================================================

-- Trips Table
DROP POLICY IF EXISTS "Public can read trips" ON trips;
DROP POLICY IF EXISTS "Authenticated users can insert trips" ON trips;
DROP POLICY IF EXISTS "Authenticated users can update trips" ON trips;
DROP POLICY IF EXISTS "Authenticated users can delete trips" ON trips;

CREATE POLICY "Public can read trips"
    ON trips FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert trips"
    ON trips FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update trips"
    ON trips FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete trips"
    ON trips FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Places Table
DROP POLICY IF EXISTS "Public can read places" ON places;
DROP POLICY IF EXISTS "Authenticated users can insert places" ON places;
DROP POLICY IF EXISTS "Authenticated users can update places" ON places;
DROP POLICY IF EXISTS "Authenticated users can delete places" ON places;

CREATE POLICY "Public can read places"
    ON places FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert places"
    ON places FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update places"
    ON places FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete places"
    ON places FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Routes Table
DROP POLICY IF EXISTS "Public can read routes" ON routes;
DROP POLICY IF EXISTS "Authenticated users can insert routes" ON routes;
DROP POLICY IF EXISTS "Authenticated users can update routes" ON routes;
DROP POLICY IF EXISTS "Authenticated users can delete routes" ON routes;

CREATE POLICY "Public can read routes"
    ON routes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert routes"
    ON routes FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update routes"
    ON routes FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete routes"
    ON routes FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Comments Table (Updated)
DROP POLICY IF EXISTS "Public can read comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can update comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can delete comments" ON comments;

CREATE POLICY "Public can read comments"
    ON comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert comments"
    ON comments FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update comments"
    ON comments FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete comments"
    ON comments FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Todos Table
DROP POLICY IF EXISTS "Public can read todos" ON todos;
DROP POLICY IF EXISTS "Authenticated users can insert todos" ON todos;
DROP POLICY IF EXISTS "Authenticated users can update todos" ON todos;
DROP POLICY IF EXISTS "Authenticated users can delete todos" ON todos;

CREATE POLICY "Public can read todos"
    ON todos FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert todos"
    ON todos FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update todos"
    ON todos FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete todos"
    ON todos FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- STEP 5: Seed Initial Tags
-- =====================================================
INSERT INTO tags (name, description) VALUES
    ('비오는날', '비 오는 날 분위기 있는 데이트'),
    ('첫데이트', '첫 만남에 적합한 장소'),
    ('사진', '인스타그램 감성 포토존'),
    ('조용한대화', '대화하기 좋은 조용한 분위기'),
    ('노을', '석양/노을 뷰 명소'),
    ('야간데이트', '밤에 더 아름다운 장소'),
    ('카페', '카페/디저트 중심'),
    ('디너', '저녁 식사 추천'),
    ('전시', '갤러리/전시 문화 데이트'),
    ('한옥', '전통 한옥 분위기'),
    ('루프탑', '루프탑 뷰'),
    ('강변', '한강/강변 산책'),
    ('숲', '자연/숲 힐링'),
    ('기념일', '특별한 날 추천'),
    ('실내', '날씨 상관없는 실내 데이트')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- STEP 6: Create Indexes for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_entity_tags_tag_id ON entity_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_entity_tags_entity ON entity_tags(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- =====================================================
-- Migration Complete
-- =====================================================
-- Next Steps:
-- 1. Run this script in Supabase SQL Editor
-- 2. Verify all tables and policies are created
-- 3. Test with: SELECT * FROM tags;
-- 4. Update frontend to use new schema
-- =====================================================
