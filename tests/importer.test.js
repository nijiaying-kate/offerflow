import { describe, it, expect } from "vitest";
import {
  parseDelimited,
  parseJobText,
  tableFromRows,
  guessMapping,
  previewRows,
  isDuplicate,
  normalizeDate,
  commitImport,
  jobsCsv,
} from "../src/importer";
import { blankState, newJob } from "../src/model";

describe("job import", () => {
  it("parses quoted multiline CSV without splitting a notes field", () => {
    const table = parseDelimited(
      'Company,Role,Notes\nExample,Analyst,"Line 1\nLine 2, with comma"',
    );
    expect(table.rows).toEqual([
      ["Example", "Analyst", "Line 1\nLine 2, with comma"],
    ]);
  });
  it("supports Chinese table headers and copied TSV", () => {
    const table = parseDelimited(
      "\u516c\u53f8\t\u5c97\u4f4d\t\u622a\u6b62\u65f6\u95f4\nExample\tAnalyst\t2026/12/1",
    );
    const rows = previewRows(
      table,
      guessMapping(table.headers),
      [],
      blankState().preferences,
    );
    expect(rows[0].job).toMatchObject({
      company: "Example",
      role: "Analyst",
      deadline: "2026-12-01",
    });
    expect(rows[0].warnings).toEqual([]);
  });
  it("supports headerless tables and stored mappings", () => {
    expect(tableFromRows([["Example", "Analyst"]], false)).toEqual({
      headers: ["Column 1", "Column 2"],
      rows: [["Example", "Analyst"]],
    });
    expect(
      guessMapping(["Employer", "Position"], { company: "Employer" }),
    ).toMatchObject({ company: "0", role: "1" });
  });
  it("parses simple labeled text and preserves other lines in notes", () => {
    const table = parseJobText(
      "Company: Example\nRole: Analyst\nLink: https://example.com/job\nExtra context\n\nCompany: Sample\nRole: Designer",
    );
    expect(table.rows).toHaveLength(2);
    expect(table.rows[0][6]).toBe("https://example.com/job");
    expect(table.rows[0][8]).toContain("Extra context");
  });
  it("detects tracker and same-batch duplicates", () => {
    const job = newJob({
      company: "Example",
      role: "Analyst",
      job_link: "https://example.com/job?id=1",
    });
    expect(
      isDuplicate(job, {
        company: "Other",
        role: "Other",
        job_link: "https://example.com/job?utm_source=test&id=1#apply",
      }),
    ).toBe(true);
    const table = parseDelimited(
      "Company,Role\nExample,Analyst\nSample,Designer\nSample,Designer",
    );
    expect(
      previewRows(
        table,
        guessMapping(table.headers),
        [job],
        blankState().preferences,
      ).map((r) => r.duplicate),
    ).toEqual([true, false, true]);
  });
  it("flags invalid dates and links without importing them silently", () => {
    const table = parseDelimited(
      "Company,Role,Deadline,Link\nExample,Analyst,2026-02-30,javascript:alert(1)",
    );
    expect(
      previewRows(
        table,
        guessMapping(table.headers),
        [],
        blankState().preferences,
      )[0].warnings,
    ).toHaveLength(2);
    expect(normalizeDate("09/12/2026")).toBe("");
  });
  it("screens inclusions, exclusions, locations and expired deadlines without deleting rows", () => {
    const table = parseDelimited(
      "Company,Role,Location,Deadline\nExample,Analyst,Shanghai,2099-12-31\nSample,Sales,Beijing,2020-01-01",
    );
    const rows = previewRows(table, guessMapping(table.headers), [], {
      ...blankState().preferences,
      include: "analyst",
      locations: "Shanghai",
    });
    expect(rows).toHaveLength(2);
    expect(rows[0].screening).toBe("Recommended");
    expect(rows[1].screening).toBe("Deadline passed");
  });
  it("commits only confirmed rows as To Apply with a local import record", () => {
    const table = parseDelimited(
      "Company,Role\nExample,Analyst\nSample,Designer",
    );
    const rows = previewRows(
      table,
      guessMapping(table.headers),
      [],
      blankState().preferences,
    );
    const state = commitImport(blankState(), [rows[0]], "CSV source", "csv");
    expect(state.jobs).toHaveLength(1);
    expect(state.jobs[0].status).toBe("to_apply");
    expect(state.jobs[0].import_batch_id).toBe(state.imports[0].id);
  });
  it("neutralizes spreadsheet formulas on CSV export", () => {
    const csv = jobsCsv([newJob({ company: "=1+1", role: "@SUM(A1)" })]);
    expect(csv).toContain("'=1+1");
    expect(csv).toContain("'@SUM(A1)");
  });
});
