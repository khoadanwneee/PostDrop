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
    // Both clips are letterboxed onto an identical 1280x720 canvas before
    // concatenation. concat requires every input to share the exact same
    // frame size — scaling by width alone (scale=1280:-2) leaves differently
    // *oriented* clips (e.g. a portrait phone recording next to a landscape
    // webcam one) at different heights, which makes the concat filter fail.
    // exec() doesn't throw on that failure (see the exitCode check below),
    // it just leaves output.mp4 empty/corrupt, so the merge silently
    // "succeeded" into an unplayable black video.
    const exitCode = await ffmpeg.exec([
      '-i', 'original.input',
      '-i', 'reply.input',
      '-filter_complex',
      '[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1[v0];' +
        '[1:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1[v1];' +
        '[v0][0:a][v1][1:a]concat=n=2:v=1:a=1[v][a]',
      '-map', '[v]',
      '-map', '[a]',
      '-c:v', 'libx264',
      // ffmpeg.wasm runs single-threaded in the browser, so the default
      // "medium" x264 preset is painfully slow for anything beyond a few
      // seconds of footage. "ultrafast" trades a larger output file for a
      // large cut in encode time — worth it for a client-side demo merge.
      '-preset', 'ultrafast',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      'output.mp4',
    ]);
    if (exitCode !== 0) {
      throw new Error(`Ghép video thất bại (mã lỗi ${exitCode}).`);
    }

    const data = await ffmpeg.readFile('output.mp4');
    return new Blob([data as unknown as BlobPart], { type: 'video/mp4' });
  } finally {
    currentProgressHandler = null;
    await ffmpeg.deleteFile('original.input').catch(() => {});
    await ffmpeg.deleteFile('reply.input').catch(() => {});
    await ffmpeg.deleteFile('output.mp4').catch(() => {});
  }
}
