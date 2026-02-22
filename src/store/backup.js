import { collections } from './collections';
import { allTabs } from './tabs';
import { getDB } from './db';

const STORAGE_KEY = 'tab-hoarder-backup';

export async function syncToStorage() {
  try {
    await chrome.storage.local.set({
      [STORAGE_KEY]: {
        collections: collections.value,
        tabs: allTabs.value,
      },
    });
  } catch (err) {
    console.error('Tab Hoarder: sync to chrome.storage.local failed', err);
  }
}

export async function restoreFromStorage() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const data = result[STORAGE_KEY];
    if (!data || !data.collections?.length) return false;

    const db = getDB();
    const tx = db.transaction(['collections', 'tabs'], 'readwrite');
    for (const col of data.collections) {
      await tx.objectStore('collections').put(col);
    }
    for (const tab of data.tabs) {
      await tx.objectStore('tabs').put(tab);
    }
    await tx.done;
    return true;
  } catch (err) {
    console.error('Tab Hoarder: restore from chrome.storage.local failed', err);
    return false;
  }
}
