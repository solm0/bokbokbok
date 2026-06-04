import { Link } from "react-router-dom";

export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

const baseSurfaceButton =
  "inline-flex items-center justify-center text-base transition hover:opacity-50 disabled:cursor-not-allowed disabled:opacity-35 max-w-20 xl:max-w-max";

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
    <Link className={cx(baseSurfaceButton, "py-0.5 underline underline-offset-4 decoration-1 decoration-dotted text-base", className)} {...props}>
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

export function GhostButtonUnderline({ className = "", children, ...props }) {
  return (
    <button type="button" className={cx(baseSurfaceButton, "py-0.5 underline underline-offset-4 decoration-1 decoration-dotted text-base text-left max-w-40", className)} {...props}>
      {children}
    </button>
  );
}

export function PrimaryButton({ className = "", children, ...props }) {
  return (
    <button
      type="button"
      className={cx(
        "inline-flex py-2 px-2 md:px-3 items-center justify-center bg-neutral-950 text-base text-white transition hover:-translate-y-0.5 disabled:bg-transparent disabled:text-neutral-900 disabled:border disabled:border-dotted break-keep max-w-20 xl:max-w-max leading-4.5",
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
    <p className={cx("text-xs", className)}>{children}</p>
  );
}

export function FieldLabel({ className = "", children, ...props }) {
  return (
    <label className={cx("flex items-start gap-4 text-base uppercase", className)} {...props}>
      {children}
    </label>
  );
}
