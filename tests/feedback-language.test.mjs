import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const built = await build({
  entryPoints: ['lib/feedback-language.ts'],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'esm',
});
const {
  actionableCorrection,
  answerDifference,
  directFeedback,
  feedbackVerdictLabel,
  feedbackVisualState,
  isPassingFeedbackVerdict,
  personalizeFeedback,
  profileFirstName,
} = await import(
  `data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString('base64')}`
);

test('feedback addresses the person directly', () => {
  assert.equal(
    directFeedback('The learner used the expression accurately.'),
    'You used the expression accurately.',
  );
  assert.equal(
    directFeedback("The learner's answer fits the situation."),
    'Your answer fits the situation.',
  );
  assert.equal(
    directFeedback('The submitted response needs a different preposition.'),
    'Your response needs a different preposition.',
  );
});

test('older narrated errors defer directly to the corrected form', () => {
  assert.equal(
    actionableCorrection('The learner wrote “el cuenta,” which is incorrect.'),
    'Use the corrected form below.',
  );
  assert.equal(
    actionableCorrection('Use “la cuenta”; cuenta is feminine.'),
    'Use “la cuenta”; cuenta is feminine.',
  );
});

test('feedback uses the profile first name once and has a direct fallback', () => {
  assert.equal(profileFirstName('  Kurt Fulepp  '), 'Kurt');
  assert.equal(
    personalizeFeedback('You used the right expression.', 'Kurt Fulepp'),
    'Kurt, you used the right expression.',
  );
  assert.equal(
    personalizeFeedback('You used the right expression.', ''),
    'You used the right expression.',
  );
});

test('answer differences isolate accent and spelling repairs without forcing unrelated answers', () => {
  const accent = answerDifference(
    'Prefeririamos sentarnos afuera.',
    'Preferiríamos sentarnos afuera.',
  );
  assert.equal(accent?.kind, 'accent');
  assert.equal(
    accent?.parts.some((part) => part.type === 'remove' && part.text === 'i'),
    true,
  );
  assert.equal(
    accent?.parts.some((part) => part.type === 'add' && part.text === 'í'),
    true,
  );

  const spelling = answerDifference(
    'Quisiera una servesa.',
    'Quisiera una cerveza.',
  );
  assert.equal(spelling?.kind, 'spelling');
  assert.equal(
    answerDifference('Quiero sopa.', '¿Podría traerme la cuenta?'),
    null,
  );
});

test('shared feedback states treat a small fix as successful without hiding the repair', () => {
  assert.equal(isPassingFeedbackVerdict('correct'), true);
  assert.equal(isPassingFeedbackVerdict('correct_with_fix'), true);
  assert.equal(isPassingFeedbackVerdict('incorrect'), false);
  assert.equal(feedbackVisualState('correct_with_fix'), 'correct');
  assert.equal(feedbackVisualState('incorrect'), 'incorrect');
  assert.equal(feedbackVisualState('uncertain'), 'uncertain');
  assert.equal(feedbackVerdictLabel('correct_with_fix'), 'Correct — small fix');
});
