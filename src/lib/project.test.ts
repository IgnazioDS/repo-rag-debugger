import { describe, expect, it } from "vitest";
import { PROJECT, ProjectSpec } from "./project";

describe("PROJECT", () => {
  it("is a valid ProjectSpec with all required fields", () => {
    expect(PROJECT).toBeDefined();
    expect(PROJECT.slug).toBe("repo-rag-debugger");
    expect(PROJECT.name).toBe("Repo RAG Debugger");
    expect(PROJECT.category).toBe("Developer Tool");
    expect(PROJECT.track).toBe("LLM");
  });

  it("has non-empty identity fields", () => {
    expect(PROJECT.slug).toBeTruthy();
    expect(PROJECT.name).toBeTruthy();
    expect(PROJECT.system_slug).toBeTruthy();
    expect(PROJECT.github_url).toBeTruthy();
    expect(PROJECT.live_url).toBeTruthy();
  });

  it("has valid URL fields", () => {
    expect(PROJECT.github_url).toMatch(/^https?:\/\//);
    expect(PROJECT.eleventh_url).toMatch(/^https?:\/\//);
    expect(PROJECT.live_url).toMatch(/^https?:\/\//);
    expect(PROJECT.fleet_url).toMatch(/^https?:\/\//);
  });

  it("has a non-empty stack array", () => {
    expect(Array.isArray(PROJECT.stack)).toBe(true);
    expect(PROJECT.stack.length).toBeGreaterThan(0);
    expect(PROJECT.stack[0]).toBeTruthy();
  });

  it("has MVP items in the array", () => {
    expect(Array.isArray(PROJECT.mvp)).toBe(true);
    expect(PROJECT.mvp.length).toBeGreaterThan(0);
    PROJECT.mvp.forEach((item) => {
      expect(typeof item).toBe("string");
      expect(item.length).toBeGreaterThan(0);
    });
  });

  it("has narrative fields populated", () => {
    expect(PROJECT.summary).toBeTruthy();
    expect(PROJECT.problem).toBeTruthy();
    expect(PROJECT.users).toBeTruthy();
    expect(PROJECT.why_now).toBeTruthy();
  });

  it("has consistent slug across fields", () => {
    expect(PROJECT.slug).toBe("repo-rag-debugger");
    expect(PROJECT.system_slug).toBe("repo-rag-debugger");
  });

  it("builder attribution is present", () => {
    expect(PROJECT.builder).toBeTruthy();
    expect(typeof PROJECT.builder).toBe("string");
  });

  it("stage is a valid development stage", () => {
    const validStages = ["Ideation", "Design", "Ready to build", "In progress", "Shipped"];
    expect(validStages).toContain(PROJECT.stage);
  });
});
