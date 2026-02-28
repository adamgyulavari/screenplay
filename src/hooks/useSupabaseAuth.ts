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
  const { data: rows, error } = await supabase
    .from('screenplays')
    .select('id, content')
    .eq('user_id', userId)
    .limit(1);

  if (error) throw error;

  let content: { role: string; text: string }[];

  if (!rows || rows.length === 0) {
    const { data: inserted, error: insertError } = await supabase
      .from('screenplays')
      .insert({
        user_id: userId,
        title: 'My screenplay',
        content: [...DEFAULT_SCREENPLAY_CONTENT],
      })
      .select('content')
      .single();

    if (insertError) throw insertError;
    content = (inserted?.content as { role: string; text: string }[]) ?? [...DEFAULT_SCREENPLAY_CONTENT];
  } else {
    content = (rows[0].content as { role: string; text: string }[]) ?? [];
  }

  const indexedScreenplay: DialogueItem[] = content.map((item, index) => ({
    ...item,
    index,
  }));
  const characters = processScreenplayData(indexedScreenplay);

  dispatch(
    login({
      apiKey: null,
      characters,
      screenplay: indexedScreenplay,
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
