import { useEffect, useRef, useState } from "react";
import { liveQuery } from "dexie";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  Plus,
  Search,
  SlidersHorizontal,
  Table2,
  LayoutDashboard,
  FileInput,
  BookOpen,
  Files,
  CalendarDays,
  Settings2,
  HardDrive,
  PanelLeftClose,
  Menu,
  Check,
  X,
  Archive,
  ArchiveRestore,
  Trash2,
  Pencil,
  BriefcaseBusiness,
  Clock3,
  Send,
  MessageSquare,
  CircleCheck,
  AlertCircle,
  Download,
  RefreshCw,
  CircleDot,
  ShieldCheck,
  FlaskConical,
  ChevronRight,
} from "lucide-react";
import { readState, changeState } from "./storage";
import {
  label,
  STATUSES,
  PRIORITIES,
  MATERIAL_TYPES,
  formatDate,
  dayDistance,
  newJob,
  newMaterial,
  newResume,
  newReview,
  upsert,
  removeEntry,
  download,
  today,
  monday,
  weeklyCounts,
  parseBackup,
  blankState,
} from "./model";
import { jobsCsv } from "./importer";
import { demoState } from "./demo";
import {
  Button,
  IconButton,
  Field,
  Select,
  SearchBox,
  StatusBadge,
  ExternalLink,
  Empty,
  Confirm,
} from "./components";
import Editor from "./editors";
import ImportJobs from "./ImportJobs";
import OverviewTable from "./OverviewTable";

const NAV = [
  ["tracker", "Applications", Table2],
  ["dashboard", "Overview", LayoutDashboard],
  ["import", "Import jobs", FileInput],
  ["materials", "Personal materials", BookOpen],
  ["resumes", "Resume workspaces", Files],
  ["reviews", "Weekly review", CalendarDays],
];
const CLOSED = ["offer", "rejected", "abandoned"];
const meaningfulError = (e) =>
  e.name === "ZodError"
    ? "Some fields are missing or invalid. Check required fields, dates, and links."
    : e.message || "Could not save. Please try again.";

function Deadline({ job }) {
  if (!job.deadline) return <span className="muted">No deadline</span>;
  const days = dayDistance(job.deadline);
  const pending =
    !job.is_archived &&
    ["to_review", "to_apply", "resume_in_progress"].includes(job.status);
  return (
    <div className={`deadline ${pending && days <= 3 ? "urgent" : ""}`}>
      <span>{formatDate(job.deadline)}</span>
      {pending && days <= 7 && (
        <small>
          {days < 0
            ? `${Math.abs(days)}d overdue`
            : days === 0
              ? "Due today"
              : `${days}d left`}
        </small>
      )}
    </div>
  );
}

export default function App() {
  const [state, setState] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [page, setPage] = useState("tracker");
  const [sidebar, setSidebar] = useState(false);
  const [editor, setEditor] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [toast, setToast] = useState(null);
  const [view, setView] = useState("active");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("deadline");
  const [filters, setFilters] = useState(false);
  const [location, setLocation] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [dueOnly, setDueOnly] = useState(false);
  const [writing, setWriting] = useState(0);
  const [importKey, setImportKey] = useState(0);
  const overviewTable = useRef(null);
  const [overviewOpened, setOverviewOpened] = useState(false);
  useEffect(() => {
    const subscription = liveQuery(readState).subscribe({
      next: (value) => {
        setState(value);
        setLoadError("");
      },
      error: (error) => setLoadError(error.message),
    });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  const notify = (message, error = false) => setToast({ message, error });
  const mutate = async (transform) => {
    setWriting((n) => n + 1);
    try {
      const next = await changeState(transform);
      setState(next);
      return next;
    } catch (e) {
      throw new Error(meaningfulError(e));
    } finally {
      setWriting((n) => n - 1);
    }
  };
  const perform = async (transform, message) => {
    try {
      await mutate(transform);
      if (message) notify(message);
    } catch (e) {
      notify(e.message, true);
    }
  };
  const navigate = (next) => {
    if (next === "dashboard") setOverviewOpened(true);
    setPage(next);
    setSidebar(false);
    setQuery("");
  };
  const open = (kind, initial) => setEditor({ kind, initial });
  const save = async (kind, value) => {
    await mutate((s) => upsert(s, kind, value));
    notify("Changes saved");
  };
  const deleteItem = (collection, entry, name) =>
    setConfirmation({
      title: `Delete ${name}?`,
      body: "This record will be removed from this device. Linked records will be kept. This cannot be undone.",
      action: "Delete record",
      onConfirm: () => mutate((s) => removeEntry(s, collection, entry.id)),
    });
  const filterTracker = (nextStatus = "", due = false) => {
    navigate("tracker");
    setView("active");
    setStatus(nextStatus);
    setPriority("");
    setCategory("");
    setLocation("");
    setSourceFilter("");
    setDueOnly(due);
  };
  if (loadError)
    return (
      <div className="boot">
        <AlertCircle size={30} />
        <h1>Could not open local workspace</h1>
        <p>{loadError}</p>
        <p>
          Keep existing browser data intact. Try opening OfferFlow in a regular
          browser window.
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  if (!state)
    return (
      <div className="boot">
        <div className="brand-mark">
          <ArrowUpRight />
        </div>
        <h1>OfferFlow</h1>
        <p>Opening your workspace...</p>
      </div>
    );
  const active = state.jobs.filter((j) => !j.is_archived);
  const pending = active.filter((j) =>
    ["to_apply", "to_review", "resume_in_progress"].includes(j.status),
  );
  const due = pending.filter(
    (j) =>
      j.deadline &&
      dayDistance(j.deadline) >= 0 &&
      dayDistance(j.deadline) <= 7,
  );
  const interviews = active.filter((j) => j.status === "interviewing");
  const offers = active.filter((j) => j.status === "offer");
  const stats = [
    {
      name: "Active opportunities",
      value: active.filter((j) => !CLOSED.includes(j.status)).length,
      icon: BriefcaseBusiness,
      color: "green",
      action: () => {
        filterTracker();
        setView("open");
      },
    },
    {
      name: "Awaiting application",
      value: active.filter((j) => j.status === "to_apply").length,
      icon: Send,
      color: "blue",
      action: () => filterTracker("to_apply"),
    },
    {
      name: "Interviews",
      value: interviews.length,
      icon: MessageSquare,
      color: "pink",
      action: () => filterTracker("interviewing"),
    },
    {
      name: "Due this week",
      value: due.length,
      icon: Clock3,
      color: "amber",
      action: () => filterTracker("", true),
    },
  ];
  const addCurrent = () => {
    if (page === "materials") open("materials", newMaterial());
    else if (page === "resumes") open("resumes", newResume());
    else if (page === "reviews") {
      const existing = state.reviews.find(
        (r) => r.week_start_date === monday(),
      );
      open("reviews", existing || newReview(state.jobs));
    } else if (page === "dashboard") {
      const cell = overviewTable.current?.querySelector("[data-new-company]");
      cell?.focus();
      cell?.scrollIntoView({ block: "nearest", inline: "nearest" });
    } else open("jobs", newJob());
  };
  const allRows = state.jobs
    .filter(
      (j) =>
        (view === "archived" ? j.is_archived : !j.is_archived) &&
        (view !== "open" || !CLOSED.includes(j.status)) &&
        (!status || j.status === status) &&
        (!priority || j.priority === priority) &&
        (!category || j.role_category === category) &&
        (!location || j.location === location) &&
        (!sourceFilter || j.source === sourceFilter) &&
        (!dueOnly || due.some((d) => d.id === j.id)) &&
        `${j.company} ${j.role} ${j.location} ${j.notes} ${j.next_action} ${j.source}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "updated"
        ? b.updated_at.localeCompare(a.updated_at)
        : sort === "company"
          ? a.company.localeCompare(b.company)
          : (a.deadline || "9999").localeCompare(b.deadline || "9999") ||
            b.updated_at.localeCompare(a.updated_at),
    );
  const categories = [
    ...new Set(state.jobs.map((j) => j.role_category).filter(Boolean)),
  ];
  const restore = async (file) => {
    if (!file) return;
    try {
      if (file.size > 30 * 1024 * 1024)
        throw new Error("Backup exceeds 30 MB.");
      const restored = parseBackup(await file.text());
      setConfirmation({
        title: "Restore this backup?",
        body: `Replace this device's workspace with ${restored.jobs.length} jobs, ${restored.materials.length} materials, ${restored.resumes.length} resumes, and ${restored.reviews.length} reviews. Export your current backup first if needed.`,
        action: "Replace & restore",
        onConfirm: async () => {
          await mutate(() => restored);
          setImportKey((key) => key + 1);
          notify("Backup restored");
        },
      });
    } catch (e) {
      notify(
        e.name === "ZodError"
          ? "Invalid or unsupported backup. No data was changed."
          : e.message,
        true,
      );
    }
  };
  return (
    <div className="app-shell">
      {sidebar && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebar(false)}
        />
      )}
      <aside className={`sidebar ${sidebar ? "is-open" : ""}`}>
        <a
          href="#"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            navigate("tracker");
          }}
        >
          <span className="brand-mark">
            <ArrowUpRight size={22} />
          </span>
          <span>
            OfferFlow<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="workspace-label">PERSONAL WORKSPACE</div>
        <nav>
          {NAV.map(([key, name, Icon], index) => (
            <button
              className={`${page === key ? "selected" : ""} ${index === 3 ? "nav-divider" : ""}`}
              key={key}
              aria-label={name}
              aria-current={page === key ? "page" : undefined}
              onClick={() => navigate(key)}
            >
              <Icon size={18} strokeWidth={1.7} />
              <span>{name}</span>
              {key === "tracker" && (
                <span className="nav-count">{active.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className={page === "settings" ? "selected" : ""}
            onClick={() => navigate("settings")}
          >
            <Settings2 size={18} />
            Settings & data
          </button>
          <div className="local-status">
            <span className="local-dot" />
            <div>
              <strong>Local workspace</strong>
              <span>Private. On your device.</span>
            </div>
            <HardDrive size={16} />
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <span className="mobile-menu">
              <IconButton
                title="Open navigation"
                icon={Menu}
                onClick={() => setSidebar(true)}
              />
            </span>
            <span className="muted">Workspace</span>
            <ChevronRight size={14} />
            <span>
              {NAV.find((n) => n[0] === page)?.[1] || "Settings & data"}
            </span>
          </div>
          <div className="topbar-right">
            <span className="save-indicator">
              <span className="local-dot" />
              {writing ? "Saving..." : "Saved locally"}
            </span>
            <span className="date-label">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </header>
        <main>
          {["tracker", "dashboard"].includes(page) && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">YOUR NEXT CHAPTER</div>
                  <h1>
                    {page === "tracker" ? "Applications" : "Your overview"}
                  </h1>
                </div>
                <div className="inline-actions">
                  <Button
                    icon={ArrowUpFromLine}
                    onClick={() => navigate("import")}
                  >
                    Import jobs
                  </Button>
                  <Button icon={Plus} variant="primary" onClick={addCurrent}>
                    {page === "dashboard" ? "Add row" : "Add opportunity"}
                  </Button>
                </div>
              </div>
              <div className="stats-strip">
                {stats.map(({ name, value, icon: Icon, color, action }) => (
                  <button key={name} className="stat" onClick={action}>
                    <div>
                      <span>{name}</span>
                      <strong>{value.toString().padStart(2, "0")}</strong>
                    </div>
                    <span className={`stat-icon ${color}`}>
                      <Icon size={20} strokeWidth={1.6} />
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
          {page === "tracker" && (
            <>
              <div className="view-tabs">
                <div className="tabs">
                  <button
                    className={
                      view === "active" && !status && !dueOnly ? "active" : ""
                    }
                    onClick={() => filterTracker()}
                  >
                    All applications{" "}
                    <span className="count">{active.length}</span>
                  </button>
                  <button
                    className={status === "to_apply" ? "active" : ""}
                    onClick={() => filterTracker("to_apply")}
                  >
                    To apply
                  </button>
                  <button
                    className={status === "interviewing" ? "active" : ""}
                    onClick={() => filterTracker("interviewing")}
                  >
                    Interviewing
                  </button>
                  <button
                    className={status === "offer" ? "active" : ""}
                    onClick={() => filterTracker("offer")}
                  >
                    Offers{" "}
                    {offers.length > 0 && (
                      <span className="count">{offers.length}</span>
                    )}
                  </button>
                  <button
                    className={view === "archived" ? "active" : ""}
                    onClick={() => {
                      filterTracker();
                      setView("archived");
                    }}
                  >
                    Archived
                  </button>
                </div>
                <IconButton
                  icon={Download}
                  title="Export filtered applications as CSV"
                  onClick={() =>
                    download(
                      jobsCsv(allRows),
                      `offerflow-applications-${today()}.csv`,
                      "text/csv;charset=utf-8",
                    )
                  }
                />
              </div>
              <div className="toolbar">
                <SearchBox
                  value={query}
                  onChange={setQuery}
                  placeholder="Search company, role, or notes..."
                />
                <div className="toolbar-controls">
                  <Select
                    aria-label="Filter status"
                    empty="All statuses"
                    options={STATUSES}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                  <Button
                    icon={SlidersHorizontal}
                    className={filters ? "is-active" : ""}
                    onClick={() => setFilters(!filters)}
                  >
                    Filters
                  </Button>
                  <Select
                    aria-label="Sort applications"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    options={[
                      { value: "deadline", label: "Deadline: soonest" },
                      { value: "updated", label: "Recently updated" },
                      { value: "company", label: "Company: A to Z" },
                    ]}
                  />
                </div>
              </div>
              {filters && (
                <div className="filter-row">
                  <Select
                    aria-label="Filter priority"
                    empty="All priorities"
                    options={PRIORITIES}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  />
                  <Select
                    aria-label="Filter category"
                    empty="All categories"
                    options={categories.map((v) => ({ value: v, label: v }))}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  <Select
                    aria-label="Filter location"
                    empty="All locations"
                    options={[
                      ...new Set(
                        state.jobs.map((j) => j.location).filter(Boolean),
                      ),
                    ].map((v) => ({ value: v, label: v }))}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <Select
                    aria-label="Filter source"
                    empty="All sources"
                    options={[
                      ...new Set(
                        state.jobs.map((j) => j.source).filter(Boolean),
                      ),
                    ].map((v) => ({ value: v, label: v }))}
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                  />
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={dueOnly}
                      onChange={(e) => setDueOnly(e.target.checked)}
                    />
                    Due in 7 days
                  </label>
                </div>
              )}
              {(dueOnly ||
                view === "open" ||
                priority ||
                category ||
                location ||
                sourceFilter) && (
                <div className="filter-summary">
                  <span>
                    {dueOnly
                      ? "Due in the next 7 days"
                      : view === "open"
                        ? "Active opportunities"
                        : "Filters applied"}
                  </span>
                  <button onClick={() => filterTracker()}>
                    Clear filters <X size={12} />
                  </button>
                </div>
              )}
              <div className="table-wrap tracker-table-wrap">
                <table className="tracker-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Company / Role</th>
                      <th>Deadline</th>
                      <th>Next action</th>
                      <th>Location</th>
                      <th>Category</th>
                      <th>Open date</th>
                      <th>Source</th>
                      <th>Link</th>
                      <th>Materials</th>
                      <th>Notes</th>
                      <th>Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRows.map((job) => (
                      <tr key={job.id}>
                        <td>
                          <select
                            aria-label={`Status for ${job.company}`}
                            className={`status-select status-${job.status}`}
                            value={job.status}
                            disabled={!!writing}
                            onChange={(e) => {
                              const nextStatus = e.target.value;
                              perform((s) => {
                                const current = s.jobs.find(
                                  (j) => j.id === job.id,
                                );
                                return current
                                  ? upsert(s, "jobs", {
                                      ...current,
                                      status: nextStatus,
                                    })
                                  : s;
                              }, "Status updated");
                            }}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {label(s)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            className={`priority-select priority-${job.priority}`}
                            aria-label={`Priority for ${job.company}`}
                            value={job.priority}
                            disabled={!!writing}
                            onChange={(e) => {
                              const p = e.target.value;
                              perform((s) => {
                                const current = s.jobs.find(
                                  (j) => j.id === job.id,
                                );
                                return current
                                  ? upsert(s, "jobs", {
                                      ...current,
                                      priority: p,
                                    })
                                  : s;
                              });
                            }}
                          >
                            {PRIORITIES.map((p) => (
                              <option key={p} value={p}>
                                {label(p)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button
                            className="job-name"
                            onClick={() => open("jobs", job)}
                          >
                            <span className="company-monogram">
                              {job.company.slice(0, 1)}
                            </span>
                            <span>
                              <strong>{job.company}</strong>
                              <span>{job.role}</span>
                            </span>
                          </button>
                        </td>
                        <td>
                          <Deadline job={job} />
                        </td>
                        <td>
                          <button
                            className="cell-note"
                            onClick={() => open("jobs", job)}
                          >
                            {job.next_action || (
                              <span className="muted">Add next action</span>
                            )}
                          </button>
                        </td>
                        <td>{job.location || "-"}</td>
                        <td>{job.role_category || "-"}</td>
                        <td>
                          {job.open_date ? formatDate(job.open_date) : "-"}
                        </td>
                        <td>{job.source || "-"}</td>
                        <td>
                          <ExternalLink url={job.job_link} children="Listing" />
                        </td>
                        <td>{label(job.materials_status)}</td>
                        <td>
                          <button
                            className="cell-note"
                            onClick={() => open("jobs", job)}
                          >
                            {job.notes || "-"}
                          </button>
                        </td>
                        <td>{formatDate(job.updated_at)}</td>
                        <td>
                          <div className="row-actions">
                            <IconButton
                              icon={Pencil}
                              title={`Edit ${job.company}`}
                              onClick={() => open("jobs", job)}
                            />
                            <IconButton
                              icon={job.is_archived ? ArchiveRestore : Archive}
                              title={
                                job.is_archived
                                  ? `Unarchive ${job.company}`
                                  : `Archive ${job.company}`
                              }
                              onClick={() =>
                                perform(
                                  (s) => {
                                    const current = s.jobs.find(
                                      (j) => j.id === job.id,
                                    );
                                    return current
                                      ? upsert(s, "jobs", {
                                          ...current,
                                          is_archived: !current.is_archived,
                                        })
                                      : s;
                                  },
                                  job.is_archived
                                    ? "Opportunity restored"
                                    : "Opportunity archived",
                                )
                              }
                            />
                            <IconButton
                              icon={Trash2}
                              title={`Delete ${job.company}`}
                              onClick={() =>
                                deleteItem("jobs", job, "opportunity")
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!allRows.length && (
                  <Empty
                    icon={BriefcaseBusiness}
                    title={
                      state.jobs.length
                        ? "No matching opportunities"
                        : "Your next opportunity starts here"
                    }
                    action={
                      <div className="inline-actions">
                        <Button
                          icon={Plus}
                          variant="primary"
                          onClick={() => open("jobs", newJob())}
                        >
                          Add opportunity
                        </Button>
                        <Button
                          icon={ArrowUpFromLine}
                          onClick={() => navigate("import")}
                        >
                          Import jobs
                        </Button>
                      </div>
                    }
                  />
                )}
              </div>
              <div className="table-footer">
                <span>
                  {allRows.length}{" "}
                  {allRows.length === 1 ? "opportunity" : "opportunities"}
                  {view === "archived" ? " archived" : ""}
                </span>
                <span>
                  <ShieldCheck size={13} />
                  Only on this device
                </span>
              </div>
            </>
          )}
          {overviewOpened && (
            <div hidden={page !== "dashboard"} ref={overviewTable}>
              <OverviewTable
                key={importKey}
                jobs={active}
                mutate={mutate}
                notify={notify}
              />
              <section className="overview-pipeline">
                <div className="section-heading">
                  <h2>Pipeline</h2>
                  <span className="muted">{active.length} total</span>
                </div>
                <div className="pipeline">
                  {STATUSES.map((s) => {
                    const count = active.filter((j) => j.status === s).length;
                    return (
                      <button key={s} onClick={() => filterTracker(s)}>
                        <span>
                          <StatusBadge status={s} />
                          <strong>{count}</strong>
                        </span>
                        <div className="bar-track">
                          <i
                            className={`status-${s}`}
                            style={{
                              width: `${active.length ? (count / active.length) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          )}
          <div hidden={page !== "import"}>
            <ImportJobs
              key={importKey}
              state={state}
              mutate={mutate}
              notify={notify}
              openTracker={() => filterTracker("to_apply")}
            />
          </div>
          {["materials", "resumes", "reviews"].includes(page) && (
            <CollectionPage
              page={page}
              state={state}
              query={query}
              setQuery={setQuery}
              addCurrent={addCurrent}
              open={open}
              deleteItem={deleteItem}
            />
          )}
          {page === "settings" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">YOUR WORKSPACE</div>
                  <h1>Settings & data</h1>
                </div>
                <span className="version">v0.1.0</span>
              </div>
              <div className="settings-layout">
                <section className="settings-section">
                  <HardDrive size={23} />
                  <div>
                    <h2>Local storage</h2>
                    <p>
                      Your workspace is stored in this browser on this device.
                      Clearing site data or switching browsers will not preserve
                      it. Keep a backup before making changes.
                    </p>
                    <div className="storage-counts">
                      <span>
                        <strong>{state.jobs.length}</strong> opportunities
                      </span>
                      <span>
                        <strong>{state.materials.length}</strong> materials
                      </span>
                      <span>
                        <strong>{state.resumes.length}</strong> resumes
                      </span>
                      <span>
                        <strong>{state.reviews.length}</strong> reviews
                      </span>
                    </div>
                    <Button
                      icon={ShieldCheck}
                      onClick={async () => {
                        try {
                          const persisted =
                            await navigator.storage?.persist?.();
                          notify(
                            persisted
                              ? "Persistent storage enabled"
                              : "Browser did not grant persistent storage. Keep regular backups.",
                          );
                        } catch {
                          notify(
                            "Persistent storage is unavailable. Keep regular backups.",
                            true,
                          );
                        }
                      }}
                    >
                      Request persistent storage
                    </Button>
                  </div>
                </section>
                <section className="settings-section">
                  <Download size={23} />
                  <div>
                    <h2>Backup & restore</h2>
                    <p>
                      A backup includes your applications, materials, resume
                      drafts, reviews, and import preferences. Backup files
                      contain private information.
                    </p>
                    <div className="inline-actions">
                      <Button
                        icon={ArrowDownToLine}
                        variant="primary"
                        onClick={() =>
                          download(
                            JSON.stringify(
                              {
                                app: "OfferFlow",
                                exported_at: new Date().toISOString(),
                                data: state,
                              },
                              null,
                              2,
                            ),
                            `offerflow-backup-${today()}.json`,
                          )
                        }
                      >
                        Export full backup
                      </Button>
                      <label className="button file-button">
                        <ArrowUpFromLine size={16} />
                        Restore backup
                        <input
                          type="file"
                          aria-label="Restore backup"
                          accept=".json"
                          onChange={(e) => {
                            restore(e.target.files[0]);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      <Button
                        icon={Download}
                        onClick={() =>
                          download(
                            jobsCsv(state.jobs),
                            `offerflow-applications-${today()}.csv`,
                            "text/csv;charset=utf-8",
                          )
                        }
                      >
                        Export jobs CSV
                      </Button>
                    </div>
                  </div>
                </section>
                <section className="settings-section">
                  <FlaskConical size={23} />
                  <div>
                    <h2>Fictional demo workspace</h2>
                    <p>
                      Sample records are fictional. Available only in an empty
                      workspace.
                    </p>
                    <Button
                      disabled={
                        !!(
                          state.jobs.length ||
                          state.materials.length ||
                          state.resumes.length ||
                          state.reviews.length ||
                          state.imports.length
                        )
                      }
                      onClick={() =>
                        perform((s) => {
                          if (
                            s.jobs.length ||
                            s.materials.length ||
                            s.resumes.length ||
                            s.reviews.length ||
                            s.imports.length
                          )
                            throw new Error(
                              "The workspace is no longer empty.",
                            );
                          return demoState();
                        }, "Fictional demo loaded")
                      }
                    >
                      Load demo data
                    </Button>
                  </div>
                </section>
                <section className="settings-section danger-section">
                  <Trash2 size={23} />
                  <div>
                    <h2>Clear local workspace</h2>
                    <p>
                      Permanently remove all OfferFlow records from this
                      browser. Export a backup first.
                    </p>
                    <Button
                      variant="danger-outline"
                      onClick={() =>
                        setConfirmation({
                          title: "Clear all local data?",
                          body: "All applications, materials, resumes, reviews, and preferences in this browser will be deleted. This cannot be undone without a backup.",
                          action: "Delete all local data",
                          onConfirm: async () => {
                            await mutate(() => blankState());
                            setImportKey((key) => key + 1);
                            notify("Local workspace cleared");
                          },
                        })
                      }
                    >
                      Clear workspace
                    </Button>
                  </div>
                </section>
              </div>
            </>
          )}
        </main>
        <footer className="workspace-footer">
          <span>OfferFlow</span>
          <span>A little more clarity. One opportunity at a time.</span>
        </footer>
      </div>
      {editor && (
        <Editor
          key={editor.initial.id}
          {...editor}
          state={state}
          onSave={save}
          onClose={() => setEditor(null)}
          onResume={(job) =>
            setEditor({ kind: "resumes", initial: newResume(job) })
          }
        />
      )}
      {confirmation && (
        <Confirm
          {...confirmation}
          onClose={() => setConfirmation(null)}
          onConfirm={async () => {
            try {
              await confirmation.onConfirm();
            } catch (e) {
              notify(meaningfulError(e), true);
            }
          }}
        />
      )}
      {toast && (
        <div
          role={toast.error ? "alert" : "status"}
          className={`toast ${toast.error ? "toast-error" : ""}`}
        >
          {toast.error ? <AlertCircle size={18} /> : <CircleCheck size={18} />}
          <span>{toast.message}</span>
          <IconButton
            title="Dismiss notification"
            icon={X}
            onClick={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
}

function CollectionPage({
  page,
  state,
  query,
  setQuery,
  addCurrent,
  open,
  deleteItem,
}) {
  const [type, setType] = useState("");
  const [tag, setTag] = useState("");
  const [finalOnly, setFinalOnly] = useState(false);
  const [roleCategory, setRoleCategory] = useState("");
  const [jobStatus, setJobStatus] = useState("");
  useEffect(() => {
    setType("");
    setTag("");
    setFinalOnly(false);
    setRoleCategory("");
    setJobStatus("");
  }, [page]);
  const info = {
    materials: [
      "Personal materials",
      "YOUR EXPERIENCE",
      "Add material",
      BookOpen,
    ],
    resumes: ["Resume workspaces", "MAKE IT RELEVANT", "New workspace", Files],
    reviews: [
      "Weekly review",
      "REFLECT & RESET",
      "Review this week",
      CalendarDays,
    ],
  }[page];
  const rows = state[page]
    .filter(
      (item) =>
        JSON.stringify(item).toLowerCase().includes(query.toLowerCase()) &&
        (page !== "materials" ||
          ((!type || item.type === type) &&
            (!tag ||
              item.tags
                .split(/[,\uff0c]/)
                .map((t) => t.trim())
                .includes(tag)))) &&
        (page !== "resumes" ||
          ((!finalOnly || item.is_final_version) &&
            (!roleCategory || item.role_category === roleCategory) &&
            (!jobStatus ||
              state.jobs.find((j) => j.id === item.job_id)?.status ===
                jobStatus))),
    )
    .sort((a, b) =>
      page === "reviews"
        ? b.week_start_date.localeCompare(a.week_start_date)
        : b.updated_at.localeCompare(a.updated_at),
    );
  const tags = [
    ...new Set(
      state.materials.flatMap((m) =>
        m.tags
          .split(/[,\uff0c]/)
          .map((t) => t.trim())
          .filter(Boolean),
      ),
    ),
  ];
  const counts = weeklyCounts(state.jobs, monday());
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">{info[1]}</div>
          <h1>{info[0]}</h1>
        </div>
        <Button icon={Plus} variant="primary" onClick={addCurrent}>
          {info[2]}
        </Button>
      </div>
      {page === "reviews" && (
        <div className="review-summary">
          <div>
            <span className="eyebrow">THIS WEEK</span>
            <h2>{formatDate(monday())}</h2>
          </div>
          {[
            ["jobs_discovered", "Discovered"],
            ["jobs_applied", "Applied"],
            ["interviews_received", "Interviews"],
            ["offers_received", "Offers"],
          ].map(([key, name]) => (
            <div key={key}>
              <strong>{counts[key]}</strong>
              <span>{name}</span>
            </div>
          ))}
        </div>
      )}
      <div className="toolbar collection-toolbar">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder={`Search ${page === "resumes" ? "workspaces" : page}...`}
        />
        {page === "materials" && (
          <>
            <Select
              aria-label="Filter material type"
              empty="All types"
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={MATERIAL_TYPES}
            />
            <Select
              aria-label="Filter tag"
              empty="All tags"
              options={tags.map((t) => ({ value: t, label: t }))}
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </>
        )}
        {page === "resumes" && (
          <>
            <Select
              aria-label="Filter workspace category"
              empty="All categories"
              options={[
                ...new Set(
                  state.resumes.map((r) => r.role_category).filter(Boolean),
                ),
              ].map((v) => ({ value: v, label: v }))}
              value={roleCategory}
              onChange={(e) => setRoleCategory(e.target.value)}
            />
            <Select
              aria-label="Filter linked job status"
              empty="All job statuses"
              options={STATUSES}
              value={jobStatus}
              onChange={(e) => setJobStatus(e.target.value)}
            />
            <label className="check">
              <input
                type="checkbox"
                checked={finalOnly}
                onChange={(e) => setFinalOnly(e.target.checked)}
              />
              Final versions
            </label>
          </>
        )}
        <span className="muted results-count">{rows.length} records</span>
      </div>
      {!rows.length ? (
        <Empty
          icon={info[3]}
          title={
            query || type || tag || finalOnly || roleCategory || jobStatus
              ? "No matching records"
              : {
                  materials: "Your experience, ready to reuse",
                  resumes: "A workspace for every direction",
                  reviews: "Make room for a little reflection",
                }[page]
          }
          action={
            <Button icon={Plus} onClick={addCurrent}>
              {info[2]}
            </Button>
          }
        />
      ) : (
        <div className={page === "reviews" ? "review-list" : "collection-grid"}>
          {rows.map((item) => (
            <article
              className={`record-card ${page === "reviews" ? "review-record" : ""}`}
              key={item.id}
            >
              <div className="record-top">
                <span
                  className={`record-type ${page === "resumes" && item.is_final_version ? "final-marker" : ""}`}
                >
                  {page === "materials"
                    ? label(item.type)
                    : page === "resumes"
                      ? item.is_final_version
                        ? "Final version"
                        : "Draft"
                      : `Week of ${formatDate(item.week_start_date)}`}
                </span>
                <div className="row-actions">
                  <IconButton
                    title={`Edit ${item.title || item.name || item.week_start_date}`}
                    icon={Pencil}
                    onClick={() => open(page, item)}
                  />
                  <IconButton
                    title={`Delete ${item.title || item.name || item.week_start_date}`}
                    icon={Trash2}
                    onClick={() =>
                      deleteItem(
                        page,
                        item,
                        page === "materials"
                          ? "material"
                          : page === "resumes"
                            ? "workspace"
                            : "review",
                      )
                    }
                  />
                </div>
              </div>
              <button className="record-main" onClick={() => open(page, item)}>
                <h2>
                  {item.title ||
                    item.name ||
                    `${item.jobs_applied} applications. ${item.interviews_received} interviews.`}
                </h2>
                {page === "materials" && (
                  <>
                    <p className="record-excerpt">{item.body}</p>
                    <div className="tag-list">
                      {item.tags
                        .split(/[,\uff0c]/)
                        .filter((t) => t.trim())
                        .map((t, i) => (
                          <span key={i}>{t.trim()}</span>
                        ))}
                    </div>
                  </>
                )}
                {page === "resumes" && (
                  <>
                    <p>
                      {[item.target_company, item.target_role]
                        .filter(Boolean)
                        .join(" / ") ||
                        item.role_category ||
                        "No target role yet"}
                    </p>
                    <p className="record-excerpt">
                      {item.revision_notes ||
                        item.job_description ||
                        "No job description yet."}
                    </p>
                    <span className="material-count">
                      <BookOpen size={13} />
                      {item.matched_material_ids.length} linked materials
                    </span>
                  </>
                )}
                {page === "reviews" && (
                  <div className="review-columns">
                    <div>
                      <span className="eyebrow">NEXT WEEK</span>
                      <p>
                        {item.next_week_priorities || "No priorities recorded."}
                      </p>
                    </div>
                    <div>
                      <span className="eyebrow">REFLECTION</span>
                      <p>
                        {item.freeform_reflection ||
                          item.main_blockers ||
                          "No reflection recorded."}
                      </p>
                    </div>
                  </div>
                )}
              </button>
              <div className="record-footer">
                <span>Updated {formatDate(item.updated_at)}</span>
                <ArrowUpRight size={15} />
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
