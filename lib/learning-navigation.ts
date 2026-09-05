export type LearningArea = 'vocabulary' | 'grammar' | 'conversation';

const LAST_LEARNING_PATH_KEY = 'kurtes:last-learning-path';
const learningPaths = ['/vocabulary', '/grammar', '/conversation'] as const;

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

export function getLastLearningPath() {
  try {
    const saved = window.localStorage.getItem(LAST_LEARNING_PATH_KEY);
    if (learningPaths.some((path) => path === saved)) return saved as typeof learningPaths[number];
  } catch {
    // Fall through to the strongest current learning area.
  }
  return '/vocabulary';
}
