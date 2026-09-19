import type { CEFRLevel } from '@/lib/cefr';

export function LearningLevelBadge({
  level,
  area,
}: {
  level: CEFRLevel | '';
  area: 'Vocabulary' | 'Grammar' | 'Conversation';
}) {
  return (
    <span className="brand-level-badge">
      {level && (
        <>
          <span>
            <span className="sr-only">Profile level </span>
            {level}
          </span>
          <span aria-hidden="true">·</span>
          <span className="sr-only">, </span>
        </>
      )}
      <span>{area}</span>
    </span>
  );
}
