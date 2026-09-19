import type { CEFRLevel } from './cefr';

export type GrammarContextWord = {
  spanish: string;
  english: string;
};

export type GrammarContext = {
  id: string;
  kind: 'theme' | 'custom';
  title: string;
  words: GrammarContextWord[];
};

type RawVocabularyItem = GrammarContextWord & { id: string };
type RawTheme = {
  id: string;
  title: string;
  vocabulary_sections?: Array<{
    vocabulary_items?: RawVocabularyItem[] | null;
  }> | null;
};
type RawCustomList = {
  id: string;
  name: string;
  words: unknown;
  source: string;
  cefr_level?: string | null;
};

const MAX_CONTEXTS_PER_KIND = 12;
const MAX_WORDS = 8;
const MAX_TEXT = 200;

function cleanText(value: unknown, maximum = MAX_TEXT) {
  return typeof value === 'string'
    ? value.trim().replace(/\s+/g, ' ').slice(0, maximum)
    : '';
}

function cleanWords(value: unknown): GrammarContextWord[] {
  if (!Array.isArray(value)) return [];
  const words: GrammarContextWord[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const spanish = cleanText((item as Record<string, unknown>).spanish);
    const english = cleanText((item as Record<string, unknown>).english);
    const key = spanish.toLocaleLowerCase('es');
    if (!spanish || !english || seen.has(key)) continue;
    words.push({ spanish, english });
    seen.add(key);
    if (words.length === MAX_WORDS) break;
  }
  return words;
}

export function buildGrammarContexts({
  themes,
  practicedItemIds,
  customLists,
  level,
}: {
  themes: RawTheme[];
  practicedItemIds: Iterable<string>;
  customLists: RawCustomList[];
  level: CEFRLevel;
}): GrammarContext[] {
  const practiced = new Set(practicedItemIds);
  const themeContexts = themes.flatMap((theme) => {
    const title = cleanText(theme.title);
    const words = cleanWords(
      (theme.vocabulary_sections ?? []).flatMap((section) =>
        (section.vocabulary_items ?? []).filter((item) =>
          practiced.has(item.id),
        ),
      ),
    );
    return title && cleanText(theme.id) && words.length
      ? [{ id: `theme:${theme.id}`, kind: 'theme' as const, title, words }]
      : [];
  });
  const customContexts = customLists.flatMap((list) => {
    const title = cleanText(list.name);
    const words = cleanWords(list.words);
    const matchesLevel = !list.cefr_level || list.cefr_level === level;
    return list.source === 'photo' && matchesLevel && title && words.length
      ? [{ id: `custom:${list.id}`, kind: 'custom' as const, title, words }]
      : [];
  });
  return [
    ...themeContexts.slice(0, MAX_CONTEXTS_PER_KIND),
    ...customContexts.slice(0, MAX_CONTEXTS_PER_KIND),
  ];
}

const themeSituations: Record<string, string> = {
  'dining-out':
    'Use the rule to describe a meal, make a request, or explain what happened at a restaurant.',
  'around-the-city':
    'Use the rule to ask for directions or describe where you went in a city.',
  travel:
    'Use the rule to describe a journey, a plan, or a problem while travelling.',
  'social-life':
    'Use the rule to describe plans, invitations, or something that happened with friends.',
  'work-meetings':
    'Use the rule to explain a decision, request, or event at work.',
  'home-daily-life':
    'Use the rule to describe a routine, a room, or something that happened at home.',
  'feelings-relationships':
    'Use the rule to express a feeling or explain what happened between people.',
};

const diningOutExamples: Record<string, { spanish: string; english: string }> =
  {
    'A1-04.agreement': {
      spanish: 'La mesa pequeña está libre.',
      english: 'The small table is available.',
    },
    'A1-08.present-person': {
      spanish: 'Pedimos el plato del día.',
      english: 'We order the special of the day.',
    },
    'A2-05.regular-preterite': {
      spanish: 'Ayer reservé una mesa.',
      english: 'Yesterday I reserved a table.',
    },
    'A2-05.irregular-preterite': {
      spanish: 'Fuimos al restaurante y tuvimos que esperar.',
      english: 'We went to the restaurant and had to wait.',
    },
    'A2-06.imperfect': {
      spanish: 'De niño, comía fuera los domingos.',
      english: 'As a child, I used to eat out on Sundays.',
    },
    'B1-01.past-viewpoint': {
      spanish: 'El comedor estaba lleno cuando llegó el camarero.',
      english: 'The dining room was full when the server arrived.',
    },
    'B1-02.earlier-past': {
      spanish: 'Cuando llegamos, ya habían cerrado la cocina.',
      english: 'When we arrived, they had already closed the kitchen.',
    },
    'B2-01.past-narration': {
      spanish:
        'Había reservado una mesa, pero el restaurante estaba cerrado cuando llegamos.',
      english:
        'I had reserved a table, but the restaurant was closed when we arrived.',
    },
    'B2-04.past-counterfactual': {
      spanish: 'Si hubiéramos reservado, no habríamos esperado.',
      english: 'If we had reserved, we would not have waited.',
    },
    'C1-04.cuyo': {
      spanish: 'El restaurante, cuyo menú cambia a diario, estaba lleno.',
      english: 'The restaurant, whose menu changes daily, was full.',
    },
    'C2-03.open-concession': {
      spanish: 'Pidas lo que pidas, te explicarán los ingredientes.',
      english: 'Whatever you order, they will explain the ingredients to you.',
    },
  };

export function grammarContextSupport(context: GrammarContext, ruleId: string) {
  const themeId = context.kind === 'theme' ? context.id.slice(6) : null;
  return {
    situation:
      (themeId && themeSituations[themeId]) ||
      'Use the rule in a real or imagined situation connected to these words.',
    example:
      themeId === 'dining-out' ? (diningOutExamples[ruleId] ?? null) : null,
  };
}
