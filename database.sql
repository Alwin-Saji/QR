-- ========================================================
-- ARC: Supabase Database Schema & Policies
-- ========================================================
-- Run this entire script in your Supabase SQL Editor.
-- Ensure you have created a public Storage Bucket named 'events'.
-- ========================================================

-- 1. Create Tables
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id)
);

CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  uploaded_by TEXT,
  uploader_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE restricted_uploaders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  uploader_id TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (event_id, uploader_id)
);

-- 2. Enable Realtime for the 'photos' table
ALTER PUBLICATION supabase_realtime ADD TABLE photos;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE restricted_uploaders ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- Events Table Policies
-- ========================================================

-- Anyone can view an event (so guests can see the live page)
CREATE POLICY "Events are public to view" ON events 
FOR SELECT USING (true);

-- Only authenticated users can create events
CREATE POLICY "Users can create events" ON events 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Only the creator can update or delete their event
CREATE POLICY "Users can manage their events" ON events 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their events" ON events 
FOR DELETE USING (auth.uid() = user_id);


-- ========================================================
-- Photos Table Policies
-- ========================================================

-- Anyone can view photos
CREATE POLICY "Photos are public to view" ON photos 
FOR SELECT USING (true);

-- Anyone can upload photos unless that uploader has been restricted
CREATE POLICY "Anyone can insert photos" ON photos 
FOR INSERT WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM restricted_uploaders
    WHERE restricted_uploaders.event_id = photos.event_id
    AND restricted_uploaders.uploader_id = photos.uploader_id
  )
);

-- Only the event creator can delete photos
CREATE POLICY "Event creators can delete photos" ON photos 
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM events WHERE events.id = photos.event_id AND events.user_id = auth.uid()
  )
);

-- ========================================================
-- Restricted Uploaders Table Policies
-- ========================================================

-- Anyone can check whether they are restricted before uploading
CREATE POLICY "Restricted uploaders are public to view" ON restricted_uploaders
FOR SELECT USING (true);

-- Only the event creator can restrict an uploader
CREATE POLICY "Event creators can restrict uploaders" ON restricted_uploaders
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM events WHERE events.id = restricted_uploaders.event_id AND events.user_id = auth.uid()
  )
);

-- Only the event creator can remove an uploader restriction
CREATE POLICY "Event creators can unrestrict uploaders" ON restricted_uploaders
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM events WHERE events.id = restricted_uploaders.event_id AND events.user_id = auth.uid()
  )
);

-- ========================================================
-- Storage Policies (Requires a bucket named 'events')
-- ========================================================

-- Allow anyone to view files in the 'events' bucket
CREATE POLICY "Public View Events Bucket" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'events' );

-- Allow anyone to upload files to the 'events' bucket
CREATE POLICY "Public Upload Events Bucket" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'events' );

-- Allow event creators to delete files from the 'events' bucket
CREATE POLICY "Event Creators can delete files" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'events' AND 
  EXISTS (
    SELECT 1 FROM events 
    WHERE events.id::text = (string_to_array(storage.objects.name, '/'))[1] 
    AND events.user_id = auth.uid()
  )
);
