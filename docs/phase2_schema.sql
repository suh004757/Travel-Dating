-- Phase 2 schema extension

CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS entity_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO tags (name, description) VALUES
    ('rainy-day', 'Good for rainy weather'),
    ('first-date', 'Good for first date'),
    ('photo-spot', 'Great for photos'),
    ('quiet-talk', 'Good for conversation'),
    ('sunset', 'Sunset view'),
    ('night-date', 'Best at night'),
    ('cafe', 'Cafe focused'),
    ('dinner', 'Dinner focused'),
    ('exhibition', 'Gallery and exhibition'),
    ('hanok', 'Traditional hanok mood'),
    ('rooftop', 'Rooftop view'),
    ('riverside', 'Riverside walk'),
    ('forest', 'Nature and green space'),
    ('anniversary', 'Special occasion'),
    ('indoor', 'Indoor option')
ON CONFLICT (name) DO NOTHING;
