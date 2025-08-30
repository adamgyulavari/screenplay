import { ArrowRight, ArrowLeft } from 'lucide-react';
import { FormattedText } from './FormattedText';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { advance, moveBack } from '../../store/appSlice';
import { getColorClasses } from '../../utils/colors';
import { translations } from '../../utils/translations';
import { useEffect } from 'react';
import { analytics } from '../../utils/analytics';

export const CurrentLineSection = () => {
  const character = useAppSelector(state => state.app.selectedCharacter);
  const currentTextSegments = useAppSelector(state => state.app.segments);
  const currentSegmentIndex = useAppSelector(
    state => state.app.currentSegmentIndex
  );
  const showLine = useAppSelector(state => state.app.showLine);
  const dispatch = useAppDispatch();

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentSegmentIndex, currentTextSegments]);

  if (!character) return null;

  const handleNext = () => {
    dispatch(advance());

    analytics.trackCharacterAdvanced(character.role);
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

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden md:block mt-8 bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-600/30 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`px-4 py-2 rounded-full font-semibold bg-gradient-to-br ${getColorClasses(character.color).from} ${getColorClasses(character.color).to} text-white`}
          >
            {character.role}
          </div>
          <div className="text-slate-400 text-sm">{translations.yourLine}</div>
        </div>

        <div
          className="min-h-[200px] flex items-center justify-center cursor-pointer"
          onClick={handleNext}
        >
          {showLine ? (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              {currentTextSegments.length > 1 && (
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-700/50 rounded-full text-slate-300 text-sm">
                    <span>
                      {translations.segment} {currentSegmentIndex + 1} /{' '}
                      {currentTextSegments.length}
                    </span>
                  </div>
                </div>
              )}

              {/* Show all revealed segments */}
              <div className="space-y-3 text-white text-lg leading-relaxed font-medium">
                <FormattedText
                  text={currentTextSegments
                    .slice(0, currentSegmentIndex + 1)
                    .join(' ')}
                />
              </div>
            </div>
          ) : (
            <div className="text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-slate-600/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                <ArrowRight className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-400 text-lg">
                {translations.pressToReveal}{' '}
                <kbd className="px-2 py-1 bg-slate-600/50 rounded text-white font-mono text-sm">
                  {translations.space}
                </kbd>{' '}
                {translations.or}
                <kbd className="px-2 py-1 bg-slate-600/50 rounded text-white font-mono text-sm ml-1">
                  →
                </kbd>{' '}
                {translations.toRevealLine}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Version */}
      <div
        className="md:hidden mt-6 bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 shadow-2xl cursor-pointer"
        onClick={handleNext}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`px-3 py-1.5 rounded-full font-semibold bg-gradient-to-br ${getColorClasses(character.color).from} ${getColorClasses(character.color).to} text-white text-sm`}
          >
            {character.role}
          </div>
          <div className="text-slate-400 text-xs">{translations.yourLine}</div>
        </div>

        <div className="min-h-[150px] flex items-center justify-center mb-6">
          {showLine ? (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              {currentTextSegments.length > 1 && (
                <div className="text-center mb-3">
                  <div className="inline-flex items-center gap-2 px-2 py-1 bg-slate-700/50 rounded-full text-slate-300 text-xs">
                    <span>
                      {translations.segment} {currentSegmentIndex + 1} /{' '}
                      {currentTextSegments.length}
                    </span>
                  </div>
                </div>
              )}

              {/* Show all revealed segments */}
              <div className="space-y-2 text-white text-base leading-relaxed font-medium">
                <FormattedText
                  text={currentTextSegments
                    .slice(0, currentSegmentIndex + 1)
                    .join(' ')}
                />
              </div>
            </div>
          ) : (
            <div className="text-center animate-in fade-in duration-300">
              <div className="w-12 h-12 bg-slate-600/30 rounded-full flex items-center justify-center mb-3 mx-auto">
                <ArrowRight className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-300 text-sm px-4">
                {translations.pressToReveal} {translations.toRevealLine}.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Buttons - Fixed at Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={handlePrev}
            className="flex items-center justify-center w-14 h-14 bg-slate-700/50 hover:bg-slate-600/50 disabled:bg-slate-800/30 disabled:opacity-50 text-white rounded-full transition-all duration-200 shadow-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-full transition-all duration-200 shadow-lg transform hover:scale-105 font-medium"
          >
            <span>{translations.advance}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
};
