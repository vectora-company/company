// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import OpenSourceSection from "./OpenSourceSection";

vi.mock("#/paraglide/messages", () => ({
  m: new Proxy(
    {},
    {
      get:
        (_target, property: string | symbol) =>
        (...args: unknown[]) => {
          if (property === "opensource_release_link") {
            const params = args[0] as { version: string };
            return `Explorar a versão ${params.version}`;
          }
          if (property === "opensource_releases_link")
            return "Explorar versões";
          return String(property);
        },
    },
  ),
}));

const fetchMock = vi.fn();

function renderSection() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <OpenSourceSection />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("OpenSourceSection", () => {
  it("links to the newest published GitHub release and names its version", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        tag_name: "v0.1.25",
        html_url:
          "https://github.com/vectora-company/vectora/releases/tag/v0.1.25",
        assets: [],
      }),
    });

    renderSection();

    const link = await screen.findByRole("link", {
      name: "Explorar a versão 0.1.25",
    });
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/vectora-company/vectora/releases/tag/v0.1.25",
    );
  });

  it("falls back to the releases page without showing a stale version", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) });

    renderSection();

    const link = await screen.findByRole("link", { name: "Explorar versões" });
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/vectora-company/vectora/releases/latest",
    );
    expect(screen.queryByText(/0\.1\.24/)).not.toBeInTheDocument();
  });
});
