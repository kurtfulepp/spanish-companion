import type {
  AssessmentCatalog,
  AssessmentItem,
} from './vocabulary-assessment';

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

export type LearningPathState =
  | 'new'
  | 'learning'
  | 'known'
  | 'due'
  | 'retained';

export type LearningPathEntry<T extends LearningPathItem> = T & {
  assessment: AssessmentItem | null;
  state: LearningPathState;
};

export type VocabularySetProgress = VocabularyLearningSet & {
  knownCount: number;
  retainedCount: number;
};

export type LearningPathSummary<T extends LearningPathItem> = {
  entries: LearningPathEntry<T>[];
  activeSet: VocabularySetProgress | null;
  active: LearningPathEntry<T>[];
  due: LearningPathEntry<T>[];
  known: LearningPathEntry<T>[];
  retained: LearningPathEntry<T>[];
  setProgress: VocabularySetProgress[];
  knownCount: number;
  retainedCount: number;
  masteredForNow: boolean;
};

export function learningPathState(
  assessment: AssessmentItem | null,
  now = Date.now(),
): LearningPathState {
  if (!assessment?.latest || assessment.status === 'not_assessed') return 'new';
  if (assessment.status === 'needs_practice') return 'learning';
  if (Date.parse(assessment.latest.reviewAt) <= now) return 'due';
  return assessment.latest.retained ? 'retained' : 'known';
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
  const entries = items
    .filter((item) => item.learning_set_id && setById.has(item.learning_set_id))
    .map((item) => {
      const assessment = assessmentById.get(item.id) ?? null;
      return {
        ...item,
        assessment,
        state: learningPathState(assessment, now),
      };
    })
    .sort((a, b) => {
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
        knownCount: setEntries.filter((entry) =>
          ['known', 'due', 'retained'].includes(entry.state),
        ).length,
        retainedCount: setEntries.filter(
          (entry) => entry.state === 'retained',
        ).length,
      };
    });
  const activeSet =
    setProgress.find((set) => set.knownCount < set.item_count) ?? null;
  const active = activeSet
    ? entries.filter(
        (entry) =>
          entry.learning_set_id === activeSet.id &&
          (entry.state === 'new' || entry.state === 'learning'),
      )
    : [];
  const due = entries.filter((entry) => entry.state === 'due');
  const known = entries.filter((entry) => entry.state === 'known');
  const retained = entries.filter((entry) => entry.state === 'retained');
  const knownCount = entries.filter((entry) =>
    ['known', 'due', 'retained'].includes(entry.state),
  ).length;

  return {
    entries,
    activeSet,
    active,
    due,
    known,
    retained,
    setProgress,
    knownCount,
    retainedCount: retained.length,
    masteredForNow:
      entries.length > 0 && retained.length === entries.length && due.length === 0,
  };
}
