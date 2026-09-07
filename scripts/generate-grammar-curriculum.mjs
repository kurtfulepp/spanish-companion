import { readFile, writeFile } from 'node:fs/promises';

// The adopted document owns names, scope, evidence, and system assignments.
export function parseCurriculum(source) {
  const systems = [];
  const modules = [];
  const assignments = new Map();
  for (const line of source.split('\n')) {
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (/^G\d{2}$/.test(cells[0] ?? '') && cells.length === 3)
      systems.push({ id: cells[0], title: cells[1], scope: cells[2] });
    const entry = cells[0]?.match(/^([ABC][12]-\d{2}) (.+)$/);
    if (entry) {
      if (cells.length !== 4 || !cells[3])
        throw new Error(`Missing practical use description for ${entry[1]}`);
      modules.push({
        id: entry[1],
        level: entry[1].slice(0, 2),
        title: entry[2],
        scope: cells[1],
        objective: cells[2],
        whenToUse: cells[3],
      });
    }
    if (/^[ABC][12]-\d{2}$/.test(cells[0] ?? '') && cells.length === 2)
      assignments.set(
        cells[0],
        cells[1].split(',').map((id) => id.trim()),
      );
  }
  if (systems.length !== 15 || modules.length !== 87)
    throw new Error(
      'Unexpected curriculum inventory. Review the parser and curriculum together.',
    );
  return {
    systems,
    modules: modules.map((entry) => {
      const systemIds = assignments.get(entry.id);
      if (
        !systemIds?.length ||
        systemIds.some((id) => !systems.some((system) => system.id === id))
      )
        throw new Error(`Missing or unknown systems for ${entry.id}`);
      return { ...entry, systemIds };
    }),
  };
}

if (process.argv[1]?.endsWith('generate-grammar-curriculum.mjs')) {
  const catalog = parseCurriculum(
    await readFile(
      new URL('../docs/grammar-curriculum-plan.md', import.meta.url),
      'utf8',
    ),
  );
  await writeFile(
    new URL('../lib/grammar-curriculum.generated.ts', import.meta.url),
    `// Generated from docs/grammar-curriculum-plan.md. Run node scripts/generate-grammar-curriculum.mjs.\nimport type { CEFRLevel } from './cefr';\nexport type GrammarModule = { id: string; level: CEFRLevel; title: string; scope: string; objective: string; whenToUse: string; systemIds: string[] };\nexport const GRAMMAR_SYSTEMS = ${JSON.stringify(catalog.systems, null, 2)};\nexport const GRAMMAR_MODULES: GrammarModule[] = ${JSON.stringify(catalog.modules, null, 2)};\n`,
  );
}
