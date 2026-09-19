'use client';
/* oxlint-disable next/no-html-link-for-pages, next/no-img-element */

import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  Info,
  Layers3,
  MessageCircle,
  MoveUpRight,
} from 'lucide-react';
import { LearningHeader } from '@/components/vocabulary-header';
import { useLearnerProfile } from '@/components/learner-profile-provider';
import { LevelRequired } from '@/components/level-required';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CEFR_GUIDANCE, CEFR_LEVELS } from '@/lib/cefr';
import { DEFAULT_PROFILE_AVATAR_SRC } from '@/lib/learner-profile';
import { practiceHours } from '@/lib/practice-time';
import { practiceAreas, type HomeSummary } from '@/lib/home-dashboard';
import styles from './home.module.css';

const countWords = (value: number) =>
  `${value} ${value === 1 ? 'expression' : 'expressions'}`;

export default function HomePage() {
  const {
    profile,
    avatarUrl,
    userId,
    loading: profileLoading,
    setProfile,
  } = useLearnerProfile();
  const [result, setResult] = useState<{
    userId: string;
    summary: HomeSummary;
  } | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [reload, setReload] = useState(0);
  const [hoursInfoOpen, setHoursInfoOpen] = useState(false);
  const level = profile.proficiencyLevel;
  // Never retain another user's data or a previous level while the profile changes.
  const summary =
    result?.userId === userId && result?.summary.level === level
      ? result.summary
      : null;
  const loading =
    profileLoading || state === 'loading' || (state === 'ready' && !summary);

  useEffect(() => {
    if (!userId || profileLoading) return;
    const controller = new AbortController();
    const startLoading = window.setTimeout(() => setState('loading'), 0);
    fetch('/api/home', { signal: controller.signal, cache: 'no-store' })
      .then(async (response) => {
        const data = (await response.json()) as HomeSummary;
        if (!response.ok || data.level !== level)
          throw new Error('Dashboard unavailable');
        if (!controller.signal.aborted) {
          setResult({ userId, summary: data as HomeSummary });
          setState('ready');
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setState('error');
      });
    return () => {
      window.clearTimeout(startLoading);
      controller.abort();
    };
  }, [userId, level, profileLoading, reload]);

  const vocabulary = summary?.vocabulary;
  const lists = summary?.lists;
  const grammar = summary?.grammar;
  const vocabularyCount = vocabulary?.reduce(
    (total, item) => total + item.practiced,
    0,
  );
  const listCount = lists?.reduce((total, item) => total + item.practiced, 0);
  const knownCount =
    vocabulary && lists
      ? [...vocabulary, ...lists].reduce((total, item) => total + item.known, 0)
      : undefined;
  const unassessedCount =
    vocabulary && lists
      ? [...vocabulary, ...lists].reduce(
          (total, item) => total + item.unassessed,
          0,
        )
      : undefined;
  const retainedCount =
    vocabulary && lists
      ? [...vocabulary, ...lists].reduce(
          (total, item) => total + item.retained,
          0,
        )
      : undefined;
  const suggestions = summary ? practiceAreas(summary).slice(0, 3) : [];
  const partial = summary && (!vocabulary || !lists || !grammar || summary.practiceSeconds === null);
  const number = (value: number | undefined) =>
    loading || value === undefined || state === 'error'
      ? '—'
      : value.toLocaleString();
  const note = (available: unknown, empty: string) =>
    loading
      ? 'Loading saved practice…'
      : state === 'error' || !available
        ? 'Progress unavailable'
        : empty;

  return (
    <main className={styles.shell}>
      <LearningHeader active="home" />
      <div className={styles.content}>
        <div className={styles.heading}>
          <h1>Your overview</h1>
        </div>
        {!profileLoading && !level && (
          <LevelRequired profile={profile} onProfileChange={setProfile} />
        )}
        {(state === 'error' || partial) && (
          <div className={styles.error} role="alert">
            <span>
              {partial
                ? 'Some progress could not be loaded. Available updates are shown below.'
                : 'Your dashboard could not be loaded.'}
            </span>
            <button onClick={() => setReload((value) => value + 1)}>
              Try again
            </button>
          </div>
        )}
        <div className={styles.grid} aria-busy={loading}>
          <section
            className={`brand-hero ${styles.level}`}
            aria-labelledby="home-level"
          >
            <div className={styles.tileTop}>
              <h2 id="home-level">Level</h2>
            </div>
            <div className={styles.levelDisplay}>
              <div>
                <strong>{profileLoading ? '—' : level || '—'}</strong>
                <p>
                  {profileLoading
                    ? 'Loading profile…'
                    : level
                      ? CEFR_GUIDANCE[level].name
                      : 'Choose your level in Profile'}
                </p>
              </div>
              <img
                src={avatarUrl || DEFAULT_PROFILE_AVATAR_SRC}
                alt="Your profile avatar"
                width={180}
                height={180}
              />
            </div>
            <ol
              className={styles.levelScale}
              aria-label="CEFR levels; your profile level is highlighted"
            >
              {CEFR_LEVELS.map((item) => (
                <li
                  key={item}
                  className={item === level ? styles.currentLevel : ''}
                  aria-current={item === level ? 'true' : undefined}
                >
                  {item}
                </li>
              ))}
            </ol>
          </section>

          <section
            className={`${styles.tile} ${styles.hours}`}
            aria-labelledby="home-hours"
          >
            <div className={styles.tileTop}>
              <h2 id="home-hours">Practice hours</h2>
              <Tooltip open={hoursInfoOpen} onOpenChange={setHoursInfoOpen}>
                <TooltipTrigger
                  className={styles.infoButton}
                  aria-label="How practice hours are calculated"
                  closeOnClick={false}
                  onClick={() => setHoursInfoOpen(true)}
                >
                  <Info size={18} aria-hidden="true" />
                </TooltipTrigger>
                <TooltipContent side="bottom" align="end" className={styles.hoursTooltip}>
                  <strong>How hours are calculated</strong>
                  <ul>
                    <li>Active exercises, assessments, and conversations over the last 30 days (720 hours).</li>
                    <li>Pauses when the page is hidden or unfocused, after 60 seconds without interaction, and while waiting for a response.</li>
                    <li>Browsing, previews, and results screens are excluded.</li>
                    <li>Overlapping tabs and devices count once. Time saves about every 15 seconds.</li>
                    <li>Hours round down to two decimals. Earlier, untracked practice isn’t included.</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className={styles.bigMetric}>
              <strong>{loading || state === 'error' || summary?.practiceSeconds == null ? '—' : practiceHours(summary.practiceSeconds)}</strong>
              <span>hours</span>
            </div>
            <div className={styles.bottomCopy}>
              <span className={styles.pill}>Last 30 days</span>
              {(loading || state === 'error' || summary?.practiceSeconds == null || summary.practiceSeconds === 0) && <p>
                {loading ? 'Loading practice time…' : state === 'error' || summary?.practiceSeconds == null
                  ? 'Practice time unavailable. Try again.'
                  : 'No practice time recorded in the last 30 days.'}
              </p>}
            </div>
          </section>

          <section
            className={`${styles.tile} ${styles.confidence}`}
            aria-labelledby="home-confident"
          >
            <div className={styles.tileTop}>
              <h2 id="home-confident">Vocabulary you know</h2>
              <BookOpen size={20} aria-hidden="true" />
            </div>
            <div className={styles.bigMetric}>
              <strong>{number(knownCount)}</strong>
              <span>known</span>
            </div>
            <div className={styles.bottomCopy}>
              <p>
                {note(
                  vocabulary && lists,
                  level
                    ? `Recall and use demonstrated at ${level}.`
                    : 'Choose a level to assess vocabulary.',
                )}
                <br />
                AI-assessed · Results can be challenged.
              </p>
              <a className={styles.textLink} href="/vocabulary">
                Open vocabulary <ArrowRight size={17} />
              </a>
            </div>
          </section>

          <section
            className={`${styles.tile} ${styles.progress}`}
            aria-labelledby="home-progress"
          >
            <div className={styles.tileTop}>
              <h2 id="home-progress">Progress</h2>
              <span className={styles.pill}>Saved practice</span>
            </div>
            <div className={styles.progressRows}>
              <a href="/vocabulary" className={styles.progressRow}>
                <span className={styles.areaIcon}>
                  <BookOpen size={21} />
                </span>
                <div>
                  <h3>Vocabulary</h3>
                  <p>
                    {note(
                      vocabulary,
                      `${level || 'Current level'} expressions checked`,
                    )}
                  </p>
                </div>
                <strong>{number(vocabularyCount)}</strong>
                <MoveUpRight size={18} />
              </a>
              <a href="/grammar" className={styles.progressRow}>
                <span className={styles.areaIcon}>
                  <Layers3 size={21} />
                </span>
                <div>
                  <h3>Grammar</h3>
                  <p>
                    {note(
                      grammar,
                      'Rules practiced · writing is not yet assessed',
                    )}
                  </p>
                </div>
                <strong>{number(grammar?.practiced)}</strong>
                <MoveUpRight size={18} />
              </a>
              <a href="/vocabulary" className={styles.progressRow}>
                <span className={styles.areaIcon}>
                  <Check size={21} />
                </span>
                <div>
                  <h3>Your lists</h3>
                  <p>{note(lists, 'Words checked in your saved lists')}</p>
                </div>
                <strong>{number(listCount)}</strong>
                <MoveUpRight size={18} />
              </a>
            </div>
            <a className={styles.conversationLink} href="/conversation">
              <MessageCircle size={19} />
              <span>Practice a conversation</span>
              <ArrowRight size={18} />
            </a>
          </section>

          <section
            className={`${styles.tile} ${styles.practice}`}
            aria-labelledby="home-practice"
          >
            <div className={styles.tileTop}>
              <h2 id="home-practice">Needs practice</h2>
              <ArrowRight size={20} aria-hidden="true" />
            </div>
            <p className={styles.description}>
              Gaps identified by your vocabulary assessments.
            </p>
            {suggestions.length > 0 && state !== 'error' ? (
              <ul className={styles.suggestions}>
                {suggestions.map((area) => (
                  <li key={`${area.kind}:${area.id}`}>
                    <a href={area.href}>
                      <span className={styles.suggestionType}>{area.kind}</span>
                      <h3>{area.title}</h3>
                      <span className={styles.suggestionCount}>
                        {countWords(area.needsPractice)} to revisit{' '}
                        <ArrowRight size={16} />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.empty}>
                <h3>
                  {loading
                    ? 'Loading your areas…'
                    : state === 'error' || partial
                      ? 'Updates unavailable'
                      : 'No areas flagged yet'}
                </h3>
                <p>
                  {loading
                    ? 'Checking your saved practice.'
                    : state === 'error' || partial
                      ? 'Retry to check your saved practice.'
                      : 'Complete an assessment to identify expressions to revisit.'}
                </p>
                <a className={styles.textLink} href="/vocabulary">
                  Explore vocabulary <ArrowRight size={17} />
                </a>
              </div>
            )}
          </section>

          <section
            className={`${styles.tile} ${styles.mastery}`}
            aria-labelledby="home-assessment"
          >
            <div className={styles.tileTop}>
              <h2 id="home-assessment">Ready for assessment</h2>
            </div>
            <div className={styles.bigMetric}>
              <strong>{number(unassessedCount)}</strong>
              <span>not assessed</span>
            </div>
            <p>
              Check what you know. Earlier self-ratings do not count as
              assessment results.
            </p>
            <p>
              <strong>{number(retainedCount)}</strong> expressions demonstrated
              again after a delay.
            </p>
            <a className={styles.textLink} href="/vocabulary">
              Assess vocabulary <ArrowRight size={17} />
            </a>
          </section>
        </div>
      </div>
    </main>
  );
}
