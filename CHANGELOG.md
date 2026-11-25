## [1.5.0](https://github.com/ClementBobin/bob1-admin/compare/v1.4.0...v1.5.0) (2026-11-25)

### Features

* notifcation familly ([b965a38](https://github.com/ClementBobin/bob1-admin/commit/b965a388353856d55df1fa42684aadf953bfc8ea))

## [1.4.0](https://github.com/ClementBobin/bob1-admin/compare/v1.3.0...v1.4.0) (2026-11-25)

### Features

* **account-link:** password rules checklist (12+ chars, ([60958e6](https://github.com/ClementBobin/bob1-admin/commit/60958e63f7734ca8468bb5675a5a4fcd641416cc))

## [1.3.0](https://github.com/ClementBobin/bob1-admin/compare/v1.2.0...v1.3.0) (2026-11-25)

### Features

* RGPD data export and account deletion links (admin ([ed68bc8](https://github.com/ClementBobin/bob1-admin/commit/ed68bc849ee8c422d341d1f989c6f2bade611fea))

## [1.2.0](https://github.com/ClementBobin/bob1-admin/compare/v1.1.1...v1.2.0) (2026-11-24)

### Features

* added pswd and email reset ([3260eac](https://github.com/ClementBobin/bob1-admin/commit/3260eac1a2fca145f0eb1bc6c954957d6c499feb))

## [1.1.1](https://github.com/ClementBobin/bob1-admin/compare/v1.1.0...v1.1.1) (2026-11-23)

### Bug Fixes

* public not build ([908eaed](https://github.com/ClementBobin/bob1-admin/commit/908eaed181943b9f9c7eeda79338b72410db3cd4))

## [1.1.0](https://github.com/ClementBobin/bob1-admin/compare/v1.0.0...v1.1.0) (2026-11-23)

### Features

* added icon ([e5b189b](https://github.com/ClementBobin/bob1-admin/commit/e5b189bc07d96743c3df713cbefa0ce1c7d37c68))

## 1.0.0 (2026-11-23)

### Features

* added possibility to send notif to all staff member ([c2f8c40](https://github.com/ClementBobin/bob1-admin/commit/c2f8c40916efb1d06e612259b64ad64132a43982))
* **admin:** mark matches played, shared combobox in rankings, 3-state people status ([7b4edf1](https://github.com/ClementBobin/bob1-admin/commit/7b4edf114db532869898ba8e0462cb8289c47b7f))
* collapsible sidebar groups with auto-open and active highlight ([13e8134](https://github.com/ClementBobin/bob1-admin/commit/13e81347d1c01a0f9e6b32e3cc4b104691a88057))
* follow the new API model (match team ids, no children/sortOrder, user division) ([186077e](https://github.com/ClementBobin/bob1-admin/commit/186077e57740769e2975e614f2b6019de6d86d76))
* **FormSheet:** add option to hide cancel button in FormSheetFooter ([248c0cb](https://github.com/ClementBobin/bob1-admin/commit/248c0cbc120b290f0dbf22d1073099c361e13fdc))
* image docker ([894d2e3](https://github.com/ClementBobin/bob1-admin/commit/894d2e334c7502925c2f005f61e80cd85940fbc2))
* implement authentication flow with login page and auth provider ([3d44c29](https://github.com/ClementBobin/bob1-admin/commit/3d44c29fe973bd7ac088dbcba15a043bbe0c1ff4))
* make OptionSelect a searchable combobox (type to filter) ([1e20c16](https://github.com/ClementBobin/bob1-admin/commit/1e20c16197138412d220f9dd11137c2aa0ebf74f))
* **matches:** cancel a scheduled match from the edit sheet (with confirmation) ([2dc08e6](https://github.com/ClementBobin/bob1-admin/commit/2dc08e6285b018b684b4e6488ae4378520db7a0a))
* notifcation dedup ([0e3f7d1](https://github.com/ClementBobin/bob1-admin/commit/0e3f7d168854dc0b2b6e44340fb89df183e4907a))
* notification récurrence ([14c04d2](https://github.com/ClementBobin/bob1-admin/commit/14c04d2b253b3ff61cf522314daca94af4e693ab))
* **notifications:** edit reuses the creation form, delete uses AlertDialog ([ff4f881](https://github.com/ClementBobin/bob1-admin/commit/ff4f881352fa2f0527157d2b207c51f50ebbfb65))
* **points-history:** manual rows are flagged and can be edited / revoked; no penalty category ([fa24fbe](https://github.com/ClementBobin/bob1-admin/commit/fa24fbe76b07ac1b1c468e2886c367f76e3f5ff3))
* remove division from matches; broadcast to a team by id ([da642bb](https://github.com/ClementBobin/bob1-admin/commit/da642bb69eae616eb1c5d872d96669c4f5ad986d))
* searchable grouped recipients select for notifications ([40a82f9](https://github.com/ClementBobin/bob1-admin/commit/40a82f944069a8881eced342fa4348d34f360f12))
* use the API QUERY method with server-side search, filters and pagination on every table and the dashboard ([57d9323](https://github.com/ClementBobin/bob1-admin/commit/57d9323f7dfed8a82439e7e7b8da07a844099843))

### Bug Fixes

* cicd trigger ([dca8d2b](https://github.com/ClementBobin/bob1-admin/commit/dca8d2bfb519229ba70297a5f7c3520a484c0446))
* ensure tour starts only once by updating autoStartedRef in setTimeout ([18dc378](https://github.com/ClementBobin/bob1-admin/commit/18dc37812a5e74e8eecd16f2523db09a620dae9d))
* **history-view:** format date in history view ([783cbdf](https://github.com/ClementBobin/bob1-admin/commit/783cbdf6c75678ad0c363ba7dc9c0a73d2683ac6))
* match status buttons never showed (label mismatch); restore person switches ([6dc3b61](https://github.com/ClementBobin/bob1-admin/commit/6dc3b611af3dfbaf91d7d10a98b1a1b72f4c16b1))
* **matches:** read, resize and create match slots (Postes nécessaires) ([b0d30c1](https://github.com/ClementBobin/bob1-admin/commit/b0d30c1ce8172b8b099ae08dec49b39b40f7130d))
* **matches:** remove unused carpool field from MatchRow and MatchesView ([82b4c56](https://github.com/ClementBobin/bob1-admin/commit/82b4c5605994f50eced0f86c6234bf565c318fa7))
* **matches:** state buttons wrap inside the sheet footer ([03c28b3](https://github.com/ClementBobin/bob1-admin/commit/03c28b3251584e340a6585e980b0147d9595c096))
* **notification-editor:** update target state initialization and remove unused imports ([02f1874](https://github.com/ClementBobin/bob1-admin/commit/02f1874928da5b9ef5189c4b01be5909435b1545))
* **people-view:** remove unused lastLogin field from Person type and PeopleView ([f394d80](https://github.com/ClementBobin/bob1-admin/commit/f394d802f727757fdbc39c5296c1f30c31ecbea0))
* **person-form:** update status options to include 'Désactivé' ([9d70932](https://github.com/ClementBobin/bob1-admin/commit/9d709326ec569167b60b6d3252c0ee93a1722d4c))
* **points-history:** prefill positive points when editing ([7d13086](https://github.com/ClementBobin/bob1-admin/commit/7d13086aa4be8443e058218302ddf7a370ee9a16))
* **rankings:** use the shared combobox for the view-mode and category filters ([72a8d4f](https://github.com/ClementBobin/bob1-admin/commit/72a8d4f12ab77727f040cf20fcb46ed2b33252a2))
* trigger ([3e60d9a](https://github.com/ClementBobin/bob1-admin/commit/3e60d9adbd834bd0f99c996c2bfed790f0d81fa3))
* **utils:** make initials function accept optional name parameter ([6f1da9e](https://github.com/ClementBobin/bob1-admin/commit/6f1da9ead14196340935bcfc40826480c1f74eac))
* **venues:** remove unused matches field from VenueRow and VenuesView ([0166b31](https://github.com/ClementBobin/bob1-admin/commit/0166b31cadc4733b163c8d66f02d7a33d2dc689b))
