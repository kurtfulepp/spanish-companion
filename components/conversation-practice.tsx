'use client';
/* oxlint-disable next/no-html-link-for-pages, next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  LoaderCircle,
  LockKeyhole,
  MessageCircle,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { SpeechButton } from '@/components/speech-button';
import { topicPresentation } from '@/lib/vocabulary-topics';
import type { CEFRLevel } from '@/lib/cefr';
import {
  playSpanishSpeech,
  stopSpanishSpeech,
  type VoicePreference,
} from '@/lib/speech';
import { ConversationMicrophone } from '@/components/conversation-microphone';
import { Switch } from '@/components/ui/switch';
import {
  MAX_CONVERSATION_MESSAGE,
  MAX_CONVERSATION_TURNS,
  type ConversationCatalog,
  type ConversationTopic,
  type ConversationScenario,
  type ConversationMessage,
  type ConversationReply,
  type ConversationReview,
} from '@/lib/conversation';
import { directFeedback, personalizeFeedback } from '@/lib/feedback-language';
import { AnswerDifference } from './answer-difference';
import styles from './conversation-practice.module.css';
import { PracticeTimeTracker } from './practice-time-tracker';

type Session = { topic: ConversationTopic; scenario: ConversationScenario };
export function ConversationPractice({
  level,
  voice,
  displayName,
}: {
  level: CEFRLevel;
  voice: VoicePreference;
  displayName?: string | null;
}) {
  const [catalog, setCatalog] = useState<ConversationCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [topicId, setTopicId] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [review, setReview] = useState<ConversationReview | null>(null);
  const [busy, setBusy] = useState<'start' | 'turn' | 'review' | null>(null);
  const [error, setError] = useState('');
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [microphoneBusy, setMicrophoneBusy] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(true);
  const speakEnabled = useRef(true);
  const [audioStatus, setAudioStatus] = useState('');
  const audioVersion = useRef(0);
  const inFlight = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement | null>(null);
  const composer = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      await Promise.resolve();
      if (controller.signal.aborted) return;
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/conversation', {
          signal: controller.signal,
          cache: 'no-store',
        });
        const result = (await response.json()) as ConversationCatalog & {
          error?: string;
        };
        if (!response.ok)
          throw new Error(result.error || 'Your practice could not be loaded.');
        if (result.level !== level)
          throw new Error(
            'Your profile level changed. Refresh the page to load your current practice.',
          );
        if (controller.signal.aborted) return;
        setCatalog(result);
        const requested = new URLSearchParams(window.location.search).get(
          'topic',
        );
        if (requested) setTopicId(requested);
      } catch (e) {
        if (!controller.signal.aborted)
          setError(
            e instanceof Error
              ? e.message
              : 'Your practice could not be loaded.',
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [level, reload]);
  useEffect(
    () => () => {
      inFlight.current?.abort();
      stopSpanishSpeech();
      audioVersion.current += 1;
    },
    [],
  );
  useEffect(() => {
    if (messages.length) end.current?.scrollIntoView({ block: 'nearest' });
  }, [messages.length, review]);
  useEffect(() => {
    if (!session) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [session]);

  async function generate(
    action: 'start' | 'turn' | 'review',
    active: Session = session!,
    history = messages,
  ) {
    if (inFlight.current || !active || microphoneBusy) return;
    if (
      action === 'turn' &&
      (!draft.trim() || draft.length > MAX_CONVERSATION_MESSAGE)
    )
      return;
    stopAudio();
    const controller = new AbortController();
    inFlight.current = controller;
    setBusy(action);
    setError('');
    const nextMessages: ConversationMessage[] =
      action === 'turn'
        ? [...history, { role: 'user', content: draft.trim() }]
        : history;
    try {
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          action,
          topicId: active.topic.id,
          scenarioId: active.scenario.id,
          level,
          messages: nextMessages.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });
      const result: {
        error?: string;
        reply?: ConversationReply;
        review?: ConversationReview;
      } = await response.json();
      if (!response.ok)
        throw new Error(result.error || 'Your reply could not be loaded.');
      if (controller.signal.aborted) return;
      if (action === 'review') {
        if (!result.review) throw new Error('Your review could not be loaded.');
        setReview(result.review);
      } else {
        if (!result.reply) throw new Error('Your reply could not be loaded.');
        setMessages([
          ...nextMessages,
          {
            role: 'assistant',
            content: result.reply.spanish,
            translation: result.reply.english,
            hint: result.reply.hint,
          },
        ]);
        setDraft('');
        if (speakEnabled.current) void speak(result.reply.spanish);
        requestAnimationFrame(() => composer.current?.focus());
      }
    } catch (e) {
      if (!controller.signal.aborted)
        setError(
          e instanceof Error
            ? e.message
            : 'Your reply could not be loaded. Try again.',
        );
    } finally {
      if (inFlight.current === controller) {
        inFlight.current = null;
        if (!controller.signal.aborted) setBusy(null);
      }
    }
  }
  function stopAudio() {
    audioVersion.current += 1;
    stopSpanishSpeech();
    setAudioStatus('');
  }
  async function speak(text: string) {
    if (document.visibilityState === 'hidden') return;
    const version = ++audioVersion.current;
    setAudioStatus('Preparing or playing the reply…');
    try {
      await playSpanishSpeech(text, voice);
      if (version === audioVersion.current) setAudioStatus('');
    } catch {
      if (version === audioVersion.current)
        setAudioStatus(
          'Automatic playback was unavailable. Select Listen beside the reply to try again.',
        );
    }
  }
  function start(topic: ConversationTopic, scenario: ConversationScenario) {
    const active = { topic, scenario };
    setSession(active);
    setMessages([]);
    setReview(null);
    setDraft('');
    void generate('start', active, []);
  }
  function leave() {
    stopAudio();
    setMicrophoneBusy(false);
    inFlight.current?.abort();
    inFlight.current = null;
    setBusy(null);
    setSession(null);
    setMessages([]);
    setReview(null);
    setDraft('');
    setError('');
    setLeaveOpen(false);
    setReload((n) => n + 1);
  }
  const topics = catalog?.topics ?? [];
  const practicedTopics = topics.filter((t) => t.practicedCount > 0);
  const selected = topics.find((t) => t.id === topicId);
  const turns = messages.filter((m) => m.role === 'user').length;
  const last = messages.at(-1);
  return (
    <div className={styles.root}>
      <PracticeTimeTracker
        active={
          !!session && messages.length > 0 && !review && !busy && !leaveOpen
        }
        area="conversation"
        level={level}
      />
      <section className={`brand-hero ${styles.hero}`}>
        <p className={styles.eyebrow}>
          <MessageCircle size={16} />
          {level} conversation · First version
        </p>
        <h1>
          {session
            ? session.scenario.title
            : 'Conversations from your practice'}
        </h1>
      </section>
      {!session && (
        <section
          className={styles.scope}
          aria-label="What this version includes"
        >
          <div>
            <h2>Available now</h2>
            <p>
              Speak or type a conversation based on your practiced vocabulary.
              Check your transcription, send it, and hear your partner reply.
              Take up to six turns with hints, translations, and an AI review.
            </p>
          </div>
          <div>
            <h2>Not included yet</h2>
            <p>
              Hands-free conversation, interruptions, pronunciation scoring,
              custom scenarios, saved history, or conversations based on grammar
              lessons and custom word lists.
            </p>
          </div>
          <p className={styles.scopeNote}>
            Conversations stay in this tab and are lost when you leave or
            refresh. AI feedback can be mistaken and does not change your
            learning level or vocabulary ratings.
          </p>
        </section>
      )}
      {error && !session && (
        <div role="alert" className={styles.error}>
          <p>{error}</p>
          {!session && (
            <Button
              className={styles.secondary}
              onClick={() => setReload((n) => n + 1)}
            >
              Try again
            </Button>
          )}
        </div>
      )}
      {loading && !session && (
        <output className={styles.panel}>Loading your practiced topics…</output>
      )}
      {!loading && catalog && !session && (
        <>
          {!catalog.available && (
            <output className={styles.error}>
              Conversations are not configured yet. You can keep practicing
              vocabulary while they are unavailable.
            </output>
          )}
          <div className={styles.sectionHeading}>
            <h2>Your practiced topics</h2>
            <p>
              {practicedTopics.length} available at {level}
            </p>
          </div>
          {!practicedTopics.length && (
            <div className={styles.panel}>
              <h3>Practice a topic to start</h3>
              <p>
                Complete an assessment in a vocabulary topic at {level}. Its
                related conversation will then be available here.
              </p>
              <a className={styles.link} href="/vocabulary">
                Open Vocabulary <ArrowRight size={16} />
              </a>
            </div>
          )}
          <div className={styles.topicGrid}>
            {practicedTopics.map((topic) => {
              const art = topicPresentation(topic.id);
              return (
                <button
                  key={topic.id}
                  className={`${styles.topic} ${topicId === topic.id ? styles.selected : ''} ${art?.cardTone ?? ''}`}
                  aria-pressed={topicId === topic.id}
                  onClick={() => setTopicId(topic.id)}
                >
                  {art && (
                    <img src={art.image.src} alt="" width={80} height={80} />
                  )}
                  <span>
                    <strong>{topic.title}</strong>
                    <span>
                      {topic.practicedCount} expressions practiced ·{' '}
                      {
                        topic.scenarios.filter((s) => s.expressions.length)
                          .length
                      }{' '}
                      scenarios
                    </span>
                  </span>
                  <ArrowRight size={20} />
                </button>
              );
            })}
          </div>
          {selected && selected.practicedCount > 0 && (
            <section aria-label={`${selected.title} scenarios`}>
              <div className={styles.sectionHeading}>
                <h2>{selected.title} scenarios</h2>
                <a className={styles.link} href={`/vocabulary/${selected.id}`}>
                  Review topic <BookOpen size={16} />
                </a>
              </div>
              <div className={styles.scenarioGrid}>
                {selected.scenarios.map((scenario) => (
                  <article className={styles.panel} key={scenario.id}>
                    <p className={styles.metadata}>
                      {scenario.expressions.length
                        ? `${scenario.expressions.length} practiced expressions`
                        : 'Practice this moment first'}
                    </p>
                    <h3>{scenario.title}</h3>
                    <p>{scenario.description}</p>
                    {scenario.expressions.length > 0 ? (
                      <>
                        <details className={styles.details}>
                          <summary>Based on your practice</summary>
                          <ul>
                            {scenario.expressions.slice(0, 8).map((e) => (
                              <li key={e.id}>
                                <span lang="es">{e.spanish}</span>
                                <span>
                                  {e.english}
                                  {e.needsPractice ? ' · Needs practice' : ''}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </details>
                        <Button
                          disabled={!catalog.available || !!busy}
                          className={styles.primary}
                          onClick={() => start(selected, scenario)}
                        >
                          Start conversation <ArrowRight />
                        </Button>
                      </>
                    ) : (
                      <a
                        className={styles.link}
                        href={`/vocabulary/${selected.id}`}
                      >
                        <LockKeyhole size={16} />
                        Practice topic
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}
          {topics.some((t) => !t.practicedCount) && (
            <details className={`${styles.details} ${styles.panel}`}>
              <summary>Topics to practice first</summary>
              <p>
                Opening a topic does not unlock conversation. Complete a
                vocabulary assessment or save a practice response at your
                current level.
              </p>
              <div className={styles.lockedTopics}>
                {topics
                  .filter((t) => !t.practicedCount)
                  .map((topic) => (
                    <a
                      className={styles.link}
                      key={topic.id}
                      href={`/vocabulary/${topic.id}`}
                    >
                      <LockKeyhole size={16} />
                      {topic.title}
                      <ArrowRight size={16} />
                    </a>
                  ))}
              </div>
            </details>
          )}
        </>
      )}
      {session && (
        <section className={styles.session}>
          <div className={styles.sessionHeader}>
            <Button
              className={styles.secondary}
              onClick={() => setLeaveOpen(true)}
            >
              <ArrowLeft />
              Topics
            </Button>
            <span>
              {session.topic.title} · {turns}/{MAX_CONVERSATION_TURNS} turns
            </span>
          </div>
          <div className={styles.brief}>
            <h2>Your objective</h2>
            <p>{session.scenario.description}</p>
            <p className={styles.metadata}>
              Speak or type your replies in Spanish. Check your transcription
              before sending. This conversation is not saved.
            </p>
          </div>
          <details className={styles.details}>
            <summary>Expressions you’ve practiced</summary>
            <ul>
              {session.scenario.expressions.slice(0, 8).map((e) => (
                <li key={e.id}>
                  <span lang="es">{e.spanish}</span>
                  <span>{e.english}</span>
                </li>
              ))}
            </ul>
          </details>
          <div
            className={styles.transcript}
            role="log"
            aria-label="Conversation transcript"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.map((message, index) => (
              <article
                key={index}
                className={
                  message.role === 'user'
                    ? styles.learnerMessage
                    : styles.partnerMessage
                }
              >
                <p className={styles.metadata}>
                  {message.role === 'user'
                    ? 'You'
                    : 'Conversation partner · AI'}
                </p>
                <p lang="es" className={styles.messageText}>
                  {message.content}
                </p>
                {message.role === 'assistant' && (
                  <div className={styles.messageActions}>
                    <SpeechButton
                      text={message.content}
                      voice={voice}
                      className={styles.speech}
                      disabled={microphoneBusy}
                    />
                    <details className={styles.translation}>
                      <summary>Translation</summary>
                      <p>{message.translation}</p>
                    </details>
                  </div>
                )}
              </article>
            ))}
          </div>
          <div className={styles.playbackControls}>
            <label htmlFor="speak-replies">Play replies aloud</label>
            <Switch
              id="speak-replies"
              className={styles.voiceSwitch}
              checked={speakReplies}
              onCheckedChange={(value) => {
                setSpeakReplies(value);
                speakEnabled.current = value;
                if (!value) stopAudio();
              }}
            />
            {audioStatus && (
              <>
                <output>{audioStatus}</output>
                <Button
                  type="button"
                  className={styles.secondary}
                  onClick={stopAudio}
                >
                  Stop audio
                </Button>
              </>
            )}
          </div>
          {error && (
            <div role="alert" className={styles.error}>
              {error}
            </div>
          )}
          {busy && (
            <output className={styles.status}>
              <LoaderCircle
                className="animate-spin motion-reduce:animate-none"
                size={18}
              />
              {busy === 'review'
                ? 'Reviewing your conversation…'
                : 'Your partner is replying…'}
            </output>
          )}
          {!messages.length && !busy && (
            <Button
              className={styles.primary}
              onClick={() => void generate('start', session, [])}
            >
              Try starting again
            </Button>
          )}
          {!!messages.length && !review && (
            <>
              {turns < MAX_CONVERSATION_TURNS && (
                <form
                  className={styles.composer}
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (
                      draft.trim() &&
                      !busy &&
                      !microphoneBusy &&
                      draft.length <= MAX_CONVERSATION_MESSAGE
                    )
                      void generate('turn');
                  }}
                >
                  {last?.hint && (
                    <details key={messages.length} className={styles.details}>
                      <summary>Need a hint?</summary>
                      <p>{last.hint}</p>
                    </details>
                  )}
                  <ConversationMicrophone
                    key={`${session.scenario.id}:${messages.length}`}
                    topicId={session.topic.id}
                    scenarioId={session.scenario.id}
                    level={level}
                    disabled={!!busy}
                    onBusyChange={setMicrophoneBusy}
                    onBeforeRecord={stopAudio}
                    onTranscript={(text) => {
                      setDraft((current) =>
                        current.trim() ? `${current.trim()} ${text}` : text,
                      );
                      requestAnimationFrame(() => composer.current?.focus());
                    }}
                  />
                  <label htmlFor="conversation-reply">
                    Your reply · edit or type here
                  </label>
                  <Textarea
                    ref={composer}
                    id="conversation-reply"
                    lang="es"
                    placeholder="Escribe tu respuesta…"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    disabled={!!busy || microphoneBusy}
                    maxLength={MAX_CONVERSATION_MESSAGE}
                    className={styles.input}
                    rows={3}
                  />
                  {draft.length > MAX_CONVERSATION_MESSAGE && (
                    <p role="alert" className={styles.voiceError}>
                      Shorten your reply to {MAX_CONVERSATION_MESSAGE}{' '}
                      characters before sending. Your full transcription is kept
                      above.
                    </p>
                  )}
                  <div className={styles.composerActions}>
                    <span>
                      {draft.length}/{MAX_CONVERSATION_MESSAGE}
                    </span>
                    <Button
                      type="submit"
                      disabled={
                        !!busy ||
                        microphoneBusy ||
                        !draft.trim() ||
                        draft.length > MAX_CONVERSATION_MESSAGE
                      }
                      className={styles.primary}
                    >
                      Send reply <Send />
                    </Button>
                  </div>
                </form>
              )}
              {turns > 0 && (
                <div className={styles.reviewAction}>
                  <p>
                    {turns >= MAX_CONVERSATION_TURNS
                      ? 'This practice session is finished. Review your responses.'
                      : 'You can finish and review after any reply.'}
                  </p>
                  <Button
                    className={styles.secondary}
                    disabled={!!busy || microphoneBusy || !!draft.trim()}
                    onClick={() => void generate('review')}
                  >
                    <Check />
                    Finish and review
                  </Button>
                  {!!draft.trim() && (
                    <p>Send or clear your draft before finishing.</p>
                  )}
                </div>
              )}
            </>
          )}
          {review && (
            <article className={styles.review}>
              <p className={styles.metadata}>AI review · {level}</p>
              <h2>Conversation review</h2>
              <p>{personalizeFeedback(review.summary, displayName)}</p>
              {review.corrections.length > 0 ? (
                review.corrections.map((c, index) => (
                  <div
                    key={index}
                    className={styles.correction}
                    data-state={
                      c.verdict === 'correct_with_fix' ? 'correct' : 'incorrect'
                    }
                  >
                    <strong className={styles.correctionStatus}>
                      {c.verdict === 'correct_with_fix'
                        ? 'Correct — small fix'
                        : 'Needs practice'}
                    </strong>
                    <p>
                      <strong>Your response</strong>
                      <span lang="es">{c.original}</span>
                    </p>
                    <p>
                      <strong>Suggested Spanish</strong>
                      <span lang="es">{c.suggestion}</span>
                    </p>
                    <AnswerDifference
                      answer={c.original}
                      correction={c.suggestion}
                    />
                    <p>{directFeedback(c.explanation)}</p>
                  </div>
                ))
              ) : (
                <p>
                  No specific corrections were identified in this short
                  exchange.
                </p>
              )}
              <h3>What to practice next</h3>
              <p>{directFeedback(review.nextPractice)}</p>
              <p className={styles.metadata}>
                This review does not update your vocabulary ratings or assess
                pronunciation. It is not saved.
              </p>
              <div className={styles.reviewLinks}>
                <a
                  className={styles.link}
                  href={`/vocabulary/${session.topic.id}`}
                >
                  Review {session.topic.title}
                  <BookOpen size={16} />
                </a>
                <Button
                  className={styles.primary}
                  onClick={() => setLeaveOpen(true)}
                >
                  Choose another conversation <ArrowRight />
                </Button>
              </div>
            </article>
          )}
          <div ref={end} />
        </section>
      )}
      <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <AlertDialogContent className={styles.leaveDialog}>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              The transcript and review will be cleared. Your vocabulary
              practice stays saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              className={styles.secondary}
              onClick={() => setLeaveOpen(false)}
            >
              Keep conversation
            </Button>
            <Button className={styles.primary} onClick={leave}>
              Leave conversation
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
