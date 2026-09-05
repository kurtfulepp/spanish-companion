'use client';
/* oxlint-disable next/no-html-link-for-pages, next/no-img-element */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowLeft, Camera, Check, ImagePlus, LoaderCircle, LockKeyhole, RefreshCw, Upload, X } from 'lucide-react';
import { VocabularyHeader } from '@/components/vocabulary-header';
import { KURTES_ILLUSTRATIONS } from '@/lib/illustrations';
import { preparePhoto, type PreparedPhoto } from '@/lib/photo-input';
import styles from './photo-vocabulary.module.css';

type Photo = PreparedPhoto & { url: string };
type CaptureState = 'closed' | 'requesting' | 'live';

function cameraError(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') return 'Camera access is blocked. Check this website’s camera permission and your device settings, or upload a photo.';
    if (error.name === 'NotFoundError') return 'No camera was found. You can upload a photo instead.';
    if (error.name === 'NotReadableError') return 'The camera could not start. Close any other app using it and try again, or upload a photo.';
  }
  return 'The camera is unavailable in this browser. Try again or upload a photo.';
}

const subscribeToHydration = () => () => {};

function browserConfiguration(ready: boolean) {
  if (!ready) return { nativeCapture: false, cameraAvailable: false, help: '' };
  const agent = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(agent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const android = /Android/.test(agent);
  const help = ios
    ? 'In your browser’s website settings, allow Camera for this site. If it remains blocked, check the browser’s camera settings in Settings. You can always choose an existing photo instead.'
    : android ? 'Allow Camera in this website’s permissions. If needed, open Android Settings → Apps → your browser → Permissions → Camera.'
      : /Windows/.test(agent) ? 'Allow Camera in this website’s permissions. In Windows Settings → Privacy & security → Camera, check camera access and access for desktop apps such as your browser.'
        : /Mac/.test(agent) ? 'Allow Camera in this website’s browser settings. If your browser is listed in System Settings → Privacy & Security → Camera, allow access there too.'
          : 'Allow camera access in your browser’s website settings. If you opened KurtES inside another app, try its regular browser or upload a photo.';
  return { nativeCapture: ios || android, cameraAvailable: ios || android || typeof navigator.mediaDevices?.getUserMedia === 'function', help };
}

export function PhotoVocabulary({ initialSource }: { initialSource: 'upload' | 'camera' }) {
  const [source, setSource] = useState<'upload' | 'camera'>(initialSource);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [capture, setCapture] = useState<CaptureState>('closed');
  const [videoReady, setVideoReady] = useState(false);
  const hydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const { cameraAvailable, nativeCapture, help } = browserConfiguration(hydrated);
  const [helpOpen, setHelpOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const operation = useRef(0);
  const dragDepth = useRef(0);
  const previewHeading = useRef<HTMLHeadingElement>(null);
  const onProfileChange = useCallback(() => {}, []);

  const stopCamera = useCallback(() => {
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
  }, []);
  const cancelCamera = useCallback(() => {
    operation.current++;
    stopCamera();
    setCapture('closed');
    setVideoReady(false);
    setProcessing(false);
  }, [stopCamera]);

  useEffect(() => {
    const onHidden = () => { if (document.hidden) cancelCamera(); };
    document.addEventListener('visibilitychange', onHidden);
    window.addEventListener('pagehide', cancelCamera);
    return () => {
      cancelCamera();
      document.removeEventListener('visibilitychange', onHidden);
      window.removeEventListener('pagehide', cancelCamera);
    };
  }, [cancelCamera, stopCamera]);

  useEffect(() => {
    if (!photo) return;
    previewHeading.current?.focus();
    return () => URL.revokeObjectURL(photo.url);
  }, [photo]);

  useEffect(() => {
    if (capture !== 'live' || !video.current || !stream.current) return;
    const currentOperation = operation.current;
    video.current.srcObject = stream.current;
    void video.current.play().catch(() => {
      if (operation.current !== currentOperation) return;
      cancelCamera();
      setError('The camera preview could not start. Try again or upload a photo.');
    });
  }, [capture, cancelCamera]);

  async function selectPhoto(blob: Blob) {
    const currentOperation = ++operation.current;
    stopCamera();
    setCapture('closed');
    setProcessing(true);
    setError('');
    try {
      const prepared = await preparePhoto(blob);
      if (operation.current !== currentOperation) return;
      setPhoto({ ...prepared, url: URL.createObjectURL(prepared.blob) });
    } catch (failure) {
      if (operation.current === currentOperation) setError(failure instanceof Error ? failure.message : 'This photo could not be opened. Try another photo.');
    } finally {
      if (operation.current === currentOperation) setProcessing(false);
    }
  }

  function changeSource(next: 'upload' | 'camera') {
    cancelCamera(); setProcessing(false); setSource(next); setError(''); setHelpOpen(false);
  }

  async function openCamera() {
    setError(''); setHelpOpen(false);
    if (nativeCapture) { cameraInput.current?.click(); return; }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera capture is unavailable here. Open KurtES in a regular browser or upload a photo.'); return;
    }
    const currentOperation = ++operation.current;
    setCapture('requesting'); setVideoReady(false);
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      if (operation.current !== currentOperation) { media.getTracks().forEach((track) => track.stop()); return; }
      stream.current = media;
      media.getVideoTracks().forEach((track) => track.addEventListener('ended', () => {
        if (operation.current !== currentOperation) return;
        cancelCamera(); setError('The camera disconnected. Try again or upload a photo.');
      }, { once: true }));
      setCapture('live');
    } catch (failure) {
      if (operation.current !== currentOperation) return;
      stopCamera(); setCapture('closed'); setError(cameraError(failure)); setHelpOpen(true);
    }
  }

  async function capturePhoto() {
    if (!video.current?.videoWidth || !video.current.videoHeight || processing) return;
    const currentOperation = operation.current;
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1536 / Math.max(video.current.videoWidth, video.current.videoHeight));
    canvas.width = Math.round(video.current.videoWidth * scale);
    canvas.height = Math.round(video.current.videoHeight * scale);
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video.current, 0, 0, canvas.width, canvas.height);
    setProcessing(true); stopCamera(); setCapture('closed');
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    canvas.width = canvas.height = 0;
    if (operation.current !== currentOperation) return;
    if (blob) await selectPhoto(blob);
    else { setProcessing(false); setError('The photo could not be captured. Please try again.'); }
  }

  function acceptFiles(files: FileList | null) {
    if (!files?.length) return;
    if (files.length > 1) { setError('Choose one photo at a time.'); return; }
    void selectPhoto(files[0]);
  }

  return <main className={styles.page}>
    <VocabularyHeader onProfileChange={onProfileChange} />
    <div className={styles.content}>
      <a className={styles.back} href="/vocabulary"><ArrowLeft size={17} />Vocabulary</a>
      <header className={styles.heading}>
        <div><p className={styles.eyebrow}>Your vocabulary</p><h1>Photo vocabulary</h1><p>Choose a photo with the things you want to learn.</p></div>
        <img src={KURTES_ILLUSTRATIONS.photoVocabulary.src} alt="" className={styles.headingArt} />
      </header>
      <a className={styles.demoLink} href="/vocabulary/from-photo?demo=kitchen">Try the kitchen demo <span>FPO DATA</span></a>
      <div className={styles.workspace}>
        <section className={styles.photoPanel} aria-label="Photo selection">
          <div className={styles.sourceControls} aria-label="Photo source">
            <button type="button" aria-pressed={source === 'upload'} onClick={() => changeSource('upload')}><Upload size={17} />Upload photo</button>
            {cameraAvailable && <button type="button" aria-pressed={source === 'camera'} onClick={() => changeSource('camera')}><Camera size={18} />Take photo</button>}
          </div>
          <input ref={fileInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" tabIndex={-1} aria-label="Choose a photo file" onChange={(event) => { acceptFiles(event.currentTarget.files); event.currentTarget.value = ''; }} />
          <input ref={cameraInput} className="sr-only" type="file" accept="image/*" capture="environment" tabIndex={-1} aria-label="Take a photo with your device" onChange={(event) => { acceptFiles(event.currentTarget.files); event.currentTarget.value = ''; }} />
          {capture !== 'closed' ? <div className={styles.captureArea}>
            {capture === 'live' ? <video ref={video} className={styles.video} autoPlay playsInline muted aria-label="Live camera preview" onLoadedMetadata={() => setVideoReady(true)} /> : <div className={styles.waiting}><Camera size={36} /><h2>Allow camera access</h2><p>Your browser will ask to use the camera. You can cancel and upload a photo instead.</p></div>}
            <div className={styles.captureActions}><button className={styles.secondaryButton} onClick={cancelCamera}>Cancel</button>{capture === 'live' && <button className={styles.primaryButton} disabled={!videoReady || processing} onClick={() => void capturePhoto()}><Camera size={18} />Capture photo</button>}</div>
          </div> : photo ? <div className={styles.previewArea}>
            <div className={styles.previewTop}><h2 ref={previewHeading} tabIndex={-1}>Your photo</h2><span><Check size={14} />Selected</span></div>
            <div className={styles.previewImage}><img src={photo.url} alt="Selected for vocabulary" /></div>
            <div className={styles.previewActions}><button className={styles.secondaryButton} disabled={processing} onClick={() => source === 'camera' ? void openCamera() : fileInput.current?.click()}><RefreshCw size={16} />{source === 'camera' ? 'Retake photo' : 'Replace photo'}</button><button className={styles.textButton} onClick={() => { cancelCamera(); setPhoto(null); setProcessing(false); setError(''); }}><X size={16} />Remove</button></div>
          </div> : <div className={`${styles.dropArea} ${dragging ? styles.dragging : ''}`}
            onDragEnter={(event) => { event.preventDefault(); dragDepth.current++; setDragging(true); }}
            onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; }}
            onDragLeave={(event) => { event.preventDefault(); if (--dragDepth.current <= 0) { dragDepth.current = 0; setDragging(false); } }}
            onDrop={(event) => { event.preventDefault(); dragDepth.current = 0; setDragging(false); if (!processing) acceptFiles(event.dataTransfer.files); }}>
            <div className={styles.emptyIcon}>{source === 'camera' ? <Camera size={31} strokeWidth={1.5} /> : <ImagePlus size={31} strokeWidth={1.5} />}</div>
            <h2>{source === 'camera' ? 'Take a photo' : 'Choose your photo'}</h2>
            <p>{source === 'camera' ? 'Point your camera at a few everyday objects.' : 'A room, a meal, or a few things on your desk.'}</p>
            <button className={styles.primaryButton} disabled={processing} onClick={() => source === 'camera' ? void openCamera() : fileInput.current?.click()}>{source === 'camera' ? <><Camera size={18} />Open camera</> : <><Upload size={18} />Choose photo</>}</button>
            <span className={styles.fileHint}>{source === 'camera' ? 'Camera access starts only when you choose it.' : 'Or drop one photo here · Up to 20 MB'}</span>
            {source === 'camera' && <button className={styles.textButton} onClick={() => { changeSource('upload'); fileInput.current?.click(); }}>Upload a photo instead</button>}
          </div>}
          {processing && <output className={styles.processing}><LoaderCircle className={styles.spinner} size={17} />Preparing your photo…</output>}
          {error && <div className={styles.error} role="alert">{error}</div>}
          {source === 'camera' && <div className={styles.cameraHelp}><button className={styles.textButton} aria-expanded={helpOpen} aria-controls="camera-help" onClick={() => setHelpOpen(!helpOpen)}>Camera access help</button>{helpOpen && <p id="camera-help">{help}</p>}</div>}
          <div className={styles.privacy}><LockKeyhole size={16} /><p>Your photo stays on this device while you preview it.</p></div>
        </section>
        <aside className={styles.guide} aria-label="Photo tips">
          <span className={styles.guideLabel}>A clear starting point</span><h2>What makes a useful photo?</h2>
          <ul><li><span>01</span><div><h3>Keep objects in view</h3><p>Give each item a little space so it’s easy to recognize.</p></div></li><li><span>02</span><div><h3>Use good light</h3><p>A sharp, well-lit photo is easier to read.</p></div></li><li><span>03</span><div><h3>Choose everyday things</h3><p>Start with the objects you see and use often.</p></div></li></ul>
          <div className={styles.guideNote}><Camera size={20} strokeWidth={1.5} /><p>You can replace or remove your photo at any time.</p></div>
        </aside>
      </div>
    </div>
  </main>;
}
