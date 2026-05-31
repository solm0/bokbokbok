import { Link } from "react-router-dom";

export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

const baseSurfaceButton =
  "inline-flex items-center justify-center text-sm transition hover:opacity-50 disabled:cursor-not-allowed disabled:opacity-35";

export function StatusScreen({ children }) {
  return (
    <div className="grid min-h-screen place-items-center px-10 text-center text-lg">
      {children}
    </div>
  );
}

export function Panel({ as: Tag = "div", className = "", children, ...props }) {
  return (
    <Tag
      className={cx(
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function GhostLink({ className = "", children, ...props }) {
  return (
    <Link className={cx(baseSurfaceButton, "min-h-[42px] no-underline", className)} {...props}>
      {children}
    </Link>
  );
}

export function GhostButton({ className = "", children, ...props }) {
  return (
    <button type="button" className={cx(baseSurfaceButton, className)} {...props}>
      {children}
    </button>
  );
}

export function PrimaryButton({ className = "", children, ...props }) {
  return (
    <button
      type="button"
      className={cx(
        "inline-flex py-1 px-2 items-center justify-center bg-neutral-950 text-sm text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Eyebrow({ className = "", children }) {
  return (
    <p className={cx("text-xs uppercase tracking-[0.04em]", className)}>{children}</p>
  );
}

export function FieldLabel({ className = "", children, ...props }) {
  return (
    <label className={cx("grid gap-2 text-xs uppercase", className)} {...props}>
      {children}
    </label>
  );
}
