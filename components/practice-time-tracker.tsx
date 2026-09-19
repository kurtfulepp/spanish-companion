'use client';

import { useEffect, useRef, useState } from 'react';
import { useLearnerProfile } from './learner-profile-provider';
import { activePracticeDelta, type PracticeArea, type PracticeInterval } from '@/lib/practice-time';

export function PracticeTimeTracker({ active, area, level }: { active: boolean; area: PracticeArea; level?: string }) {
  const { userId, profile } = useLearnerProfile();
  const [failed, setFailed] = useState(false);
  const activeRef = useRef(active);
  const changeActivity = useRef<((next: boolean) => void) | null>(null);
  const practiceLevel = level ?? profile.proficiencyLevel;
  useEffect(() => {
    if (!userId || !practiceLevel) return;
    let previous = performance.now();
    let lastActivity = previous;
    let visible = document.visibilityState === 'visible' && document.hasFocus();
    let pending: PracticeInterval[] = [];
    let inFlight = false;
    let disposed = false;
    let lastFlush = previous;
    const sample = () => {
      const now = performance.now();
      const elapsed = activePracticeDelta(previous, now, lastActivity, visible && activeRef.current);
      const gap = now - previous;
      previous = now;
      if (!elapsed) return;
      const end = Date.now() - Math.floor(gap - elapsed);
      const start = end - Math.floor(elapsed);
      const tail = pending.at(-1);
      if (tail && Math.abs(start - tail.end) <= 5 && end - tail.start <= 20_000) tail.end = end;
      else if (end > start) pending.push({ start, end });
    };
    const flush = async () => {
      if (inFlight) return;
      // Only recent intervals are accepted. Never reassign pending time to a new account.
      pending = pending.filter((item) => item.start >= Date.now() - 290_000);
      if (!pending.length) return;
      const batch = pending.splice(0, 20);
      inFlight = true;
      try {
        const response = await fetch('/api/practice-time', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, area, level: practiceLevel, intervals: batch }),
          keepalive: true,
        });
        if (!response.ok) throw new Error('Practice time unavailable');
        if (!disposed) setFailed(false);
      } catch {
        pending.unshift(...batch);
        if (!disposed) setFailed(true);
      } finally {
        inFlight = false;
        // Finish the final queued seconds if unmounted during a heartbeat.
        if (disposed && pending.length && pending[0] !== batch[0]) void flush();
      }
    };
    const activity = (event: Event) => {
      if (!event.isTrusted) return;
      sample();
      lastActivity = performance.now();
    };
    const visibility = () => {
      sample();
      visible = document.visibilityState === 'visible' && document.hasFocus();
      previous = performance.now();
      if (visible) lastActivity = previous;
      else void flush();
    };
    const leave = () => { sample(); visible = false; void flush(); };
    changeActivity.current = (next) => {
      sample();
      activeRef.current = next;
      previous = performance.now();
      if (next) lastActivity = previous;
      else void flush();
    };
    const timer = window.setInterval(() => {
      sample();
      if (performance.now() - lastFlush >= 15_000) {
        lastFlush = performance.now();
        void flush();
      }
    }, 1000);
    const events = ['pointerdown', 'keydown', 'input', 'scroll'];
    for (const event of events) document.addEventListener(event, activity, { capture: true, passive: true });
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('focus', visibility);
    window.addEventListener('blur', visibility);
    window.addEventListener('pagehide', leave);
    return () => {
      sample();
      disposed = true;
      changeActivity.current = null;
      void flush();
      window.clearInterval(timer);
      for (const event of events) document.removeEventListener(event, activity, true);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('focus', visibility);
      window.removeEventListener('blur', visibility);
      window.removeEventListener('pagehide', leave);
    };
  }, [userId, area, practiceLevel]);
  useEffect(() => {
    if (changeActivity.current) changeActivity.current(active);
    else activeRef.current = active;
  }, [active]);
  return failed ? <output className="rounded-xl bg-[var(--brand-cream)] px-4 py-3 text-sm text-[var(--brand-ink)]">Practice time could not be saved. Recent time will retry while you practice.</output> : null;
}
