# OfferFlow

## A Local-First Job Search Management System

Status: In Development

OfferFlow is a local-first personal job search web app for importing job leads, screening opportunities, tracking applications, organizing career materials, managing resume workspaces, and reviewing weekly progress.

Current phase: Usable Local MVP (v0.1.0)

The first version is intentionally scoped as a local web app with no login, no cloud sync, no multi-user collaboration, no automatic crawling, and no automatic job applications.

## Run Locally

Requirements: Node.js 22.12+ or 24+, npm, and a modern browser.

```sh
npm ci
npm run dev
```

Open [OfferFlow](http://127.0.0.1:5173). Keep the terminal running while using the app. Stop the server with Ctrl+C.

The server binds only to `127.0.0.1` and uses a fixed port. If port 5173 is occupied, stop the conflicting service or explicitly select a different port. Browser storage belongs to the exact origin, so changing the hostname, port, or browser creates a separate workspace. Export a backup before moving between origins.

## Available Workflows

- **Applications:** Add, edit, search, filter, sort, archive, and delete opportunities. Update status and priority directly in the table.
- **Import jobs:** Import CSV, TSV, or Excel `.xlsx`; paste copied tables or simple labeled text. Review mappings, dates, screening results, and possible duplicates before confirmation. Confirmed jobs start at `To Apply`.
- **Personal materials:** Organize experiences, achievements, reusable resume phrasing, and interview stories with types and tags.
- **Resume workspaces:** Keep a target role, job description, linked opportunity, reusable materials, resume draft, and revision notes together. Duplicate drafts into new versions and export plain-text resumes.
- **Weekly review:** Capture priorities, reflections, and editable counts based on recorded application status transitions.
- **Overview:** Create and edit opportunities directly in spreadsheet-style cells. A blank top row is always available; save or cancel each row without opening a dialog. Review the current pipeline below the table.
- **Settings & data:** Export a complete JSON backup, restore a validated backup, export jobs as CSV, and optionally load fictional demo data into an empty workspace.

## Imports

Required fields are company and role. English and common Chinese column names are recognized, and mappings can be adjusted manually. Download a CSV template from Import Jobs.

Paste table rows separated by tabs, or use simple labeled text:

```text
Company: Example Studio
Role: Product Analyst
Location: Shanghai
Link: https://example.com/careers

Company: Sample Works
Role: Research Associate
```

Use blank lines between labeled job blocks. Unrecognized text is retained in notes. This is a structured parser, not AI extraction from arbitrary prose.

Dates accept `YYYY-MM-DD`, `YYYY/MM/DD`, and equivalent year-first formats. Ambiguous dates and invalid links block the affected row until the source is corrected or the field is explicitly unmapped. Imports are limited to 10 MB, 10,000 data rows, and 100 columns. Save legacy `.xls` files as `.xlsx` or CSV first. Excel formulas are not evaluated; only cached results are read.

Screening is advisory and uses comma-separated keywords. Company type and eligibility are keyword checks against imported content, not independent verification. Duplicate warnings compare normalized job links or company-and-role pairs, including within one import batch. Selected duplicates require confirmation.

## Technology

- React and Vite for the local web interface
- IndexedDB through Dexie for browser-local persistence
- Zod for data and backup validation
- Papa Parse for CSV and TSV
- ExcelJS, loaded on demand, for `.xlsx`
- Lucide for icons
- Vitest and Playwright for verification

No runtime CDN, remote font, analytics, login, cloud storage, crawling, or AI service is required. The local server must be running; this version is not an installed offline PWA.

## Backup and Storage

Data is stored in this browser's IndexedDB, not in this repository. It is not encrypted by OfferFlow. Clearing site data, deleting the browser profile, or using private browsing can remove it. Request persistent storage in Settings where supported, and keep regular backups.

Backup JSON and exported CSV or resume files may contain private information. Store them outside Git. Restoring a backup replaces the workspace only after validation and confirmation. Deleting a job or material preserves resume drafts and removes the corresponding links.

## Verification

```sh
npm test
npm run test:e2e
npm run build
```

Browser tests use an isolated Chrome profile and a separate local server on port 5178. Google Chrome must be installed. Test data is fictional; test output is excluded from Git. Unit tests cover parsing, screening, duplicate detection, dates, history, linked-record cleanup, and backup validation. Browser tests cover editing, imports, reload persistence, resume preparation, reviews, backup restoration, and desktop/mobile layouts.

## First-Version Limits

- Resume editing is plain text; document references are stored as text rather than uploaded attachments. There is no Word/PDF layout editor.
- Weekly metrics reflect events recorded in OfferFlow, not externally verified application dates. Counts can be corrected manually.
- Import previews are temporary; confirmed batch metadata and jobs persist locally.
- Backup and restore are manual. There is no cross-device synchronization.

## Documentation

- [Product Requirements](docs/product-requirements.md)
- [Information Architecture](docs/information-architecture.md)
- [Data Model](docs/data-model.md)
- [Development Roadmap](docs/development-roadmap.md)
- [MVP Implementation Notes](docs/mvp-implementation.md)

## Privacy

OfferFlow stores sensitive job search information, including real applications, resumes, essays, interview notes, and personal reflections. Real user data must remain local and must not be committed to GitHub.

Only code, documentation, project structure, and fictional or anonymized demo data should be stored in this repository.
