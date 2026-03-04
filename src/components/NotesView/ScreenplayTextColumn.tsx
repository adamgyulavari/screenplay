import { useRef, useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { FormattedText } from '../MemorizerView/FormattedText';
import { CharacterContextItem } from '../MemorizerView/CharacterContextItem';
import { translations } from '../../utils/translations';

export interface SelectionInfo {
  dialogueId: string;
  dialogueIndex: number;
  startIndex: number;
  endIndex: number;
  rect: DOMRect;
}

export interface Note {
  id: string;
  dialogueId: string;
  startIndex: number;
  endIndex: number;
  noteContent: string;
  authorEmail?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ScreenplayTextColumnProps {
  onSelection: (info: SelectionInfo | null) => void;
  notes: Note[];
  highlightedNoteId: string | null;
  onHighlightNote: (id: string | null) => void;
  /** When the add-note popover is open, show this selection as highlighted (browser selection is lost on focus) */
  currentSelection: {
    dialogueId: string;
    startIndex: number;
    endIndex: number;
  } | null;
  /** When set, notes show edit/delete controls (e.g. in NotesView). Omit in MemorizerView for read-only. */
  onEditNote?: (note: Note) => void;
  onDeleteNote?: (id: string) => void;
  /** Called when scroll position changes; reports the dialogue index at the top of the viewport. */
  onScrollProgress?: (topDialogueIndex: number) => void;
  /** Ref for the scroll container (for scroll-to-dialogue from progress bar). */
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  /** When set, show "+ scene" on dialogue hover for adding scene markers. Owner only. */
  screenplayId?: string | null;
  /** If true, show add/edit/delete scene controls. Typically screenplay owner only. */
  canEditScenes?: boolean;
  /** Scene markers for this screenplay. */
  scenes?: { id: string; dialogueId: string; title: string }[];
  onAddSceneClick?: (dialogueId: string) => void;
  onEditScene?: (scene: {
    id: string;
    dialogueId: string;
    title: string;
  }) => void;
  onDeleteScene?: (sceneId: string) => void;
}

export function ScreenplayTextColumn({
  onSelection,
  notes,
  highlightedNoteId,
  onHighlightNote,
  currentSelection,
  onEditNote,
  onDeleteNote,
  onScrollProgress,
  scrollContainerRef,
  screenplayId,
  canEditScenes = false,
  scenes = [],
  onAddSceneClick,
  onEditScene,
  onDeleteScene,
}: ScreenplayTextColumnProps) {
  const screenplay = useAppSelector(state => state.app.screenplay);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const justSelectedRef = useRef(false);
  const onScrollProgressRef = useRef(onScrollProgress);
  const [containerReady, setContainerReady] = useState(0);
  onScrollProgressRef.current = onScrollProgress;

  const setContainerRef = useCallback(
    (el: HTMLDivElement | null) => {
      containerRef.current = el;
      if (scrollContainerRef) {
        (
          scrollContainerRef as React.MutableRefObject<HTMLDivElement | null>
        ).current = el;
      }
      if (el) setContainerReady((n) => n + 1);
    },
    [scrollContainerRef]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onScrollProgressRef.current || screenplay.length === 0)
      return;
    const handler = () => {
      const children = container.querySelectorAll('[data-dialogue-index]');
      if (children.length === 0) return;
      const containerRect = container.getBoundingClientRect();
      const top = containerRect.top;
      let topIndex = 0;
      for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        const rect = child.getBoundingClientRect();
        if (rect.top <= top && rect.bottom > top) {
          topIndex = i;
          break;
        }
        if (rect.top > top) {
          topIndex = Math.max(0, i - 1);
          break;
        }
        topIndex = i;
      }
      onScrollProgressRef.current?.(topIndex);
    };
    handler();
    container.addEventListener('scroll', handler, { passive: true });
    return () => container.removeEventListener('scroll', handler);
  }, [screenplay.length, containerReady]);

  const handleMouseUp = useCallback(() => {
    const run = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !containerRef.current) {
        onSelection(null);
        return;
      }

      const anchor = sel.anchorNode;
      if (!anchor) {
        onSelection(null);
        return;
      }

      let node: Node | null = anchor;
      let blockEl: HTMLElement | null = null;
      let dialogueIndex: number | null = null;
      let dialogueId: string | null = null;
      while (node && node !== containerRef.current) {
        const el = node as HTMLElement;
        const idx = el.getAttribute?.('data-dialogue-index');
        const did = el.getAttribute?.('data-dialogue-id');
        if (idx != null && did != null) {
          blockEl = el;
          dialogueIndex = parseInt(idx, 10);
          dialogueId = did;
          break;
        }
        node = node.parentElement;
      }
      if (!blockEl || dialogueIndex == null || dialogueId == null) {
        onSelection(null);
        return;
      }

      const textRoot = blockEl.querySelector('[data-dialogue-text]');
      const clampEl = (textRoot as HTMLElement) ?? blockEl;
      if (!clampEl || !clampEl.contains(anchor)) {
        onSelection(null);
        return;
      }

      const range = sel.getRangeAt(0).cloneRange();
      const clampRange = document.createRange();
      clampRange.selectNodeContents(clampEl);

      if (range.compareBoundaryPoints(Range.START_TO_START, clampRange) < 0) {
        range.setStart(clampRange.startContainer, clampRange.startOffset);
      }
      if (range.compareBoundaryPoints(Range.END_TO_END, clampRange) > 0) {
        range.setEnd(clampRange.endContainer, clampRange.endOffset);
      }

      if (range.collapsed) {
        onSelection(null);
        return;
      }

      function sourceIndexFromNode(node: Node, offset: number): number | null {
        const el =
          node.nodeType === Node.TEXT_NODE
            ? (node.parentElement as HTMLElement)
            : (node as HTMLElement);
        let cur: HTMLElement | null = el;
        while (cur && cur !== containerRef.current) {
          const startAttr = cur.getAttribute?.('data-source-start');
          if (startAttr != null) {
            const base = parseInt(startAttr, 10);
            const isEm = cur.tagName === 'EM';
            return base + (isEm ? 1 : 0) + offset;
          }
          cur = cur.parentElement;
        }
        return null;
      }

      const anchorSource = sourceIndexFromNode(
        sel.anchorNode!,
        sel.anchorOffset
      );
      const focusSource = sourceIndexFromNode(sel.focusNode!, sel.focusOffset);
      if (anchorSource == null || focusSource == null) {
        onSelection(null);
        return;
      }
      const startIndex = Math.min(anchorSource, focusSource);
      const endIndex = Math.max(anchorSource, focusSource);
      if (startIndex >= endIndex) {
        onSelection(null);
        return;
      }

      const rect = range.getBoundingClientRect();
      justSelectedRef.current = true;
      onSelection({ dialogueId, dialogueIndex, startIndex, endIndex, rect });
    };

    const sel = window.getSelection();
    const raw = sel?.toString?.()?.trim() ?? '';
    if (raw.length === 0) {
      setTimeout(run, 0);
      return;
    }
    run();
  }, [onSelection, screenplay]);

  const handleClick = useCallback(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    window.getSelection()?.removeAllRanges();
    onSelection(null);
  }, [onSelection]);

  if (!screenplay.length) return null;

  return (
    <div className="flex-1 min-h-0 flex flex-col min-w-0">
      <div
        ref={setContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6 space-y-6"
        onMouseUp={handleMouseUp}
        onClick={handleClick}
      >
      {screenplay.map((item, index) => {
        const notesForDialogue = notes.filter(n => n.dialogueId === item.id);
        const isCurrentSelection = currentSelection?.dialogueId === item.id;
        const sceneAtDialogue = scenes.find(s => s.dialogueId === item.id);
        const showSceneControls = Boolean(screenplayId && canEditScenes);

        return (
          <div
            key={item.id}
            data-dialogue-index={index}
            data-dialogue-id={item.id}
            className={`group relative min-h-[4rem] p-4 rounded-xl border bg-slate-800/30 transition-colors [container-type:inline-size] ${
              sceneAtDialogue ? 'border-amber-500/60' : 'border-slate-600/50'
            }`}
          >
            {sceneAtDialogue && (
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-medium text-amber-400/90">
                  {sceneAtDialogue.title}
                </span>
              </div>
            )}
            {showSceneControls && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                {sceneAtDialogue ? (
                  <>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onEditScene?.(sceneAtDialogue);
                      }}
                      className="px-2 py-0.5 rounded text-xs bg-slate-600/50 text-slate-300 hover:bg-slate-500/50 hover:text-slate-200 transition-colors flex items-center gap-1"
                      title={translations.editScene}
                    >
                      <Pencil className="w-3 h-3" />
                      {translations.editScene}
                    </button>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onDeleteScene?.(sceneAtDialogue.id);
                      }}
                      className="p-0.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-600/50 transition-colors"
                      title={translations.deleteScene}
                      aria-label={translations.deleteScene}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onAddSceneClick?.(item.id);
                    }}
                    className="px-2 py-0.5 rounded text-xs bg-slate-600/50 text-slate-400 hover:bg-slate-500/50 hover:text-slate-200 transition-colors flex items-center gap-1"
                    title={translations.addScene}
                  >
                    <Plus className="w-3 h-3" />
                    {translations.addScene}
                  </button>
                )}
              </div>
            )}
            <p className="text-slate-200 leading-relaxed">
              {item.role.split(', ').map(role => (
                <CharacterContextItem key={role} role={role} />
              ))}
              <span data-dialogue-text>
                <InlineAnnotatedText
                  text={item.text}
                  notes={notesForDialogue}
                  highlightedNoteId={highlightedNoteId}
                  onHighlightNote={onHighlightNote}
                  currentSelection={
                    isCurrentSelection
                      ? {
                          startIndex: currentSelection.startIndex,
                          endIndex: currentSelection.endIndex,
                        }
                      : null
                  }
                  onEditNote={onEditNote}
                  onDeleteNote={onDeleteNote}
                />
              </span>
            </p>
          </div>
        );
      })}
      </div>
    </div>
  );
}

type TextSegment = { type: 'text'; content: string; sourceStart: number };
type AnnotatedSegment =
  | { type: 'note'; start: number; end: number; note: Note; text: string }
  | { type: 'selection'; start: number; end: number; text: string };

/** Notes and currentSelection use source indices (including * for italics). */
function buildSegments(
  text: string,
  notes: Note[],
  currentSelection: { startIndex: number; endIndex: number } | null
): (TextSegment | AnnotatedSegment)[] {
  const annotations: AnnotatedSegment[] = [];
  for (const note of notes) {
    const start = Math.max(0, note.startIndex);
    const end = Math.min(text.length, note.endIndex);
    if (start < end) {
      annotations.push({
        type: 'note',
        start,
        end,
        note,
        text: text.slice(start, end),
      });
    }
  }
  if (currentSelection) {
    const start = Math.max(0, currentSelection.startIndex);
    const end = Math.min(text.length, currentSelection.endIndex);
    if (start < end) {
      annotations.push({
        type: 'selection',
        start,
        end,
        text: text.slice(start, end),
      });
    }
  }
  annotations.sort((a, b) => a.start - b.start);
  const filtered: AnnotatedSegment[] = [];
  for (const a of annotations) {
    if (filtered.every(f => a.end <= f.start || a.start >= f.end)) {
      filtered.push(a);
    }
  }
  const segments: (TextSegment | AnnotatedSegment)[] = [];
  let pos = 0;
  for (const a of filtered) {
    if (a.start > pos) {
      segments.push({
        type: 'text',
        content: text.slice(pos, a.start),
        sourceStart: pos,
      });
    }
    segments.push(a);
    pos = a.end;
  }
  if (pos < text.length) {
    segments.push({ type: 'text', content: text.slice(pos), sourceStart: pos });
  }
  return segments;
}

/** Single note + snippet: measures note height and reserves that space so snippet never overlaps. */
function NoteSegment({
  note,
  segText,
  isHighlighted,
  canEdit,
  canDelete,
  onHighlightNote,
  onEditNote,
  onDeleteNote,
}: {
  note: Note;
  segText: string;
  isHighlighted: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onHighlightNote: (id: string | null) => void;
  onEditNote?: (note: Note) => void;
  onDeleteNote?: (id: string) => void;
}) {
  const noteRef = useRef<HTMLDivElement>(null);
  const [paddingTop, setPaddingTop] = useState(20); // 1.25rem fallback for first paint

  useEffect(() => {
    const el = noteRef.current;
    if (!el) return;
    const sync = () => setPaddingTop(el.offsetHeight + 4); // +4 for a small gap
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [note.noteContent]);

  return (
    <span
      className="relative inline-block align-baseline overflow-visible"
      style={{ paddingTop: `${paddingTop}px` }}
    >
      <div
        ref={noteRef}
        className="absolute left-0 top-0 z-10 flex w-max max-w-[min(36rem,100cqw)] items-start gap-0.5 text-left"
      >
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onHighlightNote(isHighlighted ? null : note.id);
          }}
          className={`min-w-0 flex-1 rounded px-1.5 py-0.5 text-left text-xs transition-colors whitespace-normal ${
            isHighlighted
              ? 'bg-amber-500/40 text-amber-200'
              : 'bg-slate-600/50 text-slate-300 hover:bg-slate-500/50'
          }`}
        >
          {note.noteContent}
        </button>
        {canEdit && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onEditNote?.(note);
            }}
            className="shrink-0 p-0.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-600/50 transition-colors"
            title={translations.editNote}
            aria-label={translations.editNote}
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
        {canDelete && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onDeleteNote?.(note.id);
            }}
            className="shrink-0 p-0.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-600/50 transition-colors"
            title={translations.deleteNote}
            aria-label={translations.deleteNote}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
      <span
        className={`rounded px-0.5 ${isHighlighted ? 'bg-amber-500/40' : ''}`}
      >
        <FormattedText text={segText} />
      </span>
    </span>
  );
}

/** Renders text with inline notes (note chip above snippet). Export for use in MemorizerView read-only. */
export function InlineAnnotatedText({
  text,
  notes,
  highlightedNoteId,
  onHighlightNote,
  currentSelection,
  onEditNote,
  onDeleteNote,
}: {
  text: string;
  notes: Note[];
  highlightedNoteId: string | null;
  onHighlightNote: (id: string | null) => void;
  currentSelection: { startIndex: number; endIndex: number } | null;
  onEditNote?: (note: Note) => void;
  onDeleteNote?: (id: string) => void;
}) {
  const segments = buildSegments(text, notes, currentSelection);

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return (
            <FormattedText
              key={i}
              text={seg.content}
              sourceStart={seg.sourceStart}
            />
          );
        }
        if (seg.type === 'selection') {
          return (
            <mark
              key={i}
              className="bg-amber-500/40 rounded px-0.5 align-baseline"
            >
              <FormattedText text={seg.text} />
            </mark>
          );
        }
        const { note, text: segText } = seg;
        const isHighlighted = highlightedNoteId === note.id;
        const canEdit = Boolean(onEditNote);
        const canDelete = Boolean(onDeleteNote);
        return (
          <NoteSegment
            key={note.id}
            note={note}
            segText={segText}
            isHighlighted={isHighlighted}
            canEdit={canEdit}
            canDelete={canDelete}
            onHighlightNote={onHighlightNote}
            onEditNote={onEditNote}
            onDeleteNote={onDeleteNote}
          />
        );
      })}
    </>
  );
}
