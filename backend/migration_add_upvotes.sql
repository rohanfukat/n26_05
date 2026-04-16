-- Migration: Add upvote columns to grievances table
-- Run this against your PostgreSQL database to add the new columns.

ALTER TABLE grievances ADD COLUMN IF NOT EXISTS upvotes INTEGER NOT NULL DEFAULT 0;
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS upvoted_by TEXT[] NOT NULL DEFAULT '{}';
