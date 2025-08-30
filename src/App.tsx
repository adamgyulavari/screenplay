import { useEffect } from 'react';
import { CharacterSelector } from './components/CharacterSelector';
import { MemorizerView } from './components/MemorizerView';
import { PasscodeInput } from './components/PasscodeInput';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { setSelectedCharacter, clearSelectedCharacter, setCharacters, setScreenplay } from './store/appSlice';
import { loadAccessData } from './utils/encryption';
import { processScreenplayData } from './utils/screenplay';

function App() {
  const dispatch = useAppDispatch();
  const { characters, selectedCharacter, isAuthenticated, screenplay } = useAppSelector((state: any) => state.app);

  // Load data when authenticated but data is missing
  useEffect(() => {
    if (isAuthenticated && (!characters.length || !screenplay.length)) {
      try {
        const decryptedData = loadAccessData();
        if (decryptedData) {
          const screenplayData = JSON.parse(decryptedData);
          const indexedScreenplay = screenplayData.map((item: any, index: number) => ({
            ...item,
            index
          }));
          
          const processedData = processScreenplayData(indexedScreenplay);
          dispatch(setScreenplay(indexedScreenplay));
          dispatch(setCharacters(processedData));
        }
      } catch (error) {
        console.error('Failed to reload data:', error);
      }
    }
  }, [isAuthenticated, characters.length, screenplay.length, dispatch]);

  const handleAuthenticationSuccess = () => {
    // Authentication handled in PasscodeInput component
  };

  const handleSelectCharacter = (character: any) => {
    dispatch(setSelectedCharacter(character));
  };

  const handleBackToSelection = () => {
    dispatch(clearSelectedCharacter());
  };

  if (!isAuthenticated) {
    return (
      <PasscodeInput
        onSuccess={handleAuthenticationSuccess}
      />
    );
  }

  if (selectedCharacter) {
    return <MemorizerView />;
  }

  return (
    <CharacterSelector
      characters={characters}
      onSelectCharacter={handleSelectCharacter}
    />
  );
}

export default App;
