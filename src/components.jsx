import { cloneElement, useEffect, useId, useRef, useState } from "react";
import { X, Search, ArrowUpRight, Inbox } from "lucide-react";
import { label, safeUrl } from "./model";

export function Button({
  icon: Icon,
  children,
  variant = "",
  className = "",
  ...props
}) {
  return (
    <button className={`button ${variant} ${className}`} {...props}>
      {Icon && <Icon size={16} strokeWidth={1.8} />}
      {children}
    </button>
  );
}
export function IconButton({ icon: Icon, title, ...props }) {
  return (
    <button
      type="button"
      className="icon-button"
      title={title}
      aria-label={title}
      {...props}
    >
      <Icon size={17} strokeWidth={1.8} />
    </button>
  );
}
export function Field({ title, children, wide = false }) {
  const labelId = useId();
  return (
    <label className={`field ${wide ? "wide" : ""}`}>
      <span id={labelId}>{title}</span>
      {cloneElement(children, {
        "aria-labelledby": children.props["aria-label"] ? undefined : labelId,
      })}
    </label>
  );
}
export function Select({ options, empty, ...props }) {
  return (
    <select {...props}>
      {empty !== undefined && <option value="">{empty}</option>}
      {options.map((o) => (
        <option
          key={typeof o === "string" ? o : o.value}
          value={typeof o === "string" ? o : o.value}
        >
          {typeof o === "string" ? label(o) : o.label}
        </option>
      ))}
    </select>
  );
}
export function SearchBox({
  value,
  onChange,
  placeholder = "Search",
  ...props
}) {
  return (
    <div className="search-box">
      <Search size={16} />
      <input
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        {...props}
      />
      {value && (
        <IconButton
          icon={X}
          title="Clear search"
          onClick={() => onChange("")}
        />
      )}
    </div>
  );
}
export function StatusBadge({ status }) {
  return (
    <span className={`badge status-${status}`}>
      <i />
      {label(status)}
    </span>
  );
}
export function ExternalLink({ url, children = "Open listing" }) {
  const safe = safeUrl(url);
  return safe ? (
    <a
      href={safe}
      target="_blank"
      rel="noopener noreferrer"
      className="external-link"
    >
      {children}
      <ArrowUpRight size={14} />
    </a>
  ) : null;
}
export function Empty({ icon: Icon = Inbox, title, children, action }) {
  return (
    <div className="empty">
      <div className="empty-symbol">
        <Icon size={28} strokeWidth={1.3} />
      </div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
export function Modal({ title, children, onClose, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "modal-wide" : ""}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) {
          const r = ref.current.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className="modal-heading">
        <h2>{title}</h2>
        <IconButton title="Close dialog" icon={X} onClick={onClose} />
      </div>
      {children}
    </dialog>
  );
}
export function Confirm({ title, body, action, onClose, onConfirm }) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal title={title} onClose={() => !busy && onClose()}>
      <p className="confirm-body">{body}</p>
      <div className="modal-actions">
        <Button disabled={busy} onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm();
              onClose();
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Working..." : action}
        </Button>
      </div>
    </Modal>
  );
}
