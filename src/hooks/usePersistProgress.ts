import { useEffect, useRef } from 'react';
import { useAppSelector } from '../store/hooks';
import { supabase } from '../lib/supabase';

const DEBOUNCE_MS = 500;

export function usePersistProgress() {
  const screenplayId = useAppSelector(state => state.app.screenplayId);
  const selectedCharacter = useAppSelector(
    state => state.app.selectedCharacter
  );
  const currentDialogueIndex = useAppSelector(
    state => state.app.currentDialogueIndex
  );
  const currentSegmentIndex = useAppSelector(
    state => state.app.currentSegmentIndex
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!screenplayId) return;

    const persist = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      await supabase.from('screenplay_access').upsert(
        {
          screenplay_id: screenplayId,
          user_id: session.user.id,
          character_role: selectedCharacter?.role ?? null,
          current_dialogue_index: currentDialogueIndex ?? 0,
          current_segment_index: currentSegmentIndex,
        },
        {
          onConflict: 'screenplay_id,user_id',
        }
      );
    };

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(persist, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [
    screenplayId,
    selectedCharacter?.role,
    currentDialogueIndex,
    currentSegmentIndex,
  ]);
}
