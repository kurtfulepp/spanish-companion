import { answerDifference } from '@/lib/feedback-language';
import styles from './answer-difference.module.css';

export function AnswerDifference({
  answer,
  correction,
}: {
  answer: string;
  correction: string;
}) {
  const comparison = answerDifference(answer, correction);
  if (!comparison) return null;

  return (
    <div className={styles.comparison}>
      <strong>
        {comparison.kind === 'accent' ? 'Accent to fix' : 'Spelling to fix'}
      </strong>
      <DifferenceRow
        label="You wrote"
        parts={comparison.parts}
        include="remove"
      />
      <DifferenceRow label="Use" parts={comparison.parts} include="add" />
    </div>
  );
}

function DifferenceRow({
  label,
  parts,
  include,
}: {
  label: string;
  parts: NonNullable<ReturnType<typeof answerDifference>>['parts'];
  include: 'remove' | 'add';
}) {
  return (
    <p>
      <span>{label}</span>
      <code lang="es">
        {parts
          .filter((part) => part.type === 'same' || part.type === include)
          .map((part, index) =>
            part.type === include ? (
              <mark key={`${part.type}-${index}`}>{part.text}</mark>
            ) : (
              <span key={`${part.type}-${index}`}>{part.text}</span>
            ),
          )}
      </code>
    </p>
  );
}
