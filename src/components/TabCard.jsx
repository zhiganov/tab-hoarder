import { useState, useRef, useEffect } from 'preact/hooks';
import { removeTab, moveTab, allTabs } from '../store/tabs';
import { collections } from '../store/collections';
import { getFaviconUrl, getDomain } from '../lib/favicon';

export function TabCard({ tab, tabDrag }) {
  const favicon = tab.favicon || getFaviconUrl(tab.url);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!showMenu) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu]);

  const handleClick = () => {
    window.open(tab.url, '_blank');
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    await removeTab(tab.id);
  };

  const handleMove = async (targetCollectionId) => {
    const targetTabs = allTabs.value.filter((t) => t.collectionId === targetCollectionId);
    const maxOrder = targetTabs.reduce((max, t) => Math.max(max, t.order), -1);
    await moveTab(tab.id, targetCollectionId, maxOrder + 1);
    setShowMenu(false);
  };

  const otherCollections = collections.value.filter((c) => c.id !== tab.collectionId);

  return (
    <div
      class="tab-card"
      onClick={handleClick}
      draggable
      onDragStart={(e) => tabDrag.onDragStart(e, tab)}
      onDragOver={(e) => tabDrag.onDragOver(e, tab.id)}
      onDragLeave={(e) => tabDrag.onDragLeave(e)}
      onDrop={(e) => tabDrag.onDrop(e, tab)}
      onDragEnd={tabDrag.onDragEnd}
    >
      <img
        class="tab-favicon"
        src={favicon}
        alt=""
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
      <div class="tab-info">
        <div class="tab-title">{tab.title}</div>
        <div class="tab-domain">{getDomain(tab.url)}</div>
      </div>
      <div class="tab-actions" ref={menuRef}>
        {otherCollections.length > 0 && (
          <button
            class="tab-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            title="Move to collection"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        )}
        <button class="tab-action-btn" onClick={handleRemove} title="Remove tab">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {showMenu && (
          <div class="tab-move-menu">
            <div class="tab-move-menu-title">Move to</div>
            {otherCollections.map((col) => (
              <button
                key={col.id}
                class="tab-move-menu-item"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMove(col.id);
                }}
              >
                {col.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
