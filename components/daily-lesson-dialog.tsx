'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronRight, Headphones, LoaderCircle, Play, RotateCcw, Sparkles, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';
import { playSpanishSpeech, type VoicePreference } from '@/lib/speech';

type Activity = {
  id: string;
  position: number;
  activity_type: string;
  instruction: string;
  prompt: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  audio_text: string | null;
};

type Lesson = {
  id: string;
  title: string;
  description: string;
  level: string;
  estimated_minutes: number;
};

type View = 'intro' | 'activity' | 'complete';
type AudioState = 'idle' | 'playing' | 'played' | 'error';

export function DailyLessonDialog({ open, onOpenChange, level, voice, onComplete }: { open: boolean; onOpenChange: (open: boolean) => void; level: string; voice: VoicePreference; onComplete: () => void | Promise<void> }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [view, setView] = useState<View>('intro');
  const [activityIndex, setActivityIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const audioRequestInProgress = useRef(false);

  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    void (async () => {
      let { data: lessonData, error: lessonError } = await supabase.from('lessons').select('id, title, description, level, estimated_minutes').eq('is_published', true).eq('level', level || 'B2').order('published_at', { ascending: false }).limit(1).maybeSingle();
      if (!lessonData && !lessonError && level !== 'B2') {
        const fallback = await supabase.from('lessons').select('id, title, description, level, estimated_minutes').eq('is_published', true).eq('level', 'B2').order('published_at', { ascending: false }).limit(1).maybeSingle();
        lessonData = fallback.data;
        lessonError = fallback.error;
      }
      if (lessonError || !lessonData) {
        setMessage('Today’s lesson is not available yet. Please try again shortly.');
        setLoading(false);
        return;
      }
      const { data: activityData, error: activityError } = await supabase.from('lesson_activities').select('id, position, activity_type, instruction, prompt, options, correct_answer, explanation, audio_text').eq('lesson_id', lessonData.id).order('position');
      if (activityError || !activityData?.length) {
        setMessage('The lesson activities could not be loaded. Please try again.');
      } else {
        setLesson(lessonData as Lesson);
        setActivities(activityData as Activity[]);
      }
      setLoading(false);
    })();
  }, [open, level]);

  async function startLesson() {
    if (!lesson) return;
    setSaving(true);
    setMessage('');
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { window.location.replace('/sign-in'); return; }
    const { data, error } = await supabase.rpc('start_lesson_attempt', { p_lesson_id: lesson.id });
    if (error || !data) setMessage('The lesson could not be started. Please try again.');
    else { setAttemptId(data); setView('activity'); }
    setSaving(false);
  }

  async function checkAnswer() {
    if (!attemptId || !selected) return;
    setSaving(true);
    setMessage('');
    const activity = activities[activityIndex];
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { window.location.replace('/sign-in'); return; }
    const { data: isCorrect, error } = await supabase.rpc('submit_lesson_response', {
      p_attempt_id: attemptId,
      p_activity_id: activity.id,
      p_answer: selected,
    });
    if (error) setMessage('Your answer could not be saved. Please try again.');
    else {
      if (isCorrect) setScore((current) => current + 1);
      setChecked(true);
    }
    setSaving(false);
  }

  async function playActivityAudio() {
    const audioText = activities[activityIndex]?.audio_text;
    if (!audioText || audioRequestInProgress.current) return;

    audioRequestInProgress.current = true;
    setAudioState('playing');
    try {
      await playSpanishSpeech(audioText, voice);
      setAudioState('played');
    } catch {
      setAudioState('error');
    } finally {
      audioRequestInProgress.current = false;
    }
  }

  async function continueLesson() {
    if (activityIndex < activities.length - 1) {
      setActivityIndex((current) => current + 1);
      setSelected('');
      setChecked(false);
      setMessage('');
      setAudioState('idle');
      audioRequestInProgress.current = false;
      return;
    }
    if (!attemptId) return;
    setSaving(true);
    const { data: savedScore, error } = await createClient().rpc('complete_lesson_attempt', { p_attempt_id: attemptId });
    if (error) setMessage('The lesson result could not be saved. Please try again.');
    else {
      if (typeof savedScore === 'number') setScore(savedScore);
      setView('complete');
      await onComplete();
    }
    setSaving(false);
  }

  const activity = activities[activityIndex];
  const correct = activity ? selected === activity.correct_answer : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-h-[calc(100vh-2rem)] max-w-[640px] overflow-y-auto rounded-[30px] border border-white/80 p-0 shadow-[0_28px_90px_rgba(20,38,33,.25)]">
        <div className="flex items-center justify-between border-b border-border/70 px-6 py-4 sm:px-8"><span className="inline-flex items-center gap-2 text-sm font-semibold text-[#52776d]"><Sparkles className="size-4" />KurtES daily lesson</span><button onClick={() => onOpenChange(false)} className="grid size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground" aria-label="Close lesson"><X className="size-4" /></button></div>

        {loading && <div className="grid min-h-[440px] place-items-center p-8"><div className="text-center"><span className="mx-auto block size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /><p className="mt-4 text-sm text-muted-foreground">Preparing today’s lesson…</p></div></div>}

        {!loading && view === 'intro' && <div className="grid gap-7 p-6 sm:p-8">
          <DialogHeader><p className="text-sm font-semibold uppercase tracking-[.13em] text-[#4c7b70]">{lesson?.level || level} · Everyday conversation</p><DialogTitle className="text-4xl font-semibold leading-[.98] tracking-[-.055em] text-[#173c34]">{lesson?.title || 'Today’s lesson'}</DialogTitle><DialogDescription className="max-w-lg text-base leading-relaxed">{lesson?.description || 'Practice one useful idea through a short series of activities.'}</DialogDescription></DialogHeader>
          {lesson && <div className="grid grid-cols-2 gap-3"><div className="rounded-[18px] bg-[#eef6f2] p-4"><span className="text-sm text-[#52776d]">Activities</span><strong className="mt-1 block text-2xl text-[#173c34]">{activities.length}</strong></div><div className="rounded-[18px] bg-[#fff4dc] p-4"><span className="text-sm text-[#8a6424]">Time</span><strong className="mt-1 block text-2xl text-[#694b18]">{lesson.estimated_minutes} min</strong></div></div>}
          {message && <p role="alert" className="rounded-xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8b4337]">{message}</p>}
          <Button onClick={() => void startLesson()} disabled={!lesson || saving} className="h-12 rounded-full text-base font-bold"><Play className="size-4 fill-current" />{saving ? 'Starting…' : 'Begin lesson'}</Button>
        </div>}

        {!loading && view === 'activity' && activity && <div className="grid gap-6 p-6 sm:p-8">
          <div><div className="flex items-center justify-between text-sm font-medium text-muted-foreground"><span>Activity {activityIndex + 1} of {activities.length}</span><span>{activity.activity_type === 'listening' ? 'Listening' : activity.activity_type === 'response' ? 'Natural response' : 'Practice'}</span></div><Progress value={(activityIndex + 1) / activities.length * 100} className="mt-3" /></div>
          <DialogHeader><p className="text-sm font-semibold text-[#4c7b70]">{activity.instruction}</p><DialogTitle className="text-3xl font-semibold leading-tight tracking-[-.04em]">{activity.prompt}</DialogTitle></DialogHeader>
          {activity.audio_text && <button type="button" onClick={() => void playActivityAudio()} disabled={audioState === 'playing'} aria-pressed={audioState === 'played'} aria-live="polite" className={`inline-flex min-w-36 w-fit items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${audioState === 'playing' ? 'cursor-wait bg-[#dcece6] text-[#52776d]' : audioState === 'played' ? 'bg-primary text-white shadow-sm hover:bg-[#245247]' : audioState === 'error' ? 'bg-[#fff1ed] text-[#8b4337] hover:bg-[#fde6df]' : 'bg-[#eef6f2] text-primary hover:bg-[#e2f0ea]'}`}>{audioState === 'playing' ? <LoaderCircle className="size-4 animate-spin" /> : audioState === 'played' ? <RotateCcw className="size-4" /> : <Headphones className="size-4" />}{audioState === 'playing' ? 'Playing…' : audioState === 'played' ? 'Replay' : audioState === 'error' ? 'Try listening again' : 'Listen'}</button>}
          <div className="grid gap-2.5">{activity.options.map((option, index) => {
            const isSelected = selected === option;
            const isAnswer = checked && option === activity.correct_answer;
            const isWrong = checked && isSelected && !correct;
            return <button key={option} disabled={checked} onClick={() => setSelected(option)} className={`flex min-h-14 items-center gap-3 rounded-[16px] border px-4 py-3 text-left text-base transition ${isAnswer ? 'border-[#4b917c] bg-[#e9f6f0] text-[#173c34]' : isWrong ? 'border-[#d98977] bg-[#fff1ed] text-[#7a3429]' : isSelected ? 'border-primary bg-[#eef6f2] ring-1 ring-primary/20' : 'border-border bg-white hover:border-[#9bb9b0]'}`}><span className={`grid size-6 shrink-0 place-items-center rounded-full border text-xs font-semibold ${isAnswer ? 'border-[#4b917c] bg-[#4b917c] text-white' : isWrong ? 'border-[#d98977] bg-[#d98977] text-white' : isSelected ? 'border-primary bg-primary text-white' : 'border-border text-muted-foreground'}`}>{isAnswer ? <Check className="size-3.5" /> : String.fromCharCode(65 + index)}</span>{option}</button>})}</div>
          {checked && <div className={`rounded-[18px] p-4 ${correct ? 'bg-[#e9f6f0] text-[#285d4e]' : 'bg-[#fff4dc] text-[#6f511d]'}`}><strong className="block">{correct ? '¡Muy bien!' : `The best answer is “${activity.correct_answer}.”`}</strong><p className="mt-1 text-sm leading-relaxed opacity-80">{activity.explanation}</p></div>}
          {message && <p role="alert" className="rounded-xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8b4337]">{message}</p>}
          {!checked ? <Button onClick={() => void checkAnswer()} disabled={!selected || saving} className="h-12 rounded-full text-base font-bold">{saving ? 'Saving…' : 'Check answer'}</Button> : <Button onClick={() => void continueLesson()} disabled={saving} className="h-12 rounded-full text-base font-bold">{activityIndex === activities.length - 1 ? 'Complete lesson' : 'Continue'}<ChevronRight className="size-4" /></Button>}
        </div>}

        {!loading && view === 'complete' && lesson && <div className="grid gap-7 p-7 text-center sm:p-10"><span className="mx-auto grid size-16 place-items-center rounded-full bg-[#e9f6f0] text-[#32806a]"><Check className="size-8" /></span><DialogHeader><DialogTitle className="text-4xl font-semibold tracking-[-.055em] text-[#173c34]">Lesson complete</DialogTitle><DialogDescription className="text-base leading-relaxed">You answered {score} of {activities.length} correctly. Your progress and today’s completion are saved.</DialogDescription></DialogHeader><div className="rounded-[22px] bg-[#fff4dc] p-5"><p className="text-sm font-medium text-[#8a6424]">Today’s phrase</p><p className="mt-2 text-2xl font-semibold text-[#694b18]">¿Qué planes tienes hoy?</p><button onClick={() => void playSpanishSpeech('¿Qué planes tienes hoy?', voice)} className="mx-auto mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#694b18]"><Volume2 className="size-4" />Hear it again</button></div><div className="flex flex-col gap-3 sm:flex-row"><Button onClick={() => onOpenChange(false)} className="h-12 flex-1 rounded-full text-base font-bold">Back to today</Button><Button variant="outline" onClick={() => { setView('intro'); setActivityIndex(0); setSelected(''); setChecked(false); setScore(0); setAttemptId(null); setAudioState('idle'); audioRequestInProgress.current = false; }} className="h-12 rounded-full px-6"><RotateCcw className="size-4" />Practice again</Button></div></div>}
      </DialogContent>
    </Dialog>
  );
}
