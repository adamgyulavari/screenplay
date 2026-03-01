import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setScenes } from '../store/appSlice';
import { fetchScenes } from '../lib/screenplayScenes';

export function useScreenplayScenes(screenplayId: string | null) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!screenplayId) return;

    let mounted = true;
    fetchScenes(screenplayId)
      .then(scenes => {
        if (mounted) dispatch(setScenes(scenes));
      })
      .catch(() => {
        if (mounted) dispatch(setScenes([]));
      });

    return () => {
      mounted = false;
    };
  }, [screenplayId, dispatch]);
}
