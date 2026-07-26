import type {
  CanvasSize,
  SafeArea,
  ThemeElement,
} from '@/app/types/letter-editor';

export interface BoundingBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

const EPSILON = 0.00001;

export function getElementBoundingBox(
  element: ThemeElement,
  canvasSize: CanvasSize = { width: 1, height: 1 },
): BoundingBox {
  const canvasWidth = Math.max(EPSILON, canvasSize.width);
  const canvasHeight = Math.max(EPSILON, canvasSize.height);
  const normalizedWidth = Math.abs(element.width * element.scaleX);
  const normalizedHeight = Math.abs(element.height * element.scaleY);
  const width = normalizedWidth * canvasWidth;
  const height = normalizedHeight * canvasHeight;
  const centerX = (element.x + normalizedWidth / 2) * canvasWidth;
  const centerY = (element.y + normalizedHeight / 2) * canvasHeight;
  const radians = (element.rotation * Math.PI) / 180;
  const rotatedWidth =
    Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians));
  const rotatedHeight =
    Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians));

  return {
    left: (centerX - rotatedWidth / 2) / canvasWidth,
    top: (centerY - rotatedHeight / 2) / canvasHeight,
    right: (centerX + rotatedWidth / 2) / canvasWidth,
    bottom: (centerY + rotatedHeight / 2) / canvasHeight,
    width: rotatedWidth / canvasWidth,
    height: rotatedHeight / canvasHeight,
  };
}

export function isOverlappingSafeArea(
  element: ThemeElement,
  safeArea: SafeArea,
  canvasSize: CanvasSize = { width: 1, height: 1 },
): boolean {
  const box = getElementBoundingBox(element, canvasSize);
  const safeAreaRight = safeArea.x + safeArea.width;
  const safeAreaBottom = safeArea.y + safeArea.height;

  return (
    box.right > safeArea.x + EPSILON &&
    box.left < safeAreaRight - EPSILON &&
    box.bottom > safeArea.y + EPSILON &&
    box.top < safeAreaBottom - EPSILON
  );
}

export function clampElementToCanvas(
  element: ThemeElement,
  canvasSize: CanvasSize = { width: 1, height: 1 },
): ThemeElement {
  const next = { ...element };
  const box = getElementBoundingBox(next, canvasSize);
  let shiftX = 0;
  let shiftY = 0;

  if (box.left < 0) shiftX = -box.left;
  if (box.right > 1) shiftX = 1 - box.right;
  if (box.top < 0) shiftY = -box.top;
  if (box.bottom > 1) shiftY = 1 - box.bottom;

  next.x += shiftX;
  next.y += shiftY;
  return next;
}

export function findNearestValidPosition(
  element: ThemeElement,
  safeArea: SafeArea,
  canvasSize: CanvasSize = { width: 1, height: 1 },
): ThemeElement {
  const clamped = clampElementToCanvas(element, canvasSize);
  if (element.type === 'image' && element.source === 'user') return clamped;
  if (!isOverlappingSafeArea(clamped, safeArea, canvasSize)) return clamped;

  const box = getElementBoundingBox(clamped, canvasSize);
  const safeRight = safeArea.x + safeArea.width;
  const safeBottom = safeArea.y + safeArea.height;
  const candidates = [
    { axis: 'x', delta: safeArea.x - box.right },
    { axis: 'x', delta: safeRight - box.left },
    { axis: 'y', delta: safeArea.y - box.bottom },
    { axis: 'y', delta: safeBottom - box.top },
  ]
    .sort((first, second) => Math.abs(first.delta) - Math.abs(second.delta))
    .map(({ axis, delta }) =>
      clampElementToCanvas(
        {
          ...clamped,
          x: clamped.x + (axis === 'x' ? delta : 0),
          y: clamped.y + (axis === 'y' ? delta : 0),
        },
        canvasSize,
      ),
    );

  return (
    candidates.find(
      (candidate) =>
        !isOverlappingSafeArea(candidate, safeArea, canvasSize),
    ) ?? clamped
  );
}

export function normalizeElementsForSafeArea(
  elements: ThemeElement[],
  safeArea: SafeArea,
  canvasSize: CanvasSize = { width: 1, height: 1 },
): ThemeElement[] {
  return elements.map((element) =>
    findNearestValidPosition(element, safeArea, canvasSize),
  );
}
