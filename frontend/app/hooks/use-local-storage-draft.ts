'use client';

import { useEffect } from 'react';
import {
  createPersistedEditorDraft,
  LEGACY_DRAFT_STORAGE_KEY,
  LETTER_EDITOR_STORAGE_KEY,
} from '@/app/lib/letter-editor/persistence';
import type {
  PaperOrientation,
  PersistedLetterEditorDraft,
  ThemeElement,
} from '@/app/types/letter-editor';

export {
  LEGACY_DRAFT_STORAGE_KEY,
  LETTER_EDITOR_STORAGE_KEY,
};

interface DraftInput {
  paperOrientation: PaperOrientation | null;
  selectedThemeId: string | null;
  letterContent: string;
  letterTitle: string;
  elements: ThemeElement[];
}

export function readPersistedEditorDraft(): Partial<PersistedLetterEditorDraft> {
  if (typeof window === 'undefined') return {};
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(LETTER_EDITOR_STORAGE_KEY) ?? '{}',
    );
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Partial<PersistedLetterEditorDraft>)
      : {};
  } catch {
    return {};
  }
}

export function readLegacyDraft() {
  if (typeof window === 'undefined') return {};
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(LEGACY_DRAFT_STORAGE_KEY) ?? '{}',
    );
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export function writePersistedEditorDraft(input: DraftInput) {
  const persisted = createPersistedEditorDraft(input);
  localStorage.setItem(
    LETTER_EDITOR_STORAGE_KEY,
    JSON.stringify(persisted),
  );
  return persisted;
}

export function useLocalStorageDraft(input: DraftInput) {
  const {
    paperOrientation,
    selectedThemeId,
    letterContent,
    letterTitle,
    elements,
  } = input;
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const persisted = writePersistedEditorDraft({
          paperOrientation,
          selectedThemeId,
          letterContent,
          letterTitle,
          elements,
        });
        window.dispatchEvent(
          new CustomEvent('postdrop-editor-saved', {
            detail: { updatedAt: persisted.updatedAt },
          }),
        );
      } catch {
        window.dispatchEvent(
          new CustomEvent('postdrop-editor-toast', {
            detail: {
              message:
                'Bản nháp chưa thể lưu vì bộ nhớ trình duyệt đã đầy.',
              type: 'error',
            },
          }),
        );
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [
    elements,
    letterContent,
    letterTitle,
    paperOrientation,
    selectedThemeId,
  ]);
}
