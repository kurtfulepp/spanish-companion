'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Check, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';

export type LearnerProfile = { displayName: string; proficiencyLevel: string };
const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function ProfileDialog({ onProfileChange, mobile = false }: { onProfileChange: (profile: LearnerProfile) => void; mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [proficiencyLevel, setProficiencyLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: profile, error } = await supabase.from('profiles').select('display_name, proficiency_level').eq('id', data.user.id).single();
      if (!error && profile) {
        const nextProfile = { displayName: profile.display_name ?? '', proficiencyLevel: profile.proficiency_level ?? '' };
        setDisplayName(nextProfile.displayName);
        setProficiencyLevel(nextProfile.proficiencyLevel);
        onProfileChange(nextProfile);
      }
      setLoading(false);
    });
  }, [onProfileChange]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) { window.location.replace('/sign-in'); return; }
    const { error } = await supabase.from('profiles').upsert({
      id: data.user.id,
      display_name: displayName.trim() || null,
      proficiency_level: proficiencyLevel || null,
      level_source: proficiencyLevel ? 'chosen' : null,
    });
    if (error) setMessage('Your profile could not be saved. Please try again.');
    else {
      const nextProfile = { displayName: displayName.trim(), proficiencyLevel };
      onProfileChange(nextProfile);
      setMessage('Profile saved');
    }
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button className={mobile ? 'flex items-center gap-3 text-left' : 'icon-button'} aria-label="Edit learner profile" />}><Settings className={mobile ? 'size-6' : 'size-[18px]'} />{mobile && 'Profile'}</DialogTrigger>
      <DialogContent className="max-w-md gap-6 rounded-[26px] p-6 sm:p-7">
        <DialogHeader><DialogTitle className="text-2xl font-semibold tracking-[-.04em]">Your learner profile</DialogTitle><DialogDescription className="text-base leading-relaxed">Choose a provisional level now. A placement check can refine it later.</DialogDescription></DialogHeader>
        <form onSubmit={saveProfile} className="space-y-5">
          <div className="space-y-2"><Label htmlFor="display-name">Display name <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={80} placeholder="How should Claro address you?" disabled={loading} className="h-12 rounded-xl" /></div>
          <div className="space-y-2"><Label htmlFor="proficiency-level">Current Spanish level</Label><Select value={proficiencyLevel} onValueChange={(value) => setProficiencyLevel(value ?? '')} disabled={loading}><SelectTrigger id="proficiency-level" className="h-12 w-full rounded-xl px-3"><SelectValue>{proficiencyLevel || 'Choose a level'}</SelectValue></SelectTrigger><SelectContent align="start">{levels.map((level) => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent></Select></div>
          {message && <p role="status" className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${message === 'Profile saved' ? 'bg-[#e8f3ef] text-[#315d52]' : 'bg-[#fff1ed] text-[#8b4337]'}`}>{message === 'Profile saved' && <Check className="size-4" />}{message}</p>}
          <DialogFooter className="mx-0 mb-0 rounded-none border-0 bg-transparent p-0"><Button type="submit" disabled={loading || saving} className="h-11 rounded-full px-6 font-bold">{saving ? 'Saving…' : 'Save profile'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
