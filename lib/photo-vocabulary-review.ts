export type ReviewWord = { id: string; english: string; spanish: string; note: string; selected: boolean };

export function wordErrors(words: ReviewWord[]) {
  const errors: Record<string, string> = {};
  const english = new Set<string>();
  const spanish = new Set<string>();
  for (const word of words.filter((item) => item.selected)) {
    const en = word.english.trim().toLocaleLowerCase();
    const es = word.spanish.trim().toLocaleLowerCase();
    if (!en || !es) errors[word.id] = 'Enter both English and Spanish, or uncheck this word.';
    else if (en.length > 100 || es.length > 100) errors[word.id] = 'Keep each word or phrase to 100 characters.';
    else if (english.has(en) || spanish.has(es)) errors[word.id] = 'This word is already selected. Edit it or uncheck this row.';
    english.add(en); spanish.add(es);
  }
  return errors;
}
