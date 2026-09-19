'use client';
/* oxlint-disable next/no-html-link-for-pages */
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react';
import { useLearnerProfile } from './learner-profile-provider';
import { PracticeTimeTracker } from './practice-time-tracker';
import {
  assessmentQueue,
  type AssessmentScope,
  type AssessmentCatalog,
  type AssessmentChallenge,
  type AssessmentResult,
} from '@/lib/vocabulary-assessment';
import styles from './vocabulary-assessment.module.css';

export function VocabularyAssessment(props: {
  scope: AssessmentScope;
  targetId?: string;
  recentlyStudied?: boolean;
  onExit?: () => void;
}) {
  const { userId, profile } = useLearnerProfile();
  return (
    <AssessmentSession
      key={`${userId}:${profile.proficiencyLevel}:${JSON.stringify(props.scope)}:${props.targetId ?? ''}`}
      {...props}
    />
  );
}
function AssessmentSession({
  scope,
  targetId,
  recentlyStudied = false,
  onExit,
}: {
  scope: AssessmentScope;
  targetId?: string;
  recentlyStudied?: boolean;
  onExit?: () => void;
}) {
  const [catalog, setCatalog] = useState<AssessmentCatalog | null>(null);
  const [reload, setReload] = useState(0);
  const [now] = useState(() => Date.now());
  const queryString = scope.themeId
    ? `themeId=${encodeURIComponent(scope.themeId)}`
    : `listId=${encodeURIComponent(scope.listId!)}`;
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(Boolean(targetId));
  const [challenge, setChallenge] = useState<AssessmentChallenge | null>(null);
  const [stage, setStage] = useState<'overview' | 'recall' | 'use' | 'result'>(
    'overview',
  );
  const [recall, setRecall] = useState('');
  const [use, setUse] = useState('');
  const [assisted, setAssisted] = useState(recentlyStudied);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const action = useRef<AbortController | null>(null);
  const pending = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [stage]);
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(
          `/api/vocabulary/assessment?${queryString}`,
          {
            cache: 'no-store',
            signal: controller.signal,
          },
        );
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

        const requestScope = Object.fromEntries(
          new URLSearchParams(queryString),
        );
        const startResponse = await fetch('/api/vocabulary/assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'start',
            ...requestScope,
            targetId,
            assisted: recentlyStudied,
          }),
          signal: controller.signal,
        });
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
        setUse('');
        setResult(null);
        setAssisted(recentlyStudied);
        setStage('recall');
      } catch (failure) {
        if (!controller.signal.aborted)
          setError(
            failure instanceof Error
              ? failure.message
              : 'Your assessments could not be loaded.',
          );
      } finally {
        if (targetId && !controller.signal.aborted) setBusy(false);
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
      setUse('');
      setResult(null);
      setAssisted(recentlyStudied);
      setStage('recall');
    });
  }
  function submit(useAnswer: string) {
    if (!challenge) return;
    void run(async () => {
      const data = await post({
        action: 'submit',
        token: challenge.token,
        recallAnswer: recall,
        useAnswer,
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
    result?.status === 'known'
      ? 'Known'
      : result?.status === 'needs_practice'
        ? 'Needs practice'
        : 'Not assessed';
  return (
    <section className={styles.panel} aria-busy={busy}>
      <PracticeTimeTracker
        active={!!challenge && !busy && (stage === 'recall' || stage === 'use')}
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
          {targetId ? '1 expression · 2 steps' : 'Vocabulary assessment'}
        </span>
      </div>
      {error && (
        <div className={styles.error} role="alert">
          <p>{error}</p>
          {(!catalog || targetId) && (
            <button
              onClick={() => {
                setError('');
                if (targetId) setBusy(true);
                setReload((value) => value + 1);
              }}
            >
              Try again
            </button>
          )}
        </div>
      )}
      {!catalog && !error && <output>Loading assessments…</output>}
      {targetId && stage === 'overview' && !error && (
        <output>Preparing expression check…</output>
      )}
      {stage === 'overview' && catalog && !targetId && (
        <>
          <h1 ref={heading} tabIndex={-1}>
            {catalog.title}
          </h1>
          <p>
            Recall an expression, then use it in a new situation. Both answers
            are checked before your result is saved.
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
      {(stage === 'recall' || stage === 'use') && challenge && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (stage === 'recall') setStage('use');
            else submit(use);
          }}
        >
          <div
            className={styles.steps}
            aria-label={`Step ${stage === 'recall' ? 1 : 2} of 2`}
          >
            <span className={stage === 'recall' ? styles.active : ''}>
              1 · Recall
            </span>
            <span className={stage === 'use' ? styles.active : ''}>
              2 · Use
            </span>
          </div>
          <h1 ref={heading} tabIndex={-1}>
            {stage === 'recall'
              ? 'How would you say this?'
              : 'Use it in context'}
          </h1>
          <p className={styles.prompt}>
            {stage === 'recall' ? challenge.recallPrompt : challenge.usePrompt}
          </p>
          <label htmlFor="assessment-answer">Your answer in Spanish</label>
          <textarea
            key={stage}
            id="assessment-answer"
            value={stage === 'recall' ? recall : use}
            onChange={(event) =>
              stage === 'recall'
                ? setRecall(event.target.value)
                : setUse(event.target.value)
            }
            maxLength={800}
            rows={4}
            disabled={busy}
            autoComplete="off"
            spellCheck={false}
            autoCapitalize="sentences"
          />
          <p className={styles.note}>
            Equivalent Spanish expressions and regional variants are accepted.
            Feedback appears after both answers.
          </p>
          {stage === 'use' &&
            (recentlyStudied ? (
              <p className={styles.help}>
                You just learned this expression. This check will be saved as
                assisted practice; a later independent review can mark it Known.
              </p>
            ) : (
              <label className={styles.help}>
                <input
                  type="checkbox"
                  checked={assisted}
                  onChange={(event) => setAssisted(event.target.checked)}
                  disabled={busy}
                />
                I used help or just reviewed the answer. Save this as practice.
              </label>
            ))}
          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.primary}
              disabled={busy || !(stage === 'recall' ? recall : use).trim()}
            >
              {busy
                ? 'Checking and saving…'
                : stage === 'recall'
                  ? 'Continue'
                  : 'Check answers'}
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (stage === 'recall') {
                  setRecall('');
                  setStage('use');
                } else {
                  setUse('');
                  submit('');
                }
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
            {assisted ? 'Saved practice' : 'Saved result'} · AI-assessed
          </span>
          <h1 ref={heading} tabIndex={-1}>
            {statusLabel}
          </h1>
          <p>
            {result.disputed
              ? 'You challenged this result. It no longer contributes to your knowledge or practice-gap counts. Take a fresh check to reassess it.'
              : assisted
                ? 'This immediate check was saved as assisted practice. A later independent review can establish Known.'
                : result.status === 'not_assessed'
                  ? 'This check did not establish an independent result. Assisted practice and uncertain answers are excluded from Known and Needs practice.'
                  : result.status === 'known'
                    ? result.retained
                      ? 'You demonstrated recall and use again after a delay.'
                      : 'You demonstrated recall and use in this check. A later review will check retention.'
                    : 'This check identified a vocabulary gap. Review the feedback, then try a fresh check.'}
          </p>
          {(['recall', 'use'] as const).map((kind) => (
            <div key={kind} className={styles.feedback}>
              <h2>
                {kind === 'recall' ? 'Recall' : 'Use in context'} ·{' '}
                {result[kind].verdict === 'correct'
                  ? 'Correct'
                  : result[kind].verdict === 'incorrect'
                    ? 'Needs practice'
                    : 'Needs another check'}
              </h2>
              <p>
                {kind === 'recall' ? result.recallPrompt : result.usePrompt}
              </p>
              <blockquote>
                {(kind === 'recall' ? result.recallAnswer : result.useAnswer) ||
                  'I don’t know'}
              </blockquote>
              <p>{result[kind].explanation}</p>
              <p>
                <strong>Example:</strong> {result[kind].example}
              </p>
            </div>
          ))}
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
