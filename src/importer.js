import Papa from "papaparse";
import { validDate, safeUrl, today, newJob } from "./model";

export const IMPORT_FIELDS = [
  "company",
  "role",
  "role_category",
  "location",
  "open_date",
  "deadline",
  "job_link",
  "source",
  "notes",
];
const aliases = {
  company: [
    "company",
    "companyname",
    "\u516c\u53f8",
    "\u516c\u53f8\u540d\u79f0",
    "\u4f01\u4e1a\u540d\u79f0",
  ],
  role: [
    "role",
    "job",
    "position",
    "jobtitle",
    "\u5c97\u4f4d",
    "\u804c\u4f4d",
    "\u5c97\u4f4d\u540d\u79f0",
    "\u62db\u8058\u5c97\u4f4d",
  ],
  role_category: [
    "rolecategory",
    "category",
    "\u5c97\u4f4d\u7c7b\u522b",
    "\u7c7b\u522b",
  ],
  location: [
    "location",
    "city",
    "\u57ce\u5e02",
    "\u5730\u70b9",
    "\u5de5\u4f5c\u5730\u70b9",
  ],
  open_date: [
    "opendate",
    "openingdate",
    "\u5f00\u653e\u65f6\u95f4",
    "\u5f00\u653e\u65e5\u671f",
    "\u5f00\u59cb\u65f6\u95f4",
  ],
  deadline: [
    "deadline",
    "closingdate",
    "\u622a\u6b62\u65f6\u95f4",
    "\u622a\u6b62\u65e5\u671f",
  ],
  job_link: [
    "link",
    "url",
    "joblink",
    "\u94fe\u63a5",
    "\u6295\u9012\u94fe\u63a5",
    "\u7533\u8bf7\u94fe\u63a5",
    "\u7f51\u7533\u94fe\u63a5",
  ],
  source: ["source", "\u6765\u6e90"],
  notes: ["notes", "note", "remarks", "\u5907\u6ce8", "\u8bf4\u660e"],
};
const norm = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_\-]/g, "");
export function guessMapping(headers, saved = {}) {
  const result = {};
  for (const field of IMPORT_FIELDS) {
    const found = headers.findIndex((h) => aliases[field].includes(norm(h)));
    result[field] = found >= 0 ? String(found) : "";
  }
  for (const field of IMPORT_FIELDS)
    if (saved[field] && headers.includes(saved[field]))
      result[field] = String(headers.indexOf(saved[field]));
  return result;
}
export function tableFromRows(rows, hasHeaders = true) {
  const clean = rows
    .filter((row) => row.some((v) => String(v ?? "").trim()))
    .map((row) => row.map((v) => String(v ?? "").trim()));
  if (!clean.length) throw new Error("No rows found.");
  const width = Math.max(...clean.map((r) => r.length));
  if (width > 100 || clean.length > 10001)
    throw new Error("Import up to 10,000 rows and 100 columns at a time.");
  return {
    headers: Array.from({ length: width }, (_, i) =>
      hasHeaders ? clean[0][i] || `Column ${i + 1}` : `Column ${i + 1}`,
    ),
    rows: (hasHeaders ? clean.slice(1) : clean).map((r) =>
      Array.from({ length: width }, (_, i) => r[i] || ""),
    ),
  };
}
export function parseDelimited(text, hasHeaders = true) {
  const result = Papa.parse(text.trim(), { skipEmptyLines: "greedy" });
  const errors = result.errors.filter(
    (e) => e.code !== "UndetectableDelimiter",
  );
  if (errors.length)
    throw new Error(`Could not parse table: ${errors[0].message}`);
  return tableFromRows(result.data, hasHeaders);
}
export function parseJobText(text) {
  const blocks = text.trim().split(/\n\s*\n/);
  const rows = blocks.map((block) => {
    const result = {};
    const extra = [];
    for (const line of block.split("\n")) {
      const match = line.match(/^([^:\uff1a]+)[:\uff1a]\s*(.*)$/);
      const field =
        match && IMPORT_FIELDS.find((f) => aliases[f].includes(norm(match[1])));
      if (field) result[field] = match[2];
      else extra.push(line);
    }
    result.notes = [result.notes, ...extra].filter(Boolean).join("\n");
    return IMPORT_FIELDS.map((f) => result[f] || "");
  });
  if (!rows.some((r) => r[0] || r[1]))
    throw new Error(
      "Use labeled text: Company: ... and Role: ... on separate lines. Separate jobs with a blank line.",
    );
  return { headers: IMPORT_FIELDS, rows };
}
export async function parseExcel(file) {
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  return workbook.worksheets
    .map((sheet) => {
      const rows = [];
      if (sheet.rowCount > 10001 || sheet.columnCount > 100)
        throw new Error("Import up to 10,000 rows and 100 columns per sheet.");
      sheet.eachRow((row) => {
        const values = [];
        for (let i = 1; i <= sheet.columnCount; i++) {
          const cell = row.getCell(i);
          const v = cell.value;
          values.push(
            v instanceof Date
              ? v.toISOString().slice(0, 10)
              : v?.hyperlink
                ? v.hyperlink
                : v?.richText
                  ? v.richText.map((t) => t.text).join("")
                  : v?.formula
                    ? String(v.result ?? "")
                    : cell.text,
          );
        }
        rows.push(values);
      });
      return { name: sheet.name, rows };
    })
    .filter((s) => s.rows.length);
}
export function normalizeDate(raw) {
  if (!raw.trim()) return "";
  let value = raw
    .trim()
    .replace(/[\/.\u5e74\u6708]/g, "-")
    .replace(/\u65e5$/, "");
  const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match)
    value = `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
  return validDate(value) ? value : "";
}
const canonicalLink = (link) => {
  const value = safeUrl(link);
  if (!value) return "";
  const u = new URL(value);
  u.hash = "";
  for (const k of [...u.searchParams.keys()])
    if (/^utm_/.test(k)) u.searchParams.delete(k);
  u.searchParams.sort();
  return u.href.replace(/\/$/, "");
};
export function isDuplicate(a, b) {
  return !!(
    (a.job_link &&
      canonicalLink(a.job_link) &&
      canonicalLink(a.job_link) === canonicalLink(b.job_link)) ||
    (norm(a.company) &&
      norm(a.role) &&
      norm(a.company) === norm(b.company) &&
      norm(a.role) === norm(b.role))
  );
}
const words = (value) =>
  value
    .split(/[,\n\uff0c]/)
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
export function screenJob(job, rules) {
  const haystack = Object.values(job).join(" ").toLowerCase();
  if (words(rules.exclude).some((w) => haystack.includes(w)))
    return "Excluded keyword";
  if (rules.openOnly && job.deadline && job.deadline < today())
    return "Deadline passed";
  for (const [key, target, reason] of [
    ["include", haystack, "Keyword mismatch"],
    ["locations", job.location.toLowerCase(), "Location mismatch"],
    ["categories", job.role_category.toLowerCase(), "Category mismatch"],
    ["eligibility", haystack, "Check eligibility"],
    ["company_types", haystack, "Check company type"],
  ])
    if (
      words(rules[key]).length &&
      !words(rules[key]).some((w) => target.includes(w))
    )
      return reason;
  return "Recommended";
}
export function previewRows(table, mapping, jobs, rules, source = "") {
  const seen = [...jobs];
  return table.rows.map((row, index) => {
    const job = Object.fromEntries(
      IMPORT_FIELDS.map((f) => [
        f,
        mapping[f] === "" || mapping[f] === undefined
          ? ""
          : row[Number(mapping[f])] || "",
      ]),
    );
    const warnings = [];
    if (!job.company.trim()) warnings.push("Company required");
    if (!job.role.trim()) warnings.push("Role required");
    for (const f of ["deadline", "open_date"]) {
      const date = normalizeDate(job[f]);
      if (job[f] && !date)
        warnings.push(`Invalid ${f.replace("_", " ")}: ${job[f]}`);
      job[f] = date;
    }
    if (job.job_link && !safeUrl(job.job_link))
      warnings.push("Invalid job link");
    job.source ||= source;
    const duplicate = seen.some((j) => isDuplicate(job, j));
    seen.push(job);
    return {
      index,
      job,
      warnings,
      duplicate,
      screening: screenJob(job, rules),
    };
  });
}
export function commitImport(state, entries, source, method) {
  if (!entries.length) throw new Error("Select at least one valid row.");
  const batch = {
    id: crypto.randomUUID(),
    source,
    method,
    count: entries.length,
    created_at: new Date().toISOString(),
  };
  return {
    ...state,
    jobs: [
      ...state.jobs,
      ...entries.map((e) => newJob({ ...e.job, import_batch_id: batch.id })),
    ],
    imports: [...state.imports, batch],
  };
}
export function jobsCsv(jobs) {
  return Papa.unparse(
    jobs.map(({ events, ...job }) => job),
    { escapeFormulae: true },
  );
}
