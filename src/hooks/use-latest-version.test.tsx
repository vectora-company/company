// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { useLatestRelease, useLatestVersion } from "./use-latest-version";

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    ),
  };
}

const fetchMock = vi.fn();
const release = {
  version: "0.1.25",
  url: "https://github.com/vectora-company/vectora/releases/tag/v0.1.25",
  releases_url: "https://github.com/vectora-company/vectora/releases/latest",
  assets: [
    {
      name: "Vectora-0.1.25-linux-x86_64.AppImage",
      url: "https://github.com/vectora-company/vectora/releases/download/v0.1.25/Vectora-0.1.25-linux-x86_64.AppImage",
    },
  ],
};

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("latest GitHub release hooks", () => {
  it("loads release metadata from the same-origin endpoint", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => release });
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useLatestRelease(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(release);
    expect(fetchMock).toHaveBeenCalledWith("/api/releases/latest");
  });

  it("selects the latest version for the landing page badge", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => release });
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useLatestVersion(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe("0.1.25");
  });

  it("returns null for an unavailable release endpoint", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) });
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useLatestVersion(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it("keeps network failures in query error state without crashing the component", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useLatestVersion(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 3000,
    });
    expect(result.current.data).toBeUndefined();
  });
});
