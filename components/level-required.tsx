'use client';

import { SlidersHorizontal } from 'lucide-react';
import { LevelAssessmentDialog } from '@/components/level-assessment-dialog';
import type { LearnerProfile } from '@/lib/learner-profile';

export function LevelRequired({ profile, onProfileChange }: { profile: LearnerProfile; onProfileChange: (profile: LearnerProfile) => void }) {
  return <section className="surface mx-auto mt-5 max-w-[760px] rounded-[28px] p-7 text-center sm:p-10" aria-labelledby="level-required-title">
    <span className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--brand-cream)] text-[var(--brand-ink)]"><SlidersHorizontal className="size-5" /></span>
    <h1 id="level-required-title" className="mt-5 text-3xl font-semibold tracking-[-.045em] text-[var(--brand-ink)]">Set your Spanish level</h1>
    <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">KurtES uses one level across vocabulary, grammar, conversation, and generated practice.</p>
    <div className="mt-6 flex justify-center"><LevelAssessmentDialog profile={profile} onProfileChange={onProfileChange} /></div>
  </section>;
}
