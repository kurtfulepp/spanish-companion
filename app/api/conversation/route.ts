import { createClient } from '@/lib/supabase/server';
import { loadConversationCatalog } from '@/lib/server/conversation-data';
import { conversationRequest } from '@/lib/server/conversation';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user)
      return Response.json(
        { error: 'Sign in to see your practiced topics.' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } },
      );
    const catalog = await loadConversationCatalog(supabase, data.user.id);
    if (!catalog)
      return Response.json(
        { error: 'Choose your Spanish level in Profile first.' },
        { status: 409, headers: { 'Cache-Control': 'no-store' } },
      );
    return Response.json(
      { ...catalog, available: !!process.env.OPENAI_API_KEY?.trim() },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return Response.json(
      { error: 'Your practice could not be loaded. Try again.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}

export async function POST(request: Request) {
  let supabase: Awaited<ReturnType<typeof createClient>>;
  return conversationRequest(request, {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_TEXT_MODEL,
    authenticate: async () => {
      supabase = await createClient();
      const { data, error } = await supabase.auth.getUser();
      return error ? null : (data.user?.id ?? null);
    },
    getCatalog: (userId) => loadConversationCatalog(supabase, userId),
    consumeQuota: async () => {
      // MVP shares the existing atomic account practice allowance with speech.
      // 25 units per generation caps text-only use at 60 requests / rolling 24h.
      const { data, error } = await supabase.rpc('consume_speech_quota', {
        p_character_count: 25,
      });
      if (error || typeof data !== 'boolean')
        throw new Error('Quota unavailable');
      return data;
    },
  });
}
