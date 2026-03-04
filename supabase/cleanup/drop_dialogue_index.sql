-- Phase 2: Drop legacy dialogue_index columns.
-- Run manually in the Supabase SQL Editor AFTER the new code is deployed.

ALTER TABLE public.screenplay_notes DROP COLUMN IF EXISTS dialogue_index;
ALTER TABLE public.screenplay_scenes DROP COLUMN IF EXISTS dialogue_index;
