import {
  BookOpenCheck,
  CheckCircle2,
  Circle,
  Clock3,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import {
  vocabularyLearningStateLabel,
  type VocabularyLearningState,
} from '@/lib/vocabulary-assessment';
import styles from './vocabulary-status-badge.module.css';

const icons = {
  new: Circle,
  practiced: BookOpenCheck,
  needs_practice: RotateCcw,
  known: CheckCircle2,
  review_due: Clock3,
  retained: ShieldCheck,
} as const;

export function VocabularyStatusBadge({
  state,
}: {
  state: VocabularyLearningState;
}) {
  const Icon = icons[state];
  return (
    <span className={styles.badge} data-state={state}>
      <Icon aria-hidden="true" size={12} strokeWidth={2.2} />
      {vocabularyLearningStateLabel(state)}
    </span>
  );
}
