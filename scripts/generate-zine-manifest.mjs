import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const zinesDir = path.join(projectRoot, "public", "images", "zines");
const manifestPath = path.join(zinesDir, "manifest.json");

function getAssetOrder(filename) {
  if (filename.includes("_cover.")) {
    return 0;
  }

  const match = filename.match(/_page-(\d+)\./);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

async function generateManifest() {
  await mkdir(zinesDir, { recursive: true });

  const entries = await readdir(zinesDir, { withFileTypes: true });
  const manifest = {};

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    if (entry.name === "manifest.json") {
      continue;
    }

    const match = entry.name.match(/^([^_]+)_(cover|page-\d+)\.(png|jpe?g|webp|avif)$/i);
    if (!match) {
      continue;
    }

    const [, id] = match;
    const current = manifest[id] ?? [];
    current.push(entry.name);
    manifest[id] = current;
  }

  const sortedManifest = Object.fromEntries(
    Object.entries(manifest)
      .sort(([leftId], [rightId]) => leftId.localeCompare(rightId, undefined, { numeric: true }))
      .map(([id, filenames]) => [
        id,
        filenames
          .sort((left, right) => getAssetOrder(left) - getAssetOrder(right))
          .map((filename) => `/images/zines/${filename}`)
      ])
  );

  await writeFile(manifestPath, `${JSON.stringify(sortedManifest, null, 2)}\n`, "utf8");
}

generateManifest().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
