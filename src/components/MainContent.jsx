import { useState } from 'preact/hooks';
import { activeCollection } from '../store/collections';
import { activeTabs, addTab } from '../store/tabs';
import { TabCard } from './TabCard';
import { EmptyState } from './EmptyState';
import { getFaviconUrl } from '../lib/favicon';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

export function MainContent() {
  const collection = activeCollection.value;
  const tabs = activeTabs.value;
  const { tabDrag } = useDragAndDrop();

  const [urlInput, setUrlInput] = useState('');

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

  const handleManualAdd = async (e) => {
    e.preventDefault();
    let url = urlInput.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    try {
      new URL(url);
    } catch {
      return;
    }
    await addTab(collection.id, url, url, getFaviconUrl(url));
    setUrlInput('');
  };

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
          text='Save open tabs with the "Save tab" button, or add a URL below.'
        >
          <form class="manual-add-form" onSubmit={handleManualAdd}>
            <input
              type="text"
              placeholder="Paste a URL..."
              value={urlInput}
              onInput={(e) => setUrlInput(e.target.value)}
            />
            <button type="submit">Add</button>
          </form>
        </EmptyState>
      ) : (
        <>
          <div class="tab-grid">
            {tabs.map((tab) => (
              <TabCard
                key={tab.id}
                tab={tab}
                tabDrag={tabDrag}
              />
            ))}
          </div>
          <form
            class="manual-add-form"
            style={{ marginTop: '24px' }}
            onSubmit={handleManualAdd}
          >
            <input
              type="text"
              placeholder="Add a URL..."
              value={urlInput}
              onInput={(e) => setUrlInput(e.target.value)}
            />
            <button type="submit">Add</button>
          </form>
        </>
      )}
    </div>
  );
}
