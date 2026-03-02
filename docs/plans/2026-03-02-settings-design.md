# Settings Panel Design

## Overview

Add a settings panel to Tab Hoarder, consolidating scattered controls (import, export, clear data) and adding new preferences (theme, accent colors, save behavior, jam toggle, backup controls).

## UI Access

- Gear icon replaces the Export button in TopBar
- Clicking opens a full panel replacing MainContent (same area as tab grid)
- Clicking any collection in sidebar closes settings and shows that collection
- `settingsOpen` signal controls panel visibility

### TopBar changes

Before: `[Search] [Save all tabs] [Bookmarks] [Import] [Export]`
After: `[Search] [Save all tabs] [Settings]`

### Sidebar changes

"Clear all data" button removed from sidebar footer (moved to Settings > Data).

## Settings Sections

### 1. Appearance

**Theme toggle:** Two buttons — Light / Dark. Active one highlighted with accent color.
- Storage: `localStorage` key `tab-hoarder-theme`
- Applied via `data-theme="light|dark"` attribute on `<html>`
- CSS variables switch based on `[data-theme]` attribute (replaces `prefers-color-scheme` media query)

**Accent color palette:** Row of 6 color swatches (small circles). Each has light and dark variants.

| Name | Light | Dark |
|------|-------|------|
| Terracotta (default) | #c45d3e | #e8854a |
| Ocean | #2d7d9a | #4db8d6 |
| Forest | #4a8c5c | #6ab87a |
| Plum | #7b5ea7 | #a07ed4 |
| Slate | #5a6a7a | #8a9aaa |
| Amber | #b8860b | #daa520 |

- Storage: `localStorage` key `tab-hoarder-accent`
- Applied via `document.documentElement.style.setProperty()` on `--accent`, `--accent-hover`, `--accent-subtle`
- Default terracotta values stay in `variables.css` as fallback

### 2. Save Behavior

**Toolbar icon click:** Select between:
- Saved Tabs (default) — creates collection if missing
- Most recent collection

**Alt+S shortcut:** Select between:
- Most recent collection (default)
- Saved Tabs

- Storage: `chrome.storage.local` keys `tab-hoarder-toolbar-target`, `tab-hoarder-shortcut-target`
- Values: `"saved-tabs"` or `"most-recent"`
- `background.js` reads these on each save action

### 3. Jam Widget

On/off toggle. Default: on.
- Storage: `localStorage` key `tab-hoarder-jam-enabled`
- When off: `startJamPolling()` not called, `JamBanner` doesn't render
- Toggling off mid-session calls `stopJamPolling()` immediately

### 4. Backups

**Daily file backup:** On/off toggle. Default: on.
- Storage: `chrome.storage.local` key `tab-hoarder-daily-backup`
- When off: service worker skips download on alarm fire (alarm keeps running)

**Backup frequency:** Select dropdown — Every day (default), Every 12 hours, Every 3 days, Weekly.
- Storage: `chrome.storage.local` key `tab-hoarder-backup-interval`
- `background.js` reads this when creating/updating alarm period

Backup location fixed at `Downloads/TabHoarder/` — no setting for this.

### 5. Data

Consolidated from TopBar and Sidebar:
- **Import from JSON** — opens existing `ImportModal`
- **Import bookmarks** — opens existing `BookmarkImportModal`
- **Export all collections** — calls `exportData()`
- **Export current collection** — calls `exportData(activeCollectionId)`, hidden when no collection active
- **Clear all data** — opens existing `ConfirmDialog` with danger styling

## Storage Summary

| Setting | Storage | Reason |
|---------|---------|--------|
| Theme | localStorage | Sync load, avoid flash |
| Accent color | localStorage | Sync load |
| Jam toggle | localStorage | New tab page only |
| Sort preferences | localStorage | Already there, unchanged |
| Toolbar save target | chrome.storage.local | background.js needs it |
| Alt+S save target | chrome.storage.local | background.js needs it |
| Daily backup toggle | chrome.storage.local | background.js needs it |
| Backup frequency | chrome.storage.local | background.js needs it |

## File Changes

### New files
- `src/components/SettingsPanel.jsx` — settings UI
- `src/styles/settings.css` — settings-specific styles
- `src/store/settings.js` — signals + load/save helpers

### Modified files
- `src/app.jsx` — `settingsOpen` signal, conditionally render SettingsPanel vs MainContent
- `src/components/TopBar.jsx` — replace Bookmarks/Import/Export with gear icon
- `src/components/Sidebar.jsx` — remove "Clear all data" button
- `src/components/MainContent.jsx` — read jam toggle before rendering JamBanner
- `src/store/jam.js` — respect jam toggle
- `src/styles/variables.css` — `[data-theme]` selectors replace `prefers-color-scheme`
- `src/index.jsx` — apply theme/accent from localStorage before render
- `public/background.js` — read save target and backup settings from chrome.storage.local

## Constraints

- No new Chrome permissions required
- No new npm dependencies
- Bundle size impact: minimal (one new component + CSS)
