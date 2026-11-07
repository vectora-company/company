// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";

let localizedSubtitle: string | undefined;

import Hero from "./Hero";

vi.mock("#/paraglide/messages", () => ({
  m: new Proxy(
    {},
    {
      get:
        (_t, prop) =>
        (..._args: unknown[]) =>
          prop === "hero_subtitle" && localizedSubtitle
            ? localizedSubtitle
            : String(prop),
    },
  ),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    ...rest
  }: {
    children: React.ReactNode;
    to: string;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

// Hero usa useLatestVersion (useQuery) pra exibir o badge de versão — precisa
// de um QueryClientProvider no render, senão useQueryClient lança.
function renderWithClient(ui: ReactNode) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

const fetchMock = vi.fn();

beforeEach(() => {
  localizedSubtitle = undefined;
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Hero", () => {
  it("renders the German subtitle with correct plural agreement", () => {
    const messages = JSON.parse(
      readFileSync(
        join(import.meta.dirname, "../../../messages/de.json"),
        "utf-8",
      ),
    ) as Record<string, string>;
    localizedSubtitle = messages.hero_subtitle;
    renderWithClient(<Hero />);
    expect(screen.getByText(localizedSubtitle)).toBeInTheDocument();
    expect(localizedSubtitle).toContain("Du und der Agent teilen");
    expect(
      screen.queryByText(/Du und der Agent teilt /),
    ).not.toBeInTheDocument();
  });
});
