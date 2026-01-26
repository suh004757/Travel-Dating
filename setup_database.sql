-- Supabase Database Setup for Date Itinerary App
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Trips Table (Main itinerary records)
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    emoji TEXT DEFAULT '💕',
    base_location JSONB NOT NULL,
    -- {name: "Hotel Name", lat: 37.5741, lng: 126.9854, address: "..."}
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Places Table (Restaurants & Cafes)
CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('restaurant', 'cafe')),
    name TEXT NOT NULL,
    category TEXT,
    area TEXT,
    distance TEXT,
    description TEXT,
    platform TEXT DEFAULT '네이버 지도',
    link TEXT,
    rating TEXT,
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Routes Table (Daily plans with options)
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    day_key TEXT NOT NULL,
    title TEXT NOT NULL,
    options JSONB NOT NULL,
    -- [{name: "Option A", description: "...", activities: [{time, name, description}]}]
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. To-Do List Table (Shared tasks)
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    task TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Comments Table (Inline notes on places)
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id UUID REFERENCES places(id) ON DELETE CASCADE,
    author TEXT,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_places_trip_id ON places(trip_id);
CREATE INDEX idx_routes_trip_id ON routes(trip_id);
CREATE INDEX idx_todos_trip_id ON todos(trip_id);
CREATE INDEX idx_comments_place_id ON comments(place_id);

-- Enable Row Level Security (RLS)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Public read access (for now - you can add auth later)
CREATE POLICY "Public read access for trips" ON trips FOR SELECT USING (true);
CREATE POLICY "Public read access for places" ON places FOR SELECT USING (true);
CREATE POLICY "Public read access for routes" ON routes FOR SELECT USING (true);
CREATE POLICY "Public read access for todos" ON todos FOR SELECT USING (true);
CREATE POLICY "Public read access for comments" ON comments FOR SELECT USING (true);

-- Public write access (temporary - replace with auth later)
CREATE POLICY "Public insert for todos" ON todos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update for todos" ON todos FOR UPDATE USING (true);
CREATE POLICY "Public insert for comments" ON comments FOR INSERT WITH CHECK (true);
