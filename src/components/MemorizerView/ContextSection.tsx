
import { CharacterContextItem } from './CharacterContextItem';
import { FormattedText } from './FormattedText';
import { useAppSelector } from '../../store/hooks';
import { useScreenplayItems } from '../../hooks/useScreenplayItem';

export const ContextSection = ({ currentDialogueIndex }: { currentDialogueIndex: number }) => {
  const screenplay = useAppSelector((state) => state.app.screenplay);
  
  const contextStart = Math.max(0, currentDialogueIndex - 8);
  const contextIndexes = Array.from(
      { length: currentDialogueIndex - contextStart }, 
      (_, i) => contextStart + i
    );
  
  const contextItems = useScreenplayItems(screenplay, contextIndexes);
  
  if (!contextItems.length) return null;
  
  return (
    <div className="relative h-96 overflow-hidden">
    <div className="h-full space-y-4 flex flex-col justify-end">
        {contextItems.map((contextItem, idx) => (
        <div
            key={contextItem.role + idx}
            className="p-4 rounded-xl border border-slate-600/50 transition-all duration-500 bg-slate-800/30 opacity-70"
        >
            <p className="text-slate-200 leading-relaxed">
            {contextItem.role.split(', ').map((role) => <CharacterContextItem role={role} />)}
            <FormattedText text={contextItem.text} />
            </p>
        </div>
        ))}
    </div>
    <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-slate-900 via-slate-900/80 to-transparent pointer-events-none" />
    </div>
  );
}; 
