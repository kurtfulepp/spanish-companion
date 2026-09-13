'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CEFR_LEVELS, type CEFRLevel } from '@/lib/cefr';
import { EVIDENCE_LABELS } from '@/lib/grammar-rules';
import type { GrammarEvidence } from '@/lib/grammar-evidence';
import {
  latestPathEvidence,
  PAST_PATH,
  pathRecommendation,
  REVIEW_INTERVAL_MS,
} from '@/lib/grammar-learning-path';
import styles from '@/app/grammar/grammar.module.css';

export function GrammarLearningPath({
  level,
  attempts,
  progressState,
  onOpen,
  focusOnReturn,
}: {
  level: CEFRLevel;
  attempts: GrammarEvidence[];
  progressState: 'loading' | 'ready' | 'error';
  onOpen: (ruleId: string, mode: 'lesson' | 'revisit') => void;
  focusOnReturn: boolean;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [now] = useState(() => Date.now());
  useEffect(() => {
    if (focusOnReturn) heading.current?.focus();
  }, [focusOnReturn]);
  const suggestion =
    progressState === 'ready' ? pathRecommendation(level, attempts, now) : null;
  return (
    <section className={styles.learningPath} aria-labelledby="past-path-title">
      <p className={styles.category}>Connected practice · 7 lessons · A1–B2</p>
      <h2 id="past-path-title" ref={heading} tabIndex={-1}>
        Tell a story in the past
      </h2>
      <p>
        Work from verb forms to a clear timeline. Your profile is {level};
        earlier steps are review and later steps are curriculum previews.
      </p>
      {suggestion ? (
        <div className={styles.pathSuggestion}>
          <div>
            <h3>Suggested next: {suggestion.rule.title}</h3>
            <p>{suggestion.reason}</p>
          </div>
          <Button
            className={styles.primary}
            onClick={() => onOpen(suggestion.rule.id, suggestion.mode)}
          >
            {suggestion.mode === 'revisit' ? 'Start review' : 'Open lesson'}{' '}
            <ArrowRight size={16} />
          </Button>
        </div>
      ) : (
        <p className={styles.visitNote}>
          {progressState === 'loading'
            ? 'Loading saved evidence to suggest a starting point…'
            : progressState === 'error'
              ? 'Saved evidence is unavailable. You can still choose any eligible lesson.'
              : 'You have saved practice for each eligible step. Choose a review below or explore another curriculum topic. This does not establish mastery.'}
        </p>
      )}
      <details className={styles.pathDetails}>
        <summary>Explore all 7 steps</summary>
        <ol className={styles.pathList}>
          {PAST_PATH.map((rule, index) => {
            const preview =
              CEFR_LEVELS.indexOf(rule.level) > CEFR_LEVELS.indexOf(level);
            const saved = latestPathEvidence(rule.id, attempts);
            const due =
              saved && now - Date.parse(saved.savedAt) >= REVIEW_INTERVAL_MS;
            return (
              <li key={rule.id}>
                <span className={styles.pathNumber} aria-hidden="true">
                  {index + 1}
                </span>
                <div className={styles.pathDescription}>
                  <p className={styles.category}>
                    {rule.level} ·{' '}
                    {preview
                      ? 'Curriculum preview'
                      : rule.level === level
                        ? 'Your level'
                        : 'Review'}
                  </p>
                  <h3>{rule.title}</h3>
                  <p>{rule.objective}</p>
                  {index > 0 && (
                    <p className={styles.visitNote}>
                      Previous step: {PAST_PATH[index - 1].title.toLowerCase()}.
                    </p>
                  )}
                  {saved && !preview && (
                    <p className={styles.visitNote}>
                      Saved {saved.mode === 'revisit' ? 'review' : 'practice'}:{' '}
                      {Object.entries(saved.scores)
                        .filter(([, score]) => score.total > 0)
                        .map(
                          ([kind, score]) =>
                            `${EVIDENCE_LABELS[kind as keyof typeof EVIDENCE_LABELS]} ${score.correct}/${score.total}`,
                        )
                        .join(' · ')}
                      . Writing: ungraded.{due ? ' Review suggested.' : ''}
                    </p>
                  )}
                </div>
                <div className={styles.pathActions}>
                  <Button
                    variant="outline"
                    className={styles.secondary}
                    onClick={() => onOpen(rule.id, 'lesson')}
                    aria-label={`${preview ? 'Preview' : 'Open'} ${rule.title}`}
                  >
                    {preview
                      ? 'Preview rule'
                      : saved
                        ? 'Practise again'
                        : 'Open lesson'}
                  </Button>
                  {saved && !preview && (
                    <Button
                      variant="ghost"
                      className={styles.back}
                      onClick={() => onOpen(rule.id, 'revisit')}
                      aria-label={`Review ${rule.title}`}
                    >
                      Review set
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </details>
      <p className={styles.visitNote}>
        The order is guidance; you can choose any eligible step. Reviews are
        suggested after three days, a scheduling choice rather than a validated
        retention threshold. Lesson drafts await independent teacher review.
      </p>
    </section>
  );
}
