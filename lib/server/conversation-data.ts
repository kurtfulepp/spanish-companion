import type { SupabaseClient } from '@supabase/supabase-js';
import { isCEFRLevel } from '@/lib/cefr';
import {
  buildConversationTopics,
  type TopicLearningData,
} from '@/lib/conversation';
import { loadAssessmentResults } from './vocabulary-assessment-data';
import { contentKey } from './assessment-crypto';
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
      'id, title, vocabulary_sections(id, title, description, sort_order, vocabulary_items(id, spanish, english, cefr_level, example_es, example_en, usage_note))',
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
  // Completed assessments also count as practice. Legacy self-ratings retain
  // their old conversation eligibility; they never enter assessed dashboard counts.
  if (process.env.VOCABULARY_ASSESSMENT_SECRET) {
    const assessments = await loadAssessmentResults(
      supabase,
      userId,
      process.env.VOCABULARY_ASSESSMENT_SECRET,
    ).catch(() => []);
    for (const topic of topics ?? [])
      for (const section of topic.vocabulary_sections)
        for (const item of section.vocabulary_items) {
          if (item.cefr_level !== level) continue;
          const key = contentKey(`topic:${item.id}`, [
            item.english,
            item.spanish,
            item.example_es,
            item.example_en,
            item.usage_note,
          ]);
          const latest = assessments.find(
            (result) => result.targetKey === key && result.level === level,
          );
          if (latest) {
            const index = progress.findIndex((row) => row.item_id === item.id);
            const row = {
              item_id: item.id,
              status: latest.status === 'known' ? 'confident' : 'learning',
              last_seen_at: latest.savedAt,
            };
            if (index >= 0) progress[index] = row;
            else progress.push(row);
          }
        }
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
