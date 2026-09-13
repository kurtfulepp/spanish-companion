'use client';
import { VocabularyHeader } from '@/components/vocabulary-header';
import { VocabularyAssessment } from '@/components/vocabulary-assessment';
import { useLearnerProfile } from '@/components/learner-profile-provider';
import { LevelRequired } from '@/components/level-required';
import base from './photo-vocabulary.module.css';
export function CustomVocabularyPractice({ listId }: { listId: string }) {
  const { profile, setProfile, loading } = useLearnerProfile();
  return (
    <main className={base.page}>
      <VocabularyHeader onProfileChange={setProfile} />
      {!loading && !profile.proficiencyLevel ? (
        <LevelRequired profile={profile} onProfileChange={setProfile} />
      ) : (
        !loading && <VocabularyAssessment scope={{ listId }} />
      )}
    </main>
  );
}
