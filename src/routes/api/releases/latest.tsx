import { createFileRoute } from "@tanstack/react-router";
import { fetchLatestGithubRelease } from "#/server/github-releases";

export const Route = createFileRoute("/api/releases/latest")({
  loader: () => fetchLatestGithubRelease(),
  component: () => null,
});
