import { useState } from "react";
import { Save, Download, Plus, Copy } from "lucide-react";
import { Button, Field, Select, Modal, ExternalLink } from "./components";
import {
  STATUSES,
  PRIORITIES,
  MATERIAL_STATUSES,
  MATERIAL_TYPES,
  label,
  weeklyCounts,
  download,
  today,
  meta,
} from "./model";

export default function Editor({
  kind,
  initial,
  state,
  onSave,
  onClose,
  onResume,
}) {
  const [value, setValue] = useState(structuredClone(initial));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(value) !== JSON.stringify(initial);
  const close = () => {
    if (!busy && (!dirty || window.confirm("Discard unsaved changes?")))
      onClose();
  };
  const set = (key, v) => setValue((current) => ({ ...current, [key]: v }));
  const input = (key, title, options = {}) => (
    <Field key={key} title={title} wide={options.wide}>
      <input
        value={value[key]}
        onChange={(e) =>
          set(
            key,
            options.type === "number" ? Number(e.target.value) : e.target.value,
          )
        }
        {...options}
        wide={undefined}
      />
    </Field>
  );
  const area = (key, title, rows = 4) => (
    <Field key={key} title={title} wide>
      <textarea
        value={value[key]}
        rows={rows}
        onChange={(e) => set(key, e.target.value)}
      />
    </Field>
  );
  const select = (key, title, options) => (
    <Field title={title}>
      <Select
        value={value[key]}
        options={options}
        onChange={(e) => set(key, e.target.value)}
      />
    </Field>
  );
  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSave(kind, value);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const exists = state[kind].some((x) => x.id === initial.id);
  const noun = {
    jobs: "opportunity",
    materials: "material",
    resumes: "resume workspace",
    reviews: "weekly review",
  }[kind];
  return (
    <Modal
      title={`${exists ? "Edit" : "New"} ${noun}`}
      onClose={close}
      wide={kind === "resumes"}
    >
      <form onSubmit={save}>
        <fieldset disabled={busy} className="editor-body">
          <div className="form-grid">
            {kind === "jobs" && (
              <>
                {input("company", "Company *", {
                  required: true,
                  autoFocus: true,
                })}
                {input("role", "Role *", { required: true })}
                {select("status", "Status", STATUSES)}
                {select("priority", "Priority", PRIORITIES)}
                {input("role_category", "Role category")}
                {input("location", "Location")}
                {input("open_date", "Open date", { type: "date" })}
                {input("deadline", "Deadline", {
                  type: "date",
                  min: value.open_date || undefined,
                })}
                {input("job_link", "Job link", {
                  type: "url",
                  placeholder: "https://",
                  wide: true,
                })}
                {input("source", "Source")}
                {select(
                  "materials_status",
                  "Materials status",
                  MATERIAL_STATUSES,
                )}
                {input("next_action", "Next action", { wide: true })}
                {area("notes", "Notes")}
                {exists && (
                  <div className="wide linked-section">
                    <h3>Resume workspaces</h3>
                    {state.resumes
                      .filter((r) => r.job_id === value.id)
                      .map((r) => (
                        <p key={r.id}>
                          {r.name}
                          <span className="muted">
                            {r.is_final_version ? " / Final" : " / Draft"}
                          </span>
                        </p>
                      ))}
                    <Button
                      type="button"
                      icon={Plus}
                      onClick={async () => {
                        setBusy(true);
                        try {
                          await onSave(kind, value);
                          onResume(value);
                        } catch (e) {
                          setError(e.message);
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      Save & create resume workspace
                    </Button>
                  </div>
                )}
              </>
            )}
            {kind === "materials" && (
              <>
                {input("title", "Title *", { required: true, autoFocus: true })}
                {select("type", "Type", MATERIAL_TYPES)}
                {input("tags", "Tags", {
                  placeholder: "Research, leadership, analysis",
                })}
                {input("role_categories", "Relevant role categories")}
                <Field title="Experience / story *" wide>
                  <textarea
                    required
                    rows={7}
                    value={value.body}
                    onChange={(e) => set("body", e.target.value)}
                  />
                </Field>
                {area("quantified_results", "Results & metrics", 3)}
                {area("resume_phrasing", "Resume phrasing")}
                {area("interview_phrasing", "Interview phrasing")}
              </>
            )}
            {kind === "resumes" && (
              <>
                {input("name", "Workspace name *", {
                  required: true,
                  autoFocus: true,
                  wide: true,
                })}
                <Field title="Linked opportunity">
                  <Select
                    empty="No linked opportunity"
                    value={value.job_id}
                    options={state.jobs.map((j) => ({
                      value: j.id,
                      label: `${j.company} / ${j.role}`,
                    }))}
                    onChange={(e) => {
                      const job = state.jobs.find(
                        (j) => j.id === e.target.value,
                      );
                      setValue((v) => ({
                        ...v,
                        job_id: e.target.value,
                        ...(job
                          ? {
                              target_company: job.company,
                              target_role: job.role,
                              role_category: job.role_category,
                              job_link: job.job_link,
                            }
                          : {}),
                      }));
                    }}
                  />
                </Field>
                {input("role_category", "Role category")}
                {input("target_company", "Target company")}
                {input("target_role", "Target role")}
                {input("job_link", "Job link", { type: "url", wide: true })}
                {area("job_description", "Job description", 6)}
                {input("job_description_keywords", "JD keywords", {
                  wide: true,
                })}
                <div className="wide linked-section">
                  <h3>Personal materials</h3>
                  {!state.materials.length && (
                    <p className="muted">No materials yet.</p>
                  )}
                  {state.materials.map((m) => (
                    <div key={m.id} className="material-picker">
                      <label className="check">
                        <input
                          type="checkbox"
                          checked={value.matched_material_ids.includes(m.id)}
                          onChange={(e) =>
                            set(
                              "matched_material_ids",
                              e.target.checked
                                ? [...value.matched_material_ids, m.id]
                                : value.matched_material_ids.filter(
                                    (id) => id !== m.id,
                                  ),
                            )
                          }
                        />
                        {m.title}
                        <span className="muted">{label(m.type)}</span>
                      </label>
                      {value.matched_material_ids.includes(m.id) && (
                        <div className="material-excerpt">
                          <p>{m.resume_phrasing || m.body}</p>
                          <Button
                            type="button"
                            icon={Plus}
                            variant="small"
                            onClick={() =>
                              set(
                                "resume_draft",
                                [
                                  value.resume_draft,
                                  m.resume_phrasing || m.body,
                                ]
                                  .filter(Boolean)
                                  .join("\n\n"),
                              )
                            }
                          >
                            Add to draft
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {area("resume_draft", "Resume draft", 14)}
                {input("resume_file_path", "Local document reference", {
                  wide: true,
                  placeholder: "Optional file path or filename",
                })}
                {area("revision_notes", "Revision notes")}
                <label className="check wide">
                  <input
                    type="checkbox"
                    checked={value.is_final_version}
                    onChange={(e) => set("is_final_version", e.target.checked)}
                  />
                  Final version
                </label>
                <div className="wide inline-actions">
                  <Button
                    type="button"
                    icon={Download}
                    disabled={!value.resume_draft.trim()}
                    onClick={() =>
                      download(
                        value.resume_draft,
                        `offerflow-resume-${today()}.txt`,
                        "text/plain;charset=utf-8",
                      )
                    }
                  >
                    Export draft
                  </Button>
                  {exists && (
                    <Button
                      type="button"
                      icon={Copy}
                      onClick={async () => {
                        setBusy(true);
                        try {
                          await onSave("resumes", {
                            ...value,
                            ...meta(),
                            name: `${value.name} (copy)`,
                            is_final_version: false,
                          });
                          onClose();
                        } catch (e) {
                          setError(e.message);
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      Save as new version
                    </Button>
                  )}
                  <ExternalLink url={value.job_link} />
                </div>
              </>
            )}
            {kind === "reviews" && (
              <>
                <Field title="Week starting *">
                  <input
                    type="date"
                    required
                    value={value.week_start_date}
                    onChange={(e) => {
                      const week = e.target.value;
                      setValue((v) => ({
                        ...v,
                        week_start_date: week,
                        ...(week ? weeklyCounts(state.jobs, week) : {}),
                      }));
                    }}
                  />
                </Field>
                <div className="field">
                  <span>Tracker snapshot</span>
                  <Button
                    type="button"
                    onClick={() =>
                      setValue((v) => ({
                        ...v,
                        ...weeklyCounts(state.jobs, v.week_start_date),
                      }))
                    }
                  >
                    Refresh counts
                  </Button>
                </div>
                {[
                  "jobs_discovered",
                  "jobs_imported",
                  "jobs_applied",
                  "interviews_received",
                  "responses_received",
                  "rejections_received",
                  "offers_received",
                ].map((key) =>
                  input(key, label(key), {
                    type: "number",
                    min: 0,
                    step: 1,
                    required: true,
                  }),
                )}
                {area(
                  "top_active_opportunities",
                  "Top active opportunities",
                  3,
                )}
                {area("main_blockers", "Main blockers", 3)}
                {area(
                  "resume_or_strategy_changes",
                  "Strategy & resume changes",
                  3,
                )}
                {area("next_week_priorities", "Next week priorities", 4)}
                {area("energy_notes", "Energy & confidence", 3)}
                {area("freeform_reflection", "Reflection", 5)}
              </>
            )}
          </div>
        </fieldset>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <span className="muted">
            {dirty
              ? "Unsaved changes"
              : exists
                ? "Saved on this device"
                : "New record"}
          </span>
          <Button type="button" onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button icon={Save} variant="primary" disabled={busy}>
            {busy ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
