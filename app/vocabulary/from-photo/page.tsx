import { PhotoVocabulary } from '@/components/photo-vocabulary';
import { PhotoVocabularyDemo } from '@/components/photo-vocabulary-demo';

export default async function PhotoVocabularyPage({ searchParams }: { searchParams: Promise<{ source?: string; demo?: string }> }) {
  const { source, demo } = await searchParams;
  if (demo === 'kitchen') return <PhotoVocabularyDemo />;
  return <PhotoVocabulary initialSource={source === 'camera' ? 'camera' : 'upload'} />;
}
