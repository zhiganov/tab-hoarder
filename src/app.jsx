import { useEffect, useState } from 'preact/hooks';
import { initDB } from './store/db';
import { loadCollections, activeCollection, collections } from './store/collections';
import { loadTabs } from './store/tabs';
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
      setReady(true);
    })();
  }, []);

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
