import { KURTES_ILLUSTRATIONS } from '@/lib/illustrations';

export const VOCABULARY_TOPIC_PRESENTATION = {
  'dining-out': {
    image: KURTES_ILLUSTRATIONS.diningOut,
    cardTone: 'bg-[#fff0e8]',
    accent: '#e9513d',
  },
  'around-the-city': {
    image: KURTES_ILLUSTRATIONS.aroundTheCity,
    cardTone: 'bg-[#e7f1f8]',
    accent: '#38a8b0',
  },
  travel: {
    image: KURTES_ILLUSTRATIONS.travel,
    cardTone: 'bg-[#e9f6f0]',
    accent: '#32806a',
  },
  'social-life': {
    image: KURTES_ILLUSTRATIONS.socialLife,
    cardTone: 'bg-[#fff1ed]',
    accent: '#d85b48',
  },
  'work-meetings': {
    image: KURTES_ILLUSTRATIONS.workMeetings,
    cardTone: 'bg-[#eef0fb]',
    accent: '#5968a8',
  },
  'home-daily-life': {
    image: KURTES_ILLUSTRATIONS.homeDailyLife,
    cardTone: 'bg-[#fff4dc]',
    accent: '#b67a19',
  },
  'feelings-relationships': {
    image: KURTES_ILLUSTRATIONS.feelingsRelationships,
    cardTone: 'bg-[#fbecef]',
    accent: '#b84c68',
  },
} as const;

export type VocabularyTopicId = keyof typeof VOCABULARY_TOPIC_PRESENTATION;

export function isVocabularyTopicId(value: string): value is VocabularyTopicId {
  return value in VOCABULARY_TOPIC_PRESENTATION;
}

export function topicPresentation(value: string) {
  return isVocabularyTopicId(value)
    ? VOCABULARY_TOPIC_PRESENTATION[value]
    : null;
}
