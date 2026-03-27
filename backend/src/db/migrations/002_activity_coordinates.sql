-- Migration 002 — Add lat/lng coordinates to activities
-- Run in Supabase SQL Editor

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS latitude  NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);
