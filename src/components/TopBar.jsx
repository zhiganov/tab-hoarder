import { useState, useRef, useEffect } from 'preact/hooks';
import { SearchBar } from './SearchBar';
import { activeCollection, activeCollectionId, createCollection } from '../store/collections';
import { addTabs } from '../store/tabs';
import { getFaviconUrl } from '../lib/favicon';
import { ImportModal } from './ImportModal';
import { BookmarkImportModal } from './BookmarkImportModal';
import { exportData } from '../lib/export';

export function TopBar() {
  const [showImport, setShowImport] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    if (!showExportMenu) return;
    const handleClick = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showExportMenu]);

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
    <>
      <div class="topbar">
        <SearchBar />
        <div class="topbar-actions">
          <button class="topbar-btn" onClick={handleSaveAllTabs} title="Save all open tabs to the active collection">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="2" width="20" height="20" rx="2" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            Save all tabs
          </button>
          <button class="topbar-btn" onClick={() => setShowBookmarks(true)} title="Import bookmark folders as collections">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Bookmarks
          </button>
          <button class="topbar-btn" onClick={() => setShowImport(true)} title="Import tabs from Toby or JSON">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Import
          </button>
          <div class="topbar-btn-wrap" ref={exportMenuRef}>
            <button class="topbar-btn" onClick={() => setShowExportMenu(!showExportMenu)} title="Export data as JSON">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Export
            </button>
            {showExportMenu && (
              <div class="topbar-dropdown">
                <button class="topbar-dropdown-item" onClick={() => { exportData(); setShowExportMenu(false); }}>
                  All collections
                </button>
                {activeCollectionId.value && (
                  <button class="topbar-dropdown-item" onClick={() => { exportData(activeCollectionId.value); setShowExportMenu(false); }}>
                    {activeCollection.value?.name || 'Current collection'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
      {showBookmarks && <BookmarkImportModal onClose={() => setShowBookmarks(false)} />}
    </>
  );
}
