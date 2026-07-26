import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  isPaperOrientation,
  PAPER_CONFIGS,
  PAPER_ORIENTATIONS,
} from '../../app/config/paper-configs';
import {
  getDefaultThemeForOrientation,
  getThemesForOrientation,
  letterThemes,
  resolveThemeForOrientation,
} from '../../app/data/letter-themes';
import { getPaperCanvasSize } from '../../app/hooks/use-responsive-canvas';
import {
  clampElementToCanvas,
  findNearestValidPosition,
  getElementBoundingBox,
  isOverlappingSafeArea,
} from '../../app/lib/letter-editor/collision';
import {
  convertElementForOrientation,
  repositionElementsForOrientation,
} from '../../app/lib/letter-editor/orientation';
import {
  clearPersistedDraft,
  createNewEditorDraft,
  createPersistedEditorDraft,
  LEGACY_DRAFT_STORAGE_KEY,
  LETTER_EDITOR_STORAGE_KEY,
  restoreEditorState,
} from '../../app/lib/letter-editor/persistence';
import {
  changePaperOrientation,
  changeTheme,
  createSnapshot,
  hasMeaningfulEditorData,
} from '../../app/lib/letter-editor/state';
import { calculateFitScale } from '../../app/lib/letter-editor/zoom';
import type {
  CanvasSize,
  PaperOrientation,
  ThemeElement,
} from '../../app/types/letter-editor';

function element(overrides: Partial<ThemeElement> = {}): ThemeElement {
  const result: ThemeElement = {
    id: 'user-sticker',
    type: 'image',
    kind: 'sticker',
    src: '/stickers/test.png',
    alt: 'Test sticker',
    x: 0.02,
    y: 0.02,
    width: 0.12,
    height: 0.1,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    zIndex: 100,
    locked: false,
    source: 'user',
    initial: {
      x: 0.02,
      y: 0.02,
      width: 0.12,
      height: 0.1,
      rotation: 0,
    },
    ...overrides,
  };

  if (!overrides.initial) {
    result.initial = {
      x: result.x,
      y: result.y,
      width: result.width,
      height: result.height,
      rotation: result.rotation,
    };
  }
  return result;
}

function physicalAspect(
  item: ThemeElement,
  orientation: PaperOrientation,
): number {
  const paper = PAPER_CONFIGS[orientation];
  return (
    Math.abs(item.width * item.scaleX) * paper.width /
    (Math.abs(item.height * item.scaleY) * paper.height)
  );
}

function expectInsideCanvas(
  item: ThemeElement,
  orientation: PaperOrientation,
) {
  const bounds = getElementBoundingBox(item, PAPER_CONFIGS[orientation]);
  expect(bounds.left).toBeGreaterThanOrEqual(-0.00001);
  expect(bounds.top).toBeGreaterThanOrEqual(-0.00001);
  expect(bounds.right).toBeLessThanOrEqual(1.00001);
  expect(bounds.bottom).toBeLessThanOrEqual(1.00001);
}

describe('paper configurations and orientation guards', () => {
  it('defines the two reciprocal A4 orientations in one source of truth', () => {
    expect(PAPER_ORIENTATIONS).toEqual(['portrait', 'landscape']);
    expect(Object.keys(PAPER_CONFIGS)).toEqual(['portrait', 'landscape']);
    expect(PAPER_CONFIGS.portrait).toMatchObject({
      orientation: 'portrait',
      width: 210,
      height: 297,
    });
    expect(PAPER_CONFIGS.landscape).toMatchObject({
      orientation: 'landscape',
      width: 297,
      height: 210,
    });
    expect(PAPER_CONFIGS.portrait.aspectRatio).toBeCloseTo(210 / 297, 10);
    expect(PAPER_CONFIGS.landscape.aspectRatio).toBeCloseTo(297 / 210, 10);
    expect(
      PAPER_CONFIGS.portrait.aspectRatio *
        PAPER_CONFIGS.landscape.aspectRatio,
    ).toBeCloseTo(1, 10);
  });

  it.each([
    ['portrait', true],
    ['landscape', true],
    ['square', false],
    ['', false],
    [null, false],
    [undefined, false],
    [42, false],
  ])('validates paper orientation value %p', (value, expected) => {
    expect(isPaperOrientation(value)).toBe(expected);
  });
});

describe('theme filtering and orientation invariants', () => {
  it('returns no themes until an orientation has been selected', () => {
    expect(getThemesForOrientation(null)).toEqual([]);
  });

  it.each(PAPER_ORIENTATIONS)(
    'returns only %s themes without mutating the catalog',
    (orientation) => {
      const before = [...letterThemes];
      const themes = getThemesForOrientation(orientation);

      expect(themes.length).toBeGreaterThan(0);
      expect(themes.every((theme) => theme.orientation === orientation)).toBe(
        true,
      );
      expect(letterThemes).toEqual(before);
      expect(themes).not.toBe(letterThemes);
    },
  );

  it('uses unique ids and valid normalized safe areas for every theme', () => {
    expect(new Set(letterThemes.map((theme) => theme.id)).size).toBe(
      letterThemes.length,
    );

    for (const theme of letterThemes) {
      expect(isPaperOrientation(theme.orientation)).toBe(true);
      expect(theme.safeArea.x).toBeGreaterThanOrEqual(0);
      expect(theme.safeArea.y).toBeGreaterThanOrEqual(0);
      expect(theme.safeArea.width).toBeGreaterThan(0);
      expect(theme.safeArea.height).toBeGreaterThan(0);
      expect(theme.safeArea.x + theme.safeArea.width).toBeLessThanOrEqual(1);
      expect(theme.safeArea.y + theme.safeArea.height).toBeLessThanOrEqual(1);
    }
  });

  it('uses orientation-specific thumbnail and background assets that exist', () => {
    for (const theme of letterThemes) {
      const orientationFolder = `/themes/${theme.orientation}/`;
      expect(theme.thumbnail).toContain(orientationFolder);
      expect(theme.canvas.backgroundImage).toContain(orientationFolder);

      for (const asset of [theme.thumbnail, theme.canvas.backgroundImage]) {
        expect(
          existsSync(
            join(
              __dirname,
              '..',
              '..',
              'public',
              asset!.replace(/^\//, ''),
            ),
          ),
        ).toBe(true);
      }
    }
  });

  it('does not reuse a portrait paper asset as a landscape paper asset', () => {
    const baseIds = new Set(
      letterThemes.map((theme) =>
        theme.id.replace(/-(portrait|landscape)$/, ''),
      ),
    );

    for (const baseId of baseIds) {
      const portrait = resolveThemeForOrientation(baseId, 'portrait');
      const landscape = resolveThemeForOrientation(baseId, 'landscape');
      expect(portrait.canvas.backgroundImage).not.toBe(
        landscape.canvas.backgroundImage,
      );
      expect(portrait.thumbnail).not.toBe(landscape.thumbnail);
    }
  });

  it.each(PAPER_ORIENTATIONS)(
    'always resolves a compatible default and fallback for %s',
    (orientation) => {
      const fallback = getDefaultThemeForOrientation(orientation);
      expect(fallback.orientation).toBe(orientation);
      expect(resolveThemeForOrientation('missing-theme', orientation)).toBe(
        fallback,
      );
    },
  );

  it('migrates a legacy base id and corrects a cross-orientation id', () => {
    expect(resolveThemeForOrientation('study', 'portrait').id).toBe(
      'study-portrait',
    );
    expect(resolveThemeForOrientation('study', 'landscape').id).toBe(
      'study-landscape',
    );
    expect(resolveThemeForOrientation('study-landscape', 'portrait').id).toBe(
      'study-portrait',
    );
  });
});

describe('orientation state transitions', () => {
  it('defaults to portrait paper orientation when no paper orientation is specified', () => {
    expect(createSnapshot(null, 'cute-portrait', [element()])).toEqual(
      createSnapshot('portrait', 'cute-portrait', [element()]),
    );
  });

  it.each(PAPER_ORIENTATIONS)(
    'selects the default %s theme when opening the editor',
    (orientation) => {
      const snapshot = createSnapshot(orientation, null);
      expect(snapshot.selectedThemeId).toBe(
        getDefaultThemeForOrientation(orientation).id,
      );
    },
  );

  it('changes themes in place while preserving user elements', () => {
    const custom = element({ id: 'kept-user-element' });
    const before = createSnapshot('portrait', 'cute-portrait', [custom]);
    const after = changeTheme(before, 'portrait', 'study-portrait');

    expect(after.selectedThemeId).toBe('study-portrait');
    expect(after.elements.filter((item) => item.source === 'user')).toHaveLength(
      1,
    );
    expect(after.elements.some((item) => item.id === custom.id)).toBe(true);
    expect(
      after.elements
        .filter((item) => item.source === 'theme')
        .every((item) => item.id.startsWith('study-portrait-')),
    ).toBe(true);
    expect(
      after.elements.some((item) => item.id.startsWith('cute-portrait-')),
    ).toBe(false);
  });

  it('corrects a cross-orientation theme choice to the current orientation', () => {
    const before = createSnapshot('portrait', 'cute-portrait');
    const after = changeTheme(before, 'portrait', 'study-landscape');
    expect(after.selectedThemeId).toBe('study-portrait');
  });

  it.each([
    ['portrait', 'landscape'],
    ['landscape', 'portrait'],
  ] as const)(
    'switches %s to %s, replacing theme elements and retaining user data',
    (fromOrientation, toOrientation) => {
      const custom = element({
        id: `custom-${fromOrientation}`,
        x: 0.4,
        y: 0.42,
        width: 0.06,
        height: 0.04,
        rotation: 12,
      });
      const before = createSnapshot(
        fromOrientation,
        `cute-${fromOrientation}`,
        [custom],
      );
      const originalUser = before.elements.find(
        (item) => item.source === 'user',
      )!;
      const after = changePaperOrientation(
        before,
        fromOrientation,
        toOrientation,
      );
      const convertedUser = after.elements.find(
        (item) => item.source === 'user',
      )!;

      expect(after.selectedThemeId).toBe(
        getDefaultThemeForOrientation(toOrientation).id,
      );
      expect(convertedUser.id).toBe(custom.id);
      expect(convertedUser.src).toBe(custom.src);
      expect(convertedUser.rotation).toBe(custom.rotation);
      expect(convertedUser.zIndex).toBe(custom.zIndex);
      expect(physicalAspect(convertedUser, toOrientation)).toBeCloseTo(
        physicalAspect(originalUser, fromOrientation),
        8,
      );
      expectInsideCanvas(convertedUser, toOrientation);
      expect(
        isOverlappingSafeArea(
          convertedUser,
          getDefaultThemeForOrientation(toOrientation).safeArea,
          PAPER_CONFIGS[toOrientation],
        ),
      ).toBe(true);
      expect(
        after.elements.some((item) =>
          item.id.startsWith(`cute-${fromOrientation}-`),
        ),
      ).toBe(false);
    },
  );

  it('returns the same snapshot for a no-op orientation change', () => {
    const snapshot = createSnapshot('portrait', 'cute-portrait', [element()]);
    expect(changePaperOrientation(snapshot, 'portrait', 'portrait')).toBe(
      snapshot,
    );
  });

  it('detects exactly the data that requires orientation confirmation', () => {
    const themeOnly = createSnapshot('portrait', 'cute-portrait').elements;
    expect(
      hasMeaningfulEditorData({
        letterTitle: '   ',
        letterContent: '\n\t',
        elements: themeOnly,
      }),
    ).toBe(false);
    expect(
      hasMeaningfulEditorData({
        letterTitle: 'A title',
        letterContent: '',
        elements: themeOnly,
      }),
    ).toBe(true);
    expect(
      hasMeaningfulEditorData({
        letterTitle: '',
        letterContent: 'A message',
        elements: themeOnly,
      }),
    ).toBe(true);
    expect(
      hasMeaningfulEditorData({
        letterTitle: '',
        letterContent: '',
        elements: [...themeOnly, element()],
      }),
    ).toBe(true);
    expect(
      hasMeaningfulEditorData({
        letterTitle: '',
        letterContent: '',
        elements: themeOnly,
        hasUnsavedChanges: true,
      }),
    ).toBe(true);
  });
});

describe('orientation-aware geometry', () => {
  it('calculates a rotated bounding box in physical A4 coordinates', () => {
    const rotated = element({
      x: 0.1,
      y: 0.1,
      width: 0.1,
      height: 0.1,
      rotation: 45,
    });
    const portrait = getElementBoundingBox(
      rotated,
      PAPER_CONFIGS.portrait,
    );
    const landscape = getElementBoundingBox(
      rotated,
      PAPER_CONFIGS.landscape,
    );

    expect(portrait.width).toBeCloseTo(0.1707157, 6);
    expect(portrait.height).toBeCloseTo(0.1207081, 6);
    expect(landscape.width).toBeCloseTo(0.1207081, 6);
    expect(landscape.height).toBeCloseTo(0.1707157, 6);
  });

  it.each(PAPER_ORIENTATIONS)(
    'clamps rotated elements inside the %s canvas without mutation',
    (orientation) => {
      const original = element({
        x: -0.08,
        y: 0.91,
        width: 0.2,
        height: 0.08,
        rotation: 35,
      });
      const originalCopy = structuredClone(original);
      const clamped = clampElementToCanvas(
        original,
        PAPER_CONFIGS[orientation],
      );

      expect(original).toEqual(originalCopy);
      expect(clamped).not.toBe(original);
      expectInsideCanvas(clamped, orientation);
    },
  );

  it('treats exact safe-area contact as non-overlap', () => {
    const safeArea = { x: 0.2, y: 0.2, width: 0.6, height: 0.6 };
    const touching = element({
      x: 0.1,
      y: 0.35,
      width: 0.1,
      height: 0.1,
    });
    expect(
      isOverlappingSafeArea(
        touching,
        safeArea,
        PAPER_CONFIGS.portrait,
      ),
    ).toBe(false);
  });

  it.each(PAPER_ORIENTATIONS)(
    'moves an overlapping non-sticker to a valid %s edge',
    (orientation) => {
      const safeArea =
        getDefaultThemeForOrientation(orientation).safeArea;
      const overlapping = element({
        type: 'shape',
        kind: 'shape',
        x: safeArea.x + safeArea.width / 2 - 0.05,
        y: safeArea.y + safeArea.height / 2 - 0.04,
        width: 0.1,
        height: 0.08,
        rotation: 8,
      });
      const moved = findNearestValidPosition(
        overlapping,
        safeArea,
        PAPER_CONFIGS[orientation],
      );

      expectInsideCanvas(moved, orientation);
      expect(
        isOverlappingSafeArea(
          moved,
          safeArea,
          PAPER_CONFIGS[orientation],
        ),
      ).toBe(false);
    },
  );

  it.each([
    ['portrait', 'landscape'],
    ['landscape', 'portrait'],
  ] as const)(
    'preserves physical aspect ratio when converting %s to %s',
    (fromOrientation, toOrientation) => {
      const original = element({
        x: 0.34,
        y: 0.41,
        width: 0.12,
        height: 0.1,
      });
      const converted = convertElementForOrientation(
        original,
        fromOrientation,
        toOrientation,
      );

      expect(physicalAspect(converted, toOrientation)).toBeCloseTo(
        physicalAspect(original, fromOrientation),
        10,
      );
      expect(converted.x + converted.width / 2).toBeCloseTo(
        original.x + original.width / 2,
        10,
      );
      expect(converted.y + converted.height / 2).toBeCloseTo(
        original.y + original.height / 2,
        10,
      );
      expect(original.width).toBe(0.12);
      expect(original.height).toBe(0.1);
    },
  );

  it('keeps a sticker in the writing area and refreshes reset coordinates', () => {
    const original = element({
      x: 0.4,
      y: 0.4,
      width: 0.06,
      height: 0.04,
      rotation: 14,
    });
    const originalCopy = structuredClone(original);
    const target = getDefaultThemeForOrientation('landscape');
    const [positioned] = repositionElementsForOrientation(
      [original],
      'portrait',
      'landscape',
      target.safeArea,
    );

    expect(original).toEqual(originalCopy);
    expectInsideCanvas(positioned, 'landscape');
    expect(
      isOverlappingSafeArea(
        positioned,
        target.safeArea,
        PAPER_CONFIGS.landscape,
      ),
    ).toBe(true);
    expect(positioned.initial).toEqual({
      x: positioned.x,
      y: positioned.y,
      width: positioned.width,
      height: positioned.height,
      rotation: positioned.rotation,
    });
  });
});

describe('persistence migration and new drafts', () => {
  it('serializes schema v2, orientation, and user elements only', () => {
    const user = element({ id: 'persisted-user' });
    const theme = element({ id: 'discarded-theme', source: 'theme' });
    const persisted = createPersistedEditorDraft(
      {
        paperOrientation: 'landscape',
        selectedThemeId: 'study-landscape',
        letterContent: 'Future message',
        letterTitle: 'Future title',
        elements: [theme, user],
      },
      '2026-07-26T00:00:00.000Z',
    );

    expect(persisted).toMatchObject({
      schemaVersion: 2,
      paperOrientation: 'landscape',
      selectedThemeId: 'study-landscape',
      letterContent: 'Future message',
      letterTitle: 'Future title',
      updatedAt: '2026-07-26T00:00:00.000Z',
    });
    expect(persisted.userElements.map((item) => item.id)).toEqual([
      'persisted-user',
    ]);
  });

  it.each(PAPER_ORIENTATIONS)(
    'round-trips a schema v2 %s draft',
    (orientation) => {
      const theme = resolveThemeForOrientation('study', orientation);
      const user = element();
      const persisted = createPersistedEditorDraft({
        paperOrientation: orientation,
        selectedThemeId: theme.id,
        letterContent: 'Saved content',
        letterTitle: 'Saved title',
        elements: [user],
      });
      const restored = restoreEditorState(persisted, {});

      expect(restored.paperOrientation).toBe(orientation);
      expect(restored.selectedThemeId).toBe(theme.id);
      expect(restored.letterContent).toBe('Saved content');
      expect(restored.letterTitle).toBe('Saved title');
      expect(restored.userElements.map((item) => item.id)).toEqual([user.id]);
    },
  );

  it('migrates a pre-v2 editor draft to portrait and maps its legacy theme id', () => {
    const restored = restoreEditorState(
      {
        selectedThemeId: 'study',
        letterContent: 'Old editor content',
        letterTitle: 'Old editor title',
        userElements: [element()],
      },
      {},
    );

    expect(restored.paperOrientation).toBe('portrait');
    expect(restored.selectedThemeId).toBe('study-portrait');
    expect(restored.letterContent).toBe('Old editor content');
    expect(restored.userElements).toHaveLength(1);
  });

  it('uses orientation as the source of truth for a mismatched theme id', () => {
    const restored = restoreEditorState(
      {
        schemaVersion: 2,
        paperOrientation: 'portrait',
        selectedThemeId: 'study-landscape',
      },
      {},
    );
    expect(restored.paperOrientation).toBe('portrait');
    expect(restored.selectedThemeId).toBe('study-portrait');
  });

  it('keeps legacy builder text but remains gated before orientation selection', () => {
    const restored = restoreEditorState(
      {},
      {
        theme: 'study',
        title: 'Builder title',
        content: 'Builder content',
      },
    );
    expect(restored.paperOrientation).toBe('portrait');
    expect(restored.selectedThemeId).toBe('study-portrait');
    expect(restored.letterTitle).toBe('Builder title');
    expect(restored.letterContent).toBe('Builder content');
  });

  it('restores a legacy draft that already records an orientation', () => {
    const restored = restoreEditorState(
      {},
      {
        paperOrientation: 'landscape',
        theme: 'cute',
        title: 'Landscape title',
        content: 'Landscape content',
      },
    );
    expect(restored.paperOrientation).toBe('landscape');
    expect(restored.selectedThemeId).toBe('cute-landscape');
  });

  it('prefers current legacy text and filters out persisted theme elements', () => {
    const restored = restoreEditorState(
      {
        paperOrientation: 'portrait',
        selectedThemeId: 'study-portrait',
        letterContent: 'Older content',
        letterTitle: 'Older title',
        userElements: [
          element({ id: 'user' }),
          element({ id: 'theme', source: 'theme' }),
        ],
      },
      { content: 'Current content', title: 'Current title' },
    );
    expect(restored.letterContent).toBe('Current content');
    expect(restored.letterTitle).toBe('Current title');
    expect(restored.userElements.map((item) => item.id)).toEqual(['user']);
  });

  it.each([null, undefined, [], 42, 'invalid']) (
    'handles malformed persisted input %p without throwing',
    (raw) => {
      expect(() => restoreEditorState(raw, raw)).not.toThrow();
      expect(restoreEditorState(raw, raw)).toEqual(createNewEditorDraft());
    },
  );

  it('creates isolated empty drafts that start directly in portrait orientation', () => {
    const first = createNewEditorDraft();
    const second = createNewEditorDraft();
    expect(first).toEqual({
      paperOrientation: 'portrait',
      selectedThemeId: 'none-portrait',
      letterContent: '',
      letterTitle: '',
      userElements: [],
    });
    expect(first).not.toBe(second);
    expect(first.userElements).not.toBe(second.userElements);
  });

  it('clears both editor and legacy storage for a new letter', () => {
    const storage = { removeItem: jest.fn() };
    clearPersistedDraft(storage);
    expect(storage.removeItem.mock.calls).toEqual([
      [LETTER_EDITOR_STORAGE_KEY],
      [LEGACY_DRAFT_STORAGE_KEY],
    ]);
  });
});

describe('responsive A4 canvas sizing', () => {
  it.each([
    ['portrait', 210 / 297],
    ['landscape', 297 / 210],
  ] as const)('creates a logical %s canvas at the configured ratio', (orientation, ratio) => {
    const canvas = getPaperCanvasSize(orientation, 720);
    expect(canvas.width).toBe(720);
    expect(canvas.width / canvas.height).toBeCloseTo(ratio, 10);
    if (orientation === 'portrait') {
      expect(canvas.height).toBeGreaterThan(canvas.width);
    } else {
      expect(canvas.width).toBeGreaterThan(canvas.height);
    }
  });

  it.each([
    ['portrait', { width: 390, height: 700 }],
    ['portrait', { width: 900, height: 520 }],
    ['landscape', { width: 390, height: 280 }],
    ['landscape', { width: 900, height: 520 }],
  ] as const)(
    'fits the %s canvas within viewport %j without changing aspect ratio',
    (orientation, viewport) => {
      const canvas = getPaperCanvasSize(orientation, 720);
      const scale = calculateFitScale(viewport, canvas);
      const display: CanvasSize = {
        width: canvas.width * scale,
        height: canvas.height * scale,
      };

      expect(scale).toBeGreaterThan(0);
      expect(scale).toBeLessThanOrEqual(1);
      expect(display.width).toBeLessThanOrEqual(viewport.width + 0.00001);
      expect(display.height).toBeLessThanOrEqual(viewport.height + 0.00001);
      expect(display.width / display.height).toBeCloseTo(
        PAPER_CONFIGS[orientation].aspectRatio,
        10,
      );
    },
  );

  it('uses different page geometry after switching orientation', () => {
    const portrait = getPaperCanvasSize('portrait', 720);
    const landscape = getPaperCanvasSize('landscape', 720);
    expect(portrait.width).toBe(landscape.width);
    expect(portrait.height).not.toBe(landscape.height);
    expect(portrait.height).toBeGreaterThan(portrait.width);
    expect(landscape.height).toBeLessThan(landscape.width);
  });

  it.each([
    [{ width: 0, height: 100 }, { width: 720, height: 1000 }],
    [{ width: 100, height: -1 }, { width: 720, height: 1000 }],
    [{ width: 100, height: 100 }, { width: 0, height: 1000 }],
    [{ width: 100, height: 100 }, { width: 720, height: 0 }],
  ])('returns the safe fallback for invalid dimensions', (viewport, canvas) => {
    expect(calculateFitScale(viewport, canvas)).toBe(1);
  });
});
