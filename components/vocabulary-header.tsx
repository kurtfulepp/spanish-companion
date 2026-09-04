'use client';
/* oxlint-disable next/no-html-link-for-pages */

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Brand } from '@/components/brand';
import { ProfileDialog, type LearnerProfile } from '@/components/profile-dialog';
import { createClient } from '@/lib/supabase/client';

export function VocabularyHeader({ onProfileChange }: { onProfileChange: (profile: LearnerProfile) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    void createClient().auth.getUser().then(({ data }) => {
      if (!data.user) window.location.replace('/sign-in');
    });
  }, []);

  async function signOut() {
    await createClient().auth.signOut();
    window.location.replace('/');
  }

  return <><header className="app-header"><a href="/today" aria-label="KurtES home"><Brand compact /></a><nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation"><a className="nav-link" href="/today">Today</a><a className="nav-link nav-link-active" href="/vocabulary">Vocabulary</a><a className="nav-link" href="/today#progress">Practice</a></nav><div className="hidden items-center gap-2 sm:flex"><button onClick={() => void signOut()} className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground">Sign out</button><ProfileDialog onProfileChange={onProfileChange} fallbackAvatarSrc="/brand/kurtes-center.png" /></div><button className="icon-button sm:hidden" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu className="size-5" /></button></header>{menuOpen && <div className="fixed inset-0 z-50 bg-[#173c34] p-6 text-white sm:hidden"><div className="flex items-center justify-between"><Brand compact /><button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button></div><nav className="mt-16 grid gap-6 text-3xl font-semibold"><a href="/today">Today</a><a href="/vocabulary">Vocabulary</a><a href="/today#progress">Practice</a><ProfileDialog onProfileChange={onProfileChange} mobile /><button onClick={() => void signOut()} className="text-left text-[#f4bd4e]">Sign out</button></nav></div>}</>;
}
