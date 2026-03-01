import { CharacterSelector } from './components/CharacterSelector';
import { MemorizerView } from './components/MemorizerView';
import { NotesView } from './components/NotesView';
import { ScreenplaySelector } from './components/ScreenplaySelector';
import { Login } from './components/Login';
import { useAppSelector } from './store/hooks';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import { usePersistProgress } from './hooks/usePersistProgress';
import { useScreenplayNotes } from './hooks/useScreenplayNotes';
import { translations } from './utils/translations';
import type { RootState } from './store';

function App() {
  const { loading: authLoading, error: authError } = useSupabaseAuth();
  usePersistProgress();
  const { isAuthenticated, selectedCharacter, notesViewOpen, screenplayId } =
    useAppSelector((state: RootState) => state.app);
  useScreenplayNotes(screenplayId);

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

  if (!screenplayId) {
    return <ScreenplaySelector />;
  }

  if (notesViewOpen) {
    return <NotesView />;
  }

  if (selectedCharacter) {
    return <MemorizerView />;
  }

  return <CharacterSelector />;
}

export default App;
