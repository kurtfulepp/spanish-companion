import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const { outputFiles } = await build({
  entryPoints: ['lib/topic-diagnostic.ts'],
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'browser',
});
const { selectDiagnosticItems } = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`
);

const items = Array.from({ length: 12 }, (_, index) => ({
  id: `item-${index + 1}`,
  sectionId: `section-${(index % 6) + 1}`,
  sortOrder: Math.floor(index / 6) + 1,
}));

test('balances the diagnostic across topic moments before taking second items', () => {
  const selected = selectDiagnosticItems(
    items,
    {},
    8,
    Date.parse('2026-09-06T00:00:00Z'),
  );
  assert.deepEqual(
    selected.slice(0, 6).map((item) => item.sectionId),
    [
      'section-1',
      'section-2',
      'section-3',
      'section-4',
      'section-5',
      'section-6',
    ],
  );
  assert.equal(selected.length, 8);
});

test('prioritizes unseen and due expressions within each moment', () => {
  const progress = {
    'item-1': { status: 'confident', nextReviewAt: '2026-10-01T00:00:00Z' },
    'item-2': { status: 'learning', nextReviewAt: '2026-09-01T00:00:00Z' },
  };
  const selected = selectDiagnosticItems(
    items,
    progress,
    6,
    Date.parse('2026-09-06T00:00:00Z'),
  );
  assert.equal(
    selected.find((item) => item.sectionId === 'section-1').id,
    'item-7',
  );
  assert.equal(
    selected.find((item) => item.sectionId === 'section-2').id,
    'item-8',
  );
});
