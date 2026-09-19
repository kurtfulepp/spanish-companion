import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const bundled = await build({
  stdin: {
    contents: `export { buildGrammarContexts, grammarContextSupport } from './lib/grammar-context'; export { GRAMMAR_RULES } from './lib/grammar-rules';`,
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  platform: 'node',
  format: 'esm',
});
const { buildGrammarContexts, grammarContextSupport, GRAMMAR_RULES } =
  await import(
    `data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`
  );

test('contexts expose practiced theme words and eligible reviewed photo text only', () => {
  const items = Array.from({ length: 10 }, (_, index) => ({
    id: `item-${index}`,
    spanish: ` expresión   ${index} `,
    english: ` expression ${index} `,
  }));
  const contexts = buildGrammarContexts({
    level: 'B2',
    practicedItemIds: items.slice(0, 9).map((item) => item.id),
    themes: [
      {
        id: 'dining-out',
        title: ' Dining Out ',
        vocabulary_sections: [{ vocabulary_items: items }],
      },
      {
        id: 'travel',
        title: 'Travel',
        vocabulary_sections: [
          {
            vocabulary_items: [
              { id: 'not-practiced', spanish: 'vuelo', english: 'flight' },
            ],
          },
        ],
      },
    ],
    customLists: [
      {
        id: 'matching',
        name: ' My kitchen ',
        source: 'photo',
        cefr_level: 'B2',
        words: [
          { spanish: 'cuchara', english: 'spoon', imageUrl: 'private' },
          { spanish: ' plato ', english: ' plate ' },
        ],
      },
      {
        id: 'legacy',
        name: 'Legacy list',
        source: 'photo',
        cefr_level: null,
        words: [{ spanish: 'vaso', english: 'glass' }],
      },
      {
        id: 'other-level',
        name: 'Other level',
        source: 'photo',
        cefr_level: 'A1',
        words: [{ spanish: 'pan', english: 'bread' }],
      },
      {
        id: 'demo',
        name: 'Demo',
        source: 'demo',
        cefr_level: 'B2',
        words: [{ spanish: 'muestra', english: 'sample' }],
      },
    ],
  });

  assert.deepEqual(
    contexts.map(({ id }) => id),
    ['theme:dining-out', 'custom:matching', 'custom:legacy'],
  );
  assert.equal(contexts[0].words.length, 8);
  assert.deepEqual(contexts[0].words[0], {
    spanish: 'expresión 0',
    english: 'expression 0',
  });
  assert.deepEqual(contexts[1].words[0], {
    spanish: 'cuchara',
    english: 'spoon',
  });
  assert.equal('imageUrl' in contexts[1].words[0], false);
});

test('Dining Out has reviewed support for every current rule and other contexts fall back safely', () => {
  const dining = {
    id: 'theme:dining-out',
    kind: 'theme',
    title: 'Dining Out',
    words: [{ spanish: 'la cuenta', english: 'the bill' }],
  };
  for (const rule of GRAMMAR_RULES) {
    const support = grammarContextSupport(dining, rule.id);
    assert.ok(support.situation.includes('restaurant'));
    assert.ok(support.example, `Missing Dining Out example for ${rule.id}`);
  }

  const custom = {
    id: 'custom:list',
    kind: 'custom',
    title: 'My list',
    words: [{ spanish: 'bicicleta', english: 'bicycle' }],
  };
  const fallback = grammarContextSupport(custom, GRAMMAR_RULES[0].id);
  assert.equal(fallback.example, null);
  assert.match(fallback.situation, /real or imagined situation/);
});
