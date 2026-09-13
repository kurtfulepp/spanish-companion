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
  scoreExercises,
  startingScores,
  type GrammarEvidence,
  type GrammarSubmission,
} from '@/lib/grammar-evidence';
import { PAST_PRACTICE } from '@/lib/grammar-past-content';
import styles from '@/app/grammar/grammar.module.css';

export function GrammarRuleLesson({
  lesson,
  previous,
  previewOnly = false,
  mode = 'lesson',
  backLabel = 'Back to curriculum',
  onBack,
  onSaved,
}: {
  lesson: RuleLesson;
  previous?: GrammarEvidence;
  previewOnly?: boolean;
  mode?: 'lesson' | 'revisit';
  backLabel?: string;
  onBack: () => void;
  onSaved: (attempt: GrammarEvidence) => void;
}) {
  const extra = PAST_PRACTICE[lesson.id];
  const review = mode === 'revisit' && !!extra && !previewOnly;
  const firstStage = previewOnly
    ? 'learn'
    : review
      ? 'practice'
      : extra
        ? 'check'
        : 'learn';
  const [stage, setStage] = useState<
    'check' | 'notice' | 'learn' | 'practice' | 'write' | 'result'
  >(firstStage);
  const practice = review ? extra.revisit : lesson.exercises;
  const questions = stage === 'check' && extra ? extra.check : practice;
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
  const exercise = questions[position] ?? questions[0];
  const checked = Object.hasOwn(answers, exercise.id);
  const correct = checkGrammarAnswer(exercise, answers[exercise.id] ?? '');
  const scores = scoreRule(lesson, answers);
  useEffect(() => {
    heading.current?.focus();
  }, [stage, position]);
  useEffect(() => {
    if (checked && (stage === 'practice' || stage === 'check'))
      nextButton.current?.focus();
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
        <ArrowLeft size={16} /> {backLabel}
      </Button>
      <section className={styles.lesson}>
        <header className={styles.lessonHeader}>
          <p className={styles.category}>
            {lesson.level} · {lesson.moduleId} ·{' '}
            {previewOnly
              ? 'Curriculum preview'
              : review
                ? 'Review set'
                : 'Rule lesson'}
          </p>
          <h1>{lesson.title}</h1>
          <p>{lesson.objective}</p>
          <ol className={styles.steps} aria-label="Lesson steps">
            {(previewOnly
              ? ['learn']
              : review
                ? ['practice', 'write', 'result']
                : extra
                  ? ['check', 'notice', 'learn', 'practice', 'write', 'result']
                  : ['learn', 'practice', 'write', 'result']
            ).map((step, index) => (
              <li key={step} aria-current={stage === step ? 'step' : undefined}>
                <span>{index + 1}</span>
                {
                  {
                    check: 'Check',
                    notice: 'Notice',
                    learn: 'Learn',
                    practice: 'Practice',
                    write: 'Write',
                    result: 'Review',
                  }[step]
                }
              </li>
            ))}
          </ol>
        </header>
        <div className={styles.lessonBody}>
          {stage === 'notice' && extra && (
            <>
              <h2 ref={heading} tabIndex={-1}>
                Your starting point
              </h2>
              <p className={styles.prose}>
                This short check guides today’s practice. It is not placement or
                a mastery assessment.
              </p>
              <div className={styles.evidenceGrid}>
                {Object.entries(scoreExercises(extra.check, answers))
                  .filter(([, score]) => score.total > 0)
                  .map(([kind, score]) => (
                    <div key={kind}>
                      <strong>
                        {score.correct}/{score.total}
                      </strong>
                      <span>
                        {EVIDENCE_LABELS[kind as keyof typeof EVIDENCE_LABELS]}
                      </span>
                    </div>
                  ))}
              </div>
              <p className={styles.prose}>
                {extra.check.some(
                  (item) => !checkGrammarAnswer(item, answers[item.id] ?? ''),
                )
                  ? 'Work through the contrast and explanation, then practise the forms and meaning separately.'
                  : 'Continue with the contrast, then check whether you can use the rule in new sentences.'}
              </p>
              <h3>Notice what changes</h3>
              <div className={styles.ruleExample}>
                <p lang="es">{extra.notice.first}</p>
                <p lang="es">{extra.notice.second}</p>
              </div>
              <p className={styles.prose}>{extra.notice.explanation}</p>
              <Button
                className={styles.primary}
                onClick={() => setStage('learn')}
              >
                Read the rule <ArrowRight size={16} />
              </Button>
            </>
          )}
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
                  <span>{practice.length} checks, then your own writing</span>
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
          {(stage === 'practice' || stage === 'check') && (
            <>
              <p className={styles.practiceMeta}>
                {stage === 'check'
                  ? 'Starting check · '
                  : review
                    ? 'Review set · '
                    : ''}
                {EVIDENCE_LABELS[exercise.kind]} · {position + 1} of{' '}
                {questions.length}
              </p>
              <h2 ref={heading} tabIndex={-1}>
                {exercise.instruction}
              </h2>
              {stage === 'check' && (
                <p className={styles.visitNote}>
                  Try this before reading the rule. Your first answer stays
                  recorded.
                </p>
              )}
              {review && (
                <p className={styles.visitNote}>
                  These questions differ from the lesson set. Repeating this
                  review set is further practice; it does not establish
                  retention.
                </p>
              )}
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
                        if (position + 1 < questions.length) {
                          setPosition(position + 1);
                          setAnswer('');
                        } else {
                          setPosition(0);
                          setAnswer('');
                          setStage(stage === 'check' ? 'notice' : 'write');
                        }
                      }}
                    >
                      {position + 1 < questions.length
                        ? 'Next question'
                        : stage === 'check'
                          ? 'See starting point'
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
              <p className={styles.prose}>
                {review ? extra.writingPrompt : lesson.production.prompt}
              </p>
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
              <p className={styles.prose}>
                {review ? 'Review set results' : 'Main practice results'}. First
                answers remain recorded after feedback.
              </p>
              {startingScores(lesson, answers) && (
                <p className={styles.visitNote}>
                  Starting check (separate):{' '}
                  {Object.entries(startingScores(lesson, answers)!)
                    .filter(([, score]) => score.total > 0)
                    .map(
                      ([kind, score]) =>
                        `${EVIDENCE_LABELS[kind as keyof typeof EVIDENCE_LABELS]} ${score.correct}/${score.total}`,
                    )
                    .join(' · ')}
                </p>
              )}
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
                {practice.map((item) => (
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
                    {backLabel}
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
                    setStage(firstStage);
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
