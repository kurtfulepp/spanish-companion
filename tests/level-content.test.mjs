import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const [cefrBuild, contentBuild] = await Promise.all(['lib/cefr.ts', 'lib/level-content.ts'].map((entryPoint) => build({
  entryPoints: [entryPoint], bundle: true, write: false, format: 'esm', platform: 'browser',
})));
const cefrModule = cefrBuild.outputFiles[0];
const contentModule = contentBuild.outputFiles[0];
const cefr = await import(`data:text/javascript;base64,${Buffer.from(cefrModule.text).toString('base64')}`);
const content = await import(`data:text/javascript;base64,${Buffer.from(contentModule.text).toString('base64')}`);

test('supports exactly the six CEFR levels and rejects broad ranges', () => {
  assert.deepEqual(cefr.CEFR_LEVELS, ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  for (const level of cefr.CEFR_LEVELS) assert.equal(cefr.cefrLevel(level), level);
  for (const invalid of ['', null, 'B1-B2', 'B1–B2', 'A0']) assert.equal(cefr.cefrLevel(invalid), '');
});

test('every level has distinct grammar and conversation experiences', () => {
  const prompts = new Set();
  const grammarTitles = new Set();
  for (const level of cefr.CEFR_LEVELS) {
    const conversation = content.CONVERSATION_CONTENT[level];
    const grammar = content.GRAMMAR_CONTENT[level];
    assert.equal(conversation.warmup.length, 3);
    assert.equal(conversation.lessonPoints.length, 3);
    assert.equal(grammar.questions.length, 4);
    assert.ok(grammar.questions.every((question) => question.options.length === 3 && question.answer >= 0 && question.answer < 3));
    prompts.add(conversation.prompt);
    grammarTitles.add(grammar.title);
  }
  assert.equal(prompts.size, 6);
  assert.equal(grammarTitles.size, 6);
});
