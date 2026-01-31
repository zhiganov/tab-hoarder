import { useState } from 'preact/hooks';
import { SearchBar } from './SearchBar';
import { activeCollection, activeCollectionId } from '../store/collections';
import { addTab, addTabs } from '../store/tabs';
import { getFaviconUrl } from '../lib/favicon';
import { ImportModal } from './ImportModal';
import { exportData } from '../lib/export';

export function TopBar() {
  const [showImport, setShowImport] = useState(false);

  const handleSaveCurrentTab = async () => {
    const col = activeCollection.value;
    if (!col) return;
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_CURRENT_TAB' });
      if (response?.tab) {
        const { title, url, favIconUrl } = response.tab;
        await addTab(col.id, title, url, favIconUrl || getFaviconUrl(url));
      }
    } catch {
      // Not running as extension — ignore
    }
  };

  const handleSaveAllTabs = async () => {
    const col = activeCollection.value;
    if (!col) return;
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_ALL_TABS' });
      if (response?.tabs) {
        const tabsData = response.tabs
          .filter((t) => !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://'))
          .map((t) => ({
            title: t.title,
            url: t.url,
            favicon: t.favIconUrl || getFaviconUrl(t.url),
          }));
        if (tabsData.length > 0) {
          await addTabs(col.id, tabsData);
        }
      }
    } catch {
      // Not running as extension — ignore
    }
  };

  return (
    <>
      <div class="topbar">
        <SearchBar />
        <div class="topbar-actions">
          <button class="topbar-btn" onClick={handleSaveCurrentTab} title="Save the current tab to the active collection">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12l7-7 7 7" />
            </svg>
            Save tab
          </button>
          <button class="topbar-btn" onClick={handleSaveAllTabs} title="Save all open tabs to the active collection">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="2" width="20" height="20" rx="2" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            Save all
          </button>
          <button class="topbar-btn" onClick={() => setShowImport(true)} title="Import tabs from Toby or JSON">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Import
          </button>
          <button class="topbar-btn" onClick={exportData} title="Export all data as JSON">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Export
          </button>
        </div>
      </div>
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
    </>
  );
}
