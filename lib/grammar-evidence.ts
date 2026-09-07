import { CEFR_LEVELS, type CEFRLevel } from './cefr';
import {
  GRAMMAR_RULES,
  checkGrammarAnswer,
  type EvidenceKind,
  type RuleLesson,
} from './grammar-rules';

export type GrammarSubmission = {
  attemptId: string;
  ruleId: string;
  version: number;
  answers: Record<string, string>;
  writing: string;
  selfReview: boolean[];
};
export type GrammarEvidence = {
  attemptId: string;
  ruleId: string;
  version: number;
  savedAt: string;
  scores: Record<EvidenceKind, { correct: number; total: number }>;
  writing: string;
  selfReview: boolean[];
};
export function scoreRule(lesson: RuleLesson, answers: Record<string, string>) {
  const scores = {
    recognition: { correct: 0, total: 0 },
    formation: { correct: 0, total: 0 },
    choice: { correct: 0, total: 0 },
  };
  for (const exercise of lesson.exercises) {
    scores[exercise.kind].total++;
    if (checkGrammarAnswer(exercise, answers[exercise.id] ?? ''))
      scores[exercise.kind].correct++;
  }
  return scores;
}

export function validateGrammarSubmission(
  value: unknown,
  profileLevel: CEFRLevel,
): GrammarSubmission | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Partial<GrammarSubmission>;
  if (
    typeof input.attemptId !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      input.attemptId,
    )
  )
    return null;
  const rule = GRAMMAR_RULES.find(
    (item) => item.id === input.ruleId && item.version === input.version,
  );
  if (
    !rule ||
    CEFR_LEVELS.indexOf(rule.level) > CEFR_LEVELS.indexOf(profileLevel)
  )
    return null;
  if (
    !input.answers ||
    typeof input.answers !== 'object' ||
    Array.isArray(input.answers)
  )
    return null;
  if (
    Object.keys(input.answers).length !== rule.exercises.length ||
    rule.exercises.some(
      (exercise) =>
        typeof input.answers?.[exercise.id] !== 'string' ||
        !input.answers[exercise.id].trim() ||
        input.answers[exercise.id].length > 300,
    )
  )
    return null;
  if (
    typeof input.writing !== 'string' ||
    input.writing.trim().length < 1 ||
    input.writing.length > 4000
  )
    return null;
  if (
    !Array.isArray(input.selfReview) ||
    input.selfReview.length !== rule.production.checklist.length ||
    input.selfReview.some((checked) => typeof checked !== 'boolean')
  )
    return null;
  return {
    attemptId: input.attemptId,
    ruleId: rule.id,
    version: rule.version,
    answers: input.answers,
    writing: input.writing.trim(),
    selfReview: input.selfReview,
  };
}
