# Process Notes

## 2026-06-08 — Data-loss recovery + resilience fixes
- **Done:** Recovered ~320 tabs / 14 collections from Brave's `chrome.storage.local` LevelDB after the IndexedDB was wiped; shipped 4 fixes (PR #1: backup empty-guard, restore-before-save in SW, import preserves dates, automatic-backups rolling daily history + rename); bumped to 0.3.1; fixed DMG workflow (`contents: write`); released v0.3.1 with a working DMG.
- **Decisions:** Root cause = Brave "Forget me when I close this site" (Forget First-Party Storage) shredding the extension's IndexedDB on close — `chrome.storage.local` survives it. Recovery = de-frame the leveldb write-ahead log, extract the last non-empty `tab-hoarder-backup` snapshot. Re-tagged v0.3.1 at the workflow-fix commit (Actions reads the workflow from the tagged commit).
- **State:** `master` clean + pushed; v0.3.1 released with `Tab-Hoarder-v0.3.1.dmg`. Recovery artifacts at `Downloads/TabHoarder/_recovery_2026-06-08/`.
- **Next:** Bump CI actions to Node 24 before 2026-06-16 (GH issue filed). Optional: disable Brave auto-shred + re-import recovered file to restore original tab dates.
