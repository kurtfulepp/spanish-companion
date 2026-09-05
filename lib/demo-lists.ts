export type SavedDemoWord = { english: string; spanish: string };
export type SavedDemoList = { id: string; name: string; words: SavedDemoWord[]; completed: boolean; createdAt: string };
const prefix = 'kurtes:fpo-vocabulary:v1:';
export const DEMO_LISTS_CHANGED = 'kurtes-demo-lists-changed';

export function demoListsKey(owner: string) {
  if (!owner) throw new Error('Sign in to save or view your lists.');
  return prefix + owner;
}
function validList(value: unknown): value is SavedDemoList {
  if (!value || typeof value !== 'object') return false;
  const item = value as SavedDemoList;
  return typeof item.id === 'string' && typeof item.name === 'string' && Boolean(item.name.trim()) &&
    typeof item.completed === 'boolean' && typeof item.createdAt === 'string' && Array.isArray(item.words) && item.words.length > 0 &&
    item.words.every((word) => word && typeof word.english === 'string' && Boolean(word.english.trim()) && typeof word.spanish === 'string' && Boolean(word.spanish.trim()));
}
export function readDemoLists(storage: Pick<Storage, 'getItem'>, owner: string): SavedDemoList[] {
  const raw = storage.getItem(demoListsKey(owner));
  if (!raw) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || !data.every(validList)) throw new Error('These browser lists could not be read. They have not been changed.');
  return data;
}
// Explicit serialization keeps image data and other draft properties out of storage.
function textOnly(list: SavedDemoList): SavedDemoList {
  return { id: list.id, name: list.name.trim(), completed: list.completed, createdAt: list.createdAt,
    words: list.words.map((word) => ({ english: word.english.trim(), spanish: word.spanish.trim() })) };
}
export function writeDemoList(storage: Pick<Storage, 'getItem' | 'setItem'>, owner: string, list: SavedDemoList) {
  if (!validList(list)) throw new Error('Name your list and include at least one complete word pair.');
  const lists = readDemoLists(storage, owner);
  const existing = lists.findIndex((item) => item.id === list.id);
  if (existing < 0) lists.unshift(textOnly(list));
  else lists[existing] = textOnly(list);
  storage.setItem(demoListsKey(owner), JSON.stringify(lists));
  return lists;
}
export function changeDemoList(storage: Pick<Storage, 'getItem' | 'setItem'>, owner: string, id: string, action: 'complete' | 'restore' | 'delete') {
  const lists = readDemoLists(storage, owner);
  const updated = action === 'delete' ? lists.filter((item) => item.id !== id) : lists.map((item) => item.id === id ? { ...item, completed: action === 'complete' } : item);
  storage.setItem(demoListsKey(owner), JSON.stringify(updated.map(textOnly)));
  return updated;
}
