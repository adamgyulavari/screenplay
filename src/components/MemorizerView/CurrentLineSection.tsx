import { ArrowRight } from 'lucide-react';
import { FormattedText } from './FormattedText';
import { useAppSelector } from '../../store/hooks';
import { getColorClasses } from '../../utils/colors';
import { translations } from '../../utils/translations';

export const CurrentLineSection = () => {
  const character = useAppSelector((state) => state.app.selectedCharacter);
  const currentTextSegments = useAppSelector((state) => state.app.segments);
  const currentSegmentIndex = useAppSelector((state) => state.app.currentSegmentIndex);
  const showLine = useAppSelector((state) => state.app.showLine);
  
  if (!character) return null;

  return (
  <div className="mt-8 bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-600/30 shadow-2xl">
    <div className="flex items-center gap-3 mb-6">
      <div className={`px-4 py-2 rounded-full font-semibold bg-gradient-to-br ${getColorClasses(character.color).from} ${getColorClasses(character.color).to} text-white`}>
        {character.role}
      </div>
      <div className="text-slate-400 text-sm">
        {translations.yourLine}
      </div>
    </div>
    
    <div className="min-h-[200px] flex items-center justify-center">
      {showLine ? (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {currentTextSegments.length > 1 && (
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-700/50 rounded-full text-slate-300 text-sm">
                <span>{translations.segment} {currentSegmentIndex + 1} / {currentTextSegments.length}</span>
              </div>
            </div>
          )}
          
          {/* Show all revealed segments */}
          <div className="space-y-3 text-white text-lg leading-relaxed font-medium">
            <FormattedText text={currentTextSegments.slice(0, currentSegmentIndex + 1).join(' ')} />
          </div>
        </div>
      ) : (
        <div className="text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-slate-600/30 rounded-full flex items-center justify-center mb-4 mx-auto">
            <ArrowRight className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-400 text-lg">
            {translations.pressToReveal} <kbd className="px-2 py-1 bg-slate-600/50 rounded text-white font-mono text-sm">{translations.space}</kbd> {translations.or} 
            <kbd className="px-2 py-1 bg-slate-600/50 rounded text-white font-mono text-sm ml-1">→</kbd> {translations.toRevealLine}
          </p>
        </div>
      )}
    </div>
  </div>
)};
