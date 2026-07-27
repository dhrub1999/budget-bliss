#!/usr/bin/env node
/**
 * Landing-page screenshot optimiser.
 *
 * Browser captures come back as JPEG, clamped to roughly the physical display
 * width. This crops off the app chrome, downscales with Lanczos (which also
 * averages away the JPEG ringing around text and the banding in dark panels)
 * and re-encodes as WebP.
 *
 * WebP is the *source* format only — next/image negotiates AVIF/WebP at
 * delivery regardless, so this choice affects repo size and optimisation CPU,
 * not what users receive.
 *
 * Usage:
 *   node scripts/optimize-images.mjs <manifest.json>
 *
 * Manifest:
 *   {
 *     "outdir": "public/images/feature-images",
 *     "images": [
 *       {
 *         "in": "raw/accounts.jpg",
 *         "out": "accounts-overview.webp",
 *         "crop": { "left": 248, "top": 64, "width": 1254, "height": 730 },
 *         "width": 1254
 *       }
 *     ]
 *   }
 *
 * `crop`, `width`, `height` and `format` are all optional. `format` defaults to
 * webp; use jpeg for the OG image, since some link unfurlers still ignore webp.
 * Paths are resolved relative to the manifest's own directory. Writes a
 * `_report.json` beside the outputs with before/after byte counts.
 */

import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

// sharp is a project dependency, not a dependency of this script's own
// location, so resolve it against the repo root rather than import it
// directly — this file can then be run from anywhere.
const BB_ROOT = process.env.BB_ROOT ?? path.resolve(import.meta.dirname, '..');
const require = createRequire(path.join(BB_ROOT, 'package.json'));
const sharp = require('sharp');

const QUALITY = 82;

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

async function main() {
  const manifestPath = process.argv[2];
  if (!manifestPath) {
    console.error('usage: node scripts/optimize-images.mjs <manifest.json>');
    process.exit(1);
  }

  const manifestAbs = path.resolve(manifestPath);
  const base = path.dirname(manifestAbs);
  const manifest = JSON.parse(await readFile(manifestAbs, 'utf8'));

  const outdir = path.resolve(base, manifest.outdir ?? 'out');
  await mkdir(outdir, { recursive: true });

  const report = [];

  for (const image of manifest.images) {
    const inPath = path.resolve(base, image.in);
    const outPath = path.join(outdir, image.out);

    let pipeline = sharp(inPath);
    const meta = await pipeline.metadata();

    if (image.crop) {
      pipeline = pipeline.extract({
        left: image.crop.left,
        top: image.crop.top,
        width: image.crop.width,
        height: image.crop.height
      });
    }

    // Only ever downscale. Upscaling a JPEG capture just makes the artifacts
    // bigger.
    const sourceWidth = image.crop?.width ?? meta.width;
    if (image.width && image.width < sourceWidth) {
      pipeline = pipeline.resize({
        width: image.width,
        height: image.height,
        fit: image.height ? 'cover' : undefined,
        kernel: 'lanczos3',
        withoutEnlargement: true
      });
    }

    pipeline =
      image.format === 'jpeg'
        ? pipeline.jpeg({ quality: 88, mozjpeg: true })
        : pipeline.webp({ quality: QUALITY, effort: 6, smartSubsample: true });

    await pipeline.toFile(outPath);

    const [before, after] = await Promise.all([stat(inPath), stat(outPath)]);
    const out = await sharp(outPath).metadata();

    const row = {
      out: image.out,
      dimensions: `${out.width}x${out.height}`,
      beforeBytes: before.size,
      afterBytes: after.size,
      saved: `${Math.round((1 - after.size / before.size) * 100)}%`
    };
    report.push(row);

    console.log(
      `${image.out.padEnd(32)} ${row.dimensions.padEnd(11)} ` +
        `${kb(before.size).padStart(9)} → ${kb(after.size).padStart(9)}  (${row.saved} smaller)`
    );
  }

  await writeFile(
    path.join(outdir, '_report.json'),
    JSON.stringify(report, null, 2) + '\n'
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
