export type DiagnosticItem = {
  id: string;
  sectionId: string;
  sortOrder: number;
};

export type DiagnosticProgress = {
  status: 'new' | 'learning' | 'confident';
  nextReviewAt: string;
};

function priority(progress: DiagnosticProgress | undefined, now: number) {
  if (!progress) return 0;
  const due = Date.parse(progress.nextReviewAt) <= now;
  if (due && progress.status !== 'confident') return 1;
  if (progress.status !== 'confident') return 2;
  if (due) return 3;
  return 4;
}

/**
 * Build a short, balanced check across topic moments. Unseen and due items come
 * first, while round-robin selection prevents one section from dominating.
 */
export function selectDiagnosticItems<T extends DiagnosticItem>(
  items: T[],
  progress: Record<string, DiagnosticProgress>,
  limit = 8,
  now = Date.now(),
) {
  const sectionOrder = [...new Set(items.map((item) => item.sectionId))];
  const buckets = new Map(
    sectionOrder.map((sectionId) => [
      sectionId,
      items
        .filter((item) => item.sectionId === sectionId)
        .sort(
          (a, b) =>
            priority(progress[a.id], now) - priority(progress[b.id], now) ||
            a.sortOrder - b.sortOrder,
        ),
    ]),
  );
  const selected: T[] = [];

  while (selected.length < limit) {
    let added = false;
    for (const sectionId of sectionOrder) {
      const item = buckets.get(sectionId)?.shift();
      if (!item) continue;
      selected.push(item);
      added = true;
      if (selected.length === limit) break;
    }
    if (!added) break;
  }
  return selected;
}
