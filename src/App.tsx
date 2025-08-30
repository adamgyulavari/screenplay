import { useEffect } from 'react';
import { CharacterSelector } from './components/CharacterSelector';
import { MemorizerView } from './components/MemorizerView';
import { PasscodeInput } from './components/PasscodeInput';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { logout } from './store/appSlice';

function App() {
  const dispatch = useAppDispatch();
  const { characters, isAuthenticated, screenplay, apiKey, selectedCharacter } =
    useAppSelector((state: any) => state.app);

  useEffect(() => {
    if (
      isAuthenticated &&
      (!characters.length || !screenplay.length || !apiKey)
    ) {
      dispatch(logout());
    }
  }, [isAuthenticated, characters.length, screenplay.length, apiKey, dispatch]);

  if (!isAuthenticated) {
    return <PasscodeInput />;
  }

  if (selectedCharacter) {
    return <MemorizerView />;
  }

  return <CharacterSelector />;
}

export default App;
