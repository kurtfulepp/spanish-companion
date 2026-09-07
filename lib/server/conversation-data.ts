import type { SupabaseClient } from '@supabase/supabase-js';
import { isCEFRLevel } from '@/lib/cefr';
import {
  buildConversationTopics,
  type TopicLearningData,
} from '@/lib/conversation';
import { isVocabularyTopicId } from '@/lib/vocabulary-topics';

export async function loadConversationCatalog(
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
  const { data: topics, error } = await supabase
    .from('vocabulary_themes')
    .select(
      'id, title, vocabulary_sections(id, title, description, sort_order, vocabulary_items(id, spanish, english, cefr_level))',
    )
    .eq('is_published', true)
    .eq('vocabulary_sections.vocabulary_items.cefr_level', level)
    .order('sort_order');
  if (error) throw new Error('Topics unavailable');
  // Paginate account progress so long-time learners do not lose access at the API row limit.
  const progress = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error: progressError } = await supabase
      .from('user_vocabulary_progress')
      .select('item_id, status, last_seen_at')
      .eq('user_id', userId)
      .not('last_seen_at', 'is', null)
      .order('item_id')
      .range(offset, offset + 999);
    if (progressError) throw new Error('Practice unavailable');
    progress.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return {
    level,
    topics: buildConversationTopics(
      (topics ?? []).filter((t) =>
        isVocabularyTopicId(t.id),
      ) as TopicLearningData[],
      progress,
      level,
    ),
  };
}
