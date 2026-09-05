'use client';
/* oxlint-disable next/no-html-link-for-pages -- Authentication uses full document navigation. */

import { useRef, useState, type SubmitEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Mail } from 'lucide-react';
import { Brand } from '@/components/brand';
import { createClient } from '@/lib/supabase/client';

const steps = ['Email', 'Password', 'Review'];

export default function JoinPage() {
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [direction, setDirection] = useState('next');
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const submittingRef = useRef(false);

  function goTo(next: number) {
    if (loading || next === step || next > furthestStep + 1) return;
    if (next > step && !formRef.current?.reportValidity()) return;
    setDirection(next > step ? 'next' : 'back');
    setMessage('');
    setShowPassword(false);
    setStep(next);
    setFurthestStep((previous) => Math.max(previous, next));
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    if (step < 2) { goTo(step + 1); return; }
    // Validate the entire payload again, including fields on earlier slides.
    if (!email.trim() || password.length < 8) { goTo(!email.trim() ? 0 : 1); return; }
    submittingRef.current = true;
    setLoading(true);
    setMessage('');
    try {
      const { data, error } = await createClient().auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
      });
      if (error) {
        if (error.code === 'signup_disabled') setMessage('New accounts are not available right now. If you have an account, sign in.');
        else if (error.code === 'weak_password') { setStep(1); setMessage('Choose a stronger password with a mix of letters, numbers, and symbols.'); }
        else if (error.code === 'over_email_send_rate_limit' || error.status === 429) setMessage('Too many attempts. Wait a few minutes before trying again.');
        else setMessage('Your account could not be created. Try again, or sign in if you already have an account.');
      } else if (data.session) {
        window.location.replace('/vocabulary');
      } else {
        setSubmitted(true);
        setPassword('');
        requestAnimationFrame(() => headingRef.current?.focus());
      }
    } catch {
      setMessage('Could not connect. Check your connection and try again.');
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  const title = submitted ? 'Check your email' : ['Your email', 'Set a password', 'Create your account'][step];

  return (
    <main className="join-shell">
      <header className="app-header join-header">
        <a href="/" aria-label="KurtES home"><Brand compact /></a>
        <a href="/sign-in" className="welcome-sign-in">Sign in</a>
      </header>
      <section className="join-stage" aria-labelledby="join-title">
        <div className="join-accent" aria-hidden="true" />
        <div className={`join-slide join-slide-${direction}`} key={submitted ? 'confirmation' : step}>
          <p className="join-step-label">{submitted ? 'Confirm your account' : `Join KurtES · ${step + 1} of ${steps.length}`}</p>
          <h1 id="join-title" ref={headingRef} tabIndex={-1}>{title}</h1>
          {submitted ? <div className="join-confirmation">
            <span className="join-mail"><Mail aria-hidden="true" /></span>
            <p>If your address is eligible, a confirmation link will be sent to <strong>{email.trim()}</strong>. Open it to finish signing up.</p>
            <p>Already registered? Sign in with your existing password.</p>
            <a href="/sign-in" className="join-primary">Sign in</a>
          </div> : <form ref={formRef} onSubmit={submit} className="join-form">
            {step === 0 && <div className="join-field">
              <p>Use the email address you want to sign in with.</p>
              <label htmlFor="join-email">Email address</label>
              <input id="join-email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => { setEmail(event.target.value); setFurthestStep(0); }} placeholder="you@example.com" />
            </div>}
            {step === 1 && <div className="join-field">
              <p>Choose a password for your account.</p>
              <label htmlFor="join-password">Password</label>
              <div className="join-password"><input id="join-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} value={password} onChange={(event) => { setPassword(event.target.value); setFurthestStep(1); }} aria-describedby="password-hint" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>{showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</button></div>
              <p id="password-hint" className="join-hint">Use at least 8 characters. A longer, unique password is better.</p>
            </div>}
            {step === 2 && <div className="join-review">
              <p>Check your details. We’ll email you a link to confirm your account.</p>
              <dl><div><dt>Email</dt><dd>{email.trim()}</dd><button type="button" onClick={() => goTo(0)} aria-label="Edit email">Edit</button></div><div><dt>Password</dt><dd><Check aria-hidden="true" className="size-4" />Password set</dd><button type="button" onClick={() => goTo(1)} aria-label="Edit password">Edit</button></div></dl>
              <p className="join-hint">You can set your name, Spanish level, and learning preferences in Profile after signing in.</p>
            </div>}
            {message && <p role="alert" className="join-error">{message}</p>}
            <div className="join-controls">
              {step > 0 ? <button type="button" disabled={loading} className="join-back" onClick={() => goTo(step - 1)}><ArrowLeft aria-hidden="true" className="size-4" />Back</button> : <a className="join-back" href="/"><ArrowLeft aria-hidden="true" className="size-4" />Back</a>}
              <button type="submit" disabled={loading} className="join-primary">{loading ? 'Creating account…' : step === 2 ? 'Create account' : 'Continue'}{step < 2 && <ArrowRight aria-hidden="true" className="size-4" />}</button>
            </div>
          </form>}
        </div>
        <nav className="join-pagination" aria-label="Account creation progress">
          {steps.map((label, index) => <button key={label} type="button" aria-label={`Step ${index + 1}: ${label}`} aria-current={!submitted && step === index ? 'step' : undefined} disabled={loading || submitted || index > furthestStep} onClick={() => goTo(index)}><span className={submitted || index < step ? 'complete' : index === step ? 'current' : ''} /></button>)}
        </nav>
      </section>
    </main>
  );
}
