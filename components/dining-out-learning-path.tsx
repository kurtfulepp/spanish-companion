'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  LoaderCircle,
  LockKeyhole,
} from 'lucide-react';
import { SpeechButton } from '@/components/speech-button';
import { TimedSpeechExpression } from '@/components/timed-speech-expression';
import type { CEFRLevel } from '@/lib/cefr';
import type { VoicePreference } from '@/lib/speech';
import type { AssessmentCatalog } from '@/lib/vocabulary-assessment';
import {
  buildLearningPath,
  buildLearningSession,
  type VocabularyLearningSet,
} from '@/lib/vocabulary-learning-path';

export type DiningOutPathItem = {
  id: string;
  sectionId: string;
  sectionTitle: string;
  sectionDescription: string;
  sectionSort: number;
  spanish: string;
  english: string;
  example_es: string;
  example_en: string;
  usage_note: string | null;
  sort_order: number;
  cefr_level: CEFRLevel;
  source: 'curated' | 'ai';
  learning_set_id: string | null;
  curriculum_position: number | null;
  curriculum_role: 'core' | 'review' | null;
  introduced_level: CEFRLevel | null;
};

const statusCopy = {
  new: 'New',
  learning: 'Needs practice',
  known: 'Known',
  due: 'Due for review',
  retained: 'Retained',
} as const;

export function DiningOutLearningPath({
  items,
  sets,
  voice,
  onAssessAll,
  onAssess,
}: {
  items: DiningOutPathItem[];
  sets: VocabularyLearningSet[];
  voice: VoicePreference;
  onAssessAll: () => void;
  onAssess: (itemId: string, recentlyStudied: boolean) => void;
}) {
  const [catalog, setCatalog] = useState<AssessmentCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  const [browsing, setBrowsing] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/vocabulary/assessment?themeId=dining-out', {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = (await response.json()) as AssessmentCatalog & {
          error?: string;
        };
        if (!response.ok)
          throw new Error(data.error || 'Progress could not be loaded.');
        setNow(Date.now());
        setCatalog(data);
      })
      .catch((failure) => {
        if (!controller.signal.aborted)
          setError(
            failure instanceof Error
              ? failure.message
              : 'Progress could not be loaded.',
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const path = useMemo(
    () => buildLearningPath(items, sets, catalog, now),
    [catalog, items, now, sets],
  );
  const session = useMemo(() => buildLearningSession(path), [path]);
  const total = path.entries.length;
  const checkedCount = path.entries.filter(
    (item) => item.state !== 'new',
  ).length;
  const progress = total ? Math.round((checkedCount / total) * 100) : 0;
  const browseGroups = useMemo(() => {
    const groups = new Map<
      string,
      {
        id: string;
        title: string;
        description: string;
        sort: number;
        items: typeof path.entries;
      }
    >();
    for (const item of path.entries) {
      const group = groups.get(item.sectionId) ?? {
        id: item.sectionId,
        title: item.sectionTitle,
        description: item.sectionDescription,
        sort: item.sectionSort,
        items: [],
      };
      group.items.push(item);
      groups.set(item.sectionId, group);
    }
    return [...groups.values()].sort((a, b) => a.sort - b.sort);
  }, [path.entries]);

  function reveal(id: string) {
    setRevealed((current) => new Set(current).add(id));
  }

  return (
    <section className="mx-auto mt-3 max-w-[1360px]">
      <div className="overflow-hidden rounded-[28px] bg-[var(--brand-surface)] shadow-[0_18px_55px_rgba(48,51,38,.1)] ring-1 ring-[var(--brand-border)]">
        <div className="border-b border-[var(--brand-border)] bg-[linear-gradient(115deg,#fff0e8,#fff4dc)] px-5 py-7 sm:px-8 sm:py-9">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="eyebrow">B2 learning path</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setBrowsing((current) => !current)}
                aria-expanded={browsing}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] bg-white/70 px-4 text-sm font-semibold text-[var(--brand-ink)] hover:bg-white"
              >
                <BookOpen className="size-4" />
                {browsing ? 'Return to session' : 'Browse all expressions'}
              </button>
              <button
                type="button"
                onClick={onAssessAll}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] bg-white/70 px-4 text-sm font-semibold text-[var(--brand-ink)] hover:bg-white"
              >
                <Check className="size-4" />
                Check what I already know
              </button>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-[-.055em] text-[var(--brand-ink)] sm:text-5xl">
                Dining Out
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--brand-ink-muted)]">
                {total} expressions across six moments. Work in focused
                six-expression sessions, with earlier gaps brought back for
                review.
              </p>
            </div>
            <div className="grid min-w-[280px] grid-cols-3 gap-2 text-center">
              <Metric value={total} label="Total" />
              <Metric value={path.knownCount} label="Known" />
              <Metric value={path.retainedCount} label="Retained" />
            </div>
          </div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/75">
            <div
              className="h-full rounded-full bg-[var(--brand-flag-red)] transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-medium text-[var(--brand-ink-muted)]">
            {checkedCount}/{total} checked · retention is confirmed by a later
            independent review
          </p>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:grid sm:grid-cols-5 sm:overflow-visible sm:pb-0">
            {path.setProgress.map((set) => {
              const introduced = set.checkedCount === set.item_count;
              const current = set.id === path.activeSet?.id;
              return (
                <div
                  key={set.id}
                  className={`w-48 shrink-0 rounded-[16px] border px-3 py-3 sm:w-auto ${
                    current
                      ? 'border-[var(--brand-flag-gold)] bg-[var(--brand-cream)]'
                      : introduced
                        ? 'border-[#b8d9cc] bg-[#f0f8f4]'
                        : 'border-[var(--brand-border)] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-[.08em] text-[var(--brand-ink-muted)]">
                      Set {set.set_number}
                    </span>
                    {introduced ? (
                      <CheckCircle2 className="size-4 text-[#357a62]" />
                    ) : current ? (
                      <span className="size-2 rounded-full bg-[var(--brand-flag-red)]" />
                    ) : (
                      <LockKeyhole className="size-3.5 text-[#a69b8d]" />
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold text-[var(--brand-ink)]">
                    {set.title}
                  </p>
                  <p className="mt-1 text-xs text-[var(--brand-ink-muted)]">
                    {set.checkedCount}/{set.item_count} checked ·{' '}
                    {set.knownCount} known
                  </p>
                </div>
              );
            })}
          </div>

          {loading && (
            <div className="mt-8 flex items-center gap-2 rounded-[16px] bg-[var(--brand-cream)] p-4 text-sm text-[var(--brand-ink-muted)]">
              <LoaderCircle className="size-4 animate-spin" />
              Loading saved progress…
            </div>
          )}
          {error && (
            <p className="mt-8 rounded-[16px] bg-[#fff1ed] p-4 text-sm text-[#8b4337]">
              {error} The expressions are still available to study.
            </p>
          )}

          {!loading && browsing && (
            <ExpressionBrowser groups={browseGroups} voice={voice} />
          )}

          {!loading &&
            !browsing &&
            (path.allRetained ? (
              <div className="mt-9 rounded-[24px] border border-[#b8d9cc] bg-[#f0f8f4] p-7 text-center">
                <CheckCircle2 className="mx-auto size-8 text-[#357a62]" />
                <h2 className="mt-3 text-2xl font-semibold tracking-[-.035em] text-[var(--brand-ink)]">
                  All expressions retained
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[var(--brand-ink-muted)]">
                  You recalled and used all {total} expressions after a delay. A
                  later missed review can return an expression to practice.
                </p>
              </div>
            ) : session.items.length > 0 ? (
              <div className="mt-10">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="eyebrow">
                      Current session · {session.items.length} expressions
                    </p>
                    <h2 className="mt-1 text-3xl font-semibold tracking-[-.045em] text-[var(--brand-ink)]">
                      {path.activeSet?.title ?? 'Review queue'}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--brand-ink-muted)]">
                      {path.activeSet
                        ? `${path.activeSet.description} Earlier gaps are mixed in without taking over the session.`
                        : 'All expressions have been introduced. This session focuses on due reviews and identified gaps.'}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-[var(--brand-ink-muted)] sm:text-right">
                    {session.newRemaining > 0 && (
                      <p>
                        {session.newRemaining} new remain after this session
                      </p>
                    )}
                    {session.practiceRemaining > 0 && (
                      <p>
                        {session.practiceRemaining} reviews remain after this
                        session
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-7 grid gap-3 md:grid-cols-2">
                  {session.items.map((item) => (
                    <PromptCard
                      key={item.id}
                      item={item}
                      voice={voice}
                      revealed={revealed.has(item.id)}
                      onReveal={() => reveal(item.id)}
                      onAssess={onAssess}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-9 rounded-[22px] bg-[var(--brand-cream)] p-6">
                <h2 className="text-xl font-semibold text-[var(--brand-ink)]">
                  No expressions need attention now
                </h2>
                <p className="mt-2 text-sm text-[var(--brand-ink-muted)]">
                  Your next delayed reviews will confirm which expressions are
                  retained.
                </p>
              </div>
            ))}

          {!browsing && path.known.length > 0 && (
            <ArchiveDrawer
              title={`Known · ${path.known.length}`}
              description="Hidden from active practice until the delayed review is due."
              items={path.known}
            />
          )}
          {!browsing && path.retained.length > 0 && (
            <ArchiveDrawer
              title={`Retained · ${path.retained.length}`}
              description="Confirmed by a later independent check."
              items={path.retained}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-[14px] bg-white/75 px-3 py-3">
      <strong className="block text-xl text-[var(--brand-ink)]">{value}</strong>
      <span className="text-xs font-medium text-[var(--brand-ink-muted)]">
        {label}
      </span>
    </div>
  );
}

function ExpressionBrowser({
  groups,
  voice,
}: {
  groups: Array<{
    id: string;
    title: string;
    description: string;
    sort: number;
    items: Array<
      DiningOutPathItem & {
        state: keyof typeof statusCopy;
      }
    >;
  }>;
  voice: VoicePreference;
}) {
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <section className="mt-10" aria-labelledby="expression-browser-title">
      <p className="eyebrow">Reference</p>
      <h2
        id="expression-browser-title"
        className="mt-1 text-3xl font-semibold tracking-[-.045em] text-[var(--brand-ink)]"
      >
        All {total} expressions
      </h2>
      <p className="mt-2 text-sm text-[var(--brand-ink-muted)]">
        Browse by moment. Opening an expression here does not change your
        progress.
      </p>

      <div className="mt-6 space-y-3">
        {groups.map((group) => (
          <details
            key={group.id}
            className="group rounded-[20px] border border-[var(--brand-border)] bg-white"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:px-6">
              <div>
                <p className="eyebrow">Moment {group.sort}</p>
                <h3 className="mt-1 text-lg font-semibold text-[var(--brand-ink)]">
                  {group.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--brand-ink-muted)]">
                  {group.description} · {group.items.length} expressions
                </p>
              </div>
              <ChevronDown className="size-5 shrink-0 text-[var(--brand-ink-muted)] transition-transform group-open:rotate-180" />
            </summary>
            <div className="divide-y divide-[var(--brand-border)] border-t border-[var(--brand-border)] px-5 sm:px-6">
              {group.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 py-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold leading-snug text-[var(--brand-ink)]">
                        {item.spanish}
                      </p>
                      <span className="rounded-full bg-[var(--brand-cream)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.06em] text-[var(--brand-ink-muted)]">
                        {statusCopy[item.state]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--brand-ink-muted)]">
                      {item.english}
                    </p>
                  </div>
                  <SpeechButton
                    text={item.spanish}
                    voice={voice}
                    className="shrink-0"
                  />
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function PromptCard({
  item,
  voice,
  revealed,
  onReveal,
  onAssess,
}: {
  item: DiningOutPathItem & {
    state: keyof typeof statusCopy;
  };
  voice: VoicePreference;
  revealed: boolean;
  onReveal: () => void;
  onAssess: (itemId: string, recentlyStudied: boolean) => void;
}) {
  const [variation, setVariation] = useState('');
  const [variationOpen, setVariationOpen] = useState(false);
  const [compared, setCompared] = useState(false);
  const needsLearning = item.state === 'new' || item.state === 'learning';

  return (
    <article className="rounded-[20px] border border-[var(--brand-border)] bg-white p-4 shadow-[0_7px_22px_rgba(48,51,38,.055)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[var(--brand-peach)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.06em] text-[var(--brand-ink)]">
              {statusCopy[item.state]}
            </span>
            {item.curriculum_role === 'review' && item.introduced_level && (
              <span className="rounded-full bg-[#f3eee6] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.06em] text-[var(--brand-ink-muted)]">
                {item.introduced_level} foundation
              </span>
            )}
            <span className="rounded-full bg-[var(--brand-cream)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.06em] text-[var(--brand-ink-muted)]">
              Moment {item.sectionSort} · {item.sectionTitle}
            </span>
          </div>
          <h4 className="mt-3 text-base font-semibold leading-snug text-[var(--brand-ink)]">
            {item.english}
          </h4>
        </div>
      </div>

      {revealed ? (
        <div className="mt-4 border-t border-[var(--brand-border)] pt-4">
          <TimedSpeechExpression
            key={`${item.id}-${voice}`}
            text={item.spanish}
            voice={voice}
          />
          {item.usage_note && (
            <p className="mt-2 text-sm leading-relaxed text-[var(--brand-ink-muted)]">
              {item.usage_note}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-3 text-xs text-[var(--brand-ink-muted)]">
          {needsLearning
            ? item.state === 'learning'
              ? 'Review the expression, then practice it again.'
              : 'Learn the expression, then practice it in two steps.'
            : 'Complete an independent check, or review the expression first.'}
        </p>
      )}

      {revealed ? (
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onAssess(item.id, true)}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--brand-flag-gold)] px-4 text-sm font-bold text-[var(--brand-ink)] hover:brightness-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-ink-strong)]"
            >
              <Check className="size-4" />
              Practice expression
            </button>
            <button
              type="button"
              aria-expanded={variationOpen}
              aria-controls={`variation-panel-${item.id}`}
              onClick={() => setVariationOpen((open) => !open)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-[var(--brand-ink-muted)] hover:bg-[var(--brand-cream)] hover:text-[var(--brand-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-ink-strong)]"
            >
              Try a variation
              <ChevronDown
                className={`size-4 transition-transform motion-reduce:transition-none ${variationOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[var(--brand-ink-muted)]">
            This immediate check is saved as practice. A later independent
            review can mark the expression Known.
          </p>
          {variationOpen && (
            <div
              id={`variation-panel-${item.id}`}
              className="mt-4 rounded-[14px] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-3"
            >
              <p className="text-sm text-[var(--brand-ink)]">
                {variationPrompt(item.sectionSort)}
              </p>
              <label htmlFor={`variation-${item.id}`} className="sr-only">
                Write a variation in Spanish
              </label>
              <textarea
                id={`variation-${item.id}`}
                value={variation}
                onChange={(event) => {
                  setVariation(event.target.value);
                  setCompared(false);
                }}
                rows={2}
                placeholder="Write your version in Spanish"
                className="mt-3 w-full resize-y rounded-[12px] border border-[var(--brand-border)] bg-white px-3 py-2 text-sm text-[var(--brand-ink)] outline-none focus:border-[var(--brand-flag-gold)] focus:ring-2 focus:ring-[var(--brand-flag-gold)]/25"
              />
              <button
                type="button"
                onClick={() => setCompared(true)}
                disabled={!variation.trim()}
                className="mt-2 inline-flex min-h-9 items-center rounded-full border border-[var(--brand-border)] bg-white px-3 text-sm font-semibold text-[var(--brand-ink)] hover:bg-[var(--brand-cream)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Compare with an example
              </button>
              {compared && (
                <div className="mt-3 border-t border-[var(--brand-border)] pt-3">
                  <p className="text-xs font-bold uppercase tracking-[.06em] text-[var(--brand-ink-muted)]">
                    One possible version
                  </p>
                  <p className="mt-1 text-sm font-medium leading-relaxed">
                    {item.example_es}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--brand-ink-muted)]">
                    {item.example_en}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : needsLearning ? (
        <button
          type="button"
          onClick={onReveal}
          className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--brand-flag-gold)] px-4 text-sm font-bold text-[var(--brand-ink)] hover:brightness-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-ink-strong)]"
        >
          <BookOpen className="size-4" />
          {item.state === 'learning' ? 'Learn again' : 'Learn expression'}
        </button>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onAssess(item.id, false)}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--brand-flag-gold)] px-4 text-sm font-bold text-[var(--brand-ink)] hover:brightness-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-ink-strong)]"
          >
            <Check className="size-4" />
            Check now
          </button>
          <button
            type="button"
            onClick={onReveal}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-sm font-semibold text-[var(--brand-ink)] hover:bg-[var(--brand-cream)]"
          >
            <BookOpen className="size-4" />
            Review expression
          </button>
        </div>
      )}
    </article>
  );
}

function variationPrompt(moment: number) {
  const prompts: Record<number, string> = {
    1: 'Change the party size, time, or seating preference.',
    2: 'Change the dish, ingredient, flavor, or portion.',
    3: 'Change the dish, quantity, or order of service.',
    4: 'Change the restriction, substitution, or preparation request.',
    5: 'Change the problem and the solution you want.',
    6: 'Change the payment method, split, or charge.',
  };
  return (
    prompts[moment] ?? 'Change one detail while keeping the expression useful.'
  );
}

function ArchiveDrawer({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: Array<DiningOutPathItem>;
}) {
  return (
    <details className="group mt-6 rounded-[20px] border border-[var(--brand-border)] bg-[#f8f4ed]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3">
          <Archive className="size-5 text-[var(--brand-ink-muted)]" />
          <div>
            <h2 className="font-semibold text-[var(--brand-ink)]">{title}</h2>
            <p className="text-xs text-[var(--brand-ink-muted)]">
              {description}
            </p>
          </div>
        </div>
        <ChevronDown className="size-5 text-[var(--brand-ink-muted)] transition-transform group-open:rotate-180" />
      </summary>
      <div className="grid gap-x-7 gap-y-3 border-t border-[var(--brand-border)] px-5 py-5 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#357a62]" />
            <p>
              <strong className="text-[var(--brand-ink)]">
                {item.spanish}
              </strong>
              <span className="block text-xs text-[var(--brand-ink-muted)]">
                {item.english}
              </span>
            </p>
          </div>
        ))}
      </div>
    </details>
  );
}
