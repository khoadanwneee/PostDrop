export type ElementSource = 'theme' | 'user';
export type ThemeElementType = 'image' | 'text' | 'shape';
export type PaperOrientation = 'portrait' | 'landscape';
export type LetterFont = 'serif' | 'modern' | 'hand';
export type EditorInteractionMode =
  | 'idle'
  | 'typing'
  | 'dragging-element'
  | 'resizing-element'
  | 'rotating-element'
  | 'zooming';
export type LetterThemeVariant =
  | 'minimal'
  | 'kawaii'
  | 'comic'
  | 'study'
  | 'scrapbook'
  | 'lavender';
export type DecorationKind =
  | 'sticker'
  | 'icon'
  | 'image'
  | 'text'
  | 'shape'
  | 'washi'
  | 'frame'
  | 'sparkle'
  | 'heart'
  | 'bow'
  | 'star';

export interface SafeArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface PaperConfig {
  orientation: PaperOrientation;
  label: string;
  description: string;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface ElementInitialState {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface ThemeElement {
  id: string;
  type: ThemeElementType;
  kind: DecorationKind;
  src?: string;
  text?: string;
  alt?: string;
  shape?: 'rect' | 'circle';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fontFamily?: string;
  fontStyle?: string;
  fontSizeScale?: number;
  letterSpacing?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  zIndex: number;
  locked: boolean;
  source: ElementSource;
  initial: ElementInitialState;
}

export interface LetterTheme {
  id: string;
  name: string;
  description: string;
  orientation: PaperOrientation;
  thumbnail: string;
  canvas: {
    backgroundColor: string;
    backgroundImage?: string;
    accent: string;
    texture: 'paper' | 'dots' | 'grid' | 'lines';
    variant: LetterThemeVariant;
  };
  typography: {
    headingFamily: string;
    bodyFamily: string;
    handwrittenFamily: string;
    headingWeight: 600 | 700;
    bodyWeight: 400 | 500;
  };
  safeArea: SafeArea;
  defaultElements: ThemeElement[];
}

export interface LetterEditorSnapshot {
  selectedThemeId: string | null;
  elements: ThemeElement[];
}

export interface LetterEditorState extends LetterEditorSnapshot {
  paperOrientation: PaperOrientation | null;
  letterContent: string;
  letterTitle: string;
  selectedElementId: string | null;
}

export interface EditorHistory {
  past: LetterEditorSnapshot[];
  present: LetterEditorSnapshot;
  future: LetterEditorSnapshot[];
}

export interface PersistedLetterEditorDraft {
  schemaVersion: 2;
  paperOrientation: PaperOrientation | null;
  selectedThemeId: string | null;
  letterContent: string;
  letterTitle: string;
  userElements: ThemeElement[];
  updatedAt: string;
}

export type StickerCategory =
  | 'cute'
  | 'y2k'
  | 'study'
  | 'scrapbook'
  | 'classic';

export interface StickerDefinition {
  id: string;
  name: string;
  kind: DecorationKind;
  category?: StickerCategory;
  src: string;
  aspectRatio: number;
  defaultWidth: number;
}
