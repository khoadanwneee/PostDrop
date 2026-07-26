import type { CanvasSize, SafeArea, ThemeElement } from '@/app/types/letter-editor';

export function toPixelRect(
  rect: SafeArea | Pick<ThemeElement, 'x' | 'y' | 'width' | 'height'>,
  canvas: CanvasSize,
) {
  return {
    x: rect.x * canvas.width,
    y: rect.y * canvas.height,
    width: rect.width * canvas.width,
    height: rect.height * canvas.height,
  };
}

export function toNormalizedRect(
  rect: { x: number; y: number; width: number; height: number },
  canvas: CanvasSize,
) {
  return {
    x: rect.x / canvas.width,
    y: rect.y / canvas.height,
    width: rect.width / canvas.width,
    height: rect.height / canvas.height,
  };
}
