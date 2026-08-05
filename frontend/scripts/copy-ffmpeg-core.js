// Copies the single-threaded @ffmpeg/core browser bundle into public/ffmpeg/
// so the reveal page's client-side video merge (see
// app/lib/reveal/mergeVideos.ts) can load it from the app's own origin
// instead of a third-party CDN. Runs automatically on `npm install` via the
// "postinstall" script.
const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(
  __dirname,
  '..',
  'node_modules',
  '@ffmpeg',
  'core',
  'dist',
  'umd',
);
const DEST_DIR = path.join(__dirname, '..', 'public', 'ffmpeg');
const FILES = ['ffmpeg-core.js', 'ffmpeg-core.wasm'];

function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.warn(
      '[copy-ffmpeg-core] @ffmpeg/core is not installed yet — skipping copy.',
    );
    return;
  }
  fs.mkdirSync(DEST_DIR, { recursive: true });
  for (const file of FILES) {
    const source = path.join(SOURCE_DIR, file);
    const dest = path.join(DEST_DIR, file);
    if (!fs.existsSync(source)) {
      console.warn(`[copy-ffmpeg-core] Missing ${source}, skipping.`);
      continue;
    }
    fs.copyFileSync(source, dest);
  }
  console.log('[copy-ffmpeg-core] ffmpeg-core assets copied to public/ffmpeg/.');
}

main();
