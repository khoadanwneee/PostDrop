export type AssetKind = 'sticker' | 'image' | 'video';

export const MAX_ASSET_BYTES = 50 * 1024 * 1024;

const RULES: Record<
  AssetKind,
  { mimeTypes: readonly string[]; maxBytes: number }
> = {
  sticker: {
    mimeTypes: ['image/gif', 'image/png', 'image/webp'],
    maxBytes: 10 * 1024 * 1024,
  },
  image: {
    mimeTypes: ['image/gif', 'image/jpeg', 'image/png', 'image/webp'],
    maxBytes: 10 * 1024 * 1024,
  },
  video: {
    mimeTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
    maxBytes: MAX_ASSET_BYTES,
  },
};

const MIME_EXTENSIONS: Record<string, string> = {
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
};

export function validateAssetUpload(
  kind: AssetKind,
  mimeType: string,
  byteSize: number,
): string | null {
  const rule = RULES[kind];
  if (!rule.mimeTypes.includes(mimeType)) {
    return `${mimeType} is not allowed for a ${kind} asset`;
  }
  if (byteSize <= 0 || byteSize > rule.maxBytes) {
    return `${kind} assets must be between 1 byte and ${rule.maxBytes} bytes`;
  }
  return null;
}

export function storageFileName(originalName: string, mimeType: string): string {
  const extension = MIME_EXTENSIONS[mimeType];
  const basename =
    originalName
      .replace(/\.[^.]+$/, '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'asset';

  return `${basename}.${extension}`;
}
