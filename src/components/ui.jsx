import { Link } from "react-router-dom";

export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

const baseSurfaceButton =
  "inline-flex min-h-10 items-center justify-center border border-neutral-950 bg-stone-50 px-3.5 text-sm font-black text-neutral-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35";

export function StatusScreen({ children }) {
  return (
    <div className="grid min-h-screen place-items-center px-10 text-center text-lg font-black">
      {children}
    </div>
  );
}

export function Panel({ as: Tag = "div", className = "", children, ...props }) {
  return (
    <Tag
      className={cx(
        "border border-neutral-950 bg-stone-50 shadow-[12px_14px_0_rgba(0,0,0,0.12)]",
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
    <button type="button" className={cx(baseSurfaceButton, "min-h-[42px]", className)} {...props}>
      {children}
    </button>
  );
}

export function PrimaryButton({ className = "", children, ...props }) {
  return (
    <button
      type="button"
      className={cx(
        "inline-flex min-h-11 items-center justify-center border border-neutral-950 bg-neutral-950 px-4.5 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35",
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
    <p className={cx("text-xs font-black uppercase tracking-[0.04em]", className)}>{children}</p>
  );
}

export function FieldLabel({ className = "", children, ...props }) {
  return (
    <label className={cx("grid gap-2 text-xs font-black uppercase", className)} {...props}>
      {children}
    </label>
  );
}
