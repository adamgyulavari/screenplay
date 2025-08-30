import React from 'react';
import { ArrowLeft, RotateCcw, User, LogOut } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { clearSelectedCharacter, jump, logout } from '../../store/appSlice';
import { clearAccessData } from '../../utils/encryption';
import { ProgressBar } from './ProgressBar';
import { getColorClasses } from '../../utils/colors';
import { translations } from '../../utils/translations';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const character = useAppSelector((state: any) => state.app.selectedCharacter);
  
  const handleBack = () => {
    dispatch(clearSelectedCharacter());
  };
  
  const handleReset = () => {
    if (character && character.dialogues[0] !== undefined) {
      dispatch(jump(character.dialogues[0]));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    clearAccessData();
  };

  if (!character) return null;

  return (
    <div className="py-4 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
      {/* Desktop Header */}
      <div className="hidden md:block max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            {translations.backToCharacters}
          </button>

          <ProgressBar />
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-br ${getColorClasses(character.color).from} ${getColorClasses(character.color).to} text-white`}>
              <User className="w-5 h-5" />
              <span className="font-semibold">{character.role}</span>
            </div>
            
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors duration-200"
            >
              <RotateCcw className="w-4 h-4" />
              {translations.reset}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/50 hover:bg-red-500/50 text-white rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              {translations.logout}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden px-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="p-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 mx-4">
            <ProgressBar />
          </div>

          <button
            onClick={handleReset}
            className="p-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors duration-200"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}; 
