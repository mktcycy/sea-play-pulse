// Loading skeletons with a subtle shimmer.
function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-surface-raised ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

export function GameCardSkeleton() {
  return (
    <div className="card w-44 shrink-0 p-3">
      <Shimmer className="aspect-[4/3] w-full" />
      <Shimmer className="mt-3 h-4 w-3/4" />
      <Shimmer className="mt-2 h-3 w-1/2" />
      <div className="mt-3 flex gap-2">
        <Shimmer className="h-8 flex-1" />
        <Shimmer className="h-8 w-8" />
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="card flex items-center gap-3 p-3">
      <Shimmer className="h-6 w-6" />
      <Shimmer className="h-14 w-16" />
      <div className="flex-1">
        <Shimmer className="h-4 w-2/3" />
        <Shimmer className="mt-2 h-3 w-1/3" />
      </div>
      <Shimmer className="h-8 w-16" />
    </div>
  );
}

export { Shimmer };
