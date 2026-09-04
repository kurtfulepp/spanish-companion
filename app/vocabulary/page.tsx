'use client';
/* oxlint-disable next/no-html-link-for-pages, next/no-img-element */

import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Check, Sparkles } from 'lucide-react';
import { VocabularyHeader } from '@/components/vocabulary-header';
import { createClient } from '@/lib/supabase/client';
import { KURTES_ILLUSTRATIONS } from '@/lib/illustrations';

type Theme = { id: string; title: string; description: string };

const futureThemes = [
  { title: 'Around the City', description: 'Directions, neighborhoods, errands, and getting around.', image: KURTES_ILLUSTRATIONS.aroundTheCity.src, tone: 'bg-[#e7f1f8]' },
  { title: 'Travel', description: 'Airports, hotels, changes of plan, and useful requests.', image: KURTES_ILLUSTRATIONS.travel.src, tone: 'bg-[#e9f6f0]' },
  { title: 'Social Life', description: 'Plans, invitations, stories, and natural reactions.', image: KURTES_ILLUSTRATIONS.socialLife.src, tone: 'bg-[#fff1ed]' },
  { title: 'Work & Meetings', description: 'Ideas, updates, decisions, and polite disagreement.', image: KURTES_ILLUSTRATIONS.workMeetings.src, tone: 'bg-[#eef0fb]' },
  { title: 'Home & Daily Life', description: 'Routines, repairs, neighbors, and everyday details.', image: KURTES_ILLUSTRATIONS.homeDailyLife.src, tone: 'bg-[#fff4dc]' },
  { title: 'Feelings & Relationships', description: 'Nuance, support, boundaries, and connection.', image: KURTES_ILLUSTRATIONS.feelingsRelationships.src, tone: 'bg-[#fbecef]' },
];

export default function VocabularyPage() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const updateProfile = useCallback(() => undefined, []);

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { window.location.replace('/sign-in'); return; }
      const { data: themeData } = await supabase.from('vocabulary_themes').select('id, title, description').eq('id', 'dining-out').maybeSingle();
      setTheme(themeData as Theme | null);
      setLoading(false);
    })();
  }, []);

  return <main className="min-h-screen bg-background px-3 pb-12 pt-3 text-foreground sm:px-5"><VocabularyHeader onProfileChange={updateProfile} /><section className="brand-hero mx-auto mt-5 max-w-[1360px]"><span className="brand-orbit brand-orbit-turquoise" aria-hidden="true" /><span className="brand-orbit brand-orbit-yellow" aria-hidden="true" /><div className="relative flex min-h-[158px] flex-col justify-between gap-6 px-6 py-6 sm:flex-row sm:items-center sm:px-8 lg:px-10"><div className="max-w-4xl"><span className="inline-flex items-center gap-2 rounded-full bg-[#8e2f32]/28 px-3 py-1 text-xs font-bold uppercase tracking-[.08em] text-white"><Sparkles className="size-3.5" />Vocabulary worlds</span><h1 className="mt-3 font-heading text-[clamp(2rem,4vw,3.35rem)] font-semibold leading-[.95] tracking-[-.055em]">Choose a world. Find your gaps.</h1><p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-white/88">Build the phrases you can actually use, one real situation at a time.</p></div><div className="flex shrink-0 items-center"><span className="grid size-20 place-items-center rounded-[22px] bg-[#ffd45b] shadow-[0_10px_24px_rgba(121,46,31,.22)] sm:size-24"><img src={KURTES_ILLUSTRATIONS.topicCompass.src} alt="" className="size-[88%] object-contain" /></span></div></div></section>

  <section className="mx-auto mt-8 max-w-[1360px]"><div className="flex items-end justify-between gap-5"><div><h2 className="text-3xl font-semibold tracking-[-.045em]">Where do you want to feel fluent?</h2></div></div>
  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{loading ? Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-64 animate-pulse rounded-[26px] bg-secondary" />) : <>
    {theme && <a href="/vocabulary/dining-out" aria-label="Open the Dining Out vocabulary experience" className="group relative flex min-h-64 flex-col overflow-hidden rounded-[26px] bg-[#fff0e8] p-6 shadow-[0_12px_34px_rgba(137,54,39,.1)] ring-1 ring-[#ea6c4d]/20 transition hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(137,54,39,.16)]"><span className="absolute -bottom-16 -right-12 size-44 rounded-full bg-[#35b8ae]/15" aria-hidden="true" /><div className="relative flex items-start justify-between"><img src={KURTES_ILLUSTRATIONS.diningOut.src} alt="" className="h-24 w-28 object-contain object-left-top drop-shadow-[0_10px_12px_rgba(121,46,31,.15)]" /><span className="inline-flex items-center gap-1.5 rounded-full bg-[#e9513d] px-3 py-1.5 text-xs font-bold text-white">Open now <ArrowRight className="size-3.5 transition group-hover:translate-x-1" /></span></div><div className="relative mt-auto pt-5"><h3 className="text-2xl font-semibold tracking-[-.035em] text-[#7f302b]">{theme.title}</h3><p className="mt-2 max-w-sm text-[15px] leading-relaxed text-[#79564c]">{theme.description}</p><div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#c04a38]"><BookOpen className="size-4" />6 moments · 30 expressions</div></div></a>}
    {futureThemes.map((item) => <div key={item.title} className={`flex min-h-64 flex-col overflow-hidden rounded-[26px] p-6 ring-1 ring-black/5 ${item.tone}`}><div className="flex items-start justify-between"><img src={item.image} alt="" className="h-24 w-28 object-contain object-left-top drop-shadow-[0_10px_12px_rgba(37,55,49,.12)]" /><span className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground">Coming soon</span></div><div className="mt-auto pt-5"><h3 className="text-2xl font-semibold tracking-[-.035em] text-[#173c34]">{item.title}</h3><p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{item.description}</p><div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground"><Check className="size-4" />On the topic roadmap</div></div></div>)}
  </>}</div></section></main>;
}
