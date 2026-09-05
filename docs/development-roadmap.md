# Development Roadmap

## Current Implementation

Version 0.1.0 is implemented as a local web app with tracking, CSV/TSV/XLSX and paste imports, personal materials, resume workspaces, weekly reviews, overview, and backup/restore. See [MVP Implementation Notes](mvp-implementation.md) for shipped scope and limits. The phases and estimates below are the original planning baseline, not a claim that later polish or integrations are complete.

## 1. Purpose

This roadmap translates the product requirements into practical implementation phases.

The roadmap assumes OfferFlow remains a local web app with no login, no cloud sync, no automatic crawling, and no automatic job applications.

## 2. Phase 0: Product Definition

Status: In progress

Goals:

- Define product scope
- Define MVP boundaries
- Define core modules
- Define data model
- Define information architecture
- Keep all repository-facing documentation in English

Exit criteria:

- Product requirements are clear
- Information architecture is drafted
- Data model is drafted
- MVP scope is small enough to build

## 3. Phase 1: Clickable Prototype

Estimated time: 3 to 5 days

Goals:

- Build the main layout
- Create navigation between core screens
- Use fictional demo data
- Prototype Application Tracker
- Prototype Import Jobs flow
- Prototype Materials and Resume Workspace structure
- Prototype Weekly Review layout

Exit criteria:

- The user can click through the main product flow
- The tracker, import preview, and supporting modules feel coherent
- No real user data is required

## 4. Phase 2: Local Tracker v0.1

Estimated time: 1 to 2 weeks

Goals:

- Implement local data persistence
- Support manual job creation
- Support job editing
- Support status and priority changes
- Support filtering and sorting
- Support archiving

Exit criteria:

- The user can maintain a real application tracker locally
- The tracker can replace a basic spreadsheet for daily use

## 5. Phase 3: Import Flow v0.2

Estimated time: 2 to 3 weeks

Goals:

- Implement CSV import
- Implement Excel import
- Implement paste import
- Add import preview
- Add field mapping
- Add missing field warnings
- Add duplicate warnings
- Add simple screening rules

Exit criteria:

- The user can import jobs from external tables without retyping each row
- Imported jobs can be reviewed before being added to the tracker
- Confirmed jobs default to `To Apply`

## 6. Phase 4: Personal MVP v0.3

Estimated time: 3 to 4 weeks

Goals:

- Implement Personal Profile and Story Library
- Implement lightweight Resume Workspace
- Link materials to resume workspaces
- Link resume workspaces to jobs
- Implement Weekly Review
- Add basic tracker statistics

Exit criteria:

- The user can manage applications, import jobs, store materials, prepare resumes, and review progress in one local app

## 7. Phase 5: Polished Personal Version

Estimated time: 6 to 8 weeks

Goals:

- Improve visual design
- Improve table interactions
- Improve search and filtering
- Improve import tolerance
- Add export and backup
- Add empty states and demo data reset
- Improve keyboard and daily-use ergonomics

Exit criteria:

- OfferFlow is comfortable enough for daily personal use during an active job search

## 8. Deferred Ideas

These ideas are intentionally deferred:

- Feishu API sync
- AI resume assistance
- Advanced analytics
- Multi-device sync
- Cloud backup
- Public sharing
- Multi-user collaboration
- Automatic job applications

Deferred ideas should be reconsidered only after the local MVP is useful.
