'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Check, Sparkles } from 'lucide-react';
import { VocabularyHeader } from '@/components/vocabulary-header';
import type { LearnerProfile } from '@/components/profile-dialog';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_LEARNING_TIME_ZONE } from '@/lib/progress';

type Theme = { id: string; title: string; description: string; emoji: string };

const futureThemes = [
  { title: 'Around the City', description: 'Directions, neighborhoods, errands, and getting around.', emoji: '🏙️', tone: 'bg-[#e7f1f8]' },
  { title: 'Travel', description: 'Airports, hotels, changes of plan, and useful requests.', emoji: '✈️', tone: 'bg-[#e9f6f0]' },
  { title: 'Social Life', description: 'Plans, invitations, stories, and natural reactions.', emoji: '🗣️', tone: 'bg-[#fff1ed]' },
  { title: 'Work & Meetings', description: 'Ideas, updates, decisions, and polite disagreement.', emoji: '💼', tone: 'bg-[#eef0fb]' },
  { title: 'Home & Daily Life', description: 'Routines, repairs, neighbors, and everyday details.', emoji: '🏠', tone: 'bg-[#fff4dc]' },
  { title: 'Feelings & Relationships', description: 'Nuance, support, boundaries, and connection.', emoji: '❤️', tone: 'bg-[#fbecef]' },
];

const emptyProfile: LearnerProfile = { displayName: '', proficiencyLevel: '', voicePreference: 'male', learningTimeZone: DEFAULT_LEARNING_TIME_ZONE, followDeviceTimeZone: false };

export default function VocabularyPage() {
  const [profile, setProfile] = useState<LearnerProfile>(emptyProfile);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [startedCount, setStartedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const updateProfile = useCallback((next: LearnerProfile) => setProfile(next), []);

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { window.location.replace('/sign-in'); return; }
      const [{ data: themeData }, { count }] = await Promise.all([
        supabase.from('vocabulary_themes').select('id, title, description, emoji').eq('id', 'dining-out').maybeSingle(),
        supabase.from('user_vocabulary_progress').select('id', { count: 'exact', head: true }).eq('user_id', auth.user.id),
      ]);
      setTheme(themeData as Theme | null);
      setStartedCount(count ?? 0);
      setLoading(false);
    })();
  }, []);

  return <main className="min-h-screen bg-background px-3 pb-12 pt-3 text-foreground sm:px-5"><VocabularyHeader profile={profile} onProfileChange={updateProfile} /><section className="mx-auto mt-5 max-w-[1360px] overflow-hidden rounded-[32px] bg-[#173c34] text-white shadow-[0_22px_60px_rgba(23,60,52,.16)]"><div className="grid gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1fr_.72fr] lg:items-center lg:px-14"><div><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-[#b9e3d7]"><Sparkles className="size-4" />Build language by experience</span><h1 className="mt-6 max-w-3xl font-heading text-[clamp(3.2rem,7vw,6.8rem)] font-semibold leading-[.88] tracking-[-.07em]">Choose a world.<br />Find your gaps.</h1><p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/68">Grow the phrases you can actually use—not an endless list of isolated words. Start with a situation and KurtES will help uncover what is new.</p></div><div className="relative mx-auto grid size-64 place-items-center rounded-full bg-[#f4bd4e] text-[8rem] shadow-[0_30px_80px_rgba(0,0,0,.2)] sm:size-72"><span aria-hidden="true">🧭</span><span className="absolute -bottom-3 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#173c34] shadow-lg">{startedCount ? `${startedCount} expressions started` : 'Your topic map'}</span></div></div></section>

  <section className="mx-auto mt-8 max-w-[1360px]"><div className="flex items-end justify-between gap-5"><div><p className="eyebrow">Vocabulary themes</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.045em]">Where do you want to feel fluent?</h2></div><span className="hidden text-sm text-muted-foreground sm:block">More worlds will open as we build them.</span></div>
  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{loading ? Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-64 animate-pulse rounded-[26px] bg-secondary" />) : <>
    {theme && <Link href="/vocabulary/dining-out" aria-label="Open the Dining Out vocabulary experience" className="group relative flex min-h-64 flex-col overflow-hidden rounded-[26px] bg-[#fff4dc] p-6 shadow-[0_12px_34px_rgba(37,55,49,.08)] ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(37,55,49,.13)]"><div className="flex items-start justify-between"><span className="grid size-20 place-items-center rounded-[22px] bg-white text-5xl shadow-sm" aria-hidden="true">{theme.emoji}</span><span className="inline-flex items-center gap-1.5 rounded-full bg-[#173c34] px-3 py-1.5 text-xs font-bold text-white">Open now <ArrowRight className="size-3.5 transition group-hover:translate-x-1" /></span></div><div className="mt-auto pt-7"><h3 className="text-2xl font-semibold tracking-[-.035em] text-[#173c34]">{theme.title}</h3><p className="mt-2 max-w-sm text-[15px] leading-relaxed text-[#6f623f]">{theme.description}</p><div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#80621f]"><BookOpen className="size-4" />6 moments · 30 expressions</div></div></Link>}
    {futureThemes.map((item) => <div key={item.title} className={`flex min-h-64 flex-col rounded-[26px] p-6 ring-1 ring-black/5 ${item.tone}`}><div className="flex items-start justify-between"><span className="grid size-20 place-items-center rounded-[22px] bg-white/85 text-5xl shadow-sm" aria-hidden="true">{item.emoji}</span><span className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground">Coming soon</span></div><div className="mt-auto pt-7"><h3 className="text-2xl font-semibold tracking-[-.035em] text-[#173c34]">{item.title}</h3><p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{item.description}</p><div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground"><Check className="size-4" />On the topic roadmap</div></div></div>)}
  </>}</div></section></main>;
}
