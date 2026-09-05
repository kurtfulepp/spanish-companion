/* oxlint-disable next/no-html-link-for-pages, next/no-img-element */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Check, Headphones, MessageCircle, Play, Sparkles } from 'lucide-react';
import { DailyLessonDialog } from '@/components/daily-lesson-dialog';
import { LevelAssessmentDialog } from '@/components/level-assessment-dialog';
import { type LearnerProfile } from '@/components/profile-dialog';
import { SpeechButton } from '@/components/speech-button';
import { Button } from '@/components/ui/button';
import { LearningHeader } from '@/components/vocabulary-header';
import { DEFAULT_LEARNING_TIME_ZONE } from '@/lib/progress';

const emptyProfile: LearnerProfile = {
  displayName: '',
  proficiencyLevel: '',
  voicePreference: 'male',
  learningTimeZone: DEFAULT_LEARNING_TIME_ZONE,
  followDeviceTimeZone: false,
};

const listeningWarmup = [
  { spanish: '¿Qué planes tienes hoy?', english: 'What plans do you have today?' },
  { spanish: 'Depende del tiempo.', english: 'It depends on the weather.' },
  { spanish: 'Si hace buen tiempo, saldré a caminar.', english: 'If the weather is good, I’ll go for a walk.' },
];

export default function ConversationPage() {
  const [profile, setProfile] = useState<LearnerProfile>(emptyProfile);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [lessonComplete, setLessonComplete] = useState(false);
  const updateProfile = useCallback((next: LearnerProfile) => setProfile(next), []);

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: unknown, options?: { signal: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: 'start_conversation_lesson',
      title: 'Start a Spanish conversation lesson',
      description: 'Open the guided conversation lesson shown on the page.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute() {
        setLessonOpen(true);
        return { status: 'opened', lesson: 'Making plans naturally' };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  return (
    <main className="min-h-screen bg-background px-3 pb-12 pt-3 text-foreground sm:px-5">
      {lessonOpen && <DailyLessonDialog open onOpenChange={setLessonOpen} level={profile.proficiencyLevel || 'B2'} voice={profile.voicePreference} onComplete={() => setLessonComplete(true)} />}
      <LearningHeader active="conversation" onProfileChange={updateProfile} />

      <section className="brand-hero mx-auto mt-5 max-w-[1360px]">
        <span className="brand-orbit brand-orbit-turquoise" aria-hidden="true" />
        <span className="brand-orbit brand-orbit-yellow" aria-hidden="true" />
        <div className="relative grid min-h-[280px] items-center gap-5 overflow-hidden px-6 py-7 sm:px-9 lg:grid-cols-[1fr_310px] lg:px-11">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#8e2f32]/28 px-3 py-1 text-xs font-bold uppercase tracking-[.08em] text-white"><MessageCircle className="size-3.5" />Conversation</span>
            <h1 className="mt-4 font-heading text-[clamp(2.6rem,5vw,4.8rem)] font-semibold leading-[.94] tracking-[-.06em]">¿Qué planes tienes hoy?</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/88">Listen, choose a natural response, and add one detail of your own.</p>
            <div className="mt-6 flex flex-wrap gap-3"><Button onClick={() => setLessonOpen(true)} className="h-12 rounded-full bg-white px-6 font-bold text-[#7f302b] hover:bg-[#fff4dc]"><Play className="size-4 fill-current" />{lessonComplete ? 'Practice again' : 'Start guided lesson'}</Button><SpeechButton text="¿Qué planes tienes hoy?" voice={profile.voicePreference} label="Hear the phrase" className="h-12 bg-[#fff4dc] px-5 text-[#7f302b] hover:bg-white" /></div>
          </div>
          <div className="relative mx-auto hidden h-[250px] w-full items-end justify-center sm:flex"><div className="absolute bottom-2 h-8 w-40 rounded-full bg-[#7b211b]/18 blur-lg" /><img src="/brand/kurtes-center.png" alt="KurtES conversation guide" className="relative max-h-[270px] w-auto drop-shadow-[0_16px_18px_rgba(95,31,27,.22)]" /></div>
        </div>
      </section>

      <section className="mx-auto mt-6 grid max-w-[1360px] gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <article className="surface rounded-[26px] p-6 sm:p-8" aria-labelledby="listening-warmup-title">
          <div className="flex items-start justify-between gap-5"><div><p className="eyebrow">Listening warm-up</p><h2 id="listening-warmup-title" className="mt-2 text-3xl font-semibold tracking-[-.045em]">Hear the shape of the answer</h2></div><span className="practice-icon blue"><Headphones className="size-5" /></span></div>
          <div className="mt-6 divide-y divide-border/70">{listeningWarmup.map((phrase) => <div key={phrase.spanish} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between"><div><strong className="block text-base font-semibold text-[#173c34]">{phrase.spanish}</strong><span className="mt-1 block text-sm text-muted-foreground">{phrase.english}</span></div><SpeechButton text={phrase.spanish} voice={profile.voicePreference} /></div>)}</div>
        </article>

        <aside className="grid gap-5">
          <article className="rounded-[26px] bg-[#fff4dc] p-6 ring-1 ring-[#f4bd4e]/35 sm:p-7">
            <p className="eyebrow text-[#8a6424]">Guided practice</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-[#694b18]">Making plans naturally</h2>
            <ul className="mt-5 space-y-3 text-[15px] text-[#79564c]"><li className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-[#c37a1d]" />Listen for the key detail</li><li className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-[#c37a1d]" />Choose a natural response</li><li className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-[#c37a1d]" />Complete four short activities</li></ul>
            <Button onClick={() => setLessonOpen(true)} className="mt-6 h-11 w-full rounded-full font-bold"><Sparkles className="size-4" />{lessonComplete ? 'Repeat lesson' : 'Begin lesson'}</Button>
          </article>

          <a href="/vocabulary/dining-out" className="group rounded-[26px] bg-[#fff0e8] p-6 ring-1 ring-[#ea6c4d]/20 transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(137,54,39,.12)]"><p className="eyebrow text-[#b6503f]">Build the words first</p><div className="mt-2 flex items-end justify-between gap-5"><div><h2 className="text-xl font-semibold text-[#7f302b]">Dining Out</h2><p className="mt-1 text-sm leading-relaxed text-[#79564c]">Prepare the phrases you’ll use in a restaurant conversation.</p></div><ArrowRight className="size-5 shrink-0 text-[#c04a38] transition group-hover:translate-x-1" /></div></a>
        </aside>
      </section>

      <section className="mx-auto mt-6 flex max-w-[1360px] items-center justify-between gap-4 rounded-[22px] border border-border bg-[#fffdfa] px-5 py-4 sm:px-6"><div><span className="text-sm font-medium text-muted-foreground">Current level</span><strong className="ml-2 text-base text-[#173c34]">{profile.proficiencyLevel || 'B1–B2'}</strong></div><LevelAssessmentDialog profile={profile} onProfileChange={updateProfile} /></section>
    </main>
  );
}
