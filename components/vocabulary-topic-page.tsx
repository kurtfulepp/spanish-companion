'use client';
/* oxlint-disable next/no-html-link-for-pages, next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Eye,
  LoaderCircle,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SpeechButton } from '@/components/speech-button';
import { VocabularyHeader } from '@/components/vocabulary-header';
import type { LearnerProfile } from '@/components/profile-dialog';
import { useLearnerProfile } from '@/components/learner-profile-provider';
import { LevelRequired } from '@/components/level-required';
import { createClient } from '@/lib/supabase/client';
import {
  selectDiagnosticItems,
  type DiagnosticProgress,
} from '@/lib/topic-diagnostic';
import { topicPresentation } from '@/lib/vocabulary-topics';
import type { CEFRLevel } from '@/lib/cefr';

type VocabularyItem = {
  id: string;
  sectionId: string;
  spanish: string;
  english: string;
  example_es: string;
  example_en: string;
  usage_note: string | null;
  sort_order: number;
  cefr_level: CEFRLevel;
  source: 'curated' | 'ai';
};
type VocabularySection = {
  id: string;
  slug: string;
  title: string;
  description: string;
  sort_order: number;
  vocabulary_items: Omit<VocabularyItem, 'sectionId'>[];
};
type Theme = { id: string; title: string; description: string };
type ItemProgress = {
  status: 'new' | 'learning' | 'confident';
  confidence: number;
  nextReviewAt: string;
};
type Mode = 'overview' | 'diagnostic' | 'diagnostic-complete' | 'explore';

export function VocabularyTopicPage({ themeId }: { themeId: string }) {
  const presentation = topicPresentation(themeId);
  const {
    profile,
    loading: profileLoading,
    userId,
    setProfile,
  } = useLearnerProfile();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [sections, setSections] = useState<VocabularySection[]>([]);
  const [itemProgress, setItemProgress] = useState<
    Record<string, ItemProgress>
  >({});
  const [mode, setMode] = useState<Mode>('overview');
  const [selectedSection, setSelectedSection] = useState('all');
  const [diagnosticIndex, setDiagnosticIndex] = useState(0);
  const [diagnosticIds, setDiagnosticIds] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expanding, setExpanding] = useState(false);
  const [message, setMessage] = useState('');
  const updateProfile = useCallback(
    (next: LearnerProfile) => setProfile(next),
    [setProfile],
  );

  const loadTopic = useCallback(async () => {
    if (!profile.proficiencyLevel || !userId) return;
    const supabase = createClient();
    setLoading(true);
    setMessage('');
    const [
      { data: themeData, error: themeError },
      { data: sectionData, error: sectionError },
      { data: progressData },
    ] = await Promise.all([
      supabase
        .from('vocabulary_themes')
        .select('id, title, description')
        .eq('id', themeId)
        .eq('is_published', true)
        .maybeSingle(),
      supabase
        .from('vocabulary_sections')
        .select(
          'id, slug, title, description, sort_order, vocabulary_items(id, spanish, english, example_es, example_en, usage_note, sort_order, cefr_level, source)',
        )
        .eq('theme_id', themeId)
        .order('sort_order'),
      supabase
        .from('user_vocabulary_progress')
        .select('item_id, status, confidence, next_review_at')
        .eq('user_id', userId),
    ]);
    if (themeError || sectionError || !themeData || !sectionData?.length) {
      setTheme(null);
      setSections([]);
      setMessage('This vocabulary topic could not be loaded right now.');
    } else {
      setTheme(themeData as Theme);
      setSections(
        (sectionData as VocabularySection[]).map((section) => ({
          ...section,
          vocabulary_items: section.vocabulary_items
            .filter((item) => item.cefr_level === profile.proficiencyLevel)
            .sort((a, b) => a.sort_order - b.sort_order),
        })),
      );
    }
    setItemProgress(
      Object.fromEntries(
        (progressData ?? []).map((entry) => [
          entry.item_id,
          {
            status: entry.status,
            confidence: entry.confidence,
            nextReviewAt: entry.next_review_at,
          },
        ]),
      ),
    );
    setLoading(false);
  }, [profile.proficiencyLevel, themeId, userId]);

  useEffect(() => {
    if (profileLoading || !profile.proficiencyLevel || !userId) return;
    void (async () => {
      await loadTopic();
      setMode('overview');
      setSelectedSection('all');
      setDiagnosticIds([]);
    })();
  }, [loadTopic, profile.proficiencyLevel, profileLoading, userId]);

  const allItems = useMemo(
    () =>
      sections.flatMap((section) =>
        section.vocabulary_items.map((item) => ({
          ...item,
          sectionId: section.id,
        })),
      ),
    [sections],
  );
  const diagnosticItems = diagnosticIds
    .map((id) => allItems.find((item) => item.id === id))
    .filter((item): item is VocabularyItem => Boolean(item));
  const visibleSections =
    selectedSection === 'all'
      ? sections
      : sections.filter((section) => section.slug === selectedSection);
  const currentProgress = allItems
    .map((item) => itemProgress[item.id])
    .filter(Boolean);
  const started = currentProgress.length;
  const confident = currentProgress.filter(
    (entry) => entry.status === 'confident',
  ).length;
  const needsPractice = currentProgress.filter(
    (entry) => entry.status !== 'confident',
  ).length;
  const generatedCount = allItems.filter((item) => item.source === 'ai').length;

  async function saveProgress(itemId: string, status: ItemProgress['status']) {
    if (!userId) return false;
    setSaving(true);
    setMessage('');
    const confidence = status === 'new' ? 0 : status === 'learning' ? 1 : 3;
    const nextReview = new Date();
    nextReview.setDate(
      nextReview.getDate() +
        (status === 'confident' ? 14 : status === 'learning' ? 1 : 0),
    );
    const { error } = await createClient()
      .from('user_vocabulary_progress')
      .upsert(
        {
          user_id: userId,
          item_id: itemId,
          status,
          confidence,
          last_seen_at: new Date().toISOString(),
          next_review_at: nextReview.toISOString(),
        },
        { onConflict: 'user_id,item_id' },
      );
    if (error) {
      setMessage('That update could not be saved. Please try again.');
      setSaving(false);
      return false;
    }
    setItemProgress((current) => ({
      ...current,
      [itemId]: { status, confidence, nextReviewAt: nextReview.toISOString() },
    }));
    setSaving(false);
    return true;
  }

  async function answerDiagnostic(status: ItemProgress['status']) {
    const item = diagnosticItems[diagnosticIndex];
    if (!item || !(await saveProgress(item.id, status))) return;
    if (diagnosticIndex === diagnosticItems.length - 1)
      setMode('diagnostic-complete');
    else {
      setDiagnosticIndex((current) => current + 1);
      setRevealed(false);
    }
  }

  function startDiagnostic() {
    const progress: Record<string, DiagnosticProgress> = Object.fromEntries(
      Object.entries(itemProgress).map(([id, item]) => [
        id,
        { status: item.status, nextReviewAt: item.nextReviewAt },
      ]),
    );
    setDiagnosticIds(
      selectDiagnosticItems(
        allItems.map((item) => ({ ...item, sortOrder: item.sort_order })),
        progress,
      ).map((item) => item.id),
    );
    setDiagnosticIndex(0);
    setRevealed(false);
    setMessage('');
    setMode('diagnostic');
  }

  async function expandTopic() {
    if (expanding) return;
    setExpanding(true);
    setMessage('');
    try {
      const response = await fetch('/api/vocabulary/expand-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme_id: themeId }),
      });
      const result = (await response.json()) as {
        added?: number;
        error?: string;
      };
      if (!response.ok)
        throw new Error(result.error || 'New expressions could not be added.');
      await loadTopic();
      setMode('explore');
      setMessage(
        `${result.added ?? 0} new ${profile.proficiencyLevel} expressions were added across all six moments.`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'New expressions could not be added.',
      );
    } finally {
      setExpanding(false);
    }
  }

  if (profileLoading || (profile.proficiencyLevel && loading))
    return (
      <main className="min-h-screen bg-background px-3 pt-3 sm:px-5">
        <VocabularyHeader onProfileChange={updateProfile} />
        <div className="mx-auto mt-5 grid min-h-[620px] max-w-[1360px] place-items-center rounded-[32px] bg-white">
          <div className="text-center">
            <span className="mx-auto block size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Loading topic…</p>
          </div>
        </div>
      </main>
    );

  if (!profile.proficiencyLevel)
    return (
      <main className="min-h-screen bg-background px-3 pb-12 pt-3 text-foreground sm:px-5">
        <VocabularyHeader onProfileChange={updateProfile} />
        <LevelRequired profile={profile} onProfileChange={updateProfile} />
      </main>
    );

  if (!theme || !presentation)
    return (
      <main className="min-h-screen bg-background px-3 pb-12 pt-3 text-foreground sm:px-5">
        <VocabularyHeader onProfileChange={updateProfile} />
        <div className="mx-auto mt-5 max-w-[760px] rounded-[24px] bg-[#fff1ed] p-6 text-[#8b4337]">
          <p>{message || 'This vocabulary topic is not available.'}</p>
          <a
            href="/vocabulary"
            className="mt-4 inline-flex items-center gap-2 font-semibold"
          >
            <ArrowLeft className="size-4" />
            All vocabulary themes
          </a>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen bg-background px-3 pb-12 pt-3 text-foreground sm:px-5">
      <VocabularyHeader onProfileChange={updateProfile} />
      <div className="mx-auto mt-5 max-w-[1360px]">
        <a
          href="/vocabulary"
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-white hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All vocabulary themes
        </a>
      </div>

      {mode === 'overview' && (
        <section
          className={`mx-auto mt-3 max-w-[1360px] overflow-hidden rounded-[32px] ${presentation.cardTone} shadow-[0_18px_55px_rgba(48,51,38,.1)]`}
        >
          <div className="grid min-h-[520px] gap-8 px-6 py-9 sm:px-10 sm:py-12 lg:grid-cols-[1fr_.8fr] lg:items-center lg:px-14">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-sm font-semibold text-[#80621f]">
                <Sparkles className="size-4" />
                {profile.proficiencyLevel} topic experience
              </span>
              <h1 className="mt-6 max-w-3xl font-heading text-[clamp(3.5rem,7vw,7rem)] font-semibold leading-[.88] tracking-[-.075em] text-[#7f302b]">
                {theme.title}
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#79564c]">
                {theme.description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {allItems.length ? (
                  <Button
                    onClick={startDiagnostic}
                    className="h-12 rounded-full px-6 text-base font-bold"
                  >
                    <Eye className="size-4" />
                    Find my gaps
                  </Button>
                ) : (
                  <Button
                    onClick={() => void expandTopic()}
                    disabled={expanding}
                    className="h-12 rounded-full px-6 text-base font-bold"
                  >
                    {expanding ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <WandSparkles className="size-4" />
                    )}
                    {expanding
                      ? 'Creating expressions…'
                      : `Create ${profile.proficiencyLevel} expressions`}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setMode('explore')}
                  className="h-12 rounded-full border-[#cfb96f] bg-white/65 px-6 text-base font-bold"
                >
                  Explore {allItems.length} expressions
                  <ArrowRight className="size-4" />
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-2 text-sm font-medium text-[#806f42]">
                <span className="rounded-full bg-white/65 px-3 py-1.5">
                  {sections.length} real moments
                </span>
                <span className="rounded-full bg-white/65 px-3 py-1.5">
                  Audio included
                </span>
                <span className="rounded-full bg-white/65 px-3 py-1.5">
                  Progress saved
                </span>
              </div>
            </div>
            <div className="relative mx-auto grid size-72 place-items-center rounded-full bg-white shadow-[0_28px_70px_rgba(118,85,20,.14)] sm:size-96">
              <img
                src={presentation.image.src}
                alt=""
                className="size-[88%] object-contain drop-shadow-[0_18px_20px_rgba(118,85,20,.13)]"
              />
            </div>
          </div>
        </section>
      )}

      {mode === 'diagnostic' && diagnosticItems[diagnosticIndex] && (
        <section className="mx-auto mt-3 max-w-[760px] rounded-[30px] bg-white p-6 shadow-[0_18px_55px_rgba(37,55,49,.1)] sm:p-9">
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            <button
              onClick={() => setMode('overview')}
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Exit check
            </button>
            <span>
              {diagnosticIndex + 1} of {diagnosticItems.length}
            </span>
          </div>
          <Progress
            value={((diagnosticIndex + 1) / diagnosticItems.length) * 100}
            className="mt-4"
          />
          <div className="py-10 text-center">
            <p className="eyebrow">How would you say this?</p>
            <h1 className="mx-auto mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-[-.045em] sm:text-4xl">
              {diagnosticItems[diagnosticIndex].english}
            </h1>
            {!revealed ? (
              <Button
                onClick={() => setRevealed(true)}
                variant="outline"
                className="mt-8 h-12 rounded-full px-7 text-base font-bold"
              >
                <Eye className="size-4" />
                Reveal Spanish
              </Button>
            ) : (
              <div className="mt-8 rounded-[24px] bg-[#eef6f2] p-6">
                <div className="flex flex-col items-center gap-3">
                  <p className="text-2xl font-semibold text-[#173c34]">
                    {diagnosticItems[diagnosticIndex].spanish}
                  </p>
                  <SpeechButton
                    text={diagnosticItems[diagnosticIndex].spanish}
                    voice={profile.voicePreference}
                  />
                </div>
                <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-[#52776d]">
                  {diagnosticItems[diagnosticIndex].example_es}
                </p>
              </div>
            )}
          </div>
          {revealed && (
            <div>
              <p className="mb-3 text-center text-sm font-semibold text-muted-foreground">
                How familiar did that feel?
              </p>
              <div className="grid gap-2.5 sm:grid-cols-3">
                <button
                  disabled={saving}
                  onClick={() => void answerDiagnostic('new')}
                  className="rounded-[16px] bg-[#fff1ed] px-4 py-4 font-semibold text-[#8b4337] transition hover:-translate-y-0.5"
                >
                  New to me
                </button>
                <button
                  disabled={saving}
                  onClick={() => void answerDiagnostic('learning')}
                  className="rounded-[16px] bg-[#fff4dc] px-4 py-4 font-semibold text-[#80621f] transition hover:-translate-y-0.5"
                >
                  Familiar
                </button>
                <button
                  disabled={saving}
                  onClick={() => void answerDiagnostic('confident')}
                  className="rounded-[16px] bg-[#e9f6f0] px-4 py-4 font-semibold text-[#285d4e] transition hover:-translate-y-0.5"
                >
                  I knew it
                </button>
              </div>
            </div>
          )}
          {message && (
            <p
              role="alert"
              className="mt-4 rounded-[14px] bg-[#fff1ed] p-3 text-sm text-[#8b4337]"
            >
              {message}
            </p>
          )}
        </section>
      )}

      {mode === 'diagnostic-complete' && (
        <section className="mx-auto mt-3 max-w-[760px] rounded-[30px] bg-white p-7 text-center shadow-[0_18px_55px_rgba(37,55,49,.1)] sm:p-10">
          <span className="mx-auto grid size-20 place-items-center rounded-[20px] bg-[#fff1d2]">
            <img
              src={presentation.image.src}
              alt=""
              className="size-[88%] object-contain"
            />
          </span>
          <h1 className="mt-7 text-4xl font-semibold tracking-[-.055em] text-[#173c34]">
            Your next review is ready.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            You marked {needsPractice} expressions for practice and {confident}{' '}
            as confident. New and due expressions will be prioritized the next
            time you check this topic.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-[18px] bg-[#fff4dc] p-5">
              <strong className="block text-3xl text-[#80621f]">
                {needsPractice}
              </strong>
              <span className="text-sm text-[#80621f]">To practice</span>
            </div>
            <div className="rounded-[18px] bg-[#e9f6f0] p-5">
              <strong className="block text-3xl text-[#285d4e]">
                {confident}
              </strong>
              <span className="text-sm text-[#285d4e]">Confident</span>
            </div>
          </div>
          <Button
            onClick={() => setMode('explore')}
            className="mt-8 h-12 rounded-full px-7 text-base font-bold"
          >
            Explore {theme.title}
            <ChevronRight className="size-4" />
          </Button>
        </section>
      )}

      {mode === 'explore' && (
        <section className="mx-auto mt-3 max-w-[1360px]">
          <div className="rounded-[28px] bg-[#7f302b] px-6 py-8 text-white sm:px-9">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <button
                  onClick={() => setMode('overview')}
                  className="inline-flex items-center gap-1 text-sm font-medium text-white/70 hover:text-white"
                >
                  <ArrowLeft className="size-4" />
                  Topic overview
                </button>
                <h1 className="mt-4 text-4xl font-semibold tracking-[-.055em]">
                  {theme.title} expressions
                </h1>
                <p className="mt-2 max-w-2xl text-base text-white/75">
                  {profile.proficiencyLevel} expressions across six moments.
                  Your progress stays attached to each expression.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-2 text-sm">
                  {started} started
                </span>
                <span className="rounded-full bg-white/10 px-3 py-2 text-sm">
                  {confident} confident
                </span>
                {generatedCount > 0 && (
                  <span className="rounded-full bg-white/10 px-3 py-2 text-sm">
                    {generatedCount} expanded
                  </span>
                )}
              </div>
            </div>
            <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedSection('all')}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${selectedSection === 'all' ? 'bg-[#f4bd4e] text-[#7f302b]' : 'bg-white/10 text-white/80'}`}
                >
                  All moments
                </button>
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section.slug)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${selectedSection === section.slug ? 'bg-[#f4bd4e] text-[#7f302b]' : 'bg-white/10 text-white/80'}`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
              <Button
                onClick={() => void expandTopic()}
                disabled={expanding || generatedCount >= 72}
                className="h-11 shrink-0 rounded-full bg-white px-5 font-bold text-[#7f302b] hover:bg-[#fff4dc]"
              >
                <span aria-hidden="true">
                  {expanding ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <WandSparkles className="size-4" />
                  )}
                </span>
                {expanding
                  ? 'Creating expressions…'
                  : generatedCount >= 72
                    ? 'Current expansion limit reached'
                    : 'Add 12 expressions'}
              </Button>
            </div>
          </div>
          {message && (
            <output className="mt-5 block rounded-[14px] bg-[#fff4dc] p-3 text-sm font-medium text-[#80621f]">
              {message}
            </output>
          )}
          <div className="mt-6 space-y-7">
            {visibleSections.map((section) => (
              <div key={section.id}>
                <div className="mb-4 px-1">
                  <p className="eyebrow">Moment {section.sort_order}</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-[-.035em]">
                    {section.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {section.vocabulary_items.map((item) => {
                    const progress = itemProgress[item.id];
                    return (
                      <article
                        key={item.id}
                        className="rounded-[24px] bg-white p-5 shadow-[0_9px_28px_rgba(37,55,49,.065)] ring-1 ring-black/5 sm:p-6"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            {item.source === 'ai' && (
                              <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-[#fff4dc] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.06em] text-[#80621f]">
                                <WandSparkles className="size-3" />
                                Expanded
                              </span>
                            )}
                            <h3 className="text-xl font-semibold leading-snug tracking-[-.025em] text-[#173c34]">
                              {item.spanish}
                            </h3>
                            <p className="mt-1 text-[15px] text-muted-foreground">
                              {item.english}
                            </p>
                          </div>
                          <SpeechButton
                            text={item.spanish}
                            voice={profile.voicePreference}
                            className="shrink-0"
                          />
                        </div>
                        <div className="mt-5 rounded-[16px] bg-[#f7f9f8] p-4">
                          <p className="text-[15px] font-medium leading-relaxed">
                            {item.example_es}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {item.example_en}
                          </p>
                        </div>
                        {item.usage_note && (
                          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                            {item.usage_note}
                          </p>
                        )}
                        <div className="mt-5 flex items-center gap-2 border-t border-border/70 pt-4">
                          <button
                            disabled={saving}
                            onClick={() =>
                              void saveProgress(item.id, 'learning')
                            }
                            className={`rounded-full px-3 py-2 text-sm font-semibold transition ${progress?.status === 'learning' || progress?.status === 'new' ? 'bg-[#fff4dc] text-[#80621f]' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
                          >
                            Practice this
                          </button>
                          <button
                            disabled={saving}
                            onClick={() =>
                              void saveProgress(item.id, 'confident')
                            }
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition ${progress?.status === 'confident' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
                          >
                            {progress?.status === 'confident' && (
                              <Check className="size-3.5" />
                            )}
                            I know this
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
