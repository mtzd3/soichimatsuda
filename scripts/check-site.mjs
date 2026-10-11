import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "..");
const base = "https://mtzd3.github.io/soichimatsuda/";
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const attributes = (tag) =>
  Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
const tags = (source, name) => [...source.matchAll(new RegExp(`<${name}\\b[^>]*>`, "g"))].map((m) => attributes(m[0]));
const hasCanonical = (source) => tags(source, "link").some((tag) => tag.rel === "canonical" && tag.href === base);
assert.match(html, /<html lang="ja">/);
assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, "One h1");
assert.match(html, /<title>[^<]+<\/title>/);
assert.ok(tags(html, "meta").some((tag) => tag.name === "description" && tag.content), "SEO description");
assert.ok(hasCanonical(html), "Canonical URL");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
assert.equal(ids.length, new Set(ids).size, "No duplicate IDs");
assert.ok(ids.includes("main") && ids.includes("contact"));
const schema = JSON.parse(
  html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1],
);
assert.equal(schema["@context"], "https://schema.org");
assert.ok(schema["@graph"].some((node) => node["@type"] === "Person"));
assert.ok(schema["@graph"].some((node) => node["@type"] === "WebPage"));
assert.ok(!html.includes("<form"), "No contact form");
assert.ok(!html.includes("mailto:"), "No crawlable email URL");
assert.ok(
  !html.includes("s.matsuda0913@gmail.com"),
  "No literal mailbox in HTML",
);
assert.ok(html.includes("s.matsuda0913[アット]gmail.com"));
assert.ok(!html.includes("logo-mark.svg"), "No old graphic logo");
for (const account of [
  "note.com",
  "x.com/",
  "twitter.com",
  "linkedin.com",
  "facebook.com",
  "@mtzd3",
  '"sameAs"',
])
  assert.ok(!html.includes(account), `No social account: ${account}`);
assert.ok(
  tags(html, "a").every((tag) => tag.href.startsWith("#")),
  "No links leaving the page",
);
assert.ok(!html.includes("insight-link"), "No inline text links");
for (const [, raw] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
  const url = new URL(raw, `${base}index.html`);
  if (!url.href.startsWith(base)) continue;
  const target =
    url.pathname.slice(new URL(base).pathname.length) || "index.html";
  assert.ok(fs.existsSync(path.join(root, target)), `Missing ${raw}`);
  if (url.hash && target === "index.html")
    assert.ok(ids.includes(url.hash.slice(1)), `Broken anchor ${raw}`);
}
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
assert.equal(
  (sitemap.match(/<loc>/g) || []).length,
  1,
  "One public content page",
);
assert.ok(sitemap.includes(`<loc>${base}</loc>`));
const workflow = fs.readFileSync(
  path.join(root, ".github/workflows/deploy.yml"),
  "utf8",
);
for (const file of [
  "index.html",
  "site.css",
  "site.js",
  "favicon.svg",
  "ogp.svg",
  "ogp.png",
  "robots.txt",
  "sitemap.xml",
])
  assert.ok(
    workflow.includes(`cp -f ${file} _site/`),
    `Deployment missing ${file}`,
  );
assert.ok(
  !workflow.includes("CONTACT_SLACK_WEBHOOK_URL"),
  "No unused form relay injection",
);
for (const file of [
  "ai-advisor.html",
  "deeptech-strategy.html",
  "poc-to-production.html",
]) {
  const redirect = fs.readFileSync(path.join(root, file), "utf8");
  assert.match(redirect, /http-equiv="refresh"/);
  assert.match(redirect, /noindex, follow/);
  assert.ok(hasCanonical(redirect), `Canonical URL for ${file}`);
}
console.log(
  "PASS: single page, SEO, schema, no social accounts or outbound links, email obfuscation, assets and legacy redirects.",
);
