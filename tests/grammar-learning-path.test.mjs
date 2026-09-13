import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
const result = await build({
  stdin: {
    contents: `export * from './lib/grammar-learning-path'; export * from './lib/grammar-past-content'; export * from './lib/grammar-evidence'; export * from './lib/grammar-rules';`,
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
});
const {
  PAST_PATH,
  PAST_PRACTICE,
  GRAMMAR_RULES,
  checkGrammarAnswer,
  pathRecommendation,
  latestPathEvidence,
  REVIEW_INTERVAL_MS,
  validateGrammarSubmission,
  scoreRule,
  startingScores,
  practiceMode,
} = await import(
  `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`
);
const answersFor = (questions) =>
  Object.fromEntries(questions.map((item) => [item.id, item.answers[0]]));
const submissionFor = (rule, answers) => ({
  attemptId: '00000000-0000-4000-8000-000000000001',
  ruleId: rule.id,
  version: rule.version,
  answers,
  writing: 'Mi historia.',
  selfReview: rule.production.checklist.map(() => false),
});

test('connected content maps to stable rules and has disjoint starting, practice and review banks', () => {
  assert.equal(PAST_PATH.length, 7);
  for (const rule of PAST_PATH) {
    assert.ok(GRAMMAR_RULES.includes(rule));
    const extra = PAST_PRACTICE[rule.id];
    const all = [...extra.check, ...rule.exercises, ...extra.revisit];
    assert.equal(new Set(all.map((item) => item.id)).size, all.length);
    assert.ok(extra.writingPrompt && extra.notice.explanation);
    for (const item of all) {
      assert.ok(item.explanation);
      assert.equal(checkGrammarAnswer(item, item.answers[0]), true);
      if (item.options)
        for (const answer of item.answers)
          assert.ok(item.options.includes(answer));
    }
    assert.ok(
      extra.revisit.every(
        (item) =>
          !rule.exercises.some((original) => original.prompt === item.prompt),
      ),
    );
  }
});

test('server accepts legacy, full lesson and review attempts but rejects mixtures and partial checks', () => {
  for (const rule of PAST_PATH) {
    const extra = PAST_PRACTICE[rule.id];
    const primary = answersFor(rule.exercises);
    const check = answersFor(extra.check);
    const review = answersFor(extra.revisit);
    for (const answers of [primary, { ...primary, ...check }, review]) {
      assert.ok(
        validateGrammarSubmission(submissionFor(rule, answers), rule.level),
      );
      if (rule.level !== 'A1')
        assert.equal(
          validateGrammarSubmission(submissionFor(rule, answers), 'A1'),
          null,
        );
      assert.ok(validateGrammarSubmission(submissionFor(rule, answers), 'C2'));
    }
    for (const answers of [
      check,
      { ...primary, [extra.check[0].id]: extra.check[0].answers[0] },
      { ...primary, ...review },
      { ...review, invented: 'answer' },
      { ...review, [extra.revisit[0].id]: 'x'.repeat(301) },
    ]) {
      assert.equal(
        validateGrammarSubmission(submissionFor(rule, answers), 'C2'),
        null,
      );
    }
  }
});

test('starting errors never inflate or reduce main practice and review has its own denominator', () => {
  const rule = PAST_PATH[0];
  const extra = PAST_PRACTICE[rule.id];
  const answers = {
    ...answersFor(rule.exercises),
    ...Object.fromEntries(extra.check.map((item) => [item.id, 'wrong'])),
  };
  assert.deepEqual(
    scoreRule(rule, answers),
    scoreRule(rule, answersFor(rule.exercises)),
  );
  assert.equal(startingScores(rule, answers).formation.correct, 0);
  assert.equal(startingScores(rule, answers).choice.correct, 0);
  assert.equal(startingScores(rule, answersFor(rule.exercises)), undefined);
  const review = answersFor(extra.revisit);
  assert.equal(practiceMode(rule, review), 'revisit');
  assert.equal(
    Object.values(scoreRule(rule, review)).reduce(
      (sum, item) => sum + item.total,
      0,
    ),
    3,
  );
});

const now = Date.parse('2026-09-12T12:00:00Z');
const evidence = (rule, changes = {}) => ({
  attemptId: 'saved',
  ruleId: rule.id,
  version: rule.version,
  savedAt: new Date(now).toISOString(),
  scores: scoreRule(rule, answersFor(rule.exercises)),
  writing: 'Text',
  selfReview: [],
  ...changes,
});
test('recommendations distinguish current learning, weak foundations, and delayed reviews without unlocking levels', () => {
  assert.equal(pathRecommendation('B2', [], now).rule.level, 'B2');
  const foundation = PAST_PATH[0];
  const weak = evidence(foundation, {
    scores: {
      recognition: { correct: 1, total: 1 },
      formation: { correct: 0, total: 2 },
      choice: { correct: 1, total: 1 },
    },
  });
  assert.equal(pathRecommendation('B2', [weak], now).rule.id, foundation.id);
  assert.match(pathRecommendation('B2', [weak], now).reason, /form/);
  const old = evidence(foundation, {
    savedAt: new Date(now - REVIEW_INTERVAL_MS).toISOString(),
  });
  assert.equal(pathRecommendation('A1', [old], now).mode, 'revisit');
  assert.equal(pathRecommendation('A1', [evidence(foundation)], now), null);
  assert.equal(
    pathRecommendation('A1', [evidence(PAST_PATH[6])], now).rule.level,
    'A1',
  );
  assert.equal(
    pathRecommendation(
      'C2',
      PAST_PATH.map((rule) => evidence(rule)),
      now,
    ),
    null,
  );
});

test('recommendations use the latest matching version instead of stale errors', () => {
  const rule = PAST_PATH[0];
  const old = evidence(rule, {
    savedAt: '2026-09-01T12:00:00Z',
    scores: scoreRule(rule, {}),
  });
  const current = evidence(rule);
  const otherVersion = evidence(rule, {
    version: 999,
    savedAt: '2026-09-15T12:00:00Z',
  });
  assert.equal(
    latestPathEvidence(rule.id, [old, otherVersion, current]),
    current,
  );
  assert.equal(
    pathRecommendation('A1', [old, otherVersion, current], now),
    null,
  );
});
