import { getDB } from '../store/db';

export async function exportData() {
  const db = getDB();
  const collections = await db.getAll('collections');
  const tabs = await db.getAll('tabs');

  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    collections,
    tabs,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tab-hoarder-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
