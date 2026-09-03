'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Check, ChevronDown, Flame, Headphones, Menu, MessageCircle, Mic, MoreHorizontal, Play, Search, Sparkles, Target, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileDialog, type LearnerProfile } from '@/components/profile-dialog';
import { createClient } from '@/lib/supabase/client';

const recentWords = [
  { spanish: 'aprovechar', english: 'to make the most of', tone: 'gold' },
  { spanish: 'la sobremesa', english: 'time spent chatting after a meal', tone: 'blue' },
  { spanish: 'dar una vuelta', english: 'to take a walk / look around', tone: 'coral' },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [played, setPlayed] = useState(false);
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<LearnerProfile>({ displayName: '', proficiencyLevel: '' });
  const updateProfile = useCallback((nextProfile: LearnerProfile) => setProfile(nextProfile), []);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.replace('/sign-in');
        return;
      }
      setActiveEmail(data.user.email ?? null);
    });
  }, []);

  async function signOut() {
    await createClient().auth.signOut();
    window.location.replace('/sign-in');
  }

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: unknown, options?: { signal: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: 'start_daily_lesson',
      title: 'Start daily Spanish lesson',
      description: 'Start the visible five-minute daily Spanish lesson.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute() { setPlayed(true); return { status: 'started', lesson: '¿Qué planes tienes hoy?' }; },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <a href="#" className="flex items-center gap-3" aria-label="Claro home"><span className="grid size-10 place-items-center rounded-[14px] bg-primary text-primary-foreground shadow-[0_7px_20px_rgba(30,63,56,.22)]"><MessageCircle className="size-5 fill-current" /></span><span className="font-heading text-xl font-bold tracking-[-0.04em]">claro.</span></a>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation"><a className="nav-link nav-link-active" href="#practice">Practice</a><a className="nav-link" href="#vocabulary">Vocabulary</a><a className="nav-link" href="#progress">Progress</a></nav>
        <div className="hidden items-center gap-3 sm:flex"><button className="icon-button" aria-label="Search"><Search className="size-[18px]" /></button><ProfileDialog onProfileChange={updateProfile} />{process.env.NODE_ENV === 'development' && activeEmail && <span className="max-w-44 truncate rounded-full bg-[#e8f3ef] px-3 py-1.5 text-xs font-semibold text-[#315d52]" title="Development: active Supabase user">{activeEmail}</span>}<button onClick={signOut} className="rounded-full border border-border bg-white px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground">Sign out</button><span className="grid size-10 place-items-center rounded-full bg-[#f2b544] text-sm font-bold text-[#263b35] ring-4 ring-white">{(profile.displayName || activeEmail)?.slice(0, 2).toUpperCase() ?? 'KC'}</span></div>
        <button className="icon-button sm:hidden" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu className="size-5" /></button>
      </header>
      {menuOpen && <div className="fixed inset-0 z-50 bg-[#173c34] p-6 text-white sm:hidden"><div className="flex items-center justify-between"><span className="text-xl font-bold">claro.</span><button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button></div><nav className="mt-16 grid gap-6 text-3xl font-semibold"><a href="#practice">Practice</a><a href="#vocabulary">Vocabulary</a><a href="#progress">Progress</a><ProfileDialog onProfileChange={updateProfile} mobile /><button onClick={signOut} className="text-left text-[#f4bd4e]">Sign out</button></nav>{process.env.NODE_ENV === 'development' && activeEmail && <p className="absolute bottom-7 left-6 right-6 truncate text-sm text-white/60">Active user: {activeEmail}</p>}</div>}

      <section id="practice" className="mx-auto grid max-w-[1400px] items-stretch gap-6 px-5 pb-8 sm:px-8 lg:grid-cols-[1.55fr_.85fr] lg:px-12">
        <div className="relative min-h-[600px] overflow-hidden rounded-[32px] bg-[#173c34] px-6 py-8 text-white sm:px-10 sm:py-10 lg:min-h-[640px] lg:px-14 lg:py-12">
          <div className="absolute -right-24 -top-24 size-80 rounded-full border border-white/10" /><div className="absolute -right-3 top-16 size-44 rounded-full border border-white/10" /><div className="absolute bottom-[-120px] left-[40%] size-72 rounded-full bg-[#1d493f] blur-2xl" />
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-center justify-between"><div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-[#d8eee7]"><Sparkles className="size-4 text-[#f4bd4e]" /> Daily practice</div><button className="text-white/60 transition hover:text-white" aria-label="More options"><MoreHorizontal /></button></div>
            <div className="mt-12 max-w-2xl sm:mt-16"><p className="mb-4 text-sm font-semibold uppercase tracking-[.16em] text-[#8fd0bd]">{profile.proficiencyLevel ? `${profile.proficiencyLevel} · Everyday conversation` : 'B1–B2 · Everyday conversation'}</p><h1 className="font-heading text-[clamp(2.65rem,6vw,5.5rem)] font-semibold leading-[.94] tracking-[-.065em]">¿Qué planes<br />tienes hoy?</h1><p className="mt-6 max-w-lg text-lg leading-relaxed text-white/68">Listen, respond naturally, and add more nuance to the way you talk about your day.</p></div>
            <div className="mt-auto flex flex-wrap items-center gap-4 pt-10"><Button onClick={() => setPlayed(!played)} className="h-14 rounded-full bg-[#f4bd4e] px-7 text-base font-bold text-[#173c34] shadow-[0_10px_30px_rgba(244,189,78,.2)] hover:bg-[#ffd06a]">{played ? <Check className="size-5" /> : <Play className="size-5 fill-current" />}{played ? 'Lesson started' : 'Start 5-min lesson'}</Button><button onClick={() => setPlayed(!played)} className="flex items-center gap-3 rounded-full px-2 py-2 text-sm font-semibold text-white/80 hover:text-white"><span className="grid size-11 place-items-center rounded-full border border-white/20 bg-white/5"><Volume2 className="size-[19px]" /></span>Hear the phrase</button></div>
          </div>
        </div>

        <aside className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-[.8fr_1.2fr]">
          <div className="rounded-[28px] border border-border bg-card p-6 sm:p-7"><div className="flex items-start justify-between"><div><p className="eyebrow">Your streak</p><div className="mt-3 flex items-end gap-2"><span className="text-5xl font-semibold tracking-[-.06em]">12</span><span className="pb-1 text-muted-foreground">days</span></div></div><span className="grid size-12 place-items-center rounded-2xl bg-[#fff1d2] text-[#e58a22]"><Flame className="size-6 fill-current" /></span></div><div className="mt-6 grid grid-cols-7 gap-2" aria-label="Weekly activity">{['M','T','W','T','F','S','S'].map((day, i) => <div key={`${day}-${i}`} className="text-center"><span className={`mx-auto grid size-8 place-items-center rounded-full text-xs font-bold ${i < 5 ? 'bg-primary text-white' : i === 5 ? 'border-2 border-primary text-primary' : 'bg-secondary text-muted-foreground'}`}>{i < 5 ? <Check className="size-4" /> : day}</span><span className="mt-2 block text-[11px] font-medium text-muted-foreground">{day}</span></div>)}</div></div>
          <div id="vocabulary" className="rounded-[28px] bg-[#e8f3ef] p-6 sm:p-7"><div className="flex items-center justify-between"><div><p className="eyebrow text-[#52776d]">Recently saved</p><h2 className="mt-1 text-xl font-semibold tracking-[-.03em]">Words to revisit</h2></div><BookOpen className="size-5 text-[#52776d]" /></div><div className="mt-5 space-y-2">{recentWords.map((word) => <button key={word.spanish} className="group flex w-full items-center gap-3 rounded-2xl bg-white/72 p-3 text-left transition hover:translate-x-1 hover:bg-white"><span className={`word-dot ${word.tone}`} /><span className="min-w-0 flex-1"><strong className="block text-[15px] font-semibold">{word.spanish}</strong><span className="block truncate text-xs text-muted-foreground">{word.english}</span></span><ArrowRight className="size-4 text-[#75948b] transition group-hover:translate-x-1" /></button>)}</div></div>
        </aside>
      </section>

      <section id="progress" className="mx-auto grid max-w-[1400px] gap-6 px-5 pb-14 sm:px-8 md:grid-cols-3 lg:px-12">{[{icon: Mic, title:'Speak', copy:'Build confidence out loud', color:'coral'},{icon: Headphones, title:'Listen', copy:'Train your ear with real phrases', color:'blue'},{icon: Target, title:'Review', copy:'Keep tricky words in reach', color:'gold'}].map(({icon:Icon,title,copy,color}) => <button key={title} className="practice-card"><span className={`practice-icon ${color}`}><Icon className="size-5" /></span><span className="text-left"><strong className="block text-base">{title}</strong><span className="text-sm text-muted-foreground">{copy}</span></span><ChevronDown className="ml-auto size-4 -rotate-90 text-muted-foreground" /></button>)}</section>
    </main>
  );
}
