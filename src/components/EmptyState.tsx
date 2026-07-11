import { Icon } from "./Icon";

export function EmptyState({
  icon = "SearchX",
  title,
  hint,
  action,
}: {
  icon?: string;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-line px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-raised text-content-faint">
        <Icon name={icon} size={22} aria-hidden />
      </div>
      <p className="mt-3 font-display font-semibold text-content">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-sm text-content-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
