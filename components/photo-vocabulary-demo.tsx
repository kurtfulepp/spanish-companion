'use client';
/* oxlint-disable next/no-html-link-for-pages, next/no-img-element */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, ImagePlus, LoaderCircle, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { VocabularyHeader } from '@/components/vocabulary-header';
import { KITCHEN_PHOTO, kitchenWords, wordErrors, type DemoWord } from '@/lib/photo-vocabulary-demo';
import { createClient } from '@/lib/supabase/client';
import { writeDemoList } from '@/lib/demo-lists';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import listStyles from './demo-vocabulary-lists.module.css';
import { preparePhoto } from '@/lib/photo-input';
import base from './photo-vocabulary.module.css';
import styles from './photo-vocabulary-demo.module.css';

type Step = 'photo' | 'finding' | 'review' | 'saved';

export function PhotoVocabularyDemo() {
  const [step, setStep] = useState<Step>('photo');
  const [photo, setPhoto] = useState<string | null>(KITCHEN_PHOTO);
  const [words, setWords] = useState<DemoWord[]>(kitchenWords);
  const [title, setTitle] = useState('My kitchen');
  const [naming, setNaming] = useState(false);
  const [savingList, setSavingList] = useState(false);
  const [saveError, setSaveError] = useState('');
  const saveInFlight = useRef(false);
  const savedId = useRef<string | null>(null);
  const [error, setError] = useState('');
  const [preparing, setPreparing] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const pendingPhoto = useRef(0);
  const onProfileChange = useCallback(() => {}, []);
  const selected = words.filter((word) => word.selected);
  const errors = wordErrors(words);
  const valid = selected.length > 0 && Object.keys(errors).length === 0;

  useEffect(() => { heading.current?.focus(); }, [step]);
  useEffect(() => {
    if (step !== 'finding') return;
    // Deliberate demo delay, never an API call or a fabricated progress percentage.
    const timer = window.setTimeout(() => setStep('review'), 1100);
    return () => window.clearTimeout(timer);
  }, [step]);
  useEffect(() => () => { if (photo?.startsWith('blob:')) URL.revokeObjectURL(photo); }, [photo]);
  const invalidatePhoto = useCallback(() => { pendingPhoto.current++; }, []);
  useEffect(() => invalidatePhoto, [invalidatePhoto]);

  function changeWord(id: string, update: Partial<DemoWord>) {
    setWords((current) => current.map((word) => word.id === id ? { ...word, ...update } : word));
  }
  function reset() {
    invalidatePhoto(); setPhoto(KITCHEN_PHOTO); setWords(kitchenWords()); setTitle('My kitchen');
    setStep('photo'); setError(''); setPreparing(false); setPhotoOpen(false); savedId.current = null;
  }
  async function replacePhoto(file: File) {
    const request = ++pendingPhoto.current;
    setPreparing(true); setError('');
    try {
      const prepared = await preparePhoto(file);
      if (request === pendingPhoto.current) setPhoto(URL.createObjectURL(prepared.blob));
    } catch (failure) {
      if (request === pendingPhoto.current) setError(failure instanceof Error ? failure.message : 'Choose another photo.');
    } finally { if (request === pendingPhoto.current) setPreparing(false); }
  }
  function findWords() { setWords(kitchenWords()); setError(''); setStep('finding'); }
  function save() {
    if (!valid) return;
    setWords(selected.map((word) => ({ ...word, english: word.english.trim(), spanish: word.spanish.trim() })));
    setTitle(title.trim()); setPhoto(null); setStep('saved');
  }

  async function saveNamedList(event: { preventDefault(): void }) {
    event.preventDefault();
    if (!title.trim() || saveInFlight.current) return;
    saveInFlight.current = true; setSavingList(true); setSaveError('');
    try {
      const { data, error: authError } = await createClient().auth.getUser();
      if (authError || !data.user) throw new Error('Sign in again to save your list.');
      savedId.current ??= crypto.randomUUID();
      writeDemoList(window.localStorage, data.user.id, {
        id: savedId.current, name: title.trim(), completed: false, createdAt: new Date().toISOString(),
        words: selected.map(({ english, spanish }) => ({ english, spanish })),
      });
      window.location.assign('/vocabulary#your-lists');
    } catch {
      setSaveError('Your list could not be saved in this browser. Your words are still here; please try again.');
      saveInFlight.current = false; setSavingList(false);
    }
  }

  return <main className={base.page}>
    <VocabularyHeader onProfileChange={onProfileChange} />
    <div className={base.content}>
      <a className={base.back} href="/vocabulary"><ArrowLeft size={17} />Vocabulary</a>
      <div className={styles.fpo}><strong>FPO DATA</strong><p>Kitchen demo · Sample words and simulated analysis. Saved lists stay in this browser; photos are never saved.</p></div>
      <header className={styles.header}>
        <div><p className={base.eyebrow}>Photo vocabulary</p><h1 ref={heading} tabIndex={-1}>{step === 'review' ? 'Choose the words to keep' : step === 'saved' ? 'Your list preview' : step === 'finding' ? 'Finding words' : 'Start with a photo'}</h1><p>{step === 'review' ? 'Check the translations. Edit any word and leave out what you don’t need.' : step === 'saved' ? 'This is how your accepted words will appear in a custom list.' : 'Try the kitchen photo below to walk through the experience.'}</p></div>
        <ol className={styles.steps} aria-label="Photo vocabulary steps">{['Photo', 'Review', 'List'].map((label, index) => {
          const current = step === 'saved' ? 2 : step === 'review' ? 1 : 0;
          return <li key={label} aria-current={current === index ? 'step' : undefined} data-complete={current > index}><span>{current > index ? <Check size={14} /> : index + 1}</span>{label}</li>;
        })}</ol>
      </header>

      {(step === 'photo' || step === 'finding') && <div className={styles.previewLayout}>
        <section className={base.photoPanel} aria-label="Demo photo preview">
          <div className={base.previewTop}><h2>Your photo</h2><span>FPO DATA</span></div>
          <img className={styles.largePhoto} src={photo ?? KITCHEN_PHOTO} alt={photo === KITCHEN_PHOTO ? "Kitchen with cooking utensils, appliances, a mug and apples" : "Selected scene for vocabulary"} />
          <div className={base.previewActions}>
            <button className={base.secondaryButton} disabled={step === 'finding' || preparing} onClick={() => fileInput.current?.click()}><RefreshCw size={16} />Replace photo</button>
            {photo !== KITCHEN_PHOTO && <button className={base.textButton} disabled={step === 'finding'} onClick={() => { invalidatePhoto(); setPreparing(false); setPhoto(KITCHEN_PHOTO); setError(''); }}>Use kitchen photo</button>}
          </div>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" className="sr-only" tabIndex={-1} aria-label="Replace demo photo" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) void replacePhoto(file); event.currentTarget.value = ''; }} />
          {error && <p role="alert" className={base.error}>{error}</p>}
          {preparing && <output className={base.processing}>Preparing photo…</output>}
        </section>
        <aside className={styles.nextPanel}>
          <span className={base.eyebrow}>From photo to word list</span><h2>A kitchen in two languages</h2>
          <p>Next, review the everyday objects in English and Spanish. You decide which words belong in your list.</p>
          <div className={styles.example}><span>cutting board</span><ArrowRight size={16} /><strong>la tabla de cortar</strong></div>
          <p className={styles.small}>This demo always returns the same kitchen words, even if you replace the photo.</p>
          {step === 'finding' ? <><output className={styles.finding}><LoaderCircle size={22} className={base.spinner} /><span>Finding words…<small>Simulated for this preview</small></span></output><button className={base.textButton} onClick={() => setStep('photo')}>Cancel</button></> : <button className={base.primaryButton} disabled={preparing} onClick={findWords}>Find words<ArrowRight size={18} /></button>}
        </aside>
      </div>}

      {step === 'review' && <div className={styles.reviewLayout}>
        <aside className={styles.reference}>
          <button className={styles.photoToggle} onClick={() => setPhotoOpen(!photoOpen)} aria-expanded={photoOpen} aria-controls="reference-photo"><ImagePlus size={17} />Your photo<ChevronDown size={17} /></button>
          <div id="reference-photo" className={`${styles.referenceBody} ${photoOpen ? styles.referenceOpen : ''}`}>
            <img src={photo ?? KITCHEN_PHOTO} alt="Selected scene for vocabulary" />
            <button className={base.textButton} onClick={() => setStep('photo')}><RefreshCw size={15} />Change photo</button>
          </div>
          <div className={styles.referenceNote}><h2>You have the final say</h2><p>Keep useful words, correct a translation, or add an item that’s missing.</p><p>Spanish nouns include their article: <strong>el</strong> or <strong>la</strong>.</p></div>
        </aside>
        <section className={base.photoPanel} aria-label="Review vocabulary">
          <div className={styles.reviewTop}><div><h2>Review your words</h2><p aria-live="polite">{selected.length} of {words.length} selected</p></div><div className={styles.selectionActions}><button className={base.textButton} onClick={() => setWords(words.map((word) => ({ ...word, selected: true })))}>Select all</button><button className={base.textButton} onClick={() => setWords(words.map((word) => ({ ...word, selected: false })))}>Clear all</button></div></div>
          <div className={styles.columnLabels} aria-hidden="true"><span>Keep</span><span>English</span><span>Spanish</span><span /></div>
          <div className={styles.words}>{words.map((word, index) => <div key={word.id} className={`${styles.wordRow} ${word.selected ? '' : styles.unselected}`}>
            <input className={styles.checkbox} type="checkbox" checked={word.selected} aria-label={`Keep ${word.english || `word ${index + 1}`}`} onChange={(event) => changeWord(word.id, { selected: event.target.checked })} />
            <label className={styles.wordField}><span>English</span><input aria-label={`English word ${index + 1}`} value={word.english} maxLength={80} aria-invalid={Boolean(errors[word.id])} aria-describedby={errors[word.id] ? `error-${word.id}` : undefined} onChange={(event) => changeWord(word.id, { english: event.target.value })} placeholder="English word" /></label>
            <label className={styles.wordField}><span>Spanish</span><input aria-label={`Spanish word ${index + 1}`} lang="es" value={word.spanish} maxLength={80} aria-invalid={Boolean(errors[word.id])} aria-describedby={errors[word.id] ? `error-${word.id}` : undefined} onChange={(event) => changeWord(word.id, { spanish: event.target.value })} placeholder="Spanish word + article" /></label>
            <button className={styles.remove} aria-label={`Remove ${word.english || `word ${index + 1}`}`} onClick={() => setWords(words.filter((item) => item.id !== word.id))}><Trash2 size={17} /></button>
            {word.note && <p className={styles.note}>{word.note}</p>}
            {errors[word.id] && <p id={`error-${word.id}`} className={styles.rowError}>{errors[word.id]}</p>}
          </div>)}</div>
          {words.length === 0 && <p className={styles.empty}>No words yet. Add a word or go back to find the sample words again.</p>}
          <button className={base.textButton} onClick={() => setWords([...words, { id: crypto.randomUUID(), english: '', spanish: '', note: '', selected: true }])}><Plus size={18} />Add a word</button>
          <div className={styles.saveArea}>
            <div className={styles.saveActions}><p aria-live="polite">{selected.length === 0 ? 'Select at least one word to continue.' : Object.keys(errors).length ? 'Check the highlighted words before continuing.' : `${selected.length} selected words are ready to preview.`}</p><button className={base.primaryButton} disabled={!valid} onClick={save}>Preview list<ArrowRight size={17} /></button></div>
          </div>
        </section>
      </div>}

      {step === 'saved' && <section className={styles.saved} aria-label="List preview">
        <div className={styles.savedHeader}><span className={styles.savedCheck}><Check size={26} /></span><div><p className={base.eyebrow}>Ready to save · FPO DATA</p><h2>Your selected words</h2><p>{selected.length} {selected.length === 1 ? 'word' : 'words'} in your list preview</p></div></div>
        <p className={styles.savedNotice}>Review your words, then save and name your list. Your temporary photo preview has been cleared.</p>
        <table className={styles.savedWords}><thead><tr><th scope="col">English</th><th scope="col">Spanish</th></tr></thead><tbody>{selected.map((word) => <tr key={word.id}><td>{word.english}</td><td lang="es">{word.spanish}</td></tr>)}</tbody></table>
        <div className={styles.savedActions}><button className={base.secondaryButton} onClick={reset}><RefreshCw size={16} />Try again</button><button className={base.primaryButton} onClick={() => { setSaveError(''); setNaming(true); }}>Save list<ArrowRight size={17} /></button></div>
      </section>}
    </div>
    <Dialog open={naming} onOpenChange={(open) => { if (!savingList) setNaming(open); }}>
      <DialogContent className={listStyles.dialog} showCloseButton={!savingList}>
        <DialogTitle className={listStyles.dialogTitle}>Name My List</DialogTitle>
        <DialogDescription>Give these {selected.length} words a name. Your list will appear below Create Your Own on Vocabulary.</DialogDescription>
        <form onSubmit={(event) => void saveNamedList(event)}>
          <label className={styles.listName}>List name<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="For example, My kitchen" required disabled={savingList} /></label>
          <p className={listStyles.storageNote}>FPO DATA · Saved in this browser only, for your signed-in user. No photo is stored.</p>
          {saveError && <p role="alert" className={base.error}>{saveError}</p>}
          <div className={listStyles.dialogActions}><button type="button" className={base.secondaryButton} disabled={savingList} onClick={() => setNaming(false)}>Cancel</button><button type="submit" className={base.primaryButton} disabled={!title.trim() || savingList}>{savingList ? 'Saving…' : 'Save'}</button></div>
        </form>
      </DialogContent>
    </Dialog>
  </main>;
}
