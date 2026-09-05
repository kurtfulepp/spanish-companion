'use client';

import { useState } from 'react';
import { ArrowRight, BookOpenCheck, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LearningHeader } from '@/components/vocabulary-header';

const questions = [
  { sentence: 'Ayer ___ al mercado antes de cenar.', options: ['iba', 'fui', 'he ido'], answer: 1, explanation: '“Ayer” and the completed trip point to the preterite: fui.' },
  { sentence: 'Cuando vivía en Madrid, ___ al trabajo todos los días.', options: ['caminé', 'caminaba', 'he caminado'], answer: 1, explanation: 'A repeated background habit uses the imperfect: caminaba.' },
  { sentence: 'Mientras cenábamos, ___ el teléfono.', options: ['sonó', 'sonaba', 'ha sonado'], answer: 0, explanation: 'The call is a completed event that interrupted the background action: sonó.' },
  { sentence: 'De niño, siempre ___ los veranos con mis abuelos.', options: ['pasé', 'pasaba', 'he pasado'], answer: 1, explanation: '“Siempre” describes a recurring childhood routine, so use pasaba.' },
];

const upcomingTopics = [
  { title: 'Subjunctive triggers', detail: 'Wishes, doubt, and recommendations' },
  { title: 'Object pronouns', detail: 'Lo, la, le—and where they belong' },
];

export default function GrammarPage() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);
  const question = questions[questionIndex];
  const correct = selected === question.answer;

  function checkAnswer() {
    if (selected === null || checked) return;
    if (selected === question.answer) setScore((value) => value + 1);
    setChecked(true);
  }

  function continueExercise() {
    if (questionIndex === questions.length - 1) {
      setComplete(true);
      return;
    }
    setQuestionIndex((value) => value + 1);
    setSelected(null);
    setChecked(false);
  }

  function restart() {
    setQuestionIndex(0);
    setSelected(null);
    setChecked(false);
    setScore(0);
    setComplete(false);
  }

  return (
    <main className="min-h-screen bg-background px-3 pb-12 pt-3 text-foreground sm:px-5">
      <LearningHeader active="grammar" />
      <section className="mx-auto mt-5 grid max-w-[1360px] gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,.8fr)]">
        <article className="surface overflow-hidden rounded-[30px]">
          <div className="border-b border-border/70 bg-[#fff4dc] px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="eyebrow text-[#9a6720]">Grammar · Past choices</p><h1 className="mt-2 font-heading text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-none tracking-[-.055em] text-[#173c34]">Preterite or imperfect?</h1><p className="mt-3 max-w-2xl text-base leading-relaxed text-[#79564c]">Choose the form that matches the story. You’ll get the reason after every answer.</p></div>
              <span className="practice-icon gold size-12 shrink-0"><BookOpenCheck className="size-5" /></span>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            {!complete ? <>
              <div className="flex items-center gap-4"><Progress value={(questionIndex + (checked ? 1 : 0)) / questions.length * 100} className="flex-1" /><span className="shrink-0 text-sm font-semibold text-muted-foreground">{questionIndex + 1} of {questions.length}</span></div>
              <h2 className="mt-8 text-2xl font-semibold leading-snug tracking-[-.035em] text-[#173c34] sm:text-3xl">{question.sentence}</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Answer choices">
                {question.options.map((option, index) => {
                  const isSelected = selected === index;
                  const isAnswer = checked && index === question.answer;
                  const isIncorrect = checked && isSelected && !isAnswer;
                  return <button key={option} type="button" aria-pressed={isSelected} disabled={checked} onClick={() => setSelected(index)} className={`min-h-14 rounded-[16px] border px-5 py-3 text-left text-base font-semibold transition ${isAnswer ? 'border-[#3d8a71] bg-[#e9f5ef] text-[#235f4d] ring-2 ring-[#3d8a71]/15' : isIncorrect ? 'border-[#d86b57] bg-[#fff0ec] text-[#8b4337]' : isSelected ? 'border-primary bg-[#eef6f2] text-primary ring-2 ring-primary/15' : 'border-border bg-white hover:-translate-y-0.5 hover:border-[#9bb9b0] hover:shadow-sm'}`}>{option}</button>;
                })}
              </div>
              {checked && <output className={`mt-6 block rounded-[18px] px-5 py-4 ${correct ? 'bg-[#e9f5ef] text-[#235f4d]' : 'bg-[#fff0ec] text-[#8b4337]'}`}><strong className="flex items-center gap-2 text-sm"><Check className="size-4" />{correct ? 'Exactly right' : `The answer is “${question.options[question.answer]}”`}</strong><span className="mt-1.5 block text-sm leading-relaxed opacity-90">{question.explanation}</span></output>}
              <div className="mt-7 flex justify-end">{!checked ? <Button onClick={checkAnswer} disabled={selected === null} className="h-11 rounded-full px-6 font-bold">Check answer</Button> : <Button onClick={continueExercise} className="h-11 rounded-full px-6 font-bold">{questionIndex === questions.length - 1 ? 'See result' : 'Next question'}<ArrowRight className="size-4" /></Button>}</div>
            </> : <div className="grid min-h-[360px] place-items-center py-6 text-center"><div className="max-w-lg"><span className="mx-auto grid size-14 place-items-center rounded-full bg-[#e9f5ef] text-[#2f755f]"><Check className="size-6" /></span><p className="eyebrow mt-5">Practice complete</p><h2 className="mt-2 text-4xl font-semibold tracking-[-.055em] text-[#173c34]">{score} of {questions.length}</h2><p className="mt-3 text-base leading-relaxed text-muted-foreground">{score === questions.length ? 'You can read the timeline clearly.' : 'Review the explanation behind each choice, then try once more.'}</p><Button onClick={restart} className="mt-6 h-11 rounded-full px-6 font-bold"><RotateCcw className="size-4" />Practice again</Button></div></div>}
          </div>
        </article>
        <aside className="grid content-start gap-5">
          <section className="rounded-[26px] bg-[#fff0e8] p-6 ring-1 ring-[#ea6c4d]/20 sm:p-7"><p className="eyebrow text-[#b6503f]">Why this matters</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-[#7f302b]">Tell a clearer story</h2><p className="mt-3 text-sm leading-relaxed text-[#79564c]">Use the imperfect for the scene and recurring habits. Use the preterite for the event that moved the story forward.</p></section>
          <section className="surface rounded-[26px] p-6 sm:p-7"><p className="eyebrow">Coming next</p><div className="mt-3 divide-y divide-border/70">{upcomingTopics.map((topic) => <div key={topic.title} className="py-4 first:pt-1"><div className="flex items-center justify-between gap-3"><strong className="text-[15px] text-[#173c34]">{topic.title}</strong><span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.06em] text-muted-foreground">Planned</span></div><p className="mt-1 text-sm text-muted-foreground">{topic.detail}</p></div>)}</div></section>
        </aside>
      </section>
    </main>
  );
}
