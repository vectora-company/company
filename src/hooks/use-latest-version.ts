import { useQuery } from "@tanstack/react-query";

export const LATEST_VERSION_QUERY_KEY = ["latest-version"] as const;

export interface LatestRelease {
  version: string;
  url: string;
  releases_url: string;
  assets: Array<{ name: string; url: string }>;
}

async function fetchLatestRelease(): Promise<LatestRelease | null> {
  const response = await fetch("/api/releases/latest");
  if (!response.ok) return null;
  return (await response.json()) as LatestRelease;
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
