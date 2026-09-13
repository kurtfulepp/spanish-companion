'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GrammarLearningPath } from '@/components/grammar-learning-path';
import { GrammarRuleLesson } from '@/components/grammar-rule-lesson';
import { GrammarSampleLesson } from '@/components/grammar-sample-lesson';
import { CEFR_LEVELS, type CEFRLevel } from '@/lib/cefr';
import {
  GRAMMAR_MODULES,
  GRAMMAR_SYSTEMS,
} from '@/lib/grammar-curriculum.generated';
import { EVIDENCE_LABELS, GRAMMAR_RULES } from '@/lib/grammar-rules';
import { GRAMMAR_LESSONS } from '@/lib/grammar-lessons';
import type { GrammarEvidence } from '@/lib/grammar-evidence';
import styles from '@/app/grammar/grammar.module.css';

export function GrammarCurriculum({ level }: { level: CEFRLevel }) {
  const [viewLevel, setViewLevel] = useState(level);
  const previewOnly =
    CEFR_LEVELS.indexOf(viewLevel) > CEFR_LEVELS.indexOf(level);
  const [system, setSystem] = useState('all');
  const [query, setQuery] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [lessonMode, setLessonMode] = useState<'lesson' | 'revisit'>('lesson');
  const [fromPath, setFromPath] = useState(false);
  const [returnToPath, setReturnToPath] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<GrammarEvidence[]>([]);
  const [progressState, setProgressState] = useState<
    'loading' | 'ready' | 'error'
  >('loading');
  const [reload, setReload] = useState(0);
  const [sampleResults, setSampleResults] = useState<
    Record<string, { score: number; total: number }>
  >({});
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const returnId = useRef<string | null>(null);
  const catalogHeading = useRef<HTMLHeadingElement>(null);
  const recordSample = useCallback(
    (id: string, result: { score: number; total: number }) =>
      setSampleResults((current) => ({ ...current, [id]: result })),
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/grammar', { signal: controller.signal, cache: 'no-store' })
      .then(async (response) => {
        const result = (await response.json()) as {
          attempts?: GrammarEvidence[];
        };
        if (!response.ok || !Array.isArray(result.attempts))
          throw new Error('Unavailable');
        if (!controller.signal.aborted) {
          setAttempts((current) =>
            [
              ...current,
              ...result.attempts!.filter(
                (item) =>
                  !current.some((saved) => saved.attemptId === item.attemptId),
              ),
            ].sort((a, b) => b.savedAt.localeCompare(a.savedAt)),
          );
          setProgressState('ready');
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setProgressState('error');
      });
    return () => controller.abort();
  }, [reload]);
  useEffect(() => {
    if (!active && returnId.current) {
      const target = triggers.current[returnId.current];
      (target ?? catalogHeading.current)?.focus();
      returnId.current = null;
    }
  }, [active]);
  function back() {
    returnId.current = fromPath ? null : active;
    setReturnToPath(fromPath);
    setFromPath(false);
    setLessonMode('lesson');
    setActive(null);
  }
  function onSaved(attempt: GrammarEvidence) {
    setAttempts((current) => [
      attempt,
      ...current.filter((item) => item.attemptId !== attempt.attemptId),
    ]);
  }
  const rule = GRAMMAR_RULES.find((item) => item.id === active);
  if (rule)
    return (
      <GrammarRuleLesson
        key={`${rule.id}:${lessonMode}`}
        lesson={rule}
        previewOnly={
          CEFR_LEVELS.indexOf(rule.level) > CEFR_LEVELS.indexOf(level)
        }
        mode={lessonMode}
        backLabel={fromPath ? 'Back to learning path' : 'Back to curriculum'}
        previous={attempts.find(
          (item) => item.ruleId === rule.id && item.version === rule.version,
        )}
        onBack={back}
        onSaved={onSaved}
      />
    );
  const sample = GRAMMAR_LESSONS[viewLevel].find((item) => item.id === active);
  if (sample)
    return (
      <GrammarSampleLesson
        key={sample.id}
        lesson={sample}
        level={viewLevel}
        onBack={back}
        onResult={recordSample}
      />
    );

  const levelModules = GRAMMAR_MODULES.filter(
    (item) => item.level === viewLevel,
  );
  const levelRules = GRAMMAR_RULES.filter((item) => item.level === viewLevel);
  const relevantSystems = GRAMMAR_SYSTEMS.filter((item) =>
    levelModules.some((module) => module.systemIds.includes(item.id)),
  );
  const search = query.trim().toLocaleLowerCase();
  const modules = levelModules.filter(
    (module) =>
      (system === 'all' || module.systemIds.includes(system)) &&
      (!availableOnly ||
        levelRules.some((item) => item.moduleId === module.id)) &&
      (!search ||
        `${module.id} ${module.title} ${module.scope} ${module.objective} ${module.whenToUse}`
          .toLocaleLowerCase()
          .includes(search)),
  );
  const practiced = levelRules.filter((item) =>
    attempts.some(
      (attempt) =>
        attempt.ruleId === item.id && attempt.version === item.version,
    ),
  ).length;

  return (
    <div className={styles.content}>
      <section className={`brand-hero ${styles.hero}`}>
        <span
          className="brand-orbit brand-orbit-turquoise"
          aria-hidden="true"
        />
        <span className="brand-orbit brand-orbit-yellow" aria-hidden="true" />
        <div>
          <span className={styles.heroLabel}>{level} grammar</span>
          <h1>Your grammar curriculum</h1>
          <p className={styles.heroDescription}>
            Explore the rules. Practice their form and meaning.
          </p>
        </div>
        <span className={styles.heroCount}>A1–C2 curriculum · 87 modules</span>
      </section>

      <GrammarLearningPath
        level={level}
        attempts={attempts}
        progressState={progressState}
        focusOnReturn={returnToPath}
        onOpen={(ruleId, mode) => {
          setFromPath(true);
          setReturnToPath(false);
          setLessonMode(mode);
          setActive(ruleId);
        }}
      />
      <div className={styles.curriculumLayout}>
        <aside
          className={styles.catalogSidebar}
          aria-label="Curriculum filters"
        >
          <h2>
            <ListFilter size={18} /> Explore grammar
          </h2>
          <label htmlFor="grammar-level">Level</label>
          <select
            id="grammar-level"
            value={viewLevel}
            onChange={(event) => {
              setViewLevel(event.target.value as CEFRLevel);
              setSystem('all');
              setQuery('');
              setAvailableOnly(false);
            }}
          >
            {CEFR_LEVELS.map((item) => (
              <option key={item} value={item}>
                {item}
                {item === level
                  ? ' · Your level'
                  : CEFR_LEVELS.indexOf(item) < CEFR_LEVELS.indexOf(level)
                    ? ' · Review'
                    : ' · Curriculum preview'}
              </option>
            ))}
          </select>
          <p>
            Explore all six levels. Earlier levels are available for practice
            review; higher levels open as curriculum previews. Your profile
            stays at {level}.
          </p>
          <label htmlFor="grammar-system">Grammar type</label>
          <select
            id="grammar-system"
            value={system}
            onChange={(event) => setSystem(event.target.value)}
          >
            <option value="all">All grammar types</option>
            {relevantSystems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          {system !== 'all' && (
            <p>{GRAMMAR_SYSTEMS.find((item) => item.id === system)?.scope}</p>
          )}
          <label htmlFor="grammar-search">Find a rule or topic</label>
          <input
            id="grammar-search"
            type="search"
            placeholder="Try pronouns or past…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <label className={styles.filterCheckbox}>
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(event) => setAvailableOnly(event.target.checked)}
            />{' '}
            With a rule lesson
          </label>
          <div className={styles.catalogNote}>
            <strong>Your saved practice</strong>
            {progressState === 'loading' ? (
              <output>Loading your evidence…</output>
            ) : progressState === 'error' ? (
              <>
                <output>
                  Saved practice is unavailable. You can still open lessons.
                </output>
                <Button
                  variant="outline"
                  className={styles.secondary}
                  onClick={() => {
                    setProgressState('loading');
                    setReload((value) => value + 1);
                  }}
                >
                  Retry loading
                </Button>
              </>
            ) : (
              <p>
                {practiced} of {levelRules.length} available rule lessons
                practiced at {viewLevel}.
              </p>
            )}
            <p>
              Practice is evidence of work done, not a level or mastery award.
            </p>
          </div>
        </aside>

        <div className={styles.catalogMain}>
          <section
            className={styles.featured}
            aria-labelledby="start-rule-heading"
          >
            <div>
              <span className={styles.category}>
                {viewLevel === level
                  ? 'At your level'
                  : previewOnly
                    ? `${viewLevel} curriculum preview`
                    : `${viewLevel} prerequisite review`}
              </span>
              <h2 id="start-rule-heading">{levelRules[0].title}</h2>
              <p>{levelRules[0].objective}</p>
              <span className={styles.lessonMeta}>
                Explanation · 4 checks · Original writing
              </span>
            </div>
            <Button
              ref={(node) => {
                triggers.current[levelRules[0].id] = node;
              }}
              className={styles.primary}
              onClick={() => setActive(levelRules[0].id)}
            >
              {previewOnly ? 'Preview rule lesson' : 'Open rule lesson'}{' '}
              <ArrowRight size={16} />
            </Button>
          </section>

          <section
            className={styles.overview}
            aria-labelledby="grammar-modules-heading"
          >
            <div className={styles.sectionHeading}>
              <div>
                <h2
                  id="grammar-modules-heading"
                  ref={catalogHeading}
                  tabIndex={-1}
                >
                  {viewLevel} curriculum
                </h2>
                <p>
                  {levelModules.length} modules · {levelRules.length} rule{' '}
                  {levelRules.length === 1 ? 'lesson' : 'lessons'} available
                </p>
              </div>
              <output className={styles.visitCount}>
                {modules.length} shown
              </output>
            </div>
            <p className={styles.curriculumIntro}>
              Open a module to see its rules and learning objective. Lesson
              coverage is being built; module outlines describe the full
              intended scope.
            </p>
            <div className={styles.moduleList}>
              {modules.map((module) => {
                const rules = levelRules.filter(
                  (item) => item.moduleId === module.id,
                );
                return (
                  <details className={styles.moduleCard} key={module.id}>
                    <summary>
                      <span className={styles.moduleNumber}>{module.id}</span>
                      <span className={styles.moduleTitle}>
                        {module.title}
                        <span className={styles.moduleUse}>
                          {module.whenToUse}
                        </span>
                      </span>
                      <span className={styles.moduleStatus}>
                        {rules.length
                          ? `${rules.length} rule lesson`
                          : 'Outline'}
                      </span>
                    </summary>
                    <div className={styles.moduleBody}>
                      <h3>Grammar types</h3>
                      <p>
                        {module.systemIds
                          .map(
                            (id) =>
                              GRAMMAR_SYSTEMS.find((item) => item.id === id)!
                                .title,
                          )
                          .join(' · ')}
                      </p>
                      <h3>Rules and types</h3>
                      <ul>
                        {module.scope.split(';').map((scope) => (
                          <li key={scope}>{scope.trim()}</li>
                        ))}
                      </ul>
                      <h3>What you should be able to do</h3>
                      <p>{module.objective}</p>
                      {rules.length ? (
                        rules.map((item) => {
                          const evidence = attempts.find(
                            (attempt) =>
                              attempt.ruleId === item.id &&
                              attempt.version === item.version,
                          );
                          return (
                            <div className={styles.moduleRule} key={item.id}>
                              <h3>{item.title}</h3>
                              <p>{item.objective}</p>
                              <p className={styles.lessonMeta}>
                                This lesson covers one rule within the module.
                                Teacher review pending.
                              </p>
                              <Button
                                className={styles.primary}
                                onClick={() => setActive(item.id)}
                              >
                                {previewOnly
                                  ? 'Preview rule lesson'
                                  : evidence
                                    ? 'Practice again'
                                    : 'Open rule lesson'}{' '}
                                <ArrowRight size={16} />
                              </Button>
                              {evidence && (
                                <details className={styles.savedEvidence}>
                                  <summary>
                                    Saved evidence ·{' '}
                                    {new Date(
                                      evidence.savedAt,
                                    ).toLocaleDateString()}
                                  </summary>
                                  <p>
                                    {evidence.mode === 'revisit'
                                      ? 'Review set'
                                      : 'Main practice'}{' '}
                                    · first answers
                                  </p>
                                  {evidence.checkScores && (
                                    <p>
                                      Starting check (separate):{' '}
                                      {Object.entries(evidence.checkScores)
                                        .filter(([, score]) => score.total > 0)
                                        .map(
                                          ([kind, score]) =>
                                            `${EVIDENCE_LABELS[kind as keyof typeof EVIDENCE_LABELS]} ${score.correct}/${score.total}`,
                                        )
                                        .join(' · ')}
                                    </p>
                                  )}
                                  <ul>
                                    {Object.entries(evidence.scores).map(
                                      ([kind, score]) => (
                                        <li key={kind}>
                                          {
                                            EVIDENCE_LABELS[
                                              kind as keyof typeof EVIDENCE_LABELS
                                            ]
                                          }
                                          : {score.correct}/{score.total}
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                  <p>Writing submitted · not graded</p>
                                  <p className={styles.writing} lang="es">
                                    {evidence.writing}
                                  </p>
                                  <p>
                                    Self-review:{' '}
                                    {evidence.selfReview.filter(Boolean).length}
                                    /{item.production.checklist.length} checks
                                    marked.
                                  </p>
                                </details>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className={styles.visitNote}>
                          Rule lessons for this module are in development.
                        </p>
                      )}
                    </div>
                  </details>
                );
              })}
              {modules.length === 0 && (
                <div className={styles.emptyState}>
                  <BookOpen size={24} />
                  <h3>No matching modules</h3>
                  <p>Try another grammar type or search term.</p>
                  <Button
                    className={styles.secondary}
                    variant="outline"
                    onClick={() => {
                      setSystem('all');
                      setQuery('');
                      setAvailableOnly(false);
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          </section>

          {!previewOnly && (
            <section
              className={styles.overview}
              aria-labelledby="sample-heading"
            >
              <details className={styles.samples}>
                <summary id="sample-heading">
                  More practice · {viewLevel} sample lessons
                </summary>
                <p className={styles.visitNote}>
                  These earlier exercises cover selected topics. Their quiz
                  results last for this visit and are separate from saved rule
                  evidence.
                </p>
                <div className={styles.topicGrid}>
                  {GRAMMAR_LESSONS[viewLevel].map((lesson) => (
                    <article className={styles.topicCard} key={lesson.id}>
                      <span className={styles.category}>{lesson.category}</span>
                      <h3>{lesson.title}</h3>
                      <p className={styles.description}>{lesson.description}</p>
                      <div className={styles.cardBottom}>
                        <span>
                          {sampleResults[lesson.id]
                            ? `${sampleResults[lesson.id].score}/${sampleResults[lesson.id].total} this visit`
                            : '4 questions'}
                        </span>
                        <Button
                          ref={(node) => {
                            triggers.current[lesson.id] = node;
                          }}
                          className={styles.secondary}
                          variant="outline"
                          onClick={() => setActive(lesson.id)}
                        >
                          Open practice <ArrowRight size={16} />
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              </details>
            </section>
          )}
          <p className={styles.visitNote}>
            Curriculum based on the app’s adopted educational rubric and the
            Instituto Cervantes grammar inventories. Lesson drafts await
            independent teacher review.
          </p>
        </div>
      </div>
    </div>
  );
}
