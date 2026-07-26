import type { CanvasSize } from '@/app/types/letter-editor';

export const MIN_CANVAS_ZOOM = 0.5;
export const MAX_CANVAS_ZOOM = 2;

export function calculateWheelZoom(current: number, deltaY: number): number {
  const direction = deltaY < 0 ? 1 : -1;
  const next = current + direction * 0.1;
  return Math.min(MAX_CANVAS_ZOOM, Math.max(MIN_CANVAS_ZOOM, Number(next.toFixed(2))));
}

export function calculateFitScale(
  viewport: CanvasSize,
  canvas: CanvasSize,
): number {
  if (
    viewport.width <= 0 ||
    viewport.height <= 0 ||
    canvas.width <= 0 ||
    canvas.height <= 0
  ) {
    return 1;
  }

  return Math.min(
    1,
    viewport.width / canvas.width,
    viewport.height / canvas.height,
  );
}
