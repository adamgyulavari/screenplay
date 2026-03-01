import React from 'react';
import {
  FileText,
  RotateCcw,
  User,
  Volume2,
  VolumeX,
  Users,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  clearSelectedCharacter,
  jump,
  setNotesView,
  toggleTTS,
} from '../../store/appSlice';
import { ProgressBar } from './ProgressBar';
import { getColorClasses } from '../../utils/colors';
import { translations } from '../../utils/translations';
import { AppHeader, headerBtnClass } from '../AppHeader';

interface HeaderProps {
  onManageUsers?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onManageUsers }) => {
  const dispatch = useAppDispatch();
  const character = useAppSelector((state: any) => state.app.selectedCharacter);
  const screenplay = useAppSelector((state: any) => state.app.screenplay);
  const currentDialogueIndex = useAppSelector(
    (state: any) => state.app.currentDialogueIndex
  );
  const scenes = useAppSelector((state: any) => state.app.scenes);
  const ttsEnabled = useAppSelector((state: any) => state.app.ttsEnabled);

  const handleBack = () => {
    dispatch(clearSelectedCharacter());
  };

  const handleReset = () => {
    if (character && character.dialogues[0] !== undefined) {
      dispatch(jump(character.dialogues[0]));
    }
  };

  const handleToggleTTS = () => {
    dispatch(toggleTTS());
  };

  if (!character || currentDialogueIndex === null) return null;

  const currentIndex = character.dialogues.findIndex(
    (d: number) => d === currentDialogueIndex
  );
  if (currentIndex === -1) return null;

  const totalLines = screenplay.length;
  const progress =
    totalLines > 0 ? ((currentDialogueIndex + 1) / totalLines) * 100 : 0;

  /** Map click on full screenplay bar to nearest character dialogue for jump. */
  const handleJump = (screenplayIndex: number) => {
    const dialogues = character.dialogues as number[];
    const nextOrCurrent = dialogues.find(d => d >= screenplayIndex);
    const target =
      nextOrCurrent !== undefined
        ? nextOrCurrent
        : dialogues[dialogues.length - 1];
    if (target !== undefined && target !== currentDialogueIndex) {
      dispatch(jump(target));
    }
  };

  const ttsClass = ttsEnabled
    ? 'flex items-center gap-2 px-3 py-2 bg-green-600/50 hover:bg-green-500/50 text-white rounded-lg transition-colors duration-200'
    : headerBtnClass;

  return (
    <AppHeader
      back={{ label: translations.backToCharacters, onClick: handleBack }}
      title={
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br ${getColorClasses(character.color).from} ${getColorClasses(character.color).to} text-white`}
        >
          <User className="w-4 h-4 md:w-5 md:h-5" />
          <span className="font-semibold text-sm md:text-base hidden sm:inline">
            {character.role}
          </span>
        </div>
      }
      center={
        <ProgressBar
          totalLines={totalLines}
          progress={progress}
          labelCurrent={currentIndex + 1}
          labelTotal={character.dialogues.length}
          scenes={scenes}
          onJump={handleJump}
          currentSegmentIndex={currentDialogueIndex}
        />
      }
      actions={
        <>
          <button
            onClick={() => dispatch(setNotesView(true))}
            className={headerBtnClass}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">{translations.notes}</span>
          </button>
          <button onClick={handleReset} className={headerBtnClass}>
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">{translations.reset}</span>
          </button>
          <button
            onClick={handleToggleTTS}
            title={translations.ttsTooltip}
            className={ttsClass}
          >
            {ttsEnabled ? (
              <>
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">{translations.ttsOn}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden sm:inline">{translations.ttsOff}</span>
              </>
            )}
          </button>
          {onManageUsers && (
            <button onClick={onManageUsers} className={headerBtnClass}>
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">
                {translations.manageUsers}
              </span>
            </button>
          )}
        </>
      }
    />
  );
};
