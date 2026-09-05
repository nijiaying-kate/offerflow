# MVP Implementation Notes

## Delivered Scope

Version 0.1.0 implements the five agreed personal workflows: application tracking, user-provided job imports, reusable career materials, resume workspaces, and weekly reviews. Overview and Settings support these workflows. The first screen is Applications.

The implementation chooses editable forms, table filters, keyword screening, manual import confirmation, local persistence, and full-workspace backups. It has no login, cloud sync, automatic crawling, automatic applications, or complex AI agents.

Initial content is empty. Fictional demo records can be loaded explicitly from Settings only when the workspace has no records. Real user data is never stored in the repository.

## Implementation Decisions

| Area          | Decision                                                                             |
| ------------- | ------------------------------------------------------------------------------------ |
| Application   | React, Vite, JavaScript                                                              |
| Storage       | Versioned IndexedDB workspace record with Dexie transactions                         |
| Validation    | Zod schemas before persistent writes and backup restore                              |
| Concurrency   | Transactions read current stored state; live queries refresh open tabs               |
| Imports       | Papa Parse for CSV/TSV; lazy-loaded ExcelJS for XLSX; labeled text parser            |
| Screening     | Advisory keyword, location, category, eligibility, company-type, and deadline checks |
| Duplicates    | Normalized URL or company and role, including within-batch checks                    |
| Resume output | Editable plain text with download and independent duplicated versions                |
| Backup        | Versioned JSON containing persistent entities and preferences                        |
| Server        | Loopback-only local server, fixed port by default                                    |

One document per personal workspace keeps multi-entity backup, restore, and relationship cleanup atomic. This suits an initial personal dataset. A large database should later use dedicated tables and paginated rendering.

## Differences from Planning Documents

- Manual and imported opportunities both default to `To Apply`, resolving the conflicting default in the original information architecture.
- Overview supports direct table-cell entry and editing with per-row save and cancel. Its blank entry row replaces the creation dialog. Edits stay in memory across internal navigation, and reloading warns about unsaved changes. Saved records immediately update Applications and the pipeline. Concurrent edits to an already-changed row are rejected until the latest version is reloaded by canceling the local edit.
- The tracker places status, priority, company/role, deadline, and next action first. Remaining fields are available through horizontal scrolling and the edit form.
- Excel support means `.xlsx`; legacy `.xls` must be converted first.
- Plain text import requires labeled fields rather than arbitrary natural-language extraction.
- One screening preference set and one reusable mapping are saved. Named template collections are deferred.
- Resume attachments are represented by an optional local filename/path reference. The app does not read the referenced file automatically.
- Import previews remain in memory. Confirmed batches retain source, method, count, and timestamp, but not entire raw files.
- Weekly counts are editable snapshots. Repeated transitions to the same category in one week count once per opportunity.
- Marking a resume final does not automatically change application status or claim an application was submitted.

## Data Additions

Each Job includes `events: [{ status, at }]` and `import_batch_id`. Status changes append an event; notes-only edits do not. Creation and event timestamps support weekly metrics without treating the current status as a historical event date.

The workspace includes `version`, `jobs`, `materials`, `resumes`, `reviews`, `imports`, `preferences`, and `mapping`. Tags and keyword fields use simple strings. Resume-to-material relationships use ID arrays. Review week dates are unique.

Validation rejects unsupported backups, invalid dates, unsupported URL protocols, duplicate IDs, duplicate review weeks, and dangling resume links. CSV export escapes spreadsheet formulas. Application content is never executed as HTML.

## Verification and Follow-Up

The automated suite covers domain behavior and real-browser workflows with fictional data. Browser contexts are isolated from the user's normal profile. Screenshots, traces, downloads, and build output are not committed.

The latest implementation validation passed 16 domain tests and five browser workflows, with a successful production build. The Overview workflow verifies required fields, direct row creation and editing, cancellation, draft retention during internal navigation, reload persistence, and mobile entry without a dialog. Existing browser workflows cover imports, materials, resume preparation, weekly reviews, backup/restore, archiving, deletion, and responsive layouts.

The build reports a large on-demand ExcelJS chunk and upstream Zod annotation warnings; these do not prevent a successful build. Excel parsing is loaded only when needed.

The next iteration should follow actual usage: real export column variations, preferred tracker columns, resume editing needs, and backup ergonomics. No new integration is needed before validating these workflows.
