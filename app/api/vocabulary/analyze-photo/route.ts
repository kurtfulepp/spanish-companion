import { createClient } from '@/lib/supabase/server';
import { analyzePhotoRequest } from '@/lib/server/photo-vocabulary';

export async function POST(request: Request) {
  // Keep the key server-side and reuse the authenticated session for the quota RPC.
  let supabase: Awaited<ReturnType<typeof createClient>>;
  let userId: string | null = null;
  return analyzePhotoRequest(request, {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_VISION_MODEL,
    authenticate: async () => {
      supabase = await createClient();
      const { data, error } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;
      return !error && Boolean(userId);
    },
    getLearnerLevel: async () => {
      if (!userId) return null;
      const { data, error } = await supabase.from('profiles').select('proficiency_level').eq('id', userId).maybeSingle();
      if (error) throw new Error('Profile unavailable');
      return data?.proficiency_level ?? null;
    },
    consumeQuota: async () => {
      const { data, error } = await supabase.rpc('consume_photo_vocabulary_quota');
      if (error || typeof data !== 'boolean') throw new Error('Quota unavailable');
      return data;
    },
  });
}
