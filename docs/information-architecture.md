# OfferFlow Information Architecture

## 1. Purpose

This document defines the first product structure for OfferFlow as a local-first personal job search web app.

The information architecture is optimized for one primary behavior: turning external job leads into a private, actionable application tracker.

The MVP should feel like a focused personal workspace, not a recruiting platform, CRM, or complex project management system.

## 2. Product Shape

OfferFlow has three primary product areas:

1. Job Pipeline
2. Career Materials
3. Progress Review

The Job Pipeline is the center of the product. Career Materials and Progress Review support the pipeline but should not compete with it in the first version.

## 3. Top-Level Navigation

Recommended top-level navigation:

1. Dashboard
2. Application Tracker
3. Import Jobs
4. Materials
5. Resume Workspaces
6. Weekly Review
7. Settings

The navigation should be stable and simple. No user account area is needed because the MVP has no login.

## 4. Global App Shell

The app shell should include:

- Persistent left sidebar navigation
- Main content area
- Page title area
- Primary action button per page
- Lightweight status summary when useful

Recommended global actions:

- Add Job
- Import Jobs
- Add Material
- Create Weekly Review

The shell should avoid marketing-style hero sections. OfferFlow is a working tool, so the interface should prioritize scanning, editing, and repeated use.

## 5. Information Hierarchy

Primary information:

- Job status
- Priority
- Deadline
- Next action
- Company
- Role

Secondary information:

- Role category
- Location
- Source
- Job link
- Materials status
- Notes

Supporting information:

- Imported raw row
- Resume workspace
- Linked materials
- Weekly review notes
- Screening preferences

This hierarchy should influence table column order, dashboard summaries, and detail panel layout.

## 6. Dashboard

### 6.1 Purpose

The Dashboard answers one daily question: what needs attention now?

It should not become an analytics-heavy page in the MVP.

### 6.2 Layout

Recommended layout:

1. Top summary strip
2. Action queue
3. Upcoming deadlines
4. Status overview
5. Recent imports

### 6.3 Top Summary Strip

The summary strip should show:

- Total active jobs
- Jobs to apply
- Jobs with upcoming deadlines
- Jobs in interview process
- Jobs waiting for response

Each metric should link to the relevant filtered tracker view.

### 6.4 Action Queue

The action queue should list jobs that need user action.

Include jobs where:

- Status is `To Apply`
- Status is `Resume in Progress`
- Materials Status is `Needs Tailored Resume`
- Deadline is near
- Next Action is not empty

Each row should show:

- Company
- Role
- Status
- Deadline
- Next action
- Quick status control

### 6.5 Upcoming Deadlines

Upcoming deadlines should focus on the next 7 to 14 days.

Each item should show:

- Deadline date
- Company
- Role
- Status
- Priority

### 6.6 Status Overview

The status overview should show simple counts by status.

This should be a compact visual summary, not a full dashboard system.

### 6.7 Empty State

If there are no jobs yet, the Dashboard should direct the user to:

- Import Jobs
- Add Job manually

The empty state should use fictional examples only.

## 7. Application Tracker

### 7.1 Purpose

The Application Tracker is the main working screen and the source of truth for tracked jobs.

### 7.2 Default View

The default view should be a table of active jobs sorted by the most urgent combination of:

- Status
- Priority
- Deadline
- Last updated

Archived jobs should be hidden by default.

### 7.3 Table Columns

Recommended default columns:

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

The MVP may allow horizontal scrolling if necessary, but status, company, role, deadline, and next action should remain easy to scan.

### 7.4 Saved Views

Recommended tracker views:

- All Active
- To Review
- To Apply
- Resume in Progress
- Applied
- Interviewing
- Waiting for Response
- Offers
- Archived

Saved views are filters over the same Job data, not separate databases.

### 7.5 Toolbar

The tracker toolbar should include:

- Add Job
- Import Jobs
- Search
- Status filter
- Priority filter
- Role category filter
- Deadline sort
- Last updated sort
- Archive toggle

### 7.6 Job Detail Panel

Clicking a job should open a detail panel or modal.

The detail panel should include:

- Company and role
- Status
- Priority
- Deadline
- Job link
- Next action
- Materials status
- Notes
- Linked resume workspace
- Linked materials
- Created and updated timestamps

Longer notes should live in the detail panel, not make the table hard to scan.

### 7.7 Add Job Flow

The Add Job flow should be short.

Minimum fields:

- Company
- Role
- Status
- Priority
- Deadline
- Job link

Optional fields:

- Role category
- Location
- Open date
- Source
- Next action
- Materials status
- Notes

Default values:

- Status: `To Apply`
- Priority: `Unsure`
- Materials Status: `Not Started`

### 7.8 Empty State

If the tracker has no jobs, show two primary actions:

- Add Job
- Import Jobs

The copy should emphasize that data stays local.

## 8. Import Jobs

### 8.1 Purpose

Import Jobs converts external job sources into structured tracker rows.

This is the highest-leverage workflow in the MVP.

### 8.2 Import Methods

Supported MVP methods:

- CSV upload
- Excel upload
- Paste table rows
- Paste simple job text

No automatic crawling or Feishu account sync should be included in the MVP.

### 8.3 Import Page Layout

Recommended layout:

1. Import method selector
2. Input area
3. Field mapping step
4. Preview table
5. Screening panel
6. Duplicate warnings
7. Confirm import action

### 8.4 Step 1: Choose Method

The method selector should make four choices clear:

- CSV
- Excel
- Paste Table
- Paste Text

CSV and Excel should use file upload. Paste Table and Paste Text should use a large text area.

### 8.5 Step 2: Parse Input

After the user uploads or pastes content, OfferFlow should parse rows and detect candidate fields.

The user should see:

- Number of rows detected
- Number of columns detected
- Any parsing warnings
- A preview of the first rows

### 8.6 Step 3: Field Mapping

Field mapping should let the user map source columns to OfferFlow fields.

Required target fields:

- Company
- Role

Recommended target fields:

- Role Category
- Location
- Open Date
- Deadline
- Job Link
- Source
- Notes

Mapping should support an `Ignore` option for source columns that are not needed.

### 8.7 Step 4: Preview Rows

The preview table should show normalized rows before import.

Each row should include:

- Selection checkbox
- Company
- Role
- Location
- Deadline
- Job link
- Screening result
- Duplicate status
- Import warning

Rows should not be added to the tracker until the user confirms.

### 8.8 Step 5: Screening

Screening should be simple and rule-based.

Supported filters:

- Include keywords
- Exclude keywords
- Target locations
- Role categories
- Company type
- Deadline still open
- Eligibility notes

Screening result labels:

- Recommended
- Maybe
- Not Recommended
- Not Checked

Screening should never permanently remove data before user review.

### 8.9 Step 6: Duplicate Review

Likely duplicates should be visible in the preview.

Duplicate result labels:

- Unique
- Possible Duplicate
- Duplicate
- Not Checked

The user should be able to deselect duplicate rows before import.

### 8.10 Step 7: Confirm Import

The final confirmation should show:

- Rows selected
- Rows skipped
- Possible duplicates selected
- Missing required fields

After confirmation:

- Selected rows become Jobs
- New Jobs default to `To Apply`
- Source is preserved
- Import batch metadata is saved locally

### 8.11 Import Empty State

Before input, the Import page should explain supported sources by example:

- Feishu Base export
- CSV file
- Excel file
- Copied table rows

It should not ask for external website credentials.

## 9. Materials

### 9.1 Purpose

Materials is a lightweight personal career material library.

It stores reusable content for resumes, essays, interviews, and self-introductions.

### 9.2 Default View

The default view should be a searchable list or card grid.

Recommended tabs:

- All
- Experiences
- Projects
- STAR Stories
- Achievements
- Skills
- Self-Introductions

### 9.3 Material Card

Each material card should show:

- Title
- Type
- Tags
- Relevant role categories
- Short excerpt
- Last updated

### 9.4 Material Detail

The material detail panel should include:

- Title
- Type
- Tags
- Relevant role categories
- Body
- Quantified results
- Resume-ready phrasing
- Interview-ready phrasing
- Linked resume workspaces

### 9.5 Add Material Flow

Minimum fields:

- Title
- Type
- Body

Optional fields:

- Tags
- Relevant role categories
- Quantified results
- Resume-ready phrasing
- Interview-ready phrasing

### 9.6 Empty State

If there are no materials, prompt the user to create a first material card.

Suggested starter types:

- Project experience
- Internship experience
- STAR story
- Self-introduction

## 10. Resume Workspaces

### 10.1 Purpose

Resume Workspaces connect target roles, job descriptions, personal materials, and resume versions.

The MVP is a lightweight organizer, not a full resume editor.

### 10.2 Default View

The default view should list workspaces by last updated date.

Each row or card should show:

- Workspace name
- Role category
- Target company
- Target role
- Linked job
- Final version status
- Last updated

### 10.3 Workspace Detail

Each workspace detail page or panel should include:

- Target job summary
- Job link
- Original job description
- Job description keywords
- Matched personal materials
- Resume draft or local resume file path
- Revision notes
- Final version marker

### 10.4 Create Workspace Flow

A workspace can be created from:

- A job in the Application Tracker
- A blank workspace
- A pasted job description

When created from a job, company, role, job link, and role category should be prefilled.

### 10.5 Empty State

If there are no resume workspaces, offer:

- Create Blank Workspace
- Create From Tracker Job

## 11. Weekly Review

### 11.1 Purpose

Weekly Review helps the user reflect on overall job search progress.

It should remain lightweight and should not become a complex planning tool.

### 11.2 Default View

The default view should show the current week review if it exists.

If no current review exists, show a Create Weekly Review action.

### 11.3 Review Structure

Each review should include:

- Week start date
- Auto-filled tracker counts
- Most important active opportunities
- Main blockers
- Resume or strategy changes
- Next week priorities
- Energy or confidence notes
- Free-form reflection

### 11.4 Auto-Filled Counts

OfferFlow may auto-fill:

- Jobs discovered this week
- Jobs imported this week
- Jobs applied this week
- Interviews received this week
- Responses received this week
- Rejections received this week
- Offers received this week

The user should be able to edit review text even if counts are auto-calculated.

### 11.5 Empty State

If there are no weekly reviews, explain that reviews help the user see whether the job search is moving forward.

## 12. Settings

### 12.1 Purpose

Settings should support local workflow preferences only.

### 12.2 MVP Settings

Recommended MVP settings:

- Screening preferences
- Import mapping templates
- Data export
- Data backup
- Demo data reset

### 12.3 Excluded Settings

The MVP should not include:

- Account settings
- Password settings
- Billing
- Team management
- Cloud sync settings
- External credential storage

## 13. Core User Flows

### 13.1 Import Jobs to Tracker

1. Open Import Jobs.
2. Choose CSV, Excel, Paste Table, or Paste Text.
3. Upload or paste job data.
4. Review parsed rows.
5. Confirm field mapping.
6. Review screening results.
7. Review duplicate warnings.
8. Select rows to import.
9. Confirm import.
10. Open Application Tracker filtered to newly imported jobs.

### 13.2 Manual Job Tracking

1. Open Application Tracker.
2. Click Add Job.
3. Enter company and role.
4. Add deadline, link, source, and notes if available.
5. Save job.
6. Update status as the application progresses.

### 13.3 Prepare Resume for a Job

1. Open a job detail panel.
2. Create or open a linked Resume Workspace.
3. Add the job description.
4. Review matching personal materials.
5. Add revision notes.
6. Mark final version when ready.
7. Update job Materials Status.

### 13.4 Add Reusable Material

1. Open Materials.
2. Click Add Material.
3. Choose material type.
4. Add body, tags, and role categories.
5. Save material.
6. Link it to resume workspaces when relevant.

### 13.5 Weekly Review

1. Open Weekly Review.
2. Create review for current week.
3. Review auto-filled tracker counts.
4. Write blockers, strategy changes, and next-week priorities.
5. Save review.

## 14. Empty States

Empty states should be practical and action-oriented.

Recommended empty states:

- No jobs: add a job or import jobs.
- No imports: upload CSV, upload Excel, or paste table rows.
- No materials: create a first material card.
- No resume workspaces: create from a tracker job.
- No weekly reviews: create this week's review.

Empty states should never require cloud setup or account creation.

## 15. Search and Filtering

MVP search and filtering should be simple.

Application Tracker filters:

- Status
- Priority
- Role category
- Location
- Deadline
- Source

Materials filters:

- Type
- Tag
- Role category

Resume Workspace filters:

- Role category
- Final version status
- Linked job status

Search should prioritize company, role, material title, tags, and notes.

## 16. Local-First UX Notes

The interface should make it clear that OfferFlow stores real data locally.

Recommended local-first UX details:

- Use local-only language in onboarding or empty states
- Provide export and backup access in Settings
- Keep demo data clearly fictional
- Never ask for Feishu, job board, or email credentials

## 17. MVP Scope Control

The first version should prioritize:

1. Application Tracker
2. Import Jobs
3. Basic local persistence
4. Materials
5. Resume Workspaces
6. Weekly Review

The first version should avoid:

- Advanced dashboards
- Complex automation
- AI-first flows
- Full document editing
- External integrations
- Account systems

## 18. Design Direction

OfferFlow should feel quiet, structured, and work-focused.

Recommended design qualities:

- Dense but readable tables
- Clear status labels
- Fast editing
- Low-friction imports
- Minimal dashboard
- Calm visual hierarchy
- No marketing-style landing page

The first screen after opening the app should be the working product, not a promotional homepage.
