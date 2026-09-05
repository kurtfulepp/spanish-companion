'use client';
/* oxlint-disable next/no-html-link-for-pages */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, RotateCcw } from 'lucide-react';
import { VocabularyHeader } from '@/components/vocabulary-header';
import { createClient } from '@/lib/supabase/client';
import { loadPractice, practiceQueue, recordReview, type WordProgress, type WordStatus } from '@/lib/custom-vocabulary-practice';
import type { CustomVocabularyList } from '@/lib/custom-vocabulary-lists';
import base from './photo-vocabulary.module.css';
import styles from './custom-vocabulary-practice.module.css';

export function CustomVocabularyPractice({ listId }: { listId: string }) {
  const [list, setList] = useState<CustomVocabularyList | null>(null);
  const [progress, setProgress] = useState<WordProgress>({});
  const [mode, setMode] = useState<'overview' | 'practice' | 'summary'>('overview');
  const [queue, setQueue] = useState<number[]>([]);
  const [position, setPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const owner = useRef<string | null>(null);
  const alive = useRef(false);
  const inFlight = useRef(false);
  const generation = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const onProfileChange = useCallback(() => {}, []);
  const wordHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { (mode === 'practice' ? wordHeading : heading).current?.focus(); }, [mode, position, loading]);
  useEffect(() => {
    alive.current = true;
    const client = createClient();
    async function refresh() {
      if (inFlight.current) return;
      const request = ++generation.current;
      try {
        const { data, error: authError } = await client.auth.getUser();
        if (!alive.current || request !== generation.current) return;
        if (authError || !data.user) { window.location.replace('/sign-in'); return; }
        owner.current = data.user.id;
        const result = await loadPractice(client, data.user.id, listId);
        if (!alive.current || request !== generation.current) return;
        setList(result.list); setProgress(result.progress); setError('');
      } catch (failure) {
        if (alive.current && request === generation.current) {
          setList(null); setProgress({}); setMode('overview');
          setError(failure instanceof Error ? failure.message : 'This list could not be loaded. Please try again.');
        }
      } finally { if (alive.current && request === generation.current) setLoading(false); }
    }
    const { data: listener } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (owner.current && session?.user.id !== owner.current)) {
        ++generation.current; owner.current = null; setList(null); setProgress({}); window.location.replace('/sign-in');
      }
    });
    const visible = () => { if (!document.hidden) void refresh(); };
    void refresh();
    window.addEventListener('focus', refresh); document.addEventListener('visibilitychange', visible);
    // This ref is a request version, not a DOM node. Invalidate pending loads on cleanup.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    return () => { alive.current = false; ++generation.current; listener.subscription.unsubscribe(); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', visible); };
  }, [listId, reload]);

  function start(all: boolean) {
    if (!list) return;
    const next = practiceQueue(list.words.length, progress, all);
    if (!next.length) return;
    setQueue(next); setPosition(0); setRevealed(false); setError(''); setMode('practice');
  }
  async function answer(status: WordStatus) {
    if (!list || !revealed || inFlight.current) return;
    inFlight.current = true; ++generation.current; setSaving(true); setError('');
    const expectedOwner = owner.current;
    const index = queue[position];
    try {
      const client = createClient();
      const { data, error: authError } = await client.auth.getUser();
      if (authError || !data.user || data.user.id !== expectedOwner) throw new Error('Sign in again before continuing.');
      const result = await recordReview(client, listId, index, status);
      if (!alive.current || owner.current !== expectedOwner) return;
      setProgress(current => ({ ...current, [index]: status }));
      setList(current => current && ({ ...current, completed: result.completed, practicedCount: result.practiced_count, confidentCount: result.confident_count }));
      setRevealed(false);
      if (position + 1 === queue.length) setMode('summary');
      else setPosition(current => current + 1);
    } catch (failure) {
      if (alive.current && owner.current === expectedOwner) setError(failure instanceof Error ? failure.message : 'Your answer could not be saved. Try again.');
    } finally { inFlight.current = false; if (alive.current) setSaving(false); }
  }
  const remaining = list ? practiceQueue(list.words.length, progress).length : 0;
  const currentWord = list?.words[queue[position]];
  return <main className={base.page}>
    <VocabularyHeader onProfileChange={onProfileChange} />
    <div className={base.content}>
      <a href="/vocabulary#your-lists" className={base.back}><ArrowLeft size={17} />Your lists</a>
      {loading ? <output className={styles.panel}>Loading your list and progress…</output> : <>
        <header className={styles.header}><p className={base.eyebrow}>Custom vocabulary {list?.source === 'demo' && '· FPO DATA'}</p><h1 ref={heading} tabIndex={-1}>{list?.name ?? 'List unavailable'}</h1></header>
        {error && <div role="alert" className={base.error}><p>{error}</p>{mode !== 'practice' && <button className={base.textButton} onClick={() => setReload(value => value + 1)}>Try again</button>}</div>}
        {list && mode === 'overview' && <section className={styles.panel} aria-label="List practice overview">
          <h2>Practice your words</h2><p>{list.words.length} words · {list.practicedCount ?? 0} practiced · {list.confidentCount ?? 0} confident</p>
          <p>Recall the Spanish, reveal the answer, then decide what needs another review. Each choice saves to your profile.</p>
          {list.completed && <p className={styles.notice}>This list is in Completed. You can review it whenever you like.</p>}
          <div className={styles.actions}>{remaining > 0 && <button className={base.primaryButton} disabled={Boolean(error)} onClick={() => start(false)}>Practice {remaining} {remaining === 1 ? 'word' : 'words'}<ArrowRight size={18} /></button>}<button className={base.secondaryButton} disabled={Boolean(error)} onClick={() => start(true)}>Review all words<RotateCcw size={17} /></button></div>
        </section>}
        {list && mode === 'practice' && currentWord && <section className={styles.panel} aria-label="Word practice" aria-busy={saving}>
          <div className={styles.top}><button className={base.textButton} disabled={saving} onClick={() => { setMode('overview'); setReload(value => value + 1); }}>Exit practice</button><span>Word {position + 1} of {queue.length}</span></div>
          <progress className={styles.progress} value={position} max={queue.length} aria-label="Words reviewed this session" />
          <div className={styles.card}><p>How would you say this in Spanish?</p><h2 ref={wordHeading} tabIndex={-1}>{currentWord.english}</h2>
            {!revealed ? <button className={base.secondaryButton} onClick={() => setRevealed(true)}><Eye size={18} />Reveal Spanish</button> : <div className={styles.answer}><p lang="es">{currentWord.spanish}</p></div>}
          </div>
          {revealed && <div className={styles.actions}><button disabled={saving} className={base.secondaryButton} onClick={() => void answer('learning')}>Needs practice</button><button disabled={saving} className={base.primaryButton} onClick={() => void answer('confident')}><Check size={18} />I knew it</button></div>}
          {saving && <output>Saving your progress…</output>}
        </section>}
        {list && mode === 'summary' && <section className={styles.panel} aria-label="Practice summary"><h2>Practice saved</h2><p>{queue.length} {queue.length === 1 ? 'word reviewed' : 'words reviewed'} this session.</p><p>{list.confidentCount ?? 0} of {list.words.length} words confident.</p>
          <p className={styles.notice}>{list.completed ? 'Every word is confident. Your list has moved to Completed.' : 'Your progress is saved. Words that need practice will be ready next time.'}</p>
          <div className={styles.actions}>{remaining > 0 && <button className={base.primaryButton} onClick={() => start(false)}>Practice remaining words<ArrowRight size={18} /></button>}<button className={base.secondaryButton} onClick={() => { setMode('overview'); setReload(value => value + 1); }}>List overview</button><a className={base.textButton} href="/vocabulary#your-lists">Back to your lists</a></div>
        </section>}
      </>}
    </div>
  </main>;
}
