'use client';
/* oxlint-disable next/no-html-link-for-pages */

import { useEffect, useRef, useState } from 'react';
import { BookOpen, Check, RotateCcw, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { changeCustomList, importBrowserLists, loadCustomLists, type CustomVocabularyList as SavedDemoList } from '@/lib/custom-vocabulary-lists';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import base from './photo-vocabulary.module.css';
import styles from './demo-vocabulary-lists.module.css';

export function DemoVocabularyLists() {
  const [lists, setLists] = useState<SavedDemoList[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [opened, setOpened] = useState<SavedDemoList | null>(null);
  const [deleting, setDeleting] = useState<SavedDemoList | null>(null);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const owner = useRef<string | null>(null);
  const actionPending = useRef(false);
  useEffect(() => {
    let active = true;
    let generation = 0;
    const client = createClient();
    async function refresh() {
      const request = ++generation;
      try {
        const { data, error: authError } = await client.auth.getUser();
        if (!active || request !== generation) return;
        if (authError || !data.user) {
          owner.current = null; setLists([]); setOpened(null); setDeleting(null);
          setError('Sign in again to view your lists.'); setReady(true); return;
        }
        const user = data.user.id;
        if (owner.current !== user) { setLists([]); setOpened(null); setDeleting(null); }
        owner.current = user;
        let importError = '';
        try { await importBrowserLists(client, window.localStorage, user); }
        catch { importError = 'Some existing browser lists could not be moved to your profile. They are still in this browser. Try again.'; }
        const result = await loadCustomLists(client, user);
        if (!active || request !== generation || owner.current !== user) return;
        setLists(result); setError(importError);
      } catch { if (active && request === generation) setError('Your lists could not be loaded. Check your connection and try again.'); }
      finally { if (active && request === generation) setReady(true); }
    }
    const onFocus = () => { void refresh(); };
    const onVisible = () => { if (!document.hidden) void refresh(); };
    const { data: subscription } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user.id !== owner.current) {
        ++generation; owner.current = session?.user.id ?? null;
        setLists([]); setOpened(null); setDeleting(null); setReady(false);
        // Leave the Supabase auth callback before starting a new auth request.
        window.setTimeout(() => { if (active) void refresh(); }, 0);
      }
    });
    void refresh();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => { active = false; ++generation; subscription.subscription.unsubscribe(); window.removeEventListener('focus', onFocus); document.removeEventListener('visibilitychange', onVisible); };
  }, [reload]);
  async function act(list: SavedDemoList, action: 'complete' | 'restore' | 'delete') {
    if (actionPending.current) return;
    actionPending.current = true; setBusy(true); setError('');
    const expectedOwner = owner.current;
    try {
      const client = createClient();
      const { data, error: authError } = await client.auth.getUser();
      if (authError || !data.user || data.user.id !== expectedOwner) throw new Error('Sign in again to change your lists.');
      await changeCustomList(client, data.user.id, list.id, action);
      if (owner.current !== expectedOwner) return;
      setLists(current => action === 'delete' ? current.filter(item => item.id !== list.id) : current.map(item => item.id === list.id ? { ...item, completed: action === 'complete' } : item));
      setMessage(action === 'complete' ? `“${list.name}” moved to Completed.` : action === 'restore' ? `“${list.name}” returned to Your lists.` : `“${list.name}” deleted.`);
      setDeleting(null); setReload(current => current + 1);
    } catch { if (owner.current === expectedOwner) setError('This change could not be saved to your profile. Please try again.'); }
    finally { actionPending.current = false; setBusy(false); }
  }
  function tile(list: SavedDemoList) {
    return <article key={list.id} className={styles.tile}>
      <div className={styles.top}><span className={styles.symbol}><BookOpen size={22} /></span><div className={styles.tools}>
        <button disabled={busy} title={list.completed ? 'Return to active lists' : 'Mark fully learned'} aria-label={`${list.completed ? 'Restore' : 'Mark complete'} ${list.name}`} onClick={() => void act(list, list.completed ? 'restore' : 'complete')}>{list.completed ? <RotateCcw size={17} /> : <Check size={18} />}</button>
        <button disabled={busy} title="Delete list" aria-label={`Delete ${list.name}`} onClick={() => setDeleting(list)}><Trash2 size={17} /></button>
      </div></div>
      <h3><button className={styles.titleButton} onClick={() => setOpened(list)}>{list.name}</button></h3>
      <p>{list.words.length} {list.words.length === 1 ? 'word' : 'words'}{list.completed ? ' · Fully learned' : ''}</p>
      <p>{list.practicedCount ?? 0} practiced · {list.confidentCount ?? 0} confident</p>
      <p className={styles.sample}>{list.words.slice(0, 3).map((word) => word.english).join(' · ')}{list.words.length > 3 ? ' …' : ''}</p>
      <a className={base.primaryButton} href={`/vocabulary/custom/${encodeURIComponent(list.id)}`}>Practice list</a>
      <div className={styles.bottom}><button className={base.textButton} onClick={() => setOpened(list)}>Open list</button>{list.source !== 'photo' && <span>FPO DATA</span>}</div>
    </article>;
  }
  const active = lists.filter((list) => !list.completed);
  const completed = lists.filter((list) => list.completed);
  return <section id="your-lists" className={styles.section} aria-labelledby="your-lists-title">
    <div className={styles.heading}><h2 id="your-lists-title">Your lists</h2></div>
    <p className={styles.intro}>Lists are saved to your profile and available across devices. Photos are never saved.</p>
    {error && <div><p role="alert" className={base.error}>{error}</p><button className={base.textButton} disabled={busy} onClick={() => setReload(current => current + 1)}>Try again</button></div>}
    {message && <output className={styles.message}>{message}</output>}
    {!ready ? <p className={styles.empty}>Loading your lists…</p> : active.length ? <div className={styles.grid}>{active.map(tile)}</div> : <p className={styles.empty}>{completed.length ? 'All your lists are completed. Create another or restore one below.' : 'Your saved lists will appear here.'}</p>}
    {completed.length > 0 && <details className={styles.archive}><summary>Completed ({completed.length})</summary><p>Fully learned lists. Restore one whenever you want to revisit it.</p><div className={styles.grid}>{completed.map(tile)}</div></details>}
    <Dialog open={Boolean(opened)} onOpenChange={(open) => { if (!open) setOpened(null); }}>
      <DialogContent className={styles.dialog}><DialogTitle className={styles.dialogTitle}>{opened?.name}</DialogTitle><DialogDescription>{opened?.source !== 'photo' ? 'FPO DATA · ' : ''}{opened?.words.length} words · {opened?.completed ? 'Fully learned' : 'Saved to your profile'}</DialogDescription>
        <a className={base.primaryButton} href={opened ? `/vocabulary/custom/${encodeURIComponent(opened.id)}` : undefined}>Practice list</a>
        <div className={styles.wordScroll}><table><thead><tr><th>English</th><th>Spanish</th></tr></thead><tbody>{opened?.words.map((word, index) => <tr key={index}><td>{word.english}</td><td lang="es">{word.spanish}</td></tr>)}</tbody></table></div>
      </DialogContent>
    </Dialog>
    <Dialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open && !busy) setDeleting(null); }}>
      <DialogContent className={styles.dialog}><DialogTitle className={styles.dialogTitle}>Delete list?</DialogTitle><DialogDescription>“{deleting?.name}” and its words will be removed from your profile on all devices. This cannot be undone.</DialogDescription>
        {error && <p role="alert">{error}</p>}
        <div className={styles.dialogActions}><button className={base.secondaryButton} disabled={busy} onClick={() => setDeleting(null)}>Cancel</button><button className={base.primaryButton} disabled={busy} onClick={() => { if (deleting) void act(deleting, 'delete'); }}>{busy ? 'Deleting…' : 'Delete list'}</button></div>
      </DialogContent>
    </Dialog>
  </section>;
}
