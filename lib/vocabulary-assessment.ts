import type { CEFRLevel } from './cefr';
import {
  isPassingFeedbackVerdict,
  type LearningFeedbackVerdict,
} from './feedback-language';

export type AssessmentScope =
  | { themeId: string; listId?: never }
  | { listId: string; themeId?: never };
export type AssessmentStatus = 'known' | 'needs_practice' | 'not_assessed';
export type AssessmentVerdict = LearningFeedbackVerdict;
export type AssessmentMode = 'practice' | 'check';
export type AssessmentFeedback = {
  verdict: AssessmentVerdict;
  explanation: string;
  example: string;
};
export type AssessmentResult = {
  id: string;
  targetKey: string;
  level: CEFRLevel;
  savedAt: string;
  status: AssessmentStatus;
  recall: AssessmentFeedback;
  use: AssessmentFeedback;
  recallAnswer: string;
  useAnswer: string;
  recallPrompt: string;
  usePrompt: string;
  disputed: boolean;
  reviewAt: string;
  retained: boolean;
  mode?: AssessmentMode;
};
export type AssessmentItem = {
  id: string;
  key: string;
  english: string;
  spanish: string;
  status: AssessmentStatus;
  latest: AssessmentResult | null;
};
export type VocabularyLearningState =
  | 'new'
  | 'practiced'
  | 'needs_practice'
  | 'known'
  | 'review_due'
  | 'retained';
export type AssessmentCatalog = {
  title: string;
  level: CEFRLevel;
  items: AssessmentItem[];
  available: boolean;
};
export type AssessmentChallenge = {
  id: string;
  token: string;
  recallPrompt: string;
  usePrompt: string;
  mode: AssessmentMode;
};
export const ASSESSMENT_VERSION = 1;
export const DAY_MS = 86_400_000;
export function assessmentStatus(
  recall: AssessmentVerdict,
  use: AssessmentVerdict,
): AssessmentStatus {
  if (recall === 'incorrect' || use === 'incorrect') return 'needs_practice';
  return isPassingFeedbackVerdict(recall) && isPassingFeedbackVerdict(use)
    ? 'known'
    : 'not_assessed';
}
export function vocabularyLearningState(
  item: AssessmentItem | null,
  now = Date.now(),
): VocabularyLearningState {
  if (!item?.latest) return 'new';
  // A disputed result is activity, not evidence of a gap or knowledge.
  if (item.latest.disputed) return 'practiced';
  if (
    item.status === 'needs_practice' ||
    (item.latest.mode === 'practice' &&
      item.latest.recall.verdict === 'incorrect')
  )
    return 'needs_practice';
  if (item.status === 'not_assessed') return 'practiced';
  if (Date.parse(item.latest.reviewAt) <= now) return 'review_due';
  return item.latest.retained ? 'retained' : 'known';
}
export function vocabularyLearningStateLabel(state: VocabularyLearningState) {
  return state === 'new'
    ? 'New'
    : state === 'practiced'
      ? 'Practiced'
      : state === 'needs_practice'
        ? 'Needs practice'
        : state === 'known'
          ? 'Known'
          : state === 'review_due'
            ? 'Review due'
            : 'Retained';
}
export function assessmentQueue(items: AssessmentItem[], now = Date.now()) {
  const order: Record<VocabularyLearningState, number> = {
    needs_practice: 0,
    review_due: 1,
    practiced: 2,
    new: 3,
    known: 4,
    retained: 5,
  };
  const priority = (item: AssessmentItem) =>
    order[vocabularyLearningState(item, now)];
  return [...items].sort((a, b) => priority(a) - priority(b));
}
