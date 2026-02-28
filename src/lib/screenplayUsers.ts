import { supabase } from './supabase';

export interface ScreenplayUser {
  user_id: string;
  email: string;
  character_role: string | null;
}

export async function listScreenplayUsers(
  screenplayId: string
): Promise<ScreenplayUser[]> {
  const { data, error } = await supabase.rpc('get_screenplay_users', {
    p_screenplay_id: screenplayId,
  });
  if (error) throw error;
  return (data ?? []) as ScreenplayUser[];
}

export async function addScreenplayUser(
  screenplayId: string,
  email: string
): Promise<void> {
  const { error } = await supabase.rpc('add_screenplay_user_by_email', {
    p_screenplay_id: screenplayId,
    p_email: email.trim(),
  });
  if (error) throw error;
}

export async function removeScreenplayUser(
  screenplayId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('screenplay_access')
    .delete()
    .eq('screenplay_id', screenplayId)
    .eq('user_id', userId);
  if (error) throw error;
}
