export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export type CEFRLevel = (typeof CEFR_LEVELS)[number];

export function isCEFRLevel(value: unknown): value is CEFRLevel {
  return typeof value === 'string' && CEFR_LEVELS.includes(value as CEFRLevel);
}

export function cefrLevel(value: unknown): CEFRLevel | '' {
  return isCEFRLevel(value) ? value : '';
}

export const CEFR_GUIDANCE: Record<CEFRLevel, {
  name: string;
  vocabulary: string;
  photoVocabulary: string;
}> = {
  A1: {
    name: 'Beginner',
    vocabulary: 'Frequent words and short phrases for immediate needs.',
    photoVocabulary: 'Choose concrete, frequently used objects with simple singular nouns and articles.',
  },
  A2: {
    name: 'Elementary',
    vocabulary: 'Everyday words and reusable phrases for familiar situations.',
    photoVocabulary: 'Choose common objects plus practical everyday phrases a learner can reuse.',
  },
  B1: {
    name: 'Intermediate',
    vocabulary: 'Practical expressions, useful collocations, and language for explaining ideas.',
    photoVocabulary: 'Choose useful objects, actions, and common collocations for connected everyday speech.',
  },
  B2: {
    name: 'Upper intermediate',
    vocabulary: 'Natural collocations, nuance, and precise language for broader situations.',
    photoVocabulary: 'Choose precise objects, actions, descriptive language, and natural collocations.',
  },
  C1: {
    name: 'Advanced',
    vocabulary: 'Idiomatic, precise, and register-aware language.',
    photoVocabulary: 'Prefer precise terms, idiomatic collocations, register notes, and useful distinctions.',
  },
  C2: {
    name: 'Proficient',
    vocabulary: 'Subtle distinctions, connotation, register, and regional nuance.',
    photoVocabulary: 'Prefer subtle lexical distinctions, connotation, register, and regional nuance over basic labels.',
  },
};
