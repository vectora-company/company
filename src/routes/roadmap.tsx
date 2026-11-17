import { createFileRoute } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { m } from "#/paraglide/messages";
import Container from "#/components/shared/Container";
import PageHeader from "#/components/shared/PageHeader";
import roadmap from "#/content/vectora-roadmap.md?raw";
import changelog from "#/content/vectora-latest-changelog.md?raw";
import release from "#/content/vectora-version.json";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: m.page_roadmap_title() },
      { name: "description", content: m.page_roadmap_desc() },
      {
        property: "og:image",
        content: `/api/og?title=${encodeURIComponent(m.page_roadmap_title())}&desc=${encodeURIComponent(m.page_roadmap_desc())}`,
      },
    ],
  }),
  component: RoadmapPage,
});

function Markdown({ source }: { source: string }) {
  return (
    <div className="prose max-w-none text-foreground dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}

function RoadmapPage() {
  return (
    <Container size="prose" className="py-16">
      <PageHeader
        title={m.page_roadmap_title()}
        subtitle={m.page_roadmap_desc()}
      />
      <div className="mt-8 rounded-2xl border border-border bg-card/30 p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Vectora v{release.version}
          </h2>
          <a
            href="https://github.com/vectora-company/vectora/blob/master/ROADMAP.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline"
          >
            {m.page_roadmap_source()}
          </a>
        </div>
        <Markdown source={roadmap} />
      </div>
      <section className="mt-10 rounded-2xl border border-border bg-card/30 p-6 sm:p-8">
        <h2 className="mb-5 text-xl font-semibold text-foreground">
          {m.page_roadmap_changelog()}
        </h2>
        <Markdown source={changelog} />
      </section>
    </Container>
  );
}
