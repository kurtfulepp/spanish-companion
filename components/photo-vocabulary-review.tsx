'use client';
/* oxlint-disable next/no-html-link-for-pages, next/no-img-element */

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, ImagePlus, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { VocabularyHeader } from '@/components/vocabulary-header';
import type { PhotoAnalysis } from '@/lib/photo-analysis';
import { wordErrors, type ReviewWord } from '@/lib/photo-vocabulary-review';
import { createClient } from '@/lib/supabase/client';
import { saveCustomList } from '@/lib/custom-vocabulary-lists';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import listStyles from './demo-vocabulary-lists.module.css';
import base from './photo-vocabulary.module.css';
import styles from './photo-vocabulary-review.module.css';

type Step = 'review' | 'saved';

import type { LearnerProfile } from '@/lib/learner-profile';

type Props = { result: PhotoAnalysis; photoUrl?: string | null; onChoosePhoto?: () => void; onReleasePhoto?: () => void; onProfileChange?: (profile: LearnerProfile) => void };
export function PhotoVocabularyReview({ result, photoUrl, onChoosePhoto, onReleasePhoto, onProfileChange = () => {} }: Props) {
  const [step, setStep] = useState<Step>('review');
  const [photo, setPhoto] = useState<string | null>(photoUrl ?? null);
  const [words, setWords] = useState<ReviewWord[]>(() => result.items.map((item, i) => ({ id: `photo-${i}`, english: item.english, spanish: item.spanish, note: item.usage_note ?? '', selected: true })));
  const [title, setTitle] = useState(result.suggested_title);
  const [naming, setNaming] = useState(false);
  const [savingList, setSavingList] = useState(false);
  const [saveError, setSaveError] = useState('');
  const saveInFlight = useRef(false);
  const savedId = useRef<string | null>(null);
  const [photoOpen, setPhotoOpen] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const selected = words.filter((word) => word.selected);
  const errors = wordErrors(words);
  const valid = selected.length > 0 && Object.keys(errors).length === 0;

  useEffect(() => { heading.current?.focus(); }, [step]);
  function changeWord(id: string, update: Partial<ReviewWord>) {
    setWords((current) => current.map((word) => word.id === id ? { ...word, ...update } : word));
  }
  function save() {
    if (!valid) return;
    setWords(selected.map((word) => ({ ...word, english: word.english.trim(), spanish: word.spanish.trim() })));
    setTitle(title.trim()); setPhoto(null); onReleasePhoto?.(); setStep('saved');
  }

  async function saveNamedList(event: { preventDefault(): void }) {
    event.preventDefault();
    if (!title.trim() || saveInFlight.current) return;
    saveInFlight.current = true; setSavingList(true); setSaveError('');
    try {
      const client = createClient();
      const { data, error: authError } = await client.auth.getUser();
      if (authError || !data.user) throw new Error('Sign in again to save your list.');
      savedId.current ??= crypto.randomUUID();
      await saveCustomList(client, data.user.id, {
        id: savedId.current, name: title.trim(), source: 'photo', completed: false, createdAt: new Date().toISOString(),
        cefrLevel: result.cefr_level,
        words: selected.map(({ english, spanish }) => ({ english, spanish })),
      });
      window.location.assign('/vocabulary#your-lists');
    } catch {
      setSaveError('Your list could not be saved to your profile. Your words are still here; please try again.');
      saveInFlight.current = false; setSavingList(false);
    }
  }

  return <main className={base.page}>
    <VocabularyHeader onProfileChange={onProfileChange} />
    <div className={base.content}>
      <a className={base.back} href="/vocabulary"><ArrowLeft size={17} />Vocabulary</a>
      <header className={styles.header}>
        <div><p className={base.eyebrow}>{result.cefr_level} photo vocabulary</p><h1 ref={heading} tabIndex={-1}>{step === 'review' ? 'Choose the words to keep' : 'Your list preview'}</h1><p>{step === 'review' ? 'Check the translations. Edit any word and leave out what you don’t need.' : 'This is how your accepted words will appear in a custom list.'}</p></div>
        <ol className={styles.steps} aria-label="Photo vocabulary steps">{['Photo', 'Review', 'List'].map((label, index) => {
          const current = step === 'saved' ? 2 : step === 'review' ? 1 : 0;
          return <li key={label} aria-current={current === index ? 'step' : undefined} data-complete={current > index}><span>{current > index ? <Check size={14} /> : index + 1}</span>{label}</li>;
        })}</ol>
      </header>

      {step === 'review' && <div className={styles.reviewLayout}>
        <aside className={styles.reference}>
          <button className={styles.photoToggle} onClick={() => setPhotoOpen(!photoOpen)} aria-expanded={photoOpen} aria-controls="reference-photo"><ImagePlus size={17} />Your photo<ChevronDown size={17} /></button>
          <div id="reference-photo" className={`${styles.referenceBody} ${photoOpen ? styles.referenceOpen : ''}`}>
            {photo && <img src={photo} alt="Selected scene for vocabulary" />}
            <button className={base.textButton} onClick={onChoosePhoto}><RefreshCw size={15} />Change photo</button>
          </div>
          <div className={styles.referenceNote}><h2>You have the final say</h2><p>Keep useful words, correct a translation, or add an item that’s missing.</p><p>Spanish nouns include their article: <strong>el</strong> or <strong>la</strong>.</p></div>
        </aside>
        <section className={base.photoPanel} aria-label="Review vocabulary">
          <div className={styles.reviewTop}><div><h2>Review your words</h2><p aria-live="polite">{selected.length} of {words.length} selected</p></div><div className={styles.selectionActions}><button className={base.textButton} onClick={() => setWords(words.map((word) => ({ ...word, selected: true })))}>Select all</button><button className={base.textButton} onClick={() => setWords(words.map((word) => ({ ...word, selected: false })))}>Clear all</button></div></div>
          <div className={styles.columnLabels} aria-hidden="true"><span>Keep</span><span>English</span><span>Spanish</span><span /></div>
          <div className={styles.words}>{words.map((word, index) => <div key={word.id} className={`${styles.wordRow} ${word.selected ? '' : styles.unselected}`}>
            <input className={styles.checkbox} type="checkbox" checked={word.selected} aria-label={`Keep ${word.english || `word ${index + 1}`}`} onChange={(event) => changeWord(word.id, { selected: event.target.checked })} />
            <label className={styles.wordField}><span>English</span><input aria-label={`English word ${index + 1}`} value={word.english} maxLength={100} aria-invalid={Boolean(errors[word.id])} aria-describedby={errors[word.id] ? `error-${word.id}` : undefined} onChange={(event) => changeWord(word.id, { english: event.target.value })} placeholder="English word" /></label>
            <label className={styles.wordField}><span>Spanish</span><input aria-label={`Spanish word ${index + 1}`} lang="es" value={word.spanish} maxLength={100} aria-invalid={Boolean(errors[word.id])} aria-describedby={errors[word.id] ? `error-${word.id}` : undefined} onChange={(event) => changeWord(word.id, { spanish: event.target.value })} placeholder="Spanish word + article" /></label>
            <button className={styles.remove} aria-label={`Remove ${word.english || `word ${index + 1}`}`} onClick={() => setWords(words.filter((item) => item.id !== word.id))}><Trash2 size={17} /></button>
            {word.note && <p className={styles.note}>{word.note}</p>}
            {errors[word.id] && <p id={`error-${word.id}`} className={styles.rowError}>{errors[word.id]}</p>}
          </div>)}</div>
          {words.length === 0 && <p className={styles.empty}>No words yet. Add a word or choose another photo.</p>}
          <button className={base.textButton} onClick={() => setWords([...words, { id: crypto.randomUUID(), english: '', spanish: '', note: '', selected: true }])}><Plus size={18} />Add a word</button>
          <div className={styles.saveArea}>
            <div className={styles.saveActions}><p aria-live="polite">{selected.length === 0 ? 'Select at least one word to continue.' : Object.keys(errors).length ? 'Check the highlighted words before continuing.' : `${selected.length} selected words are ready to preview.`}</p><button className={base.primaryButton} disabled={!valid} onClick={save}>Preview list<ArrowRight size={17} /></button></div>
          </div>
        </section>
      </div>}

      {step === 'saved' && <section className={styles.saved} aria-label="List preview">
        <div className={styles.savedHeader}><span className={styles.savedCheck}><Check size={26} /></span><div><p className={base.eyebrow}>Ready to save</p><h2>Your selected words</h2><p>{selected.length} {selected.length === 1 ? 'word' : 'words'} in your list preview</p></div></div>
        <p className={styles.savedNotice}>Review your words, then save and name your list. Your temporary photo preview has been cleared.</p>
        <table className={styles.savedWords}><thead><tr><th scope="col">English</th><th scope="col">Spanish</th></tr></thead><tbody>{selected.map((word) => <tr key={word.id}><td>{word.english}</td><td lang="es">{word.spanish}</td></tr>)}</tbody></table>
        <div className={styles.savedActions}><button className={base.secondaryButton} onClick={onChoosePhoto}><RefreshCw size={16} />Choose another photo</button><button className={base.primaryButton} onClick={() => { setSaveError(''); setNaming(true); }}>Save list<ArrowRight size={17} /></button></div>
      </section>}
    </div>
    <Dialog open={naming} onOpenChange={(open) => { if (!savingList) setNaming(open); }}>
      <DialogContent className={listStyles.dialog} showCloseButton={!savingList}>
        <DialogTitle className={listStyles.dialogTitle}>Name My List</DialogTitle>
        <DialogDescription>Give these {selected.length} words a name. Your list will appear below Create Your Own on Vocabulary.</DialogDescription>
        <form onSubmit={(event) => void saveNamedList(event)}>
          <label className={styles.listName}>List name<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="For example, My kitchen" required disabled={savingList} /></label>
          <p className={listStyles.storageNote}>Saved to your profile across devices. No photo is stored.</p>
          {saveError && <p role="alert" className={base.error}>{saveError}</p>}
          <div className={listStyles.dialogActions}><button type="button" className={base.secondaryButton} disabled={savingList} onClick={() => setNaming(false)}>Cancel</button><button type="submit" className={base.primaryButton} disabled={!title.trim() || savingList}>{savingList ? 'Saving…' : 'Save'}</button></div>
        </form>
      </DialogContent>
    </Dialog>
  </main>;
}
