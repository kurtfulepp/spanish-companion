import { createClient } from '@/lib/supabase/server';
import { loadConversationCatalog } from '@/lib/server/conversation-data';
import { transcribeConversationRequest } from '@/lib/server/conversation-transcription';

export async function POST(request: Request) {
  let supabase: Awaited<ReturnType<typeof createClient>>;
  return transcribeConversationRequest(request, {
    apiKey: process.env.OPENAI_API_KEY,
    authenticate: async () => {
      supabase = await createClient();
      const { data, error } = await supabase.auth.getUser();
      return error ? null : (data.user?.id ?? null);
    },
    getCatalog: (userId) => loadConversationCatalog(supabase, userId),
    consumeQuota: async () => {
      const { data, error } = await supabase.rpc('consume_speech_quota', {
        p_character_count: 25,
      });
      if (error || typeof data !== 'boolean')
        throw new Error('Quota unavailable');
      return data;
    },
  });
}
