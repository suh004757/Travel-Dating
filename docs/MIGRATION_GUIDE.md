# Phase 2 Database Migration Guide

## Overview
This guide walks you through migrating your DateScape database to support the new contextual tagging system.

---

## Prerequisites
- [ ] Access to Supabase Dashboard
- [ ] SQL Editor permissions
- [ ] Backup of existing data (recommended)

---

## Migration Steps

### Step 1: Backup Current Data (5 min)
**In Supabase Dashboard:**
1. Navigate to **Database** → **Backups**
2. Click **Create Backup** (or note the latest automatic backup time)
3. Verify backup completed successfully

### Step 2: Run Migration Script (10 min)
**In Supabase SQL Editor:**
1. Open `docs/phase2_schema.sql`
2. Copy the entire script
3. Paste into Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)
5. Verify: "Success. No rows returned" message

### Step 3: Verify New Tables (5 min)
**Run these verification queries:**

```sql
-- Check tags table
SELECT * FROM tags ORDER BY name;
-- Expected: 15 rows (비오는날, 첫데이트, etc.)

-- Check entity_tags table structure
SELECT * FROM entity_tags LIMIT 1;
-- Expected: Empty result (table exists but no data yet)

-- Check comments.rating column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'comments' AND column_name = 'rating';
-- Expected: 1 row showing 'rating' column exists
```

### Step 4: Test RLS Policies (5 min)
**Test Public Read Access:**
```sql
-- This should work (public read)
SELECT * FROM tags;
SELECT * FROM entity_tags;
```

**Test Auth-Required Write (will fail if not authenticated):**
```sql
-- This should fail with RLS error if not logged in
INSERT INTO tags (name, description) VALUES ('테스트', 'Test tag');
```

### Step 5: Update Frontend Config (2 min)
**Verify `config.js` has correct Supabase credentials:**
```javascript
const SUPABASE_CONFIG = {
    url: 'https://YOUR_PROJECT.supabase.co',
    anonKey: 'YOUR_ANON_KEY'
};
```

---

## What Changed?

### New Tables
| Table | Purpose | Columns |
|-------|---------|---------|
| `tags` | Emotion/context tags | id, name, description |
| `entity_tags` | Links tags to trips/places/comments | tag_id, entity_type, entity_id |

### Modified Tables
| Table | Change | Details |
|-------|--------|---------|
| `comments` | Added `rating` column | INTEGER (1-5), nullable |

### New RLS Policies
- **All tables**: Public READ, Authenticated WRITE
- **Enforcement**: `auth.uid() IS NOT NULL` for INSERT/UPDATE/DELETE

### Initial Data
- **15 tags** pre-seeded:
  - 비오는날, 첫데이트, 사진, 조용한대화, 노을
  - 야간데이트, 카페, 디너, 전시, 한옥
  - 루프탑, 강변, 숲, 기념일, 실내

---

## Rollback Plan (If Needed)

If something goes wrong, run this to undo changes:

```sql
-- Drop new tables
DROP TABLE IF EXISTS entity_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;

-- Remove rating column from comments
ALTER TABLE comments DROP COLUMN IF EXISTS rating;

-- Restore old RLS policies (from setup_database.sql)
-- (Re-run the original setup_database.sql policies section)
```

---

## Next Steps After Migration

1. **Test Authentication**
   - Enable Email provider in Supabase Auth settings
   - Set redirect URLs to your GitHub Pages domain

2. **Update Frontend Components**
   - Implement tag filtering UI
   - Add tag selection to trip/place forms
   - Display tags on trip detail pages

3. **Test CRUD Operations**
   - Login as admin
   - Try creating a trip with tags
   - Verify tags appear correctly

---

## Troubleshooting

### Error: "relation 'tags' already exists"
**Solution:** Table already created. Skip to verification step.

### Error: "column 'rating' already exists"
**Solution:** Column already added. Safe to continue.

### Error: "permission denied for table tags"
**Solution:** RLS policies not applied. Re-run Step 4 of migration script.

### Error: "auth.uid() does not exist"
**Solution:** Supabase Auth not enabled. Enable in Dashboard → Authentication.

---

## Migration Checklist

- [ ] Backup created
- [ ] Migration script executed
- [ ] Tags table verified (15 rows)
- [ ] Entity_tags table exists
- [ ] Comments.rating column exists
- [ ] RLS policies tested
- [ ] Frontend config updated
- [ ] Authentication enabled in Supabase

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Postgres Logs
2. Verify RLS policies: Dashboard → Database → Policies
3. Test queries in SQL Editor with detailed error messages
