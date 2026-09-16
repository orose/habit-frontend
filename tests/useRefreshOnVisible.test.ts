import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useRefreshOnVisible } from "../src/useRefreshOnVisible";

function setVisibility(state: "visible" | "hidden") {
  Object.defineProperty(document, "visibilityState", { value: state, configurable: true });
}

describe("useRefreshOnVisible", () => {
  afterEach(() => {
    setVisibility("visible");
  });

  it("calls the callback when the document becomes visible", () => {
    const callback = vi.fn();
    renderHook(() => useRefreshOnVisible(callback));

    setVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does not call the callback when the document becomes hidden", () => {
    const callback = vi.fn();
    renderHook(() => useRefreshOnVisible(callback));

    setVisibility("hidden");
    document.dispatchEvent(new Event("visibilitychange"));

    expect(callback).not.toHaveBeenCalled();
  });

  it("stops listening after unmount", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useRefreshOnVisible(callback));
    unmount();

    setVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));

    expect(callback).not.toHaveBeenCalled();
  });

  it("always calls the latest callback, even if it changes across renders", () => {
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();
    const { rerender } = renderHook(({ callback }) => useRefreshOnVisible(callback), {
      initialProps: { callback: firstCallback },
    });

    rerender({ callback: secondCallback });

    setVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });
});
