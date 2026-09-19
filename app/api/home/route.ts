import { createClient } from '@/lib/supabase/server';
import {
  loadAssessmentTargets,
  loadAssessmentResults,
} from '@/lib/server/vocabulary-assessment-data';
import { loadCustomLists } from '@/lib/custom-vocabulary-lists';
import { CEFR_LEVELS, cefrLevel } from '@/lib/cefr';
import { GRAMMAR_RULES } from '@/lib/grammar-rules';
import { validGrammarAnswers } from '@/lib/grammar-evidence';
import { assessedArea, type HomeSummary } from '@/lib/home-dashboard';

const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user)
      return reply({ error: 'Sign in to see your dashboard.' }, 401);
    const userId = auth.user.id;
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('proficiency_level')
      .eq('id', userId)
      .maybeSingle();
    if (error)
      return reply(
        { error: 'Your profile could not be loaded. Try again.' },
        503,
      );
    const level = cefrLevel(profile?.proficiency_level);
    const eligible = GRAMMAR_RULES.filter(
      (rule) =>
        level && CEFR_LEVELS.indexOf(rule.level) <= CEFR_LEVELS.indexOf(level),
    );
    const assessmentResults = loadAssessmentResults(
      supabase,
      userId,
      process.env.VOCABULARY_ASSESSMENT_SECRET ?? '',
    );
    const results = await Promise.allSettled([
      (async () => {
        const evidence = await assessmentResults;
        if (!level) return [];
        const { data, error } = await supabase
          .from('vocabulary_themes')
          .select('id,title')
          .eq('is_published', true)
          .order('sort_order');
        if (error) throw new Error('Vocabulary unavailable');
        return Promise.all(
          (data ?? []).map(async (topic) => {
            const { targets } = await loadAssessmentTargets(
              supabase,
              userId,
              level,
              { themeId: topic.id },
            );
            return assessedArea(
              {
                id: topic.id,
                title: topic.title,
                href: `/vocabulary/${encodeURIComponent(topic.id)}`,
                kind: 'Vocabulary',
              },
              targets.map((item) => item.key),
              evidence,
              level,
            );
          }),
        );
      })(),
      (async () => {
        const evidence = await assessmentResults;
        if (!level) return [];
        const lists = (await loadCustomLists(supabase, userId)).filter(
          (list) => list.source !== 'demo',
        );
        return Promise.all(
          lists.map(async (list) => {
            const { targets } = await loadAssessmentTargets(
              supabase,
              userId,
              level,
              { listId: list.id },
            );
            return assessedArea(
              {
                id: list.id,
                title: list.name,
                href: `/vocabulary/custom/${encodeURIComponent(list.id)}`,
                kind: 'Your list',
              },
              targets.map((item) => item.key),
              evidence,
              level,
            );
          }),
        );
      })(),
      (async () => {
        const practiced = new Set<string>();
        for (let offset = 0; ; offset += 1000) {
          const { data, error } = await supabase
            .from('grammar_rule_attempts')
            .select('id, rule_id, content_version, answers')
            .eq('user_id', userId)
            .order('id')
            .range(offset, offset + 999);
          if (error) throw new Error('Grammar progress unavailable');
          for (const row of data ?? []) {
            const rule = eligible.find(
              (rule) =>
                rule.id === row.rule_id && rule.version === row.content_version,
            );
            if (rule && validGrammarAnswers(rule, row.answers))
              practiced.add(row.rule_id);
          }
          if (!data || data.length < 1000) break;
        }
        return { practiced: practiced.size, available: eligible.length };
      })(),
      (async () => {
        const { data, error } = await supabase.rpc('practice_seconds_last_30_days');
        if (error || typeof data !== 'number' || !Number.isFinite(data) || data < 0) throw new Error('Practice time unavailable');
        return data;
      })(),
    ]);
    const [catalog, lists, grammar, time] = results;
    // A profile change during loading must never display another level's catalog.
    const summary: HomeSummary = {
      level,
      vocabulary: catalog.status === 'fulfilled' ? catalog.value : null,
      lists: lists.status === 'fulfilled' ? lists.value : null,
      grammar: grammar.status === 'fulfilled' ? grammar.value : null,
      practiceSeconds: time.status === 'fulfilled' ? time.value : null,
    };
    return reply(summary);
  } catch {
    return reply(
      { error: 'Your dashboard could not be loaded. Try again.' },
      503,
    );
  }
}
