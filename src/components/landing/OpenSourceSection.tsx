import { ExternalLink, BookOpen, Code2, Sparkles } from "lucide-react";
import { m } from "#/paraglide/messages";
import { getDocsUrl } from "#/lib/docs-url";

export default function OpenSourceSection() {
  const links = [
    {
      Icon: Code2,
      label: m.opensource_repository_link,
      href: "https://github.com/vectora-company/vectora",
    },
    {
      Icon: BookOpen,
      label: m.opensource_docs_link,
      href: getDocsUrl("guides/release-0.1.24"),
    },
    {
      Icon: Sparkles,
      label: m.opensource_pricing_link,
      href: "https://vectora.company/#pricing",
    },
  ];

  return (
    <section className="px-4 py-[23px] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1024px] flex-col gap-5 rounded-2xl border border-border bg-card/40 p-6 sm:p-8">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {m.opensource_eyebrow()}
          </p>
          <h2 className="text-[24px] font-semibold leading-8 text-foreground sm:text-[28px]">
            {m.opensource_title()}
          </h2>
          <p className="max-w-[850px] text-sm leading-6 text-muted-foreground sm:text-base">
            {m.opensource_description()}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {links.map(({ Icon, label, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label()}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
