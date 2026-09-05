import { z } from "zod";

export const STATUSES = [
  "to_review",
  "to_apply",
  "resume_in_progress",
  "applied",
  "assessment",
  "interviewing",
  "waiting_for_response",
  "offer",
  "rejected",
  "abandoned",
];
export const PRIORITIES = ["high", "medium", "low", "unsure"];
export const MATERIAL_STATUSES = [
  "not_started",
  "needs_tailored_resume",
  "resume_ready",
  "needs_additional_materials",
  "final_version_submitted",
];
export const MATERIAL_TYPES = [
  "education",
  "internship",
  "work_experience",
  "project",
  "research",
  "skill",
  "achievement",
  "self_introduction",
  "star_story",
  "behavioral_example",
  "failure_reflection",
  "career_motivation",
];
export const label = (value) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
export const today = () => dateKey(new Date());
export function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function monday(date = new Date()) {
  const d = new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return dateKey(d);
}
export function dayDistance(date, base = today()) {
  return Math.round(
    (Date.parse(`${date}T12:00:00Z`) - Date.parse(`${base}T12:00:00Z`)) /
      86400000,
  );
}
export const formatDate = (value) =>
  value
    ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No date";
export function safeUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}
export function validDate(value) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value
  );
}
const text = z.string().max(500000).default("");
const date = z
  .string()
  .refine((v) => !v || validDate(v), "Use a valid date")
  .default("");
const url = z
  .string()
  .refine((v) => !v || !!safeUrl(v), "Use an http:// or https:// link")
  .default("");
const base = {
  id: z.string().min(1),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
};
const jobSchema = z.object({
  ...base,
  company: z.string().trim().min(1),
  role: z.string().trim().min(1),
  status: z.enum(STATUSES),
  priority: z.enum(PRIORITIES),
  role_category: text,
  location: text,
  open_date: date,
  deadline: date,
  source: text,
  job_link: url,
  next_action: text,
  materials_status: z.enum(MATERIAL_STATUSES),
  notes: text,
  is_archived: z.boolean(),
  import_batch_id: text,
  events: z.array(
    z.object({ status: z.enum(STATUSES), at: z.string().datetime() }),
  ),
});
const materialSchema = z.object({
  ...base,
  title: z.string().trim().min(1),
  type: z.enum(MATERIAL_TYPES),
  tags: text,
  role_categories: text,
  body: z.string().trim().min(1),
  quantified_results: text,
  resume_phrasing: text,
  interview_phrasing: text,
});
const resumeSchema = z.object({
  ...base,
  name: z.string().trim().min(1),
  role_category: text,
  target_company: text,
  target_role: text,
  job_id: text,
  job_link: url,
  job_description: text,
  job_description_keywords: text,
  matched_material_ids: z.array(z.string()),
  resume_draft: text,
  resume_file_path: text,
  revision_notes: text,
  is_final_version: z.boolean(),
});
const count = z.number().int().nonnegative();
const reviewSchema = z.object({
  ...base,
  week_start_date: z.string().refine(validDate),
  jobs_discovered: count,
  jobs_imported: count,
  jobs_applied: count,
  interviews_received: count,
  responses_received: count,
  rejections_received: count,
  offers_received: count,
  top_active_opportunities: text,
  main_blockers: text,
  resume_or_strategy_changes: text,
  next_week_priorities: text,
  energy_notes: text,
  freeform_reflection: text,
});
export const rulesSchema = z.object({
  include: text,
  exclude: text,
  locations: text,
  categories: text,
  eligibility: text,
  company_types: text,
  openOnly: z.boolean().default(true),
});
export const stateSchema = z.object({
  version: z.literal(1),
  jobs: z.array(jobSchema),
  materials: z.array(materialSchema),
  resumes: z.array(resumeSchema),
  reviews: z.array(reviewSchema),
  imports: z.array(
    z.object({
      id: z.string(),
      source: text,
      method: text,
      count,
      created_at: z.string().datetime(),
    }),
  ),
  preferences: rulesSchema,
  mapping: z.record(z.string(), z.string()),
});
export const blankState = () => ({
  version: 1,
  jobs: [],
  materials: [],
  resumes: [],
  reviews: [],
  imports: [],
  preferences: {
    include: "",
    exclude: "",
    locations: "",
    categories: "",
    eligibility: "",
    company_types: "",
    openOnly: true,
  },
  mapping: {},
});
export const meta = () => ({
  id: crypto.randomUUID(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});
export function newJob(values = {}) {
  const item = {
    ...meta(),
    company: "",
    role: "",
    status: "to_apply",
    priority: "unsure",
    role_category: "",
    location: "",
    open_date: "",
    deadline: "",
    source: "",
    job_link: "",
    next_action: "",
    materials_status: "not_started",
    notes: "",
    is_archived: false,
    import_batch_id: "",
    ...values,
  };
  return {
    ...item,
    events: values.events || [{ status: item.status, at: item.created_at }],
  };
}
export const newMaterial = () => ({
  ...meta(),
  title: "",
  type: "project",
  tags: "",
  role_categories: "",
  body: "",
  quantified_results: "",
  resume_phrasing: "",
  interview_phrasing: "",
});
export const newResume = (job = {}) => ({
  ...meta(),
  name: job.role ? `${job.company} - ${job.role}` : "",
  role_category: job.role_category || "",
  target_company: job.company || "",
  target_role: job.role || "",
  job_id: job.id || "",
  job_link: job.job_link || "",
  job_description: "",
  job_description_keywords: "",
  matched_material_ids: [],
  resume_draft: "",
  resume_file_path: "",
  revision_notes: "",
  is_final_version: false,
});
export function weeklyCounts(jobs, week) {
  const inside = (value) => {
    const d = dayDistance(dateKey(new Date(value)), week);
    return d >= 0 && d < 7;
  };
  const transitioned = (statuses) =>
    jobs.filter((j) =>
      j.events.some((e) => statuses.includes(e.status) && inside(e.at)),
    ).length;
  return {
    jobs_discovered: jobs.filter((j) => inside(j.created_at)).length,
    jobs_imported: jobs.filter((j) => j.import_batch_id && inside(j.created_at))
      .length,
    jobs_applied: transitioned(["applied"]),
    interviews_received: transitioned(["interviewing"]),
    responses_received: transitioned([
      "assessment",
      "interviewing",
      "offer",
      "rejected",
    ]),
    rejections_received: transitioned(["rejected"]),
    offers_received: transitioned(["offer"]),
  };
}
export const newReview = (jobs) => ({
  ...meta(),
  week_start_date: monday(),
  ...weeklyCounts(jobs, monday()),
  top_active_opportunities: "",
  main_blockers: "",
  resume_or_strategy_changes: "",
  next_week_priorities: "",
  energy_notes: "",
  freeform_reflection: "",
});
export function upsert(state, collection, entry) {
  const previous = state[collection].find((x) => x.id === entry.id);
  const next = { ...entry, updated_at: new Date().toISOString() };
  if (collection === "jobs" && previous)
    next.events =
      previous.status === next.status
        ? previous.events
        : [...previous.events, { status: next.status, at: next.updated_at }];
  if (
    collection === "reviews" &&
    state.reviews.some(
      (x) => x.id !== entry.id && x.week_start_date === entry.week_start_date,
    )
  )
    throw new Error(
      "A review already exists for this week. Open that review to edit it.",
    );
  return stateSchema.parse({
    ...state,
    [collection]: previous
      ? state[collection].map((x) => (x.id === next.id ? next : x))
      : [...state[collection], next],
  });
}
export function removeEntry(state, collection, id) {
  const next = {
    ...state,
    [collection]: state[collection].filter((x) => x.id !== id),
  };
  if (collection === "jobs")
    next.resumes = state.resumes.map((x) =>
      x.job_id === id ? { ...x, job_id: "" } : x,
    );
  if (collection === "materials")
    next.resumes = state.resumes.map((x) => ({
      ...x,
      matched_material_ids: x.matched_material_ids.filter((mid) => mid !== id),
    }));
  return next;
}
export function parseBackup(raw) {
  const wrapper = JSON.parse(raw);
  if (wrapper.app !== "OfferFlow")
    throw new Error("This is not an OfferFlow backup.");
  const state = stateSchema.parse(wrapper.data);
  for (const collection of [
    "jobs",
    "materials",
    "resumes",
    "reviews",
    "imports",
  ])
    if (
      new Set(state[collection].map((x) => x.id)).size !==
      state[collection].length
    )
      throw new Error("Backup contains duplicate record IDs.");
  if (
    new Set(state.reviews.map((x) => x.week_start_date)).size !==
    state.reviews.length
  )
    throw new Error("Backup contains duplicate weeks.");
  if (
    state.resumes.some(
      (r) =>
        (r.job_id && !state.jobs.some((j) => j.id === r.job_id)) ||
        r.matched_material_ids.some(
          (id) => !state.materials.some((m) => m.id === id),
        ),
    )
  )
    throw new Error("Backup contains missing linked records.");
  return state;
}
export function download(content, name, type = "application/json") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
