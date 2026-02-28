import { useState, useEffect } from 'react';
import { X, UserPlus, Trash2 } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import { supabase } from '../lib/supabase';
import {
  listScreenplayUsers,
  addScreenplayUser,
  removeScreenplayUser,
  type ScreenplayUser,
} from '../lib/screenplayUsers';
import { translations } from '../utils/translations';

interface ManageUsersPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManageUsersPanel({ isOpen, onClose }: ManageUsersPanelProps) {
  const screenplayId = useAppSelector(state => state.app.screenplayId);
  const [users, setUsers] = useState<ScreenplayUser[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && screenplayId) {
      setError(null);
      supabase.auth.getSession().then(({ data: { session } }) => {
        setCurrentUserId(session?.user?.id ?? null);
      });
      listScreenplayUsers(screenplayId)
        .then(setUsers)
        .catch((e) => setError(e?.message ?? 'Failed to load'));
    }
  }, [isOpen, screenplayId]);

  const handleAdd = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      await addScreenplayUser(screenplayId!, trimmed);
      setEmail('');
      setUsers(await listScreenplayUsers(screenplayId!));
    } catch (e) {
      const msg = e?.message ?? translations.addUserError;
      setError(msg.includes('not found') ? translations.userNotFound : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  const handleRemove = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      await removeScreenplayUser(screenplayId!, userId);
      setUsers(await listScreenplayUsers(screenplayId!));
    } catch (e) {
      setError(e?.message ?? translations.removeUserError);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-800 shadow-xl z-50 flex flex-col"
        role="dialog"
        aria-label={translations.manageUsersTitle}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">
            {translations.manageUsersTitle}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-auto">
          <div className="flex gap-2 mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={translations.addUserPlaceholder}
              className="flex-1 px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={handleAdd}
              disabled={loading || !email.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg"
            >
              <UserPlus className="w-4 h-4" />
              {translations.addUser}
            </button>
          </div>

          {error && (
            <p className="mb-4 text-red-400 text-sm">{error}</p>
          )}

          <ul className="space-y-2">
            {users.length === 0 ? (
              <p className="text-slate-400 text-sm">{translations.noUsers}</p>
            ) : (
              users.map((u) => (
                <li
                  key={u.user_id}
                  className="flex items-center justify-between py-2 px-3 bg-slate-700/50 rounded-lg"
                >
                  <span className="text-white truncate">{u.email}</span>
                  <button
                    onClick={() => handleRemove(u.user_id)}
                    disabled={loading || u.user_id === currentUserId}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`${translations.removeUser} ${u.email}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
