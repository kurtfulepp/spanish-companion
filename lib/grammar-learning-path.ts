import { CEFR_LEVELS, type CEFRLevel } from './cefr';
import { GRAMMAR_RULES, EVIDENCE_LABELS } from './grammar-rules';
import { PAST_PATH_IDS } from './grammar-past-content';
import type { GrammarEvidence } from './grammar-evidence';

export const PAST_PATH = PAST_PATH_IDS.map((id) =>
  GRAMMAR_RULES.find((rule) => rule.id === id)!,
);
export const REVIEW_INTERVAL_MS = 3 * 24 * 60 * 60 * 1000;
export function latestPathEvidence(
  ruleId: string,
  attempts: GrammarEvidence[],
) {
  const rule = PAST_PATH.find((item) => item.id === ruleId);
  return attempts
    .filter(
      (attempt) =>
        attempt.ruleId === ruleId && attempt.version === rule?.version,
    )
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))[0];
}
export function pathRecommendation(
  level: CEFRLevel,
  attempts: GrammarEvidence[],
  now: number,
) {
  const eligible = PAST_PATH.filter(
    (rule) => CEFR_LEVELS.indexOf(rule.level) <= CEFR_LEVELS.indexOf(level),
  );
  const weak = eligible.find((rule) => {
    const attempt = latestPathEvidence(rule.id, attempts);
    return (
      attempt &&
      Object.values(attempt.scores).some(
        (score) => score.total > 0 && score.correct < score.total,
      )
    );
  });
  if (weak) {
    const attempt = latestPathEvidence(weak.id, attempts)!;
    const dimensions = Object.entries(attempt.scores)
      .filter(([, score]) => score.total > 0 && score.correct < score.total)
      .map(([kind]) =>
        EVIDENCE_LABELS[kind as keyof typeof EVIDENCE_LABELS].toLowerCase(),
      );
    return {
      rule: weak,
      mode: 'lesson' as const,
      reason: `Your latest saved attempt had errors in ${dimensions.join(' and ')}. Revisit the explanation and practise that distinction.`,
    };
  }
  const due = eligible.find((rule) => {
    const attempt = latestPathEvidence(rule.id, attempts);
    return attempt && now - Date.parse(attempt.savedAt) >= REVIEW_INTERVAL_MS;
  });
  if (due)
    return {
      rule: due,
      mode: 'revisit' as const,
      reason:
        'It has been at least three days since your last saved attempt. Try the separate review set before rereading the explanation.',
    };
  const untried =
    eligible.find(
      (rule) => rule.level === level && !latestPathEvidence(rule.id, attempts),
    ) ?? eligible.find((rule) => !latestPathEvidence(rule.id, attempts));
  if (untried)
    return {
      rule: untried,
      mode: 'lesson' as const,
      reason:
        untried.level === level
          ? 'Start with this lesson at your profile level. Earlier steps are available if you need the foundations.'
          : 'Try this earlier-level step to check a foundation for past narration.',
    };
  return null;
}
