import type { LatestRelease } from "../hooks/use-latest-version";

export type OS = "windows" | "macos" | "linux";

interface VariantDefinition {
  id: string;
  label: string;
  assetNames: string[];
}

interface PlatformDefinition {
  os: OS;
  label: string;
  emoji: string;
  preferred: string;
  variants: VariantDefinition[];
}

export interface DownloadVariant {
  id: string;
  label: string;
  url: string;
}

export interface DownloadPlatform extends Omit<
  PlatformDefinition,
  "preferred" | "variants"
> {
  primary: DownloadVariant;
  others: DownloadVariant[];
}

const LINUX_ARCHES = {
  x64: ["x86_64", "x64", "amd64"],
  arm64: ["aarch64", "arm64"],
};

const linuxVariants: VariantDefinition[] = [
  "AppImage",
  "deb",
  "rpm",
  "snap",
  "pacman",
  "flatpak",
  "tar.gz",
].flatMap((format) =>
  (["x64", "arm64"] as const).map((arch) => ({
    id: `${arch}-${format}`,
    label: `.${format} (${arch === "x64" ? "x64" : "ARM64"})`,
    assetNames: LINUX_ARCHES[arch].map((alias) => `linux-${alias}.${format}`),
  })),
);

export const PLATFORM_DEFINITIONS: PlatformDefinition[] = [
  {
    os: "windows",
    label: "Windows",
    emoji: "🪟",
    preferred: "x64-exe",
    variants: [
      { id: "x64-exe", label: ".exe (x64)", assetNames: ["win-x64.exe"] },
      { id: "arm64-exe", label: ".exe (ARM64)", assetNames: ["win-arm64.exe"] },
      { id: "x64-msi", label: ".msi (x64)", assetNames: ["win-x64.msi"] },
      { id: "arm64-msi", label: ".msi (ARM64)", assetNames: ["win-arm64.msi"] },
    ],
  },
  {
    os: "macos",
    label: "macOS",
    emoji: "🍎",
    preferred: "arm64-dmg",
    variants: [
      {
        id: "arm64-dmg",
        label: ".dmg (Apple Silicon)",
        assetNames: ["mac-arm64.dmg"],
      },
      {
        id: "arm64-zip",
        label: ".zip (Apple Silicon)",
        assetNames: ["mac-arm64.zip"],
      },
    ],
  },
  {
    os: "linux",
    label: "Linux",
    emoji: "🐧",
    preferred: "x64-AppImage",
    variants: linuxVariants,
  },
];

function releaseAssetName(version: string, suffix: string): string {
  return `Vectora-${version}-${suffix}`;
}

export function resolveDownloadPlatforms(
  release: LatestRelease | null | undefined,
): DownloadPlatform[] {
  if (!release) return [];
  const assetsByName = new Map(
    release.assets.map((asset) => [asset.name, asset]),
  );

  return PLATFORM_DEFINITIONS.flatMap((platform) => {
    const available = platform.variants.flatMap((variant) => {
      const asset = variant.assetNames
        .map((suffix) =>
          assetsByName.get(releaseAssetName(release.version, suffix)),
        )
        .find((candidate) => candidate !== undefined);
      return asset
        ? [{ id: variant.id, label: variant.label, url: asset.url }]
        : [];
    });
    const primary =
      available.find((variant) => variant.id === platform.preferred) ??
      available[0];
    if (!primary) return [];
    return [
      {
        os: platform.os,
        label: platform.label,
        emoji: platform.emoji,
        primary,
        others: available.filter((variant) => variant !== primary),
      },
    ];
  });
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
