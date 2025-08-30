import React from 'react';
import { translations } from '../../utils/translations';

interface NavigationInstructionsProps {
  hasSegments: boolean;
}

export const NavigationInstructions: React.FC<NavigationInstructionsProps> = ({
  hasSegments,
}) => (
  <div className="mt-8 text-center">
    <div className="inline-flex items-center gap-6 px-6 py-3 bg-slate-800/50 rounded-xl border border-slate-600/30">
      <div className="flex items-center gap-2 text-slate-300">
        <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">
          ←
        </kbd>
        <span className="text-sm">{translations.previous}</span>
      </div>
      <div className="w-px h-4 bg-slate-600" />
      <div className="flex items-center gap-2 text-slate-300">
        <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">
          {translations.space}
        </kbd>
        <span className="text-sm">{translations.or}</span>
        <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">
          →
        </kbd>
        <span className="text-sm">{translations.next}</span>
      </div>
    </div>
    {hasSegments && (
      <div className="mt-3 text-slate-400 text-sm">
        {translations.longLinesNote}
      </div>
    )}
  </div>
);
