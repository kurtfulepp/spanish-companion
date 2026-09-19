'use client';
import { useEffect, useReducer, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { GrammarLesson } from '@/lib/grammar-lessons';
import { PracticeTimeTracker } from './practice-time-tracker';
import {
  advanceGrammar,
  grammarResult,
  newGrammarAttempt,
} from '@/lib/grammar-practice';
import type { CEFRLevel } from '@/lib/cefr';
import styles from '@/app/grammar/grammar.module.css';
type Result = { score: number; total: number };
function RuleGuide({ lesson }: { lesson: GrammarLesson }) {
  return (
    <div className={styles.rules}>
      {lesson.rules.map((rule, index) => (
        <section className={styles.rule} key={rule.title}>
          <span className={styles.ruleNumber} aria-hidden="true">
            {index + 1}
          </span>
          <div>
            <h3>{rule.title}</h3>
            <p>{rule.explanation}</p>
            <div className={styles.ruleExample}>
              <p lang="es">{rule.spanish}</p>
              <p>{rule.english}</p>
            </div>
          </div>
        </section>
      ))}
      <div className={styles.reminder}>
        <strong>Keep in mind</strong>
        <p>{lesson.reminder}</p>
      </div>
    </div>
  );
}

export function GrammarSampleLesson({
  lesson,
  level,
  onBack,
  onResult,
}: {
  lesson: GrammarLesson;
  level: CEFRLevel;
  onBack: () => void;
  onResult: (id: string, result: Result) => void;
}) {
  const [attempt, dispatch] = useReducer(
    (
      state: ReturnType<typeof newGrammarAttempt>,
      action: Parameters<typeof advanceGrammar>[2],
    ) => advanceGrammar(lesson, state, action),
    lesson,
    newGrammarAttempt,
  );
  const focusTarget = useRef<HTMLHeadingElement>(null);
  const feedbackButton = useRef<HTMLButtonElement>(null);
  const index = attempt.indices[attempt.position];
  const question = lesson.questions[index];
  const checked = Object.hasOwn(attempt.answers, index);
  const correct = attempt.answers[index] === question.answer;
  const result = grammarResult(lesson, attempt);

  useEffect(() => {
    focusTarget.current?.focus();
  }, [attempt.phase, attempt.position, attempt.reviewing]);
  useEffect(() => {
    if (checked && attempt.phase === 'practice')
      feedbackButton.current?.focus();
  }, [checked, attempt.phase]);
  useEffect(() => {
    if (attempt.phase === 'result' && !attempt.reviewing)
      onResult(lesson.id, grammarResult(lesson, attempt));
  }, [attempt, lesson, onResult]);

  return (
    <div className={styles.content}>
      <PracticeTimeTracker
        active={attempt.phase === 'practice'}
        area="grammar"
        level={level}
      />
      <Button variant="ghost" onClick={onBack} className={styles.back}>
        <ArrowLeft size={16} />
        All grammar topics
      </Button>
      <section className={styles.lesson}>
        <header className={styles.lessonHeader}>
          <p className={styles.category}>
            {level} · {lesson.category}
          </p>
          <h1
            ref={attempt.phase === 'learn' ? focusTarget : undefined}
            tabIndex={-1}
          >
            {lesson.title}
          </h1>
          <p>{lesson.description}</p>
          <ol className={styles.steps} aria-label="Lesson steps">
            {(['learn', 'practice', 'result'] as const).map((phase, i) => (
              <li
                key={phase}
                aria-current={phase === attempt.phase ? 'step' : undefined}
              >
                <span>{i + 1}</span>
                {['Learn', 'Practice', 'Review'][i]}
              </li>
            ))}
          </ol>
        </header>
        {attempt.phase === 'learn' ? (
          <div className={styles.lessonBody}>
            <RuleGuide lesson={lesson} />
            <div className={styles.actions}>
              <span>
                {lesson.questions.length} questions · Explanations after every
                answer
              </span>
              <Button
                className={styles.primary}
                onClick={() => dispatch({ type: 'start' })}
              >
                Start practice
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        ) : attempt.phase === 'practice' ? (
          <div className={styles.lessonBody}>
            <div className={styles.practiceMeta}>
              <span>
                {attempt.reviewing
                  ? 'Reviewing missed answers'
                  : 'Choose the form that fits'}
              </span>
              <span>
                {attempt.position + 1} of {attempt.indices.length}
              </span>
            </div>
            <Progress
              aria-label="Questions answered"
              value={
                ((attempt.position + (checked ? 1 : 0)) /
                  attempt.indices.length) *
                100
              }
              className={styles.progress}
            />
            {question.context && (
              <p className={styles.context}>{question.context}</p>
            )}
            <h2
              ref={focusTarget}
              tabIndex={-1}
              id="grammar-question"
              className={styles.question}
              lang="es"
            >
              {question.sentence}
            </h2>
            <RadioGroup
              key={`${attempt.reviewing}-${index}`}
              value={attempt.selected === null ? '' : String(attempt.selected)}
              onValueChange={(value) =>
                dispatch({ type: 'select', value: Number(value) })
              }
              disabled={checked}
              aria-labelledby="grammar-question"
              className={styles.choices}
            >
              {question.options.map((option, optionIndex) => (
                <label
                  key={option}
                  className={styles.choice}
                  data-selected={attempt.selected === optionIndex}
                  data-correct={checked && optionIndex === question.answer}
                  data-incorrect={
                    checked && attempt.selected === optionIndex && !correct
                  }
                >
                  <RadioGroupItem value={String(optionIndex)} />
                  <span lang="es">{option}</span>
                  {checked && optionIndex === question.answer && (
                    <Check size={18} aria-label="Correct answer" />
                  )}
                </label>
              ))}
            </RadioGroup>
            <div aria-live="polite" aria-atomic="true">
              {checked && (
                <div className={styles.feedback} data-correct={correct}>
                  <strong>
                    {correct
                      ? 'Correct'
                      : `Needs practice · Use “${question.options[question.answer]}”`}
                  </strong>
                  <p>{question.explanation}</p>
                </div>
              )}
            </div>
            <div className={styles.actions}>
              <span>
                {checked
                  ? 'Read the explanation before continuing.'
                  : 'Select one answer.'}
              </span>
              {checked ? (
                <Button
                  ref={feedbackButton}
                  className={styles.primary}
                  onClick={() => dispatch({ type: 'next' })}
                >
                  {attempt.position === attempt.indices.length - 1
                    ? 'See results'
                    : 'Next question'}
                  <ArrowRight size={16} />
                </Button>
              ) : (
                <Button
                  className={styles.primary}
                  disabled={attempt.selected === null}
                  onClick={() => dispatch({ type: 'check' })}
                >
                  Check answer
                </Button>
              )}
            </div>
            <details className={styles.reference}>
              <summary>Review the explanation</summary>
              <RuleGuide lesson={lesson} />
            </details>
          </div>
        ) : (
          <div className={styles.lessonBody}>
            <div className={styles.result}>
              <span className={styles.resultIcon}>
                <CircleCheck size={28} />
              </span>
              <p>
                {attempt.reviewing ? 'Review complete' : 'Practice complete'}
              </p>
              <h2 ref={focusTarget} tabIndex={-1}>
                {result.score} of {result.total} correct
              </h2>
              <p>
                {result.missed.length
                  ? 'Review the answers below, then retry the ones you missed.'
                  : 'You answered every question in this round correctly.'}
              </p>
            </div>
            <div className={styles.answerReview}>
              {attempt.indices.map((questionIndex) => {
                const item = lesson.questions[questionIndex];
                const answer = attempt.answers[questionIndex];
                return (
                  <section key={questionIndex}>
                    <span className={styles.answerStatus}>
                      {answer === item.answer ? 'Correct' : 'Needs practice'}
                    </span>
                    <h3 lang="es">
                      {item.sentence.replace('___', item.options[item.answer])}
                    </h3>
                    {answer !== item.answer && (
                      <p>
                        Your answer:{' '}
                        <span lang="es">{item.options[answer]}</span>
                      </p>
                    )}
                    <p>{item.explanation}</p>
                  </section>
                );
              })}
            </div>
            <div className={styles.resultActions}>
              {result.missed.length > 0 && (
                <Button
                  className={styles.primary}
                  onClick={() => dispatch({ type: 'retry-missed' })}
                >
                  <RotateCcw size={16} />
                  Retry {result.missed.length} missed
                </Button>
              )}
              <Button
                variant="outline"
                className={styles.secondary}
                onClick={() => dispatch({ type: 'start' })}
              >
                Practice all again
              </Button>
              <Button
                variant="outline"
                className={styles.secondary}
                onClick={onBack}
              >
                Back to topics
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
