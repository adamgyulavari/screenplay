import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setNotes } from '../store/appSlice';
import { fetchNotes } from '../lib/screenplayNotes';

export function useScreenplayNotes(screenplayId: string | null) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!screenplayId) return;

    let mounted = true;
    fetchNotes(screenplayId)
      .then(notes => {
        if (mounted) dispatch(setNotes(notes));
      })
      .catch(() => {
        if (mounted) dispatch(setNotes([]));
      });

    return () => {
      mounted = false;
    };
  }, [screenplayId, dispatch]);
}
