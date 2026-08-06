'use client';

import { useMemo } from 'react';
import { LetterCanvas } from '@/app/components/letter-editor/letter-canvas';
import { useResponsiveCanvas } from '@/app/hooks/use-responsive-canvas';
import type { RevealAttachment } from '@/app/lib/reveal/reveal-client';
import type {
  LetterDesignSnapshot,
  LetterFont,
  LetterTheme,
} from '@/app/types/letter-editor';

interface RevealLetterDesignProps {
  snapshot: LetterDesignSnapshot;
  title: string;
  content: string;
  font: LetterFont;
  attachments: RevealAttachment[];
  attachmentImages: Record<string, string>;
}

export function RevealLetterDesign({
  snapshot,
  title,
  content,
  font,
  attachments,
  attachmentImages,
}: RevealLetterDesignProps) {
  const { viewportRef, canvasSize, displaySize, scale } = useResponsiveCanvas(
    snapshot.paperOrientation,
    720,
  );
  const attachmentByClientId = useMemo(
    () =>
      new Map(
        attachments
          .filter((attachment) => attachment.clientId)
          .map((attachment) => [attachment.clientId, attachment]),
      ),
    [attachments],
  );
  const elements = useMemo(
    () =>
      snapshot.elements.map((element) => {
        if (!element.attachmentClientId) return element;
        const attachment = attachmentByClientId.get(element.attachmentClientId);
        const src = attachment ? attachmentImages[attachment.id] : undefined;
        return src ? { ...element, src } : element;
      }),
    [attachmentByClientId, attachmentImages, snapshot.elements],
  );
  const theme: LetterTheme = {
    id: snapshot.selectedThemeId,
    name: snapshot.selectedThemeId,
    description: '',
    orientation: snapshot.paperOrientation,
    thumbnail: '',
    canvas: snapshot.canvas,
    typography: snapshot.typography,
    safeArea: snapshot.safeArea,
    defaultElements: [],
  };
  const noop = () => undefined;

  return (
    <div ref={viewportRef} className="reveal-design-viewport">
      <div
        className="reveal-design-frame"
        style={{ width: displaySize.width, height: displaySize.height }}
      >
        <div
          className="reveal-design-scale"
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            transform: `scale(${scale})`,
          }}
        >
          <LetterCanvas
            theme={theme}
            paperColor={snapshot.paper}
            elements={elements}
            selectedElement={null}
            selectedElementId={null}
            canvasSize={canvasSize}
            displayScale={scale}
            title={title}
            content={content}
            letterFont={font}
            onSelect={noop}
            onElementChange={noop}
            onDelete={noop}
            onTitleChange={noop}
            onContentChange={noop}
            onDropSticker={noop}
            onInteractionModeChange={noop}
          />
        </div>
      </div>
    </div>
  );
}
