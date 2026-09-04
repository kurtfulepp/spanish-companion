/* oxlint-disable next/no-html-link-for-pages -- Full navigation preserves the established auth flow in vinext. */
import { ArrowRight } from 'lucide-react';
import { Brand } from '@/components/brand';
import { WelcomeCoach } from '@/components/welcome-coach';

export default function WelcomePage() {
  return (
    <main className="welcome-shell">
      <header className="app-header welcome-header">
        <Brand compact />
        <a href="/sign-in" className="welcome-sign-in">Sign in <ArrowRight className="size-4" aria-hidden="true" /></a>
      </header>

      <section className="brand-hero welcome-content" aria-labelledby="welcome-title">
        <span className="brand-orbit brand-orbit-turquoise" aria-hidden="true" />
        <span className="brand-orbit brand-orbit-yellow" aria-hidden="true" />
        <div className="welcome-copy">
          <h1 id="welcome-title" className="welcome-title">Kurt<span className="brand-es">ES</span></h1>
          <div className="welcome-actions">
            <a href="/join" className="welcome-start">Join</a>
            <a href="/sign-in" className="welcome-start welcome-secondary">Sign in</a>
          </div>
        </div>

        <WelcomeCoach />
      </section>

    </main>
  );
}
