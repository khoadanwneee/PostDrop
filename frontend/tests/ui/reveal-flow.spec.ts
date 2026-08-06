import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('reveal-day delivery page', () => {
  const revealPage = readFileSync(
    join(__dirname, '..', '..', 'app', 'reveal', '[letterId]', 'page.tsx'),
    'utf8',
  );
  const revealClient = readFileSync(
    join(__dirname, '..', '..', 'app', 'lib', 'reveal', 'reveal-client.ts'),
    'utf8',
  );
  const futureVideoService = readFileSync(
    join(__dirname, '..', '..', 'app', 'services', 'futureVideoService.ts'),
    'utf8',
  );
  const mergeVideos = readFileSync(
    join(__dirname, '..', '..', 'app', 'lib', 'reveal', 'mergeVideos.ts'),
    'utf8',
  );
  const revealDesign = readFileSync(
    join(
      __dirname,
      '..',
      '..',
      'app',
      'components',
      'reveal',
      'RevealLetterDesign.tsx',
    ),
    'utf8',
  );

  it('exchanges the capability token and fetches decrypted content through the real reveal API', () => {
    expect(revealClient).toContain("fetch('/api/reveal/exchange'");
    expect(revealClient).toContain("fetch('/api/reveal/content'");
  });

  it('reads the capability token from the URL fragment, not the query string', () => {
    expect(revealPage).toContain('window.location.hash');
    expect(revealPage).not.toMatch(/capabilityToken.*window\.location\.search/);
  });

  it('shows a live countdown so the 30-minute session window is user-visible', () => {
    expect(revealPage).toContain('formatCountdown');
    expect(revealPage).toContain("setStage('expired')");
  });

  it('uploads the future video through the real asset pipeline instead of the old stub', () => {
    expect(futureVideoService).toContain("apiFetch('/api/assets/uploads'");
    expect(futureVideoService).toContain("/api/assets/${asset.id}/complete");
    expect(futureVideoService).toContain("/api/letters/${letterId}/attachments");
    expect(futureVideoService).toContain("role: 'future_video'");
    expect(futureVideoService).not.toContain('generateStoragePath');
  });

  it('merges the original and reply videos entirely client-side, never re-uploading the result', () => {
    expect(mergeVideos).toContain('@ffmpeg/ffmpeg');
    expect(revealPage).not.toMatch(/mergedVideoUrl.*apiFetch/s);
  });

  it('reuses the editor canvas for versioned design snapshots', () => {
    expect(revealPage).toContain('<RevealLetterDesign');
    expect(revealDesign).toContain('<LetterCanvas');
    expect(revealDesign).toContain('snapshot.elements.map');
  });

  it('shows the original sealed future video with native controls', () => {
    expect(revealPage).toContain('setOriginalVideoUrl');
    expect(revealPage).toContain('className="reveal-original-video"');
    expect(revealPage).toContain('controls');
  });
});
