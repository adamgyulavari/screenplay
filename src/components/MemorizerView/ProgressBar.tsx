import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { jump } from '../../store/appSlice';
import { translations } from '../../utils/translations';

export const ProgressBar = () => {
  const dispatch = useAppDispatch();
  const character = useAppSelector((state: any) => state.app.selectedCharacter);
  const currentDialogueIndex = useAppSelector((state: any) => state.app.currentDialogueIndex);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  
  if (!character || currentDialogueIndex === null) return null;
  
  const currentIndex = character.dialogues.findIndex((dialogue: number) => dialogue === currentDialogueIndex);
  if (currentIndex === -1) return null;
  
  const totalLines = character.dialogues.length;
  const progress = ((currentIndex + 1) / totalLines) * 100;
  const hoverProgress = hoverIndex !== null ? ((hoverIndex + 1) / totalLines) * 100 : null;
  
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const index = Math.floor(percentage * totalLines);
    setHoverIndex(Math.max(0, Math.min(index, totalLines - 1)));
  };
  
  const handleMouseLeave = () => {
    setHoverIndex(null);
  };
  
  const handleClick = () => {
    if (hoverIndex !== null && hoverIndex !== currentIndex) {
      const targetDialogueIndex = character.dialogues[hoverIndex];
      dispatch(jump(targetDialogueIndex));
    }
  };
  
  return (
    <div className="p-4 flex-grow">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-300 text-sm font-medium">
            {currentIndex + 1} / {totalLines}
          </span>
          <span className="text-slate-300 text-sm">
            {Math.round(progress)}% {translations.complete}
          </span>
        </div>
        
        <div className="relative overflow-visible">
          <div 
            className="w-full bg-slate-700 rounded-full h-2 cursor-pointer relative overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
          >
            {/* Base progress bar */}
            <div 
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
            
            {/* Hover highlight */}
            {hoverProgress !== null && hoverProgress > progress && (
              <div 
                className="absolute top-0 left-0 bg-gradient-to-r from-amber-400/60 to-orange-400/60 h-2 rounded-full transition-all duration-100 ease-out"
                style={{ width: `${hoverProgress}%` }}
              />
            )}
            
            {/* Hover indicator */}
            {hoverIndex !== null && (
              <div 
                className="absolute top-0 w-0.5 h-2 bg-white shadow-lg transition-all duration-100 ease-out"
                style={{ left: `${hoverProgress}%` }}
              />
            )}
          </div>
          
          {/* Hover tooltip */}
          { hoverIndex !== null && (
            <div 
              className="absolute w-max bottom-4 transform -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs font-medium shadow-lg transition-all duration-100 ease-out z-100"
              style={{ left: `${hoverProgress}%` }}
            >
              {translations.jumpToLine} {hoverIndex + 1}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
