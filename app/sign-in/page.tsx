/* oxlint-disable next/no-img-element */
'use client';

import { type SubmitEvent, useEffect, useState } from 'react';
import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) window.location.replace('/vocabulary');
    }).catch(() => setMessage('Could not check your session. Sign in to try again.'));
  }, []);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage('');
    try {
      const { error } = await createClient().auth.signInWithPassword({ email, password });
      if (error) setMessage('Email or password was not recognized.');
      else window.location.replace('/vocabulary');
    } catch {
      setMessage('Could not connect. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell grid min-h-screen place-items-center px-5 py-10 text-foreground">
      <section className="auth-card grid w-full max-w-[920px] overflow-hidden rounded-[32px] md:grid-cols-[.9fr_1.1fr]">
        <div className="relative hidden min-h-[610px] overflow-hidden bg-[#173c34] p-10 text-white md:block"><div className="relative z-10"><Brand compact /><p className="mt-14 text-sm font-medium text-[#8fd0bd]">A little Spanish, every day.</p><p className="mt-4 text-4xl font-semibold leading-[1.02] tracking-[-.055em]">Speak with more<br />confidence.</p></div><div className="absolute -bottom-16 -right-20 size-80 rounded-full bg-[#245a4e] blur-3xl" /><div className="absolute bottom-8 left-1/2 h-9 w-48 -translate-x-1/2 rounded-full bg-black/20 blur-xl" /><img src="/brand/kurtes-open-arms.png" alt="" className="absolute bottom-5 left-1/2 z-10 h-[330px] w-auto max-w-none -translate-x-1/2 drop-shadow-[0_20px_24px_rgba(0,0,0,.25)]" /><p className="absolute bottom-3 left-10 z-20 text-sm text-white/55">Personal practice that remembers your level.</p></div>
        <div className="p-7 sm:p-10"><div className="mb-9"><Brand /></div>
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-.045em]">Continue learning</h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">Use your email and password to keep your Spanish practice connected.</p>

        <form onSubmit={submit} className="mt-7 space-y-5">
          <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="h-12 rounded-[14px] bg-[#f7f7f8] px-4" /></div>
          <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" autoComplete="current-password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required className="h-12 rounded-[14px] bg-[#f7f7f8] px-4" /></div>
          {message && <output className="block rounded-xl bg-[#fff4dc] px-4 py-3 text-sm leading-relaxed text-[#77551a]">{message}</output>}
          <Button type="submit" disabled={loading} className="h-12 w-full rounded-full text-base font-bold">{loading ? 'Please wait…' : 'Sign in'}</Button>
        </form></div>
      </section>
    </main>
  );
}
