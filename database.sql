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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- 2. Enable Realtime for the 'photos' table
ALTER PUBLICATION supabase_realtime ADD TABLE photos;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

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

-- Anyone can upload photos (guests)
CREATE POLICY "Anyone can insert photos" ON photos 
FOR INSERT WITH CHECK (true);

-- Only the event creator can delete photos
CREATE POLICY "Event creators can delete photos" ON photos 
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM events WHERE events.id = photos.event_id AND events.user_id = auth.uid()
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
