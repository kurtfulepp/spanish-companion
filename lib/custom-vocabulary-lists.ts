import type { SupabaseClient } from '@supabase/supabase-js';
import { demoListsKey, readDemoLists, type SavedDemoList } from './demo-lists';

export type CustomVocabularyList = SavedDemoList & { practicedCount?: number; confidentCount?: number };
const table = 'custom_vocabulary_lists';
const fields = 'id,name,words,source,completed,created_at,practiced_count,confident_count';
export function listRecord(owner: string, list: CustomVocabularyList) {
  if (!owner || !list.id || !list.name.trim() || !list.words.length) throw new Error('Name your list and include at least one word.');
  return { user_id: owner, id: list.id, name: list.name.trim(), source: list.source ?? 'demo', completed: list.completed, created_at: list.createdAt,
    words: list.words.map(({ english, spanish }) => ({ english: english.trim(), spanish: spanish.trim() })) };
}
export async function saveCustomList(client: SupabaseClient, owner: string, list: CustomVocabularyList) {
  // Stable IDs make uncertain save/import retries harmless, without overwriting later changes.
  const { error } = await client.from(table).upsert(listRecord(owner, list), { onConflict: 'user_id,id', ignoreDuplicates: true });
  if (error) throw new Error('Your list could not be saved to your profile. Please try again.');
}
export async function loadCustomLists(client: SupabaseClient, owner: string): Promise<CustomVocabularyList[]> {
  const lists: CustomVocabularyList[] = [];
  const pageSize = 100;
  for (let start = 0; ; start += pageSize) {
    const { data, error } = await client.from(table).select(fields).eq('user_id', owner).is('deleted_at', null)
      .order('created_at', { ascending: false }).order('id').range(start, start + pageSize - 1);
    if (error || !data) throw new Error('Your lists could not be loaded. Check your connection and try again.');
    lists.push(...data.map(row => ({ id: row.id, name: row.name, words: row.words, source: row.source, completed: row.completed, createdAt: row.created_at, practicedCount: row.practiced_count, confidentCount: row.confident_count })));
    if (data.length < pageSize) return lists;
  }
}
export async function changeCustomList(client: SupabaseClient, owner: string, id: string, action: 'complete' | 'restore' | 'delete') {
  const { error } = await client.from(table).update(action === 'delete' ? { deleted_at: new Date().toISOString() } : { completed: action === 'complete' })
    .eq('user_id', owner).eq('id', id).is('deleted_at', null);
  if (error) throw new Error('This change could not be saved to your profile. Please try again.');
}
export async function importBrowserLists(client: SupabaseClient, storage: Pick<Storage, 'getItem' | 'removeItem'>, owner: string) {
  const key = demoListsKey(owner);
  const original = storage.getItem(key);
  if (!original) return;
  const lists = readDemoLists(storage, owner);
  for (const list of lists) await saveCustomList(client, owner, list);
  // A concurrent tab may have added a list; preserve it for the next import.
  if (storage.getItem(key) === original) storage.removeItem(key);
}
