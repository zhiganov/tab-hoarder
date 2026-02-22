import { useEffect, useRef, useState } from 'preact/hooks';
import { initDB } from './store/db';
import { loadCollections, activeCollection, collections, getOrCreateArchive } from './store/collections';
import { allTabs, loadTabs } from './store/tabs';
import { syncToStorage, restoreFromStorage } from './store/backup';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { SearchResults } from './components/SearchResults';
import { searchQuery } from './store/search';
import './styles/sidebar.css';
import './styles/main-content.css';
import './styles/tab-card.css';
import './styles/search.css';
import './styles/modal.css';
import './styles/animations.css';

export function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initDB();
      await loadCollections();
      await loadTabs();

      // Restore from chrome.storage.local if IndexedDB is empty
      const hasData = collections.value.length > 0 || allTabs.value.length > 0;
      if (!hasData) {
        const restored = await restoreFromStorage();
        if (restored) {
          await loadCollections();
          await loadTabs();
        }
      }

      await getOrCreateArchive();
      setReady(true);
    })();

    // Refresh when background service worker saves a tab
    const listener = (message) => {
      if (message.type === 'DATA_CHANGED') {
        loadCollections();
        loadTabs();
      }
    };
    chrome.runtime?.onMessage?.addListener(listener);
    return () => chrome.runtime?.onMessage?.removeListener(listener);
  }, []);

  // Debounced sync to chrome.storage.local on any data change
  const skipFirst = useRef(true);
  useEffect(() => {
    if (!ready) return;
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const timer = setTimeout(syncToStorage, 2000);
    return () => clearTimeout(timer);
  }, [ready, collections.value, allTabs.value]);

  if (!ready) return null;

  return (
    <div class="app-layout">
      <Sidebar />
      <div class="main-area">
        <TopBar />
        {searchQuery.value ? <SearchResults /> : <MainContent />}
      </div>
    </div>
  );
}
