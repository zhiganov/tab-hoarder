import { activeCollection } from '../store/collections';
import { activeTabs } from '../store/tabs';
import { TabCard } from './TabCard';
import { EmptyState } from './EmptyState';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

export function MainContent() {
  const collection = activeCollection.value;
  const tabs = activeTabs.value;
  const { tabDrag } = useDragAndDrop();

  if (!collection) {
    return (
      <div class="main-content">
        <EmptyState
          title="No collections yet"
          text="Create your first collection from the sidebar to start saving tabs."
        />
      </div>
    );
  }

  return (
    <div class="main-content">
      <div class="collection-header">
        <h1 class="collection-title">{collection.name}</h1>
        <p class="collection-meta">
          {tabs.length} {tabs.length === 1 ? 'tab' : 'tabs'}
        </p>
      </div>
      {tabs.length === 0 ? (
        <EmptyState
          title="This collection is empty"
          text='Save open tabs with the "Save tab" button or click the toolbar icon.'
        />
      ) : (
        <div class="tab-grid">
          {tabs.map((tab) => (
            <TabCard
              key={tab.id}
              tab={tab}
              tabDrag={tabDrag}
            />
          ))}
        </div>
      )}
    </div>
  );
}
