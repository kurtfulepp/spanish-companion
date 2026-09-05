'use client';
/* oxlint-disable next/no-html-link-for-pages */

import { useEffect } from 'react';
import { Brand } from '@/components/brand';
import { ProfileDialog, type LearnerProfile } from '@/components/profile-dialog';
import { learningPath, rememberLearningPath, type LearningArea } from '@/lib/learning-navigation';
import { createClient } from '@/lib/supabase/client';

const sections: { id: LearningArea; label: string }[] = [
  { id: 'vocabulary', label: 'Vocabulary' },
  { id: 'grammar', label: 'Grammar' },
  { id: 'conversation', label: 'Conversation' },
];

const ignoreProfileChange = () => undefined;

export function LearningHeader({ active, onProfileChange = ignoreProfileChange }: { active: LearningArea; onProfileChange?: (profile: LearnerProfile) => void }) {

  useEffect(() => {
    rememberLearningPath(active);
    void createClient().auth.getUser().then(({ data }) => {
      if (!data.user) window.location.replace('/sign-in');
    });
  }, [active]);

  async function signOut() {
    await createClient().auth.signOut();
    window.location.replace('/');
  }

  return <header className="app-header h-auto min-h-16 flex-wrap gap-2 py-2"><a href={learningPath(active)} aria-label={`KurtES ${active}`}><Brand compact /></a><nav className="hidden items-center gap-1 md:flex" aria-label="Learning areas">{sections.map((section) => <a key={section.id} className={`nav-link ${section.id === active ? 'nav-link-active' : ''}`} href={learningPath(section.id)} aria-current={section.id === active ? 'page' : undefined}>{section.label}</a>)}</nav><div className="flex items-center gap-1 sm:gap-2"><button onClick={() => void signOut()} className="rounded-full px-2.5 py-2 text-sm font-semibold text-[var(--brand-ink)] transition hover:bg-[var(--brand-cream)] sm:px-3">Sign out</button><ProfileDialog onProfileChange={onProfileChange} fallbackAvatarSrc="/brand/kurtes-center.png" /></div><nav className="order-3 flex w-full items-center justify-center gap-1 border-t border-border/60 pt-2 md:hidden" aria-label="Learning areas">{sections.map((section) => <a key={section.id} className={`nav-link px-3 ${section.id === active ? 'nav-link-active' : ''}`} href={learningPath(section.id)} aria-current={section.id === active ? 'page' : undefined}>{section.label}</a>)}</nav></header>;
}

export function VocabularyHeader({ onProfileChange }: { onProfileChange: (profile: LearnerProfile) => void }) {
  return <LearningHeader active="vocabulary" onProfileChange={onProfileChange} />;
}
