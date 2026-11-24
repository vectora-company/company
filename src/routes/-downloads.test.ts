import { describe, it, expect, afterEach } from "vitest";
import { detectOS, resolveDownloadPlatforms } from "../lib/download-assets";
import type { LatestRelease } from "../hooks/use-latest-version";

// detectOS mapeia o userAgent → plataforma para destacar o download recomendado.
function setUA(ua: string): void {
  Object.defineProperty(navigator, "userAgent", {
    value: ua,
    configurable: true,
  });
}

const original = navigator.userAgent;
afterEach(() => setUA(original));

describe("detectOS", () => {
  it("Windows", () => {
    setUA("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
    expect(detectOS()).toBe("windows");
  });

  it("macOS", () => {
    setUA("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605");
    expect(detectOS()).toBe("macos");
  });

  it("Linux", () => {
    setUA("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36");
    expect(detectOS()).toBe("linux");
  });

  it("userAgent desconhecido → null (edge)", () => {
    setUA("CoolBot/1.0 (+https://example.com/bot)");
    expect(detectOS()).toBeNull();
  });
});

describe("download assets from GitHub Releases", () => {
  const makeRelease = (names: string[]): LatestRelease => ({
    version: "0.1.25",
    url: "https://github.com/vectora-company/vectora/releases/tag/v0.1.25",
    releases_url: "https://github.com/vectora-company/vectora/releases/latest",
    assets: names.map((name) => ({
      name: `Vectora-0.1.25-${name}`,
      url: `https://github.com/vectora-company/vectora/releases/download/v0.1.25/Vectora-0.1.25-${name}`,
    })),
  });

  it("links only installers present in the release and prefers the primary package", () => {
    const platforms = resolveDownloadPlatforms(
      makeRelease([
        "win-x64.exe",
        "win-x64.msi",
        "mac-arm64.dmg",
        "linux-x86_64.AppImage",
        "linux-aarch64.deb",
        "linux-amd64.snap",
        "Vectora-0.1.25-linux-x86_64.AppImage.asc",
      ]),
    );

    expect(platforms.map(({ os }) => os)).toEqual([
      "windows",
      "macos",
      "linux",
    ]);
    expect(platforms[0].primary.url).toContain("win-x64.exe");
    expect(platforms[0].others.map(({ url }) => url)).toEqual([
      expect.stringContaining("win-x64.msi"),
    ]);
    expect(platforms[1].primary.url).toContain("mac-arm64.dmg");
    expect(platforms[2].primary.url).toContain("linux-x86_64.AppImage");
    expect(platforms[2].others.map(({ url }) => url)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("linux-aarch64.deb"),
        expect.stringContaining("linux-amd64.snap"),
      ]),
    );
    expect(
      platforms.flatMap(({ primary, others }) => [primary, ...others]),
    ).toHaveLength(6);
  });

  it("returns no platforms when a release has no recognized installer assets", () => {
    expect(
      resolveDownloadPlatforms(makeRelease(["SHA256SUMS", "key.asc"])),
    ).toEqual([]);
    expect(resolveDownloadPlatforms(null)).toEqual([]);
  });
});
