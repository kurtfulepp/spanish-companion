// FPO fixture only. Keep this separate from the real analysis response.
export const KITCHEN_PHOTO = '/demo/kitchen-photo.png';
export type DemoWord = { id: string; english: string; spanish: string; note: string; selected: boolean };
export function kitchenWords(): DemoWord[] {
  return [
    ['refrigerator', 'el refrigerador', 'Also: la nevera.'],
    ['stove', 'la estufa', 'Also: la cocina, depending on the region.'],
    ['frying pan', 'la sartén', ''],
    ['pot', 'la olla', ''],
    ['sink', 'el fregadero', ''],
    ['faucet', 'el grifo', 'Also: la llave.'],
    ['cutting board', 'la tabla de cortar', ''],
    ['knife', 'el cuchillo', ''],
    ['mug', 'la taza', ''],
    ['apple', 'la manzana', ''],
    ['dish towel', 'el paño de cocina', ''],
    ['wooden spoon', 'la cuchara de madera', ''],
  ].map(([english, spanish, note], index) => ({ id: `kitchen-${index}`, english, spanish, note, selected: true }));
}

export function wordErrors(words: DemoWord[]) {
  const errors: Record<string, string> = {};
  const english = new Set<string>();
  const spanish = new Set<string>();
  for (const word of words.filter((item) => item.selected)) {
    const en = word.english.trim().toLocaleLowerCase();
    const es = word.spanish.trim().toLocaleLowerCase();
    if (!en || !es) errors[word.id] = 'Enter both English and Spanish, or uncheck this word.';
    else if (en.length > 80 || es.length > 80) errors[word.id] = 'Keep each word or phrase to 80 characters.';
    else if (english.has(en) || spanish.has(es)) errors[word.id] = 'This word is already selected. Edit it or uncheck this row.';
    english.add(en); spanish.add(es);
  }
  return errors;
}
