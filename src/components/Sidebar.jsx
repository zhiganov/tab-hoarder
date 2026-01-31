import { useState } from 'preact/hooks';
import {
  collections,
  activeCollectionId,
  createCollection,
} from '../store/collections';
import { allTabs } from '../store/tabs';
import { CollectionItem } from './CollectionItem';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

export function Sidebar() {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const { collectionDrag } = useDragAndDrop();

  const handleAdd = async () => {
    const name = newName.trim();
    if (name) {
      await createCollection(name);
      setNewName('');
    }
    setAdding(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') {
      setAdding(false);
      setNewName('');
    }
  };

  return (
    <div class="sidebar">
      <div class="sidebar-header">
        <span class="sidebar-title">Tab Hoarder</span>
      </div>
      <div class="sidebar-list">
        {collections.value.map((col) => {
          const count = allTabs.value.filter(
            (t) => t.collectionId === col.id
          ).length;
          return (
            <CollectionItem
              key={col.id}
              collection={col}
              count={count}
              active={col.id === activeCollectionId.value}
              onSelect={() => (activeCollectionId.value = col.id)}
              collectionDrag={collectionDrag}
            />
          );
        })}
      </div>
      <div class="sidebar-footer">
        {adding ? (
          <div style={{ padding: '0 8px' }}>
            <input
              class="collection-name-input"
              style={{ width: '100%' }}
              value={newName}
              onInput={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleAdd}
              placeholder="Collection name"
              autoFocus
            />
          </div>
        ) : (
          <button
            class="add-collection-btn"
            onClick={() => setAdding(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New collection
          </button>
        )}
      </div>
    </div>
  );
}
