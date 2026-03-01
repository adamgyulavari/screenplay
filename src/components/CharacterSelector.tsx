import { useMemo, useState } from 'react';
import { User, Users, FileText } from 'lucide-react';
import { Character, DialogueItem } from '../types/screenplay';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { useScreenplayItem } from '../hooks/useScreenplayItem';
import { useTextSegments } from '../hooks/useScreenplayItem';
import { FormattedText } from './MemorizerView/FormattedText';
import { getColorClasses } from '../utils/colors';
import { deselectScreenplay, setSelectedCharacter, setNotesView } from '../store/appSlice';
import { ManageUsersPanel } from './ManageUsersPanel';
import { translations } from '../utils/translations';
import { analytics } from '../utils/analytics';
import { splitLongText } from '../utils/screenplay';
import { AppHeader, headerBtnClass } from './AppHeader';

const CharacterPreview = ({ character }: { character: Character }) => {
  const screenplay = useAppSelector((state: any) => state.app.screenplay);
  const firstDialogueIndex = character.dialogues[0];
  const dialogueItem = useScreenplayItem(screenplay, firstDialogueIndex);
  const textSegments = useTextSegments(screenplay, firstDialogueIndex);

  if (firstDialogueIndex === undefined) return null;

  if (!dialogueItem) return null;

  const previewText = textSegments[0] || dialogueItem.text;
  const displayText =
    previewText.length > 100 ? previewText.slice(0, 100) + '...' : previewText;

  return (
    <p className="text-white/80 text-sm line-clamp-3">
      <span className="line-clamp-3">
        <FormattedText text={displayText} />
      </span>
    </p>
  );
};

function useSegmentCounts(characters: Character[], screenplay: DialogueItem[]) {
  return useMemo(() => {
    const counts = new Map<string, number>();
    for (const char of characters) {
      let total = 0;
      for (const idx of char.dialogues) {
        const item = screenplay[idx];
        if (item) total += splitLongText(item.text).length;
      }
      counts.set(char.role, total);
    }
    return counts;
  }, [characters, screenplay]);
}

export const CharacterSelector = () => {
  const dispatch = useAppDispatch();
  const characters = useAppSelector(state => state.app.characters);
  const screenplay = useAppSelector(state => state.app.screenplay);
  const isOwner = useAppSelector(state => state.app.isOwner);
  const hasMultipleScreenplays = useAppSelector(
    state => state.app.availableScreenplays.length > 1
  );
  const segmentCounts = useSegmentCounts(characters, screenplay);
  const [manageUsersOpen, setManageUsersOpen] = useState(false);

  const handleSelectCharacter = (character: Character) => {
    dispatch(setSelectedCharacter(character));
    analytics.trackCharacterSelected(character.role);
  };

  const backAction = hasMultipleScreenplays
    ? { label: translations.backToScreenplays, onClick: () => dispatch(deselectScreenplay()) }
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <AppHeader
        back={backAction}
        title={translations.title}
        actions={
          <>
            <button
              onClick={() => dispatch(setNotesView(true))}
              className={headerBtnClass}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">{translations.notes}</span>
            </button>
            {isOwner && (
              <button
                onClick={() => setManageUsersOpen(true)}
                className={headerBtnClass}
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {translations.manageUsers}
                </span>
              </button>
            )}
          </>
        }
      />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <p className="mb-12 text-xl text-slate-300 max-w-2xl leading-relaxed">
            {translations.subtitle}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map(character => (
              <button
                key={character.role}
                onClick={() => handleSelectCharacter(character)}
                className="group relative overflow-hidden rounded-2xl h-48 p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl transform-gpu"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${getColorClasses(character.color).from} ${getColorClasses(character.color).to} opacity-90 group-hover:opacity-100 transition-opacity duration-300`}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-start mb-4 gap-4">
                    <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-white/90 transition-colors">
                      {character.role}
                    </h3>
                  </div>

                  {isOwner && (
                    <p className="text-white/70 text-sm mb-1">
                      {character.dialogues.length} {translations.lines} ·{' '}
                      {segmentCounts.get(character.role) ?? 0}{' '}
                      {translations.segments}
                    </p>
                  )}
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

      {isOwner && (
        <ManageUsersPanel
          isOpen={manageUsersOpen}
          onClose={() => setManageUsersOpen(false)}
        />
      )}
    </div>
  );
};
