import { useEffect } from 'react';
import { CharacterSelector } from './components/CharacterSelector';
import { MemorizerView } from './components/MemorizerView';
import { PasscodeInput } from './components/PasscodeInput';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { setSelectedCharacter, clearSelectedCharacter } from './store/appSlice';

function App() {
  const dispatch = useAppDispatch();
  const { characters, selectedCharacter, isAuthenticated } = useAppSelector((state: any) => state.app);

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
    return (
      <MemorizerView
        character={selectedCharacter}
        onBack={handleBackToSelection}
      />
    );
  }

  return (
    <CharacterSelector
      characters={characters}
      onSelectCharacter={handleSelectCharacter}
    />
  );
}

export default App;
