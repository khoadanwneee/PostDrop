export const LETTER_STICKER_MIME = 'application/x-letter-sticker';

interface StickerDragPayload {
  stickerId: string;
}

export function serializeStickerDragPayload(stickerId: string): string {
  return JSON.stringify({ stickerId } satisfies StickerDragPayload);
}

export function parseStickerDragPayload(
  dataTransfer: Pick<DataTransfer, 'getData' | 'types'>,
): string | null {
  if (!Array.from(dataTransfer.types).includes(LETTER_STICKER_MIME)) {
    return null;
  }
  try {
    const parsed = JSON.parse(dataTransfer.getData(LETTER_STICKER_MIME)) as unknown;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      Object.keys(parsed).length !== 1 ||
      typeof (parsed as StickerDragPayload).stickerId !== 'string'
    ) {
      return null;
    }
    const stickerId = (parsed as StickerDragPayload).stickerId;
    return /^[a-z0-9_-]{1,100}$/i.test(stickerId) ? stickerId : null;
  } catch {
    return null;
  }
}

export function hasBlockedExternalAssetDrop(
  dataTransfer: Pick<DataTransfer, 'types'>,
): boolean {
  const types = Array.from(dataTransfer.types);
  return (
    types.includes('Files') ||
    types.includes('text/uri-list') ||
    types.includes('text/html')
  );
}
