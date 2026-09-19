import { createClient } from '@/lib/supabase/server';
import { loadGrammarContexts } from '@/lib/server/grammar-contexts';

const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user)
      return reply({ error: 'Sign in to load practice contexts.' }, 401);
    const result = await loadGrammarContexts(supabase, auth.user.id);
    if (!result)
      return reply(
        { error: 'Choose your Spanish level in Profile first.' },
        409,
      );
    return reply(result);
  } catch {
    return reply(
      { error: 'Practice contexts could not be loaded. Use General for now.' },
      503,
    );
  }
}
