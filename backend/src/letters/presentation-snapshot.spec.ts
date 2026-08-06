import { BadRequestException } from '@nestjs/common';
import { sanitizePresentationSnapshot } from './presentation-snapshot';

function snapshot(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 1,
    paperOrientation: 'portrait',
    selectedThemeId: 'cute-portrait',
    canvas: { backgroundColor: '#fff', accent: '#a00' },
    typography: { headingFamily: 'serif', bodyFamily: 'sans-serif' },
    safeArea: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
    elements: [
      {
        id: 'cute-heart',
        type: 'image',
        kind: 'heart',
        src: '/stickers/cute/heart.png',
        x: 0.05,
        y: 0.05,
        width: 0.1,
        height: 0.1,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        zIndex: 1,
        source: 'theme',
      },
    ],
    ...overrides,
  };
}

describe('sanitizePresentationSnapshot', () => {
  it('accepts a normalized versioned canvas snapshot', () => {
    expect(sanitizePresentationSnapshot(snapshot())).toEqual(snapshot());
  });

  it('accepts uploaded images only through durable attachment references', () => {
    const value = snapshot({
      elements: [
        {
          ...snapshot().elements[0],
          id: 'uploaded-image',
          src: undefined,
          source: 'user',
          attachmentClientId: 'design:uploaded-image',
        },
      ],
    });
    expect(sanitizePresentationSnapshot(value)).toEqual(value);
  });

  it('rejects external or browser-only image sources', () => {
    for (const src of ['https://tracker.example/image.png', 'data:image/png;base64,AAAA']) {
      expect(() =>
        sanitizePresentationSnapshot(
          snapshot({ elements: [{ ...snapshot().elements[0], src }] }),
        ),
      ).toThrow(BadRequestException);
    }
  });
});
