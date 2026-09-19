'use client';
/* oxlint-disable next/no-html-link-for-pages, next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { VocabularyHeader } from '@/components/vocabulary-header';
import type { LearnerProfile } from '@/components/profile-dialog';
import { useLearnerProfile } from '@/components/learner-profile-provider';
import { LevelRequired } from '@/components/level-required';
import { createClient } from '@/lib/supabase/client';
import { VocabularyAssessment } from '@/components/vocabulary-assessment';
import {
  VocabularyTopicLearningPath,
  type VocabularyTopicPathItem,
} from '@/components/vocabulary-topic-learning-path';
import { topicPresentation } from '@/lib/vocabulary-topics';
import type { CEFRLevel } from '@/lib/cefr';
import type { VocabularyLearningSet } from '@/lib/vocabulary-learning-path';

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
  learning_set_id: string | null;
  curriculum_position: number | null;
  curriculum_role: 'core' | 'review' | null;
  introduced_level: CEFRLevel | null;
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
type Mode = 'diagnostic' | 'explore';

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
  const [learningSets, setLearningSets] = useState<VocabularyLearningSet[]>([]);
  const [mode, setMode] = useState<Mode>('explore');
  const [assessmentTarget, setAssessmentTarget] = useState<
    string | undefined
  >();
  const [assessmentPrompt, setAssessmentPrompt] = useState<string>();
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
    const loadSections = async () => {
      const enhanced = await supabase
        .from('vocabulary_sections')
        .select(
          'id, slug, title, description, sort_order, vocabulary_items(id, spanish, english, example_es, example_en, usage_note, sort_order, cefr_level, source, learning_set_id, curriculum_position, curriculum_role, introduced_level)',
        )
        .eq('theme_id', themeId)
        .order('sort_order');
      if (!enhanced.error) return enhanced;
      const legacy = await supabase
        .from('vocabulary_sections')
        .select(
          'id, slug, title, description, sort_order, vocabulary_items(id, spanish, english, example_es, example_en, usage_note, sort_order, cefr_level, source)',
        )
        .eq('theme_id', themeId)
        .order('sort_order');
      return {
        ...legacy,
        data: legacy.data?.map((section) => ({
          ...section,
          vocabulary_items: section.vocabulary_items.map((item) => ({
            ...item,
            learning_set_id: null,
            curriculum_position: null,
            curriculum_role: null,
            introduced_level: null,
          })),
        })),
      };
    };
    const loadLearningSets = async () => {
      const { data } = await supabase
        .from('vocabulary_learning_sets')
        .select(
          'id, set_number, title, description, item_count, content_version',
        )
        .eq('theme_id', themeId)
        .eq('cefr_level', profile.proficiencyLevel)
        .eq('is_published', true)
        .order('set_number');
      return (data ?? []) as VocabularyLearningSet[];
    };
    const [
      { data: themeData, error: themeError },
      { data: sectionData, error: sectionError },
      setData,
    ] = await Promise.all([
      supabase
        .from('vocabulary_themes')
        .select('id, title, description')
        .eq('id', themeId)
        .eq('is_published', true)
        .maybeSingle(),
      loadSections(),
      loadLearningSets(),
    ]);
    if (themeError || sectionError || !themeData || !sectionData?.length) {
      setTheme(null);
      setSections([]);
      setLearningSets([]);
      setMessage('This vocabulary topic could not be loaded right now.');
    } else {
      setTheme(themeData as Theme);
      setLearningSets(setData);
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
      setMode('explore');
      setAssessmentTarget(undefined);
    })();
  }, [loadTopic, profile.proficiencyLevel, profileLoading, themeId, userId]);

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
  const generatedCount = allItems.filter((item) => item.source === 'ai').length;
  const topicPathItems = useMemo(
    () =>
      sections.flatMap((section) =>
        section.vocabulary_items.map((item) => ({
          ...item,
          sectionId: section.id,
          sectionTitle: section.title,
          sectionDescription: section.description,
          sectionSort: section.sort_order,
        })),
      ) as VocabularyTopicPathItem[],
    [sections],
  );
  const structuredSetIds = useMemo(
    () => new Set(learningSets.map((set) => set.id)),
    [learningSets],
  );
  const structuredItems = useMemo(
    () =>
      topicPathItems.filter(
        (item) =>
          item.learning_set_id && structuredSetIds.has(item.learning_set_id),
      ),
    [structuredSetIds, topicPathItems],
  );
  const expectedStructuredItems = learningSets.reduce(
    (total, set) => total + set.item_count,
    0,
  );
  const hasStructuredPath =
    learningSets.length > 0 &&
    structuredItems.length === expectedStructuredItems;
  const learningPathItems = hasStructuredPath
    ? structuredItems
    : topicPathItems;
  const activeLearningSets = hasStructuredPath ? learningSets : [];
  function startDiagnostic() {
    setAssessmentTarget(undefined);
    setAssessmentPrompt(undefined);
    setRecentlyStudied(false);
    setMode('diagnostic');
  }

  function assessExpression(itemId: string, studied: boolean, prompt?: string) {
    setAssessmentTarget(itemId);
    setAssessmentPrompt(studied ? prompt : undefined);
    setRecentlyStudied(studied);
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

      {mode === 'diagnostic' && (
        <VocabularyAssessment
          scope={{ themeId }}
          targetId={assessmentTarget}
          initialPrompt={assessmentPrompt}
          recentlyStudied={recentlyStudied}
          onExit={() => setMode('explore')}
        />
      )}

      {mode === 'explore' && (
        <VocabularyTopicLearningPath
          key={`${themeId}-${profile.proficiencyLevel}`}
          themeId={themeId}
          themeTitle={theme.title}
          level={profile.proficiencyLevel}
          items={learningPathItems}
          sets={activeLearningSets}
          voice={profile.voicePreference}
          onAssessAll={startDiagnostic}
          onAssess={assessExpression}
          onExpand={() => void expandTopic()}
          expanding={expanding}
          generatedCount={generatedCount}
          message={message}
        />
      )}
    </main>
  );
}
