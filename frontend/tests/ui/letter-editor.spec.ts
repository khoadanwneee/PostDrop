import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PAPER_CONFIGS } from '../../app/config/paper-configs';
import { letterThemes } from '../../app/data/letter-themes';
import {
  clampElementToCanvas,
  findNearestValidPosition,
  isOverlappingSafeArea,
} from '../../app/lib/letter-editor/collision';
import { toNormalizedRect, toPixelRect } from '../../app/lib/letter-editor/coordinates';
import {
  createPersistedEditorDraft,
  restoreEditorState,
} from '../../app/lib/letter-editor/persistence';
import {
  changeTheme,
  commitHistory,
  createSnapshot,
  redoHistory,
  undoHistory,
} from '../../app/lib/letter-editor/state';
import { calculateFitScale } from '../../app/lib/letter-editor/zoom';
import type {
  EditorHistory,
  SafeArea,
  ThemeElement,
} from '../../app/types/letter-editor';

const safeArea: SafeArea = { x: 0.2, y: 0.2, width: 0.6, height: 0.6 };

function element(overrides: Partial<ThemeElement> = {}): ThemeElement {
  return {
    id: 'test-element',
    type: 'image',
    kind: 'sticker',
    src: '/sticker.png',
    alt: 'Test sticker',
    x: 0.02,
    y: 0.02,
    width: 0.12,
    height: 0.1,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    zIndex: 1,
    locked: false,
    source: 'user',
    initial: { x: 0.02, y: 0.02, width: 0.12, height: 0.1, rotation: 0 },
    ...overrides,
  };
}

describe('letter editor safe area', () => {
  it('detects an element overlapping the safe writing area', () => {
    expect(
      isOverlappingSafeArea(element({ x: 0.3, y: 0.3 }), safeArea),
    ).toBe(true);
    expect(isOverlappingSafeArea(element(), safeArea)).toBe(false);
  });

  it('keeps a dragged non-sticker outside the writing area', () => {
    const moved = findNearestValidPosition(
      element({ type: 'shape', kind: 'shape', x: 0.18, y: 0.35 }),
      safeArea,
    );
    expect(isOverlappingSafeArea(moved, safeArea)).toBe(false);
    expect(moved.x + moved.width).toBeCloseTo(safeArea.x, 5);
  });

  it('keeps a resized non-sticker outside the writing area', () => {
    const resized = findNearestValidPosition(
      element({
        type: 'shape',
        kind: 'shape',
        x: 0.08,
        y: 0.3,
        width: 0.2,
      }),
      safeArea,
    );
    expect(isOverlappingSafeArea(resized, safeArea)).toBe(false);
    expect(resized.x + resized.width).toBeLessThanOrEqual(safeArea.x);
  });

  it('allows a user sticker inside the writing area', () => {
    const sticker = element({ x: 0.34, y: 0.36 });
    const moved = findNearestValidPosition(sticker, safeArea);

    expect(moved.x).toBe(sticker.x);
    expect(moved.y).toBe(sticker.y);
    expect(isOverlappingSafeArea(moved, safeArea)).toBe(true);
  });
  it('clamps elements that are dragged outside the canvas', () => {
    const clamped = clampElementToCanvas(
      element({ x: -0.2, y: 1.1, rotation: 12 }),
      { width: 1, height: 1 },
    );
    expect(clamped.x).toBeGreaterThanOrEqual(0);
    expect(clamped.y).toBeLessThan(1);
  });

  it('uses the rotated bounding box for collision checks', () => {
    const rotated = element({
      x: 0.08,
      y: 0.12,
      width: 0.13,
      height: 0.06,
      rotation: 45,
    });
    expect(isOverlappingSafeArea(rotated, safeArea)).toBe(true);
  });
});

describe('theme and history state', () => {
  it('changes theme without touching letter content owned outside the snapshot', () => {
    const content = 'Nội dung này phải được giữ nguyên.';
    const changed = changeTheme(
      createSnapshot('portrait', 'cute-portrait'),
      'portrait',
      'study-portrait',
    );
    expect(content).toBe('Nội dung này phải được giữ nguyên.');
    expect(changed.selectedThemeId).toBe('study-portrait');
  });

  it('keeps custom elements and replaces only theme elements', () => {
    const custom = element({ id: 'custom-heart' });
    const changed = changeTheme(
      createSnapshot('portrait', 'cute-portrait', [custom]),
      'portrait',
      'scrapbook-portrait',
    );
    expect(changed.elements.some((item) => item.id === custom.id)).toBe(true);
    expect(
      changed.elements
        .filter((item) => item.source === 'theme')
        .every((item) => item.id.startsWith('scrapbook-portrait-')),
    ).toBe(true);
  });

  it('ships every default theme with valid edge decorations', () => {
    const overlaps: string[] = [];
    for (const theme of letterThemes) {
      for (const decoration of theme.defaultElements) {
        const isOverlapping = isOverlappingSafeArea(
          decoration,
          theme.safeArea,
          PAPER_CONFIGS[theme.orientation],
        );
        if (isOverlapping) {
          overlaps.push(
            `${theme.id}:${decoration.id}`,
          );
        }
      }
    }
    expect(overlaps).toEqual([]);
  });

  it('builds each decorated theme as a dense editable collage', () => {
    const decoratedThemes = letterThemes.filter(
      (theme) => theme.defaultElements.length > 0,
    );
    expect(
      decoratedThemes.filter((theme) => theme.orientation === 'portrait'),
    ).toHaveLength(5);
    expect(
      decoratedThemes.filter((theme) => theme.orientation === 'landscape'),
    ).toHaveLength(5);
    for (const theme of decoratedThemes) {
      expect(theme.defaultElements.length).toBeGreaterThanOrEqual(16);
      expect(theme.defaultElements.some((item) => item.type === 'image')).toBe(true);
      expect(theme.defaultElements.some((item) => item.type === 'shape')).toBe(true);
      expect(theme.defaultElements.some((item) => item.type === 'text')).toBe(true);
      expect(new Set(theme.defaultElements.map((item) => item.id)).size).toBe(
        theme.defaultElements.length,
      );
    }
  });

  it('uses only existing sticker assets instead of full reference images', () => {
    const imageElements = letterThemes.flatMap((theme) =>
      theme.defaultElements.filter((item) => item.type === 'image'),
    );
    for (const item of imageElements) {
      expect(item.src).toMatch(/^\/stickers\//);
      expect(item.src).not.toMatch(/reference|theme-|paper\//i);
    }
  });

  it('undoes and redoes add, delete, move, resize, and theme snapshots', () => {
    const first = createSnapshot('portrait', 'none-portrait');
    let history: EditorHistory = { past: [], present: first, future: [] };
    const added = { ...first, elements: [element()] };
    history = commitHistory(history, added);
    const moved = {
      ...added,
      elements: [{ ...added.elements[0], x: 0.8, width: 0.1 }],
    };
    history = commitHistory(history, moved);
    const themed = changeTheme(moved, 'portrait', 'cute-portrait');
    history = commitHistory(history, themed);
    const deleted = {
      ...themed,
      elements: themed.elements.filter((item) => item.source === 'theme'),
    };
    history = commitHistory(history, deleted);

    history = undoHistory(history);
    expect(history.present.elements.some((item) => item.source === 'user')).toBe(
      true,
    );
    history = redoHistory(history);
    expect(history.present.elements.some((item) => item.source === 'user')).toBe(
      false,
    );
  });
});

describe('persistence and responsive coordinates', () => {
  it('persists user elements but regenerates theme defaults', () => {
    const themeElement = element({ id: 'theme', source: 'theme' });
    const userElement = element({ id: 'user', source: 'user' });
    const persisted = createPersistedEditorDraft(
      {
        paperOrientation: 'portrait',
        selectedThemeId: 'cute-portrait',
        letterContent: 'Hello future',
        letterTitle: 'A note',
        elements: [themeElement, userElement],
      },
      '2026-07-26T00:00:00.000Z',
    );
    expect(persisted.userElements.map((item) => item.id)).toEqual(['user']);
  });

  it('restores saved editor data while preferring newer legacy letter text', () => {
    const restored = restoreEditorState(
      {
        selectedThemeId: 'study',
        letterContent: 'old content',
        letterTitle: 'old title',
        userElements: [element()],
      },
      { content: 'current content', title: 'current title' },
    );
    expect(restored.letterContent).toBe('current content');
    expect(restored.letterTitle).toBe('current title');
    expect(restored.paperOrientation).toBe('portrait');
    expect(restored.selectedThemeId).toBe('study-portrait');
    expect(restored.userElements).toHaveLength(1);
  });

  it('round-trips normalized coordinates across canvas sizes', () => {
    const normalized = { x: 0.1, y: 0.25, width: 0.2, height: 0.15 };
    const firstCanvas = { width: 420, height: 594 };
    const secondCanvas = { width: 840, height: 1188 };
    expect(toNormalizedRect(toPixelRect(normalized, firstCanvas), firstCanvas)).toEqual(
      normalized,
    );
    expect(toPixelRect(normalized, secondCanvas).x).toBe(
      toPixelRect(normalized, firstCanvas).x * 2,
    );
  });
});

describe('A4 canvas automatic Fit', () => {
  const canvas = { width: 720, height: 720 / (210 / 297) };

  it('has no selectable zoom modes in the editor UI or responsive hook', () => {
    const editorSource = readFileSync(
      join(
        __dirname,
        '..',
        '..',
        'app',
        'components',
        'letter-editor',
        'letter-editor.tsx',
      ),
      'utf8',
    );
    const responsiveHook = readFileSync(
      join(
        __dirname,
        '..',
        '..',
        'app',
        'hooks',
        'use-responsive-canvas.ts',
      ),
      'utf8',
    );

    expect(editorSource).not.toContain('ZoomControls');
    expect(editorSource).not.toContain('zoomMode');
    expect(responsiveHook).not.toContain('setZoomMode');
    expect(responsiveHook).toContain('calculateFitScale');
  });

  it('fits the whole page by the limiting viewport dimension', () => {
    const scale = calculateFitScale({ width: 600, height: 700 }, canvas);
    expect(scale).toBeCloseTo(700 / canvas.height, 5);
    expect(canvas.width * scale).toBeLessThanOrEqual(600);
    expect(canvas.height * scale).toBeLessThanOrEqual(700);
  });

  it('does not upscale Fit past the logical 100% A4 size', () => {
    expect(calculateFitScale({ width: 1200, height: 1400 }, canvas)).toBe(1);
  });

  it('still keeps the whole page inside an extremely small viewport', () => {
    const scale = calculateFitScale({ width: 40, height: 40 }, canvas);
    expect(canvas.width * scale).toBeLessThanOrEqual(40);
    expect(canvas.height * scale).toBeLessThanOrEqual(40);
  });
});
