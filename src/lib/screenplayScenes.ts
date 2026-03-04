import { supabase } from './supabase';

export interface SceneRow {
  id: string;
  screenplay_id: string;
  dialogue_id: string;
  title: string;
  created_at: string;
}

export interface SceneClient {
  id: string;
  dialogueId: string;
  title: string;
  createdAt?: string;
}

function rowToScene(row: SceneRow): SceneClient {
  return {
    id: row.id,
    dialogueId: row.dialogue_id,
    title: row.title,
    createdAt: row.created_at,
  };
}

export async function fetchScenes(
  screenplayId: string
): Promise<SceneClient[]> {
  const { data, error } = await supabase
    .from('screenplay_scenes')
    .select('*')
    .eq('screenplay_id', screenplayId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(rowToScene);
}

export async function createScene(
  screenplayId: string,
  scene: { dialogueId: string; title: string }
): Promise<SceneClient> {
  const { data, error } = await supabase
    .from('screenplay_scenes')
    .insert({
      screenplay_id: screenplayId,
      dialogue_id: scene.dialogueId,
      title: scene.title,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToScene(data as SceneRow);
}

export async function updateScene(
  id: string,
  title: string
): Promise<SceneClient> {
  const { data, error } = await supabase
    .from('screenplay_scenes')
    .update({ title })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return rowToScene(data as SceneRow);
}

export async function deleteScene(id: string): Promise<void> {
  const { error } = await supabase
    .from('screenplay_scenes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
