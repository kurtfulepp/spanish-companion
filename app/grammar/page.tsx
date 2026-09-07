'use client';
import { LearningHeader } from '@/components/vocabulary-header';
import { useLearnerProfile } from '@/components/learner-profile-provider';
import { LevelRequired } from '@/components/level-required';
import { GrammarCurriculum } from '@/components/grammar-curriculum';
import styles from './grammar.module.css';

export default function GrammarPage() {
  const { profile, loading, userId, setProfile } = useLearnerProfile();
  return (
    <main className={styles.page}>
      <LearningHeader active="grammar" onProfileChange={setProfile} />
      {loading ? (
        <output className={styles.loading}>Loading grammar…</output>
      ) : !profile.proficiencyLevel ? (
        <LevelRequired profile={profile} onProfileChange={setProfile} />
      ) : (
        <GrammarCurriculum
          key={`${userId}:${profile.proficiencyLevel}`}
          level={profile.proficiencyLevel}
        />
      )}
    </main>
  );
}
