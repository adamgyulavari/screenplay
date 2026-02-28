import { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setNotesView } from '../../store/appSlice';
import { ScreenplayTextColumn, SelectionInfo, Note } from './ScreenplayTextColumn';
import { translations } from '../../utils/translations';

function generateId() {
  return crypto.randomUUID?.() ?? `note-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function NotesView() {
  const dispatch = useAppDispatch();
  const screenplay = useAppSelector(state => state.app.screenplay);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [highlightedNoteId, setHighlightedNoteId] = useState<string | null>(null);
  const [addNoteContent, setAddNoteContent] = useState('');

  const handleAddNote = useCallback(() => {
    if (!selection || !addNoteContent.trim()) return;
    const note: Note = {
      id: generateId(),
      dialogueIndex: selection.dialogueIndex,
      startIndex: selection.startIndex,
      endIndex: selection.endIndex,
      noteContent: addNoteContent.trim(),
    };
    setNotes(prev => [...prev, note]);
    setAddNoteContent('');
    setSelection(null);
    setHighlightedNoteId(note.id);
  }, [selection, addNoteContent]);

  const handleCancelAddNote = useCallback(() => {
    setSelection(null);
    setAddNoteContent('');
  }, []);

  const handleBack = useCallback(() => {
    dispatch(setNotesView(false));
  }, [dispatch]);

  if (!screenplay.length) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <header className="py-4 px-6 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          {translations.notesBackToCharacters}
        </button>
      </header>

      <div className="flex-1 flex min-h-0">
        <ScreenplayTextColumn
          onSelection={setSelection}
          notes={notes}
          highlightedNoteId={highlightedNoteId}
          onHighlightNote={setHighlightedNoteId}
          currentSelection={selection ? { dialogueIndex: selection.dialogueIndex, startIndex: selection.startIndex, endIndex: selection.endIndex } : null}
        />
      </div>

      {selection && (
        <AddNotePopover
          rect={selection.rect}
          content={addNoteContent}
          onChangeContent={setAddNoteContent}
          onAdd={handleAddNote}
          onCancel={handleCancelAddNote}
          canAdd={addNoteContent.trim().length > 0}
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
}

function AddNotePopover({
  rect,
  content,
  onChangeContent,
  onAdd,
  onCancel,
  canAdd,
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
      />
      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 rounded transition-colors"
        >
          {translations.cancel}
        </button>
        <button
          onClick={onAdd}
          disabled={!canAdd}
          className="px-3 py-1.5 text-sm bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
        >
          {translations.addNote}
        </button>
      </div>
    </div>
  );
}
