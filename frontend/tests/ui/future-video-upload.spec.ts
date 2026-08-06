import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  MAX_FUTURE_VIDEO_SIZE_BYTES,
  validateFutureVideoFile,
} from '../../app/services/futureVideoService';

describe('future video file validation', () => {
  it('accepts a supported video within the upload limit', () => {
    expect(validateFutureVideoFile({ type: 'video/mp4', size: 1024 })).toBeNull();
  });

  it('rejects non-video files', () => {
    expect(validateFutureVideoFile({ type: 'image/png', size: 1024 })).toBe(
      'Tệp đã chọn không phải video hợp lệ.',
    );
  });

  it('rejects videos larger than 100 MB', () => {
    expect(
      validateFutureVideoFile({
        type: 'video/webm',
        size: MAX_FUTURE_VIDEO_SIZE_BYTES + 1,
      }),
    ).toBe('Video cần có dung lượng không quá 100 MB.');
  });
});

describe('future video draft binding', () => {
  const appScript = readFileSync(
    join(__dirname, '..', '..', 'public', 'app.js'),
    'utf8',
  );

  it('does not carry a backend letter ID into a newly reset draft', () => {
    const resetDraft = appScript.slice(
      appScript.indexOf('function resetDraft'),
      appScript.indexOf('function toast'),
    );
    expect(resetDraft).toContain(
      'localStorage.removeItem("postdrop-pending-letter-id")',
    );
  });

  it('validates a reusable letter is an owned draft before video upload', () => {
    const ensureDraft = appScript.slice(
      appScript.indexOf('async function ensureDraftLetter'),
      appScript.indexOf('function ensureVideoStepLetterId'),
    );
    expect(ensureDraft).toContain(
      '`/api/letters/${encodeURIComponent(existingId)}`',
    );
    expect(ensureDraft).toContain(
      "existingLetter.contentStatus === 'draft'",
    );
    expect(ensureDraft).toContain(
      "localStorage.removeItem('postdrop-pending-letter-id')",
    );
  });
});
