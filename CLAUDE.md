# Tab Hoarder

A Chrome extension for managing browser tabs locally - like Toby, but self-hosted and free.

## Features

- Save and organize tabs into collections
- Local-first storage (IndexedDB)
- Optional sync via GitHub Gists or self-hosted server
- Import from Toby export
- Quick search across saved tabs

## Tech Stack

- **Extension**: Chrome Manifest V3
- **UI**: Vanilla JS or lightweight framework (Preact)
- **Storage**: IndexedDB (local), GitHub Gists API (sync)
- **Build**: Vite

## Project Structure

```
src/
  popup/         # Extension popup UI
  background/    # Service worker
  content/       # Content scripts (if needed)
  lib/           # Shared utilities
    storage.js   # IndexedDB wrapper
    sync.js      # GitHub Gists sync
public/
  manifest.json  # Chrome extension manifest
  icons/         # Extension icons
```

## Development

```bash
npm install
npm run dev     # Watch mode for development
npm run build   # Production build
```

Load unpacked extension from `dist/` folder in Chrome.

## Sync Options

1. **GitHub Gists** (recommended): Uses a private gist as storage, free and reliable
2. **Self-hosted**: Simple JSON API endpoint for syncing collections
