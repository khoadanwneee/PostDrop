'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type Konva from 'konva';
import {
  Image as KonvaImage,
  Layer,
  Line,
  Rect,
  Stage,
  Transformer,
} from 'react-konva';
import { isSafeImageAssetUrl } from '@/app/lib/letter-editor/asset-urls';
import {
  clampElementToCanvas,
  findNearestValidPosition,
  getElementBoundingBox,
  isOverlappingSafeArea,
} from '@/app/lib/letter-editor/collision';
import { toPixelRect } from '@/app/lib/letter-editor/coordinates';
import {
  hasBlockedExternalAssetDrop,
  LETTER_STICKER_MIME,
  parseStickerDragPayload,
} from '@/app/lib/letter-editor/drag-payload';
import type {
  CanvasSize,
  EditorInteractionMode,
  LetterFont,
  LetterTheme,
  ThemeElement,
} from '@/app/types/letter-editor';
import { ElementRenderer } from './element-renderer';
import { LetterContentEditor } from './letter-content-editor';

function useThemeArtwork(src?: string) {
  const [loaded, setLoaded] = useState<{
    src: string;
    image: HTMLImageElement;
  } | null>(null);

  useEffect(() => {
    if (!src || !isSafeImageAssetUrl(src)) return;
    const nextImage = new Image();
    nextImage.onload = () => setLoaded({ src, image: nextImage });
    nextImage.onerror = () => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[letter-editor] Theme artwork failed to load.');
      }
      setLoaded(null);
    };
    nextImage.src = src;
    return () => {
      nextImage.onload = null;
      nextImage.onerror = null;
    };
  }, [src]);

  return loaded && loaded.src === src ? loaded.image : null;
}
interface LetterCanvasProps {
  theme: LetterTheme;
  elements: ThemeElement[];
  selectedElement: ThemeElement | null;
  selectedElementId: string | null;
  canvasSize: CanvasSize;
  displayScale: number;
  title: string;
  content: string;
  letterFont: LetterFont;
  onSelect: (id: string | null) => void;
  onElementChange: (element: ThemeElement) => void;
  onDelete: (id: string) => void;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onDropSticker: (stickerId: string, center: { x: number; y: number }) => void;
  onInteractionModeChange: (mode: EditorInteractionMode) => void;
}

function BackgroundTexture({
  theme,
  canvasSize,
}: {
  theme: LetterTheme;
  canvasSize: CanvasSize;
}) {
  const safePixel = toPixelRect(theme.safeArea, canvasSize);
  const artwork = useThemeArtwork(theme.canvas.backgroundImage);
  const lines = useMemo(() => {
    const result: React.ReactNode[] = [];
    if (theme.canvas.texture === 'grid') {
      const step = canvasSize.width / 14;
      for (let x = step; x < canvasSize.width; x += step) {
        result.push(
          <Line
            key={`v-${x}`}
            points={[x, 0, x, canvasSize.height]}
            stroke={theme.canvas.accent}
            opacity={0.08}
            strokeWidth={1}
          />,
        );
      }
      for (let y = step; y < canvasSize.height; y += step) {
        result.push(
          <Line
            key={`h-${y}`}
            points={[0, y, canvasSize.width, y]}
            stroke={theme.canvas.accent}
            opacity={0.08}
            strokeWidth={1}
          />,
        );
      }
    }
    if (theme.canvas.texture === 'lines') {
      const step = canvasSize.height / 32;
      for (let y = step; y < canvasSize.height; y += step) {
        result.push(
          <Line
            key={`line-${y}`}
            points={[0, y, canvasSize.width, y]}
            stroke={theme.canvas.accent}
            opacity={0.055}
            strokeWidth={1}
          />,
        );
      }
    }
    if (theme.canvas.texture === 'dots') {
      const step = canvasSize.width / 18;
      for (let x = step / 2; x < canvasSize.width; x += step) {
        for (let y = step / 2; y < canvasSize.height; y += step) {
          result.push(
            <Rect
              key={`dot-${x}-${y}`}
              x={x}
              y={y}
              width={1.3}
              height={1.3}
              cornerRadius={2}
              fill={theme.canvas.accent}
              opacity={0.11}
            />,
          );
        }
      }
    }
    if (theme.canvas.texture === 'paper') {
      const step = canvasSize.height / 28;
      for (let index = 1; index < 28; index += 1) {
        const y = index * step + ((index % 3) - 1) * 1.5;
        result.push(
          <Line
            key={`fiber-${index}`}
            points={[0, y, canvasSize.width, y + (index % 2 ? 1 : -1)]}
            stroke={theme.canvas.accent}
            opacity={0.025}
            strokeWidth={1}
          />,
        );
      }
    }
    return result;
  }, [canvasSize, theme]);

  return (
    <>
      <Rect
        width={canvasSize.width}
        height={canvasSize.height}
        fill={theme.canvas.backgroundColor}
      />
      {artwork ? (
        <KonvaImage
          image={artwork}
          width={canvasSize.width}
          height={canvasSize.height}
          listening={false}
        />
      ) : null}
      {theme.canvas.variant === 'kawaii' ? (
        <>
          <Rect
            x={4}
            y={4}
            width={canvasSize.width - 8}
            height={canvasSize.height - 8}
            stroke="#f3b2c8"
            strokeWidth={Math.max(8, canvasSize.width * 0.022)}
            opacity={0.45}
            cornerRadius={12}
          />
          <Rect
            x={-canvasSize.width * 0.04}
            y={canvasSize.height * 0.58}
            width={canvasSize.width * 0.18}
            height={canvasSize.height * 0.18}
            fill="#cce7f5"
            rotation={-8}
            opacity={0.32}
          />
          <Rect
            x={canvasSize.width * 0.86}
            y={canvasSize.height * 0.18}
            width={canvasSize.width * 0.2}
            height={canvasSize.height * 0.17}
            fill="#ddd0f5"
            rotation={7}
            opacity={0.34}
          />
        </>
      ) : null}
      {theme.canvas.variant === 'comic' ? (
        <>
          <Rect width={canvasSize.width * 0.115} height={canvasSize.height} fill="#ff2d86" opacity={0.92} />
          <Rect x={canvasSize.width * 0.885} width={canvasSize.width * 0.115} height={canvasSize.height} fill="#18afe3" opacity={0.94} />
          <Rect y={canvasSize.height * 0.9} width={canvasSize.width} height={canvasSize.height * 0.1} fill="#ffd51e" opacity={0.96} />
          <Rect x={canvasSize.width * 0.1} width={canvasSize.width * 0.35} height={canvasSize.height * 0.08} fill="#ffec17" opacity={0.88} rotation={-4} />
          <Rect x={canvasSize.width * 0.63} y={-8} width={canvasSize.width * 0.34} height={canvasSize.height * 0.08} fill="#20b5e8" opacity={0.86} rotation={5} />
          <Rect x={8} y={8} width={canvasSize.width - 16} height={canvasSize.height - 16} stroke="#111111" strokeWidth={Math.max(2, canvasSize.width * 0.006)} />
        </>
      ) : null}
      {theme.canvas.variant === 'study' ? (
        <>
          <Rect x={6} y={6} width={canvasSize.width - 12} height={canvasSize.height - 12} stroke="#a99b72" strokeWidth={Math.max(5, canvasSize.width * 0.014)} opacity={0.22} cornerRadius={10} />
          <Rect x={canvasSize.width * 0.02} y={canvasSize.height * 0.14} width={canvasSize.width * 0.11} height={canvasSize.height * 0.7} fill="#dbe1bf" opacity={0.22} cornerRadius={8} />
          <Rect x={canvasSize.width * 0.87} y={canvasSize.height * 0.13} width={canvasSize.width * 0.11} height={canvasSize.height * 0.7} fill="#d5dfed" opacity={0.2} cornerRadius={8} />
          <Rect x={12} y={12} width={canvasSize.width - 24} height={canvasSize.height - 24} stroke="#8b805f" dash={[6, 7]} opacity={0.3} cornerRadius={8} />
        </>
      ) : null}
      {theme.canvas.variant === 'scrapbook' ? (
        <>
          <Rect x={-canvasSize.width * 0.04} y={canvasSize.height * 0.58} width={canvasSize.width * 0.24} height={canvasSize.height * 0.34} fill="#d9e1d0" opacity={0.48} rotation={-5} />
          <Rect x={canvasSize.width * 0.8} y={canvasSize.height * 0.62} width={canvasSize.width * 0.24} height={canvasSize.height * 0.28} fill="#efc7b5" opacity={0.52} rotation={6} />
          <Rect x={canvasSize.width * 0.02} y={canvasSize.height * 0.05} width={canvasSize.width * 0.17} height={canvasSize.height * 0.24} fill="#d8e0e2" opacity={0.32} rotation={-7} />
          <Rect x={10} y={10} width={canvasSize.width - 20} height={canvasSize.height - 20} stroke="#9e795d" dash={[2, 5]} opacity={0.32} />
        </>
      ) : null}
      {theme.canvas.variant === 'lavender' ? (
        <>
          <Rect x={5} y={5} width={canvasSize.width - 10} height={canvasSize.height - 10} stroke="#bda8d1" strokeWidth={Math.max(8, canvasSize.width * 0.02)} opacity={0.35} cornerRadius={10} />
          <Rect x={15} y={15} width={canvasSize.width - 30} height={canvasSize.height - 30} stroke="#8f72b2" dash={[2, 5]} opacity={0.28} cornerRadius={8} />
          <Rect x={-canvasSize.width * 0.03} y={canvasSize.height * 0.3} width={canvasSize.width * 0.16} height={canvasSize.height * 0.34} fill="#d9c9e8" opacity={0.28} rotation={-3} />
          <Rect x={canvasSize.width * 0.88} y={canvasSize.height * 0.36} width={canvasSize.width * 0.15} height={canvasSize.height * 0.32} fill="#c8b3dc" opacity={0.24} rotation={4} />
        </>
      ) : null}
      <Rect
        x={safePixel.x - 10}
        y={safePixel.y - 10}
        width={safePixel.width + 20}
        height={safePixel.height + 20}
        fill={theme.canvas.variant === 'comic' ? '#fffdf9' : '#fffdf8'}
        opacity={theme.canvas.variant === 'minimal' ? 0.56 : 0.74}
        cornerRadius={theme.canvas.variant === 'comic' ? 2 : 10}
        listening={false}
      />
      {lines}
      <Rect
        x={8}
        y={8}
        width={canvasSize.width - 16}
        height={canvasSize.height - 16}
        stroke={theme.canvas.accent}
        strokeWidth={1}
        opacity={0.23}
        cornerRadius={8}
      />
    </>
  );
}

export function LetterCanvas({
  theme,
  elements,
  selectedElement,
  selectedElementId,
  canvasSize,
  displayScale,
  title,
  content,
  letterFont,
  onSelect,
  onElementChange,
  onDelete,
  onTitleChange,
  onContentChange,
  onDropSticker,
  onInteractionModeChange,
}: LetterCanvasProps) {
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodesRef = useRef(new Map<string, Konva.Group>());
  const contentStickerDragRef = useRef<{
    element: ThemeElement;
    pointerId: number;
    startX: number;
    startY: number;
    next: ThemeElement;
  } | null>(null);
  const interactionScale = Math.max(0.24, displayScale);
  const transformerAnchorSize = Math.min(44, 22 / interactionScale);
  const transformerRotateOffset = Math.min(64, 34 / interactionScale);

  const getContentPointer = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const bounds = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!bounds || bounds.width <= 0 || bounds.height <= 0) return null;
    return {
      x: (event.clientX - bounds.left) / bounds.width,
      y: (event.clientY - bounds.top) / bounds.height,
    };
  };

  const moveContentSticker = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const drag = contentStickerDragRef.current;
    const pointer = getContentPointer(event);
    if (!drag || drag.pointerId !== event.pointerId || !pointer) return;
    event.preventDefault();
    const next = clampElementToCanvas(
      {
        ...drag.element,
        x: drag.element.x + pointer.x - drag.startX,
        y: drag.element.y + pointer.y - drag.startY,
      },
      canvasSize,
    );
    drag.next = next;
    const node = nodesRef.current.get(next.id);
    if (!node) return;
    const pixel = toPixelRect(next, canvasSize);
    node.position({
      x: pixel.x + pixel.width / 2,
      y: pixel.y + pixel.height / 2,
    });
    node.getLayer()?.batchDraw();
    transformerRef.current?.getLayer()?.batchDraw();
  };

  const finishContentStickerDrag = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const drag = contentStickerDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    contentStickerDragRef.current = null;
    onElementChange(drag.next);
    onInteractionModeChange('idle');
  };

  useEffect(() => {
    const cancelInteraction = () => {
      contentStickerDragRef.current = null;
      onInteractionModeChange('idle');
    };
    window.addEventListener('blur', cancelInteraction);
    return () => {
      window.removeEventListener('blur', cancelInteraction);
      cancelInteraction();
    };
  }, [onInteractionModeChange]);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    const node = selectedElementId
      ? nodesRef.current.get(selectedElementId)
      : undefined;
    transformer.nodes(node && !selectedElement?.locked ? [node] : []);
    transformer.getLayer()?.batchDraw();
  }, [elements, selectedElement, selectedElementId]);

  const handleTransformEnd = () => {
    if (!selectedElementId || !selectedElement) return;
    const node = nodesRef.current.get(selectedElementId);
    if (!node) return;
    const transformed = findNearestValidPosition(
      {
        ...selectedElement,
        x:
          (node.x() -
            (selectedElement.width * canvasSize.width * Math.abs(node.scaleX())) /
              2) /
          canvasSize.width,
        y:
          (node.y() -
            (selectedElement.height * canvasSize.height * Math.abs(node.scaleY())) /
              2) /
          canvasSize.height,
        width: selectedElement.width * Math.abs(node.scaleX()),
        height: selectedElement.height * Math.abs(node.scaleY()),
        rotation: node.rotation(),
        scaleX: 1,
        scaleY: 1,
      },
      theme.safeArea,
      canvasSize,
    );
    node.scaleX(1);
    node.scaleY(1);
    onElementChange(transformed);
    onInteractionModeChange('idle');
  };

  const selectedPixel = selectedElement
    ? toPixelRect(selectedElement, canvasSize)
    : null;

  return (
    <div
      className={`letter-canvas theme-${theme.canvas.variant}`}
      style={{
        width: canvasSize.width,
        height: canvasSize.height,
        '--canvas-accent': theme.canvas.accent,
        '--canvas-paper': theme.canvas.backgroundColor,
        '--editor-scale': displayScale,
        '--theme-font-heading': theme.typography.headingFamily,
        '--theme-font-body': theme.typography.bodyFamily,
        '--theme-font-handwritten': theme.typography.handwrittenFamily,
        '--theme-heading-weight': theme.typography.headingWeight,
        '--theme-body-weight': theme.typography.bodyWeight,
      } as React.CSSProperties}
      onFocusCapture={(event) => {
        if ((event.target as HTMLElement).matches('input, textarea')) {
          onInteractionModeChange('typing');
        }
      }}
      onWheel={(event) => {
        const shouldZoom = event.ctrlKey || event.metaKey;
        if (!shouldZoom) {
          return;
        }
        event.preventDefault();
        onInteractionModeChange('zooming');
      }}
      onBlurCapture={(event) => {
        if (
          (event.target as HTMLElement).matches('input, textarea') &&
          !(event.currentTarget.contains(event.relatedTarget as Node | null))
        ) {
          onInteractionModeChange('idle');
        }
      }}
      onDragOver={(event) => {
        const types = Array.from(event.dataTransfer.types);
        if (
          types.includes(LETTER_STICKER_MIME) ||
          hasBlockedExternalAssetDrop(event.dataTransfer)
        ) {
          event.preventDefault();
          event.dataTransfer.dropEffect = types.includes(LETTER_STICKER_MIME)
            ? 'copy'
            : 'none';
        }
      }}
      onDrop={(event) => {
        const types = Array.from(event.dataTransfer.types);
        const stickerId = parseStickerDragPayload(event.dataTransfer);
        if (stickerId) {
          event.preventDefault();
          event.stopPropagation();
          const bounds = event.currentTarget.getBoundingClientRect();
          onDropSticker(stickerId, {
            x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
            y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)),
          });
          return;
        }
        if (
          types.includes(LETTER_STICKER_MIME) ||
          hasBlockedExternalAssetDrop(event.dataTransfer)
        ) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      <Stage
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={(event) => {
          if (event.target === event.target.getStage()) onSelect(null);
        }}
        onTouchStart={(event) => {
          if (event.target === event.target.getStage()) onSelect(null);
        }}
      >
        <Layer listening={false}>
          <BackgroundTexture theme={theme} canvasSize={canvasSize} />
        </Layer>
        <Layer>
          {[...elements]
            .sort((first, second) => first.zIndex - second.zIndex)
            .map((element) => (
              <ElementRenderer
                key={element.id}
                element={element}
                canvasSize={canvasSize}
                safeArea={theme.safeArea}
                selected={element.id === selectedElementId}
                onSelect={onSelect}
                onChange={onElementChange}
                onInteractionModeChange={onInteractionModeChange}
                registerNode={(id, node) => {
                  if (node) nodesRef.current.set(id, node);
                  else nodesRef.current.delete(id);
                }}
              />
            ))}
        </Layer>
        <Layer>
          <Transformer
            ref={transformerRef}
            rotateEnabled
            keepRatio
            flipEnabled={false}
            anchorSize={transformerAnchorSize}
            anchorCornerRadius={transformerAnchorSize / 2}
            borderStroke="#7a263a"
            borderStrokeWidth={Math.max(1, 1.4 / interactionScale)}
            anchorFill="#fffdf8"
            anchorStroke="#7a263a"
            anchorStrokeWidth={Math.max(1, 1.5 / interactionScale)}
            rotateAnchorOffset={transformerRotateOffset}
            enabledAnchors={[
              'top-left',
              'top-right',
              'bottom-left',
              'bottom-right',
            ]}
            boundBoxFunc={(oldBox, newBox) => {
              if (
                newBox.width < 24 ||
                newBox.height < 24 ||
                newBox.x < 0 ||
                newBox.y < 0 ||
                newBox.x + newBox.width > canvasSize.width ||
                newBox.y + newBox.height > canvasSize.height
              ) {
                return oldBox;
              }
              if (!selectedElement) return oldBox;
              if (
                selectedElement.type === 'image' &&
                selectedElement.source === 'user'
              ) {
                return newBox;
              }
              const candidate: ThemeElement = {
                ...selectedElement,
                x: newBox.x / canvasSize.width,
                y: newBox.y / canvasSize.height,
                width: newBox.width / canvasSize.width,
                height: newBox.height / canvasSize.height,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
              };
              return isOverlappingSafeArea(candidate, theme.safeArea, canvasSize)
                ? oldBox
                : newBox;
            }}
            onTransformStart={() =>
              onInteractionModeChange(
                transformerRef.current?.getActiveAnchor() === 'rotater'
                  ? 'rotating-element'
                  : 'resizing-element',
              )
            }
            onTransformEnd={handleTransformEnd}
          />
        </Layer>
      </Stage>
      <LetterContentEditor
        safeArea={theme.safeArea}
        canvasSize={canvasSize}
        title={title}
        content={content}
        letterFont={letterFont}
        onTitleChange={onTitleChange}
        onContentChange={onContentChange}
        onPointerDown={(event) => {
          if (event.pointerType === 'mouse' && event.button !== 0) return;
          const pointer = getContentPointer(event);
          if (!pointer) return;
          const sticker = [...elements]
            .sort((first, second) => second.zIndex - first.zIndex)
            .find((element) => {
              if (
                element.type !== 'image' ||
                element.source !== 'user' ||
                element.locked
              ) {
                return false;
              }
              const box = getElementBoundingBox(element, canvasSize);
              return (
                pointer.x >= box.left &&
                pointer.x <= box.right &&
                pointer.y >= box.top &&
                pointer.y <= box.bottom
              );
            });
          if (!sticker) return;
          event.preventDefault();
          event.stopPropagation();
          onSelect(sticker.id);
          event.currentTarget.setPointerCapture(event.pointerId);
          onInteractionModeChange('dragging-element');
          contentStickerDragRef.current = {
            element: sticker,
            pointerId: event.pointerId,
            startX: pointer.x,
            startY: pointer.y,
            next: sticker,
          };
        }}
        onPointerMove={moveContentSticker}
        onPointerUp={finishContentStickerDrag}
        onPointerCancel={finishContentStickerDrag}
      />
      {selectedElement && selectedPixel && !selectedElement.locked ? (
        <button
          type="button"
          className="canvas-element-delete"
          style={{
            left: Math.min(
              canvasSize.width - 22 / interactionScale,
              selectedPixel.x + selectedPixel.width,
            ),
            top: Math.max(10 / interactionScale, selectedPixel.y - 8),
          }}
          onClick={() => onDelete(selectedElement.id)}
          aria-label="Xóa element đang chọn"
          title="Xóa element"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
