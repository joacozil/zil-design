import { useState } from "react";

/**
 * THROWAWAY — proves React islands hydrate. Delete before real work begins.
 * If clicking increments the count, client-side hydration is working.
 */
export default function HydrationCheck() {
  const [count, setCount] = useState(0);

  return (
    <button
      type="button"
      onClick={() => setCount((c) => c + 1)}
      className="rounded-md bg-surface-inverse px-4 py-2 font-medium text-text-inverse"
    >
      React island clicked {count} {count === 1 ? "time" : "times"}
    </button>
  );
}
