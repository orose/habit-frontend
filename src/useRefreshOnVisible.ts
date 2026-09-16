import { useEffect, useRef } from "react";

/**
 * Re-runs `callback` whenever the page regains visibility - notably when an
 * installed PWA is resumed from the background after being suspended for a
 * while, which otherwise leaves it showing data fetched before the pause.
 */
export function useRefreshOnVisible(callback: () => void) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        callbackRef.current();
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);
}
