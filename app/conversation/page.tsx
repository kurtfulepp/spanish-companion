'use client';
import { LearningHeader } from '@/components/vocabulary-header';
import { useLearnerProfile } from '@/components/learner-profile-provider';
import { LevelRequired } from '@/components/level-required';
import { ConversationPractice } from '@/components/conversation-practice';
export default function ConversationPage() {
  const { profile, loading, userId, setProfile } = useLearnerProfile();
  return (
    <main className="min-h-screen bg-background px-3 pb-12 pt-3 sm:px-5">
      <LearningHeader active="conversation" onProfileChange={setProfile} />
      {loading ? (
        <output className="block mx-auto mt-5 max-w-[1360px] rounded-3xl bg-white p-8">
          Loading your profile…
        </output>
      ) : !profile.proficiencyLevel ? (
        <LevelRequired profile={profile} onProfileChange={setProfile} />
      ) : (
        <ConversationPractice
          key={`${userId}:${profile.proficiencyLevel}`}
          level={profile.proficiencyLevel}
          voice={profile.voicePreference}
          displayName={profile.displayName}
        />
      )}
    </main>
  );
}
