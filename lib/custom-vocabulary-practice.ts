import type { SupabaseClient } from '@supabase/supabase-js';
import type { CustomVocabularyList } from './custom-vocabulary-lists';
export type WordStatus = 'learning' | 'confident';
export type WordProgress = Record<number, WordStatus>;
export type ReviewSummary = { practiced_count: number; confident_count: number; completed: boolean };
export function practiceQueue(wordCount: number, progress: WordProgress, all = false) {
  return Array.from({ length: wordCount }, (_, index) => index).filter(index => all || progress[index] !== 'confident');
}
export async function loadPractice(client: SupabaseClient, owner: string, id: string): Promise<{ list: CustomVocabularyList; progress: WordProgress }> {
  const { data, error } = await client.from('custom_vocabulary_lists').select('id,name,words,source,completed,created_at,practiced_count,confident_count')
    .eq('user_id', owner).eq('id', id).is('deleted_at', null).maybeSingle();
  if (error) throw new Error('Your list could not be loaded. Check your connection and try again.');
  if (!data) throw new Error('This list is unavailable. It may have been deleted or belong to another profile.');
  const progress: WordProgress = {};
  for (let start = 0; ; start += 100) {
    const { data: entries, error: progressError } = await client.from('custom_vocabulary_progress').select('word_index,status')
      .eq('user_id', owner).eq('list_id', id).order('word_index').range(start, start + 99);
    if (progressError || !entries) throw new Error('Your progress could not be loaded. Please try again.');
    for (const entry of entries) progress[entry.word_index] = entry.status;
    if (entries.length < 100) break;
  }
  return { list: { id: data.id, name: data.name, words: data.words, source: data.source, completed: data.completed, createdAt: data.created_at, practicedCount: data.practiced_count, confidentCount: data.confident_count }, progress };
}
export async function recordReview(client: SupabaseClient, listId: string, index: number, status: WordStatus): Promise<ReviewSummary> {
  const { data, error } = await client.rpc('record_custom_vocabulary_review', { p_list_id: listId, p_word_index: index, p_status: status });
  if (error || !data || !Number.isInteger(data.practiced_count) || !Number.isInteger(data.confident_count) || typeof data.completed !== 'boolean')
    throw new Error('Your answer could not be saved. Keep this screen open and try again.');
  return data;
}
