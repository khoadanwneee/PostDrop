'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  getDefaultThemeForOrientation,
  resolveThemeForOrientation,
} from '@/app/data/letter-themes';
import {
  changePaperOrientation as changeSnapshotOrientation,
  changeTheme,
  commitHistory,
  createSnapshot,
  redoHistory,
  undoHistory,
} from '@/app/lib/letter-editor/state';
import type {
  EditorHistory,
  LetterEditorSnapshot,
  PaperOrientation,
  ThemeElement,
} from '@/app/types/letter-editor';

export interface InitialEditorState {
  paperOrientation: PaperOrientation | null;
  selectedThemeId: string | null;
  letterContent: string;
  letterTitle: string;
  userElements: ThemeElement[];
}

export function useLetterEditor(initial: InitialEditorState) {
  const [paperOrientation, setPaperOrientation] =
    useState<PaperOrientation | null>(initial.paperOrientation);
  const [history, setHistory] = useState<EditorHistory>(() => ({
    past: [],
    present: createSnapshot(
      initial.paperOrientation,
      initial.selectedThemeId,
      initial.userElements,
    ),
    future: [],
  }));
  const [letterContent, setLetterContent] = useState(initial.letterContent);
  const [letterTitle, setLetterTitle] = useState(initial.letterTitle);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null,
  );

  const commit = useCallback((next: LetterEditorSnapshot) => {
    setHistory((current) => commitHistory(current, next));
  }, []);

  const updateElements = useCallback(
    (updater: (elements: ThemeElement[]) => ThemeElement[]) => {
      setHistory((current) =>
        commitHistory(current, {
          ...current.present,
          elements: updater(current.present.elements),
        }),
      );
    },
    [],
  );

  const selectTheme = useCallback(
    (themeId: string) => {
      if (!paperOrientation) return;
      const requested = resolveThemeForOrientation(
        themeId,
        paperOrientation,
      );
      if (requested.id !== themeId) return;
      setHistory((current) =>
        commitHistory(
          current,
          changeTheme(current.present, paperOrientation, themeId),
        ),
      );
      setSelectedElementId(null);
    },
    [paperOrientation],
  );

  const choosePaperOrientation = useCallback(
    (orientation: PaperOrientation) => {
      setHistory((current) => {
        const next = paperOrientation
          ? changeSnapshotOrientation(
              current.present,
              paperOrientation,
              orientation,
            )
          : createSnapshot(
              orientation,
              getDefaultThemeForOrientation(orientation).id,
              initial.userElements,
            );
        return { past: [], present: next, future: [] };
      });
      setPaperOrientation(orientation);
      setSelectedElementId(null);
    },
    [initial.userElements, paperOrientation],
  );

  const undo = useCallback(() => {
    setHistory((current) => undoHistory(current));
    setSelectedElementId(null);
  }, []);
  const redo = useCallback(() => {
    setHistory((current) => redoHistory(current));
    setSelectedElementId(null);
  }, []);

  const selectedTheme = useMemo(
    () =>
      paperOrientation
        ? resolveThemeForOrientation(
            history.present.selectedThemeId,
            paperOrientation,
          )
        : null,
    [history.present.selectedThemeId, paperOrientation],
  );
  const selectedElement = useMemo(
    () =>
      history.present.elements.find(
        (element) => element.id === selectedElementId,
      ) ?? null,
    [history.present.elements, selectedElementId],
  );

  return {
    paperOrientation,
    history,
    commit,
    updateElements,
    selectedTheme,
    selectedElement,
    selectedElementId,
    setSelectedElementId,
    selectTheme,
    choosePaperOrientation,
    letterContent,
    setLetterContent,
    letterTitle,
    setLetterTitle,
    undo,
    redo,
  };
}
