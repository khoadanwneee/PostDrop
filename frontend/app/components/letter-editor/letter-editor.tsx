'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { PAPER_CONFIGS } from '@/app/config/paper-configs';
import { stickerElements } from '@/app/data/sticker-elements';
import { useLetterEditor } from '@/app/hooks/use-letter-editor';
import { useLocalStorageDraft } from '@/app/hooks/use-local-storage-draft';
import { useResponsiveCanvas } from '@/app/hooks/use-responsive-canvas';
import { clampElementToCanvas } from '@/app/lib/letter-editor/collision';
import {
  createImageElement,
  createShapeElement,
  createTextElement,
  duplicateElement,
} from '@/app/lib/letter-editor/element-factory';
import { hasMeaningfulEditorData } from '@/app/lib/letter-editor/state';
import type {
  EditorInteractionMode,
  LetterFont,
  PaperOrientation,
  StickerDefinition,
  ThemeElement,
} from '@/app/types/letter-editor';
import { ChangePaperDialog } from './change-paper-dialog';
import { ElementToolbar } from './element-toolbar';
import { LetterCanvas } from './letter-canvas';
import { PaperOrientationSelector } from './paper-orientation-selector';
import { SelectedElementToolbar } from './selected-element-toolbar';
import { ThemeSidebar } from './theme-sidebar';

export interface LetterEditorInitialDraft {
  paperOrientation: PaperOrientation | null;
  selectedThemeId: string | null;
  letterFont: LetterFont;
  letterContent: string;
  letterTitle: string;
  userElements: ThemeElement[];
}

interface LetterEditorProps {
  initialDraft: LetterEditorInitialDraft;
  onChange: (draft: LetterEditorInitialDraft) => void;
}

function notify(message: string, type = 'success') {
  window.dispatchEvent(
    new CustomEvent('postdrop-editor-toast', {
      detail: { message, type },
    }),
  );
}

export function LetterEditor({ initialDraft, onChange }: LetterEditorProps) {
  const editor = useLetterEditor(initialDraft);
  const [changePaperOpen, setChangePaperOpen] = useState(false);
  const [letterFont, setLetterFont] = useState<LetterFont>(
    initialDraft.letterFont ?? 'serif',
  );
  const [, setInteractionMode] = useState<EditorInteractionMode>('idle');
  const orientation = editor.paperOrientation;
  const {
    viewportRef,
    canvasSize,
    displaySize,
    scale,
  } = useResponsiveCanvas(orientation ?? 'portrait', 720);
  const elements = editor.history.present.elements;
  const selectedId = editor.selectedElementId;
  const selectedThemeId = editor.history.present.selectedThemeId;

  useLocalStorageDraft({
    paperOrientation: orientation,
    selectedThemeId,
    letterContent: editor.letterContent,
    letterTitle: editor.letterTitle,
    elements,
  });

  useEffect(() => {
    onChange({
      paperOrientation: orientation,
      selectedThemeId,
      letterFont,
      letterContent: editor.letterContent,
      letterTitle: editor.letterTitle,
      userElements: elements.filter((element) => element.source === 'user'),
    });
  }, [
    editor.letterContent,
    editor.letterTitle,
    elements,
    letterFont,
    onChange,
    orientation,
    selectedThemeId,
  ]);

  const replaceElement = useCallback(
    (nextElement: ThemeElement) => {
      editor.updateElements((current) =>
        current.map((element) =>
          element.id === nextElement.id ? nextElement : element,
        ),
      );
    },
    [editor],
  );

  const deleteElement = useCallback(
    (id: string) => {
      const target = elements.find((element) => element.id === id);
      if (!target || target.locked) return;
      editor.updateElements((current) =>
        current.filter((element) => element.id !== id),
      );
      editor.setSelectedElementId(null);
      notify('Đã xóa element khỏi lá thư.');
    },
    [editor, elements],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditing =
        target?.matches('input, textarea, [contenteditable="true"]') ?? false;
      if (isEditing || !selectedId) return;
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        deleteElement(selectedId);
      }
      if (event.key === 'Escape') editor.setSelectedElementId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteElement, editor, selectedId]);

  const addElement = useCallback(
    (element: ThemeElement, message: string) => {
      editor.updateElements((current) => [...current, element]);
      editor.setSelectedElementId(element.id);
      notify(message);
    },
    [editor],
  );

  const addSticker = useCallback(
    (sticker: StickerDefinition) => {
      if (!editor.selectedTheme || !orientation) return;
      addElement(
        createImageElement(
          sticker,
          editor.selectedTheme.safeArea,
          orientation,
          elements.length,
        ),
        `Đã thêm ${sticker.name}.`,
      );
    },
    [addElement, editor.selectedTheme, elements.length, orientation],
  );

  const handleDropSticker = useCallback(
    (stickerId: string, center: { x: number; y: number }) => {
      const sticker = stickerElements.find((item) => item.id === stickerId);
      if (!sticker || !editor.selectedTheme || !orientation) return;
      const baseElement = createImageElement(
        sticker,
        editor.selectedTheme.safeArea,
        orientation,
        elements.length,
      );
      const droppedElement = clampElementToCanvas(
        {
          ...baseElement,
          x: Math.max(0, Math.min(1 - baseElement.width, center.x - baseElement.width / 2)),
          y: Math.max(0, Math.min(1 - baseElement.height, center.y - baseElement.height / 2)),
          initial: {
            ...baseElement.initial,
            x: Math.max(0, Math.min(1 - baseElement.width, center.x - baseElement.width / 2)),
            y: Math.max(0, Math.min(1 - baseElement.height, center.y - baseElement.height / 2)),
          },
        },
        canvasSize,
      );
      addElement(droppedElement, `Đã thêm ${sticker.name}.`);
    },
    [addElement, canvasSize, editor.selectedTheme, elements.length, orientation],
  );

  const addUploadedImage = useCallback(
    (src: string, name: string, aspectRatio: number) => {
      if (!editor.selectedTheme || !orientation) return;
      const definition: StickerDefinition = {
        id: `upload-${Date.now()}`,
        name,
        kind: 'image',
        src,
        aspectRatio: Math.max(0.2, Math.min(5, aspectRatio || 1)),
        defaultWidth: 0.16,
      };
      addElement(
        createImageElement(
          definition,
          editor.selectedTheme.safeArea,
          orientation,
          elements.length,
          src,
        ),
        'Đã thêm ảnh của bạn.',
      );
    },
    [addElement, editor.selectedTheme, elements.length, orientation],
  );

  const maxZIndex = useMemo(
    () => Math.max(0, ...elements.map((element) => element.zIndex)),
    [elements],
  );

  const updateSelected = useCallback(
    (updater: (element: ThemeElement) => ThemeElement) => {
      if (!editor.selectedElement) return;
      replaceElement(updater(editor.selectedElement));
    },
    [editor.selectedElement, replaceElement],
  );

  const handleFontChange = (nextFont: LetterFont) => {
    if (nextFont === letterFont) return;
    setLetterFont(nextFont);
  };

  const handleThemeSelect = (themeId: string) => {
    if (themeId === selectedThemeId) return;
    editor.selectTheme(themeId);
  };

  const handleInitialOrientation = (nextOrientation: PaperOrientation) => {
    editor.choosePaperOrientation(nextOrientation);
  };

  const handleOrientationChange = (nextOrientation: PaperOrientation) => {
    editor.choosePaperOrientation(nextOrientation);
    setChangePaperOpen(false);
  };

  const requiresOrientationConfirmation = hasMeaningfulEditorData({
    letterTitle: editor.letterTitle,
    letterContent: editor.letterContent,
    elements,
    hasUnsavedChanges: editor.history.past.length > 0,
  });

  if (!orientation || !editor.selectedTheme || !selectedThemeId) {
    return (
      <section
        className="letter-editor-app letter-editor-orientation-gate"
        aria-label="Chọn loại giấy"
      >
        <PaperOrientationSelector onSelect={handleInitialOrientation} />
      </section>
    );
  }

  const selectedTheme = editor.selectedTheme;
  const minimumZIndex = Math.min(
    0,
    ...elements.map((element) => element.zIndex),
  );

  return (
    <section
      className={`letter-editor-app orientation-${orientation}`}
      aria-label="Trình thiết kế lá thư"
      data-paper-orientation={orientation}
    >
      <SelectedElementToolbar
        element={editor.selectedElement}
        canUndo={editor.history.past.length > 0}
        canRedo={editor.history.future.length > 0}
        onUndo={editor.undo}
        onRedo={editor.redo}
        onDuplicate={() => {
          if (!editor.selectedElement) return;
          const duplicated = duplicateElement(
            editor.selectedElement,
            selectedTheme.safeArea,
            orientation,
            maxZIndex + 1,
          );
          addElement(duplicated, 'Đã nhân bản element.');
        }}
        onToggleLock={() =>
          updateSelected((element) => ({
            ...element,
            locked: !element.locked,
          }))
        }
        onMoveUp={() =>
          updateSelected((element) => ({
            ...element,
            zIndex: maxZIndex + 1,
          }))
        }
        onMoveDown={() =>
          updateSelected((element) => ({
            ...element,
            zIndex: minimumZIndex - 1,
          }))
        }
        onReset={() =>
          updateSelected((element) => ({
            ...element,
            ...element.initial,
            scaleX: 1,
            scaleY: 1,
          }))
        }
        onDelete={() => {
          if (selectedId) deleteElement(selectedId);
        }}
      />
      <div className="letter-editor-layout">
        <ThemeSidebar
          orientation={orientation}
          selectedThemeId={selectedThemeId}
          onSelect={handleThemeSelect}
          onChangeOrientation={() => setChangePaperOpen(true)}
        />
        <main
          className="letter-editor-stage"
          aria-label={`Trang thư A4 ${PAPER_CONFIGS[orientation].label.toLowerCase()}`}
        >
          <div ref={viewportRef} className="letter-canvas-viewport">
            <div
              className="letter-canvas-scale-frame"
              style={{ width: displaySize.width, height: displaySize.height }}
            >
              <div
                className="letter-canvas-scale-layer"
                style={{
                  width: canvasSize.width,
                  height: canvasSize.height,
                  transform: `scale(${scale})`,
                }}
              >
                <LetterCanvas
                  theme={selectedTheme}
                  elements={elements}
                  selectedElement={editor.selectedElement}
                  selectedElementId={selectedId}
                  canvasSize={canvasSize}
                  displayScale={scale}
                  title={editor.letterTitle}
                  content={editor.letterContent}
                  letterFont={letterFont}
                  onSelect={editor.setSelectedElementId}
                  onElementChange={replaceElement}
                  onDelete={deleteElement}
                  onTitleChange={editor.setLetterTitle}
                  onContentChange={editor.setLetterContent}
                  onDropSticker={handleDropSticker}
                  onInteractionModeChange={setInteractionMode}
                />
              </div>
            </div>
          </div>
        </main>
        <ElementToolbar
          letterFont={letterFont}
          onFontChange={handleFontChange}
          onAddSticker={addSticker}
          onAddText={() =>
            addElement(
              createTextElement(
                selectedTheme.safeArea,
                orientation,
                elements.length,
              ),
              'Đã thêm chữ trang trí.',
            )
          }
          onAddShape={() =>
            addElement(
              createShapeElement(
                selectedTheme.safeArea,
                orientation,
                elements.length,
              ),
              'Đã thêm hình khối.',
            )
          }
          onAddImage={addUploadedImage}
        />
      </div>
      {elements.length === 0 ? (
        <div className="editor-empty-notice">
          Chưa có element trang trí. Hãy chọn một món trong thư viện.
        </div>
      ) : null}
      <div className="editor-mobile-selection" aria-live="polite">
        {editor.selectedElement
          ? `Đang chọn: ${editor.selectedElement.alt ?? editor.selectedElement.text ?? 'element'}`
          : 'Chạm một element để chỉnh sửa'}
      </div>
      <span className="sr-only" aria-live="polite">
        {stickerElements.length} element có sẵn trong thư viện
      </span>
      <ChangePaperDialog
        open={changePaperOpen}
        currentOrientation={orientation}
        requiresConfirmation={requiresOrientationConfirmation}
        onCancel={() => setChangePaperOpen(false)}
        onConfirm={handleOrientationChange}
      />
    </section>
  );
}
