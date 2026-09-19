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
const { buildLearningPath, learningPathState } = await import(
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
      : { status, retained, reviewAt: `${reviewAt}T00:00:00.000Z` },
});
const catalog = (...results) => ({ items: results });

test('uses evidence and due dates for learner-facing states', () => {
  const now = Date.parse('2026-09-13T12:00:00.000Z');
  assert.equal(learningPathState(null, now), 'new');
  assert.equal(
    learningPathState(result('a', 'needs_practice'), now),
    'learning',
  );
  assert.equal(learningPathState(result('a', 'known'), now), 'known');
  assert.equal(
    learningPathState(result('a', 'known', true), now),
    'retained',
  );
  assert.equal(
    learningPathState(result('a', 'known', true, '2026-09-12'), now),
    'due',
  );
});

test('advances only when every expression in the current set is known', () => {
  const first = buildLearningPath(
    items,
    sets,
    catalog(result('item-1', 'known')),
  );
  assert.equal(first.activeSet.id, 'set-1');
  assert.deepEqual(first.active.map((item) => item.id), ['item-2']);
  const second = buildLearningPath(
    items,
    sets,
    catalog(result('item-1', 'known'), result('item-2', 'known')),
  );
  assert.equal(second.activeSet.id, 'set-2');
  assert.deepEqual(
    second.active.map((item) => item.id).sort(),
    ['item-3', 'item-4'],
  );
});

test('requires delayed retention for mastered-for-now and reopens due work', () => {
  const retained = items.map((item) => result(item.id, 'known', true));
  assert.equal(buildLearningPath(items, sets, catalog(...retained)).masteredForNow, true);
  retained[0] = result('item-1', 'known', true, '2020-01-01');
  const due = buildLearningPath(items, sets, catalog(...retained));
  assert.equal(due.masteredForNow, false);
  assert.deepEqual(due.due.map((item) => item.id), ['item-1']);
});
