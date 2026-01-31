import { signal, computed } from '@preact/signals';
import { getDB } from './db';
import { generateId } from '../lib/id';

export const collections = signal([]);
export const activeCollectionId = signal(null);

export const activeCollection = computed(() =>
  collections.value.find((c) => c.id === activeCollectionId.value) || null
);

export async function loadCollections() {
  const db = getDB();
  const all = await db.getAllFromIndex('collections', 'by-order');
  collections.value = all;
  if (all.length > 0 && !activeCollectionId.value) {
    activeCollectionId.value = all[0].id;
  }
}

export async function createCollection(name) {
  const db = getDB();
  const maxOrder = collections.value.reduce((max, c) => Math.max(max, c.order), -1);
  const collection = {
    id: generateId(),
    name,
    order: maxOrder + 1,
    color: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.put('collections', collection);
  collections.value = [...collections.value, collection];
  activeCollectionId.value = collection.id;
  return collection;
}

export async function renameCollection(id, name) {
  const db = getDB();
  const collection = collections.value.find((c) => c.id === id);
  if (!collection) return;
  const updated = { ...collection, name, updatedAt: Date.now() };
  await db.put('collections', updated);
  collections.value = collections.value.map((c) => (c.id === id ? updated : c));
}

export async function deleteCollection(id) {
  const db = getDB();
  // Delete all tabs in collection
  const tx = db.transaction(['collections', 'tabs'], 'readwrite');
  const tabIndex = tx.objectStore('tabs').index('by-collection');
  let cursor = await tabIndex.openCursor(IDBKeyRange.only(id));
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.objectStore('collections').delete(id);
  await tx.done;

  collections.value = collections.value.filter((c) => c.id !== id);
  if (activeCollectionId.value === id) {
    activeCollectionId.value = collections.value[0]?.id || null;
  }
}

export async function reorderCollections(orderedIds) {
  const db = getDB();
  const tx = db.transaction('collections', 'readwrite');
  const updated = orderedIds.map((id, index) => {
    const c = collections.value.find((col) => col.id === id);
    return { ...c, order: index, updatedAt: Date.now() };
  });
  for (const c of updated) {
    await tx.store.put(c);
  }
  await tx.done;
  collections.value = updated;
}
