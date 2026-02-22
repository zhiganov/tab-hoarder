# Tab Hoarder

Chrome/Brave extension for managing browser tabs locally. Like [Toby](https://www.gettoby.com/), but open-source and self-hosted.

## Features

- Save and organize tabs into named collections
- Local-first storage (IndexedDB) — no account, no cloud
- Replaces new tab page with your tab manager
- **Toolbar icon** or **Alt+S**: save current tab and close it
- **Save all tabs**: creates a date-named collection, saves all window tabs, and closes them
- Search across all saved tabs (press `/`)
- Drag and drop tabs between collections, reorder collections
- Move tabs between collections via dropdown menu (sorted by recently updated)
- Archive tabs instead of deleting them
- Sort collections and tabs (manual, name, updated/created)
- Inline rename collections from sidebar or main title
- Import from Toby export (JSON)
- Import Chrome bookmark folders as collections (with duplicate URL detection)
- Export all collections or just the current one as JSON
- Daily automatic backup to `Downloads/TabHoarder/` (browser-specific filenames)
- Automatic chrome.storage.local backup — survives browser data clearing, restores transparently
- Smart import deduplication — matches collections by name, skips duplicate URLs
- Navidrome Jam live room widget — see friends listening to music, join with one click
- Light and dark mode (follows system preference)

## Install

```bash
npm install
npm run build
```

1. Open `chrome://extensions` (or `brave://extensions`)
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `dist/` folder
4. Open a new tab — Tab Hoarder is your new tab page

Set the keyboard shortcut at `chrome://extensions/shortcuts` if `Alt+S` wasn't auto-assigned.

## Development

```bash
npm run dev     # Vite dev server with HMR
npm run build   # Production build → dist/
```

After building, reload the extension in `chrome://extensions`.

## Stack

- **Preact** + Signals (~6kB) — UI framework
- **idb** — IndexedDB wrapper
- **Vite** — build tool
- **Custom CSS** — warm parchment/terracotta design, dark mode

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

MIT
