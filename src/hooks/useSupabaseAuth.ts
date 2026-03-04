import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { supabase } from '../lib/supabase';
import { login, logout, setAuthenticated } from '../store/appSlice';
import { processScreenplayData } from '../utils/screenplay';
import type { DialogueItem, ScreenplaySummary } from '../types/screenplay';

async function loadAvailableScreenplays(
  userId: string,
  dispatch: ReturnType<typeof useDispatch>
) {
  const { data: accessRows, error } = await supabase
    .from('screenplay_access')
    .select(
      `
      screenplay_id,
      character_role,
      screenplays (
        id,
        title,
        author,
        owner_id
      )
    `
    )
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  const summaries: ScreenplaySummary[] = (accessRows ?? []).map(row => {
    const sp = row.screenplays as unknown as {
      id: string;
      title: string;
      author: string | null;
      owner_id: string;
    };
    return {
      id: sp.id,
      title: sp.title,
      author: sp.author,
      characterRole: row.character_role ?? null,
      isOwner: sp.owner_id === userId,
    };
  });

  if (summaries.length === 1) {
    await loadAndSelectScreenplay(summaries[0].id, userId, summaries, dispatch);
  } else {
    dispatch(setAuthenticated({ availableScreenplays: summaries }));
  }
}

export async function loadAndSelectScreenplay(
  screenplayId: string,
  userId: string,
  availableScreenplays: ScreenplaySummary[],
  dispatch: ReturnType<typeof useDispatch>
) {
  const { data: accessRow, error } = await supabase
    .from('screenplay_access')
    .select(
      `
      screenplay_id,
      character_role,
      current_dialogue_index,
      current_segment_index,
      screenplays (
        id,
        content,
        owner_id
      )
    `
    )
    .eq('user_id', userId)
    .eq('screenplay_id', screenplayId)
    .single();

  if (error) throw error;

  const sp = accessRow.screenplays as unknown as {
    id: string;
    content: { id: string; role: string; text: string }[];
    owner_id: string;
  };

  const content = sp.content ?? [];
  const indexedScreenplay: DialogueItem[] = content.map((item, index) => ({
    ...item,
    index,
  }));
  const characters = processScreenplayData(indexedScreenplay);

  dispatch(
    login({
      availableScreenplays,
      screenplayId: sp.id,
      isOwner: sp.owner_id === userId,
      apiKey: null,
      characters,
      screenplay: indexedScreenplay,
      characterRole: accessRow.character_role ?? null,
      currentDialogueIndex: accessRow.current_dialogue_index ?? 0,
      currentSegmentIndex: accessRow.current_segment_index ?? 0,
    })
  );
}

export function useSupabaseAuth() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (!session) {
        dispatch(logout());
        setLoading(false);
        return;
      }
      loadAvailableScreenplays(session.user.id, dispatch)
        .then(() => {
          if (mounted) setLoading(false);
        })
        .catch(e => {
          if (mounted) {
            setError(e?.message ?? 'Failed to load screenplay');
            setLoading(false);
          }
        });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) {
        dispatch(logout());
        return;
      }
      loadAvailableScreenplays(session.user.id, dispatch).catch(e => {
        if (mounted) setError(e?.message ?? 'Failed to load screenplay');
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return { loading, error };
}
