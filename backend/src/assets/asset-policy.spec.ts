import {
  MAX_ASSET_BYTES,
  storageFileName,
  validateAssetUpload,
} from './asset-policy';

describe('asset upload policy', () => {
  it('accepts supported media within its kind limit', () => {
    expect(validateAssetUpload('sticker', 'image/png', 1024)).toBeNull();
    expect(validateAssetUpload('video', 'video/mp4', MAX_ASSET_BYTES)).toBeNull();
  });

  it('rejects mismatched MIME types and oversized images', () => {
    expect(validateAssetUpload('video', 'image/png', 1024)).toContain(
      'not allowed',
    );
    expect(
      validateAssetUpload('image', 'image/jpeg', 10 * 1024 * 1024 + 1),
    ).toContain('between 1 byte');
  });

  it('builds a safe filename using the MIME type as authority', () => {
    expect(storageFileName('../Ảnh mùa hè.exe', 'image/png')).toBe(
      'Anh-mua-he.png',
    );
  });
});
