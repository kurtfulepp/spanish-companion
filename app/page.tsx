/* oxlint-disable next/no-html-link-for-pages -- Full navigation preserves the established auth flow in vinext. */
import { WelcomeCoach } from '@/components/welcome-coach';

export default function WelcomePage() {
  return (
    <main className="welcome-shell">
      <div className="brand-hero welcome-pane">
      <span className="brand-orbit brand-orbit-turquoise" aria-hidden="true" />
      <span className="brand-orbit brand-orbit-yellow" aria-hidden="true" />
      <section className="welcome-content" aria-labelledby="welcome-title">
        <div className="welcome-copy">
          <h1 id="welcome-title" className="welcome-title">Kurt<span className="brand-es">ES</span></h1>
          <div className="welcome-actions">
            <a href="/join" className="welcome-start">Join</a>
            <a href="/sign-in" className="welcome-start welcome-secondary">Sign in</a>
          </div>
        </div>

        <WelcomeCoach />
      </section>
      </div>
    </main>
  );
}
