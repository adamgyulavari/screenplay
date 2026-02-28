import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { supabase } from '../lib/supabase';
import { login, logout } from '../store/appSlice';
import { processScreenplayData } from '../utils/screenplay';
import { DEFAULT_SCREENPLAY_CONTENT } from '../data/defaultScreenplay';
import type { DialogueItem } from '../types/screenplay';

async function loadScreenplayAndLogin(
  userId: string,
  dispatch: ReturnType<typeof useDispatch>
) {
  const { data: accessRows, error } = await supabase
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
        title,
        author,
        owner_id
      )
    `
    )
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  let screenplayId: string;
  let isOwner = false;
  let content: { role: string; text: string }[];
  let characterRole: string | null = null;
  let currentDialogueIndex = 0;
  let currentSegmentIndex = 0;

  if (!accessRows || accessRows.length === 0) {
    const { data: inserted, error: insertError } = await supabase
      .from('screenplays')
      .insert({
        owner_id: userId,
        title: 'My screenplay',
        content: [...DEFAULT_SCREENPLAY_CONTENT],
      })
      .select('id, content')
      .single();

    if (insertError) throw insertError;
    screenplayId = inserted!.id;
    isOwner = true;
    content =
      (inserted!.content as { role: string; text: string }[]) ??
      [...DEFAULT_SCREENPLAY_CONTENT];
  } else {
    const first = accessRows[0];
    const sp = first.screenplays as unknown as {
      id: string;
      content: { role: string; text: string }[];
      owner_id: string;
    };
    screenplayId = sp.id;
    isOwner = sp.owner_id === userId;
    content = sp.content ?? [];
    characterRole = first.character_role ?? null;
    currentDialogueIndex = first.current_dialogue_index ?? 0;
    currentSegmentIndex = first.current_segment_index ?? 0;
  }

  const indexedScreenplay: DialogueItem[] = content.map((item, index) => ({
    ...item,
    index,
  }));
  const characters = processScreenplayData(indexedScreenplay);

  dispatch(
    login({
      screenplayId,
      isOwner,
      apiKey: null,
      characters,
      screenplay: indexedScreenplay,
      characterRole,
      currentDialogueIndex,
      currentSegmentIndex,
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
      loadScreenplayAndLogin(session.user.id, dispatch)
        .then(() => {
          if (mounted) setLoading(false);
        })
        .catch((e) => {
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
      loadScreenplayAndLogin(session.user.id, dispatch).catch((e) => {
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
