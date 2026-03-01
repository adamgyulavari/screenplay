import React from 'react';
import { FileText, RotateCcw, User, Volume2, VolumeX, Users } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { clearSelectedCharacter, jump, setNotesView, toggleTTS } from '../../store/appSlice';
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

  if (!character) return null;

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
      center={<ProgressBar />}
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
