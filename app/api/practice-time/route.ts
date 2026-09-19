import { createClient } from '@/lib/supabase/server';
import { isCEFRLevel } from '@/lib/cefr';
import { validPracticeIntervals } from '@/lib/practice-time';

const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ error: 'Invalid origin.' }, 403);
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: 'No practice time submitted.' }, 400);
    let text = '';
    let bytes = 0;
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 4000) { await reader.cancel(); return reply({ error: 'Submission too large.' }, 413); }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    let input;
    try { input = JSON.parse(text); } catch { return reply({ error: 'Invalid submission.' }, 400); }
    if (!input || !['vocabulary', 'grammar', 'conversation'].includes(input.area) || !isCEFRLevel(input.level) || !validPracticeIntervals(input.intervals, Date.now())) {
      return reply({ error: 'Invalid or expired practice time.' }, 400);
    }
    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError || !data.user) return reply({ error: 'Sign in to save practice time.' }, 401);
    if (input.userId !== data.user.id) return reply({ error: 'Account changed.' }, 409);
    const { error } = await supabase.rpc('record_practice_time', {
      p_area: input.area, p_level: input.level, p_intervals: input.intervals,
    });
    if (error) return reply({ error: 'Practice time could not be saved.' }, 503);
    return reply({ saved: true });
  } catch { return reply({ error: 'Practice time could not be saved.' }, 503); }
}
