import { afterEach, describe, expect, it } from "vitest";
import { detectOS, githubDownloadHref } from "../lib/download-assets";
import type { LatestRelease } from "../hooks/use-latest-version";

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

  it("userAgent desconhecido → null", () => {
    setUA("CoolBot/1.0 (+https://example.com/bot)");
    expect(detectOS()).toBeNull();
  });
});

describe("GitHub release download links", () => {
  const release: LatestRelease = {
    version: "0.1.25",
    url: "https://github.com/vectora-company/vectora/releases/tag/v0.1.25",
    releases_url: "https://github.com/vectora-company/vectora/releases/latest",
    assets: [
      {
        name: "Vectora-0.1.25-win-x64.exe",
        url: "https://github.com/vectora-company/vectora/releases/download/v0.1.25/Vectora-0.1.25-win-x64.exe",
      },
      {
        name: "Vectora-0.1.25-linux-x86_64.AppImage",
        url: "https://github.com/vectora-company/vectora/releases/download/v0.1.25/Vectora-0.1.25-linux-x86_64.AppImage",
      },
      {
        name: "Vectora-0.1.25-linux-aarch64.pacman",
        url: "https://github.com/vectora-company/vectora/releases/download/v0.1.25/Vectora-0.1.25-linux-aarch64.pacman",
      },
    ],
  };

  it("resolves the direct asset URL for each available installer button", () => {
    expect(githubDownloadHref("win", "x64", "exe", release)).toBe(
      release.assets[0].url,
    );
    expect(githubDownloadHref("linux", "x64", "AppImage", release)).toBe(
      release.assets[1].url,
    );
    expect(githubDownloadHref("linux", "arm64", "pkg.tar.zst", release)).toBe(
      release.assets[2].url,
    );
  });

  it("always returns a GitHub destination when metadata or an asset is missing", () => {
    const releasesPage =
      "https://github.com/vectora-company/vectora/releases/latest";
    expect(githubDownloadHref("mac", "arm64", "dmg", undefined)).toBe(
      releasesPage,
    );
    expect(githubDownloadHref("win", "arm64", "msi", release)).toBe(
      releasesPage,
    );
  });
});
