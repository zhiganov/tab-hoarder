import { useState, useRef } from 'preact/hooks';
import { parseTobyExport } from '../lib/toby-import';
import { createCollection, getOrCreateArchive } from '../store/collections';
import { addTabs } from '../store/tabs';
import { getFaviconUrl } from '../lib/favicon';

export function ImportModal({ onClose }) {
  const [status, setStatus] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef(null);

  const processFile = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const lists = parseTobyExport(data);

      let totalTabs = 0;
      for (const list of lists) {
        const col = list.isArchive
          ? await getOrCreateArchive()
          : await createCollection(list.name);
        const tabsData = list.tabs.map((t) => ({
          title: t.title,
          url: t.url,
          favicon: getFaviconUrl(t.url),
        }));
        await addTabs(col.id, tabsData);
        totalTabs += tabsData.length;
      }

      setStatus({
        type: 'success',
        message: `Imported ${lists.length} collections with ${totalTabs} tabs.`,
      });
    } catch (err) {
      setStatus({
        type: 'error',
        message: `Import failed: ${err.message}`,
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div class="modal-overlay" onClick={onClose}>
      <div class="modal" onClick={(e) => e.stopPropagation()}>
        <h2 class="modal-title">Import tabs</h2>
        <p class="modal-text">
          Drop a Toby export (JSON) or a Tab Hoarder export file.
        </p>
        <div
          class={`import-dropzone ${dragActive ? 'drag-active' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
          />
          <p>Drop JSON file here or click to browse</p>
        </div>
        {status && (
          <p class={`import-status ${status.type}`}>{status.message}</p>
        )}
        <div class="modal-actions" style={{ marginTop: '16px' }}>
          <button class="modal-btn cancel" onClick={onClose}>
            {status?.type === 'success' ? 'Done' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
