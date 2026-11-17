import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const upstream = process.argv[2] ?? ".upstream/vectora";
const readme = (path) => readFile(join(upstream, path), "utf8");
const [upstreamRoadmap, fullChangelog, packageJson] = await Promise.all([
  readme("ROADMAP.md").catch(async (error) => {
    if (error.code !== "ENOENT") throw error;
    console.warn(
      "ROADMAP.md ainda não está no branch principal do Vectora; mantendo a cópia versionada.",
    );
    return readFile("src/content/vectora-roadmap.md", "utf8");
  }),
  readme("CHANGELOG.md"),
  readme("frontend/package.json").then(JSON.parse),
]);
const roadmap = upstreamRoadmap;
const headings = [...fullChangelog.matchAll(/^## \[/gm)];
const latestChangelog =
  headings.length > 1
    ? fullChangelog.slice(headings[0].index, headings[1].index).trim()
    : fullChangelog.trim();
const output = "src/content";
await mkdir(output, { recursive: true });
await Promise.all([
  writeFile(join(output, "vectora-roadmap.md"), roadmap),
  writeFile(
    join(output, "vectora-latest-changelog.md"),
    `${latestChangelog}\n`,
  ),
  writeFile(
    join(output, "vectora-version.json"),
    `${JSON.stringify({ version: packageJson.version }, null, 2)}\n`,
  ),
]);
console.log(
  `Conteúdo público do Vectora sincronizado: v${packageJson.version}`,
);
