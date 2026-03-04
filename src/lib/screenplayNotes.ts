import { supabase } from './supabase';

export interface NoteRow {
  id: string;
  screenplay_id: string;
  dialogue_id: string;
  start_index: number;
  end_index: number;
  note_content: string;
  author_id: string | null;
  author_email: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface NoteClient {
  id: string;
  dialogueId: string;
  startIndex: number;
  endIndex: number;
  noteContent: string;
  authorEmail?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

function rowToNote(row: NoteRow): NoteClient {
  return {
    id: row.id,
    dialogueId: row.dialogue_id,
    startIndex: row.start_index,
    endIndex: row.end_index,
    noteContent: row.note_content,
    authorEmail: row.author_email ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchNotes(screenplayId: string): Promise<NoteClient[]> {
  const { data, error } = await supabase
    .from('screenplay_notes')
    .select('*')
    .eq('screenplay_id', screenplayId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(rowToNote);
}

export async function createNote(
  screenplayId: string,
  note: {
    dialogueId: string;
    startIndex: number;
    endIndex: number;
    noteContent: string;
  },
  authorEmail: string | null
): Promise<NoteClient> {
  const { data: session } = await supabase.auth.getSession();
  const { data, error } = await supabase
    .from('screenplay_notes')
    .insert({
      screenplay_id: screenplayId,
      dialogue_id: note.dialogueId,
      start_index: note.startIndex,
      end_index: note.endIndex,
      note_content: note.noteContent,
      author_id: session?.session?.user?.id ?? null,
      author_email: authorEmail ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToNote(data as NoteRow);
}

export async function updateNote(
  id: string,
  noteContent: string
): Promise<NoteClient> {
  const { data, error } = await supabase
    .from('screenplay_notes')
    .update({ note_content: noteContent })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return rowToNote(data as NoteRow);
}

/** Soft-delete; history remains in DB. */
export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('screenplay_notes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}
