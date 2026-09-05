# OfferFlow Product Requirements

## 1. Product Summary

OfferFlow is a local-first personal job search web app. It helps an individual job seeker import job leads from external tables, screen opportunities, track application progress, organize reusable career materials, manage resume versions, and review job search progress.

## 2. Product Boundary

OfferFlow is a personal local tool, not a hiring platform.

The first version follows these boundaries:

- Local web app
- No user registration
- No login
- No cloud sync
- No multi-user collaboration
- No automatic crawling
- No storage of external website credentials
- No automatic job applications
- No submission of application materials on behalf of the user

These boundaries keep the MVP realistic, protect sensitive job search data, and allow the product to become useful quickly.

## 3. Problem Statement

During an active job search, information is scattered across many places:

- Feishu Base tables or other job aggregation tables
- Company career pages
- Job boards
- CSV and Excel files
- Browser links
- Resume documents
- Interview notes
- Personal stories and career materials

This creates several problems:

1. The user cannot easily tell which jobs have already been reviewed.
2. The user cannot easily tell which jobs are worth applying to.
3. Application status is scattered and hard to maintain.
4. Deadlines can be missed.
5. Resume versions can become disconnected from the target job descriptions.
6. Personal stories and project materials are repeatedly recreated instead of reused.
7. Overall job search progress is hard to review objectively.

OfferFlow solves job search information management and action planning. It does not try to replace the user or automate the full job search.

## 4. Target User

The first target user is Jiaying Ni.

User characteristics:

- Actively searching for jobs in China and possibly overseas
- Uses external job aggregation tables to discover opportunities
- Needs to manage many job links, deadlines, and application statuses
- Prepares different resumes for different role categories
- Wants to reuse career stories, project examples, and interview materials
- Cares strongly about privacy and local ownership of real job search data

If the product proves useful, it may later serve similar users such as students, international graduates, career switchers, and job seekers managing many applications.

## 5. Core Product Hypothesis

If the user can quickly import external job leads into a local workspace and manage status, materials, and next actions in one place, the job search process will become clearer, more controlled, and easier to sustain.

The MVP should validate:

- Whether OfferFlow can replace a temporary spreadsheet for application tracking
- Whether CSV, Excel, and paste import reduce manual entry effort
- Whether the main tracker helps the user decide what to do next
- Whether the material library and resume workspace reduce repeated preparation work

## 6. MVP Main Flow

The MVP main flow is:

1. The user copies or exports jobs from Feishu, CSV, Excel, or another structured source.
2. The user imports or pastes those jobs into OfferFlow.
3. OfferFlow shows an import preview.
4. The user confirms or edits field mapping.
5. OfferFlow marks likely duplicate jobs.
6. The user filters and confirms which jobs to keep.
7. Confirmed jobs are added to the Application Tracker with status set to `To Apply`.
8. The user updates status, notes, materials, and next actions in the tracker.
9. The user uses the material library or resume workspace when preparing applications.
10. The user reviews weekly job search progress.

If this flow is smooth, the first version is useful.

## 7. MVP Priority

### 7.1 P0: Required

P0 features are required for the first usable version.

- Application Tracker
- Manual job creation
- Job field editing
- Application status management
- CSV import
- Excel import
- Paste import
- Import preview
- Field mapping
- Basic screening
- Duplicate warnings
- Local data persistence

### 7.2 P1: Important

P1 features make the product easier to use regularly.

- Saved screening preferences
- Saved import mapping templates
- Personal Profile and Story Library
- Lightweight Resume Workspace
- Weekly Review
- Basic statistics
- Data export and backup

### 7.3 P2: Later

P2 features are not part of the first MVP.

- Feishu API sync
- Smarter job description parsing
- AI resume assistance
- Interview preparation assistance
- Advanced analytics
- Trend charts
- Multi-device sync

## 8. Module 1: Application Tracker

The Application Tracker is the center of OfferFlow.

It should feel like a job-search-specific table: lighter than a full ATS, more private than a cloud spreadsheet, and more structured than scattered notes.

### 8.1 Field Order

Recommended field order:

1. Status
2. Priority
3. Company
4. Role
5. Role Category
6. Location
7. Open Date
8. Deadline
9. Source
10. Job Link
11. Next Action
12. Materials Status
13. Notes
14. Last Updated

This order puts action and priority before job details.

### 8.2 Status Options

Status uses fixed selectable labels:

- To Review
- To Apply
- Resume in Progress
- Applied
- Assessment
- Interviewing
- Waiting for Response
- Offer
- Rejected
- Abandoned

### 8.3 Priority Options

Priority uses fixed labels:

- High
- Medium
- Low
- Unsure

### 8.4 Materials Status

Materials Status tracks resume and application material readiness:

- Not Started
- Needs Tailored Resume
- Resume Ready
- Needs Additional Materials
- Final Version Submitted

### 8.5 Core Operations

The tracker should support:

- Add job
- Edit job
- Delete job
- Archive job
- Change status
- Change priority
- Change next action
- Open job link
- Filter by status
- Filter by priority
- Filter by role category
- Sort by deadline
- Sort by last updated

## 9. Module 2: Job Lead Import and Screening

Job Lead Import and Screening is the key feature that makes OfferFlow more useful than a plain spreadsheet.

The first version only supports user-provided data. It does not crawl external websites.

### 9.1 Supported Import Methods

MVP import methods:

- Upload CSV file
- Upload Excel file
- Paste rows copied from Feishu Base
- Paste rows copied from another table
- Paste simple job text

### 9.2 Import Preview

Imported data must go through preview before it is written to the main tracker.

The preview should show:

- Parsed job rows
- Field mapping result
- Missing field warnings
- Likely duplicate jobs
- Screening result
- Whether each row is selected for import

### 9.3 Field Mapping

OfferFlow should try to detect and map:

- Company
- Role
- Role Category
- Location
- Open Date
- Deadline
- Job Link
- Source
- Notes

If the automatic mapping is wrong, the user can manually adjust it.

### 9.4 Screening Rules

The first version uses simple rule-based screening.

Screening conditions may include:

- Include keywords
- Exclude keywords
- Target locations
- Role categories
- Company type
- Deadline still open
- Graduation year or eligibility notes

Screening results are advisory. OfferFlow should not remove jobs without user confirmation.

### 9.5 Duplicate Detection

OfferFlow should warn about likely duplicates.

Initial duplicate rules:

- Same job link
- Same company and same role
- Same company, role, and deadline

Duplicate detection does not need to be perfect, but it must be transparent and reviewable.

## 10. Module 3: Personal Profile and Story Library

The Personal Profile and Story Library is a lightweight private material library, not a full knowledge management system.

Its goal is to help the user build reusable material for resumes, essays, interviews, and self-introductions.

### 10.1 Content Types

The first version supports:

- Education background
- Internship experience
- Work experience
- Project experience
- Research experience
- Skills and tools
- Achievements and metrics
- Self-introduction
- STAR interview stories
- Behavioral interview examples
- Failure and reflection stories
- Career motivation

### 10.2 Material Fields

Each material entry may include:

- Title
- Type
- Tags
- Relevant role categories
- Body
- Quantified results
- Resume-ready phrasing
- Interview-ready phrasing
- Last updated

### 10.3 Core Operations

The library should support:

- Add material
- Edit material
- Delete material
- Search material
- Filter by tag
- Link material to a resume workspace

## 11. Module 4: Resume Workspace

The Resume Workspace is a lightweight manager for job-specific and role-specific resume preparation.

The first version is not a full online resume editor.

Its goal is to make it clear which job description, personal materials, and resume version belong together.

### 11.1 Workspace Fields

Each resume workspace may include:

- Workspace name
- Role category
- Target company
- Target role
- Job link
- Original job description
- Job description keywords
- Matched personal materials
- Resume draft or local resume file path
- Revision notes
- Final version marker

### 11.2 Core Operations

The first version should support:

- Create resume workspace
- Edit job description and analysis notes
- Link personal materials
- Record resume revision reasons
- Mark final version
- Link workspace to a job in the Application Tracker

## 12. Module 5: Weekly Review

Weekly Review supports lightweight progress reflection.

It should not become a complex project management system.

### 12.1 Weekly Review Fields

Each weekly review may include:

- Week start date
- Jobs discovered this week
- Jobs imported this week
- Jobs applied this week
- Interviews received this week
- Responses received this week
- Rejections received this week
- Offers received this week
- Most important active opportunities
- Main blockers
- Resume or strategy changes
- Next week priorities
- Energy or confidence notes
- Free-form reflection

### 12.2 Core Operations

The first version should support:

- Create weekly review
- Edit weekly review
- Read basic counts from the Application Tracker
- Manually record next-week priorities

## 13. Local Data and Privacy Requirements

OfferFlow handles sensitive job search data.

Sensitive data includes:

- Real company application records
- Resumes
- Essays
- Cover letters
- Interview notes
- Salary information
- Contact information
- Personal background
- Job search strategy and emotional notes

Product requirements:

- Real data is stored locally by default.
- Real data must not be committed to GitHub.
- The GitHub repository may contain only code, documentation, structure, and fictional demo data.
- Demo data must be fictional or anonymized.
- Data directories, uploaded files, and database files must be excluded by `.gitignore`.
- The user should not provide external website usernames or passwords to OfferFlow.

## 14. Explicit Non-Goals

The MVP explicitly excludes:

- User registration
- Login
- Cloud sync
- Multi-user collaboration
- Crawling paid websites
- Bypassing login or access control
- Feishu Base automatic sync
- Automatic job applications
- Automatic application form filling
- Automatic emails
- Complex AI agents
- Public hosting with real data

These ideas are not rejected forever. They are simply out of scope for the current phase.

## 15. MVP Acceptance Criteria

The MVP is complete when the following tasks work smoothly:

1. The user can manually add a job record.
2. The user can edit job status, priority, deadline, link, and next action.
3. The user can import jobs from CSV.
4. The user can import jobs from Excel.
5. The user can paste Feishu or table content and parse jobs from it.
6. The user can preview data before importing.
7. The user can adjust field mapping.
8. The system can warn about obvious duplicates.
9. The user can screen imported jobs and confirm which rows to add.
10. Newly added jobs default to `To Apply`.
11. The user can maintain personal material cards.
12. The user can create lightweight resume workspaces.
13. The user can create a weekly review.
14. Real user data remains local by default.

## 16. Estimated Timeline

Assuming no login, no cloud sync, and no automatic crawling:

### 16.1 Clickable Prototype

Estimated time: 3 to 5 days.

Goals:

- Build the main page structure
- Use fictional data to demonstrate the core flow
- Validate information architecture for tracker, import preview, material library, and resume workspace

### 16.2 Local v0.1

Estimated time: 1 to 2 weeks.

Goals:

- Application Tracker supports create, read, update, and delete
- Data persists locally
- Basic filtering and sorting work
- Manual job creation works

### 16.3 Import v0.2

Estimated time: 2 to 3 weeks.

Goals:

- CSV import works
- Excel import works
- Paste import works
- Import preview works
- Field mapping works
- Duplicate warnings work

### 16.4 Personal MVP v0.3

Estimated time: 3 to 4 weeks.

Goals:

- Application Tracker is stable
- Job import flow is smooth
- Personal Profile and Story Library is lightweight but usable
- Resume Workspace is lightweight but usable
- Weekly Review is lightweight but usable

### 16.5 Polished Personal Version

Estimated time: 6 to 8 weeks.

Goals:

- Improve interaction details
- Improve filtering and search
- Improve import tolerance
- Add backup and export
- Polish visual design and daily-use experience

## 17. Product Principles

OfferFlow should follow these principles in the first phase:

- Make the local workflow useful before expanding scope.
- Solve the real user workflow before adding intelligence.
- Reduce data entry effort before adding advanced analysis.
- Make the main tracker excellent before expanding surrounding modules.
- Protect privacy before considering sharing.
- Serve one real user well before generalizing.

## 18. Version Conclusion

OfferFlow v0 is not a job search automation platform.

It is a personal job search action table, job import helper, and career material library.

If it helps the user understand which jobs are worth applying to, which jobs need action, and which materials must be prepared, it is a valuable and realistic MVP.
