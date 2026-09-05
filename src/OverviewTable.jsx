import { Fragment, useEffect, useId, useRef, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { IconButton, Select } from "./components";
import {
  MATERIAL_STATUSES,
  newJob,
  PRIORITIES,
  STATUSES,
  upsert,
} from "./model";

const columns = [
  { key: "company", title: "Company", required: true },
  { key: "role", title: "Role", required: true },
  { key: "status", title: "Status", options: STATUSES },
  { key: "deadline", title: "Deadline", type: "date" },
  { key: "job_link", title: "Job link", type: "url" },
  { key: "notes", title: "Notes" },
  { key: "open_date", title: "Open date", type: "date" },
  { key: "priority", title: "Priority", options: PRIORITIES },
  { key: "location", title: "Location" },
  { key: "role_category", title: "Role category" },
  { key: "next_action", title: "Next action" },
  { key: "source", title: "Source" },
  { key: "materials_status", title: "Materials", options: MATERIAL_STATUSES },
];

export default function OverviewTable({ jobs, mutate, notify }) {
  const save = async (draft, baseline, isNew) => {
    const next = await mutate((state) => {
      if (!isNew) {
        const current = state.jobs.find((job) => job.id === draft.id);
        if (!current || current.updated_at !== baseline.updated_at) {
          throw new Error(
            "This opportunity changed elsewhere. Cancel your edits to reload the latest version.",
          );
        }
      }
      // Creation time reflects the save, not when the empty entry row appeared.
      return upsert(
        state,
        "jobs",
        isNew
          ? newJob({
              ...draft,
              created_at: new Date().toISOString(),
              events: [{ status: draft.status, at: new Date().toISOString() }],
            })
          : draft,
      );
    });
    notify(isNew ? "Opportunity added" : "Opportunity updated");
    return next.jobs.find((job) => job.id === draft.id);
  };

  return (
    <section
      className="overview-opportunities"
      aria-labelledby="overview-table-title"
    >
      <div className="section-heading">
        <h2 id="overview-table-title">
          Opportunities <span className="count">{jobs.length}</span>
        </h2>
      </div>
      <div className="table-wrap overview-table-wrap">
        <table className="overview-table" aria-label="Editable opportunities">
          <thead>
            <tr>
              <th scope="col" className="overview-row-number">
                #
              </th>
              {columns.map((column) => (
                <th key={column.key} scope="col">
                  {column.title}
                  {column.required ? " *" : ""}
                </th>
              ))}
              <th scope="col" className="overview-row-actions">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <OpportunityRow onSave={save} />
            {[...jobs]
              .sort((a, b) => b.created_at.localeCompare(a.created_at))
              .map((job, index) => (
                <OpportunityRow
                  key={job.id}
                  job={job}
                  number={index + 1}
                  onSave={save}
                />
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function OpportunityRow({ job, number, onSave }) {
  const [baseline, setBaseline] = useState(() => job || newJob());
  const [draft, setDraft] = useState(baseline);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const formId = useId();
  const errorId = useId();
  const companyInput = useRef(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  const isNew = !job;
  const rowName = isNew ? "new opportunity" : job.company;

  useEffect(() => {
    if (job && !dirty) {
      setBaseline(job);
      setDraft(job);
    }
  }, [job, dirty]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const cancel = () => {
    const reset = job || newJob();
    setDraft(reset);
    setBaseline(reset);
    setError("");
  };
  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const saved = await onSave(draft, baseline, isNew);
      const reset = isNew ? newJob() : saved;
      setBaseline(reset);
      setDraft(reset);
      if (isNew) requestAnimationFrame(() => companyInput.current?.focus());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Fragment>
      <tr
        className={`${isNew ? "overview-new-row" : ""} ${dirty ? "overview-dirty-row" : ""}`}
        aria-label={isNew ? "New opportunity" : `Opportunity ${job.company}`}
      >
        <td className="overview-row-number">{isNew ? "+" : number}</td>
        {columns.map((column) => {
          const props = {
            form: formId,
            "aria-label": `${column.title} for ${rowName}`,
            "aria-describedby": error ? errorId : undefined,
            value: draft[column.key],
            disabled: busy,
            onChange: (event) => {
              setDraft((current) => ({
                ...current,
                [column.key]: event.target.value,
              }));
              setError("");
            },
          };
          return (
            <td key={column.key}>
              {column.options ? (
                <Select {...props} options={column.options} />
              ) : (
                <input
                  {...props}
                  ref={column.key === "company" ? companyInput : undefined}
                  data-new-company={
                    isNew && column.key === "company" ? true : undefined
                  }
                  type={column.type || "text"}
                  required={column.required}
                  min={
                    column.key === "deadline"
                      ? draft.open_date || undefined
                      : undefined
                  }
                  max={
                    column.key === "open_date"
                      ? draft.deadline || undefined
                      : undefined
                  }
                  placeholder={
                    isNew
                      ? column.type === "url"
                        ? "https://"
                        : column.title
                      : undefined
                  }
                />
              )}
            </td>
          );
        })}
        <td className="overview-row-actions">
          <form id={formId} onSubmit={submit} aria-label={`Save ${rowName}`}>
            <IconButton
              icon={Check}
              title={`Save ${rowName}`}
              type="submit"
              disabled={busy || (!isNew && !dirty)}
            />
            <IconButton
              icon={RotateCcw}
              title={`Cancel ${rowName}`}
              onClick={cancel}
              disabled={busy || (!dirty && !error)}
            />
          </form>
        </td>
      </tr>
      {error && (
        <tr className="overview-error-row">
          <td colSpan={columns.length + 2}>
            <p id={errorId} role="alert">
              {error}
            </p>
          </td>
        </tr>
      )}
    </Fragment>
  );
}
