import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** A localStorage that records every write, so a test can say which keys were touched. */
function stubBrowser(initial: Record<string, string>) {
  const data = new Map(Object.entries(initial));
  const writes: string[] = [];
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      writes.push(key);
      data.set(key, value);
    },
    removeItem: (key: string) => {
      writes.push(`remove:${key}`);
      data.delete(key);
    },
  });
  return { data, writes };
}

async function startupTheme() {
  vi.resetModules();
  const { useTheme } = await import("./theme");
  return useTheme.getState().theme;
}

describe("the colour mode key", () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("is light on a first visit and writes nothing", async () => {
    const { writes } = stubBrowser({});
    expect(await startupTheme()).toBe("light");
    expect(writes).toEqual([]);
  });

  it("prefers piataro.theme over the bare theme", async () => {
    const { data, writes } = stubBrowser({ "piataro.theme": "light", theme: "dark" });
    expect(await startupTheme()).toBe("light");
    expect(data.get("piataro.theme")).toBe("light");
    expect(writes).toEqual([]);
  });

  it("carries a bare dark over once, into piataro.theme", async () => {
    const { data, writes } = stubBrowser({ theme: "dark" });
    expect(await startupTheme()).toBe("dark");
    expect(data.get("piataro.theme")).toBe("dark");
    expect(writes).toEqual(["piataro.theme"]);
  });

  it("never writes or deletes the bare key, also when a choice is made", async () => {
    const { data, writes } = stubBrowser({ theme: "system" });
    vi.stubGlobal("document", {
      documentElement: { dataset: {} },
      querySelector: () => null,
    });
    vi.stubGlobal("window", { matchMedia: () => ({ matches: false }) });
    vi.resetModules();
    const { useTheme } = await import("./theme");
    expect(useTheme.getState().theme).toBe("system");
    useTheme.getState().setTheme("dark");
    expect(data.get("theme")).toBe("system");
    expect(data.get("piataro.theme")).toBe("dark");
    expect(writes).not.toContain("theme");
    expect(writes.filter((key) => key.startsWith("remove:"))).toEqual([]);
  });

  it("reads an unknown value in either key as light", async () => {
    stubBrowser({ "piataro.theme": "sepia", theme: "sepia" });
    expect(await startupTheme()).toBe("light");
    stubBrowser({ "piataro.theme": "sepia", theme: "dark" });
    expect(await startupTheme()).toBe("dark");
    stubBrowser({ theme: "sepia" });
    expect(await startupTheme()).toBe("light");
  });

  it("is light when storage throws", async () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
    });
    expect(await startupTheme()).toBe("light");
  });
});
