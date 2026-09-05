# Data Model

## 1. Purpose

This document defines the initial data model for OfferFlow as a local-first personal job search web app.

The model is intentionally small. It supports the MVP without introducing authentication, cloud sync, multi-user ownership, or external account credentials.

## 2. Core Entities

MVP entities:

1. Job
2. Import Batch
3. Imported Job Row
4. Material
5. Resume Workspace
6. Weekly Review
7. Screening Preference

## 3. Job

The Job entity represents one tracked job opportunity in the Application Tracker.

Suggested fields:

- `id`
- `status`
- `priority`
- `company`
- `role`
- `role_category`
- `location`
- `open_date`
- `deadline`
- `source`
- `job_link`
- `next_action`
- `materials_status`
- `notes`
- `is_archived`
- `created_at`
- `updated_at`

Status values:

- `to_review`
- `to_apply`
- `resume_in_progress`
- `applied`
- `assessment`
- `interviewing`
- `waiting_for_response`
- `offer`
- `rejected`
- `abandoned`

Priority values:

- `high`
- `medium`
- `low`
- `unsure`

Materials status values:

- `not_started`
- `needs_tailored_resume`
- `resume_ready`
- `needs_additional_materials`
- `final_version_submitted`

## 4. Import Batch

The Import Batch entity represents one CSV, Excel, or paste import session.

Suggested fields:

- `id`
- `import_method`
- `source_name`
- `original_filename`
- `raw_preview`
- `field_mapping`
- `screening_preferences_snapshot`
- `created_at`
- `confirmed_at`

Import method values:

- `csv`
- `excel`
- `paste_table`
- `paste_text`

## 5. Imported Job Row

The Imported Job Row entity represents a parsed row before or during confirmation.

Suggested fields:

- `id`
- `import_batch_id`
- `company`
- `role`
- `role_category`
- `location`
- `open_date`
- `deadline`
- `source`
- `job_link`
- `notes`
- `screening_status`
- `duplicate_status`
- `selected_for_import`
- `created_job_id`
- `raw_row`

Screening status values:

- `recommended`
- `maybe`
- `not_recommended`
- `not_checked`

Duplicate status values:

- `unique`
- `possible_duplicate`
- `duplicate`
- `not_checked`

## 6. Material

The Material entity stores reusable personal career content.

Suggested fields:

- `id`
- `title`
- `type`
- `tags`
- `role_categories`
- `body`
- `quantified_results`
- `resume_phrasing`
- `interview_phrasing`
- `created_at`
- `updated_at`

Material type values:

- `education`
- `internship`
- `work_experience`
- `project`
- `research`
- `skill`
- `achievement`
- `self_introduction`
- `star_story`
- `behavioral_example`
- `failure_reflection`
- `career_motivation`

## 7. Resume Workspace

The Resume Workspace entity links a target job or role category to resume preparation notes and materials.

Suggested fields:

- `id`
- `name`
- `role_category`
- `target_company`
- `target_role`
- `job_id`
- `job_link`
- `job_description`
- `job_description_keywords`
- `matched_material_ids`
- `resume_draft`
- `resume_file_path`
- `revision_notes`
- `is_final_version`
- `created_at`
- `updated_at`

## 8. Weekly Review

The Weekly Review entity stores lightweight progress reflection.

Suggested fields:

- `id`
- `week_start_date`
- `jobs_discovered`
- `jobs_imported`
- `jobs_applied`
- `interviews_received`
- `responses_received`
- `rejections_received`
- `offers_received`
- `top_active_opportunities`
- `main_blockers`
- `resume_or_strategy_changes`
- `next_week_priorities`
- `energy_notes`
- `freeform_reflection`
- `created_at`
- `updated_at`

## 9. Screening Preference

The Screening Preference entity stores reusable rules for import screening.

Suggested fields:

- `id`
- `name`
- `include_keywords`
- `exclude_keywords`
- `target_locations`
- `role_categories`
- `company_types`
- `deadline_required`
- `eligibility_notes`
- `created_at`
- `updated_at`

## 10. Relationships

Recommended relationships:

- A Job may have zero or many Resume Workspaces.
- A Resume Workspace may link to one Job.
- A Resume Workspace may link to many Materials.
- An Import Batch has many Imported Job Rows.
- An Imported Job Row may create one Job.
- Weekly Reviews summarize Jobs but do not need strict foreign key links in the MVP.

## 11. Local Storage Notes

The implemented v0.1 uses IndexedDB through Dexie. The complete personal workspace is validated and saved atomically as a versioned record. Job status events support historical weekly counts. See [MVP Implementation Notes](mvp-implementation.md) for implemented fields and simplifications.

Any database files, uploaded documents, exports, or private user data must remain outside Git history.
