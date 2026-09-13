import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { build } from 'esbuild';
import { parseCurriculum } from '../scripts/generate-grammar-curriculum.mjs';

async function load(entryPoint) {
  const result = await build({
    entryPoints: [entryPoint],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`
  );
}
const [
  { GRAMMAR_MODULES, GRAMMAR_SYSTEMS },
  { GRAMMAR_RULES, checkGrammarAnswer },
  { validateGrammarSubmission, scoreRule },
] = await Promise.all([
  load('lib/grammar-curriculum.generated.ts'),
  load('lib/grammar-rules.ts'),
  load('lib/grammar-evidence.ts'),
]);

test('the runtime catalog exactly preserves the adopted curriculum and its system index', async () => {
  const expected = parseCurriculum(
    await readFile('docs/grammar-curriculum-plan.md', 'utf8'),
  );
  assert.deepEqual(GRAMMAR_MODULES, expected.modules);
  assert.deepEqual(GRAMMAR_SYSTEMS, expected.systems);
  assert.equal(new Set(GRAMMAR_MODULES.map((entry) => entry.id)).size, 87);
  assert.deepEqual(
    ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(
      (level) =>
        GRAMMAR_MODULES.filter((entry) => entry.level === level).length,
    ),
    [14, 15, 16, 16, 14, 12],
  );
});

test('each rule has valid prerequisites, versioned identity and separate evidence tasks', () => {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  assert.deepEqual(
    [...new Set(GRAMMAR_RULES.map((rule) => rule.level))],
    levels,
  );
  for (const rule of GRAMMAR_RULES) {
    assert.ok(rule.id.startsWith(`${rule.moduleId}.`));
    assert.equal(
      GRAMMAR_MODULES.find((entry) => entry.id === rule.moduleId).level,
      rule.level,
    );
    assert.equal(
      new Set(rule.exercises.map((item) => item.id)).size,
      rule.exercises.length,
    );
    for (const prerequisite of rule.prerequisites) {
      const entry = GRAMMAR_MODULES.find((item) => item.id === prerequisite);
      assert.ok(entry, prerequisite);
      assert.ok(levels.indexOf(entry.level) <= levels.indexOf(rule.level));
    }
    assert.deepEqual(
      new Set(rule.exercises.map((item) => item.kind)),
      new Set(['recognition', 'formation', 'choice']),
    );
    assert.equal(rule.reviewStatus, 'draft');
    assert.ok(rule.source.url.startsWith('https://'));
    for (const exercise of rule.exercises) {
      assert.ok(exercise.answers.length > 0);
      for (const answer of exercise.answers) {
        assert.equal(
          checkGrammarAnswer(exercise, `  ${answer.toUpperCase()}  `),
          true,
        );
        if (exercise.options) assert.ok(exercise.options.includes(answer));
      }
      assert.equal(checkGrammarAnswer(exercise, 'not an answer'), false);
    }
  }
});

test('accent-sensitive formation and valid subjunctive variants are graded fairly', () => {
  const a1 = GRAMMAR_RULES[0].exercises.find(
    (item) => item.id === 'form-plural',
  );
  assert.equal(checkGrammarAnswer(a1, 'faciles'), false);
  assert.equal(checkGrammarAnswer(a1, 'fa\u0301ciles'), true);
  const b2 = GRAMMAR_RULES[3].exercises.find(
    (item) => item.id === 'form-condition',
  );
  assert.equal(checkGrammarAnswer(b2, 'hubiera sabido'), true);
  assert.equal(checkGrammarAnswer(b2, 'hubiese sabido'), true);
});

const submissionFor = (rule) => ({
  attemptId: '00000000-0000-4000-8000-000000000001',
  ruleId: rule.id,
  version: rule.version,
  answers: Object.fromEntries(
    rule.exercises.map((item) => [item.id, item.answers[0]]),
  ),
  writing: 'Mi respuesta original.',
  selfReview: rule.production.checklist.map(() => false),
});

test('server validation requires complete versioned evidence and permits earlier-level review only', () => {
  for (const rule of GRAMMAR_RULES) {
    const submission = submissionFor(rule);
    assert.deepEqual(
      validateGrammarSubmission(submission, rule.level),
      submission,
    );
    assert.deepEqual(validateGrammarSubmission(submission, 'C2'), submission);
    if (rule.level !== 'A1')
      assert.equal(validateGrammarSubmission(submission, 'A1'), null);
    for (const change of [
      { attemptId: 'bad-id' },
      { version: 999 },
      { ruleId: 'missing' },
      { answers: {} },
      { answers: [] },
      { writing: '' },
      { writing: 'x'.repeat(4001) },
      { selfReview: [] },
      { selfReview: ['yes', true, false] },
    ])
      assert.equal(
        validateGrammarSubmission({ ...submission, ...change }, 'C2'),
        null,
      );
    const invalidAnswers = {
      ...submission.answers,
      [rule.exercises[0].id]: 12,
    };
    assert.equal(
      validateGrammarSubmission(
        { ...submission, answers: invalidAnswers },
        'C2',
      ),
      null,
    );
    assert.equal(
      validateGrammarSubmission(
        {
          ...submission,
          answers: { ...submission.answers, extra: 'injected' },
        },
        'C2',
      ),
      null,
    );
  }
});

test('scores preserve independent denominators and never assign a writing grade', () => {
  const rule = GRAMMAR_RULES[0];
  const submission = submissionFor(rule);
  submission.answers['form-singular'] = 'pequeño';
  assert.deepEqual(scoreRule(rule, submission.answers), {
    recognition: { correct: 1, total: 1 },
    formation: { correct: 1, total: 2 },
    choice: { correct: 1, total: 1 },
  });
  assert.deepEqual(scoreRule(rule, {}), {
    recognition: { correct: 0, total: 1 },
    formation: { correct: 0, total: 2 },
    choice: { correct: 0, total: 1 },
  });
});
