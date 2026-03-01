import { useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  setNotesView,
  addNote,
  updateNote,
  removeNote,
} from '../../store/appSlice';
import {
  ScreenplayTextColumn,
  SelectionInfo,
  Note,
} from './ScreenplayTextColumn';
import {
  createNote,
  updateNote as updateNoteApi,
  deleteNote,
} from '../../lib/screenplayNotes';
import { supabase } from '../../lib/supabase';
import { translations } from '../../utils/translations';
import { AppHeader } from '../AppHeader';

export function NotesView() {
  const dispatch = useAppDispatch();
  const screenplay = useAppSelector(state => state.app.screenplay);
  const screenplayId = useAppSelector(state => state.app.screenplayId);
  const notes = useAppSelector(state => state.app.notes);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [highlightedNoteId, setHighlightedNoteId] = useState<string | null>(
    null
  );
  const [addNoteContent, setAddNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddNote = useCallback(async () => {
    if (!screenplayId || !selection || !addNoteContent.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const created = await createNote(
        screenplayId,
        {
          dialogueIndex: selection.dialogueIndex,
          startIndex: selection.startIndex,
          endIndex: selection.endIndex,
          noteContent: addNoteContent.trim(),
        },
        session?.user?.email ?? null
      );
      dispatch(addNote(created));
      setAddNoteContent('');
      setSelection(null);
      setHighlightedNoteId(created.id);
    } catch (e) {
      setError((e as Error)?.message ?? 'Failed to save note');
    } finally {
      setSaving(false);
    }
  }, [screenplayId, selection, addNoteContent, dispatch]);

  const handleSaveEdit = useCallback(async () => {
    if (!editingNoteId || !editingContent.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateNoteApi(editingNoteId, editingContent.trim());
      dispatch(
        updateNote({
          id: updated.id,
          noteContent: updated.noteContent,
          updatedAt: updated.updatedAt,
        })
      );
      setEditingNoteId(null);
      setEditingContent('');
    } catch (e) {
      setError((e as Error)?.message ?? 'Failed to update note');
    } finally {
      setSaving(false);
    }
  }, [editingNoteId, editingContent, dispatch]);

  const handleDeleteNote = useCallback(
    async (id: string) => {
      if (!window.confirm(translations.deleteNoteConfirm)) return;
      setSaving(true);
      setError(null);
      try {
        await deleteNote(id);
        dispatch(removeNote(id));
        if (highlightedNoteId === id) setHighlightedNoteId(null);
        if (editingNoteId === id) {
          setEditingNoteId(null);
          setEditingContent('');
        }
      } catch (e) {
        setError((e as Error)?.message ?? 'Failed to delete note');
      } finally {
        setSaving(false);
      }
    },
    [dispatch, highlightedNoteId, editingNoteId]
  );

  const handleCancelAddNote = useCallback(() => {
    setSelection(null);
    setAddNoteContent('');
  }, []);

  const handleBack = useCallback(() => {
    dispatch(setNotesView(false));
  }, [dispatch]);

  const startEditing = useCallback((note: Note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.noteContent);
  }, []);

  if (!screenplay.length) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <AppHeader
        back={{
          label: translations.notesBackToCharacters,
          onClick: handleBack,
        }}
        title={translations.notesViewTitle}
        center={
          error ? (
            <p className="text-red-400 text-sm text-right" role="alert">
              {error}
            </p>
          ) : undefined
        }
      />

      <div className="flex-1 flex min-h-0 justify-center">
        <div className="w-full max-w-4xl flex flex-col min-h-0 px-6">
          <ScreenplayTextColumn
            onSelection={setSelection}
            notes={notes}
            highlightedNoteId={highlightedNoteId}
            onHighlightNote={setHighlightedNoteId}
            currentSelection={
              selection
                ? {
                    dialogueIndex: selection.dialogueIndex,
                    startIndex: selection.startIndex,
                    endIndex: selection.endIndex,
                  }
                : null
            }
            onEditNote={startEditing}
            onDeleteNote={handleDeleteNote}
          />
        </div>
      </div>

      {selection && (
        <AddNotePopover
          rect={selection.rect}
          content={addNoteContent}
          onChangeContent={setAddNoteContent}
          onAdd={handleAddNote}
          onCancel={handleCancelAddNote}
          canAdd={addNoteContent.trim().length > 0}
          saving={saving}
        />
      )}

      {editingNoteId && (
        <EditNotePopover
          content={editingContent}
          onChangeContent={setEditingContent}
          onSave={handleSaveEdit}
          onCancel={() => {
            setEditingNoteId(null);
            setEditingContent('');
          }}
          saving={saving}
        />
      )}
    </div>
  );
}

interface AddNotePopoverProps {
  rect: DOMRect;
  content: string;
  onChangeContent: (v: string) => void;
  onAdd: () => void;
  onCancel: () => void;
  canAdd: boolean;
  saving?: boolean;
}

function AddNotePopover({
  rect,
  content,
  onChangeContent,
  onAdd,
  onCancel,
  canAdd,
  saving = false,
}: AddNotePopoverProps) {
  return (
    <div
      className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-3 w-72"
      style={{
        left: rect.left,
        top: rect.bottom + 8,
      }}
    >
      <textarea
        value={content}
        onChange={e => onChangeContent(e.target.value)}
        placeholder={translations.notePlaceholder}
        className="w-full h-20 px-3 py-2 bg-slate-900/80 border border-slate-600 rounded text-slate-200 placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-amber-500"
        autoFocus
        disabled={saving}
      />
      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 rounded transition-colors disabled:opacity-50"
        >
          {translations.cancel}
        </button>
        <button
          onClick={onAdd}
          disabled={!canAdd || saving}
          className="px-3 py-1.5 text-sm bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
        >
          {saving ? translations.saving : translations.addNote}
        </button>
      </div>
    </div>
  );
}

interface EditNotePopoverProps {
  content: string;
  onChangeContent: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
}

function EditNotePopover({
  content,
  onChangeContent,
  onSave,
  onCancel,
  saving = false,
}: EditNotePopoverProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-4 w-full max-w-md">
        <label className="block text-slate-300 text-sm font-medium mb-2">
          {translations.editNote}
        </label>
        <textarea
          value={content}
          onChange={e => onChangeContent(e.target.value)}
          placeholder={translations.notePlaceholder}
          className="w-full h-24 px-3 py-2 bg-slate-900/80 border border-slate-600 rounded text-slate-200 placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-amber-500"
          autoFocus
          disabled={saving}
        />
        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 rounded transition-colors disabled:opacity-50"
          >
            {translations.cancel}
          </button>
          <button
            onClick={onSave}
            disabled={!content.trim() || saving}
            className="px-3 py-1.5 text-sm bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
          >
            {saving ? translations.saving : translations.save}
          </button>
        </div>
      </div>
    </div>
  );
}
