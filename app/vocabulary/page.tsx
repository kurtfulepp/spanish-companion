'use client';
/* oxlint-disable next/no-html-link-for-pages, next/no-img-element */

import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Camera, Sparkles, Upload } from 'lucide-react';
import { DemoVocabularyLists } from '@/components/demo-vocabulary-lists';
import { VocabularyHeader } from '@/components/vocabulary-header';
import { createClient } from '@/lib/supabase/client';
import { KURTES_ILLUSTRATIONS } from '@/lib/illustrations';
import { useLearnerProfile } from '@/components/learner-profile-provider';
import { LevelRequired } from '@/components/level-required';
import { topicPresentation } from '@/lib/vocabulary-topics';

type Theme = {
  id: string;
  title: string;
  description: string;
  sort_order: number;
};

export default function VocabularyPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile, loading: profileLoading, setProfile } = useLearnerProfile();
  const updateProfile = useCallback(
    (next: Parameters<typeof setProfile>[0]) => setProfile(next),
    [setProfile],
  );

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.replace('/sign-in');
        return;
      }
      const { data: themeData } = await supabase
        .from('vocabulary_themes')
        .select('id, title, description, sort_order')
        .eq('is_published', true)
        .order('sort_order');
      setThemes(
        (themeData ?? []).filter((item) =>
          topicPresentation(item.id),
        ) as Theme[],
      );
      setLoading(false);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-background px-3 pb-12 pt-3 text-foreground sm:px-5">
      <VocabularyHeader onProfileChange={updateProfile} />
      <section className="brand-hero mx-auto mt-5 max-w-[1360px]">
        <span
          className="brand-orbit brand-orbit-turquoise"
          aria-hidden="true"
        />
        <span className="brand-orbit brand-orbit-yellow" aria-hidden="true" />
        <div className="relative flex min-h-[158px] flex-col justify-between gap-6 px-6 py-6 sm:flex-row sm:items-center sm:px-8 lg:px-10">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#8e2f32]/28 px-3 py-1 text-xs font-bold uppercase tracking-[.08em] text-white">
              <Sparkles className="size-3.5" />
              {profile.proficiencyLevel
                ? `${profile.proficiencyLevel} vocabulary`
                : 'Vocabulary'}
            </span>
            <h1 className="mt-3 font-heading text-[clamp(2rem,4vw,3.35rem)] font-semibold leading-[.95] tracking-[-.055em]">
              Select a theme or create your own
            </h1>
          </div>
          <div className="flex shrink-0 items-center">
            <span className="grid size-20 place-items-center rounded-[22px] bg-[#ffd45b] shadow-[0_10px_24px_rgba(121,46,31,.22)] sm:size-24">
              <img
                src={KURTES_ILLUSTRATIONS.topicCompass.src}
                alt=""
                className="size-[88%] object-contain"
              />
            </span>
          </div>
        </div>
      </section>

      {!profileLoading && !profile.proficiencyLevel ? (
        <LevelRequired profile={profile} onProfileChange={updateProfile} />
      ) : (
        <>
          <section className="mx-auto mt-8 max-w-[1360px]">
            <div className="flex items-end justify-between gap-5">
              <div>
                <h2 className="text-3xl font-semibold tracking-[-.045em]">
                  Where do you want to feel fluent?
                </h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {loading
                ? Array.from({ length: 7 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-64 animate-pulse rounded-[26px] bg-secondary"
                    />
                  ))
                : themes.map((theme) => {
                    const item = topicPresentation(theme.id);
                    if (!item) return null;
                    return (
                      <a
                        key={theme.id}
                        href={`/vocabulary/${theme.id}`}
                        aria-label={`Open the ${theme.title} vocabulary experience`}
                        className={`group relative flex min-h-64 flex-col overflow-hidden rounded-[26px] p-6 shadow-[0_12px_34px_rgba(137,54,39,.08)] ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(137,54,39,.14)] ${item.cardTone}`}
                      >
                        <span
                          className="absolute -bottom-16 -right-12 size-44 rounded-full bg-white/30"
                          aria-hidden="true"
                        />
                        <div className="relative flex items-start justify-between">
                          <img
                            src={item.image.src}
                            alt=""
                            className="h-24 w-28 object-contain object-left-top drop-shadow-[0_10px_12px_rgba(121,46,31,.13)]"
                          />
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 text-xs font-bold text-[#7f302b]">
                            Open{' '}
                            <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
                          </span>
                        </div>
                        <div className="relative mt-auto pt-5">
                          <h3 className="text-2xl font-semibold tracking-[-.035em] text-[#7f302b]">
                            {theme.title}
                          </h3>
                          <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-[#79564c]">
                            {theme.description}
                          </p>
                          <div
                            className="mt-5 flex items-center gap-2 text-sm font-semibold"
                            style={{ color: item.accent }}
                          >
                            <BookOpen className="size-4" />6 moments ·{' '}
                            {profile.proficiencyLevel} practice
                          </div>
                        </div>
                      </a>
                    );
                  })}
            </div>
          </section>
          <section
            className="brand-action-panel mx-auto mt-8 max-w-[1360px]"
            aria-labelledby="photo-vocabulary-title"
          >
            <div className="brand-action-art">
              <img
                src={KURTES_ILLUSTRATIONS.photoVocabulary.src}
                alt=""
                width={256}
                height={256}
              />
            </div>
            <div className="brand-action-copy">
              <h2 id="photo-vocabulary-title">CREATE YOUR OWN</h2>
              <p>
                Upload a photo to create a custom theme to enhance your
                vocabulary.
              </p>
            </div>
            <div className="brand-action-controls">
              <a href="/vocabulary/from-photo" className="brand-action-primary">
                <Upload className="size-4" />
                Upload photo
                <ArrowRight className="ml-auto size-4" />
              </a>
              <a
                href="/vocabulary/from-photo?source=camera"
                className="brand-action-secondary"
              >
                <Camera className="size-4" />
                Take photo
              </a>
            </div>
          </section>
          <DemoVocabularyLists />
        </>
      )}
    </main>
  );
}
