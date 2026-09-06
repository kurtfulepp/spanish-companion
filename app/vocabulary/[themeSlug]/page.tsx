import { VocabularyTopicPage } from '@/components/vocabulary-topic-page';

export default async function TopicPage({ params }: { params: Promise<{ themeSlug: string }> }) {
  const { themeSlug } = await params;
  return <VocabularyTopicPage themeId={themeSlug} />;
}

