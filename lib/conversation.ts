import type { CEFRLevel } from './cefr';

export const MAX_CONVERSATION_TURNS = 6;
export const MAX_CONVERSATION_MESSAGE = 600;
export type ConversationExpression = {
  id: string;
  spanish: string;
  english: string;
  needsPractice: boolean;
};
export type ConversationScenario = {
  id: string;
  title: string;
  description: string;
  expressions: ConversationExpression[];
};
export type ConversationTopic = {
  id: string;
  title: string;
  scenarios: ConversationScenario[];
  practicedCount: number;
};
export type ConversationCatalog = {
  level: CEFRLevel;
  topics: ConversationTopic[];
  available: boolean;
};
export type ConversationMessage = {
  role: 'assistant' | 'user';
  content: string;
  translation?: string;
  hint?: string;
};
export type ConversationReply = {
  spanish: string;
  english: string;
  hint: string;
};
export type ConversationReview = {
  summary: string;
  corrections: { original: string; suggestion: string; explanation: string }[];
  nextPractice: string;
};

export type TopicLearningData = {
  id: string;
  title: string;
  vocabulary_sections: {
    id: string;
    title: string;
    description: string;
    sort_order: number;
    vocabulary_items: {
      id: string;
      spanish: string;
      english: string;
      cefr_level: string;
    }[];
  }[];
};
export type PracticeRecord = {
  item_id: string;
  status: string;
  last_seen_at: string | null;
};

/** Only saved practice at the active level grants access, including Needs practice. */
export function buildConversationTopics(
  topics: TopicLearningData[],
  progress: PracticeRecord[],
  level: CEFRLevel,
): ConversationTopic[] {
  const practiced = new Map(
    progress
      .filter(
        (p) =>
          p.last_seen_at && ['new', 'learning', 'confident'].includes(p.status),
      )
      .map((p) => [p.item_id, p]),
  );
  return topics.map((topic) => {
    const scenarios = [...topic.vocabulary_sections]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((section) => ({
        id: section.id,
        title: section.title,
        description: section.description,
        expressions: section.vocabulary_items
          .filter((item) => item.cefr_level === level && practiced.has(item.id))
          .map((item) => ({
            id: item.id,
            spanish: item.spanish,
            english: item.english,
            needsPractice: practiced.get(item.id)?.status !== 'confident',
          }))
          .sort(
            (a, b) =>
              Number(b.needsPractice) - Number(a.needsPractice) ||
              a.id.localeCompare(b.id),
          ),
      }));
    return {
      id: topic.id,
      title: topic.title,
      scenarios,
      practicedCount: scenarios.reduce(
        (sum, s) => sum + s.expressions.length,
        0,
      ),
    };
  });
}
