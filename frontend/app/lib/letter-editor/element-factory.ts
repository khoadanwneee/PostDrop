import { PAPER_CONFIGS } from '@/app/config/paper-configs';
import type {
  PaperOrientation,
  SafeArea,
  StickerDefinition,
  ThemeElement,
} from '@/app/types/letter-editor';
import { findNearestValidPosition } from './collision';

const edgePlacements = [
  { x: 0.03, y: 0.05 },
  { x: 0.82, y: 0.06 },
  { x: 0.03, y: 0.83 },
  { x: 0.82, y: 0.84 },
];

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function withInitial(
  element: Omit<ThemeElement, 'initial'>,
): ThemeElement {
  return {
    ...element,
    initial: {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.rotation,
    },
  };
}

export function createImageElement(
  sticker: StickerDefinition,
  safeArea: SafeArea,
  orientation: PaperOrientation,
  index: number,
  src = sticker.src,
  dropCenter?: { x: number; y: number },
): ThemeElement {
  const placement = edgePlacements[index % edgePlacements.length];
  const width = sticker.defaultWidth;
  const height = Math.min(
    0.22,
    (width * PAPER_CONFIGS[orientation].aspectRatio) /
      Math.max(0.01, sticker.aspectRatio),
  );
  const element = withInitial({
    id: createId('element'),
    type: 'image',
    kind: sticker.kind,
    src,
    alt: sticker.name,
    x: dropCenter ? dropCenter.x - width / 2 : placement.x,
    y: dropCenter ? dropCenter.y - height / 2 : placement.y,
    width,
    height,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    zIndex: index + 100,
    locked: false,
    source: 'user',
  });

  return findNearestValidPosition(
    element,
    safeArea,
    PAPER_CONFIGS[orientation],
  );
}

export function createTextElement(
  safeArea: SafeArea,
  orientation: PaperOrientation,
  index: number,
): ThemeElement {
  const placement = edgePlacements[index % edgePlacements.length];
  return findNearestValidPosition(
    withInitial({
      id: createId('text'),
      type: 'text',
      kind: 'text',
      text: 'một chút yêu thương ♡',
      x: placement.x,
      y: placement.y,
      width: 0.22,
      height: 0.055,
      rotation: -4,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      zIndex: index + 100,
      locked: false,
      source: 'user',
      fill: '#7a263a',
    }),
    safeArea,
    PAPER_CONFIGS[orientation],
  );
}

export function createShapeElement(
  safeArea: SafeArea,
  orientation: PaperOrientation,
  index: number,
): ThemeElement {
  const placement = edgePlacements[index % edgePlacements.length];
  return findNearestValidPosition(
    withInitial({
      id: createId('shape'),
      type: 'shape',
      kind: 'shape',
      shape: 'circle',
      x: placement.x,
      y: placement.y,
      width: 0.08,
      height: 0.056,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 0.82,
      zIndex: index + 100,
      locked: false,
      source: 'user',
      fill: '#e9a8b8',
      stroke: '#ffffff',
    }),
    safeArea,
    PAPER_CONFIGS[orientation],
  );
}

export function duplicateElement(
  element: ThemeElement,
  safeArea: SafeArea,
  orientation: PaperOrientation,
  zIndex: number,
): ThemeElement {
  return findNearestValidPosition(
    withInitial({
      ...element,
      id: createId('element'),
      x: element.x + 0.025,
      y: element.y + 0.025,
      zIndex,
      locked: false,
      source: 'user',
    }),
    safeArea,
    PAPER_CONFIGS[orientation],
  );
}
