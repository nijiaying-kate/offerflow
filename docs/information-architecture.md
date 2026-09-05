# Information Architecture

## 1. Purpose

This document describes the first information architecture for OfferFlow as a local-first personal job search web app.

The structure is designed around one primary workflow: import job leads, review them, add selected jobs to the Application Tracker, and manage next actions.

## 2. Top-Level Navigation

Recommended top-level navigation:

1. Dashboard
2. Application Tracker
3. Import Jobs
4. Materials
5. Resume Workspaces
6. Weekly Review
7. Settings

## 3. Dashboard

The Dashboard should provide a quick daily overview.

Primary content:

- Jobs requiring action
- Upcoming deadlines
- Applications by status
- Recently imported jobs
- Top priority opportunities
- Quick links to import, add job, and create review

The Dashboard should not become a complex analytics center in the MVP.

## 4. Application Tracker

The Application Tracker is the main working screen.

Primary views:

- All Jobs
- To Apply
- Resume in Progress
- Applied
- Interviewing
- Waiting for Response
- Archived

Primary actions:

- Add job
- Edit job
- Change status
- Filter
- Sort
- Open job link
- Archive job

The tracker should support table-first work, with a detail panel or edit modal for longer notes and related materials.

## 5. Import Jobs

Import Jobs handles CSV, Excel, and pasted table content.

Suggested screen flow:

1. Choose import method
2. Upload file or paste content
3. Preview parsed rows
4. Confirm field mapping
5. Review screening results
6. Review duplicate warnings
7. Confirm selected rows
8. Add confirmed rows to Application Tracker

The import flow should never write directly to the tracker without preview.

## 6. Materials

Materials stores reusable personal career content.

Suggested views:

- All Materials
- Experiences
- Projects
- STAR Stories
- Self-Introductions
- Achievements
- Skills

Material entries should support tags, role categories, search, and links to resume workspaces.

## 7. Resume Workspaces

Resume Workspaces organize job-specific or role-specific resume preparation.

Suggested views:

- All Workspaces
- By Role Category
- Linked to Active Jobs
- Finalized Versions

Each workspace should show the target job, original job description, matching materials, resume draft or file path, revision notes, and final version marker.

## 8. Weekly Review

Weekly Review supports lightweight reflection.

Suggested views:

- Current Week
- Past Reviews
- Status Summary

Each review should combine tracker counts with manually written reflections and next-week priorities.

## 9. Settings

Settings should stay minimal in the MVP.

Potential settings:

- Screening preferences
- Import mapping templates
- Data export
- Data backup
- Demo data reset

Settings should not include account, billing, cloud sync, or team management in the MVP.

## 10. MVP Navigation Principle

The Application Tracker and Import Jobs screens should receive the most attention. Materials, Resume Workspaces, and Weekly Review can be lighter in the first version, as long as their structure supports future growth.
