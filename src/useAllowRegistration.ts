import { useEffect, useState } from "react";
import { fetchAllowRegistration } from "./api/settings";

/**
 * Whether registration is currently allowed, per the backend's
 * `allow_registration` flag. Starts as `false` (fail closed) until the
 * flag has been fetched, or if fetching it fails.
 */
export function useAllowRegistration(): boolean {
  const [allowRegistration, setAllowRegistration] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchAllowRegistration()
      .then((value) => {
        if (!cancelled) {
          setAllowRegistration(value);
        }
      })
      .catch(() => {
        // Fail closed: leave the registration entry point hidden.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return allowRegistration;
}
