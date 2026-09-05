export type LearningArea = 'vocabulary' | 'grammar' | 'conversation';

const LAST_LEARNING_PATH_KEY = 'kurtes:last-learning-path';

export function learningPath(area: LearningArea) {
  return `/${area}`;
}

export function rememberLearningPath(area: LearningArea) {
  try {
    window.localStorage.setItem(LAST_LEARNING_PATH_KEY, learningPath(area));
  } catch {
    // Navigation still works when storage is unavailable.
  }
}
