'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  LoaderCircle,
  LockKeyhole,
} from 'lucide-react';
import { SpeechButton } from '@/components/speech-button';
import type { CEFRLevel } from '@/lib/cefr';
import type { VoicePreference } from '@/lib/speech';
import type { AssessmentCatalog } from '@/lib/vocabulary-assessment';
import {
  buildLearningPath,
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
  onBack,
  onAssess,
}: {
  items: DiningOutPathItem[];
  sets: VocabularyLearningSet[];
  voice: VoicePreference;
  onBack: () => void;
  onAssess: (itemId: string, recentlyStudied: boolean) => void;
}) {
  const [catalog, setCatalog] = useState<AssessmentCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
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
  const total = path.entries.length;
  const progress = total ? Math.round((path.knownCount / total) * 100) : 0;
  const activeByMoment = useMemo(() => {
    const groups = new Map<
      string,
      { title: string; description: string; sort: number; items: typeof path.active }
    >();
    for (const item of path.active) {
      const group = groups.get(item.sectionId) ?? {
        title: item.sectionTitle,
        description: item.sectionDescription,
        sort: item.sectionSort,
        items: [],
      };
      group.items.push(item);
      groups.set(item.sectionId, group);
    }
    return [...groups.values()].sort((a, b) => a.sort - b.sort);
  }, [path.active]);

  function reveal(id: string) {
    setRevealed((current) => new Set(current).add(id));
  }

  return (
    <section className="mx-auto mt-3 max-w-[1360px]">
      <div className="overflow-hidden rounded-[28px] bg-[var(--brand-surface)] shadow-[0_18px_55px_rgba(48,51,38,.1)] ring-1 ring-[var(--brand-border)]">
        <div className="border-b border-[var(--brand-border)] bg-[linear-gradient(115deg,#fff0e8,#fff4dc)] px-5 py-7 sm:px-8 sm:py-9">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-ink-muted)] hover:text-[var(--brand-ink)]"
          >
            <span aria-hidden="true">←</span>
            Topic overview
          </button>
          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">B2 learning path</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-.055em] text-[var(--brand-ink)] sm:text-5xl">
                Dining Out
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--brand-ink-muted)]">
                {total} expressions across six moments. Check recall and use to
                move an expression out of active practice.
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
            {progress}% checked · retention is confirmed by a later review
          </p>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="grid gap-2 sm:grid-cols-5">
            {path.setProgress.map((set) => {
              const complete = set.knownCount === set.item_count;
              const current = set.id === path.activeSet?.id;
              return (
                <div
                  key={set.id}
                  className={`rounded-[16px] border px-3 py-3 ${
                    current
                      ? 'border-[var(--brand-flag-gold)] bg-[var(--brand-cream)]'
                      : complete
                        ? 'border-[#b8d9cc] bg-[#f0f8f4]'
                        : 'border-[var(--brand-border)] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-[.08em] text-[var(--brand-ink-muted)]">
                      Set {set.set_number}
                    </span>
                    {complete ? (
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
                    {set.knownCount}/{set.item_count} known
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

          {path.due.length > 0 && (
            <div className="mt-9 rounded-[22px] border border-[#e9c67a] bg-[#fff8e7] p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <Clock3 className="size-5 text-[var(--brand-ink)]" />
                <h2 className="text-xl font-semibold tracking-[-.03em] text-[var(--brand-ink)]">
                  Due for review
                </h2>
              </div>
              <p className="mt-1 text-sm text-[var(--brand-ink-muted)]">
                Recheck these without opening the answer first.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {path.due.map((item) => (
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
          )}

          {path.masteredForNow ? (
            <div className="mt-9 rounded-[24px] border border-[#b8d9cc] bg-[#f0f8f4] p-7 text-center">
              <CheckCircle2 className="mx-auto size-8 text-[#357a62]" />
              <h2 className="mt-3 text-2xl font-semibold tracking-[-.035em] text-[var(--brand-ink)]">
                Dining Out mastered for now
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[var(--brand-ink-muted)]">
                You recalled and used all {total} expressions after a delay. A
                later missed review can return an expression to practice.
              </p>
            </div>
          ) : path.activeSet ? (
            <div className="mt-10">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="eyebrow">Current set · {path.active.length} active</p>
                  <h2 className="mt-1 text-3xl font-semibold tracking-[-.045em] text-[var(--brand-ink)]">
                    {path.activeSet.title}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--brand-ink-muted)]">
                    {path.activeSet.description}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[var(--brand-ink-muted)]">
                  {path.activeSet.knownCount}/{path.activeSet.item_count} known
                </p>
              </div>

              <div className="mt-7 space-y-9">
                {activeByMoment.map((moment) => (
                  <section key={moment.title}>
                    <div className="mb-3">
                      <p className="eyebrow">Moment {moment.sort}</p>
                      <h3 className="mt-1 text-xl font-semibold tracking-[-.025em] text-[var(--brand-ink)]">
                        {moment.title}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--brand-ink-muted)]">
                        {moment.description}
                      </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {moment.items.map((item) => (
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
                  </section>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-9 rounded-[22px] bg-[var(--brand-cream)] p-6">
              <h2 className="text-xl font-semibold text-[var(--brand-ink)]">
                All {total} expressions are known
              </h2>
              <p className="mt-2 text-sm text-[var(--brand-ink-muted)]">
                Delayed reviews will confirm which expressions are retained.
              </p>
            </div>
          )}

          {path.known.length > 0 && (
            <ArchiveDrawer
              title={`Known · ${path.known.length}`}
              description="Hidden from active practice until the delayed review is due."
              items={path.known}
            />
          )}
          {path.retained.length > 0 && (
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
          </div>
          <h4 className="mt-3 text-base font-semibold leading-snug text-[var(--brand-ink)]">
            {item.english}
          </h4>
        </div>
        {revealed && (
          <SpeechButton
            text={item.spanish}
            voice={voice}
            className="shrink-0"
          />
        )}
      </div>

      {revealed ? (
        <div className="mt-4 border-t border-[var(--brand-border)] pt-4">
          <p className="text-lg font-semibold leading-snug text-[#173c34]">
            {item.spanish}
          </p>
          <div className="mt-3 rounded-[14px] bg-[#f7f5f1] p-3">
            <p className="text-sm font-medium leading-relaxed">
              {item.example_es}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--brand-ink-muted)]">
              {item.example_en}
            </p>
          </div>
          {item.usage_note && (
            <p className="mt-3 text-xs leading-relaxed text-[var(--brand-ink-muted)]">
              {item.usage_note}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-3 text-xs text-[var(--brand-ink-muted)]">
          Check first for an unassisted result, or study the answer.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onAssess(item.id, revealed)}
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--brand-flag-gold)] px-4 text-sm font-bold text-[var(--brand-ink)] hover:brightness-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-ink-strong)]"
        >
          <Check className="size-4" />
          {revealed ? 'Practice check' : 'Check now'}
        </button>
        {!revealed && (
          <button
            type="button"
            onClick={onReveal}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-sm font-semibold text-[var(--brand-ink)] hover:bg-[var(--brand-cream)]"
          >
            <Eye className="size-4" />
            Study answer
          </button>
        )}
      </div>
    </article>
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
              <strong className="text-[var(--brand-ink)]">{item.spanish}</strong>
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
