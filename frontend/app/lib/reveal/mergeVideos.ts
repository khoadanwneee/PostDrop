// Client-side merge of the compose-time "future video" and the recipient's
// reply video, recorded on the reveal page, into a single downloadable file.
// Runs entirely in the browser via ffmpeg.wasm — the merged result is never
// uploaded anywhere (see the reveal-page component for the download step).
//
// The ffmpeg-core assets are self-hosted from public/ffmpeg/ (copied from
// @ffmpeg/core by scripts/copy-ffmpeg-core.js on `npm install`) rather than
// loaded from a third-party CDN, and we use the single-threaded core build
// so no Cross-Origin-Opener/Embedder-Policy headers are required.
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegSingleton: FFmpeg | null = null;
let loadPromise: Promise<void> | null = null;
let currentProgressHandler: ((ratio: number) => void) | null = null;

function getFfmpeg(): FFmpeg {
  if (!ffmpegSingleton) {
    ffmpegSingleton = new FFmpeg();
    // Registered once for the lifetime of the singleton; individual
    // mergeVideos() calls swap out `currentProgressHandler` instead of
    // re-subscribing (FFmpeg's `off()` requires the exact same callback
    // reference, which a fresh closure per call wouldn't provide).
    ffmpegSingleton.on('progress', ({ progress }) => {
      currentProgressHandler?.(Math.min(1, Math.max(0, progress)));
    });
  }
  return ffmpegSingleton;
}

async function ensureLoaded(ffmpeg: FFmpeg): Promise<void> {
  if (ffmpeg.loaded) return;
  loadPromise ??= (async () => {
    const coreURL = await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript');
    const wasmURL = await toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm');
    await ffmpeg.load({ coreURL, wasmURL });
  })();
  await loadPromise;
}

export interface MergeVideosOptions {
  onProgress?: (ratio: number) => void;
  onStatus?: (status: 'loading-engine' | 'processing') => void;
}

/**
 * Concatenates `original` followed by `reply` into a single MP4 Blob.
 * Both inputs are transcoded (not stream-copied) before concatenation,
 * since the two clips are very likely to use different codecs/containers
 * (the original may be webm/vp8+opus, the reply's format depends on the
 * recording browser) — the concat filter handles that safely.
 */
export async function mergeVideos(
  original: Blob,
  reply: Blob,
  options: MergeVideosOptions = {},
): Promise<Blob> {
  options.onStatus?.('loading-engine');
  const ffmpeg = getFfmpeg();
  currentProgressHandler = options.onProgress ?? null;
  await ensureLoaded(ffmpeg);

  options.onStatus?.('processing');
  await ffmpeg.writeFile(
    'original.input',
    new Uint8Array(await original.arrayBuffer()),
  );
  await ffmpeg.writeFile(
    'reply.input',
    new Uint8Array(await reply.arrayBuffer()),
  );

  try {
    await ffmpeg.exec([
      '-i', 'original.input',
      '-i', 'reply.input',
      '-filter_complex',
      '[0:v]scale=1280:-2,setsar=1[v0];[1:v]scale=1280:-2,setsar=1[v1];[v0][0:a][v1][1:a]concat=n=2:v=1:a=1[v][a]',
      '-map', '[v]',
      '-map', '[a]',
      '-c:v', 'libx264',
      '-c:a', 'aac',
      'output.mp4',
    ]);

    const data = await ffmpeg.readFile('output.mp4');
    return new Blob([data as unknown as BlobPart], { type: 'video/mp4' });
  } finally {
    currentProgressHandler = null;
    await ffmpeg.deleteFile('original.input').catch(() => {});
    await ffmpeg.deleteFile('reply.input').catch(() => {});
    await ffmpeg.deleteFile('output.mp4').catch(() => {});
  }
}
