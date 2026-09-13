'use client';
/* oxlint-disable next/no-html-link-for-pages, next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  LoaderCircle,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpeechButton } from '@/components/speech-button';
import { VocabularyHeader } from '@/components/vocabulary-header';
import type { LearnerProfile } from '@/components/profile-dialog';
import { useLearnerProfile } from '@/components/learner-profile-provider';
import { LevelRequired } from '@/components/level-required';
import { createClient } from '@/lib/supabase/client';
import { VocabularyAssessment } from '@/components/vocabulary-assessment';
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
type Mode = 'overview' | 'diagnostic' | 'explore';

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
  const [mode, setMode] = useState<Mode>('overview');
  const [selectedSection, setSelectedSection] = useState('all');
  const [assessmentTarget, setAssessmentTarget] = useState<string | undefined>();
  const [recentlyStudied, setRecentlyStudied] = useState(false);
  const [loading, setLoading] = useState(true);
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
    setLoading(false);
  }, [profile.proficiencyLevel, themeId, userId]);

  useEffect(() => {
    if (profileLoading || !profile.proficiencyLevel || !userId) return;
    void (async () => {
      await loadTopic();
      setMode('overview');
      setSelectedSection('all');
      setAssessmentTarget(undefined);
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
  const visibleSections =
    selectedSection === 'all'
      ? sections
      : sections.filter((section) => section.slug === selectedSection);
  const generatedCount = allItems.filter((item) => item.source === 'ai').length;
  function startDiagnostic() {
    setAssessmentTarget(undefined);
    setRecentlyStudied(false);
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
                    Assess vocabulary
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

      {mode === 'diagnostic' && <VocabularyAssessment scope={{ themeId }} targetId={assessmentTarget} recentlyStudied={recentlyStudied} onExit={() => setMode('overview')} />}

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
                  {allItems.length} expressions
                </span>
                <span className="rounded-full bg-white/10 px-3 py-2 text-sm">
                  Assessed knowledge
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
                          <button className="rounded-full bg-[var(--brand-gold)] px-4 py-2 text-sm font-semibold text-[var(--brand-ink)]" onClick={() => { setAssessmentTarget(item.id); setRecentlyStudied(true); setMode('diagnostic'); }}>Check this expression</button>
                          <span className="text-xs text-muted-foreground">Browsing does not mark it known.</span>
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
