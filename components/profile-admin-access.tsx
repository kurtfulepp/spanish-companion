'use client';
/* oxlint-disable next/no-html-link-for-pages -- full navigation follows the vinext app convention. */

import { useEffect, useState } from 'react';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';

export function ProfileAdminAccess({ userId }: { userId: string }) {
  const [adminUserId, setAdminUserId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/account/privileges', { cache: 'no-store', signal: controller.signal })
      .then(async response => response.ok ? response.json() : null)
      .then(data => {
        if (!controller.signal.aborted && data && typeof data === 'object' && 'userId' in data && 'isAdmin' in data && data.userId === userId && data.isAdmin === true) setAdminUserId(userId);
      })
      .catch(() => { /* Fail closed; learning profile remains usable. */ });
    return () => controller.abort();
  }, [userId]);

  if (adminUserId !== userId) return null;
  return <section aria-label="Administrator access" className="rounded-[16px] border border-[var(--brand-border)] bg-[var(--brand-cream)] p-4 text-[var(--brand-ink)]">
    <div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck size={18} />Admin</div>
    <a href="/admin" className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-gold)] px-4 text-sm font-semibold text-[var(--brand-ink-strong)] outline-offset-4 focus-visible:outline-2">Open admin panel <ArrowUpRight size={16} /></a>
  </section>;
}
