import type { LatestRelease } from "../hooks/use-latest-version";

export type OS = "windows" | "macos" | "linux";

const RELEASES_URL =
  "https://github.com/vectora-company/vectora/releases/latest";

const LINUX_ARCHES: Record<string, string[]> = {
  x64: ["x86_64", "x64", "amd64"],
  arm64: ["aarch64", "arm64"],
};

/** Resolve an installer link without making the downloads UI depend on the API. */
export function githubDownloadHref(
  osToken: string,
  arch: string,
  ext: string,
  release: LatestRelease | null | undefined,
): string {
  if (!release) return RELEASES_URL;

  const format = ext === "pkg.tar.zst" ? "pacman" : ext;
  const architectures = osToken === "linux" ? LINUX_ARCHES[arch] : [arch];
  const asset = architectures
    ?.map((targetArch) =>
      release.assets.find(
        ({ name }) =>
          name ===
          `Vectora-${release.version}-${osToken}-${targetArch}.${format}`,
      ),
    )
    .find((candidate) => candidate !== undefined);

  return asset?.url ?? RELEASES_URL;
}

/** Detecta o SO pelo userAgent (client-only — SSR retorna null). */
export function detectOS(): OS | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac")) return "macos";
  if (ua.includes("linux") || ua.includes("x11")) return "linux";
  return null;
}
