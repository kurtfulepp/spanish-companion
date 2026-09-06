import type { CEFRLevel } from './cefr';
import { DEFAULT_LEARNING_TIME_ZONE } from './progress';
import type { VoicePreference } from './speech';

export type LearnerProfile = {
  displayName: string;
  proficiencyLevel: CEFRLevel | '';
  voicePreference: VoicePreference;
  learningTimeZone: string;
  followDeviceTimeZone: boolean;
};

export const EMPTY_LEARNER_PROFILE: LearnerProfile = {
  displayName: '',
  proficiencyLevel: '',
  voicePreference: 'male',
  learningTimeZone: DEFAULT_LEARNING_TIME_ZONE,
  followDeviceTimeZone: false,
};
