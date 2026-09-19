export type LearningFeedbackVerdict =
  | 'correct'
  | 'correct_with_fix'
  | 'incorrect'
  | 'uncertain';

export function isPassingFeedbackVerdict(verdict: LearningFeedbackVerdict) {
  return verdict === 'correct' || verdict === 'correct_with_fix';
}

export function feedbackVisualState(
  verdict: LearningFeedbackVerdict,
): 'correct' | 'incorrect' | 'uncertain' {
  return isPassingFeedbackVerdict(verdict)
    ? 'correct'
    : verdict === 'incorrect'
      ? 'incorrect'
      : 'uncertain';
}

export function feedbackVerdictLabel(verdict: LearningFeedbackVerdict) {
  return verdict === 'correct'
    ? 'Correct'
    : verdict === 'correct_with_fix'
      ? 'Correct — small fix'
      : verdict === 'incorrect'
        ? 'Needs practice'
        : 'Needs another check';
}

export function directFeedback(text: string) {
  const direct = text
    .trim()
    .replace(/\b(?:the )?learner['’]s\b/gi, 'your')
    .replace(/\b(?:the )?user['’]s\b/gi, 'your')
    .replace(/\bthe submitted answer\b/gi, 'your answer')
    .replace(/\bthe submitted response\b/gi, 'your response')
    .replace(/\bthe learner\b/gi, 'you')
    .replace(/\bthe user\b/gi, 'you');

  return direct.replace(/^you\b/i, 'You').replace(/^your\b/i, 'Your');
}

export function actionableCorrection(text: string) {
  const direct = directFeedback(text);
  if (
    /^(?:You (?:answered|said|typed|used|wrote)|Your (?:answer|response))\b/i.test(
      direct,
    )
  )
    return 'Use the corrected form below.';
  return direct;
}

export type AnswerDifferencePart = {
  type: 'same' | 'remove' | 'add';
  text: string;
};

function fold(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function differenceParts(answer: string, correction: string) {
  const left = Array.from(answer.normalize('NFC'));
  const right = Array.from(correction.normalize('NFC'));
  const matrix = Array.from({ length: left.length + 1 }, () =>
    Array<number>(right.length + 1).fill(0),
  );
  for (let i = left.length - 1; i >= 0; i -= 1)
    for (let j = right.length - 1; j >= 0; j -= 1)
      matrix[i][j] =
        left[i].toLocaleLowerCase() === right[j].toLocaleLowerCase()
          ? matrix[i + 1][j + 1] + 1
          : Math.max(matrix[i + 1][j], matrix[i][j + 1]);

  const parts: AnswerDifferencePart[] = [];
  const append = (type: AnswerDifferencePart['type'], text: string) => {
    const previous = parts.at(-1);
    if (previous?.type === type) previous.text += text;
    else parts.push({ type, text });
  };
  let i = 0,
    j = 0;
  while (i < left.length && j < right.length) {
    if (left[i].toLocaleLowerCase() === right[j].toLocaleLowerCase()) {
      append('same', right[j]);
      i += 1;
      j += 1;
    } else if (matrix[i + 1][j] >= matrix[i][j + 1]) {
      append('remove', left[i]);
      i += 1;
    } else {
      append('add', right[j]);
      j += 1;
    }
  }
  while (i < left.length) append('remove', left[i++]);
  while (j < right.length) append('add', right[j++]);
  return parts;
}

export function answerDifference(answer: string, correction: string) {
  const submitted = answer.trim();
  const expected = correction.trim();
  if (!submitted || !expected || submitted === expected) return null;
  if (submitted.length > 180 || expected.length > 180) return null;
  const parts = differenceParts(submitted, expected);
  const sameLength = parts
    .filter((part) => part.type === 'same')
    .reduce((total, part) => total + Array.from(part.text).length, 0);
  const similarity =
    sameLength /
    Math.max(Array.from(submitted).length, Array.from(expected).length, 1);
  const accentOnly = fold(submitted) === fold(expected);
  if (!accentOnly && similarity < 0.62) return null;
  return {
    kind: accentOnly ? ('accent' as const) : ('spelling' as const),
    parts,
  };
}

export function profileFirstName(displayName: string | null | undefined) {
  return displayName?.trim().split(/\s+/u)[0] || '';
}

export function personalizeFeedback(
  text: string,
  displayName: string | null | undefined,
) {
  const direct = directFeedback(text);
  const name = profileFirstName(displayName);
  if (!name || !direct) return direct;

  const conversational = direct.replace(/^([A-Z])/, (letter) =>
    letter.toLocaleLowerCase(),
  );
  return `${name}, ${conversational}`;
}
