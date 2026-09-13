import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
const built = await build({
  entryPoints: ['lib/server/vocabulary-assessment-ai.ts'],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'esm',
});
const { assessmentAI, validFeedback, ASSESSMENT_RUBRIC } = await import(
  `data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString('base64')}`
);
const response = (body) => async () => Response.json(body);
test('structured grading sends only provided task data and never stores the OpenAI response', async () => {
  let sent;
  const result = await assessmentAI(
    'Instructions',
    { answer: 'La cuenta' },
    { type: 'object' },
    'test-key',
    'test-model',
    undefined,
    async (_url, options) => {
      sent = JSON.parse(options.body);
      return Response.json({
        status: 'completed',
        output: [
          { content: [{ type: 'output_text', text: '{"result":"valid"}' }] },
        ],
      });
    },
  );
  assert.equal(result.result, 'valid');
  assert.equal(sent.store, false);
  assert.equal(sent.text.format.strict, true);
  assert.equal(sent.model, 'test-model');
  assert.equal(sent.input, '{"answer":"La cuenta"}');
});
test('refusals, incomplete output, invalid JSON and upstream failures never become grades', async () => {
  for (const body of [
    { status: 'incomplete', output: [] },
    { status: 'completed', output: [{ content: [{ type: 'refusal' }] }] },
    {
      status: 'completed',
      output: [{ content: [{ type: 'output_text', text: 'invalid' }] }],
    },
  ])
    await assert.rejects(() =>
      assessmentAI('x', {}, {}, 'test', 'model', undefined, response(body)),
    );
  await assert.rejects(() =>
    assessmentAI(
      'x',
      {},
      {},
      'test',
      'model',
      undefined,
      async () => new Response('', { status: 429 }),
    ),
  );
});
test('feedback validation and rubric preserve variants, uncertainty and scoped evidence', () => {
  assert.equal(
    validFeedback({
      verdict: 'correct',
      explanation: 'Meaning is clear.',
      example: 'La cuenta.',
    }),
    true,
  );
  assert.equal(
    validFeedback({ verdict: 'known', explanation: 'x', example: 'x' }),
    false,
  );
  assert.equal(
    validFeedback({ verdict: 'correct', explanation: '', example: 'x' }),
    false,
  );
  for (const text of [
    'regional',
    'uncertain',
    'untrusted DATA',
    'minor spelling',
    'overall proficiency',
  ])
    assert.ok(ASSESSMENT_RUBRIC.includes(text));
});
