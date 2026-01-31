# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tab Hoarder** — Chrome extension for managing browser tabs locally. Open-source Toby alternative. Replaces new tab page with a collection-based tab manager.

## Tech Stack

- **Preact** + `@preact/signals` (~6kB) — fast new tab loads
- **idb** (IndexedDB wrapper, ~1.2kB) — local storage
- **Vite** + `@preact/preset-vite` — build tool
- **Custom CSS** with variables — light/dark themes via `prefers-color-scheme`
- **Chrome Manifest V3** — newtab override + minimal service worker

## Project Structure

```
package.json
vite.config.js                  # Multi-input: newtab, base: '' for extension
public/
  manifest.json                 # MV3, newtab override, tabs permission
  background.js                 # Static service worker (GET_CURRENT_TAB, GET_ALL_TABS)
  icons/                        # 16/48/128 PNG
src/
  newtab.html                   # Entry point Chrome loads
  index.jsx                     # Mount Preact app
  app.jsx                       # Root: loads data, renders layout
  store/
    db.js                       # IndexedDB schema + singleton via idb
    collections.js              # Signals + CRUD for collections
    tabs.js                     # Signals + CRUD for tabs
    search.js                   # Search signal + computed results
  components/
    TopBar.jsx                  # Search, save/import/export buttons
    SearchBar.jsx               # Bound to search signal, / shortcut
    SearchResults.jsx           # Overlay with grouped results
    Sidebar.jsx                 # Collection list + add button
    CollectionItem.jsx          # Name, tab count, inline rename, drop target
    MainContent.jsx             # Collection header + tab grid
    TabCard.jsx                 # Favicon, title, domain, draggable
    EmptyState.jsx              # Friendly empty messages
    ImportModal.jsx             # Toby JSON import
    ConfirmDialog.jsx           # Reusable confirm/cancel
  hooks/
    useDragAndDrop.js           # HTML5 DnD with signal-based state
  lib/
    id.js                       # crypto.randomUUID()
    favicon.js                  # Google S2 favicon service
    toby-import.js              # Parse Toby JSON export
    export.js                   # Export as JSON download
  styles/
    variables.css               # Colors, fonts, spacing, dark mode
    global.css                  # Reset, typography, body
    sidebar.css
    main-content.css
    tab-card.css
    search.css
    modal.css
    animations.css              # Transitions, drag feedback
```

## Development

```bash
npm install
npm run dev     # Watch mode for development
npm run build   # Production build → dist/
```

Load `dist/` as unpacked extension at `chrome://extensions` (Developer mode on).

## Data Model (IndexedDB)

- **collections**: `id` (UUID), `name`, `order`, `color`, `createdAt`, `updatedAt` — indexed by `order`
- **tabs**: `id` (UUID), `collectionId`, `title`, `url`, `favicon`, `order`, `createdAt` — indexed by `collectionId` and compound `[collectionId, order]`

## Key Architecture Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Framework | Preact + Signals | ~6kB total. New tab loads on every tab open. |
| Storage | IndexedDB via `idb` | No size limit, supports indexes. chrome.storage caps at 10MB. |
| DnD | Native HTML5 API | Zero extra bundle. Desktop-only extension. |
| CSS | Custom + variables | Bespoke warm design, dark mode via `prefers-color-scheme`. |
| Service worker | Static in `public/` | ~15 lines, no deps, no build needed. |
| Base path | `base: ''` in Vite | Chrome extensions need relative paths. |

## Design Direction

"Personal Library" aesthetic — warm, curated, not corporate:
- Light: Cream/parchment (#faf6f0), terracotta accents (#c45d3e)
- Dark: Deep warm grays (#1a1814), amber accents (#e8854a)
- Typography: Libre Baskerville (serif display) + Inter (sans-serif body)
