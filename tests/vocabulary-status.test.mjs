import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const built = await build({
  entryPoints: ['lib/vocabulary-assessment.ts'],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'esm',
});
const {
  assessmentQueue,
  vocabularyLearningState,
  vocabularyLearningStateLabel,
} = await import(
  `data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString('base64')}`
);

const assessmentItem = (
  id,
  {
    status = 'not_assessed',
    mode = 'practice',
    verdict = 'correct',
    retained = false,
    reviewAt = '2099-01-01T00:00:00.000Z',
    attempted = true,
  } = {},
) => ({
  id,
  key: id,
  english: id,
  spanish: id,
  status,
  latest: attempted
    ? {
        mode,
        status,
        retained,
        reviewAt,
        recall: { verdict },
      }
    : null,
});

test('maps saved evidence to the complete learner-facing ladder', () => {
  const now = Date.parse('2026-09-19T12:00:00.000Z');
  const cases = [
    [assessmentItem('new', { attempted: false }), 'new', 'New'],
    [assessmentItem('practiced'), 'practiced', 'Practiced'],
    [
      assessmentItem('gap', { verdict: 'incorrect' }),
      'needs_practice',
      'Needs practice',
    ],
    [
      assessmentItem('known', { status: 'known', mode: 'check' }),
      'known',
      'Known',
    ],
    [
      assessmentItem('due', {
        status: 'known',
        mode: 'check',
        reviewAt: '2026-09-18T12:00:00.000Z',
      }),
      'review_due',
      'Review due',
    ],
    [
      assessmentItem('retained', {
        status: 'known',
        mode: 'check',
        retained: true,
      }),
      'retained',
      'Retained',
    ],
  ];

  for (const [item, expectedState, expectedLabel] of cases) {
    const state = vocabularyLearningState(item, now);
    assert.equal(state, expectedState);
    assert.equal(vocabularyLearningStateLabel(state), expectedLabel);
  }
});

test('prioritizes gaps, due reviews, and practiced expressions before new work', () => {
  const now = Date.parse('2026-09-19T12:00:00.000Z');
  const items = [
    assessmentItem('retained', {
      status: 'known',
      mode: 'check',
      retained: true,
    }),
    assessmentItem('new', { attempted: false }),
    assessmentItem('practiced'),
    assessmentItem('due', {
      status: 'known',
      mode: 'check',
      reviewAt: '2026-09-18T12:00:00.000Z',
    }),
    assessmentItem('gap', { verdict: 'incorrect' }),
    assessmentItem('known', { status: 'known', mode: 'check' }),
  ];

  assert.deepEqual(
    assessmentQueue(items, now).map((item) => item.id),
    ['gap', 'due', 'practiced', 'new', 'known', 'retained'],
  );
});
