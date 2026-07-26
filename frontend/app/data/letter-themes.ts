import type {
  DecorationKind,
  LetterTheme,
  PaperOrientation,
  ThemeElement,
} from '@/app/types/letter-editor';
import { repositionElementsForOrientation } from '@/app/lib/letter-editor/orientation';

interface ThemeSeed {
  id: string;
  name: string;
  description: string;
  background: {
    color: string;
    accent: string;
    texture: LetterTheme['canvas']['texture'];
    variant: LetterTheme['canvas']['variant'];
  };
  typography?: Partial<LetterTheme['typography']>;
  safeArea: LetterTheme['safeArea'];
  defaultElements: ThemeElement[];
}

type Placement = readonly [number, number, number, number];

interface TextStyle {
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  fontFamily?: string;
  fontStyle?: string;
  fontSizeScale?: number;
  letterSpacing?: number;
}

function base(
  id: string,
  [x, y, width, height]: Placement,
  rotation: number,
  zIndex: number,
) {
  return {
    id,
    x,
    y,
    width,
    height,
    rotation,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    zIndex,
    locked: false,
    source: 'theme' as const,
    initial: { x, y, width, height, rotation },
  };
}

function image(
  themeId: string,
  id: string,
  file: string,
  kind: DecorationKind,
  placement: Placement,
  rotation: number,
  zIndex: number,
  folder = themeId,
): ThemeElement {
  return {
    ...base(themeId + '-' + id, placement, rotation, zIndex),
    type: 'image',
    kind,
    src: '/stickers/' + folder + '/' + file,
    alt: id.replaceAll('-', ' '),
  };
}

function shape(
  themeId: string,
  id: string,
  kind: DecorationKind,
  placement: Placement,
  rotation: number,
  zIndex: number,
  fill: string,
  stroke?: string,
  opacity = 1,
  shapeType: 'rect' | 'circle' = 'rect',
): ThemeElement {
  return {
    ...base(themeId + '-' + id, placement, rotation, zIndex),
    type: 'shape',
    kind,
    shape: shapeType,
    fill,
    stroke,
    strokeWidth: 0.002,
    opacity,
  };
}

function text(
  themeId: string,
  id: string,
  value: string,
  placement: Placement,
  rotation: number,
  zIndex: number,
  style: TextStyle,
): ThemeElement {
  return {
    ...base(themeId + '-' + id, placement, rotation, zIndex),
    type: 'text',
    kind: 'text',
    text: value,
    ...style,
  };
}

const sans = '"Nunito", "Be Vietnam Pro", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
const serif = '"Noto Serif", "Times New Roman", "Segoe UI", serif';
const handwritten = '"Playwrite VN", "Segoe Print", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
const script = '"Playwrite VN", "Segoe Print", "Segoe Script", "Segoe UI", Arial, sans-serif';
const display = '"Nunito", "Arial Black", "Segoe UI", Arial, sans-serif';

const themeSeeds: ThemeSeed[] = [
  {
    id: 'none',
    name: 'Gi\u1ea5y t\u1ed1i gi\u1ea3n',
    description: 'Kho\u1ea3ng th\u1edf r\u1ed9ng, kh\u00f4ng h\u1ecda ti\u1ebft',
    background: {
      color: '#fffdf8',
      accent: '#ded4c8',
      texture: 'paper',
      variant: 'minimal',
    },
    safeArea: { x: 0.12, y: 0.12, width: 0.76, height: 0.76 },
    defaultElements: [],
  },
  {
    id: 'cute',
    name: 'Dear you',
    description: 'Pastel ng\u1ecdt ng\u00e0o, sticker x\u1ebfp l\u1edbp d\u00e0y d\u1eb7c',
    background: {
      color: '#fff1f5',
      accent: '#ec8eb2',
      texture: 'dots',
      variant: 'kawaii',
    },
    safeArea: { x: 0.155, y: 0.205, width: 0.69, height: 0.61 },
    defaultElements: [
      shape('cute', 'header-paper', 'frame', [0.235, 0.052, 0.53, 0.105], -1, 1, '#fffafc', '#efbed0'),
      image('cute', 'header-tape', 'cute_tape_pink.png', 'washi', [0.42, 0.02, 0.16, 0.045], 4, 2),
      text('cute', 'title', 'dear you', [0.29, 0.065, 0.42, 0.07], -1, 3, { fill: '#ef5d96', stroke: '#ffffff', strokeWidth: 0.003, fontFamily: script, fontSizeScale: 0.72 }),
      image('cute', 'heart-top', 'cute_heart_holographic.png', 'heart', [0.025, 0.025, 0.14, 0.14], -8, 4),
      image('cute', 'cloud-top', 'cute_cloud_blue.png', 'icon', [0.805, 0.035, 0.17, 0.12], 5, 5),
      image('cute', 'sparkles-top', 'cute_sparkles_pink.png', 'sparkle', [0.845, 0.14, 0.09, 0.055], 8, 6),
      image('cute', 'chat-left', 'cute_chat_bubble.png', 'sticker', [0.01, 0.255, 0.13, 0.105], -4, 7),
      image('cute', 'bow-right', 'cute_bow_pink.png', 'bow', [0.865, 0.225, 0.115, 0.12], 7, 8),
      image('cute', 'smiley-left', 'cute_smiley_yellow.png', 'sticker', [0.02, 0.465, 0.115, 0.11], -5, 9),
      image('cute', 'cherries-right', 'cute_cherries.png', 'sticker', [0.865, 0.43, 0.11, 0.11], 5, 10),
      image('cute', 'flower-left', 'cute_flower_pink.png', 'sticker', [0.015, 0.675, 0.12, 0.115], -7, 11),
      image('cute', 'good-vibes-right', 'cute_good_vibes.png', 'sticker', [0.86, 0.66, 0.13, 0.09], 4, 12),
      image('cute', 'envelope-bottom', 'cute_envelope_love.png', 'sticker', [0.025, 0.86, 0.2, 0.1], 5, 13),
      shape('cute', 'bottom-label', 'frame', [0.29, 0.88, 0.3, 0.07], -2, 14, '#fff7fb', '#efb1c8'),
      text('cute', 'bottom-message', 'YOU GOT THIS', [0.315, 0.892, 0.25, 0.045], -2, 15, { fill: '#58aa9d', fontFamily: handwritten, fontSizeScale: 0.48, letterSpacing: 0.001 }),
      image('cute', 'moon-bottom', 'cute_crescent_moon.png', 'icon', [0.63, 0.85, 0.1, 0.125], 3, 16),
      image('cute', 'coffee-bottom', 'cute_coffee_cup.png', 'sticker', [0.865, 0.835, 0.105, 0.14], 7, 17),
      image('cute', 'daisy-tape-bottom', 'cute_tape_daisy.png', 'washi', [0.73, 0.955, 0.24, 0.04], -5, 18),
    ],
  },
  {
    id: 'lavender',
    name: 'Dear bloom',
    description: 'T\u00edm lavender, b\u01b0\u1edbm v\u00e0 hoa \u00e9p kh\u00f4',
    background: {
      color: '#f5effa',
      accent: '#8f72b2',
      texture: 'paper',
      variant: 'lavender',
    },
    safeArea: { x: 0.16, y: 0.205, width: 0.68, height: 0.61 },
    defaultElements: [
      shape('lavender', 'header-paper', 'frame', [0.22, 0.05, 0.56, 0.105], 0, 1, '#fffafd', '#cbb7dd'),
      image('lavender', 'header-tape', 'scrapbook_gingham_tape.png', 'washi', [0.425, 0.018, 0.15, 0.05], 3, 2, 'scrapbook'),
      text('lavender', 'title', 'dear bloom', [0.275, 0.062, 0.45, 0.075], 0, 3, { fill: '#8665a7', fontFamily: script, fontSizeScale: 0.72 }),
      image('lavender', 'flowers-top-left', 'scrapbook_dried_wildflowers.png', 'sticker', [0.018, 0.018, 0.105, 0.16], -6, 4, 'scrapbook'),
      image('lavender', 'butterfly-top', 'cute_butterfly_purple.png', 'sticker', [0.14, 0.04, 0.11, 0.095], 8, 5, 'cute'),
      image('lavender', 'bow-top', 'cute_bow_blue.png', 'bow', [0.79, 0.045, 0.13, 0.105], -4, 6, 'cute'),
      shape('lavender', 'grow-note-paper', 'frame', [0.01, 0.255, 0.13, 0.12], -3, 7, '#fffaf3', '#d2c4db'),
      text('lavender', 'grow-note', 'take time\nto grow', [0.02, 0.277, 0.11, 0.075], -3, 8, { fill: '#766582', fontFamily: handwritten, fontSizeScale: 0.35 }),
      image('lavender', 'wildflowers-right', 'scrapbook_pink_wildflowers.png', 'sticker', [0.87, 0.245, 0.11, 0.17], 5, 9, 'scrapbook'),
      image('lavender', 'butterfly-left', 'cute_butterfly_purple.png', 'sticker', [0.02, 0.49, 0.105, 0.09], -12, 10, 'cute'),
      shape('lavender', 'self-note-paper', 'frame', [0.865, 0.48, 0.12, 0.135], 3, 11, '#fffaf3', '#d2c4db'),
      text('lavender', 'self-note', 'be kind\nbe patient\nbe you', [0.875, 0.505, 0.1, 0.085], 3, 12, { fill: '#766582', fontFamily: handwritten, fontSizeScale: 0.27 }),
      image('lavender', 'post-card-left', 'scrapbook_post_card.png', 'frame', [0.01, 0.69, 0.14, 0.1], -5, 13, 'scrapbook'),
      image('lavender', 'flower-right', 'cute_flower_pink.png', 'sticker', [0.875, 0.68, 0.1, 0.1], 6, 14, 'cute'),
      shape('lavender', 'dream-note-paper', 'frame', [0.29, 0.88, 0.32, 0.07], 1, 15, '#eee4f4', '#c6acd8'),
      text('lavender', 'dream-note', 'let your dreams bloom', [0.31, 0.895, 0.28, 0.04], 1, 16, { fill: '#775b8f', fontFamily: handwritten, fontSizeScale: 0.42 }),
      shape('lavender', 'wax-seal', 'shape', [0.78, 0.865, 0.11, 0.095], -4, 17, '#a885ba', '#f1e7f5', 1, 'circle'),
      text('lavender', 'wax-mark', 'BLOOM', [0.795, 0.89, 0.08, 0.035], -4, 18, { fill: '#fff8ff', fontFamily: display, fontSizeScale: 0.3, letterSpacing: 0.0005 }),
    ],
  },
  {
    id: 'y2k',
    name: 'Hey cutie',
    description: 'M\u00e0u pop t\u00e1o b\u1ea1o, n\u0103ng l\u01b0\u1ee3ng sticker-bomb',
    background: {
      color: '#fff9f4',
      accent: '#ed1f79',
      texture: 'grid',
      variant: 'comic',
    },
    safeArea: { x: 0.155, y: 0.225, width: 0.69, height: 0.585 },
    defaultElements: [
      shape('y2k', 'headline-burst', 'frame', [0.205, 0.035, 0.59, 0.155], -1, 1, '#ffffff', '#17151a'),
      text('y2k', 'headline', 'HEY\nCUTIE', [0.275, 0.05, 0.45, 0.125], -2, 2, { fill: '#ffdb00', stroke: '#111111', strokeWidth: 0.005, fontFamily: display, fontSizeScale: 0.37, letterSpacing: -0.001 }),
      image('y2k', 'badge-top', 'y2k_badge_text.png', 'sticker', [0.01, 0.035, 0.19, 0.066], -8, 3),
      image('y2k', 'smiley-top', 'y2k_smiley_holographic.png', 'sticker', [0.855, 0.025, 0.12, 0.125], 7, 4),
      image('y2k', 'flame-left', 'y2k_flame_blue.png', 'icon', [0.01, 0.25, 0.13, 0.14], -6, 5),
      image('y2k', 'heart-right', 'y2k_heart_holographic.png', 'heart', [0.86, 0.255, 0.12, 0.125], 8, 6),
      image('y2k', 'smiley-left', 'y2k_smiley_pink.png', 'sticker', [0.015, 0.475, 0.12, 0.12], -5, 7),
      image('y2k', 'blue-flame-right', 'y2k_heart_blue_flame.png', 'heart', [0.86, 0.47, 0.12, 0.13], 7, 8),
      image('y2k', 'slay-left', 'y2k_slay.png', 'sticker', [0.01, 0.69, 0.14, 0.075], 7, 9),
      image('y2k', 'iconic-right', 'y2k_so_iconic.png', 'sticker', [0.85, 0.67, 0.14, 0.105], -5, 10),
      image('y2k', 'star-left', 'y2k_star_pink.png', 'star', [0.035, 0.81, 0.09, 0.08], -8, 11),
      image('y2k', 'star-right', 'y2k_star_blue_3d.png', 'star', [0.875, 0.81, 0.09, 0.08], 8, 12),
      shape('y2k', 'bottom-burst', 'frame', [0.245, 0.87, 0.51, 0.095], 1, 13, '#ff2f8a', '#111111'),
      image('y2k', 'main-character', 'y2k_main_character.png', 'sticker', [0.33, 0.875, 0.34, 0.105], -1, 14),
      image('y2k', 'cursor-bottom', 'y2k_cursor.png', 'icon', [0.18, 0.9, 0.075, 0.065], -8, 15),
      image('y2k', 'checkered-star-bottom', 'y2k_star_checkered.png', 'star', [0.75, 0.895, 0.075, 0.07], 8, 16),
    ],
  },
  {
    id: 'study',
    name: 'A little note',
    description: 'G\u00f3c h\u1ecdc t\u1eadp \u1ea5m \u00e1p v\u00e0 l\u1eddi nh\u1eafc t\u1eadp trung',
    background: {
      color: '#fbf1dc',
      accent: '#7f8960',
      texture: 'lines',
      variant: 'study',
    },
    safeArea: { x: 0.145, y: 0.205, width: 0.71, height: 0.61 },
    defaultElements: [
      shape('study', 'header-paper', 'frame', [0.21, 0.05, 0.58, 0.105], -1, 1, '#fffaf0', '#c9bda5'),
      image('study', 'header-tape', 'study_tape_gingham.png', 'washi', [0.405, 0.018, 0.19, 0.05], 3, 2),
      text('study', 'title', 'a little note', [0.285, 0.065, 0.43, 0.065], -1, 3, { fill: '#52442d', fontFamily: handwritten, fontSizeScale: 0.62, letterSpacing: 0.001 }),
      image('study', 'you-got-this', 'study_you_got_this.png', 'sticker', [0.012, 0.035, 0.13, 0.145], -7, 4),
      image('study', 'coffee-top', 'study_coffee_first.png', 'sticker', [0.89, 0.035, 0.085, 0.145], 6, 5),
      image('study', 'todo-left', 'study_to_do_list.png', 'sticker', [0.01, 0.245, 0.12, 0.16], -6, 6),
      image('study', 'quote-right', 'study_quote_note.png', 'sticker', [0.87, 0.25, 0.115, 0.15], 5, 7),
      image('study', 'matcha-left', 'study_matcha_love.png', 'sticker', [0.035, 0.465, 0.085, 0.155], -4, 8),
      image('study', 'pencil-right', 'study_pencil.png', 'icon', [0.91, 0.455, 0.04, 0.14], 7, 9),
      image('study', 'paperclips-right', 'study_paperclips.png', 'icon', [0.865, 0.585, 0.1, 0.08], 8, 10),
      image('study', 'books-left', 'study_book_stack.png', 'sticker', [0.01, 0.68, 0.13, 0.105], 4, 11),
      image('study', 'plant-right', 'study_plant_potted.png', 'sticker', [0.87, 0.68, 0.12, 0.14], -4, 12),
      shape('study', 'progress-paper', 'frame', [0.025, 0.86, 0.2, 0.11], 4, 13, '#fff9ec', '#c8baa0'),
      text('study', 'progress-text', 'progress\nnot perfection', [0.05, 0.88, 0.15, 0.07], 4, 14, { fill: '#574a34', fontFamily: handwritten, fontSizeScale: 0.34 }),
      image('study', 'laptop-bottom', 'study_laptop_cozy.png', 'sticker', [0.61, 0.87, 0.3, 0.095], -4, 15),
      image('study', 'grid-tape-bottom', 'study_tape_grid.png', 'washi', [0.38, 0.945, 0.23, 0.05], 2, 16),
      image('study', 'smiley-bottom', 'study_smiley_yellow.png', 'sticker', [0.27, 0.87, 0.1, 0.1], -5, 17),
      image('study', 'leaf-bottom', 'study_leaf_branch.png', 'sticker', [0.48, 0.86, 0.08, 0.11], 7, 18),
    ],
  },
  {
    id: 'scrapbook',
    name: 'For you',
    description: 'Gi\u1ea5y x\u00e9, film, tem v\u00e0 nh\u1eefng kho\u1ea3nh kh\u1eafc',
    background: {
      color: '#f6eadc',
      accent: '#bd7959',
      texture: 'paper',
      variant: 'scrapbook',
    },
    safeArea: { x: 0.175, y: 0.205, width: 0.65, height: 0.61 },
    defaultElements: [
      shape('scrapbook', 'header-paper', 'frame', [0.21, 0.048, 0.58, 0.11], -1, 1, '#fff9ed', '#cfb99e'),
      image('scrapbook', 'header-tape', 'scrapbook_gingham_tape.png', 'washi', [0.42, 0.015, 0.16, 0.055], 3, 2),
      text('scrapbook', 'title', 'for you', [0.3, 0.065, 0.4, 0.065], -1, 3, { fill: '#687052', fontFamily: script, fontSizeScale: 0.72 }),
      image('scrapbook', 'flowers-top', 'scrapbook_dried_wildflowers.png', 'sticker', [0.01, 0.015, 0.105, 0.16], -7, 4),
      image('scrapbook', 'stamp-top', 'scrapbook_stamp_mountain.png', 'sticker', [0.885, 0.025, 0.095, 0.14], 5, 5),
      image('scrapbook', 'postcard-left', 'scrapbook_post_card.png', 'frame', [0.012, 0.245, 0.14, 0.105], -5, 6),
      image('scrapbook', 'time-note-right', 'scrapbook_torn_note_time.png', 'sticker', [0.85, 0.245, 0.14, 0.095], 5, 7),
      image('scrapbook', 'film-left', 'scrapbook_film_strip.png', 'frame', [0.018, 0.405, 0.12, 0.27], -4, 8),
      image('scrapbook', 'wildflowers-right', 'scrapbook_pink_wildflowers.png', 'sticker', [0.88, 0.41, 0.1, 0.18], 5, 9),
      image('scrapbook', 'moments-left', 'scrapbook_little_moments.png', 'sticker', [0.012, 0.715, 0.14, 0.095], 4, 10),
      image('scrapbook', 'take-care-right', 'scrapbook_take_care.png', 'sticker', [0.85, 0.68, 0.135, 0.11], -4, 11),
      image('scrapbook', 'leaves-bottom', 'scrapbook_olive_leaves.png', 'sticker', [0.07, 0.84, 0.1, 0.15], 7, 12),
      image('scrapbook', 'ticket-bottom', 'scrapbook_ticket_collect.png', 'sticker', [0.72, 0.87, 0.23, 0.1], -5, 13),
      shape('scrapbook', 'message-paper', 'frame', [0.235, 0.88, 0.31, 0.075], 2, 14, '#f4d8c9', '#cca189'),
      text('scrapbook', 'message', 'soft days . wild hearts', [0.255, 0.897, 0.27, 0.04], 2, 15, { fill: '#705243', fontFamily: handwritten, fontSizeScale: 0.38 }),
      image('scrapbook', 'moon-bottom', 'scrapbook_crescent_moon_face.png', 'icon', [0.58, 0.86, 0.1, 0.11], -6, 16),
      image('scrapbook', 'tape-bottom', 'scrapbook_gingham_tape.png', 'washi', [0.42, 0.96, 0.2, 0.04], -2, 17),
    ],
  },
];

const LANDSCAPE_SAFE_AREAS: Record<string, LetterTheme['safeArea']> = {
  none: { x: 0.1, y: 0.14, width: 0.8, height: 0.7 },
  cute: { x: 0.14, y: 0.18, width: 0.72, height: 0.64 },
  lavender: { x: 0.15, y: 0.18, width: 0.7, height: 0.64 },
  y2k: { x: 0.15, y: 0.2, width: 0.7, height: 0.6 },
  study: { x: 0.14, y: 0.18, width: 0.72, height: 0.64 },
  scrapbook: { x: 0.16, y: 0.18, width: 0.68, height: 0.64 },
};

function namespaceElement(
  element: ThemeElement,
  seedId: string,
  themeId: string,
): ThemeElement {
  const suffix = element.id.startsWith(seedId + '-')
    ? element.id.slice(seedId.length + 1)
    : element.id;
  return {
    ...element,
    id: themeId + '-' + suffix,
    initial: { ...element.initial },
  };
}

function createOrientationTheme(
  seed: ThemeSeed,
  orientation: PaperOrientation,
): LetterTheme {
  const themeId = seed.id + '-' + orientation;
  const safeArea =
    orientation === 'portrait'
      ? { ...seed.safeArea }
      : { ...LANDSCAPE_SAFE_AREAS[seed.id] };
  const portraitElements = seed.defaultElements.map((element) =>
    namespaceElement(element, seed.id, themeId),
  );
  const defaultElements =
    orientation === 'portrait'
      ? repositionElementsForOrientation(
          portraitElements,
          'portrait',
          'portrait',
          safeArea,
        )
      : repositionElementsForOrientation(
          portraitElements,
          'portrait',
          'landscape',
          safeArea,
        );
  const artwork = '/themes/' + orientation + '/paper-texture.svg';

  return {
    id: themeId,
    name:
      orientation === 'portrait'
        ? seed.name
        : seed.name + ' \u00b7 ngang',
    description: seed.description,
    orientation,
    thumbnail: artwork,
    canvas: {
      backgroundColor: seed.background.color,
      backgroundImage: artwork,
      accent: seed.background.accent,
      texture: seed.background.texture,
      variant: seed.background.variant,
    },
    typography: {
      headingFamily:
        seed.typography?.headingFamily ??
        (seed.background.variant === 'comic' ? display : serif),
      bodyFamily: seed.typography?.bodyFamily ?? sans,
      handwrittenFamily:
        seed.typography?.handwrittenFamily ?? handwritten,
      headingWeight: seed.typography?.headingWeight ?? 700,
      bodyWeight: seed.typography?.bodyWeight ?? 400,
    },
    safeArea,
    defaultElements,
  };
}

export const letterThemes: LetterTheme[] = themeSeeds.flatMap((seed) => [
  createOrientationTheme(seed, 'portrait'),
  createOrientationTheme(seed, 'landscape'),
]);

export function getThemesForOrientation(
  orientation: PaperOrientation | null,
  themes: readonly LetterTheme[] = letterThemes,
): LetterTheme[] {
  if (!orientation) return [];
  return themes.filter((theme) => theme.orientation === orientation);
}

export function getDefaultThemeForOrientation(
  orientation: PaperOrientation,
): LetterTheme {
  const theme = getThemesForOrientation(orientation)[0];
  if (!theme) {
    throw new Error('Kh\u00f4ng c\u00f3 theme cho lo\u1ea1i gi\u1ea5y ' + orientation);
  }
  return theme;
}

export function resolveThemeForOrientation(
  themeId: string | null | undefined,
  orientation: PaperOrientation,
): LetterTheme {
  const direct = letterThemes.find(
    (theme) =>
      theme.id === themeId && theme.orientation === orientation,
  );
  if (direct) return direct;

  const baseId = themeId?.replace(/-(portrait|landscape)$/, '');
  const migrated = baseId
    ? letterThemes.find(
        (theme) =>
          theme.id === baseId + '-' + orientation &&
          theme.orientation === orientation,
      )
    : undefined;
  return migrated ?? getDefaultThemeForOrientation(orientation);
}

export const defaultTheme =
  getDefaultThemeForOrientation('portrait');

export function getLetterTheme(
  themeId: string | null,
  orientation: PaperOrientation = 'portrait',
): LetterTheme {
  return resolveThemeForOrientation(themeId, orientation);
}

export function createElementsFromTheme(theme: LetterTheme): ThemeElement[] {
  return theme.defaultElements.map((element) => ({
    ...element,
    initial: { ...element.initial },
  }));
}
