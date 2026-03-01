import { useState } from 'react';
import { BookOpen, User } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { loadAndSelectScreenplay } from '../hooks/useSupabaseAuth';
import { supabase } from '../lib/supabase';
import { translations } from '../utils/translations';
import { AppHeader } from './AppHeader';
import type { ScreenplaySummary } from '../types/screenplay';

const CARD_COLORS = [
  { from: 'from-indigo-500', to: 'to-indigo-700' },
  { from: 'from-emerald-500', to: 'to-emerald-700' },
  { from: 'from-violet-500', to: 'to-violet-700' },
  { from: 'from-amber-500', to: 'to-amber-700' },
  { from: 'from-rose-500', to: 'to-rose-700' },
  { from: 'from-cyan-500', to: 'to-cyan-700' },
  { from: 'from-teal-500', to: 'to-teal-700' },
  { from: 'from-sky-500', to: 'to-sky-700' },
];

export const ScreenplaySelector = () => {
  const dispatch = useAppDispatch();
  const availableScreenplays = useAppSelector(
    state => state.app.availableScreenplays
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (sp: ScreenplaySummary) => {
    setLoadingId(sp.id);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      await loadAndSelectScreenplay(
        sp.id,
        session.user.id,
        availableScreenplays,
        dispatch
      );
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load screenplay');
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <AppHeader title={translations.screenplaySelector} />

      <div className="flex-1 flex items-center justify-center p-6">
        {availableScreenplays.length === 0 ? (
          <div className="text-center max-w-md">
            <div className="bg-slate-700/50 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-300 text-lg">
              {translations.noScreenplays}
            </p>
          </div>
        ) : (
          <div className="max-w-4xl w-full">
            {error && (
              <div className="mb-6 text-red-400 text-center text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableScreenplays.map((sp, i) => {
                const color = CARD_COLORS[i % CARD_COLORS.length];
                const isLoading = loadingId === sp.id;
                return (
                  <button
                    key={sp.id}
                    onClick={() => handleSelect(sp)}
                    disabled={loadingId !== null}
                    className="group relative overflow-hidden rounded-2xl h-48 p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl transform-gpu disabled:opacity-60 disabled:hover:scale-100"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${color.from} ${color.to} opacity-90 group-hover:opacity-100 transition-opacity duration-300`}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center justify-start mb-4 gap-4">
                        <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                          <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-white/90 transition-colors">
                          {isLoading ? translations.loadingScreenplay : sp.title}
                        </h3>
                      </div>

                      {sp.author && (
                        <p className="text-white/70 text-sm mb-1">
                          {translations.screenplayAuthor}: {sp.author}
                        </p>
                      )}
                      {sp.characterRole && (
                        <p className="text-white/80 text-sm flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {translations.screenplayRole}: {sp.characterRole}
                        </p>
                      )}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <div
                        className="h-full bg-white/40 transition-all duration-300 group-hover:bg-white/60"
                        style={{ width: '0%' }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
