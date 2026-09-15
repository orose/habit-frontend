import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

// Isolate tests from each other's auth state.
afterEach(() => {
  localStorage.clear();
});

// jsdom does not implement matchMedia. MUI's useMediaQuery (used to follow
// the device's prefers-color-scheme setting) needs it, so provide a minimal
// stub that reports "no preference" for every query.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
