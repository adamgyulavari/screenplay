import { useEffect } from 'react';
import { CharacterSelector } from './components/CharacterSelector';
import { MemorizerView } from './components/MemorizerView';
import { Login } from './components/Login';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { logout } from './store/appSlice';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import { usePersistProgress } from './hooks/usePersistProgress';
import { translations } from './utils/translations';
import type { RootState } from './store';

function App() {
  const dispatch = useAppDispatch();
  const { loading: authLoading, error: authError } = useSupabaseAuth();
  usePersistProgress();
  const { characters, isAuthenticated, screenplay, selectedCharacter } =
    useAppSelector((state: RootState) => state.app);

  useEffect(() => {
    if (isAuthenticated && (!characters.length || !screenplay.length)) {
      dispatch(logout());
    }
  }, [isAuthenticated, characters.length, screenplay.length, dispatch]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <p className="text-white">{translations.loadingAuth}</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center text-red-400 max-w-md px-4">
          <p>{authError}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  if (selectedCharacter) {
    return <MemorizerView />;
  }

  return <CharacterSelector />;
}

export default App;
