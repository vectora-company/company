import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

export const LATEST_VERSION_QUERY_KEY = ["latest-version"] as const;

export interface LatestRelease {
  version: string;
  url: string;
  releases_url: string;
  assets: Array<{ name: string; url: string }>;
}

const GITHUB_RELEASE_URL =
  "https://api.github.com/repos/vectora-company/vectora/releases/latest";
const RELEASES_PAGE_URL =
  "https://github.com/vectora-company/vectora/releases/latest";

const GithubReleaseSchema = z.object({
  tag_name: z.string().min(1),
  html_url: z.string().url(),
  assets: z.array(
    z.object({
      name: z.string().min(1),
      browser_download_url: z.string().url(),
    }),
  ),
});

async function fetchLatestRelease(): Promise<LatestRelease | null> {
  const response = await fetch(GITHUB_RELEASE_URL, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) return null;
  const parsed = GithubReleaseSchema.safeParse(await response.json());
  if (!parsed.success) return null;

  const { tag_name: tag, html_url: url, assets } = parsed.data;
  return {
    version: tag.replace(/^v/, ""),
    url,
    releases_url: RELEASES_PAGE_URL,
    assets: assets.map(({ name, browser_download_url }) => ({
      name,
      url: browser_download_url,
    })),
  };
}

/** Release publicada mais recente; null quando GitHub estiver indisponível. */
export function useLatestRelease() {
  return useQuery({
    queryKey: LATEST_VERSION_QUERY_KEY,
    queryFn: fetchLatestRelease,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

/** Versão da release publicada mais recente para badges da interface. */
export function useLatestVersion() {
  return useQuery({
    queryKey: LATEST_VERSION_QUERY_KEY,
    queryFn: fetchLatestRelease,
    select: (release) => release?.version ?? null,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
