'use client';

import { useState } from 'react';
import { ArrowLeft, Check, ChevronRight, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';
import type { LearnerProfile } from '@/components/profile-dialog';

type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
type Mode = 'home' | 'test' | 'choose' | 'result';

const levels: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const questions = [
  { key: 'plans_subjunctive', prompt: 'Espero que mañana ___ buen tiempo.', options: ['hace', 'haga', 'hará'], correct: 1 },
  { key: 'past_narrative', prompt: 'Cuando era niño, siempre ___ con mis primos los domingos.', options: ['jugué', 'jugaba', 'he jugado'], correct: 1 },
  { key: 'purpose_para', prompt: 'Estudio español ___ hablar con más confianza.', options: ['por', 'para', 'desde'], correct: 1 },
  { key: 'conditional', prompt: 'Si tuviera más tiempo, ___ otro idioma.', options: ['aprendo', 'aprenderé', 'aprendería'], correct: 2 },
  { key: 'reported_request', prompt: 'Me pidió que le ___ cuando llegara.', options: ['llamo', 'llamara', 'llamaré'], correct: 1 },
  { key: 'connector', prompt: 'No estaba de acuerdo; ___, escuchó toda la propuesta.', options: ['sin embargo', 'por eso', 'además de'], correct: 0 },
  { key: 'past_hypothesis', prompt: 'No encuentro las llaves. Puede que las ___ en el coche.', options: ['dejé', 'haya dejado', 'dejaría'], correct: 1 },
  { key: 'nuanced_expression', prompt: '“Se me da bien conversar” significa…', options: ['Me resulta fácil conversar', 'Me da vergüenza conversar', 'Me obligan a conversar'], correct: 0 },
] as const;

function recommendedLevel(score: number): Level {
  if (score <= 2) return 'A2';
  if (score <= 5) return 'B1';
  if (score <= 7) return 'B2';
  return 'C1';
}

export function LevelAssessmentDialog({ profile, onProfileChange }: { profile: LearnerProfile; onProfileChange: (profile: LearnerProfile) => void }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('home');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<{ score: number; level: Level } | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  function reset(nextMode: Mode = 'home') {
    setMode(nextMode);
    setQuestionIndex(0);
    setAnswers([]);
    setSelected(null);
    setResult(null);
    setMessage('');
  }

  async function saveLevel(level: Level, source: 'chosen' | 'assessed', completedAnswers?: number[]) {
    setSaving(true);
    setMessage('');
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) { window.location.replace('/sign-in'); return; }

    if (source === 'assessed' && completedAnswers) {
      const { error: attemptError } = await supabase.rpc('complete_level_assessment', {
        p_answers: completedAnswers,
        p_accepted_level: level,
      });
      if (attemptError) {
        setMessage('The result could not be saved. Please try again.');
        setSaving(false);
        return;
      }
    }

    const { error } = await supabase.from('profiles').update({ proficiency_level: level, level_source: source }).eq('id', data.user.id);
    if (error) {
      setMessage('Your level could not be updated. Please try again.');
      setSaving(false);
      return;
    }

    onProfileChange({ ...profile, proficiencyLevel: level });
    setSaving(false);
    setOpen(false);
    reset();
  }

  async function nextQuestion() {
    if (selected === null) return;
    const nextAnswers = [...answers, selected];
    if (questionIndex < questions.length - 1) {
      setAnswers(nextAnswers);
      setQuestionIndex(questionIndex + 1);
      setSelected(null);
      return;
    }
    const score = nextAnswers.reduce((total, answer, index) => total + Number(answer === questions[index].correct), 0);
    const level = recommendedLevel(score);
    setAnswers(nextAnswers);
    setResult({ score, level });
    setMode('result');
  }

  const currentQuestion = questions[questionIndex];
  const displayedLevel = profile.proficiencyLevel || 'B1–B2';

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) reset(); }}>
      <DialogTrigger render={<button className="group inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold uppercase tracking-[.13em] text-[#4c7b70] transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35" aria-label={`Current level ${displayedLevel}. Test or adjust level.`} />}>
        <span>{displayedLevel} · Everyday conversation</span><SlidersHorizontal className="size-3.5 transition group-hover:rotate-6" />
      </DialogTrigger>
      <DialogContent className="max-w-[560px] gap-6 rounded-[28px] border border-white/80 p-6 shadow-[0_28px_90px_rgba(20,38,33,.22)] sm:p-8">
        {mode === 'home' && <>
          <DialogHeader><DialogTitle className="text-3xl font-semibold tracking-[-.045em]">Your Spanish level</DialogTitle><DialogDescription className="text-base leading-relaxed">Your level shapes the vocabulary, grammar, and pace of each lesson.</DialogDescription></DialogHeader>
          <div className="rounded-[20px] bg-[#eef6f2] p-5"><p className="text-sm font-medium text-[#52776d]">Current level</p><p className="mt-1 text-4xl font-semibold tracking-[-.055em] text-[#173c34]">{displayedLevel}</p></div>
          <div className="grid gap-3 sm:grid-cols-2"><button onClick={() => reset('test')} className="rounded-[20px] bg-primary p-5 text-left text-white transition hover:-translate-y-0.5 hover:bg-[#245247]"><Sparkles className="size-5" /><strong className="mt-5 block text-lg">Take a quick check</strong><span className="mt-1 block text-sm text-white/70">8 questions · about 2 minutes</span></button><button onClick={() => reset('choose')} className="rounded-[20px] bg-secondary p-5 text-left transition hover:-translate-y-0.5 hover:bg-[#e9eeec]"><SlidersHorizontal className="size-5 text-primary" /><strong className="mt-5 block text-lg">Choose it yourself</strong><span className="mt-1 block text-sm text-muted-foreground">Adjust from A1 through C2</span></button></div>
        </>}

        {mode === 'test' && <>
          <DialogHeader><div className="flex items-center justify-between"><button onClick={() => reset()} className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back</button><span className="text-sm font-medium text-muted-foreground">{questionIndex + 1} of {questions.length}</span></div><Progress value={(questionIndex + 1) / questions.length * 100} className="pt-2" /><DialogTitle className="pt-4 text-2xl font-semibold leading-snug tracking-[-.035em]">{currentQuestion.prompt}</DialogTitle><DialogDescription>Choose the answer that sounds most natural.</DialogDescription></DialogHeader>
          <div className="grid gap-2.5">{currentQuestion.options.map((option, index) => <button key={option} onClick={() => setSelected(index)} className={`flex min-h-14 items-center gap-3 rounded-[16px] border px-4 py-3 text-left text-base transition ${selected === index ? 'border-primary bg-[#eef6f2] text-[#173c34] ring-1 ring-primary/20' : 'border-border bg-white hover:border-[#9bb9b0]'}`}><span className={`grid size-6 shrink-0 place-items-center rounded-full border text-xs font-semibold ${selected === index ? 'border-primary bg-primary text-white' : 'border-border text-muted-foreground'}`}>{selected === index ? <Check className="size-3.5" /> : String.fromCharCode(65 + index)}</span>{option}</button>)}</div>
          <Button onClick={() => void nextQuestion()} disabled={selected === null} className="h-12 rounded-full text-base font-bold">{questionIndex === questions.length - 1 ? 'See my result' : 'Next question'}<ChevronRight className="size-4" /></Button>
        </>}

        {mode === 'choose' && <>
          <DialogHeader><button onClick={() => reset()} className="mb-2 inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back</button><DialogTitle className="text-3xl font-semibold tracking-[-.045em]">Choose your level</DialogTitle><DialogDescription className="text-base leading-relaxed">You can change this whenever the lessons feel too easy or too difficult.</DialogDescription></DialogHeader>
          <div className="grid grid-cols-3 gap-3">{levels.map((level) => <button key={level} disabled={saving} onClick={() => void saveLevel(level, 'chosen')} className={`rounded-[18px] border px-4 py-5 text-xl font-semibold transition hover:-translate-y-0.5 ${profile.proficiencyLevel === level ? 'border-primary bg-primary text-white' : 'border-border bg-white hover:border-[#9bb9b0]'}`}>{level}</button>)}</div>
        </>}

        {mode === 'result' && result && <>
          <DialogHeader><DialogTitle className="text-3xl font-semibold tracking-[-.045em]">Your recommended level is {result.level}</DialogTitle><DialogDescription className="text-base leading-relaxed">You answered {result.score} of {questions.length} questions correctly. This is a useful starting point—not a permanent label.</DialogDescription></DialogHeader>
          <div className="rounded-[22px] bg-[#eef6f2] p-6 text-center"><span className="text-6xl font-semibold tracking-[-.07em] text-[#173c34]">{result.level}</span><p className="mt-2 text-sm text-[#52776d]">Recommended starting level</p></div>
          {message && <p role="alert" className="rounded-xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8b4337]">{message}</p>}
          <div className="flex flex-col gap-3 sm:flex-row"><Button onClick={() => void saveLevel(result.level, 'assessed', answers)} disabled={saving} className="h-12 flex-1 rounded-full text-base font-bold">{saving ? 'Saving…' : `Use ${result.level}`}</Button><Button variant="outline" onClick={() => setMode('choose')} disabled={saving} className="h-12 rounded-full px-6">Choose another</Button></div>
        </>}
        {message && mode !== 'result' && <p role="alert" className="rounded-xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8b4337]">{message}</p>}
      </DialogContent>
    </Dialog>
  );
}
