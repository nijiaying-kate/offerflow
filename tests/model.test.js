import { describe, it, expect } from "vitest";
import {
  blankState,
  newJob,
  newMaterial,
  newResume,
  newReview,
  upsert,
  weeklyCounts,
  removeEntry,
  parseBackup,
  safeUrl,
  validDate,
  stateSchema,
} from "../src/model";

describe("local workspace integrity", () => {
  it("validates an empty workspace", () =>
    expect(stateSchema.parse(blankState())).toEqual(blankState()));
  it("records status transitions without changing application history on note edits", () => {
    const job = newJob({ company: "Example", role: "Analyst" });
    let state = upsert(blankState(), "jobs", job);
    state = upsert(state, "jobs", { ...job, status: "applied" });
    expect(state.jobs[0].events.map((e) => e.status)).toEqual([
      "to_apply",
      "applied",
    ]);
    state = upsert(state, "jobs", { ...state.jobs[0], notes: "Updated" });
    expect(state.jobs[0].events).toHaveLength(2);
  });
  it("counts events in the selected week, not current status or last edit", () => {
    const job = newJob({
      company: "Example",
      role: "Analyst",
      created_at: "2026-09-01T12:00:00.000Z",
      events: [
        { status: "applied", at: "2026-09-01T12:00:00.000Z" },
        { status: "interviewing", at: "2026-09-08T12:00:00.000Z" },
        { status: "interviewing", at: "2026-09-09T12:00:00.000Z" },
      ],
    });
    expect(weeklyCounts([job], "2026-09-07")).toMatchObject({
      jobs_applied: 0,
      interviews_received: 1,
      jobs_discovered: 0,
    });
    expect(weeklyCounts([job], "2026-08-31").jobs_applied).toBe(1);
  });
  it("unlinks deleted jobs and materials while retaining resume drafts", () => {
    const job = newJob({ company: "Example", role: "Analyst" });
    const material = { ...newMaterial(), title: "Story", body: "A story" };
    const state = {
      ...blankState(),
      jobs: [job],
      materials: [material],
      resumes: [
        {
          ...newResume(job),
          matched_material_ids: [material.id],
          resume_draft: "Keep me",
        },
      ],
    };
    const result = removeEntry(
      removeEntry(state, "jobs", job.id),
      "materials",
      material.id,
    );
    expect(result.resumes[0]).toMatchObject({
      job_id: "",
      matched_material_ids: [],
      resume_draft: "Keep me",
    });
  });
  it("prevents two reviews for the same week", () => {
    const state = upsert(blankState(), "reviews", newReview([]));
    expect(() => upsert(state, "reviews", newReview([]))).toThrow(
      /already exists/,
    );
  });
  it("round-trips backups and rejects malformed, unsupported, or dangling data", () => {
    const state = upsert(
      blankState(),
      "jobs",
      newJob({ company: "Example", role: "Analyst" }),
    );
    const serialize = (data) => JSON.stringify({ app: "OfferFlow", data });
    expect(parseBackup(serialize(state))).toEqual(state);
    expect(() => parseBackup(serialize({ ...state, version: 9 }))).toThrow();
    expect(() =>
      parseBackup(
        serialize({ ...state, jobs: [...state.jobs, ...state.jobs] }),
      ),
    ).toThrow(/duplicate/);
    expect(() =>
      parseBackup(
        serialize({
          ...state,
          resumes: [{ ...newResume(state.jobs[0]), job_id: "missing" }],
        }),
      ),
    ).toThrow(/missing linked/);
  });
  it("rejects invalid dates and executable links", () => {
    expect(validDate("2026-02-30")).toBe(false);
    expect(validDate("2024-02-29")).toBe(true);
    expect(safeUrl("javascript:alert(1)")).toBe("");
    expect(safeUrl("file:///etc/passwd")).toBe("");
    expect(safeUrl("https://example.com")).toBe("https://example.com/");
  });
});
