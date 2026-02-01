type ErrorStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

const ErrorState = ({ title = "Something went wrong", description, actionLabel = "Try again", onAction }: ErrorStateProps) => (
  <div className="rounded-[var(--radius-lg)] border border-danger/40 bg-danger/5 p-6 text-center text-sm text-danger">
    <p className="text-base font-semibold text-foreground">{title}</p>
    {description && <p className="mt-2 text-danger">{description}</p>}
    {onAction && (
      <button
        type="button"
        onClick={onAction}
        className="mt-4 inline-flex items-center justify-center rounded-full border border-danger/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground transition hover:bg-danger/10"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export default ErrorState;
