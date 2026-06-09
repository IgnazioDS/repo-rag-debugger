import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce, useMounted, useAnimatedNumber, useHotkey, usePolling } from "./hooks";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 200));
    expect(result.current).toBe("hello");
  });

  it("updates only after the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: "first" } },
    );
    rerender({ value: "second" });
    expect(result.current).toBe("first");

    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(result.current).toBe("first");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("second");
  });
});

describe("useMounted", () => {
  it("returns true after mount", () => {
    const { result } = renderHook(() => useMounted());
    expect(result.current).toBe(true);
  });
});

describe("useHotkey", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fires handler when key matches", () => {
    const handler = vi.fn();
    renderHook(() => useHotkey("k", handler));

    const event = new KeyboardEvent("keydown", { key: "k" });
    act(() => {
      window.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalledWith(event);
  });

  it("ignores non-matching keys", () => {
    const handler = vi.fn();
    renderHook(() => useHotkey("k", handler));

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "j" }));
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("respects meta modifier when specified", () => {
    const handler = vi.fn();
    renderHook(() => useHotkey("k", handler, { meta: true }));

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", metaKey: false, ctrlKey: false }),
      );
    });

    expect(handler).not.toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", metaKey: true }),
      );
    });

    expect(handler).toHaveBeenCalled();
  });

  it("detaches listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const handler = vi.fn();
    const { unmount } = renderHook(() => useHotkey("k", handler));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );
  });

  it("is case-insensitive", () => {
    const handler = vi.fn();
    renderHook(() => useHotkey("k", handler));

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "K" }));
    });

    expect(handler).toHaveBeenCalled();
  });
});

describe("useAnimatedNumber", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts at 0", () => {
    const { result } = renderHook(() => useAnimatedNumber(100, 600));
    expect(result.current).toBe(0);
  });

  it("uses requestAnimationFrame to drive animation", () => {
    const rafSpy = vi.spyOn(global, "requestAnimationFrame");
    const { unmount } = renderHook(() => useAnimatedNumber(100, 600));

    expect(rafSpy).toHaveBeenCalled();

    unmount();
  });

  it("cancels animation on unmount", () => {
    const cancelAnimationFrameSpy = vi.spyOn(global, "cancelAnimationFrame");
    const { unmount } = renderHook(() => useAnimatedNumber(100, 600));

    unmount();

    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
  });

  it("updates when target changes", () => {
    const rafSpy = vi.spyOn(global, "requestAnimationFrame");
    const { rerender } = renderHook(
      ({ target }) => useAnimatedNumber(target, 600),
      { initialProps: { target: 50 } },
    );

    const initialCalls = rafSpy.mock.calls.length;

    // Rerender with new target should reset animation state
    rerender({ target: 100 });

    // Should call RAF again for the new target
    expect(rafSpy.mock.calls.length).toBeGreaterThan(initialCalls);
  });
});

describe("usePolling", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads data on mount", async () => {
    const fetcher = vi.fn().mockResolvedValue({ value: 42 });
    const { result } = renderHook(() => usePolling(fetcher, 1000));

    expect(result.current.loading).toBe(true);

    // Wait for the initial fetch to complete
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(result.current.data).toEqual({ value: 42 });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("captures errors from fetcher", async () => {
    const error = new Error("Fetch failed");
    const fetcher = vi.fn().mockRejectedValue(error);
    const { result } = renderHook(() => usePolling(fetcher, 1000));

    expect(result.current.loading).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(result.current.error?.message).toBe("Fetch failed");
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("disables polling when enabled is false", async () => {
    const fetcher = vi.fn().mockResolvedValue({ value: 42 });
    const { result } = renderHook(() => usePolling(fetcher, 1000, false));

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(true);
  });

  it("provides refetch method to trigger immediate load", async () => {
    const fetcher = vi.fn().mockResolvedValue({ value: 42 });
    const { result } = renderHook(() => usePolling(fetcher, 1000));

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(fetcher).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.refetch();
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("clears timers on unmount", async () => {
    const fetcher = vi.fn().mockResolvedValue({ value: 42 });
    const { unmount } = renderHook(() => usePolling(fetcher, 1000));

    await new Promise((resolve) => setTimeout(resolve, 10));

    const callCountBefore = fetcher.mock.calls.length;
    unmount();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(fetcher.mock.calls.length).toBe(callCountBefore);
  });

  it("cleans up event listener on unmount", async () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
    const fetcher = vi.fn().mockResolvedValue({ value: 42 });
    const { unmount } = renderHook(() => usePolling(fetcher, 1000));

    await new Promise((resolve) => setTimeout(resolve, 10));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );
  });
});
