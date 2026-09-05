'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Check, RotateCcw, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { changeDemoList, DEMO_LISTS_CHANGED, readDemoLists, type SavedDemoList } from '@/lib/demo-lists';
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
  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const { data, error: authError } = await createClient().auth.getUser();
        if (!active) return;
        if (authError || !data.user) { setLists([]); setReady(true); return; }
        setLists(readDemoLists(window.localStorage, data.user.id)); setError('');
      } catch { if (active) setError('Your browser lists could not be loaded. Existing data has not been changed.'); }
      finally { if (active) setReady(true); }
    }
    // Listen to all storage changes; never inspect other storage values.
    const onStorage = () => { void refresh(); };
    void refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener(DEMO_LISTS_CHANGED, onStorage);
    return () => { active = false; window.removeEventListener('storage', onStorage); window.removeEventListener(DEMO_LISTS_CHANGED, onStorage); };
  }, []);
  async function act(list: SavedDemoList, action: 'complete' | 'restore' | 'delete') {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const { data, error: authError } = await createClient().auth.getUser();
      if (authError || !data.user) throw new Error('Sign in again to change your lists.');
      setLists(changeDemoList(window.localStorage, data.user.id, list.id, action));
      setMessage(action === 'complete' ? `“${list.name}” moved to Completed.` : action === 'restore' ? `“${list.name}” returned to Your lists.` : `“${list.name}” deleted.`);
      setDeleting(null);
    } catch { setError('This change could not be saved in your browser. Please try again.'); }
    finally { setBusy(false); }
  }
  function tile(list: SavedDemoList) {
    return <article key={list.id} className={styles.tile}>
      <div className={styles.top}><span className={styles.symbol}><BookOpen size={22} /></span><div className={styles.tools}>
        <button disabled={busy} title={list.completed ? 'Return to active lists' : 'Mark fully learned'} aria-label={`${list.completed ? 'Restore' : 'Mark complete'} ${list.name}`} onClick={() => void act(list, list.completed ? 'restore' : 'complete')}>{list.completed ? <RotateCcw size={17} /> : <Check size={18} />}</button>
        <button disabled={busy} title="Delete list" aria-label={`Delete ${list.name}`} onClick={() => setDeleting(list)}><Trash2 size={17} /></button>
      </div></div>
      <h3><button className={styles.titleButton} onClick={() => setOpened(list)}>{list.name}</button></h3>
      <p>{list.words.length} {list.words.length === 1 ? 'word' : 'words'}{list.completed ? ' · Fully learned' : ''}</p>
      <p className={styles.sample}>{list.words.slice(0, 3).map((word) => word.english).join(' · ')}{list.words.length > 3 ? ' …' : ''}</p>
      <div className={styles.bottom}><button className={base.textButton} onClick={() => setOpened(list)}>Open list</button><span>FPO DATA</span></div>
    </article>;
  }
  const active = lists.filter((list) => !list.completed);
  const completed = lists.filter((list) => list.completed);
  return <section id="your-lists" className={styles.section} aria-labelledby="your-lists-title">
    <div className={styles.heading}><h2 id="your-lists-title">Your lists</h2><span>FPO DATA</span></div>
    <p className={styles.intro}>Demo lists are saved in this browser for your signed-in user. Photos are never saved.</p>
    {error && <p role="alert" className={base.error}>{error}</p>}
    {message && <output className={styles.message}>{message}</output>}
    {!ready ? <p className={styles.empty}>Loading your lists…</p> : active.length ? <div className={styles.grid}>{active.map(tile)}</div> : <p className={styles.empty}>{completed.length ? 'All your lists are completed. Create another or restore one below.' : 'Your saved lists will appear here.'}</p>}
    {completed.length > 0 && <details className={styles.archive}><summary>Completed ({completed.length})</summary><p>Fully learned lists. Restore one whenever you want to revisit it.</p><div className={styles.grid}>{completed.map(tile)}</div></details>}
    <Dialog open={Boolean(opened)} onOpenChange={(open) => { if (!open) setOpened(null); }}>
      <DialogContent className={styles.dialog}><DialogTitle className={styles.dialogTitle}>{opened?.name}</DialogTitle><DialogDescription>FPO DATA · {opened?.words.length} words · {opened?.completed ? 'Fully learned' : 'Your saved browser list'}</DialogDescription>
        <div className={styles.wordScroll}><table><thead><tr><th>English</th><th>Spanish</th></tr></thead><tbody>{opened?.words.map((word, index) => <tr key={index}><td>{word.english}</td><td lang="es">{word.spanish}</td></tr>)}</tbody></table></div>
      </DialogContent>
    </Dialog>
    <Dialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open && !busy) setDeleting(null); }}>
      <DialogContent className={styles.dialog}><DialogTitle className={styles.dialogTitle}>Delete list?</DialogTitle><DialogDescription>“{deleting?.name}” and its words will be removed from this browser. This cannot be undone.</DialogDescription>
        {error && <p role="alert">{error}</p>}
        <div className={styles.dialogActions}><button className={base.secondaryButton} disabled={busy} onClick={() => setDeleting(null)}>Cancel</button><button className={base.primaryButton} disabled={busy} onClick={() => { if (deleting) void act(deleting, 'delete'); }}>{busy ? 'Deleting…' : 'Delete list'}</button></div>
      </DialogContent>
    </Dialog>
  </section>;
}
