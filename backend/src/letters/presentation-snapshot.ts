import { BadRequestException } from '@nestjs/common';

const MAX_SNAPSHOT_BYTES = 2 * 1024 * 1024;
const MAX_ELEMENTS = 250;
const SAFE_APP_IMAGE = /^\/[a-z0-9_./-]+\.(?:avif|gif|jpe?g|png|svg|webp)$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function finiteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function validElement(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (
    typeof value.id !== 'string' ||
    value.id.length < 1 ||
    value.id.length > 120 ||
    !['image', 'text', 'shape'].includes(String(value.type)) ||
    !['theme', 'user'].includes(String(value.source))
  ) {
    return false;
  }
  for (const key of [
    'x',
    'y',
    'width',
    'height',
    'rotation',
    'scaleX',
    'scaleY',
    'opacity',
    'zIndex',
  ]) {
    if (!finiteNumber(value[key])) return false;
  }
  if (
    (value.x as number) < 0 ||
    (value.y as number) < 0 ||
    (value.width as number) <= 0 ||
    (value.height as number) <= 0 ||
    (value.x as number) + (value.width as number) > 1.001 ||
    (value.y as number) + (value.height as number) > 1.001 ||
    (value.opacity as number) < 0 ||
    (value.opacity as number) > 1
  ) {
    return false;
  }
  if (value.type === 'image') {
    const safeSource =
      typeof value.src === 'string' && SAFE_APP_IMAGE.test(value.src);
    const attachmentReference =
      typeof value.attachmentClientId === 'string' &&
      value.attachmentClientId.length > 0 &&
      value.attachmentClientId.length <= 120;
    if (!safeSource && !attachmentReference) return false;
  }
  return true;
}

export function sanitizePresentationSnapshot(
  value: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (value === undefined) return undefined;
  let serialized: string;
  try {
    serialized = JSON.stringify(value);
  } catch {
    throw new BadRequestException('The presentation snapshot is invalid');
  }
  if (Buffer.byteLength(serialized, 'utf8') > MAX_SNAPSHOT_BYTES) {
    throw new BadRequestException('The presentation snapshot is too large');
  }
  if (
    value.schemaVersion !== 1 ||
    !['portrait', 'landscape'].includes(String(value.paperOrientation)) ||
    typeof value.selectedThemeId !== 'string' ||
    !isRecord(value.canvas) ||
    !isRecord(value.typography) ||
    !isRecord(value.safeArea) ||
    !Array.isArray(value.elements) ||
    value.elements.length > MAX_ELEMENTS ||
    !value.elements.every(validElement)
  ) {
    throw new BadRequestException('The presentation snapshot is invalid');
  }
  return JSON.parse(serialized) as Record<string, unknown>;
}
