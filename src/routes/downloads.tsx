import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { m } from "#/paraglide/messages";
import Container from "#/components/shared/Container";
import PageHeader from "#/components/shared/PageHeader";
import {
  detectOS,
  resolveDownloadPlatforms,
  type OS,
} from "#/lib/download-assets";
import { useLatestRelease } from "#/hooks/use-latest-version";

const INSTALL_MESSAGES: Record<OS, () => string> = {
  windows: m.downloads_install_windows,
  macos: m.downloads_install_macos,
  linux: m.downloads_install_linux,
};

export const Route = createFileRoute("/downloads")({
  head: () => ({
    meta: [
      { title: m.page_downloads_title() },
      { name: "description", content: m.page_downloads_desc() },
    ],
  }),
  component: DownloadsPage,
});

function DownloadsPage() {
  const [userOS, setUserOS] = useState<OS | null>(null);
  // detectOS() lê navigator.userAgent — não existe no SSR, só no cliente.
  // oxlint-disable-next-line set-state-in-effect
  useEffect(() => setUserOS(detectOS()), []);
  const { data: release, isPending, isError } = useLatestRelease();
  const platforms = resolveDownloadPlatforms(release);
  const ordered = [...platforms].sort((a, b) =>
    a.os === userOS ? -1 : b.os === userOS ? 1 : 0,
  );

  return (
    <Container size="default" className="py-16">
      <PageHeader title={m.page_downloads_title()}>
        <p className="mt-2 text-muted-foreground">{m.page_downloads_desc()}</p>
        {release && (
          <p className="mt-1 text-xs text-muted-foreground">
            {m.current_version_label()}: v{release.version}
          </p>
        )}
      </PageHeader>

      {isPending && (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          {m.downloads_release_loading()}
        </p>
      )}
      {(isError || (!isPending && platforms.length === 0)) && (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          {m.downloads_release_unavailable()}{" "}
          <a
            href="https://github.com/vectora-company/vectora/releases/latest"
            className="text-primary underline"
          >
            {m.downloads_cta()}
          </a>
        </p>
      )}

      {platforms.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {ordered.map((platform) => {
            const recommended = platform.os === userOS;
            return (
              <div
                key={platform.os}
                className={`flex flex-col gap-4 rounded-2xl border p-6 transition-all ${
                  recommended
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card/30"
                }`}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <span className="h-5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                    {recommended ? m.downloads_recommended() : ""}
                  </span>
                  <span className="text-4xl leading-none" aria-hidden>
                    {platform.emoji}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">
                      {platform.label}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {platform.primary.label}
                    </p>
                  </div>
                  <a
                    href={platform.primary.url}
                    className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Download className="h-4 w-4" />
                    {m.downloads_cta()}
                  </a>
                </div>

                {platform.others.length > 0 && (
                  <div className="border-t border-border pt-3">
                    <p className="mb-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {m.downloads_other_variants()}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {platform.others.map((variant) => (
                        <a
                          key={variant.id}
                          href={variant.url}
                          aria-label={`${m.downloads_cta()}: ${platform.label} ${variant.label}`}
                          className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                          {variant.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <p className="border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
                  {INSTALL_MESSAGES[platform.os]()}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        {m.downloads_footer()}
      </p>
    </Container>
  );
}
