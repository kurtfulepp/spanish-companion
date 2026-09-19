'use client';
/* oxlint-disable next/no-html-link-for-pages */
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react';
import { useLearnerProfile } from './learner-profile-provider';
import { PracticeTimeTracker } from './practice-time-tracker';
import { AnswerDifference } from './answer-difference';
import {
  assessmentQueue,
  type AssessmentScope,
  type AssessmentCatalog,
  type AssessmentChallenge,
  type AssessmentResult,
} from '@/lib/vocabulary-assessment';
import {
  actionableCorrection,
  directFeedback,
  feedbackVerdictLabel,
  feedbackVisualState,
  isPassingFeedbackVerdict,
  personalizeFeedback,
} from '@/lib/feedback-language';
import styles from './vocabulary-assessment.module.css';

export function VocabularyAssessment(props: {
  scope: AssessmentScope;
  targetId?: string;
  recentlyStudied?: boolean;
  initialPrompt?: string;
  onExit?: () => void;
}) {
  const { userId, profile } = useLearnerProfile();
  return (
    <AssessmentSession
      key={`${userId}:${profile.proficiencyLevel}:${JSON.stringify(props.scope)}:${props.targetId ?? ''}`}
      {...props}
      displayName={profile.displayName}
    />
  );
}
function AssessmentSession({
  scope,
  targetId,
  recentlyStudied = false,
  initialPrompt,
  onExit,
  displayName,
}: {
  scope: AssessmentScope;
  targetId?: string;
  recentlyStudied?: boolean;
  initialPrompt?: string;
  onExit?: () => void;
  displayName?: string | null;
}) {
  const [catalog, setCatalog] = useState<AssessmentCatalog | null>(null);
  const [reload, setReload] = useState(0);
  const [now] = useState(() => Date.now());
  const queryString = scope.themeId
    ? `themeId=${encodeURIComponent(scope.themeId)}`
    : `listId=${encodeURIComponent(scope.listId!)}`;
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [preparing, setPreparing] = useState(Boolean(targetId));
  const [challenge, setChallenge] = useState<AssessmentChallenge | null>(null);
  const [stage, setStage] = useState<'overview' | 'answer' | 'result'>(
    recentlyStudied && initialPrompt ? 'answer' : 'overview',
  );
  const [recall, setRecall] = useState('');
  const [assisted, setAssisted] = useState(recentlyStudied);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const action = useRef<AbortController | null>(null);
  const pending = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const answerField = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [stage]);
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const catalogRequest = fetch(
          `/api/vocabulary/assessment?${queryString}`,
          {
            cache: 'no-store',
            signal: controller.signal,
          },
        );
        const requestScope = Object.fromEntries(
          new URLSearchParams(queryString),
        );
        const startRequest = targetId
          ? fetch('/api/vocabulary/assessment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'start',
                ...requestScope,
                targetId,
                assisted: recentlyStudied,
              }),
              signal: controller.signal,
            })
          : null;
        const [response, startResponse] = await Promise.all([
          catalogRequest,
          startRequest,
        ]);
        const data = (await response.json()) as AssessmentCatalog & {
          error?: string;
        };
        if (!response.ok)
          throw new Error(
            data.error || 'Your assessments could not be loaded.',
          );
        if (controller.signal.aborted) return;
        setCatalog(data);

        if (!targetId) return;
        if (!data.available)
          throw new Error('Answer evaluation is not configured yet.');
        if (!data.items.some((item) => item.id === targetId))
          throw new Error(
            'This expression is unavailable at your current level.',
          );

        if (!startResponse)
          throw new Error('The expression check could not be prepared.');
        const startData = (await startResponse.json()) as {
          error?: string;
          challenge?: AssessmentChallenge;
        };
        if (!startResponse.ok)
          throw new Error(
            startData.error || 'The expression check could not be prepared.',
          );
        if (!startData.challenge)
          throw new Error('The expression check could not be prepared.');
        if (controller.signal.aborted) return;
        setChallenge(startData.challenge);
        setRecall('');
        setResult(null);
        setAssisted(recentlyStudied);
        setStage('answer');
      } catch (failure) {
        if (!controller.signal.aborted)
          setError(
            failure instanceof Error
              ? failure.message
              : 'Your assessments could not be loaded.',
          );
      } finally {
        if (targetId && !controller.signal.aborted) setPreparing(false);
      }
    })();
    return () => {
      controller.abort();
      action.current?.abort();
    };
  }, [queryString, recentlyStudied, reload, targetId]);
  async function post(body: object) {
    const controller = new AbortController();
    action.current = controller;
    const response = await fetch('/api/vocabulary/assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = (await response.json()) as {
      error?: string;
      challenge?: AssessmentChallenge;
      result?: AssessmentResult;
    };
    if (!response.ok)
      throw new Error(data.error || 'The assessment could not be completed.');
    return data;
  }
  async function run(task: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      await task();
    } catch (failure) {
      if (!action.current?.signal.aborted)
        setError(failure instanceof Error ? failure.message : 'Try again.');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  function start(id: string) {
    void run(async () => {
      const data = await post({
        action: 'start',
        ...scope,
        targetId: id,
        assisted: false,
      });
      if (!data.challenge) throw new Error('A check could not be prepared.');
      setChallenge(data.challenge);
      setRecall('');
      setResult(null);
      setAssisted(false);
      setStage('answer');
    });
  }
  function submit(answer: string) {
    if (!challenge) return;
    void run(async () => {
      const data = await post({
        action: 'submit',
        token: challenge.token,
        answer,
        assisted,
      });
      if (!data.result)
        throw new Error('The saved result could not be confirmed.');
      const saved = data.result;
      setResult(saved);
      setStage('result');
      setCatalog(
        (current) =>
          current && {
            ...current,
            items: current.items.map((item) =>
              item.key === saved.targetKey
                ? { ...item, status: saved.status, latest: saved }
                : item,
            ),
          },
      );
    });
  }
  function insertCharacter(character: string) {
    const field = answerField.current;
    const start = field?.selectionStart ?? recall.length;
    const end = field?.selectionEnd ?? start;
    setRecall(`${recall.slice(0, start)}${character}${recall.slice(end)}`);
    requestAnimationFrame(() => {
      answerField.current?.focus();
      answerField.current?.setSelectionRange(
        start + character.length,
        start + character.length,
      );
    });
  }
  const known =
    catalog?.items.filter((item) => item.status === 'known').length ?? 0;
  const needs =
    catalog?.items.filter((item) => item.status === 'needs_practice').length ??
    0;
  const ready =
    catalog?.items.filter((item) => item.status === 'not_assessed').length ?? 0;
  const next = catalog
    ? (assessmentQueue(catalog.items, now).find(
        (item) => item.id === targetId,
      ) ?? assessmentQueue(catalog.items, now)[0])
    : null;
  const statusLabel =
    result?.mode === 'practice'
      ? result.recall.verdict === 'correct'
        ? 'Practice complete'
        : result.recall.verdict === 'correct_with_fix'
          ? 'Correct — small fix'
          : result.recall.verdict === 'incorrect'
            ? 'Needs practice'
            : 'Review needed'
      : result?.status === 'known'
        ? 'Known'
        : result?.status === 'needs_practice'
          ? 'Needs practice'
          : 'Not assessed';
  return (
    <section className={styles.panel} aria-busy={busy || preparing}>
      <PracticeTimeTracker
        active={stage === 'answer' && !busy}
        area="vocabulary"
      />
      <div className={styles.top}>
        {onExit ? (
          <button onClick={onExit} disabled={busy}>
            <ArrowLeft size={16} />
            {targetId ? 'Back to session' : 'Back to vocabulary'}
          </button>
        ) : (
          <a href="/vocabulary">All vocabulary</a>
        )}
        <span>
          {catalog?.level} ·{' '}
          {targetId ? '1 expression · 1 response' : 'Vocabulary assessment'}
        </span>
      </div>
      {error && (
        <div className={styles.error} role="alert">
          <p>{error}</p>
          {(!catalog || targetId) && (
            <button
              onClick={() => {
                setError('');
                if (targetId) setPreparing(true);
                setReload((value) => value + 1);
              }}
            >
              Try again
            </button>
          )}
        </div>
      )}
      {!catalog && !error && stage === 'overview' && (
        <output>Loading assessments…</output>
      )}
      {targetId && stage === 'overview' && !error && (
        <output>Preparing expression check…</output>
      )}
      {stage === 'overview' && catalog && !targetId && (
        <>
          <h1 ref={heading} tabIndex={-1}>
            {catalog.title}
          </h1>
          <p>
            Respond once to a fresh situation. Meaning, Spanish form, and use in
            context are checked separately before the result is saved.
          </p>
          <div className={styles.counts}>
            <div>
              <strong>{known}</strong>Known
            </div>
            <div>
              <strong>{needs}</strong>Needs practice
            </div>
            <div>
              <strong>{ready}</strong>Not assessed
            </div>
          </div>
          <p className={styles.note}>
            AI-assessed, with results you can challenge. Known describes this
            vocabulary check; it does not certify fluency or mastery. Earlier
            self-ratings are preserved separately.
          </p>
          {next ? (
            <button
              className={styles.primary}
              disabled={busy || !catalog.available}
              onClick={() => start(next.id)}
            >
              {busy
                ? 'Preparing your check…'
                : targetId
                  ? 'Check this expression'
                  : 'Start assessment'}
              <ArrowRight size={18} />
            </button>
          ) : (
            <p>No expressions are available at your level yet.</p>
          )}
          {!catalog.available && (
            <p>Answer evaluation is not configured yet.</p>
          )}
          <details className={styles.history}>
            <summary>Expressions and saved results</summary>
            {catalog.items.map((item) => (
              <div key={item.key} className={styles.historyRow}>
                <span>
                  <strong>{item.english}</strong>
                  <small>
                    {item.status === 'known'
                      ? 'Known'
                      : item.status === 'needs_practice'
                        ? 'Needs practice'
                        : 'Not assessed'}
                    {item.latest?.disputed ? ' · Result challenged' : ''}
                    {item.latest?.status === 'known' &&
                    Date.parse(item.latest.reviewAt) <= now
                      ? ' · Due for review'
                      : ''}
                  </small>
                </span>
                <button
                  disabled={busy}
                  onClick={() =>
                    item.latest
                      ? (setResult(item.latest), setStage('result'))
                      : start(item.id)
                  }
                >
                  {item.latest ? 'View result' : 'Assess'}
                </button>
              </div>
            ))}
          </details>
        </>
      )}
      {stage === 'answer' && (challenge || initialPrompt) && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit(recall);
          }}
        >
          <div className={styles.steps} aria-label="One response">
            <span className={styles.active}>
              {recentlyStudied ? 'Practice recall' : 'Independent check'}
            </span>
          </div>
          <h1 ref={heading} tabIndex={-1}>
            {recentlyStudied ? 'How would you say this?' : 'Respond in Spanish'}
          </h1>
          <p className={styles.prompt}>
            {challenge?.mode === 'check'
              ? challenge.usePrompt
              : challenge?.recallPrompt || initialPrompt}
          </p>
          <label htmlFor="assessment-answer">Your answer in Spanish</label>
          <textarea
            ref={answerField}
            id="assessment-answer"
            value={recall}
            onChange={(event) => setRecall(event.target.value)}
            maxLength={800}
            rows={4}
            disabled={busy}
            autoComplete="off"
            spellCheck={false}
            autoCapitalize="sentences"
          />
          <div className={styles.accentKeys} aria-label="Spanish characters">
            {['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ', '¿', '¡'].map((character) => (
              <button
                key={character}
                type="button"
                onClick={() => insertCharacter(character)}
                disabled={busy}
                aria-label={`Insert ${character}`}
              >
                {character}
              </button>
            ))}
          </div>
          <p className={styles.note}>
            Equivalent Spanish expressions and regional variants are accepted.
            Meaning, spelling, and use are reviewed separately.
          </p>
          {recentlyStudied ? (
            <p className={styles.help}>
              This is assisted practice. A later independent check can mark the
              expression Known.
            </p>
          ) : (
            <label className={styles.help}>
              <input
                type="checkbox"
                checked={assisted}
                onChange={(event) => setAssisted(event.target.checked)}
                disabled={busy}
              />
              I used help. Save this as practice instead of an independent
              result.
            </label>
          )}
          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.primary}
              disabled={busy || preparing || !challenge || !recall.trim()}
            >
              {busy
                ? 'Checking and saving…'
                : preparing || !challenge
                  ? 'Preparing…'
                  : 'Check answer'}
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              disabled={busy || preparing || !challenge}
              onClick={() => {
                setRecall('');
                submit('');
              }}
            >
              I don’t know
            </button>
          </div>
        </form>
      )}
      {stage === 'result' && result && (
        <>
          <span className={styles.resultLabel}>
            <Check size={17} />
            {result.mode === 'practice' || assisted
              ? 'Saved practice'
              : 'Saved result'}{' '}
            · AI-assessed
          </span>
          <h1 ref={heading} tabIndex={-1}>
            {statusLabel}
          </h1>
          <p>
            {personalizeFeedback(
              result.disputed
                ? 'You challenged this result. It no longer affects your progress counts. Take a fresh check to reassess it.'
                : result.mode === 'practice' || assisted
                  ? 'This was saved as assisted practice. Complete a later independent check to establish Known.'
                  : result.status === 'not_assessed'
                    ? 'This result needs another check. Assisted or uncertain answers do not count as Known or Needs practice.'
                    : result.status === 'known'
                      ? result.recall.verdict === 'correct_with_fix' ||
                        result.use.verdict === 'correct_with_fix'
                        ? 'You conveyed the target clearly. Review the small fix below.'
                        : result.retained
                          ? 'You recalled and used this again after a delay.'
                          : 'You recalled and used this correctly. A later review will check retention.'
                      : 'Review the fixes below, then try a fresh check.',
              displayName,
            )}
          </p>
          {result.mode ? (
            <SingleResponseFeedback result={result} displayName={displayName} />
          ) : (
            (['recall', 'use'] as const).map((kind) => {
              const feedback = result[kind];
              const feedbackLabel =
                feedback.verdict === 'correct'
                  ? 'Why it works'
                  : feedback.verdict === 'incorrect' ||
                      feedback.verdict === 'correct_with_fix'
                    ? 'Fix'
                    : 'Check';
              const exampleLabel =
                feedback.verdict === 'incorrect' ||
                feedback.verdict === 'correct_with_fix'
                  ? 'Use'
                  : feedback.verdict === 'uncertain'
                    ? 'Possible answer'
                    : 'Example';
              return (
                <div
                  key={kind}
                  className={styles.feedback}
                  data-state={feedbackVisualState(feedback.verdict)}
                >
                  <h2>
                    {kind === 'recall' ? 'Recall' : 'Use in context'} ·{' '}
                    {feedbackVerdictLabel(feedback.verdict)}
                  </h2>
                  <p>
                    {kind === 'recall' ? result.recallPrompt : result.usePrompt}
                  </p>
                  <blockquote>
                    {(kind === 'recall'
                      ? result.recallAnswer
                      : result.useAnswer) || 'I don’t know'}
                  </blockquote>
                  <p
                    className={styles.feedbackMessage}
                    data-verdict={feedback.verdict}
                  >
                    <strong>{feedbackLabel}</strong>
                    <span>
                      {personalizeFeedback(
                        feedback.verdict === 'incorrect' ||
                          feedback.verdict === 'correct_with_fix'
                          ? actionableCorrection(feedback.explanation)
                          : directFeedback(feedback.explanation),
                        displayName,
                      )}
                    </span>
                  </p>
                  <p className={styles.feedbackExample}>
                    <strong>{exampleLabel}</strong>
                    <span lang="es">{feedback.example}</span>
                  </p>
                </div>
              );
            })
          )}
          <p className={styles.note}>
            Saved {new Date(result.savedAt).toLocaleDateString()}.{' '}
            {result.status === 'known' &&
              `Review from ${new Date(result.reviewAt).toLocaleDateString()}.`}
          </p>
          <div className={styles.actions}>
            <button
              className={styles.primary}
              onClick={() => {
                if (targetId && onExit) {
                  onExit();
                  return;
                }
                setStage('overview');
                setChallenge(null);
              }}
              disabled={busy}
            >
              {targetId ? 'Return to session' : 'Back to assessments'}
              {targetId ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
            </button>
            {!result.disputed && (
              <button
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    const data = await post({
                      action: 'dispute',
                      id: result.id,
                    });
                    if (!data.result)
                      throw new Error('Your review request was not saved.');
                    const updated = data.result;
                    setResult(updated);
                    setCatalog(
                      (current) =>
                        current && {
                          ...current,
                          items: current.items.map((item) =>
                            item.latest?.id === updated.id
                              ? {
                                  ...item,
                                  status: 'not_assessed',
                                  latest: updated,
                                }
                              : item,
                          ),
                        },
                    );
                  })
                }
              >
                <RotateCcw size={16} />
                My answer may be valid
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function feedbackCopy(feedback: AssessmentResult['recall']) {
  return feedback.verdict === 'incorrect' ||
    feedback.verdict === 'correct_with_fix'
    ? actionableCorrection(feedback.explanation)
    : directFeedback(feedback.explanation);
}

function SingleResponseFeedback({
  result,
  displayName,
}: {
  result: AssessmentResult;
  displayName?: string | null;
}) {
  const practice = result.mode === 'practice';
  const answer = practice ? result.recallAnswer : result.useAnswer;
  const prompt = practice ? result.recallPrompt : result.usePrompt;
  const state =
    result.recall.verdict === 'incorrect' ||
    (!practice && result.use.verdict === 'incorrect')
      ? 'incorrect'
      : isPassingFeedbackVerdict(result.recall.verdict) &&
          (practice || isPassingFeedbackVerdict(result.use.verdict))
        ? 'correct'
        : 'uncertain';
  const smallFix =
    result.recall.verdict === 'correct_with_fix' ||
    (!practice && result.use.verdict === 'correct_with_fix');
  const example = practice ? result.recall.example : result.use.example;

  return (
    <div className={styles.feedback} data-state={state}>
      <h2>
        Answer review ·{' '}
        {state === 'correct'
          ? smallFix
            ? 'Correct — small fix'
            : 'Correct'
          : state === 'incorrect'
            ? 'Needs practice'
            : 'Needs another check'}
      </h2>
      <p>{prompt}</p>
      <blockquote>{answer || 'I don’t know'}</blockquote>
      <AnswerDifference answer={answer} correction={result.recall.example} />
      <FeedbackDimension
        label="Meaning and form"
        feedback={result.recall}
        displayName={displayName}
      />
      {!practice && (
        <FeedbackDimension
          label="Use in context"
          feedback={result.use}
          displayName={displayName}
        />
      )}
      <p className={styles.feedbackExample}>
        <strong>{state === 'incorrect' || smallFix ? 'Use' : 'Example'}</strong>
        <span lang="es">{example}</span>
      </p>
    </div>
  );
}

function FeedbackDimension({
  label,
  feedback,
  displayName,
}: {
  label: string;
  feedback: AssessmentResult['recall'];
  displayName?: string | null;
}) {
  return (
    <div className={styles.dimension} data-verdict={feedback.verdict}>
      <div>
        <strong>{label}</strong>
        <span>{feedbackVerdictLabel(feedback.verdict)}</span>
      </div>
      <p>{personalizeFeedback(feedbackCopy(feedback), displayName)}</p>
    </div>
  );
}
