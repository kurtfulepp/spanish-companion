import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

async function load(entryPoint) {
  const result = await build({
    entryPoints: [entryPoint],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`
  );
}
const [
  { GRAMMAR_LESSONS },
  { advanceGrammar, newGrammarAttempt, grammarResult },
] = await Promise.all([
  load('lib/grammar-lessons.ts'),
  load('lib/grammar-practice.ts'),
]);
const lessons = Object.values(GRAMMAR_LESSONS).flat();

test('all levels have complete, distinct lessons with valid answer keys', () => {
  assert.deepEqual(Object.keys(GRAMMAR_LESSONS), [
    'A1',
    'A2',
    'B1',
    'B2',
    'C1',
    'C2',
  ]);
  assert.equal(new Set(lessons.map((lesson) => lesson.id)).size, 18);
  for (const [level, items] of Object.entries(GRAMMAR_LESSONS)) {
    assert.equal(items.length, 3);
    for (const lesson of items) {
      assert.ok(lesson.id.startsWith(level.toLowerCase()));
      assert.ok(lesson.rules.length >= 3);
      assert.ok(
        lesson.rules.every(
          (rule) => rule.explanation && rule.spanish && rule.english,
        ),
      );
      assert.equal(lesson.questions.length, 4);
      for (const question of lesson.questions) {
        assert.equal(question.sentence.split('___').length, 2);
        assert.equal(new Set(question.options).size, 3);
        assert.ok(Number.isInteger(question.answer));
        assert.ok(question.options[question.answer]);
        assert.ok(question.explanation);
        assert.ok(
          !question.sentence
            .replace('___', question.options[question.answer])
            .includes('cuando que'),
        );
      }
    }
  }
});

test('cannot skip unanswered questions, alter checked answers, or count an answer twice', () => {
  const lesson = lessons[0];
  let state = newGrammarAttempt(lesson);
  assert.equal(advanceGrammar(lesson, state, { type: 'next' }), state);
  state = advanceGrammar(lesson, state, { type: 'start' });
  for (const action of [
    { type: 'next' },
    { type: 'check' },
    { type: 'select', value: -1 },
    { type: 'select', value: 1.5 },
    { type: 'select', value: 100 },
  ]) {
    assert.equal(advanceGrammar(lesson, state, action), state);
  }
  state = advanceGrammar(lesson, state, {
    type: 'select',
    value: lesson.questions[0].answer,
  });
  state = advanceGrammar(lesson, state, { type: 'check' });
  assert.equal(advanceGrammar(lesson, state, { type: 'check' }), state);
  assert.equal(
    advanceGrammar(lesson, state, { type: 'select', value: 2 }),
    state,
  );
  const next = advanceGrammar(lesson, state, { type: 'next' });
  assert.equal(next.position, 1);
  assert.equal(next.selected, null);
  assert.equal(Object.keys(next.answers).length, 1);
  assert.equal(advanceGrammar(lesson, next, { type: 'next' }), next);
});

function finish(lesson, initial, wrongIndices = []) {
  let state = initial;
  while (state.phase === 'practice') {
    const index = state.indices[state.position];
    const correct = lesson.questions[index].answer;
    state = advanceGrammar(lesson, state, {
      type: 'select',
      value: wrongIndices.includes(index) ? (correct + 1) % 3 : correct,
    });
    state = advanceGrammar(lesson, state, { type: 'check' });
    state = advanceGrammar(lesson, state, { type: 'next' });
  }
  return state;
}

test('every lesson can be completed, reviewed by original question identity, and restarted', () => {
  for (const lesson of lessons) {
    let state = advanceGrammar(lesson, newGrammarAttempt(lesson), {
      type: 'start',
    });
    state = finish(lesson, state, [1, 3]);
    assert.deepEqual(grammarResult(lesson, state), {
      score: 2,
      total: 4,
      missed: [1, 3],
    });
    state = advanceGrammar(lesson, state, { type: 'retry-missed' });
    assert.equal(state.reviewing, true);
    assert.deepEqual(state.indices, [1, 3]);
    state = finish(lesson, state, [3]);
    assert.deepEqual(grammarResult(lesson, state), {
      score: 1,
      total: 2,
      missed: [3],
    });
    state = finish(
      lesson,
      advanceGrammar(lesson, state, { type: 'retry-missed' }),
    );
    assert.deepEqual(grammarResult(lesson, state), {
      score: 1,
      total: 1,
      missed: [],
    });
    assert.equal(
      advanceGrammar(lesson, state, { type: 'retry-missed' }),
      state,
    );
    state = advanceGrammar(lesson, state, { type: 'start' });
    assert.equal(state.reviewing, false);
    assert.deepEqual(state.answers, {});
    assert.deepEqual(state.indices, [0, 1, 2, 3]);
    state = finish(lesson, state);
    assert.deepEqual(grammarResult(lesson, state), {
      score: 4,
      total: 4,
      missed: [],
    });
  }
});
