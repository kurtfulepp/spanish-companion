import type { SupabaseClient } from '@supabase/supabase-js';
import type { CEFRLevel } from '@/lib/cefr';
import type {
  AssessmentScope,
  AssessmentResult,
  AssessmentCatalog,
} from '@/lib/vocabulary-assessment';
import { ASSESSMENT_VERSION } from '@/lib/vocabulary-assessment';
import { contentKey, verifyEvidence } from './assessment-crypto';

export type AssessmentTarget = {
  id: string;
  key: string;
  english: string;
  spanish: string;
  example: string;
  exampleEnglish: string;
  note: string;
  context: string;
};
export type AssessmentReceipt = {
  version: number;
  userId: string;
  result: AssessmentResult;
  model: string;
};
export type ReceiptRow = {
  id: string;
  user_id: string;
  payload: string;
  signature: string;
  disputed: boolean;
};
export function decodeReceipt(
  row: ReceiptRow,
  userId: string,
  secret: string,
): AssessmentResult | null {
  try {
    if (
      row.user_id !== userId ||
      !verifyEvidence(row.payload, row.signature, secret)
    )
      return null;
    const receipt = JSON.parse(row.payload) as AssessmentReceipt;
    if (
      receipt.version !== ASSESSMENT_VERSION ||
      receipt.userId !== userId ||
      receipt.result.id !== row.id
    )
      return null;
    return {
      ...receipt.result,
      disputed: row.disputed,
      status: row.disputed ? 'not_assessed' : receipt.result.status,
    };
  } catch {
    return null;
  }
}
export async function loadAssessmentResults(
  client: SupabaseClient,
  userId: string,
  secret: string,
) {
  if (secret.length < 32)
    throw new Error('Assessment storage is not configured yet.');
  const results: AssessmentResult[] = [];
  for (let start = 0; ; start += 1000) {
    const { data, error } = await client
      .from('vocabulary_assessment_attempts')
      .select('id,user_id,payload,signature,disputed')
      .eq('user_id', userId)
      .order('id')
      .range(start, start + 999);
    if (error)
      throw new Error('Saved assessments could not be loaded. Try again.');
    for (const row of data ?? []) {
      const result = decodeReceipt(row, userId, secret);
      if (result) results.push(result);
    }
    if (!data || data.length < 1000) break;
  }
  return results.sort(
    (a, b) => b.savedAt.localeCompare(a.savedAt) || b.id.localeCompare(a.id),
  );
}
export async function loadAssessmentTargets(
  client: SupabaseClient,
  userId: string,
  level: CEFRLevel,
  scope: AssessmentScope,
): Promise<{ title: string; targets: AssessmentTarget[] }> {
  if (scope.listId) {
    const { data, error } = await client
      .from('custom_vocabulary_lists')
      .select('id,name,words,source,cefr_level')
      .eq('id', scope.listId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .maybeSingle();
    if (error || !data) throw new Error('Your list is unavailable.');
    if (data.source === 'demo')
      throw new Error(
        'Example lists are for browsing only. Assess a list you created.',
      );
    const words = data.words as { english: string; spanish: string }[];
    return {
      title: data.name,
      targets: words.map((word, index) => ({
        id: String(index),
        key: contentKey(`list:${data.id}:${index}`, [
          word.english,
          word.spanish,
        ]),
        english: word.english,
        spanish: word.spanish,
        example: '',
        exampleEnglish: '',
        note: '',
        context:
          'A short everyday situation involving this word or expression.',
      })),
    };
  }
  const { data, error } = await client
    .from('vocabulary_themes')
    .select(
      'id,title,vocabulary_sections(title,description,sort_order,vocabulary_items(id,english,spanish,example_es,example_en,usage_note,cefr_level))',
    )
    .eq('id', scope.themeId)
    .eq('is_published', true)
    .maybeSingle();
  if (error || !data) throw new Error('This vocabulary topic is unavailable.');
  return {
    title: data.title,
    targets: [...data.vocabulary_sections]
      .sort((a, b) => a.sort_order - b.sort_order)
      .flatMap((section) =>
        section.vocabulary_items
          .filter((item) => item.cefr_level === level)
          .map((item) => ({
            id: item.id,
            key: contentKey(`topic:${item.id}`, [
              item.english,
              item.spanish,
              item.example_es,
              item.example_en,
              item.usage_note,
            ]),
            english: item.english,
            spanish: item.spanish,
            example: item.example_es,
            exampleEnglish: item.example_en,
            note: item.usage_note ?? '',
            context: `${data.title}: ${section.title}. ${section.description}`,
          })),
      ),
  };
}
export function makeAssessmentCatalog(
  title: string,
  targets: AssessmentTarget[],
  results: AssessmentResult[],
  level: CEFRLevel,
  available: boolean,
): AssessmentCatalog {
  return {
    title,
    level,
    available,
    items: targets.map((target) => {
      const latest =
        results.find(
          (result) => result.targetKey === target.key && result.level === level,
        ) ?? null;
      return {
        id: target.id,
        key: target.key,
        english: target.english,
        spanish: target.spanish,
        status: latest?.status ?? 'not_assessed',
        latest,
      };
    }),
  };
}
