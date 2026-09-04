'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Check, Flame, Headphones, Menu, Mic, MoreHorizontal, Play, Search, Sparkles, Target, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Brand } from '@/components/brand';
import { ProfileDialog, type LearnerProfile } from '@/components/profile-dialog';
import { LevelAssessmentDialog } from '@/components/level-assessment-dialog';
import { DailyLessonDialog } from '@/components/daily-lesson-dialog';
import { createClient } from '@/lib/supabase/client';

const recentWords = [
  { spanish: 'aprovechar', english: 'to make the most of', tone: 'gold' },
  { spanish: 'la sobremesa', english: 'time spent chatting after a meal', tone: 'blue' },
  { spanish: 'dar una vuelta', english: 'to take a walk / look around', tone: 'coral' },
];

const practiceModes = [
  { icon: Mic, title: 'Speak', copy: 'Build confidence out loud', color: 'coral' },
  { icon: Headphones, title: 'Listen', copy: 'Train your ear', color: 'blue' },
  { icon: Target, title: 'Review', copy: 'Revisit tricky words', color: 'gold' },
];

const weekdayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function currentWeek() {
  const today = new Date();
  const monday = new Date(today);
  const dayFromMonday = (today.getDay() + 6) % 7;
  monday.setDate(today.getDate() - dayFromMonday);
  return weekdayLabels.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return { label, key: dateKey(date), isToday: dateKey(date) === dateKey(today) };
  });
}

function calculateStreak(completionDates: string[]) {
  const completed = new Set(completionDates);
  const cursor = new Date();
  if (!completed.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (completed.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const [completionDates, setCompletionDates] = useState<string[]>([]);
  const [profile, setProfile] = useState<LearnerProfile>({ displayName: '', proficiencyLevel: '' });
  const updateProfile = useCallback((nextProfile: LearnerProfile) => setProfile(nextProfile), []);

  const refreshProgress = useCallback(async () => {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { data } = await supabase.from('lesson_attempts').select('completed_at').eq('user_id', auth.user.id).eq('status', 'completed').not('completed_at', 'is', null).order('completed_at', { ascending: false }).limit(90);
    setCompletionDates(Array.from(new Set((data ?? []).map((attempt) => dateKey(new Date(attempt.completed_at))))));
  }, []);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.replace('/sign-in');
        return;
      }
      setActiveEmail(data.user.email ?? null);
      void refreshProgress();
    });
  }, [refreshProgress]);

  async function signOut() {
    await createClient().auth.signOut();
    window.location.replace('/sign-in');
  }

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: unknown, options?: { signal: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: 'start_daily_lesson', title: 'Start daily Spanish lesson', description: 'Start the visible five-minute daily Spanish lesson.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute() { setLessonOpen(true); return { status: 'opened', lesson: 'Making plans naturally' }; },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  function speakPhrase() {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance('¿Qué planes tienes hoy?');
    utterance.lang = 'es-ES';
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  }

  const streak = calculateStreak(completionDates);
  const week = currentWeek();

  return (
    <main className="min-h-screen overflow-x-hidden bg-background px-3 pb-5 pt-3 text-foreground sm:px-5">
      <DailyLessonDialog open={lessonOpen} onOpenChange={setLessonOpen} level={profile.proficiencyLevel || 'B2'} onComplete={refreshProgress} />
      <header className="app-header">
        <a href="#" aria-label="KurtES home"><Brand /></a>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation"><a className="nav-link nav-link-active" href="#practice">Today</a><a className="nav-link" href="#vocabulary">Vocabulary</a><a className="nav-link" href="#progress">Practice</a></nav>
        <div className="hidden items-center gap-2 sm:flex"><button className="icon-button" aria-label="Search"><Search className="size-[17px]" /></button><ProfileDialog onProfileChange={updateProfile} />{process.env.NODE_ENV === 'development' && activeEmail && <span className="max-w-44 truncate rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-[#315d52]" title="Development: active Supabase user">{activeEmail}</span>}<button onClick={signOut} className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground">Sign out</button><span className="grid size-9 place-items-center rounded-full bg-[#f2b544] text-xs font-bold text-[#263b35] shadow-sm">{(profile.displayName || activeEmail)?.slice(0, 2).toUpperCase() ?? 'KC'}</span></div>
        <button className="icon-button sm:hidden" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu className="size-5" /></button>
      </header>

      {menuOpen && <div className="fixed inset-0 z-50 bg-[#173c34] p-6 text-white sm:hidden"><div className="flex items-center justify-between"><Brand compact /><button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button></div><nav className="mt-16 grid gap-6 text-3xl font-semibold"><a href="#practice">Today</a><a href="#vocabulary">Vocabulary</a><a href="#progress">Practice</a><ProfileDialog onProfileChange={updateProfile} mobile /><button onClick={signOut} className="text-left text-[#f4bd4e]">Sign out</button></nav>{process.env.NODE_ENV === 'development' && activeEmail && <p className="absolute bottom-7 left-6 right-6 truncate text-sm text-white/60">Active user: {activeEmail}</p>}</div>}

      <section id="practice" className="mx-auto mt-5 grid max-w-[1360px] gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="surface order-2 rounded-[28px] p-5 lg:order-1 lg:p-6">
          <div className="flex items-start justify-between lg:block">
            <div><p className="eyebrow">Your streak</p><div className="mt-2 flex items-end gap-2"><span className="text-5xl font-semibold tracking-[-.06em]">{streak}</span><span className="pb-1 text-sm text-muted-foreground">{streak === 1 ? 'day' : 'days'}</span></div></div>
            <span className="grid size-11 place-items-center rounded-full bg-[#fff1d2] text-[#e58a22]"><Flame className="size-5 fill-current" /></span>
          </div>
          <div className="mt-6 grid grid-cols-7 gap-1.5" aria-label="Weekly activity">{week.map((day) => { const complete = completionDates.includes(day.key); return <div key={day.key} className="text-center"><span className={`mx-auto grid size-7 place-items-center rounded-full text-[11px] font-semibold ${complete ? 'bg-primary text-white' : day.isToday ? 'ring-1 ring-inset ring-primary text-primary' : 'bg-secondary text-muted-foreground'}`}>{complete ? <Check className="size-3.5" /> : day.label}</span><span className="mt-1.5 block text-[10px] font-medium text-muted-foreground">{day.label}</span></div>; })}</div>
          <div className="my-6 h-px bg-border/70" />
          <p className="eyebrow">Quick practice</p>
          <div id="progress" className="mt-3 space-y-1">{practiceModes.map(({icon:Icon,title,copy,color}) => <button key={title} className="group flex w-full items-center gap-3 rounded-[16px] p-2.5 text-left transition hover:bg-[#f4f5f6]"><span className={`practice-icon ${color} size-9 rounded-xl`}><Icon className="size-[17px]" /></span><span className="min-w-0"><strong className="block text-sm font-semibold">{title}</strong><span className="block truncate text-xs text-muted-foreground">{copy}</span></span><ArrowRight className="ml-auto size-3.5 text-muted-foreground opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" /></button>)}</div>
        </aside>

        <article className="surface order-1 flex min-h-[620px] flex-col overflow-hidden rounded-[32px] bg-[#fffaf0] lg:order-2">
          <div className="flex items-center justify-between px-6 pt-6 sm:px-9 sm:pt-8"><div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-[#315d52]"><Sparkles className="size-4" />Today’s lesson</div><button className="icon-button" aria-label="More options"><MoreHorizontal className="size-5" /></button></div>
          <div className="grid flex-1 items-center gap-4 px-6 py-8 sm:px-10 lg:grid-cols-[1.05fr_.8fr] lg:px-12 lg:py-5">
            <div className="relative z-10 text-center lg:text-left"><LevelAssessmentDialog profile={profile} onProfileChange={updateProfile} /><h1 className="mt-7 font-heading text-[clamp(3rem,6.3vw,6.1rem)] font-semibold leading-[.92] tracking-[-.07em] text-[#173c34]">¿Qué planes<br />tienes hoy?</h1><p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">Listen and respond naturally. Add one detail that makes the answer feel like yours.</p><button onClick={speakPhrase} className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0" aria-label="Hear the phrase"><Volume2 className="size-[18px]" />Hear the phrase</button></div>
            <div className="relative mx-auto flex h-[320px] w-full max-w-[390px] items-center justify-center lg:h-[465px]"><div className="absolute bottom-3 h-10 w-52 rounded-full bg-[#173c34]/10 blur-xl" /><img src="/brand/kurtes-center.png" alt="KurtES coach smiling and ready for today’s lesson" className="relative max-h-full w-auto drop-shadow-[0_22px_24px_rgba(78,55,32,.18)]" /></div>
          </div>
          <div className="embroidery-rule h-1 w-full" /><div className="flex flex-col items-center justify-between gap-4 bg-[#fffdfa] px-6 py-5 sm:flex-row sm:px-8"><span className="text-sm text-muted-foreground">About 5 minutes · 4 activities</span><Button onClick={() => setLessonOpen(true)} className="h-12 w-full rounded-full bg-primary px-7 text-[15px] font-semibold shadow-[0_8px_22px_rgba(23,60,52,.16)] hover:bg-[#245247] sm:w-auto"><Play className="size-4 fill-current" />Start lesson</Button></div>
        </article>
      </section>

      <section id="vocabulary" className="surface mx-auto mt-5 max-w-[1360px] overflow-hidden rounded-[28px]">
        <div className="flex items-center justify-between border-b border-border/70 px-6 py-5 sm:px-7"><div><p className="eyebrow">Recently saved</p><h2 className="mt-1 text-xl font-semibold tracking-[-.03em]">Words to revisit</h2></div><span className="grid size-10 place-items-center rounded-full bg-accent"><BookOpen className="size-[18px] text-[#52776d]" /></span></div>
        <div className="grid divide-y divide-border/70 md:grid-cols-3 md:divide-x md:divide-y-0">{recentWords.map((word) => <button key={word.spanish} className="group flex items-center gap-3 px-6 py-5 text-left transition hover:bg-[#fafafa]"><span className={`word-dot ${word.tone}`} /><span className="min-w-0 flex-1"><strong className="block text-[15px] font-semibold">{word.spanish}</strong><span className="block truncate text-sm text-muted-foreground">{word.english}</span></span><ArrowRight className="size-4 text-[#75948b] transition group-hover:translate-x-1" /></button>)}</div>
      </section>
    </main>
  );
}
