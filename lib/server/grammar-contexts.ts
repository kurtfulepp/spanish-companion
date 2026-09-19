import type { SupabaseClient } from '@supabase/supabase-js';
import { isCEFRLevel } from '@/lib/cefr';
import { buildGrammarContexts } from '@/lib/grammar-context';

export async function loadGrammarContexts(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('proficiency_level')
    .eq('id', userId)
    .maybeSingle();
  if (profileError) throw new Error('Profile unavailable');
  if (!isCEFRLevel(profile?.proficiency_level)) return null;
  const level = profile.proficiency_level;

  const [themesResult, customResult] = await Promise.all([
    supabase
      .from('vocabulary_themes')
      .select(
        'id, title, vocabulary_sections(vocabulary_items(id, spanish, english, cefr_level))',
      )
      .eq('is_published', true)
      .eq('vocabulary_sections.vocabulary_items.cefr_level', level)
      .order('sort_order'),
    supabase
      .from('custom_vocabulary_lists')
      .select('id,name,words,source,cefr_level,created_at')
      .eq('user_id', userId)
      .eq('source', 'photo')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);
  if (themesResult.error || customResult.error)
    throw new Error('Practice contexts unavailable');

  const practicedItemIds: string[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase
      .from('user_vocabulary_progress')
      .select('item_id')
      .eq('user_id', userId)
      .not('last_seen_at', 'is', null)
      .order('item_id')
      .range(offset, offset + 999);
    if (error) throw new Error('Practice contexts unavailable');
    practicedItemIds.push(...(data ?? []).map((row) => row.item_id));
    if (!data || data.length < 1000) break;
  }

  return {
    level,
    contexts: buildGrammarContexts({
      themes: themesResult.data ?? [],
      practicedItemIds,
      customLists: customResult.data ?? [],
      level,
    }),
  };
}
