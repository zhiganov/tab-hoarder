# Changelog

## 0.2.2

- Split save behavior: toolbar icon saves to "Saved Tabs", Alt+S saves to most recently updated collection
- Fix collection `updatedAt` not updating on tab delete, archive, and cross-collection move

## 0.2.1

- Add "Clear all data" button in sidebar — wipes IndexedDB, chrome.storage.local backup, and resets UI
- Replace logo with Lucide library icon (book spines on terracotta circle)

## 0.2.0

- Add chrome.storage.local as automatic backup — data survives browser data clearing, restores transparently on startup
- Add navidrome jam live room widget — shows active listening rooms above the tab grid with join link
- Fix import losing archive tabs — preserve `isArchive` flag when restoring from backup
- Deduplicate collections and tabs on import — match by name, skip duplicate URLs
- Add `storage` permission to manifest

## 0.1.5

- Add export dropdown — export all collections or just the active one
- Show full URL on tab card hover
- Sort move-to-collection menu by recently updated

## 0.1.4

- Add Chrome bookmarks import as collections
- Add sort controls for collections (manual, name, updated) and tabs (manual, name, date added)
- Add archive collection for soft-deleting tabs

## 0.1.3

- Add DMG packaging for macOS distribution (GitHub Actions workflow)

## 0.1.2

- Add daily automatic backup to Downloads folder
- Add inline collection title rename
- Add live refresh when service worker saves a tab
- Add browser-specific backup filenames (Chrome/Brave)

## 0.1.1

- Add toolbar icon save-and-close with Alt+S keyboard shortcut
- Add move-to-collection menu on tab cards

## 0.1.0

- Initial release — Preact + IndexedDB tab manager as Chrome new tab page
- Collection-based tab organization with drag-and-drop reorder
- Toby JSON import support
- Warm parchment/terracotta design with dark mode
