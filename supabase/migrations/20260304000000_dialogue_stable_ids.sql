-- Phase 1: Add stable IDs to dialogue items and add dialogue_id columns.
-- Safe to apply while old code is still deployed (dialogue_index is preserved).

-- 1. Add a UUID id to every content item that doesn't already have one.
UPDATE public.screenplays
SET content = (
  SELECT coalesce(
    jsonb_agg(
      CASE
        WHEN elem ? 'id' THEN elem
        ELSE jsonb_set(elem, '{id}', to_jsonb(gen_random_uuid()::text))
      END
      ORDER BY idx
    ),
    '[]'::jsonb
  )
  FROM jsonb_array_elements(content) WITH ORDINALITY AS arr(elem, idx)
);

-- 2. Add dialogue_id to notes (keep dialogue_index for now).
ALTER TABLE public.screenplay_notes ADD COLUMN IF NOT EXISTS dialogue_id text;

UPDATE public.screenplay_notes n
SET dialogue_id = (
  SELECT elem->>'id'
  FROM public.screenplays s,
       jsonb_array_elements(s.content) WITH ORDINALITY AS arr(elem, idx)
  WHERE s.id = n.screenplay_id
    AND (arr.idx - 1) = n.dialogue_index
)
WHERE dialogue_id IS NULL;

-- Orphaned notes (index out of range) get a placeholder.
UPDATE public.screenplay_notes
SET dialogue_id = '__orphaned_' || id::text
WHERE dialogue_id IS NULL;

ALTER TABLE public.screenplay_notes ALTER COLUMN dialogue_id SET NOT NULL;

-- Make dialogue_index nullable so new code can insert without it.
ALTER TABLE public.screenplay_notes ALTER COLUMN dialogue_index DROP NOT NULL;

-- 3. Add dialogue_id to scenes (keep dialogue_index for now).
ALTER TABLE public.screenplay_scenes ADD COLUMN IF NOT EXISTS dialogue_id text;

UPDATE public.screenplay_scenes sc
SET dialogue_id = (
  SELECT elem->>'id'
  FROM public.screenplays s,
       jsonb_array_elements(s.content) WITH ORDINALITY AS arr(elem, idx)
  WHERE s.id = sc.screenplay_id
    AND (arr.idx - 1) = sc.dialogue_index
)
WHERE dialogue_id IS NULL;

UPDATE public.screenplay_scenes
SET dialogue_id = '__orphaned_' || id::text
WHERE dialogue_id IS NULL;

ALTER TABLE public.screenplay_scenes ALTER COLUMN dialogue_id SET NOT NULL;

-- Make dialogue_index nullable so new code can insert without it.
ALTER TABLE public.screenplay_scenes ALTER COLUMN dialogue_index DROP NOT NULL;
