import { PhotoVocabulary } from '@/components/photo-vocabulary';

export default async function PhotoVocabularyPage({ searchParams }: { searchParams: Promise<{ source?: string }> }) {
  const { source } = await searchParams;
  return <PhotoVocabulary initialSource={source === 'camera' ? 'camera' : 'upload'} />;
}
