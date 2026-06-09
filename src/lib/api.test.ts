import { describe, expect, it, vi, afterEach } from "vitest";
import { fetchPublicStats, PublicStats } from "./api";

describe("fetchPublicStats", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls /api/stats and returns parsed JSON on success", async () => {
    const mockStats: PublicStats = {
      system: "repo-rag-debugger",
      mode: "showcase",
      status: "operational",
      last_deployed_at: "2026-04-28T12:00:00Z",
      last_commit_at: "2026-04-28T11:00:00Z",
      metrics: {
        commits_30d: 5,
        commits_total: 42,
        primary_language: "Python",
        repo_stars: 120,
        lines_of_code: 5545,
      },
      schema_version: 1,
      generated_at: "2026-04-28T12:30:00Z",
    };

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: vi.fn().mockResolvedValue(mockStats),
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    const result = await fetchPublicStats();

    expect(fetch).toHaveBeenCalledWith("/api/stats", expect.objectContaining({
      headers: { "Content-Type": "application/json" },
    }));
    expect(result).toEqual(mockStats);
  });

  it("throws error with status and statusText on non-ok response", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: vi.fn(),
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    await expect(fetchPublicStats()).rejects.toThrow(
      "Public API 500: Internal Server Error",
    );
  });

  it("propagates fetch network errors", async () => {
    const networkError = new Error("Network unreachable");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(networkError));

    await expect(fetchPublicStats()).rejects.toThrow("Network unreachable");
  });

  it("includes custom headers when provided", async () => {
    const mockStats: PublicStats = {
      system: "test",
      status: "operational",
      last_deployed_at: null,
      metrics: {},
      schema_version: 1,
      generated_at: "2026-01-01T00:00:00Z",
    };

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: vi.fn().mockResolvedValue(mockStats),
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    await fetchPublicStats();

    const callArgs = (fetch as any).mock.calls[0];
    expect(callArgs[0]).toBe("/api/stats");
    expect(callArgs[1].headers).toMatchObject({
      "Content-Type": "application/json",
    });
  });

  it("handles 404 responses", async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: vi.fn(),
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    await expect(fetchPublicStats()).rejects.toThrow(
      "Public API 404: Not Found",
    );
  });
});
