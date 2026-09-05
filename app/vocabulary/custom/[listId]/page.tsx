import { CustomVocabularyPractice } from '@/components/custom-vocabulary-practice';
export default async function CustomListPage({ params }: { params: Promise<{ listId: string }> }) {
  const { listId } = await params;
  return <CustomVocabularyPractice key={listId} listId={listId} />;
}
