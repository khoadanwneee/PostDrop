import { PAPER_CONFIGS } from '@/app/config/paper-configs';
import type {
  PaperOrientation,
  SafeArea,
  ThemeElement,
} from '@/app/types/letter-editor';
import {
  clampElementToCanvas,
  findNearestValidPosition,
  isOverlappingSafeArea,
} from './collision';

function fitElementToCanvas(
  element: ThemeElement,
  orientation: PaperOrientation,
): ThemeElement {
  let next = { ...element };
  const maximumDimension = Math.max(
    next.width,
    next.height,
    0.00001,
  );
  if (maximumDimension > 0.96) {
    const scale = 0.96 / maximumDimension;
    next = {
      ...next,
      width: next.width * scale,
      height: next.height * scale,
    };
  }
  return clampElementToCanvas(next, PAPER_CONFIGS[orientation]);
}

/**
 * Converts normalized dimensions through physical A4 sizes so the rendered
 * element aspect ratio remains unchanged when the page axes swap.
 */
export function convertElementForOrientation(
  element: ThemeElement,
  fromOrientation: PaperOrientation,
  toOrientation: PaperOrientation,
): ThemeElement {
  if (fromOrientation === toOrientation) {
    return {
      ...element,
      initial: { ...element.initial },
    };
  }

  const from = PAPER_CONFIGS[fromOrientation];
  const to = PAPER_CONFIGS[toOrientation];
  const centerX = element.x + element.width / 2;
  const centerY = element.y + element.height / 2;
  const width = (element.width * from.width) / to.width;
  const height = (element.height * from.height) / to.height;

  return {
    ...element,
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
    initial: { ...element.initial },
  };
}

export function repositionElementsForOrientation(
  elements: ThemeElement[],
  fromOrientation: PaperOrientation,
  toOrientation: PaperOrientation,
  safeArea: SafeArea,
): ThemeElement[] {
  const canvasSize = PAPER_CONFIGS[toOrientation];
  return elements.map((element) => {
    const converted = fitElementToCanvas(
      convertElementForOrientation(
        element,
        fromOrientation,
        toOrientation,
      ),
      toOrientation,
    );
    let positioned = findNearestValidPosition(
      converted,
      safeArea,
      canvasSize,
    );
    if (
      (element.type !== 'image' || element.source !== 'user') &&
      isOverlappingSafeArea(positioned, safeArea, canvasSize)
    ) {
      const centerX = positioned.x + positioned.width / 2;
      const centerY = positioned.y + positioned.height / 2;
      for (let scale = 0.9; scale >= 0.3; scale -= 0.1) {
        const width = converted.width * scale;
        const height = converted.height * scale;
        const candidate = findNearestValidPosition(
          {
            ...converted,
            x: centerX - width / 2,
            y: centerY - height / 2,
            width,
            height,
          },
          safeArea,
          canvasSize,
        );
        if (!isOverlappingSafeArea(candidate, safeArea, canvasSize)) {
          positioned = candidate;
          break;
        }
      }
    }
    return {
      ...positioned,
      initial: {
        x: positioned.x,
        y: positioned.y,
        width: positioned.width,
        height: positioned.height,
        rotation: positioned.rotation,
      },
    };
  });
}
