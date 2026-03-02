import { useState, useEffect } from 'preact/hooks';
import {
  theme, setTheme,
  accentName, setAccent, ACCENT_COLORS,
  jamEnabled, setJamEnabled,
} from '../store/settings';
import { startJamPolling, stopJamPolling } from '../store/jam';
import { activeCollectionId } from '../store/collections';
import { exportData } from '../lib/export';
import { ImportModal } from './ImportModal';
import { BookmarkImportModal } from './BookmarkImportModal';
import { ConfirmDialog } from './ConfirmDialog';
import { clearAllData } from '../store/db';
import { loadCollections, collections, getOrCreateArchive } from '../store/collections';
import { allTabs, loadTabs } from '../store/tabs';
import '../styles/settings.css';

export function SettingsPanel() {
  const [showImport, setShowImport] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showClear, setShowClear] = useState(false);

  // Save behavior settings (chrome.storage.local — async)
  const [toolbarTarget, setToolbarTarget] = useState('saved-tabs');
  const [shortcutTarget, setShortcutTarget] = useState('most-recent');
  const [dailyBackup, setDailyBackup] = useState(true);
  const [backupInterval, setBackupInterval] = useState('1440');

  useEffect(() => {
    chrome.storage?.local?.get([
      'tab-hoarder-toolbar-target',
      'tab-hoarder-shortcut-target',
      'tab-hoarder-daily-backup',
      'tab-hoarder-backup-interval',
    ], (result) => {
      if (result['tab-hoarder-toolbar-target']) setToolbarTarget(result['tab-hoarder-toolbar-target']);
      if (result['tab-hoarder-shortcut-target']) setShortcutTarget(result['tab-hoarder-shortcut-target']);
      if (result['tab-hoarder-daily-backup'] !== undefined) setDailyBackup(result['tab-hoarder-daily-backup'] !== false);
      if (result['tab-hoarder-backup-interval']) setBackupInterval(result['tab-hoarder-backup-interval']);
    });
  }, []);

  const saveChromeStorage = (key, value) => {
    chrome.storage?.local?.set({ [key]: value });
  };

  const handleJamToggle = () => {
    const next = !jamEnabled.value;
    setJamEnabled(next);
    if (next) {
      startJamPolling();
    } else {
      stopJamPolling();
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllData();
      activeCollectionId.value = null;
      await loadCollections();
      await loadTabs();
      await getOrCreateArchive();
    } catch (err) {
      console.error('Tab Hoarder: clear all data failed', err);
    }
    setShowClear(false);
  };

  const isDark = theme.value === 'dark';

  return (
    <>
      <div class="settings-panel">
        <h1>Settings</h1>

        {/* --- Appearance --- */}
        <div class="settings-section">
          <div class="settings-section-title">Appearance</div>

          <div class="settings-row">
            <div>
              <div class="settings-label">Theme</div>
            </div>
            <div class="theme-toggle">
              <button
                class={`theme-toggle-btn ${!isDark ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >Light</button>
              <button
                class={`theme-toggle-btn ${isDark ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >Dark</button>
            </div>
          </div>

          <div class="settings-row">
            <div>
              <div class="settings-label">Accent color</div>
            </div>
            <div class="accent-swatches">
              {ACCENT_COLORS.map(color => (
                <button
                  key={color.name}
                  class={`accent-swatch ${accentName.value === color.name ? 'active' : ''}`}
                  style={{ background: isDark ? color.dark : color.light }}
                  title={color.name}
                  onClick={() => setAccent(color.name)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* --- Save Behavior --- */}
        <div class="settings-section">
          <div class="settings-section-title">Save Behavior</div>

          <div class="settings-row">
            <div>
              <div class="settings-label">Toolbar icon click</div>
              <div class="settings-description">What happens when you click the extension icon</div>
            </div>
            <div class="settings-radio-group">
              <label class="settings-radio">
                <input
                  type="radio"
                  name="toolbar-target"
                  checked={toolbarTarget === 'saved-tabs'}
                  onChange={() => { setToolbarTarget('saved-tabs'); saveChromeStorage('tab-hoarder-toolbar-target', 'saved-tabs'); }}
                />
                Saved Tabs
              </label>
              <label class="settings-radio">
                <input
                  type="radio"
                  name="toolbar-target"
                  checked={toolbarTarget === 'most-recent'}
                  onChange={() => { setToolbarTarget('most-recent'); saveChromeStorage('tab-hoarder-toolbar-target', 'most-recent'); }}
                />
                Most recent
              </label>
            </div>
          </div>

          <div class="settings-row">
            <div>
              <div class="settings-label">Alt+S shortcut</div>
              <div class="settings-description">What happens when you press Alt+S</div>
            </div>
            <div class="settings-radio-group">
              <label class="settings-radio">
                <input
                  type="radio"
                  name="shortcut-target"
                  checked={shortcutTarget === 'most-recent'}
                  onChange={() => { setShortcutTarget('most-recent'); saveChromeStorage('tab-hoarder-shortcut-target', 'most-recent'); }}
                />
                Most recent
              </label>
              <label class="settings-radio">
                <input
                  type="radio"
                  name="shortcut-target"
                  checked={shortcutTarget === 'saved-tabs'}
                  onChange={() => { setShortcutTarget('saved-tabs'); saveChromeStorage('tab-hoarder-shortcut-target', 'saved-tabs'); }}
                />
                Saved Tabs
              </label>
            </div>
          </div>
        </div>

        {/* --- Jam Widget --- */}
        <div class="settings-section">
          <div class="settings-section-title">Navidrome Jam</div>

          <div class="settings-row">
            <div>
              <div class="settings-label">Show listening rooms</div>
              <div class="settings-description">Display active jam rooms from jam.zhgnv.com</div>
            </div>
            <div
              class={`toggle-switch ${jamEnabled.value ? 'on' : ''}`}
              onClick={handleJamToggle}
              role="switch"
              aria-checked={jamEnabled.value}
            />
          </div>
        </div>

        {/* --- Backups --- */}
        <div class="settings-section">
          <div class="settings-section-title">Backups</div>

          <div class="settings-row">
            <div>
              <div class="settings-label">Daily file backup</div>
              <div class="settings-description">Save backup to Downloads/TabHoarder/</div>
            </div>
            <div
              class={`toggle-switch ${dailyBackup ? 'on' : ''}`}
              onClick={() => {
                const next = !dailyBackup;
                setDailyBackup(next);
                saveChromeStorage('tab-hoarder-daily-backup', next);
              }}
              role="switch"
              aria-checked={dailyBackup}
            />
          </div>

          <div class="settings-row">
            <div>
              <div class="settings-label">Backup frequency</div>
            </div>
            <select
              class="settings-select"
              value={backupInterval}
              onChange={(e) => {
                setBackupInterval(e.target.value);
                saveChromeStorage('tab-hoarder-backup-interval', e.target.value);
              }}
            >
              <option value="720">Every 12 hours</option>
              <option value="1440">Every day</option>
              <option value="4320">Every 3 days</option>
              <option value="10080">Weekly</option>
            </select>
          </div>
        </div>

        {/* --- Data --- */}
        <div class="settings-section">
          <div class="settings-section-title">Data</div>

          <div class="settings-actions">
            <button class="settings-action-btn" onClick={() => setShowImport(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Import JSON
            </button>
            <button class="settings-action-btn" onClick={() => setShowBookmarks(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Import bookmarks
            </button>
            <button class="settings-action-btn" onClick={() => exportData()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Export all
            </button>
            {activeCollectionId.value && (
              <button class="settings-action-btn" onClick={() => exportData(activeCollectionId.value)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Export current
              </button>
            )}
            <button class="settings-action-btn danger" onClick={() => setShowClear(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Clear all data
            </button>
          </div>
        </div>
      </div>

      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
      {showBookmarks && <BookmarkImportModal onClose={() => setShowBookmarks(false)} />}
      {showClear && (
        <ConfirmDialog
          title="Clear all data?"
          message="This will permanently delete all collections, tabs, and backups. This cannot be undone."
          confirmLabel="Clear everything"
          danger
          onConfirm={handleClearAll}
          onCancel={() => setShowClear(false)}
        />
      )}
    </>
  );
}
