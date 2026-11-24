import { describe, expect, it, vi } from "vitest";
import { fetchLatestGithubRelease } from "./github-releases";

function releaseResponse(overrides: Record<string, unknown> = {}) {
  return {
    tag_name: "v0.1.25",
    html_url: "https://github.com/vectora-company/vectora/releases/tag/v0.1.25",
    assets: [
      {
        name: "Vectora-0.1.25-linux-x86_64.AppImage",
        browser_download_url:
          "https://github.com/vectora-company/vectora/releases/download/v0.1.25/Vectora-0.1.25-linux-x86_64.AppImage",
      },
      {
        name: "Vectora-0.1.25-linux-x86_64.AppImage.asc",
        browser_download_url:
          "https://github.com/vectora-company/vectora/releases/download/v0.1.25/Vectora-0.1.25-linux-x86_64.AppImage.asc",
      },
      {
        name: "payload.exe",
        browser_download_url: "https://example.com/payload.exe",
      },
    ],
    ...overrides,
  };
}

describe("fetchLatestGithubRelease", () => {
  it("returns the latest release and only assets hosted by its GitHub release", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify(releaseResponse()), { status: 200 }),
      );

    const response = await fetchLatestGithubRelease(fetcher);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=300");
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.github.com/repos/vectora-company/vectora/releases/latest",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "application/vnd.github+json",
        }),
      }),
    );
    expect(body.version).toBe("0.1.25");
    expect(body.assets).toHaveLength(2);
    expect(body.assets[0].url).toContain("/releases/download/v0.1.25/");
  });

  it("does not cache GitHub errors and points users to the release page", async () => {
    const response = await fetchLatestGithubRelease(
      vi.fn().mockResolvedValue(new Response("unavailable", { status: 503 })),
    );

    expect(response.status).toBe(502);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    await expect(response.json()).resolves.toMatchObject({
      error: "release_unavailable",
      releases_url:
        "https://github.com/vectora-company/vectora/releases/latest",
    });
  });

  it("returns a safe fallback when the release payload is invalid", async () => {
    const response = await fetchLatestGithubRelease(
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ tag_name: "v0.1.25" }), {
          status: 200,
        }),
      ),
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      error: "invalid_release_response",
    });
  });

  it("rejects release pages that do not belong to the Vectora repository", async () => {
    const response = await fetchLatestGithubRelease(
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify(
            releaseResponse({
              html_url: "https://example.com/releases/tag/v0.1.25",
            }),
          ),
          { status: 200 },
        ),
      ),
    );

    expect(response.status).toBe(502);
  });

  it("handles network failures without exposing the upstream error", async () => {
    const response = await fetchLatestGithubRelease(
      vi.fn().mockRejectedValue(new Error("private upstream details")),
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.not.toHaveProperty(
      "message",
      "private upstream details",
    );
  });
});
