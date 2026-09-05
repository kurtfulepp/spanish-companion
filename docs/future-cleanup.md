# Future cleanup and release tasks

Recorded 2026-09-05 after retiring the public photo-vocabulary demo.

## Demo retirement completed

- Removed kitchen-demo links from Vocabulary and the photo uploader.
- Removed the public simulated-analysis screen. Old `?demo=kitchen` URLs now show the ordinary uploader and cannot generate fixture lists.
- The real review component requires API results; it has no sample-data fallback or FPO banner.
- Preserved the synthetic kitchen words/image under `tests/fixtures`, outside public assets and application imports.
- Existing demo/legacy lists remain labeled FPO in tiles, dialogs, and practice. No saved list was deleted or relabeled as real data.

## Future cleanup

- [ ] Review remaining saved demo lists with the user and delete only the lists they explicitly choose. Preserve FPO labels until those records are removed.
- [ ] After legacy browser-list migration is no longer needed, retire its old storage key and helpers. Confirm existing users have migrated before removing compatibility code.
- [ ] Rename remaining `demo-vocabulary-lists` modules and `SavedDemoList` types to account-list terminology without breaking legacy imports or provenance handling.
- [ ] Consolidate historical photo-vocabulary planning checkpoints and prune unused shared demo-only styles after checking all consumers.

## Release validation still pending

- [ ] Test actual iOS/Android/macOS/Windows camera permissions, uploads, and device-specific fallback behavior.
- [ ] Verify saved lists and practice progress on a physical second device; fresh-tab account retrieval has passed.
- [ ] Finish mobile/zoom, screen-reader, and browser network-failure testing.
- [ ] Verify hosted secrets and request-body/session-replay privacy settings, then publish within the user's approved scope.
- [ ] Before publishing, follow AGENTS.md: remind the user to upgrade Supabase to Pro or above and verify Authentication → Sessions → Time-box user sessions is 168 hours. Keep access-token expiry at 3600 seconds. No purchase is authorized.

This is a project backlog note, not a scheduled reminder or a separate task.
