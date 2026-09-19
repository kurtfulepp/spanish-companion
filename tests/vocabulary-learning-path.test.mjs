import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const built = await build({
  entryPoints: ['lib/vocabulary-learning-path.ts'],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'esm',
});
const { buildLearningPath, buildLearningSession, learningPathState } =
  await import(
    `data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString('base64')}`
  );
const sets = [
  {
    id: 'set-1',
    set_number: 1,
    title: 'First',
    description: '',
    item_count: 2,
    content_version: 1,
  },
  {
    id: 'set-2',
    set_number: 2,
    title: 'Second',
    description: '',
    item_count: 2,
    content_version: 1,
  },
];
const items = [1, 2, 3, 4].map((number) => ({
  id: `item-${number}`,
  learning_set_id: number < 3 ? 'set-1' : 'set-2',
  curriculum_position: number % 2,
}));
const result = (id, status, retained = false, reviewAt = '2099-01-01') => ({
  id,
  key: id,
  english: id,
  spanish: id,
  status,
  latest:
    status === 'not_assessed'
      ? null
      : {
          status,
          retained,
          reviewAt: `${reviewAt}T00:00:00.000Z`,
          mode: 'check',
          recall: {
            verdict: status === 'needs_practice' ? 'incorrect' : 'correct',
          },
        },
});
const practicedResult = (id, verdict = 'correct') => ({
  id,
  key: id,
  english: id,
  spanish: id,
  status: 'not_assessed',
  latest: {
    status: 'not_assessed',
    retained: false,
    reviewAt: '2099-01-01T00:00:00.000Z',
    mode: 'practice',
    recall: { verdict },
  },
});
const catalog = (...results) => ({ items: results });

test('uses evidence and due dates for learner-facing states', () => {
  const now = Date.parse('2026-09-13T12:00:00.000Z');
  assert.equal(learningPathState(null, now), 'new');
  assert.equal(learningPathState(practicedResult('a'), now), 'practiced');
  assert.equal(
    learningPathState(result('a', 'needs_practice'), now),
    'needs_practice',
  );
  assert.equal(
    learningPathState(practicedResult('a', 'incorrect'), now),
    'needs_practice',
  );
  assert.equal(learningPathState(result('a', 'known'), now), 'known');
  assert.equal(learningPathState(result('a', 'known', true), now), 'retained');
  assert.equal(
    learningPathState(result('a', 'known', true, '2026-09-12'), now),
    'review_due',
  );
});

test('advances after every expression in the current set has an independent result', () => {
  const first = buildLearningPath(
    items,
    sets,
    catalog(result('item-1', 'known')),
  );
  assert.equal(first.activeSet.id, 'set-1');
  assert.deepEqual(
    first.newItems.map((item) => item.id),
    ['item-2'],
  );
  const practiced = buildLearningPath(
    items,
    sets,
    catalog(result('item-1', 'known'), practicedResult('item-2')),
  );
  assert.equal(practiced.activeSet.id, 'set-1');
  assert.deepEqual(
    practiced.practiced.map((item) => item.id),
    ['item-2'],
  );
  assert.equal(practiced.setProgress[0].checkedCount, 1);
  assert.equal(practiced.setProgress[0].practicedCount, 1);
  const second = buildLearningPath(
    items,
    sets,
    catalog(result('item-1', 'known'), result('item-2', 'needs_practice')),
  );
  assert.equal(second.activeSet.id, 'set-2');
  assert.deepEqual(second.newItems.map((item) => item.id).sort(), [
    'item-3',
    'item-4',
  ]);
  assert.deepEqual(
    second.learning.map((item) => item.id),
    ['item-2'],
  );
});

test('requires delayed retention for all-retained and reopens due work', () => {
  const retained = items.map((item) => result(item.id, 'known', true));
  assert.equal(
    buildLearningPath(items, sets, catalog(...retained)).allRetained,
    true,
  );
  retained[0] = result('item-1', 'known', true, '2020-01-01');
  const due = buildLearningPath(items, sets, catalog(...retained));
  assert.equal(due.allRetained, false);
  assert.deepEqual(
    due.due.map((item) => item.id),
    ['item-1'],
  );
});

test('builds a six-item session that mixes reviews with new curriculum', () => {
  const sessionSets = [
    {
      id: 'set-1',
      set_number: 1,
      title: 'First',
      description: '',
      item_count: 8,
      content_version: 1,
    },
  ];
  const sessionItems = Array.from({ length: 8 }, (_, index) => ({
    id: `session-${index + 1}`,
    learning_set_id: 'set-1',
    curriculum_position: index + 1,
  }));
  const summary = buildLearningPath(
    sessionItems,
    sessionSets,
    catalog(
      result('session-1', 'known', false, '2020-01-01'),
      result('session-2', 'known', false, '2020-01-01'),
      result('session-3', 'known', false, '2020-01-01'),
      result('session-4', 'needs_practice'),
      result('session-5', 'needs_practice'),
      result('session-6', 'needs_practice'),
      practicedResult('session-7'),
    ),
  );
  const session = buildLearningSession(summary);

  assert.equal(session.items.length, 6);
  assert.deepEqual(
    session.items.map((item) => item.id),
    [
      'session-1',
      'session-2',
      'session-4',
      'session-7',
      'session-8',
      'session-3',
    ],
  );
  assert.equal(session.newRemaining, 0);
  assert.equal(session.practiceRemaining, 2);
});

test('builds the same six-expression flow for a topic without formal sets', () => {
  const topicItems = Array.from({ length: 8 }, (_, index) => ({
    id: `topic-${index + 1}`,
    learning_set_id: null,
    curriculum_position: index + 1,
  }));
  const summary = buildLearningPath(
    topicItems,
    [],
    catalog(
      result('topic-1', 'known', false, '2020-01-01'),
      result('topic-2', 'needs_practice'),
    ),
  );
  const session = buildLearningSession(summary);

  assert.equal(summary.activeSet, null);
  assert.equal(summary.setProgress.length, 0);
  assert.equal(summary.entries.length, 8);
  assert.deepEqual(
    session.items.map((item) => item.id),
    ['topic-1', 'topic-2', 'topic-3', 'topic-4', 'topic-5', 'topic-6'],
  );
  assert.equal(session.newRemaining, 2);
  assert.equal(session.practiceRemaining, 0);
});
