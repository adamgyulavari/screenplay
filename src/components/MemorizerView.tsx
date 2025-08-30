import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { advance, clearSelectedCharacter, moveBack } from '../store/appSlice';
import { Header } from './MemorizerView/Header';
import { ContextSection } from './MemorizerView/ContextSection';
import { CurrentLineSection } from './MemorizerView/CurrentLineSection';
import { NavigationInstructions } from './MemorizerView/NavigationInstructions';
import { translations } from '../utils/translations';

export const MemorizerView = () => {
  const dispatch = useAppDispatch();
  const currentDialogueIndex = useAppSelector((state) => state.app.currentDialogueIndex);
  const currentSegmentIndex = useAppSelector((state) => state.app.currentSegmentIndex);
  const currentTextSegments = useAppSelector((state) => state.app.segments);

  const handleNext = () => {
    dispatch(advance());
  };

  const handlePrev = () => {
    dispatch(moveBack());
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Space' || event.code === 'ArrowRight') {
      event.preventDefault();
      handleNext();
    } else if (event.code === 'ArrowLeft') {
      event.preventDefault();
      handlePrev();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentDialogueIndex, currentSegmentIndex, currentTextSegments]);

  if (currentDialogueIndex === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{translations.noMoreDialogue}</h2>
          <button
            onClick={() => dispatch(clearSelectedCharacter())}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {translations.backToCharacterSelection}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <div className="max-w-4xl mx-auto px-6">
        <ContextSection currentDialogueIndex={currentDialogueIndex} />

        <CurrentLineSection />

        <NavigationInstructions hasSegments={currentTextSegments.length > 1} />
      </div>
    </div>
  );
};
