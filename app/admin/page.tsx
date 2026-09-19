/* oxlint-disable next/no-html-link-for-pages -- full navigation follows the vinext app convention. */
import { notFound } from 'next/navigation';
import { Brand } from '@/components/brand';
import { getAccountPrivileges } from '@/lib/supabase/admin-access';

export default async function AdminPage() {
  const { isAdmin } = await getAccountPrivileges();
  if (!isAdmin) notFound();

  return <main className="mx-auto min-h-screen max-w-[1360px] p-3 text-[var(--brand-ink)] sm:p-5">
    <header className="app-header"><a href="/home" aria-label="KurtES home"><Brand compact /></a><a href="/home" className="text-sm font-semibold">Back to app</a></header>
    <section className="brand-hero mt-5 p-8"><p className="mb-2 text-sm font-semibold text-[var(--brand-ink-strong)]">Admin</p><h1 className="text-4xl font-semibold tracking-[-.055em]">Admin panel</h1></section>
    <section className="mt-6 rounded-[26px] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-8">
      <h2 className="text-2xl font-semibold tracking-tight">Closed alpha access</h2>
      <p className="mt-3 max-w-xl text-sm leading-7">Your Supabase account has admin access. Signup approvals and email delivery are not connected yet.</p>
      {process.env.NODE_ENV === 'development' && <a href="/admin/approvals/preview" className="mt-5 inline-flex min-h-12 items-center rounded-full bg-[var(--brand-gold)] px-6 text-sm font-semibold outline-offset-4 focus-visible:outline-2">Open approval preview</a>}
    </section>
  </main>;
}
