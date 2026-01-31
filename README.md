# Tab Hoarder

Chrome extension for managing browser tabs locally. Like [Toby](https://www.gettoby.com/), but open-source and self-hosted.

## Features

- Save and organize tabs into named collections
- Local-first storage (IndexedDB) — no account, no cloud
- Replaces Chrome new tab page with your tab manager
- Search across all saved tabs (press `/`)
- Drag and drop tabs between collections, reorder collections
- Import from Toby export (JSON)
- Export/import your data as JSON
- Light and dark mode (follows system preference)

## Install

```bash
npm install
npm run build
```

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `dist/` folder
4. Open a new tab — Tab Hoarder is your new tab page

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

## License

MIT
