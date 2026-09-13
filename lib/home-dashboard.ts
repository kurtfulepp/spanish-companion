import type { CEFRLevel } from './cefr';
import type { AssessmentResult } from './vocabulary-assessment';
export type DashboardArea = {
  id: string;
  title: string;
  href: string;
  practiced: number;
  known: number;
  needsPractice: number;
  unassessed: number;
  retained: number;
  kind: 'Vocabulary' | 'Your list';
};
export type HomeSummary = {
  level: CEFRLevel | '';
  vocabulary: DashboardArea[] | null;
  lists: DashboardArea[] | null;
  grammar: { practiced: number; available: number } | null;
};
export function assessedArea(
  area: Pick<DashboardArea, 'id' | 'title' | 'href' | 'kind'>,
  keys: string[],
  results: AssessmentResult[],
  level: CEFRLevel,
): DashboardArea {
  const latest = keys.map((key) =>
    results.find(
      (result) => result.targetKey === key && result.level === level,
    ),
  );
  return {
    ...area,
    practiced: latest.filter(Boolean).length,
    known: latest.filter(
      (result) => result?.status === 'known' && !result.disputed,
    ).length,
    needsPractice: latest.filter(
      (result) => result?.status === 'needs_practice' && !result.disputed,
    ).length,
    unassessed: latest.filter(
      (result) =>
        !result || result.status === 'not_assessed' || result.disputed,
    ).length,
    retained: latest.filter(
      (result) =>
        result?.status === 'known' && result.retained && !result.disputed,
    ).length,
  };
}
export function practiceAreas(summary: HomeSummary): DashboardArea[] {
  return [...(summary.vocabulary ?? []), ...(summary.lists ?? [])]
    .filter((area) => area.needsPractice > 0)
    .sort(
      (a, b) =>
        b.needsPractice - a.needsPractice || a.title.localeCompare(b.title),
    );
}
