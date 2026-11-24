import { z } from "zod";

const RELEASE_API_URL =
  "https://api.github.com/repos/vectora-company/vectora/releases/latest";
const RELEASE_PAGE_URL =
  "https://github.com/vectora-company/vectora/releases/latest";
const CACHE_CONTROL =
  "public, max-age=0, s-maxage=300, stale-while-revalidate=3600";

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

function jsonResponse(
  body: unknown,
  status: number,
  cacheControl: string,
): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": cacheControl,
    },
  });
}

export async function fetchLatestGithubRelease(
  fetcher: typeof fetch = fetch,
): Promise<Response> {
  let response: Response;
  try {
    response = await fetcher(RELEASE_API_URL, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return jsonResponse(
      { error: "release_unavailable", releases_url: RELEASE_PAGE_URL },
      502,
      "no-store",
    );
  }

  if (!response.ok) {
    return jsonResponse(
      { error: "release_unavailable", releases_url: RELEASE_PAGE_URL },
      502,
      "no-store",
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  const parsed = GithubReleaseSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonResponse(
      { error: "invalid_release_response", releases_url: RELEASE_PAGE_URL },
      502,
      "no-store",
    );
  }

  const { tag_name: tag, html_url: releaseUrl, assets } = parsed.data;
  const expectedReleasePath = `/vectora-company/vectora/releases/download/${encodeURIComponent(tag)}/`;
  const expectedTagPath = `/vectora-company/vectora/releases/tag/${encodeURIComponent(tag)}`;
  let releasePageUrl: URL;
  try {
    releasePageUrl = new URL(releaseUrl);
  } catch {
    return jsonResponse(
      { error: "invalid_release_response", releases_url: RELEASE_PAGE_URL },
      502,
      "no-store",
    );
  }
  if (
    releasePageUrl.origin !== "https://github.com" ||
    releasePageUrl.pathname !== expectedTagPath
  ) {
    return jsonResponse(
      { error: "invalid_release_response", releases_url: RELEASE_PAGE_URL },
      502,
      "no-store",
    );
  }

  const downloads = assets.flatMap((asset) => {
    try {
      const url = new URL(asset.browser_download_url);
      if (
        url.origin !== "https://github.com" ||
        !url.pathname.startsWith(expectedReleasePath)
      ) {
        return [];
      }
      return [{ name: asset.name, url: url.toString() }];
    } catch {
      return [];
    }
  });

  return jsonResponse(
    {
      version: tag.replace(/^v/, ""),
      url: releaseUrl,
      releases_url: RELEASE_PAGE_URL,
      assets: downloads,
    },
    200,
    CACHE_CONTROL,
  );
}
