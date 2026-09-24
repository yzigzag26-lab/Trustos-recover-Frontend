import { useEffect, useState } from 'react';
export type Issue = 'access' | 'transaction' | 'other';
export type DemoActivity = { id: string; issue: Issue; event: 'started' | 'completed'; at: string };
function key(id: string) { return `trustos-demo-activity-${id}`; }
export function readDemoActivity(id: string): DemoActivity[] {
  try { return JSON.parse(localStorage.getItem(key(id)) || '[]') as DemoActivity[]; } catch { return []; }
}
/** Only high-level demo labels are stored locally. No user-entered data or secrets. */
export function recordDemoActivity(id: string, issue: Issue, event: DemoActivity['event']) {
  try {
    const items = readDemoActivity(id);
    items.unshift({ id: crypto.randomUUID(), issue, event, at: new Date().toISOString() });
    localStorage.setItem(key(id), JSON.stringify(items.slice(0, 30)));
    window.dispatchEvent(new Event('trustos-activity-change'));
  } catch { /* Activity is optional; storage might be unavailable. */ }
}
export function clearDemoActivity(id: string) {
  try { localStorage.removeItem(key(id)); window.dispatchEvent(new Event('trustos-activity-change')); } catch { /* okay */ }
}
export function useDemoActivity(id: string): DemoActivity[] {
  const [items, setItems] = useState(() => readDemoActivity(id));
  useEffect(() => {
    const update = () => setItems(readDemoActivity(id));
    update();
    window.addEventListener('storage', update);
    window.addEventListener('trustos-activity-change', update);
    return () => { window.removeEventListener('storage', update); window.removeEventListener('trustos-activity-change', update); };
  }, [id]);
  return items;
}
export const issueNames: Record<Issue, string> = { access: 'Wallet access', transaction: 'Transaction question', other: 'Other issue' };
