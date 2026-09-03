'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

type Mode = 'sign-in' | 'sign-up';

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/');
    });
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const supabase = createClient();

    if (mode === 'sign-in') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else window.location.replace('/');
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
      });
      if (error) setMessage(error.message);
      else if (data.session) window.location.replace('/');
      else setMessage('Check your email to confirm your account, then sign in.');
    }
    setLoading(false);
  }

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setMessage('');
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-10 text-foreground">
      <section className="w-full max-w-[440px] rounded-[30px] border border-border bg-white p-7 shadow-[0_24px_70px_rgba(23,50,44,.09)] sm:p-10">
        <div className="mb-9"><Brand /></div>
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-.045em]">{mode === 'sign-in' ? 'Continue learning' : 'Create your account'}</h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">Use your email and password to keep your Spanish practice connected.</p>

        <div className="mt-7 grid grid-cols-2 rounded-full bg-secondary p-1" aria-label="Authentication mode">
          <button type="button" onClick={() => changeMode('sign-in')} className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${mode === 'sign-in' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'}`}>Sign in</button>
          <button type="button" onClick={() => changeMode('sign-up')} className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${mode === 'sign-up' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'}`}>Sign up</button>
        </div>

        <form onSubmit={submit} className="mt-7 space-y-5">
          <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="h-12 rounded-xl" /></div>
          <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required className="h-12 rounded-xl" /></div>
          {message && <p role="status" className="rounded-xl bg-[#fff4dc] px-4 py-3 text-sm leading-relaxed text-[#77551a]">{message}</p>}
          <Button type="submit" disabled={loading} className="h-12 w-full rounded-full text-base font-bold">{loading ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}</Button>
        </form>
      </section>
    </main>
  );
}
