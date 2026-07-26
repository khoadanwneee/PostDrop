import { PAPER_CONFIGS } from '@/app/config/paper-configs';
import {
  createElementsFromTheme,
  getDefaultThemeForOrientation,
  resolveThemeForOrientation,
} from '@/app/data/letter-themes';
import type {
  EditorHistory,
  LetterEditorSnapshot,
  PaperOrientation,
  ThemeElement,
} from '@/app/types/letter-editor';
import { normalizeElementsForSafeArea } from './collision';
import { repositionElementsForOrientation } from './orientation';

export function createSnapshot(
  paperOrientation: PaperOrientation | null,
  selectedThemeId: string | null,
  userElements: ThemeElement[] = [],
): LetterEditorSnapshot {
  if (!paperOrientation) {
    return { selectedThemeId: null, elements: [] };
  }

  const theme = resolveThemeForOrientation(
    selectedThemeId,
    paperOrientation,
  );
  const validUserElements = normalizeElementsForSafeArea(
    userElements
      .filter((element) => element.source === 'user')
      .map((element) => ({ ...element, initial: { ...element.initial } })),
    theme.safeArea,
    PAPER_CONFIGS[paperOrientation],
  );

  return {
    selectedThemeId: theme.id,
    elements: [...createElementsFromTheme(theme), ...validUserElements],
  };
}

export function changeTheme(
  snapshot: LetterEditorSnapshot,
  paperOrientation: PaperOrientation,
  selectedThemeId: string,
): LetterEditorSnapshot {
  const theme = resolveThemeForOrientation(
    selectedThemeId,
    paperOrientation,
  );
  const userElements = normalizeElementsForSafeArea(
    snapshot.elements.filter((element) => element.source === 'user'),
    theme.safeArea,
    PAPER_CONFIGS[paperOrientation],
  );

  return {
    selectedThemeId: theme.id,
    elements: [...createElementsFromTheme(theme), ...userElements],
  };
}

export function changePaperOrientation(
  snapshot: LetterEditorSnapshot,
  fromOrientation: PaperOrientation,
  toOrientation: PaperOrientation,
): LetterEditorSnapshot {
  if (fromOrientation === toOrientation) return snapshot;
  const theme = getDefaultThemeForOrientation(toOrientation);
  const userElements = repositionElementsForOrientation(
    snapshot.elements.filter((element) => element.source === 'user'),
    fromOrientation,
    toOrientation,
    theme.safeArea,
  );
  return {
    selectedThemeId: theme.id,
    elements: [...createElementsFromTheme(theme), ...userElements],
  };
}

export function hasMeaningfulEditorData(input: {
  letterTitle: string;
  letterContent: string;
  elements: readonly ThemeElement[];
  hasUnsavedChanges?: boolean;
}): boolean {
  return Boolean(
    input.letterTitle.trim() ||
      input.letterContent.trim() ||
      input.elements.some((element) => element.source === 'user') ||
      input.hasUnsavedChanges,
  );
}

export function commitHistory(
  history: EditorHistory,
  present: LetterEditorSnapshot,
): EditorHistory {
  if (JSON.stringify(history.present) === JSON.stringify(present)) return history;
  return {
    past: [...history.past.slice(-49), history.present],
    present,
    future: [],
  };
}

export function undoHistory(history: EditorHistory): EditorHistory {
  const previous = history.past.at(-1);
  if (!previous) return history;
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redoHistory(history: EditorHistory): EditorHistory {
  const next = history.future[0];
  if (!next) return history;
  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(1),
  };
}
