import { useMemo, useState } from "react";
import {
  Upload,
  ClipboardPaste,
  FileSpreadsheet,
  ArrowRight,
  Check,
  RotateCcw,
  Save,
  AlertCircle,
  Download,
} from "lucide-react";
import { Button, Field, Select, Empty } from "./components";
import {
  IMPORT_FIELDS,
  parseDelimited,
  parseExcel,
  parseJobText,
  tableFromRows,
  guessMapping,
  previewRows,
  commitImport,
} from "./importer";
import { download, label } from "./model";

export default function ImportJobs({ state, mutate, notify, openTracker }) {
  const [method, setMethod] = useState("file");
  const [paste, setPaste] = useState("");
  const [headers, setHeaders] = useState(true);
  const [source, setSource] = useState("");
  const [table, setTable] = useState(null);
  const [rawRows, setRawRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [rules, setRules] = useState(state.preferences);
  const [selected, setSelected] = useState(new Set());
  const [sheets, setSheets] = useState([]);
  const [sheet, setSheet] = useState("0");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState("");
  const [done, setDone] = useState(0);
  const preview = useMemo(
    () => (table ? previewRows(table, mapping, state.jobs, rules, source) : []),
    [table, mapping, state.jobs, rules, source],
  );
  const chosen = preview.filter(
    (r) => selected.has(r.index) && !r.warnings.length,
  );
  const duplicateCount = chosen.filter((r) => r.duplicate).length;
  const setParsed = (next, name = source) => {
    if (!next.rows.length)
      throw new Error("The table has headers but no data rows.");
    const map = guessMapping(next.headers, state.mapping);
    const rows = previewRows(next, map, state.jobs, rules, name);
    setTable(next);
    setMapping(map);
    setDone(0);
    setSelected(
      new Set(
        rows
          .filter(
            (r) =>
              !r.duplicate &&
              !r.warnings.length &&
              r.screening === "Recommended",
          )
          .map((r) => r.index),
      ),
    );
  };
  const parse = async () => {
    setError("");
    try {
      if (method === "text") setParsed(parseJobText(paste));
      else {
        const rows = parseDelimited(paste, false).rows;
        setRawRows(rows);
        setParsed(tableFromRows(rows, headers));
      }
    } catch (e) {
      setTable(null);
      setError(e.message);
    }
  };
  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    setError("");
    setTable(null);
    setDone(0);
    setSheets([]);
    setFileName(file.name);
    try {
      if (file.size > 10 * 1024 * 1024)
        throw new Error("Choose a file smaller than 10 MB.");
      if (/\.xlsx$/i.test(file.name)) {
        const found = await parseExcel(file);
        if (!found.length) throw new Error("No populated worksheets found.");
        setSheets(found);
        setSheet("0");
        setRawRows(found[0].rows);
        setParsed(tableFromRows(found[0].rows, headers), source || file.name);
      } else if (/\.(csv|tsv|txt)$/i.test(file.name)) {
        const rows = parseDelimited(await file.text(), false).rows;
        setRawRows(rows);
        setParsed(tableFromRows(rows, headers), source || file.name);
      } else
        throw new Error(
          "Use .csv, .tsv, or .xlsx. Save older .xls files as .xlsx first.",
        );
      if (!source) setSource(file.name);
    } catch (e) {
      setError(e.message || "Could not read this file.");
    } finally {
      setBusy(false);
    }
  };
  const savePreferences = async () => {
    try {
      await mutate((s) => ({
        ...s,
        preferences: rules,
        mapping: table
          ? Object.fromEntries(
              IMPORT_FIELDS.filter((f) => mapping[f] !== "").map((f) => [
                f,
                table.headers[Number(mapping[f])],
              ]),
            )
          : s.mapping,
      }));
      notify("Import preferences saved");
    } catch (e) {
      setError(e.message);
    }
  };
  const confirm = async () => {
    if (
      duplicateCount &&
      !window.confirm(
        `Import ${duplicateCount} possible duplicate${duplicateCount === 1 ? "" : "s"} as new records?`,
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      const alreadyReviewed = new Set(
        chosen.filter((r) => r.duplicate).map((r) => r.index),
      );
      await mutate((s) => {
        const fresh = previewRows(table, mapping, s.jobs, rules, source);
        const entries = fresh.filter((r) => selected.has(r.index));
        if (entries.some((r) => r.warnings.length))
          throw new Error("Resolve invalid rows before importing.");
        if (entries.some((r) => r.duplicate && !alreadyReviewed.has(r.index)))
          throw new Error(
            "The tracker changed. Review the updated duplicate warnings and try again.",
          );
        return commitImport(
          s,
          entries,
          source,
          method === "file"
            ? /\.xlsx$/i.test(fileName)
              ? "excel"
              : "csv"
            : method === "text"
              ? "paste_text"
              : "paste_table",
        );
      });
      setDone(chosen.length);
      setTable(null);
      setRawRows([]);
      setSheets([]);
      setPaste("");
      setSelected(new Set());
      notify(`${chosen.length} opportunities added`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">JOB PIPELINE</div>
          <h1>Import opportunities</h1>
        </div>
        <Button
          icon={Download}
          onClick={() =>
            download(
              "Company,Role,Location,Open Date,Deadline,Job Link,Notes\nExample Studio,Product Analyst,Shanghai,,,https://example.com/careers,Fictional example\n",
              "offerflow-import-template.csv",
              "text/csv;charset=utf-8",
            )
          }
        >
          CSV template
        </Button>
      </div>
      <div className="step-strip">
        <span className={!table && !done ? "current" : ""}>
          <b>1</b> Add source
        </span>
        <span className={table ? "current" : ""}>
          <b>2</b> Review & screen
        </span>
        <span className={done ? "current" : ""}>
          <b>3</b> Add to tracker
        </span>
      </div>
      {!!done && (
        <div className="success-banner">
          <Check size={20} />
          <div>
            <strong>{done} opportunities added</strong>
            <p>Status: To Apply</p>
          </div>
          <Button icon={ArrowRight} onClick={openTracker}>
            Open tracker
          </Button>
        </div>
      )}
      <div className="import-input">
        <div className="tabs" role="tablist" aria-label="Import method">
          {[
            ["file", "Upload file", Upload],
            ["table", "Paste table", ClipboardPaste],
            ["text", "Paste text", ClipboardPaste],
          ].map(([id, name, Icon]) => (
            <button
              role="tab"
              aria-selected={method === id}
              key={id}
              onClick={() => {
                if (id === method) return;
                setMethod(id);
                setError("");
                setTable(null);
                setRawRows([]);
                setSheets([]);
                setDone(0);
                setSelected(new Set());
              }}
              disabled={busy}
            >
              <Icon size={16} />
              {name}
            </button>
          ))}
        </div>
        <div className="source-row">
          <Field title="Source name">
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. September campus openings"
            />
          </Field>
          {method !== "text" && (
            <label className="check">
              <input
                type="checkbox"
                checked={headers}
                disabled={busy}
                onChange={(e) => {
                  setHeaders(e.target.checked);
                  if (!rawRows.length) return;
                  try {
                    setParsed(tableFromRows(rawRows, e.target.checked));
                    setError("");
                  } catch (err) {
                    setTable(null);
                    setError(err.message);
                  }
                }}
              />
              First row contains column names
            </label>
          )}
        </div>
        {method === "file" ? (
          <label
            className={`dropzone ${busy ? "disabled" : ""}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (!busy) upload(e.dataTransfer.files[0]);
            }}
          >
            <input
              type="file"
              aria-label="Upload job file"
              accept=".csv,.tsv,.xlsx"
              disabled={busy}
              onChange={(e) => {
                upload(e.target.files[0]);
                e.target.value = "";
              }}
            />
            <FileSpreadsheet size={32} strokeWidth={1.3} />
            <strong>
              {busy ? "Reading file..." : "Choose a file or drop it here"}
            </strong>
            <span>CSV, TSV, XLSX / Up to 10 MB</span>
          </label>
        ) : (
          <>
            <textarea
              className="paste-input"
              aria-label="Job source content"
              rows={7}
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              placeholder={
                method === "text"
                  ? "Company: Example Studio\nRole: Product Analyst\nLocation: Shanghai\nLink: https://example.com/careers"
                  : "Company\tRole\tLocation\tDeadline\nExample Studio\tProduct Analyst\tShanghai\t2026-12-31"
              }
            />
            <Button
              icon={ArrowRight}
              variant="primary"
              disabled={!paste.trim() || busy}
              onClick={parse}
            >
              Preview rows
            </Button>
          </>
        )}
        {!!sheets.length && (
          <div className="sheet-picker">
            <Field title="Worksheet">
              <Select
                value={sheet}
                options={sheets.map((s, i) => ({
                  value: String(i),
                  label: s.name,
                }))}
                onChange={(e) => {
                  setSheet(e.target.value);
                  try {
                    setRawRows(sheets[Number(e.target.value)].rows);
                    setParsed(
                      tableFromRows(
                        sheets[Number(e.target.value)].rows,
                        headers,
                      ),
                    );
                    setError("");
                  } catch (err) {
                    setTable(null);
                    setError(err.message);
                  }
                }}
              />
            </Field>
          </div>
        )}
      </div>
      {error && (
        <div role="alert" className="error-banner">
          <AlertCircle size={18} />
          {error}
        </div>
      )}
      {table && (
        <>
          <section className="import-section">
            <div className="section-heading">
              <h2>Column mapping</h2>
              <span className="muted">
                {table.rows.length} rows / {table.headers.length} columns
              </span>
            </div>
            <div className="mapping-grid">
              {IMPORT_FIELDS.map((field) => (
                <Field
                  title={`${label(field)}${["company", "role"].includes(field) ? " *" : ""}`}
                  key={field}
                >
                  <Select
                    aria-label={`Map ${label(field)}`}
                    value={mapping[field]}
                    empty="Not mapped"
                    options={table.headers.map((h, i) => ({
                      value: String(i),
                      label: `${i + 1}. ${h}`,
                    }))}
                    onChange={(e) => {
                      setMapping((m) => ({ ...m, [field]: e.target.value }));
                      setSelected(new Set());
                    }}
                  />
                </Field>
              ))}
            </div>
          </section>
          <section className="import-section">
            <div className="section-heading">
              <h2>Screening preferences</h2>
              <Button variant="small" icon={Save} onClick={savePreferences}>
                Save preferences & mapping
              </Button>
            </div>
            <div className="mapping-grid">
              {[
                ["include", "Include keywords"],
                ["exclude", "Exclude keywords"],
                ["locations", "Target locations"],
                ["categories", "Role categories"],
                ["company_types", "Company type keywords"],
                ["eligibility", "Eligibility keywords"],
              ].map(([key, title]) => (
                <Field title={title} key={key}>
                  <input
                    value={rules[key]}
                    placeholder="Comma-separated"
                    onChange={(e) =>
                      setRules((r) => ({ ...r, [key]: e.target.value }))
                    }
                  />
                </Field>
              ))}
            </div>
            <label className="check">
              <input
                type="checkbox"
                checked={rules.openOnly}
                onChange={(e) =>
                  setRules((r) => ({ ...r, openOnly: e.target.checked }))
                }
              />
              Flag expired deadlines
            </label>
          </section>
          <section className="import-section">
            <div className="section-heading">
              <h2>
                Review rows <span className="count">{preview.length}</span>
              </h2>
              <div className="inline-actions">
                <Button
                  variant="small"
                  icon={Check}
                  onClick={() =>
                    setSelected(
                      new Set(
                        preview
                          .filter(
                            (r) =>
                              !r.warnings.length &&
                              !r.duplicate &&
                              r.screening === "Recommended",
                          )
                          .map((r) => r.index),
                      ),
                    )
                  }
                >
                  Select recommended
                </Button>
                <Button
                  variant="small"
                  icon={RotateCcw}
                  onClick={() => setSelected(new Set())}
                >
                  Clear selection
                </Button>
              </div>
            </div>
            <div className="table-wrap">
              <table className="preview-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        aria-label="Select all valid rows"
                        checked={
                          preview.filter((r) => !r.warnings.length).length >
                            0 &&
                          preview
                            .filter((r) => !r.warnings.length)
                            .every((r) => selected.has(r.index))
                        }
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? new Set(
                                  preview
                                    .filter((r) => !r.warnings.length)
                                    .map((r) => r.index),
                                )
                              : new Set(),
                          )
                        }
                      />
                    </th>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Location</th>
                    <th>Deadline</th>
                    <th>Screening</th>
                    <th>Validation</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((r) => (
                    <tr
                      key={r.index}
                      className={r.warnings.length ? "invalid-row" : ""}
                    >
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Select row ${r.index + 1}`}
                          checked={selected.has(r.index) && !r.warnings.length}
                          disabled={!!r.warnings.length}
                          onChange={(e) =>
                            setSelected((s) => {
                              const next = new Set(s);
                              e.target.checked
                                ? next.add(r.index)
                                : next.delete(r.index);
                              return next;
                            })
                          }
                        />
                      </td>
                      <td>{r.job.company || "-"}</td>
                      <td>{r.job.role || "-"}</td>
                      <td>{r.job.location || "-"}</td>
                      <td>{r.job.deadline || "-"}</td>
                      <td>
                        <span
                          className={`badge ${r.screening === "Recommended" ? "status-offer" : "status-assessment"}`}
                        >
                          {r.screening}
                        </span>
                      </td>
                      <td>
                        {r.warnings.length ? (
                          <span className="error-text">
                            {r.warnings.join("; ")}
                          </span>
                        ) : r.duplicate ? (
                          <span className="warning-text">
                            Possible duplicate
                          </span>
                        ) : (
                          <span className="muted">Ready</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="import-footer">
              <span>
                {chosen.length} selected / {preview.length - chosen.length}{" "}
                skipped
                {duplicateCount
                  ? ` / ${duplicateCount} possible duplicates`
                  : ""}
              </span>
              <Button
                variant="primary"
                icon={ArrowRight}
                disabled={!chosen.length || busy}
                onClick={confirm}
              >
                {busy
                  ? "Importing..."
                  : `Import ${chosen.length} opportunities`}
              </Button>
            </div>
          </section>
        </>
      )}
      {!table && !done && state.imports.length > 0 && (
        <section className="import-section">
          <h2>Recent imports</h2>
          <div className="simple-list">
            {state.imports
              .slice(-5)
              .reverse()
              .map((i) => (
                <div key={i.id}>
                  <FileSpreadsheet size={18} />
                  <strong>{i.source || "Pasted content"}</strong>
                  <span className="muted">
                    {i.count} opportunities /{" "}
                    {new Date(i.created_at).toLocaleDateString("en-US")}
                  </span>
                </div>
              ))}
          </div>
        </section>
      )}
    </>
  );
}
