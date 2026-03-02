import { SearchBar } from './SearchBar';
import { createCollection } from '../store/collections';
import { addTabs } from '../store/tabs';
import { getFaviconUrl } from '../lib/favicon';
import { settingsOpen } from '../store/settings';

export function TopBar() {
  const handleSaveAllTabs = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_ALL_TABS' });
      if (!response?.tabs) return;

      const saveable = response.tabs.filter(
        (t) => !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://')
      );
      if (saveable.length === 0) return;

      const date = new Date().toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
      const col = await createCollection(date);

      const tabsData = saveable.map((t) => ({
        title: t.title,
        url: t.url,
        favicon: t.favIconUrl || getFaviconUrl(t.url),
      }));
      await addTabs(col.id, tabsData);

      const tabIds = saveable.map((t) => t.id);
      chrome.tabs.remove(tabIds);
    } catch {
      // Not running as extension — ignore
    }
  };

  return (
    <div class="topbar">
      <SearchBar />
      <div class="topbar-actions">
        <button class="topbar-btn" onClick={handleSaveAllTabs} title="Save all open tabs to a new collection">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="20" rx="2" />
            <path d="M12 8v8M8 12h8" />
          </svg>
          Save all tabs
        </button>
        <button
          class={`topbar-btn ${settingsOpen.value ? 'active' : ''}`}
          onClick={() => (settingsOpen.value = !settingsOpen.value)}
          title="Settings"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Settings
        </button>
      </div>
    </div>
  );
}
