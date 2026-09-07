'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  checkGrammarAnswer,
  EVIDENCE_LABELS,
  type RuleLesson,
} from '@/lib/grammar-rules';
import {
  scoreRule,
  type GrammarEvidence,
  type GrammarSubmission,
} from '@/lib/grammar-evidence';
import styles from '@/app/grammar/grammar.module.css';

export function GrammarRuleLesson({
  lesson,
  previous,
  previewOnly = false,
  onBack,
  onSaved,
}: {
  lesson: RuleLesson;
  previous?: GrammarEvidence;
  previewOnly?: boolean;
  onBack: () => void;
  onSaved: (attempt: GrammarEvidence) => void;
}) {
  const [stage, setStage] = useState<'learn' | 'practice' | 'write' | 'result'>(
    'learn',
  );
  const [position, setPosition] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [writing, setWriting] = useState('');
  const [selfReview, setSelfReview] = useState(
    lesson.production.checklist.map(() => false),
  );
  const [showModel, setShowModel] = useState(false);
  const [saveState, setSaveState] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [saveError, setSaveError] = useState('');
  const submission = useRef<GrammarSubmission | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const exercise = lesson.exercises[position];
  const checked = Object.hasOwn(answers, exercise.id);
  const correct = checkGrammarAnswer(exercise, answers[exercise.id] ?? '');
  const scores = scoreRule(lesson, answers);
  useEffect(() => {
    heading.current?.focus();
  }, [stage, position]);
  useEffect(() => {
    if (checked && stage === 'practice') nextButton.current?.focus();
  }, [checked, stage]);

  async function save() {
    if (previewOnly || saveState === 'saving' || saveState === 'saved') return;
    if (!submission.current)
      submission.current = {
        attemptId: crypto.randomUUID(),
        ruleId: lesson.id,
        version: lesson.version,
        answers,
        writing,
        selfReview,
      };
    setSaveState('saving');
    setSaveError('');
    try {
      const response = await fetch('/api/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission.current),
      });
      const result = (await response.json()) as {
        attempt?: GrammarEvidence;
        error?: string;
      };
      if (!response.ok || !result.attempt)
        throw new Error(
          result.error || 'Saving failed. Keep this page open and retry.',
        );
      setSaveState('saved');
      onSaved(result.attempt);
    } catch (error) {
      setSaveState('error');
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Saving failed. Keep this page open and retry.',
      );
    }
  }

  return (
    <div className={styles.content}>
      <Button variant="ghost" className={styles.back} onClick={onBack}>
        <ArrowLeft size={16} /> Back to curriculum
      </Button>
      <section className={styles.lesson}>
        <header className={styles.lessonHeader}>
          <p className={styles.category}>
            {lesson.level} · {lesson.moduleId} · Rule lesson
          </p>
          <h1>{lesson.title}</h1>
          <p>{lesson.objective}</p>
          <ol className={styles.steps} aria-label="Lesson steps">
            {(['learn', 'practice', 'write', 'result'] as const).map(
              (step, index) => (
                <li
                  key={step}
                  aria-current={stage === step ? 'step' : undefined}
                >
                  <span>{index + 1}</span>
                  {['Learn', 'Practice', 'Write', 'Review'][index]}
                </li>
              ),
            )}
          </ol>
        </header>
        <div className={styles.lessonBody}>
          {stage === 'learn' && (
            <>
              <h2 ref={heading} tabIndex={-1}>
                The rule
              </h2>
              <p className={styles.prose}>{lesson.explanation}</p>
              <div className={styles.pattern} lang="es">
                {lesson.pattern}
              </div>
              <div className={styles.rules}>
                {lesson.examples.map((example) => (
                  <div className={styles.ruleExample} key={example.spanish}>
                    <p lang="es">{example.spanish}</p>
                    <p>{example.english}</p>
                  </div>
                ))}
              </div>
              <div className={styles.reminder}>
                <h3>What changes the meaning?</h3>
                <p>{lesson.contrast}</p>
              </div>
              <p className={styles.prose}>{lesson.variation}</p>
              <details className={styles.reference}>
                <summary>Prerequisites and reference</summary>
                <p>{lesson.prerequisiteNote}</p>
                <p>Modules: {lesson.prerequisites.join(', ')}</p>
                <p>
                  <a href={lesson.source.url} target="_blank" rel="noreferrer">
                    {lesson.source.title}
                  </a>{' '}
                  · {lesson.source.section}
                </p>
                <p>Lesson draft · Independent teacher review pending.</p>
              </details>
              {previous && (
                <p className={styles.visitNote}>
                  You have saved practice for this rule. Repeating these
                  questions is further practice, not a retention assessment.
                </p>
              )}
              {previewOnly ? (
                <p className={styles.visitNote}>
                  You are previewing a {lesson.level} rule. To practice at this
                  level, select {lesson.level} in Profile. Browsing here does
                  not change your current level.
                </p>
              ) : (
                <div className={styles.actions}>
                  <span>4 checks, then your own writing</span>
                  <Button
                    className={styles.primary}
                    onClick={() => setStage('practice')}
                  >
                    Start practice <ArrowRight size={16} />
                  </Button>
                </div>
              )}
            </>
          )}
          {stage === 'practice' && (
            <>
              <p className={styles.practiceMeta}>
                {EVIDENCE_LABELS[exercise.kind]} · {position + 1} of{' '}
                {lesson.exercises.length}
              </p>
              <h2 ref={heading} tabIndex={-1}>
                {exercise.instruction}
              </h2>
              <p className={styles.question}>{exercise.prompt}</p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (answer.trim() && !checked)
                    setAnswers((current) => ({
                      ...current,
                      [exercise.id]: answer,
                    }));
                }}
              >
                {exercise.options ? (
                  <RadioGroup
                    aria-label={exercise.instruction}
                    value={answer}
                    onValueChange={setAnswer}
                    disabled={checked}
                    className={styles.choices}
                  >
                    {exercise.options.map((option, index) => (
                      <label
                        className={styles.choice}
                        key={option}
                        data-selected={answer === option}
                        htmlFor={`rule-choice-${index}`}
                      >
                        <RadioGroupItem
                          id={`rule-choice-${index}`}
                          value={option}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className={styles.answerInput}>
                    <label htmlFor="rule-answer">Your answer</label>
                    <Input
                      id="rule-answer"
                      lang="es"
                      value={answer}
                      onChange={(event) => setAnswer(event.target.value)}
                      disabled={checked}
                      maxLength={300}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <p>
                      Accents count. Capitalization and extra spaces do not.
                    </p>
                  </div>
                )}
                {!checked && (
                  <div className={styles.actions}>
                    <Button
                      className={styles.primary}
                      type="submit"
                      disabled={!answer.trim()}
                    >
                      Check answer <Check size={16} />
                    </Button>
                  </div>
                )}
              </form>
              {checked && (
                <>
                  <output className={styles.feedback} data-correct={correct}>
                    <strong>
                      {correct
                        ? 'Correct for this task'
                        : 'Compare your answer'}
                    </strong>
                    <p>{exercise.explanation}</p>
                    {!correct && (
                      <p>
                        Expected:{' '}
                        <span lang="es">{exercise.answers.join(' / ')}</span>
                      </p>
                    )}
                  </output>
                  <div className={styles.actions}>
                    <Button
                      ref={nextButton}
                      className={styles.primary}
                      onClick={() => {
                        if (position + 1 < lesson.exercises.length) {
                          setPosition(position + 1);
                          setAnswer('');
                        } else setStage('write');
                      }}
                    >
                      {position + 1 < lesson.exercises.length
                        ? 'Next question'
                        : 'Write your own'}{' '}
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
          {stage === 'write' && (
            <>
              <h2 ref={heading} tabIndex={-1}>
                Use it in your own words
              </h2>
              <p className={styles.prose}>{lesson.production.prompt}</p>
              <div className={styles.answerInput}>
                <label htmlFor="grammar-writing">Your Spanish</label>
                <Textarea
                  id="grammar-writing"
                  lang="es"
                  value={writing}
                  maxLength={4000}
                  onChange={(event) => setWriting(event.target.value)}
                  rows={6}
                />
                <span>{writing.length}/4,000 characters</span>
              </div>
              <fieldset className={styles.checklist}>
                <legend>Review your writing</legend>
                {lesson.production.checklist.map((item, index) => (
                  <label key={item}>
                    <input
                      type="checkbox"
                      checked={selfReview[index]}
                      onChange={(event) =>
                        setSelfReview((current) =>
                          current.map((value, i) =>
                            i === index ? event.target.checked : value,
                          ),
                        )
                      }
                    />
                    {item}
                  </label>
                ))}
              </fieldset>
              <p className={styles.visitNote}>
                These checks are your self-review. Your writing is not
                automatically graded.
              </p>
              <div className={styles.actions}>
                <Button
                  className={styles.primary}
                  disabled={!writing.trim()}
                  onClick={() => setStage('result')}
                >
                  Review practice <ArrowRight size={16} />
                </Button>
              </div>
            </>
          )}
          {stage === 'result' && (
            <>
              <h2 ref={heading} tabIndex={-1}>
                Your practice evidence
              </h2>
              <div className={styles.evidenceGrid}>
                {Object.entries(scores).map(([kind, score]) => (
                  <div key={kind}>
                    <strong>
                      {score.correct}/{score.total}
                    </strong>
                    <span>
                      {EVIDENCE_LABELS[kind as keyof typeof EVIDENCE_LABELS]}
                    </span>
                  </div>
                ))}
                <div>
                  <strong>Written</strong>
                  <span>Self-review only · not graded</span>
                </div>
              </div>
              <p className={styles.visitNote}>
                These results describe this practice attempt. Independent
                accuracy and later retention have not been assessed.
              </p>
              <div className={styles.answerReview}>
                {lesson.exercises.map((item) => (
                  <div key={item.id}>
                    <h3>{item.prompt}</h3>
                    <p>
                      Your answer: <span lang="es">{answers[item.id]}</span> ·{' '}
                      {checkGrammarAnswer(item, answers[item.id])
                        ? 'Correct for this task'
                        : 'Review'}
                    </p>
                    <p>{item.explanation}</p>
                  </div>
                ))}
              </div>
              <h3>Your writing</h3>
              <p className={styles.writing} lang="es">
                {writing}
              </p>
              <Button
                variant="outline"
                className={styles.secondary}
                onClick={() => setShowModel(!showModel)}
                aria-expanded={showModel}
              >
                {showModel
                  ? 'Hide example'
                  : 'Compare with one possible response'}
              </Button>
              {showModel && (
                <div className={styles.ruleExample}>
                  <p lang="es">{lesson.production.example}</p>
                  <p>
                    Your answer can differ. Use the checklist to review its
                    meaning and form.
                  </p>
                </div>
              )}
              <div className={styles.actions}>
                <Button
                  className={styles.primary}
                  disabled={saveState === 'saving' || saveState === 'saved'}
                  onClick={save}
                >
                  {saveState === 'saving'
                    ? 'Saving…'
                    : saveState === 'saved'
                      ? 'Saved to your account'
                      : saveState === 'error'
                        ? 'Try saving again'
                        : 'Save practice'}
                </Button>
                {saveState === 'idle' && (
                  <Button
                    className={styles.secondary}
                    variant="outline"
                    onClick={() => setStage('write')}
                  >
                    Edit writing
                  </Button>
                )}
                {saveState === 'saved' && (
                  <Button
                    variant="outline"
                    className={styles.secondary}
                    onClick={onBack}
                  >
                    Return to curriculum
                  </Button>
                )}
              </div>
              <output className={styles.visitNote}>
                {saveState === 'saved'
                  ? 'Saved. You can return to this evidence from the curriculum.'
                  : saveState === 'error'
                    ? saveError
                    : saveState === 'saving'
                      ? 'Saving your practice…'
                      : 'Not saved yet.'}
              </output>
              {saveState !== 'saving' && (
                <Button
                  variant="ghost"
                  className={styles.back}
                  onClick={() => {
                    setStage('learn');
                    setPosition(0);
                    setAnswer('');
                    setAnswers({});
                    setWriting('');
                    setSelfReview(lesson.production.checklist.map(() => false));
                    setShowModel(false);
                    setSaveState('idle');
                    submission.current = null;
                  }}
                >
                  <RotateCcw size={16} /> Practice this rule again
                </Button>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
