import type {
  AssessmentCatalog,
  AssessmentItem,
  VocabularyLearningState,
} from './vocabulary-assessment';
import { vocabularyLearningState } from './vocabulary-assessment';

export type VocabularyLearningSet = {
  id: string;
  set_number: number;
  title: string;
  description: string;
  item_count: number;
  content_version: number;
};

export type LearningPathItem = {
  id: string;
  learning_set_id: string | null;
  curriculum_position: number | null;
};

export type LearningPathState = VocabularyLearningState;

export type LearningPathEntry<T extends LearningPathItem> = T & {
  assessment: AssessmentItem | null;
  state: LearningPathState;
};

export type VocabularySetProgress = VocabularyLearningSet & {
  checkedCount: number;
  practicedCount: number;
  knownCount: number;
  retainedCount: number;
};

export type LearningPathSummary<T extends LearningPathItem> = {
  entries: LearningPathEntry<T>[];
  activeSet: VocabularySetProgress | null;
  newItems: LearningPathEntry<T>[];
  learning: LearningPathEntry<T>[];
  practiced: LearningPathEntry<T>[];
  due: LearningPathEntry<T>[];
  known: LearningPathEntry<T>[];
  retained: LearningPathEntry<T>[];
  setProgress: VocabularySetProgress[];
  knownCount: number;
  retainedCount: number;
  checkedCount: number;
  allRetained: boolean;
};

export type LearningSession<T extends LearningPathItem> = {
  items: LearningPathEntry<T>[];
  newRemaining: number;
  practiceRemaining: number;
};

export function learningPathState(
  assessment: AssessmentItem | null,
  now = Date.now(),
): LearningPathState {
  return vocabularyLearningState(assessment, now);
}

export function buildLearningPath<T extends LearningPathItem>(
  items: T[],
  sets: VocabularyLearningSet[],
  catalog: AssessmentCatalog | null,
  now = Date.now(),
): LearningPathSummary<T> {
  const assessmentById = new Map(
    (catalog?.items ?? []).map((item) => [item.id, item]),
  );
  const setById = new Map(sets.map((set) => [set.id, set]));
  const hasStructuredSets = sets.length > 0;
  const entries = items
    .filter(
      (item) =>
        !hasStructuredSets ||
        (item.learning_set_id && setById.has(item.learning_set_id)),
    )
    .map((item) => {
      const assessment = assessmentById.get(item.id) ?? null;
      return {
        ...item,
        assessment,
        state: learningPathState(assessment, now),
      };
    })
    .sort((a, b) => {
      if (!hasStructuredSets)
        return (a.curriculum_position ?? 0) - (b.curriculum_position ?? 0);
      const aSet = setById.get(a.learning_set_id!)!;
      const bSet = setById.get(b.learning_set_id!)!;
      return (
        aSet.set_number - bSet.set_number ||
        (a.curriculum_position ?? 0) - (b.curriculum_position ?? 0)
      );
    });

  const setProgress = [...sets]
    .sort((a, b) => a.set_number - b.set_number)
    .map((set) => {
      const setEntries = entries.filter(
        (entry) => entry.learning_set_id === set.id,
      );
      return {
        ...set,
        checkedCount: setEntries.filter(
          (entry) =>
            entry.assessment && entry.assessment.status !== 'not_assessed',
        ).length,
        practicedCount: setEntries.filter(
          (entry) => entry.state === 'practiced',
        ).length,
        knownCount: setEntries.filter((entry) =>
          ['known', 'review_due', 'retained'].includes(entry.state),
        ).length,
        retainedCount: setEntries.filter((entry) => entry.state === 'retained')
          .length,
      };
    });
  const activeSet =
    setProgress.find((set) => set.checkedCount < set.item_count) ?? null;
  const newItems = hasStructuredSets
    ? activeSet
      ? entries.filter(
          (entry) =>
            entry.learning_set_id === activeSet.id && entry.state === 'new',
        )
      : []
    : entries.filter((entry) => entry.state === 'new');
  const learning = entries.filter((entry) => entry.state === 'needs_practice');
  const practiced = entries.filter((entry) => entry.state === 'practiced');
  const due = entries.filter((entry) => entry.state === 'review_due');
  const known = entries.filter((entry) => entry.state === 'known');
  const retained = entries.filter((entry) => entry.state === 'retained');
  const knownCount = entries.filter((entry) =>
    ['known', 'review_due', 'retained'].includes(entry.state),
  ).length;
  const checkedCount = entries.filter(
    (entry) => entry.assessment && entry.assessment.status !== 'not_assessed',
  ).length;

  return {
    entries,
    activeSet,
    newItems,
    learning,
    practiced,
    due,
    known,
    retained,
    setProgress,
    knownCount,
    retainedCount: retained.length,
    checkedCount,
    allRetained:
      entries.length > 0 &&
      retained.length === entries.length &&
      due.length === 0,
  };
}

export function buildLearningSession<T extends LearningPathItem>(
  summary: LearningPathSummary<T>,
  size = 6,
): LearningSession<T> {
  const items: LearningPathEntry<T>[] = [];
  const selected = new Set<string>();

  const add = (candidates: LearningPathEntry<T>[], limit: number) => {
    for (const candidate of candidates) {
      if (items.length >= size || limit <= 0) break;
      if (selected.has(candidate.id)) continue;
      items.push(candidate);
      selected.add(candidate.id);
      limit -= 1;
    }
  };

  // Keep checks and reviews present without allowing them to consume the
  // entire session while the learner still has new curriculum to introduce.
  add(summary.due, Math.min(2, size));
  add(
    summary.learning,
    Math.min(summary.newItems.length > 0 ? 1 : 2, size - items.length),
  );
  add(
    summary.practiced,
    Math.min(summary.newItems.length > 0 ? 1 : size, size - items.length),
  );
  add(summary.newItems, size - items.length);

  // Once the current set has no new items, use the remaining capacity for
  // additional review work.
  if (items.length < size) add(summary.due, size - items.length);
  if (items.length < size) add(summary.learning, size - items.length);
  if (items.length < size) add(summary.practiced, size - items.length);

  return {
    items,
    newRemaining: Math.max(
      0,
      summary.newItems.filter((item) => !selected.has(item.id)).length,
    ),
    practiceRemaining: Math.max(
      0,
      [...summary.due, ...summary.learning, ...summary.practiced].filter(
        (item) => !selected.has(item.id),
      ).length,
    ),
  };
}
