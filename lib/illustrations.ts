export type KurtESIllustration = {
  src: string;
  alt: string;
  family: 'topic';
};

export const KURTES_ILLUSTRATIONS = {
  topicCompass: {
    src: '/illustrations/topics/topic-compass.png',
    alt: 'A colorful KurtES compass',
    family: 'topic',
  },
  diningOut: {
    src: '/illustrations/topics/dining-out.png',
    alt: 'A colorful restaurant place setting',
    family: 'topic',
  },
  aroundTheCity: {
    src: '/illustrations/topics/around-the-city.png',
    alt: 'A colorful neighborhood street with a bicycle',
    family: 'topic',
  },
  travel: {
    src: '/illustrations/topics/travel.png',
    alt: 'A colorful travel case and airplane',
    family: 'topic',
  },
  socialLife: {
    src: '/illustrations/topics/social-life.png',
    alt: 'Two colorful café drinks and conversation bubbles',
    family: 'topic',
  },
  workMeetings: {
    src: '/illustrations/topics/work-meetings.png',
    alt: 'A colorful laptop, notebook, lamp, and pen',
    family: 'topic',
  },
  homeDailyLife: {
    src: '/illustrations/topics/home-daily-life.png',
    alt: 'A welcoming colorful doorway with plants and keys',
    family: 'topic',
  },
  feelingsRelationships: {
    src: '/illustrations/topics/feelings-relationships.png',
    alt: 'Two colorful interlocking hearts held in open hands',
    family: 'topic',
  },
} as const satisfies Record<string, KurtESIllustration>;

export type KurtESIllustrationName = keyof typeof KURTES_ILLUSTRATIONS;
