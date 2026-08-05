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
