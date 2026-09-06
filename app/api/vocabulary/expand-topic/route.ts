import { createClient } from '@/lib/supabase/server';
import { expandTopicRequest } from '@/lib/server/topic-expansion';

export async function POST(request: Request) {
  let supabase: Awaited<ReturnType<typeof createClient>>;
  return expandTopicRequest(request, {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_TEXT_MODEL,
    authenticate: async () => {
      supabase = await createClient();
      const { data, error } = await supabase.auth.getUser();
      return error ? null : (data.user?.id ?? null);
    },
    getLearnerLevel: async (userId) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('proficiency_level')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw new Error('Profile unavailable');
      return data?.proficiency_level ?? null;
    },
    getTopic: async (themeId) => {
      const { data, error } = await supabase
        .from('vocabulary_themes')
        .select(
          'id, title, description, vocabulary_sections(slug, title, description, sort_order)',
        )
        .eq('id', themeId)
        .eq('is_published', true)
        .maybeSingle();
      if (error || !data) return null;
      const sections = [...(data.vocabulary_sections ?? [])].sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        sections,
      };
    },
    getExistingContent: async (themeId, userId) => {
      const { data, error } = await supabase
        .from('vocabulary_sections')
        .select('vocabulary_items(spanish, source, owner_id)')
        .eq('theme_id', themeId);
      if (error) throw new Error('Vocabulary unavailable');
      const items = (data ?? []).flatMap(
        (section) => section.vocabulary_items ?? [],
      );
      return {
        expressions: items.map((item) => item.spanish),
        personalCount: items.filter(
          (item) => item.source === 'ai' && item.owner_id === userId,
        ).length,
      };
    },
    consumeQuota: async () => {
      const { data, error } = await supabase.rpc(
        'consume_topic_generation_quota',
      );
      if (error || typeof data !== 'boolean')
        throw new Error('Quota unavailable');
      return data;
    },
    saveItems: async (themeId, items, model) => {
      const { data, error } = await supabase.rpc('save_topic_expansion', {
        p_theme_id: themeId,
        p_items: items,
        p_model: model,
        p_prompt_version: 'topic-expansion-v1',
      });
      if (error || typeof data !== 'number')
        throw new Error('Save unavailable');
      return data;
    },
  });
}
