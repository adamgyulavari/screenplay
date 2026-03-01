import { ReactNode } from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/appSlice';
import { supabase } from '../lib/supabase';
import { translations } from '../utils/translations';

export const headerBtnClass =
  'flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors duration-200';

interface AppHeaderProps {
  back?: {
    label: string;
    onClick: () => void;
  };
  title?: ReactNode;
  center?: ReactNode;
  actions?: ReactNode;
}

export function AppHeader({ back, title, center, actions }: AppHeaderProps) {
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    dispatch(logout());
  };

  return (
    <header className="py-3 px-4 md:px-6 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
      <div className="flex items-center gap-3">
        {back && (
          <button onClick={back.onClick} className={headerBtnClass}>
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{back.label}</span>
          </button>
        )}

        {title && (
          <div className="shrink-0">
            {typeof title === 'string' ? (
              <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
                {title}
              </h1>
            ) : (
              title
            )}
          </div>
        )}

        <div className="hidden md:block flex-1 min-w-0">{center}</div>
        <div className="flex-1 md:hidden" />

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {actions}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 bg-red-600/50 hover:bg-red-500/50 text-white rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{translations.logout}</span>
          </button>
        </div>
      </div>

      {center && <div className="md:hidden mt-3">{center}</div>}
    </header>
  );
}
