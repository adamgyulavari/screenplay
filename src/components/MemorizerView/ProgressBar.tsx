import React, { useState } from 'react';
import { translations } from '../../utils/translations';

export interface ProgressBarScene {
  id: string;
  dialogueIndex: number;
  title: string;
}

export interface ProgressBarProps {
  /** Bar scale: total segments (e.g. screenplay.length). Used for scene positions and click → index. */
  totalLines: number;
  /** Fill percentage 0–100 (e.g. progress through screenplay or character). */
  progress: number;
  /** For "X / Y" label (e.g. character line 3 of 10, or scroll position). */
  labelCurrent: number;
  labelTotal: number;
  scenes?: ProgressBarScene[];
  /** Called with the segment index under the click (0 to totalLines-1). Caller maps to jump target if needed. */
  onJump: (segmentIndex: number) => void;
  /** If provided, click is no-op when hover is on this segment (avoids redundant jump). */
  currentSegmentIndex?: number;
}

export const ProgressBar = ({
  totalLines,
  progress,
  labelCurrent,
  labelTotal,
  scenes = [],
  onJump,
  currentSegmentIndex,
}: ProgressBarProps) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverSceneId, setHoverSceneId] = useState<string | null>(null);

  if (totalLines === 0) return null;

  const hoverProgress =
    hoverIndex !== null ? (hoverIndex / totalLines) * 100 : null;

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('[data-scene-marker]')) {
      setHoverIndex(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const index = Math.floor(percentage * totalLines);
    setHoverIndex(Math.max(0, Math.min(index, totalLines - 1)));
    setHoverSceneId(null);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setHoverSceneId(null);
  };

  const handleClick = () => {
    if (hoverIndex === null) return;
    const noOp =
      currentSegmentIndex !== undefined && hoverIndex === currentSegmentIndex;
    if (!noOp) {
      onJump(hoverIndex);
    }
  };

  const getScenePosition = (scene: ProgressBarScene): number | null => {
    if (scene.dialogueIndex >= totalLines) return null;
    return (scene.dialogueIndex / totalLines) * 100;
  };

  return (
    <div className="py-1 md:px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-300 text-sm font-medium">
            {labelCurrent} / {labelTotal}
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

            {/* Scene markers – all scenes at their screenplay position */}
            {scenes.map(scene => {
              const pos = getScenePosition(scene);
              if (pos == null) return null;
              return (
                <div
                  key={scene.id}
                  data-scene-marker
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/90 border border-slate-600 shadow-sm cursor-pointer hover:scale-125 transition-transform z-10"
                  style={{ left: `calc(${pos}% - 4px)` }}
                  onMouseEnter={e => {
                    e.stopPropagation();
                    setHoverSceneId(scene.id);
                    setHoverIndex(null);
                  }}
                  onMouseLeave={() => setHoverSceneId(null)}
                  onClick={e => {
                    e.stopPropagation();
                    onJump(scene.dialogueIndex);
                  }}
                />
              );
            })}
          </div>

          {/* Hover tooltip - scene title or jump position */}
          {hoverSceneId &&
            (() => {
              const scene = scenes.find(s => s.id === hoverSceneId);
              if (!scene) return null;
              const pos = getScenePosition(scene);
              if (pos == null) return null;
              return (
                <div
                  className="absolute w-max bottom-4 transform -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs font-medium shadow-lg transition-all duration-100 ease-out z-[100]"
                  style={{ left: `${pos}%` }}
                >
                  {scene.title}
                </div>
              );
            })()}
          {hoverIndex !== null && !hoverSceneId && (
            <div
              className="absolute w-max bottom-4 transform -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs font-medium shadow-lg transition-all duration-100 ease-out z-[100]"
              style={{ left: `${hoverProgress}%` }}
            >
              {translations.jumpToLine} {hoverIndex + 1} {translations.sorhoz}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
