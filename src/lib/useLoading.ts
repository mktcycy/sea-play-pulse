import { useEffect, useState } from "react";

// Briefly simulate a fetch so skeleton states are visible in the demo.
export function useSimulatedLoading(ms = 500, deps: unknown[] = []): boolean {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const id = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return loading;
}
