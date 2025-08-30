import { User, LogOut } from 'lucide-react';
import { Character } from '../types/screenplay';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { useScreenplayItem } from '../hooks/useScreenplayItem';
import { useTextSegments } from '../hooks/useScreenplayItem';
import { FormattedText } from './MemorizerView/FormattedText';
import { getColorClasses } from '../utils/colors';
import { logout, setSelectedCharacter } from '../store/appSlice';
import { clearAccessData } from '../utils/encryption';
import { translations } from '../utils/translations';

const CharacterPreview = ({ character }: { character: Character }) => {
  const screenplay = useAppSelector((state: any) => state.app.screenplay);
  const firstDialogueIndex = character.dialogues[0];
  const dialogueItem = useScreenplayItem(screenplay, firstDialogueIndex);
  const textSegments = useTextSegments(screenplay, firstDialogueIndex);
  
  if (firstDialogueIndex === undefined) return null;
  
  if (!dialogueItem) return null;

  const previewText = textSegments[0] || dialogueItem.text;
  const displayText = previewText.length > 100 ? previewText.slice(0, 100) + '...' : previewText;
  
  return (
    <p className="text-white/80 text-sm line-clamp-3">
      <span className="line-clamp-3">
        <FormattedText text={displayText} />
      </span>
    </p>
  );
};

export const CharacterSelector = () => {
  const dispatch = useAppDispatch();
  const characters = useAppSelector((state) => state.app.characters);
  
  const handleSelectCharacter = (character: Character) => {
    dispatch(setSelectedCharacter(character));
  };

  const handleLogout = () => {
    dispatch(logout());
    clearAccessData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="mb-4 flex justify-center items-center align-middle gap-4">
          
          <h1 className="text-5xl font-bold text-white tracking-tight flex-1">
            {translations.title}
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/50 hover:bg-red-500/50 text-white rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            {translations.logout}
          </button>
        </div>
          <p className="mb-12 text-xl text-slate-300 max-w-2xl leading-relaxed">
            {translations.subtitle}
          </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <button
              key={character.role}
              onClick={() => handleSelectCharacter(character)}
              className="group relative overflow-hidden rounded-2xl h-48 p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl transform-gpu"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${getColorClasses(character.color).from} ${getColorClasses(character.color).to} opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-start mb-4 gap-4">
                  <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                    <User className="w-8 h-8 text-white" />
                  </div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-white/90 transition-colors">
                  {character.role}
                </h3>
                </div>
                
                
                <CharacterPreview character={character} />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div 
                  className="h-full bg-white/40 transition-all duration-300 group-hover:bg-white/60"
                  style={{ width: '0%' }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
