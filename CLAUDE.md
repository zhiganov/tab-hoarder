# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tab Hoarder** — Chrome extension that replaces the new tab page with a collection-based tab manager. Open-source Toby alternative. Local-first, no accounts.

## Commands

```bash
npm run build   # Production build → dist/
npm run dev     # Vite dev server (limited use — must load dist/ as extension to test)
```

After building, reload the extension at `chrome://extensions` (Developer mode, Load unpacked → `dist/`).

## Architecture

### Two separate JS contexts

The app runs in two isolated contexts that **cannot share imports**:

1. **New tab page** (`src/` → built by Vite) — Preact app with `idb` wrapper for IndexedDB access
2. **Service worker** (`public/background.js` → copied as-is to `dist/`) — Static file, uses raw IndexedDB API, no build dependencies

Both contexts read/write the same IndexedDB database (`tab-hoarder`, version 1). The DB schema is duplicated: once in `src/store/db.js` (via `idb`) and once in `public/background.js` (raw `onupgradeneeded`). **Changes to the schema must be updated in both files.**

The new tab page communicates with the service worker via `chrome.runtime.sendMessage` for tab queries (`GET_CURRENT_TAB`, `GET_ALL_TABS`).

### State management

All UI state uses `@preact/signals` — no React-style prop drilling:
- `src/store/collections.js` — `collections` signal (array), `activeCollectionId` signal, `activeCollection` computed, `touchCollection(id)` updates `updatedAt`
- `src/store/tabs.js` — `allTabs` signal (array), `activeTabs` computed (filtered by active collection)
- `src/store/search.js` — `searchQuery` signal, `searchResults` computed (grouped by collection)
- `src/store/sort.js` — `collectionSort` (manual/name/updated) and `tabSort` (manual/name/created) signals, persisted to localStorage

- `src/store/backup.js` — `syncToStorage()` mirrors signals to chrome.storage.local, `restoreFromStorage()` restores IndexedDB from backup
- `src/store/jam.js` — `jamRooms` signal (array), `startJamPolling()`/`stopJamPolling()` — polls navidrome-jam API every 2 minutes

Each store module exports async CRUD functions that update both IndexedDB and the signal in one call.

### Utilities (`src/lib/`)

- `id.js` — `generateId()` via `crypto.randomUUID()`
- `favicon.js` — `getFaviconUrl(url)` (Google Favicon API), `getDomain(url)` (hostname without `www.`)
- `export.js` — `exportData(collectionId?)` — downloads JSON, optionally filtered to one collection
- `toby-import.js` — `parseTobyExport(data)` — normalizes both Toby and Tab Hoarder JSON formats, preserves `isArchive` and `color` metadata

### Save-and-close behavior

Two separate save targets via `background.js`:

- **Toolbar icon click** (`chrome.action.onClicked`) — saves to the "Saved Tabs" collection (creates it if missing)
- **Alt+S shortcut** (`chrome.commands.onCommand: save-to-recent`) — saves to the most recently updated collection (by `updatedAt`)

Both use the shared `saveAndCloseTab()` helper which writes to IndexedDB, mirrors to chrome.storage.local, shows a badge confirmation, closes the tab, and sends a `DATA_CHANGED` message to refresh open new tab pages.

Note: Alt+S is a named command (not `_execute_action`), so users may need to set it at `chrome://extensions/shortcuts` after install.

### Data persistence

**Two-layer backup system:**

1. **chrome.storage.local** (`src/store/backup.js`) — Automatic mirror of all collections and tabs under key `tab-hoarder-backup`. Debounced sync (2s) on any signal change in the app context. Service worker also syncs after each toolbar save. On startup, if IndexedDB is empty, restores from this backup transparently. Survives browser data clearing (extension-managed storage).
2. **Daily file backup** (`background.js`) — The service worker uses `chrome.alarms` to download a JSON backup to `Downloads/TabHoarder/tab-hoarder-backup-{browser}.json` (detects Brave via `navigator.brave`, defaults to `chrome`). First backup runs on install. Both browsers can back up to the same directory with distinct filenames.

**Clear all data** — `clearAllData()` in `src/store/db.js` wipes both IndexedDB stores and the chrome.storage.local backup. Exposed via "Clear all data" button in sidebar footer with a danger confirmation dialog.

### CSS

Custom CSS with variables in `src/styles/variables.css`. Dark mode via `@media (prefers-color-scheme: dark)` overriding CSS custom properties. No CSS framework.

Design palette: cream/parchment + terracotta (light), warm grays + amber (dark). Fonts: Libre Baskerville (display) + Inter (body) via Google Fonts.

## Data Model (IndexedDB)

- **collections**: `id` (UUID), `name`, `order`, `color`, `isArchive`, `createdAt`, `updatedAt` — indexed by `order`
- **tabs**: `id` (UUID), `collectionId`, `title`, `url`, `favicon`, `order`, `createdAt` — indexed by `collectionId` and compound `[collectionId, order]`

`touchCollection(id)` must be called on any operation that modifies a collection's contents (add, remove, move, archive tabs). This keeps `updatedAt` accurate for the "sort by recently updated" feature and the Alt+S save target.

### Drag and drop

Single hook `src/hooks/useDragAndDrop.js` manages two drag types via signals (`dragType`, `dragId`, `dragData`):
- **Tab drag** — reorder within collection or move cross-collection
- **Collection drag** — reorder in sidebar or drop tabs onto collections

Returns two objects (`tabDrag`, `collectionDrag`) with `onDragStart/onDragOver/onDragLeave/onDrop/onDragEnd` handlers.

### Component patterns

Components read signals directly (not via props). Store modules are imported and `.value` is accessed inline. No prop drilling, no context providers.

App structure: `app.jsx` → `Sidebar` (collection list) + `TopBar` + `MainContent` (tab grid). `MainContent` renders `JamBanner` at the top (visible when navidrome-jam rooms are active). Modals (`ImportModal`, `BookmarkImportModal`, `ConfirmDialog`) are rendered conditionally at the top level of their parent. Dropdown menus (move menu in `TabCard`, export menu in `TopBar`) use a ref + `mousedown` listener for outside-click dismissal.

### Import/export

- **Toby import**: `{ lists: [{ title, cards: [{ title, url }] }] }`
- **Tab Hoarder format**: `{ version, exportedAt, collections: [...], tabs: [...] }`
- **Chrome bookmarks import**: `BookmarkImportModal` reads `chrome.bookmarks.getTree()`, flattens folders with URLs, user picks folders via checkboxes, each becomes a collection. Duplicate URLs (already in any collection) are skipped.
- **Export**: supports exporting all collections or a single active collection via `exportData(collectionId?)`.
- **Deduplication**: Import matches collections by name — reuses existing ones instead of creating duplicates. Tabs are deduped by URL within each collection. Archive tabs route to the existing archive via `getOrCreateArchive()`.

Import/export logic lives in `src/lib/toby-import.js`, `src/lib/export.js`, and `src/components/BookmarkImportModal.jsx`.

## Packaging

```bash
./scripts/package-dmg.sh            # Build + create .dmg (macOS only, uses hdiutil)
./scripts/package-dmg.sh --skip-build  # Skip npm ci/build, use existing dist/
```

GitHub Actions workflow (`package-dmg.yml`) runs on `macos-latest` — triggers on manual dispatch or `v*` tag push. Uploads DMG as artifact; on tag push, attaches to GitHub Release.

## Navidrome Jam Integration

`JamBanner` component (`src/components/JamBanner.jsx`) shows active listening rooms from [jam.zhgnv.com](https://jam.zhgnv.com). Polls `GET https://navidrome-jam-production.up.railway.app/api/rooms` every 2 minutes. Displays host name, current track, and a "Join" link. Hidden when no rooms are active. Styled with terracotta accents and animated equalizer bars (`src/styles/jam.css`).

No community filtering — shows all public rooms. Private room filtering will be handled server-side (see navidrome-jam tasks #50–52).

## Icon

Lucide "library" icon (ISC license) on terracotta circle. Source SVG at `public/icons/icon.svg`, PNGs generated via `sharp-cli` at 16/48/128px.

## Key Constraints

- `base: ''` in `vite.config.js` — Chrome extensions require relative asset paths
- `background.js` is static (not built) — keep it dependency-free, raw IndexedDB only
- Bundle size matters — new tab opens on every tab creation. Current: ~53kB JS, ~18kB CSS
- Permissions (`tabs`, `alarms`, `downloads`, `bookmarks`, `storage`) — adding new ones requires user to re-approve the extension
- Input handlers: use `onBlur` as the single submit path; `onKeyDown` Enter should just `e.target.blur()` to avoid double-fire
