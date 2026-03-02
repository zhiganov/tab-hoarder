# Settings Panel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a settings panel to Tab Hoarder with theme/accent customization, save behavior config, jam widget toggle, backup controls, and consolidated data actions.

**Architecture:** New `settings.js` store module holds signals for all settings. `SettingsPanel.jsx` renders in the MainContent area when `settingsOpen` signal is true. Theme is applied via `[data-theme]` attribute on `<html>`, accent colors via CSS custom property overrides. Settings that `background.js` needs use `chrome.storage.local`; UI-only settings use `localStorage`.

**Tech Stack:** Preact + Signals, CSS custom properties, chrome.storage.local API, localStorage

**Design doc:** `docs/plans/2026-03-02-settings-design.md`

---

### Task 1: Settings store module

**Files:**
- Create: `src/store/settings.js`

**Step 1: Create settings store**

```js
import { signal } from '@preact/signals';

// --- Accent color palette ---
export const ACCENT_COLORS = [
  { name: 'Terracotta', light: '#c45d3e', lightHover: '#a84e33', dark: '#e8854a', darkHover: '#d4753d' },
  { name: 'Ocean',      light: '#2d7d9a', lightHover: '#24667d', dark: '#4db8d6', darkHover: '#3da0ba' },
  { name: 'Forest',     light: '#4a8c5c', lightHover: '#3d734c', dark: '#6ab87a', darkHover: '#5aa068' },
  { name: 'Plum',       light: '#7b5ea7', lightHover: '#664d8c', dark: '#a07ed4', darkHover: '#8c6dba' },
  { name: 'Slate',      light: '#5a6a7a', lightHover: '#4a5766', dark: '#8a9aaa', darkHover: '#788898' },
  { name: 'Amber',      light: '#b8860b', lightHover: '#996f09', dark: '#daa520', darkHover: '#c4941c' },
];

// --- Signals ---
export const theme = signal(localStorage.getItem('tab-hoarder-theme') || 'light');
export const accentName = signal(localStorage.getItem('tab-hoarder-accent') || 'Terracotta');
export const jamEnabled = signal(localStorage.getItem('tab-hoarder-jam-enabled') !== 'false');
export const settingsOpen = signal(false);

// --- Theme ---
export function setTheme(value) {
  theme.value = value;
  localStorage.setItem('tab-hoarder-theme', value);
  document.documentElement.setAttribute('data-theme', value);
  applyAccent(accentName.value);
}

// --- Accent ---
function getAccent(name) {
  return ACCENT_COLORS.find(c => c.name === name) || ACCENT_COLORS[0];
}

export function applyAccent(name) {
  const color = getAccent(name);
  const isDark = theme.value === 'dark';
  const accent = isDark ? color.dark : color.light;
  const hover = isDark ? color.darkHover : color.lightHover;
  const r = parseInt(accent.slice(1, 3), 16);
  const g = parseInt(accent.slice(3, 5), 16);
  const b = parseInt(accent.slice(5, 7), 16);
  const subtle = isDark ? `rgba(${r}, ${g}, ${b}, 0.12)` : `rgba(${r}, ${g}, ${b}, 0.1)`;

  document.documentElement.style.setProperty('--accent', accent);
  document.documentElement.style.setProperty('--accent-hover', hover);
  document.documentElement.style.setProperty('--accent-subtle', subtle);
  document.documentElement.style.setProperty('--border-active', accent);
}

export function setAccent(name) {
  accentName.value = name;
  localStorage.setItem('tab-hoarder-accent', name);
  applyAccent(name);
}

// --- Jam ---
export function setJamEnabled(value) {
  jamEnabled.value = value;
  localStorage.setItem('tab-hoarder-jam-enabled', value ? 'true' : 'false');
}

// --- Init (call before render) ---
export function initSettings() {
  document.documentElement.setAttribute('data-theme', theme.value);
  applyAccent(accentName.value);
}
```

**Step 2: Commit**

```bash
git add src/store/settings.js
git commit -m "feat: add settings store module with theme, accent, and jam signals"
```

---

### Task 2: Theme system — replace prefers-color-scheme with data-theme

**Files:**
- Modify: `src/styles/variables.css` (lines 48-74)
- Modify: `src/index.jsx` (lines 1-6)

**Step 1: Update variables.css — change media query to data-theme selector**

Replace the `@media (prefers-color-scheme: dark)` block (lines 48-74) with:

```css
[data-theme="dark"] {
    --bg-primary: #1a1814;
    --bg-secondary: #242019;
    --bg-sidebar: #1e1b16;
    --bg-card: #2a2620;
    --bg-card-hover: #322d26;
    --bg-input: #2a2620;
    --bg-overlay: rgba(0, 0, 0, 0.5);

    --text-primary: #e8e0d4;
    --text-secondary: #b0a494;
    --text-muted: #7a6f62;
    --text-inverse: #1a1814;

    --accent: #e8854a;
    --accent-hover: #d4753d;
    --accent-subtle: rgba(232, 133, 74, 0.12);

    --border: #3a352e;
    --border-active: #e8854a;

    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.2);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.25);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.35);
}
```

**Step 2: Update index.jsx — initialize settings before render**

```jsx
import { render } from 'preact';
import { App } from './app';
import { initSettings } from './store/settings';
import './styles/variables.css';
import './styles/global.css';

initSettings();
render(<App />, document.getElementById('app'));
```

**Step 3: Build and verify**

Run: `cd /c/Users/temaz/claude-project/tab-hoarder && npm run build`
Expected: Build succeeds, no errors.

**Step 4: Commit**

```bash
git add src/styles/variables.css src/index.jsx
git commit -m "feat: switch theme system from prefers-color-scheme to data-theme attribute"
```

---

### Task 3: Settings panel component and styles

**Files:**
- Create: `src/components/SettingsPanel.jsx`
- Create: `src/styles/settings.css`

**Step 1: Create settings.css**

```css
.settings-panel {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-xl);
  max-width: 640px;
}

.settings-panel h1 {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  margin-bottom: var(--space-xl);
}

.settings-section {
  margin-bottom: var(--space-xl);
}

.settings-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-md);
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) 0;
}

.settings-row + .settings-row {
  border-top: 1px solid var(--border);
}

.settings-label {
  font-size: 14px;
  color: var(--text-primary);
}

.settings-description {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* Theme toggle buttons */
.theme-toggle {
  display: flex;
  gap: 2px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  padding: 2px;
}

.theme-toggle-btn {
  padding: var(--space-xs) var(--space-md);
  border-radius: calc(var(--radius-sm) - 2px);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.theme-toggle-btn.active {
  background: var(--accent);
  color: var(--text-inverse);
}

/* Accent color swatches */
.accent-swatches {
  display: flex;
  gap: var(--space-sm);
}

.accent-swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  border: 2px solid transparent;
}

.accent-swatch:hover {
  transform: scale(1.15);
}

.accent-swatch.active {
  border-color: var(--text-primary);
  box-shadow: 0 0 0 2px var(--bg-primary), 0 0 0 4px var(--text-primary);
}

/* Toggle switch */
.toggle-switch {
  position: relative;
  width: 40px;
  height: 22px;
  background: var(--border);
  border-radius: 11px;
  cursor: pointer;
  transition: background var(--transition-fast);
  flex-shrink: 0;
}

.toggle-switch.on {
  background: var(--accent);
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  transition: transform var(--transition-fast);
}

.toggle-switch.on::after {
  transform: translateX(18px);
}

/* Select dropdown */
.settings-select {
  padding: var(--space-xs) var(--space-sm);
  font-size: 13px;
  background: var(--bg-input);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.settings-select:focus {
  border-color: var(--border-active);
  outline: none;
}

/* Save target radio group */
.settings-radio-group {
  display: flex;
  gap: var(--space-md);
}

.settings-radio {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
}

.settings-radio input[type="radio"] {
  accent-color: var(--accent);
}

/* Data action buttons */
.settings-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.settings-action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.settings-action-btn:hover {
  background: var(--border);
  color: var(--text-primary);
}

.settings-action-btn.danger {
  color: #c44040;
}

.settings-action-btn.danger:hover {
  background: rgba(196, 64, 64, 0.1);
}
```

**Step 2: Create SettingsPanel.jsx**

```jsx
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
```

**Step 3: Build and verify**

Run: `cd /c/Users/temaz/claude-project/tab-hoarder && npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/components/SettingsPanel.jsx src/styles/settings.css
git commit -m "feat: add SettingsPanel component and styles"
```

---

### Task 4: Wire settings into app.jsx

**Files:**
- Modify: `src/app.jsx`

**Step 1: Update app.jsx**

Import `settingsOpen`, `jamEnabled`, and `SettingsPanel`. Conditionally start jam polling based on `jamEnabled`. Render `SettingsPanel` instead of `MainContent` when `settingsOpen` is true.

Changes to `src/app.jsx`:

1. Add imports:
```js
import { settingsOpen, jamEnabled } from './store/settings';
import { SettingsPanel } from './components/SettingsPanel';
```

2. Change `startJamPolling()` call (line 39) to be conditional:
```js
if (jamEnabled.value) startJamPolling();
```

3. Add settings CSS import:
```js
import './styles/settings.css';
```

4. Update the render return (line 76) — replace:
```jsx
{searchQuery.value ? <SearchResults /> : <MainContent />}
```
with:
```jsx
{settingsOpen.value
  ? <SettingsPanel />
  : searchQuery.value
    ? <SearchResults />
    : <MainContent />}
```

**Step 2: Build and verify**

Run: `cd /c/Users/temaz/claude-project/tab-hoarder && npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app.jsx
git commit -m "feat: wire settings panel into app layout with conditional rendering"
```

---

### Task 5: Update TopBar — replace buttons with gear icon

**Files:**
- Modify: `src/components/TopBar.jsx`

**Step 1: Simplify TopBar**

Remove: `useState` for `showImport`, `showBookmarks`, `showExportMenu`. Remove: `useRef`/`useEffect` for export menu outside-click. Remove: `ImportModal`, `BookmarkImportModal`, `exportData` imports. Remove: all Bookmarks/Import/Export buttons and modals.

Add: gear icon button that toggles `settingsOpen`.

The full replacement for `TopBar.jsx`:

```jsx
import { SearchBar } from './SearchBar';
import { activeCollectionId, createCollection } from '../store/collections';
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
```

**Step 2: Add `.topbar-btn.active` style**

Add to `src/styles/main-content.css` after the `.topbar-btn:hover` rule (after line 33):

```css
.topbar-btn.active {
  color: var(--accent);
  background: var(--accent-subtle);
}
```

**Step 3: Build and verify**

Run: `cd /c/Users/temaz/claude-project/tab-hoarder && npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/components/TopBar.jsx src/styles/main-content.css
git commit -m "feat: replace TopBar import/export/bookmarks with settings gear icon"
```

---

### Task 6: Update Sidebar — remove Clear all data button

**Files:**
- Modify: `src/components/Sidebar.jsx` (lines 135-144)

**Step 1: Remove clear all data button and related code**

Remove from imports: `clearAllData` from `../store/db`, `ConfirmDialog`.
Remove: `showClear` state, `handleClearAll` function.
Remove: the clear-all button (lines 135-144) and the `ConfirmDialog` render (lines 146-155).

Close settings when a collection is selected — add `settingsOpen` import and set it to false on collection click.

Changes:

1. Add import: `import { settingsOpen } from '../store/settings';`
2. Remove imports: `clearAllData` from `../store/db`, `ConfirmDialog`
3. Remove: `const [showClear, setShowClear] = useState(false);`
4. Remove: the entire `handleClearAll` function (lines 25-36)
5. Update collection `onSelect` (line 80) from:
   ```js
   onSelect={() => (activeCollectionId.value = col.id)}
   ```
   to:
   ```js
   onSelect={() => { activeCollectionId.value = col.id; settingsOpen.value = false; }}
   ```
6. Update archive click (line 95) from:
   ```js
   onClick={() => (activeCollectionId.value = archive.id)}
   ```
   to:
   ```js
   onClick={() => { activeCollectionId.value = archive.id; settingsOpen.value = false; }}
   ```
7. Remove the clear-all button block (lines 135-144):
   ```jsx
   <button class="clear-all-btn" ... > ... Clear all data</button>
   ```
8. Remove the `ConfirmDialog` render block (lines 146-155)

**Step 2: Build and verify**

Run: `cd /c/Users/temaz/claude-project/tab-hoarder && npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/Sidebar.jsx
git commit -m "feat: remove clear-all-data from sidebar, close settings on collection select"
```

---

### Task 7: Update MainContent — respect jam toggle

**Files:**
- Modify: `src/components/MainContent.jsx` (lines 9, 21, 40)

**Step 1: Conditionally render JamBanner**

Add import: `import { jamEnabled } from '../store/settings';`

Replace both `<JamBanner />` instances (line 21 and line 40) with:
```jsx
{jamEnabled.value && <JamBanner />}
```

**Step 2: Build and verify**

Run: `cd /c/Users/temaz/claude-project/tab-hoarder && npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/MainContent.jsx
git commit -m "feat: conditionally render JamBanner based on jam toggle setting"
```

---

### Task 8: Update background.js — configurable save targets and backup settings

**Files:**
- Modify: `public/background.js`

**Step 1: Update toolbar icon handler (lines 136-146)**

Replace the toolbar click handler with one that reads the save target setting:

```js
// Toolbar icon click: save based on setting (default: "Saved Tabs")
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;
  try {
    const settings = await chrome.storage.local.get('tab-hoarder-toolbar-target');
    const target = settings['tab-hoarder-toolbar-target'] || 'saved-tabs';
    const db = await openDB();
    const collection = target === 'most-recent'
      ? await getRecentCollection(db)
      : await getSavedTabsCollection(db);
    db.close();
    await saveAndCloseTab(tab, collection);
  } catch (err) {
    console.error('Tab Hoarder: failed to save tab', err);
  }
});
```

**Step 2: Update Alt+S handler (lines 149-161)**

Replace the shortcut handler:

```js
// Alt+S shortcut: save based on setting (default: most recent collection)
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'save-to-recent') return;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;
    const settings = await chrome.storage.local.get('tab-hoarder-shortcut-target');
    const target = settings['tab-hoarder-shortcut-target'] || 'most-recent';
    const db = await openDB();
    const collection = target === 'saved-tabs'
      ? await getSavedTabsCollection(db)
      : await getRecentCollection(db);
    db.close();
    await saveAndCloseTab(tab, collection);
  } catch (err) {
    console.error('Tab Hoarder: failed to save tab via shortcut', err);
  }
});
```

**Step 3: Update runBackup to check daily backup toggle (lines 179-208)**

Add a setting check at the top of `runBackup()`:

```js
async function runBackup() {
  try {
    const settings = await chrome.storage.local.get('tab-hoarder-daily-backup');
    if (settings['tab-hoarder-daily-backup'] === false) return;

    const db = await openDB();
    // ... rest unchanged
```

**Step 4: Update alarm creation to use configurable interval (lines 211-215)**

Replace the `onInstalled` listener:

```js
chrome.runtime.onInstalled.addListener(async () => {
  const settings = await chrome.storage.local.get('tab-hoarder-backup-interval');
  const minutes = parseInt(settings['tab-hoarder-backup-interval']) || 1440;
  chrome.alarms.create('daily-backup', { periodInMinutes: minutes });
  runBackup();
});
```

**Step 5: Listen for settings changes to update alarm**

Add after the `chrome.alarms.onAlarm` listener:

```js
// Update alarm when backup interval setting changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes['tab-hoarder-backup-interval']) {
    const minutes = parseInt(changes['tab-hoarder-backup-interval'].newValue) || 1440;
    chrome.alarms.create('daily-backup', { periodInMinutes: minutes });
  }
});
```

**Step 6: Build and verify**

Run: `cd /c/Users/temaz/claude-project/tab-hoarder && npm run build`
Expected: Build succeeds (background.js is just copied to dist/).

**Step 7: Commit**

```bash
git add public/background.js
git commit -m "feat: read save targets and backup settings from chrome.storage.local"
```

---

### Task 9: Final build, version bump, and changelog

**Files:**
- Modify: `package.json` (version)
- Modify: `public/manifest.json` (version)
- Modify: `CHANGELOG.md`
- Modify: `CLAUDE.md` (add settings docs)

**Step 1: Build and manually test**

Run: `cd /c/Users/temaz/claude-project/tab-hoarder && npm run build`
Expected: Clean build, no warnings.

Reload extension in `chrome://extensions` and verify:
- Gear icon appears in TopBar (replacing Import/Export/Bookmarks)
- Clicking gear shows settings panel
- Theme toggle switches light/dark
- Accent swatches change colors
- Jam toggle works
- Import/Export/Clear data buttons work from settings
- Clicking a collection in sidebar closes settings

**Step 2: Bump version to 0.3.0**

Update `package.json` and `public/manifest.json` version to `"0.3.0"`.

**Step 3: Update CHANGELOG.md**

Add entry for 0.3.0 describing the settings panel feature.

**Step 4: Update CLAUDE.md**

Add a section documenting:
- `src/store/settings.js` — settings signals and theme/accent system
- `src/components/SettingsPanel.jsx` — settings UI
- Storage keys reference (updated with new keys)
- The `[data-theme]` attribute system

**Step 5: Final build**

Run: `npm run build`

**Step 6: Commit**

```bash
git add -A
git commit -m "release: bump version to 0.3.0 — settings panel"
```
