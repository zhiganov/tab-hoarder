import { removeTab } from '../store/tabs';
import { getFaviconUrl, getDomain } from '../lib/favicon';

export function TabCard({ tab, tabDrag }) {
  const favicon = tab.favicon || getFaviconUrl(tab.url);

  const handleClick = () => {
    window.open(tab.url, '_blank');
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    await removeTab(tab.id);
  };

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
      <button class="tab-remove" onClick={handleRemove} title="Remove tab">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
