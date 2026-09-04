'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Check, Settings, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { playSpanishSpeech, type VoicePreference } from '@/lib/speech';

export type LearnerProfile = { displayName: string; proficiencyLevel: string; voicePreference: VoicePreference };
const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function ProfileDialog({ onProfileChange, mobile = false }: { onProfileChange: (profile: LearnerProfile) => void; mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [proficiencyLevel, setProficiencyLevel] = useState('');
  const [voicePreference, setVoicePreference] = useState<VoicePreference>('male');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: profile, error } = await supabase.from('profiles').select('display_name, proficiency_level, voice_preference').eq('id', data.user.id).single();
      if (!error && profile) {
        const nextProfile = { displayName: profile.display_name ?? '', proficiencyLevel: profile.proficiency_level ?? '', voicePreference: profile.voice_preference === 'female' ? 'female' as const : 'male' as const };
        setDisplayName(nextProfile.displayName);
        setProficiencyLevel(nextProfile.proficiencyLevel);
        setVoicePreference(nextProfile.voicePreference);
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
      voice_preference: voicePreference,
    });
    if (error) setMessage('Your profile could not be saved. Please try again.');
    else {
      const nextProfile = { displayName: displayName.trim(), proficiencyLevel, voicePreference };
      onProfileChange(nextProfile);
      setOpen(false);
    }
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button className={mobile ? 'flex items-center gap-3 text-left' : 'icon-button'} aria-label="Edit learner profile" />}><Settings className={mobile ? 'size-6' : 'size-[18px]'} />{mobile && 'Profile'}</DialogTrigger>
      <DialogContent className="max-w-md gap-6 rounded-[24px] border border-white/80 p-6 shadow-[0_28px_90px_rgba(20,38,33,.22)] sm:p-7">
        <DialogHeader><DialogTitle className="text-2xl font-semibold tracking-[-.04em]">Your learner profile</DialogTitle><DialogDescription className="text-base leading-relaxed">Choose a provisional level now. A placement check can refine it later.</DialogDescription></DialogHeader>
        <form onSubmit={saveProfile} className="space-y-5">
          <div className="space-y-2"><Label htmlFor="display-name">Display name <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={80} placeholder="How should KurtES address you?" disabled={loading} className="h-12 rounded-[14px] bg-[#f7f7f8] px-4" /></div>
          <div className="space-y-2"><Label htmlFor="proficiency-level">Current Spanish level</Label><Select value={proficiencyLevel} onValueChange={(value) => setProficiencyLevel(value ?? '')} disabled={loading}><SelectTrigger id="proficiency-level" className="h-12 w-full rounded-[14px] bg-[#f7f7f8] px-4"><SelectValue>{proficiencyLevel || 'Choose a level'}</SelectValue></SelectTrigger><SelectContent align="start" className="rounded-[14px] p-1">{levels.map((level) => <SelectItem key={level} value={level} className="rounded-[10px] px-3 py-2.5">{level}</SelectItem>)}</SelectContent></Select></div>
          <fieldset className="space-y-2.5"><legend className="text-sm font-medium">Select Voice</legend><div className="grid grid-cols-2 gap-2.5">{(['male', 'female'] as const).map((voice) => <button key={voice} type="button" aria-pressed={voicePreference === voice} onClick={() => setVoicePreference(voice)} disabled={loading} className={`flex h-12 items-center justify-center gap-2 rounded-[14px] border px-4 text-sm font-semibold transition ${voicePreference === voice ? 'border-primary bg-primary text-white shadow-sm ring-2 ring-primary/15' : 'border-border bg-white text-foreground hover:border-[#9bb9b0] hover:bg-[#f7f9f8]'}`}>{voicePreference === voice && <Check className="size-4" />}{voice === 'male' ? 'Male' : 'Female'}</button>)}</div><button type="button" onClick={() => void playSpanishSpeech('Hola, Kurt. ¿Qué planes tienes hoy?', voicePreference)} className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold text-primary transition hover:bg-[#eef6f2]"><Volume2 className="size-4" />Preview selected voice</button></fieldset>
          {message && <p role="alert" className="rounded-xl bg-[#fff1ed] px-4 py-3 text-sm text-[#8b4337]">{message}</p>}
          <DialogFooter className="mx-0 mb-0 rounded-none border-0 bg-transparent p-0"><Button type="submit" disabled={loading || saving} className="h-11 rounded-full px-6 font-bold">{saving ? 'Saving…' : 'Save profile'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
