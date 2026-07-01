import fs from "node:fs";
import { execFileSync } from "node:child_process";

const presentationId = "1CzayalEY9NVHKxRmBol9MeheOZdJv0IO3sFR8P7mcvs";
const outDir = "/tmp/kairos-lecture/final-thumbs";
fs.mkdirSync(outDir, { recursive: true });

function gws(args) {
  const raw = execFileSync("gws", args, {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  return JSON.parse(raw);
}

const deck = gws([
  "slides", "presentations", "get",
  "--params", JSON.stringify({
    presentationId,
    fields: "presentationId,title,revisionId,slides.objectId",
  }),
  "--format", "json",
]);

for (const [index, slide] of deck.slides.entries()) {
  const thumb = gws([
    "slides", "presentations", "pages", "getThumbnail",
    "--params", JSON.stringify({
      presentationId,
      pageObjectId: slide.objectId,
      "thumbnailProperties.thumbnailSize": "LARGE",
    }),
    "--format", "json",
  ]);
  const response = await fetch(thumb.contentUrl);
  if (!response.ok) throw new Error(`thumbnail ${index + 1}: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(
    `${outDir}/${String(index + 1).padStart(3, "0")}.png`,
    buffer,
  );
  console.log(`${String(index + 1).padStart(3, "0")} ${slide.objectId}`);
}

console.log(JSON.stringify({
  title: deck.title,
  revisionId: deck.revisionId,
  slideCount: deck.slides.length,
  output: outDir,
}, null, 2));
