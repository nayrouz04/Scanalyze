// usePageLoader — custom hook that shows a loading state on every page navigation
// Returns true for `duration` ms after each route change, then false
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export function usePageLoader(duration: number = 500): boolean {
  // Detect the current route
  const location = useLocation();
  // true while the loader should be visible
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Immediately show the loader when the route changes
    setLoading(true);

    // Automatically hide it after `duration` milliseconds
    const timer: ReturnType<typeof setTimeout> = setTimeout(
      (): void => setLoading(false),
      duration
    );

    // If the user navigates again before the timer fires, cancel the old timer
    // to avoid stale state updates
    return (): void => clearTimeout(timer);
  }, [location.pathname, duration]);

  return loading;
}