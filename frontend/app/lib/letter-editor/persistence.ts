import { isPaperOrientation } from '@/app/config/paper-configs';
import { resolveThemeForOrientation } from '@/app/data/letter-themes';
import { sanitizeUserElements } from './asset-urls';
import type {
  PaperOrientation,
  PersistedLetterEditorDraft,
  ThemeElement,
} from '@/app/types/letter-editor';

export const LETTER_EDITOR_STORAGE_KEY = 'postdrop-letter-editor-draft';
export const LEGACY_DRAFT_STORAGE_KEY = 'postdrop-draft';

export interface EditorDraftInput {
  paperOrientation: PaperOrientation | null;
  selectedThemeId: string | null;
  letterContent: string;
  letterTitle: string;
  elements: ThemeElement[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function createPersistedEditorDraft(
  input: EditorDraftInput,
  updatedAt = new Date().toISOString(),
): PersistedLetterEditorDraft {
  return {
    schemaVersion: 2,
    paperOrientation: input.paperOrientation,
    selectedThemeId: input.selectedThemeId,
    letterContent: input.letterContent,
    letterTitle: input.letterTitle,
    userElements: sanitizeUserElements(input.elements),
    updatedAt,
  };
}

export function createNewEditorDraft() {
  return {
    paperOrientation: null,
    selectedThemeId: null,
    letterContent: '',
    letterTitle: '',
    userElements: [] as ThemeElement[],
  };
}

export function clearPersistedDraft(
  storage: Pick<Storage, 'removeItem'>,
) {
  storage.removeItem(LETTER_EDITOR_STORAGE_KEY);
  storage.removeItem(LEGACY_DRAFT_STORAGE_KEY);
}

export function restoreEditorState(
  rawEditorDraft: unknown,
  rawLegacyDraft: unknown,
) {
  const editorDraft = isRecord(rawEditorDraft) ? rawEditorDraft : {};
  const legacyDraft = isRecord(rawLegacyDraft) ? rawLegacyDraft : {};
  const legacyHasOrientation = Object.prototype.hasOwnProperty.call(
    legacyDraft,
    'paperOrientation',
  );

  let paperOrientation: PaperOrientation | null = null;
  if (isPaperOrientation(editorDraft.paperOrientation)) {
    paperOrientation = editorDraft.paperOrientation;
  } else if (isPaperOrientation(legacyDraft.paperOrientation)) {
    paperOrientation = legacyDraft.paperOrientation;
  } else if (
    !legacyHasOrientation &&
    (typeof editorDraft.selectedThemeId === 'string' ||
      Array.isArray(editorDraft.userElements))
  ) {
    // Drafts created before schema v2 were portrait-only.
    paperOrientation = 'portrait';
  }

  const requestedThemeId =
    typeof editorDraft.selectedThemeId === 'string'
      ? editorDraft.selectedThemeId
      : typeof legacyDraft.selectedThemeId === 'string'
        ? legacyDraft.selectedThemeId
        : typeof legacyDraft.theme === 'string'
          ? legacyDraft.theme
          : null;
  const selectedThemeId = paperOrientation
    ? resolveThemeForOrientation(requestedThemeId, paperOrientation).id
    : null;

  return {
    paperOrientation,
    selectedThemeId,
    letterContent:
      typeof legacyDraft.content === 'string'
        ? legacyDraft.content
        : typeof editorDraft.letterContent === 'string'
          ? editorDraft.letterContent
          : '',
    letterTitle:
      typeof legacyDraft.title === 'string'
        ? legacyDraft.title
        : typeof editorDraft.letterTitle === 'string'
          ? editorDraft.letterTitle
          : '',
    userElements: sanitizeUserElements(editorDraft.userElements),
  };
}
