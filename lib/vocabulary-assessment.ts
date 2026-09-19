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
export function assessmentQueue(items: AssessmentItem[], now = Date.now()) {
  const priority = (item: AssessmentItem) =>
    item.status === 'needs_practice'
      ? 0
      : item.status === 'not_assessed'
        ? 1
        : item.latest && Date.parse(item.latest.reviewAt) <= now
          ? 2
          : 3;
  return [...items].sort((a, b) => priority(a) - priority(b));
}
