import type { GrammarLesson } from './grammar-lessons';

export type GrammarAttempt = {
  phase: 'learn' | 'practice' | 'result';
  indices: number[];
  position: number;
  selected: number | null;
  answers: Record<number, number>;
  reviewing: boolean;
};
export type GrammarAction =
  | { type: 'start' | 'check' | 'next' | 'retry-missed' }
  | { type: 'select'; value: number };

export function newGrammarAttempt(lesson: GrammarLesson): GrammarAttempt {
  return {
    phase: 'learn',
    indices: lesson.questions.map((_, index) => index),
    position: 0,
    selected: null,
    answers: {},
    reviewing: false,
  };
}

export function grammarResult(lesson: GrammarLesson, attempt: GrammarAttempt) {
  const missed = attempt.indices.filter(
    (index) => attempt.answers[index] !== lesson.questions[index].answer,
  );
  return {
    score: attempt.indices.length - missed.length,
    total: attempt.indices.length,
    missed,
  };
}

export function advanceGrammar(
  lesson: GrammarLesson,
  state: GrammarAttempt,
  action: GrammarAction,
): GrammarAttempt {
  if (action.type === 'start')
    return { ...newGrammarAttempt(lesson), phase: 'practice' };
  if (action.type === 'retry-missed') {
    if (state.phase !== 'result') return state;
    const { missed } = grammarResult(lesson, state);
    return missed.length
      ? {
          phase: 'practice',
          indices: missed,
          position: 0,
          selected: null,
          answers: {},
          reviewing: true,
        }
      : state;
  }
  if (state.phase !== 'practice') return state;
  const index = state.indices[state.position];
  const checked = Object.hasOwn(state.answers, index);
  if (action.type === 'select') {
    if (
      checked ||
      !Number.isInteger(action.value) ||
      !lesson.questions[index].options[action.value]
    )
      return state;
    return { ...state, selected: action.value };
  }
  if (action.type === 'check') {
    if (checked || state.selected === null) return state;
    return { ...state, answers: { ...state.answers, [index]: state.selected } };
  }
  if (!checked) return state;
  return state.position === state.indices.length - 1
    ? { ...state, phase: 'result' }
    : { ...state, position: state.position + 1, selected: null };
}
