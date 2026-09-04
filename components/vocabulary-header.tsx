'use client';
/* oxlint-disable next/no-html-link-for-pages */

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Brand } from '@/components/brand';
import { ProfileDialog, type LearnerProfile } from '@/components/profile-dialog';
import { createClient } from '@/lib/supabase/client';

export function VocabularyHeader({ profile, onProfileChange }: { profile: LearnerProfile; onProfileChange: (profile: LearnerProfile) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    void createClient().auth.getUser().then(({ data }) => {
      if (!data.user) window.location.replace('/sign-in');
      else setEmail(data.user.email ?? null);
    });
  }, []);

  async function signOut() {
    await createClient().auth.signOut();
    window.location.replace('/sign-in');
  }

  const initials = (profile.displayName || email)?.slice(0, 2).toUpperCase() ?? 'KC';

  return <><header className="app-header"><a href="/" aria-label="KurtES home"><Brand /></a><nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation"><a className="nav-link" href="/">Today</a><a className="nav-link nav-link-active" href="/vocabulary">Vocabulary</a><a className="nav-link" href="/#progress">Practice</a></nav><div className="hidden items-center gap-2 sm:flex"><ProfileDialog onProfileChange={onProfileChange} /><button onClick={() => void signOut()} className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground">Sign out</button><span className="grid size-9 place-items-center rounded-full bg-[#f2b544] text-xs font-bold text-[#263b35] shadow-sm">{initials}</span></div><button className="icon-button sm:hidden" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu className="size-5" /></button></header>{menuOpen && <div className="fixed inset-0 z-50 bg-[#173c34] p-6 text-white sm:hidden"><div className="flex items-center justify-between"><Brand compact /><button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button></div><nav className="mt-16 grid gap-6 text-3xl font-semibold"><a href="/">Today</a><a href="/vocabulary">Vocabulary</a><a href="/#progress">Practice</a><ProfileDialog onProfileChange={onProfileChange} mobile /><button onClick={() => void signOut()} className="text-left text-[#f4bd4e]">Sign out</button></nav></div>}</>;
}
