/* oxlint-disable next/no-html-link-for-pages, next/no-img-element */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, BookOpen, CalendarDays, Check, Flame, Headphones, Mic, MoreHorizontal, Play, Search, Sparkles, Target, Trophy, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Brand } from '@/components/brand';
import { ProfileDialog, type LearnerProfile } from '@/components/profile-dialog';
import { LevelAssessmentDialog } from '@/components/level-assessment-dialog';
import { DailyLessonDialog } from '@/components/daily-lesson-dialog';
import { createClient } from '@/lib/supabase/client';
import { calculateStreak, currentWeek, dateKey, DEFAULT_LEARNING_TIME_ZONE, deviceTimeZone, formatCompletionDate, timeZoneLabel } from '@/lib/progress';
import { playSpanishSpeech } from '@/lib/speech';

const practiceModes = [
  { icon: Mic, title: 'Speak', copy: 'Build confidence out loud', color: 'coral' },
  { icon: Headphones, title: 'Listen', copy: 'Train your ear', color: 'blue' },
  { icon: Target, title: 'Review', copy: 'Revisit tricky words', color: 'gold' },
];

type LessonAttempt = {
  id: string;
  score: number;
  total_activities: number;
  completed_at: string;
  lessons: { title: string } | { title: string }[] | null;
};

type ReviewWord = { id: string; spanish: string; english: string; tone: string };

export default function Home() {
  const [lessonOpen, setLessonOpen] = useState(false);
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<LessonAttempt[]>([]);
  const [completedLessonCount, setCompletedLessonCount] = useState(0);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressMessage, setProgressMessage] = useState('');
  const [reviewWords, setReviewWords] = useState<ReviewWord[]>([]);
  const [profile, setProfile] = useState<LearnerProfile>({ displayName: '', proficiencyLevel: '', voicePreference: 'male', learningTimeZone: DEFAULT_LEARNING_TIME_ZONE, followDeviceTimeZone: false });
  const updateProfile = useCallback((nextProfile: LearnerProfile) => setProfile(nextProfile), []);

  const refreshProgress = useCallback(async () => {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    setProgressLoading(true);
    setProgressMessage('');
    const [{ data, error, count }, { data: vocabularyData }] = await Promise.all([
      supabase.from('lesson_attempts').select('id, score, total_activities, completed_at, lessons(title)', { count: 'exact' }).eq('user_id', auth.user.id).eq('status', 'completed').not('completed_at', 'is', null).order('completed_at', { ascending: false }).limit(90),
      supabase.from('user_vocabulary_progress').select('item_id, next_review_at, vocabulary_items(spanish, english)').in('status', ['new', 'learning']).order('next_review_at', { ascending: true }).limit(3),
    ]);
    if (error) setProgressMessage('Your progress could not be loaded right now.');
    else {
      setAttempts((data ?? []) as LessonAttempt[]);
      setCompletedLessonCount(count ?? 0);
    }
    const tones = ['gold', 'blue', 'coral'];
    setReviewWords((vocabularyData ?? []).flatMap((entry, index) => {
      const item = Array.isArray(entry.vocabulary_items) ? entry.vocabulary_items[0] : entry.vocabulary_items;
      return item ? [{ id: entry.item_id, spanish: item.spanish, english: item.english, tone: tones[index % tones.length] }] : [];
    }));
    setProgressLoading(false);
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
    window.location.replace('/');
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

  const learningTimeZone = profile.followDeviceTimeZone ? deviceTimeZone() : profile.learningTimeZone || DEFAULT_LEARNING_TIME_ZONE;
  const completionDates = Array.from(new Set(attempts.map((attempt) => dateKey(new Date(attempt.completed_at), learningTimeZone))));
  const streak = calculateStreak(completionDates, learningTimeZone);
  const week = currentWeek(learningTimeZone);
  const totalAnswered = attempts.reduce((total, attempt) => total + attempt.total_activities, 0);
  const totalCorrect = attempts.reduce((total, attempt) => total + attempt.score, 0);
  const averageScore = totalAnswered ? Math.round(totalCorrect / totalAnswered * 100) : 0;

  return (
    <main className="min-h-screen overflow-x-hidden bg-background px-3 pb-5 pt-3 text-foreground sm:px-5">
      {lessonOpen && <DailyLessonDialog open onOpenChange={setLessonOpen} level={profile.proficiencyLevel || 'B2'} voice={profile.voicePreference} onComplete={refreshProgress} />}
      <header className="app-header">
        <a href="/today" aria-label="KurtES home"><Brand compact /></a>
        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main navigation"><a className="nav-link nav-link-active" href="#practice">Today</a><a className="nav-link" href="/vocabulary">Vocabulary</a><a className="nav-link" href="#progress">Practice</a></nav>
        <div className="flex items-center gap-1 sm:gap-2"><button className="icon-button hidden xl:grid" aria-label="Search"><Search className="size-[17px]" /></button><button onClick={signOut} className="rounded-full px-2.5 py-2 text-sm font-semibold text-[var(--brand-ink)] transition hover:bg-[var(--brand-cream)] sm:px-3">Sign out</button><ProfileDialog onProfileChange={updateProfile} fallbackAvatarSrc="/brand/kurtes-center.png" /></div>
      </header>

      <section id="practice" className="mx-auto mt-5 grid max-w-[1360px] items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="surface order-1 flex min-h-[580px] flex-col overflow-hidden rounded-[32px] bg-[#fffaf0]">
          <div className="flex items-center justify-between px-6 pt-6 sm:px-9 sm:pt-8"><div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-[#315d52]"><Sparkles className="size-4" />Today’s lesson</div><button className="icon-button" aria-label="More options"><MoreHorizontal className="size-5" /></button></div>
          <div className="grid flex-1 items-center gap-4 px-6 py-8 sm:px-10 lg:grid-cols-[1.05fr_.8fr] lg:px-12 lg:py-5">
            <div className="relative z-10 text-center lg:text-left"><LevelAssessmentDialog profile={profile} onProfileChange={updateProfile} /><h1 className="mt-7 font-heading text-[clamp(3rem,6.3vw,6.1rem)] font-semibold leading-[.92] tracking-[-.07em] text-[#173c34]">¿Qué planes<br />tienes hoy?</h1><p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">Listen and respond naturally. Add one detail that makes the answer feel like yours.</p><button onClick={() => void playSpanishSpeech('¿Qué planes tienes hoy?', profile.voicePreference)} className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0" aria-label="Hear the phrase"><Volume2 className="size-[18px]" />Hear the phrase</button></div>
            <div className="relative mx-auto flex h-[320px] w-full max-w-[390px] items-center justify-center lg:h-[430px]"><div className="absolute bottom-3 h-10 w-52 rounded-full bg-[#173c34]/10 blur-xl" /><img src="/brand/kurtes-center.png" alt="KurtES coach smiling and ready for today’s lesson" className="relative max-h-full w-auto drop-shadow-[0_22px_24px_rgba(78,55,32,.18)]" /></div>
          </div>
          <div className="embroidery-rule h-1 w-full" /><div className="flex flex-col items-center justify-between gap-4 bg-[#fffdfa] px-6 py-5 sm:flex-row sm:px-8"><span className="text-sm text-muted-foreground">About 5 minutes · 4 activities</span><Button onClick={() => setLessonOpen(true)} className="h-12 w-full rounded-full bg-primary px-7 text-[15px] font-semibold shadow-[0_8px_22px_rgba(23,60,52,.16)] hover:bg-[#245247] sm:w-auto"><Play className="size-4 fill-current" />Start lesson</Button></div>
        </article>

        <aside className="order-2 grid gap-5 self-start">
          <section className="surface rounded-[24px] p-5" aria-labelledby="streak-title">
            <div className="flex items-center justify-between gap-4">
              <div><p id="streak-title" className="eyebrow">Your streak</p><div className="mt-1 flex items-baseline gap-1.5"><strong className="text-3xl tracking-[-.055em] text-[#173c34]">{streak}</strong><span className="text-sm text-muted-foreground">{streak === 1 ? 'day' : 'days'}</span></div></div>
              <span className="grid size-10 place-items-center rounded-full bg-[#fff1d2] text-[#e58a22]"><Flame className="size-[18px] fill-current" /></span>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1" aria-label="Weekly activity">{week.map((day) => { const complete = completionDates.includes(day.key); return <div key={day.key} className="grid justify-items-center gap-1.5"><span className="text-[10px] font-semibold text-muted-foreground">{day.label}</span><span className={`grid size-6 place-items-center rounded-full ${complete ? 'bg-primary text-white' : day.isToday ? 'bg-[#fff1d2] ring-1 ring-inset ring-[#e6a12d]' : 'bg-secondary'}`}>{complete ? <Check className="size-3" /> : day.isToday ? <span className="size-1.5 rounded-full bg-[#d78224]" /> : null}</span></div>; })}</div>
          </section>

          <section className="surface rounded-[24px] p-3" aria-labelledby="quick-practice-title">
            <p id="quick-practice-title" className="eyebrow px-2 pb-1 pt-2">Quick practice</p>
            <div className="mt-1 space-y-0.5">{practiceModes.map(({icon:Icon,title,copy,color}) => <button key={title} className="group flex w-full items-center gap-3 rounded-[15px] p-2.5 text-left transition hover:bg-[#f4f5f6]"><span className={`practice-icon ${color} size-9 rounded-xl`}><Icon className="size-[17px]" /></span><span className="min-w-0"><strong className="block text-sm font-semibold">{title}</strong><span className="block truncate text-xs text-muted-foreground">{copy}</span></span><ArrowRight className="ml-auto size-3.5 text-muted-foreground opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" /></button>)}</div>
          </section>
        </aside>
      </section>

      <section id="vocabulary" className="surface mx-auto mt-5 max-w-[1360px] overflow-hidden rounded-[28px]">
        <div className="flex items-center justify-between border-b border-border/70 px-6 py-5 sm:px-7"><div><p className="eyebrow">Recently saved</p><h2 className="mt-1 text-xl font-semibold tracking-[-.03em]">Words to revisit</h2></div><a href="/vocabulary" className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-2 text-sm font-semibold text-[#52776d] transition hover:bg-[#dcece6]"><BookOpen className="size-[18px]" />Explore themes</a></div>
        {reviewWords.length ? <div className="grid divide-y divide-border/70 md:grid-cols-3 md:divide-x md:divide-y-0">{reviewWords.map((word) => <a href="/vocabulary/dining-out" key={word.id} className="group flex items-center gap-3 px-6 py-5 text-left transition hover:bg-[#fafafa]"><span className={`word-dot ${word.tone}`} /><span className="min-w-0 flex-1"><strong className="block text-[15px] font-semibold">{word.spanish}</strong><span className="block truncate text-sm text-muted-foreground">{word.english}</span></span><ArrowRight className="size-4 text-[#75948b] transition group-hover:translate-x-1" /></a>)}</div> : <div className="flex flex-col items-center justify-between gap-4 px-6 py-7 text-center sm:flex-row sm:text-left"><div><strong className="text-[15px]">No phrases are waiting for review.</strong><p className="mt-1 text-sm text-muted-foreground">Explore a vocabulary theme to find the expressions worth practicing.</p></div><a href="/vocabulary" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white">Choose a theme<ArrowRight className="size-4" /></a></div>}
      </section>

      <section id="progress" className="surface mx-auto mt-5 max-w-[1360px] overflow-hidden rounded-[28px]">
        <div className="flex flex-col gap-2 border-b border-border/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7"><div><p className="eyebrow">Learning history</p><h2 className="mt-1 text-xl font-semibold tracking-[-.03em]">Your progress</h2></div><span className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-muted-foreground"><CalendarDays className="size-4" />{timeZoneLabel(learningTimeZone)}</span></div>
        {progressLoading ? <div className="grid min-h-56 place-items-center p-8"><div className="text-center"><span className="mx-auto block size-7 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /><p className="mt-3 text-sm text-muted-foreground">Loading your progress…</p></div></div> : progressMessage ? <p role="alert" className="m-6 rounded-[16px] bg-[#fff1ed] px-4 py-3 text-sm text-[#8b4337]">{progressMessage}</p> : <div>
          <div className="grid grid-cols-3 divide-x divide-border/70 border-b border-border/70 bg-[#faf7f1]"><div className="px-4 py-4 sm:px-6"><span className="block text-xs font-medium text-muted-foreground sm:text-sm">Current streak</span><strong className="mt-1 block text-2xl tracking-[-.045em] text-[#173c34]">{streak} <small className="text-xs font-medium text-muted-foreground sm:text-sm">{streak === 1 ? 'day' : 'days'}</small></strong></div><div className="px-4 py-4 sm:px-6"><span className="block text-xs font-medium text-muted-foreground sm:text-sm">Lessons</span><strong className="mt-1 block text-2xl tracking-[-.045em] text-[#173c34]">{completedLessonCount}</strong></div><div className="px-4 py-4 sm:px-6"><span className="block text-xs font-medium text-muted-foreground sm:text-sm">Recent average</span><strong className="mt-1 block text-2xl tracking-[-.045em] text-[#173c34]">{averageScore}%</strong></div></div>
          <div className="p-6 sm:p-7"><div className="flex items-center justify-between"><div><p className="eyebrow">Most recent</p><h3 className="mt-1 text-lg font-semibold">Lesson activity</h3></div><span className="grid size-10 place-items-center rounded-full bg-[#fff1d2] text-[#d78224]"><Trophy className="size-[18px]" /></span></div>{attempts.length ? <div className="mt-5 divide-y divide-border/70">{attempts.slice(0, 5).map((attempt) => { const lesson = Array.isArray(attempt.lessons) ? attempt.lessons[0] : attempt.lessons; return <div key={attempt.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0"><div className="min-w-0"><strong className="block truncate text-[15px] font-semibold">{lesson?.title || 'Spanish practice'}</strong><span className="mt-0.5 block text-sm text-muted-foreground">{formatCompletionDate(attempt.completed_at, learningTimeZone)}</span></div><span className="shrink-0 rounded-full bg-[#eef6f2] px-3 py-1.5 text-sm font-semibold text-primary">{attempt.score}/{attempt.total_activities}</span></div>})}</div> : <div className="mt-6 rounded-[20px] bg-[#f7f9f8] p-6 text-center"><p className="font-semibold text-[#173c34]">Your first result will appear here.</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Complete today’s lesson to begin your learning history.</p></div>}</div>
        </div>}
      </section>

      {process.env.NODE_ENV === 'development' && activeEmail && <footer className="mx-auto mt-4 flex max-w-[1360px] flex-col gap-1 px-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>Development environment</span><span className="truncate">Active user: {activeEmail}</span></footer>}
    </main>
  );
}
