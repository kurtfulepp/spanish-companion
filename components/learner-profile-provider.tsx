'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cefrLevel } from '@/lib/cefr';
import { EMPTY_LEARNER_PROFILE, type LearnerProfile } from '@/lib/learner-profile';
import { DEFAULT_LEARNING_TIME_ZONE, deviceTimeZone } from '@/lib/progress';
import { createClient } from '@/lib/supabase/client';

type LearnerProfileContextValue = {
  profile: LearnerProfile;
  loading: boolean;
  userId: string | null;
  avatarUrl: string;
  setProfile: (profile: LearnerProfile) => void;
  refreshProfile: () => Promise<void>;
};

const LearnerProfileContext = createContext<LearnerProfileContextValue | null>(null);

function safeAvatarUrl(value: unknown) {
  if (typeof value !== 'string') return '';
  if (value.startsWith('/')) return value;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.endsWith('.supabase.co') ? value : '';
  } catch {
    return '';
  }
}

export function LearnerProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<LearnerProfile>(EMPTY_LEARNER_PROFILE);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState('');

  const refreshProfile = useCallback(async () => {
    const supabase = createClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) {
      setUserId(null);
      setAvatarUrl('');
      setProfile(EMPTY_LEARNER_PROFILE);
      setLoading(false);
      return;
    }
    setUserId(auth.user.id);
    setAvatarUrl(safeAvatarUrl(auth.user.user_metadata?.avatar_url));
    const { data } = await supabase.from('profiles')
      .select('display_name, proficiency_level, voice_preference, learning_timezone, follow_device_timezone')
      .eq('id', auth.user.id).maybeSingle();
    const followsDevice = data?.follow_device_timezone === true;
    setProfile({
      displayName: data?.display_name ?? '',
      proficiencyLevel: cefrLevel(data?.proficiency_level),
      voicePreference: data?.voice_preference === 'female' ? 'female' : 'male',
      learningTimeZone: followsDevice ? deviceTimeZone() : data?.learning_timezone || DEFAULT_LEARNING_TIME_ZONE,
      followDeviceTimeZone: followsDevice,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const initialLoad = window.setTimeout(() => void refreshProfile(), 0);
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') window.setTimeout(() => void refreshProfile(), 0);
      if (event === 'SIGNED_OUT') {
        setUserId(null);
        setAvatarUrl('');
        setProfile(EMPTY_LEARNER_PROFILE);
        setLoading(false);
      }
    });
    return () => { window.clearTimeout(initialLoad); data.subscription.unsubscribe(); };
  }, [refreshProfile]);

  const value = useMemo(() => ({ profile, loading, userId, avatarUrl, setProfile, refreshProfile }), [profile, loading, userId, avatarUrl, refreshProfile]);
  return <LearnerProfileContext.Provider value={value}>{children}</LearnerProfileContext.Provider>;
}

export function useLearnerProfile() {
  const value = useContext(LearnerProfileContext);
  if (!value) throw new Error('useLearnerProfile must be used inside LearnerProfileProvider');
  return value;
}
