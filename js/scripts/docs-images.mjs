// Documentation images (DOC-005): every picture of a widget in docs/img/ is
// captured here from the built front end, in the day (light) and the night
// (dark) theme, so that the site never shows an older look than the code.
// The Docs workflow runs it before building the site.
//
//   npm run build && npm run images
//
// Each <section data-shot="name"> of js/preview/index.html gives
// docs/img/<name>-light.png and docs/img/<name>-dark.png.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..", "..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".map": "application/json" };

if (!existsSync(join(ROOT, "src/anywidget_automotives/static/index.js"))) {
  console.error("the front end is not built: run `npm run build` first");
  process.exit(1);
}

// the page imports the bundle as a module: it needs http, not file://
const server = createServer((req, res) => {
  const path = normalize(join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname)));
  if (!path.startsWith(ROOT) || !existsSync(path) || !statSync(path).isFile()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" });
  createReadStream(path).pipe(res);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}/js/preview/index.html`;

// Playwright's own browser, or the one of the environment (PLAYWRIGHT_CHROMIUM)
const executablePath = process.env.PLAYWRIGHT_CHROMIUM || undefined;
const browser = await chromium.launch({ executablePath });
try {
  for (const theme of ["light", "dark"]) {
    const page = await browser.newPage({ viewport: { width: 1000, height: 800 }, deviceScaleFactor: 2, colorScheme: theme, reducedMotion: "reduce" });
    await page.goto(`${base}?theme=${theme}`);
    await page.locator("body[data-ready=true]").waitFor();
    // the views draw on the next animation frame
    await page.waitForTimeout(300);
    for (const section of await page.locator("section[data-shot]").all()) {
      const name = await section.getAttribute("data-shot");
      const out = join("docs", "img", `${name}-${theme}.png`);
      await section.screenshot({ path: join(ROOT, out) });
      console.log(out);
    }
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
