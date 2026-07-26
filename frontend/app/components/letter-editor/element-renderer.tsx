'use client';

import { useEffect, useState } from 'react';
import type Konva from 'konva';
import { Ellipse, Group, Image as KonvaImage, Rect, Text } from 'react-konva';
import { isSafeImageAssetUrl } from '@/app/lib/letter-editor/asset-urls';
import { findNearestValidPosition } from '@/app/lib/letter-editor/collision';
import { toPixelRect } from '@/app/lib/letter-editor/coordinates';
import type {
  CanvasSize,
  EditorInteractionMode,
  SafeArea,
  ThemeElement,
} from '@/app/types/letter-editor';

function useImageElement(src: string | undefined, elementId: string) {
  const [state, setState] = useState<{
    image?: HTMLImageElement;
    failed: boolean;
  }>(() => ({
    failed: !src || !isSafeImageAssetUrl(src),
  }));

  useEffect(() => {
    if (!src || !isSafeImageAssetUrl(src)) {
      if (src && process.env.NODE_ENV !== 'production') {
        console.warn('[letter-editor] Rejected an unsafe image asset.', {
          elementId,
        });
      }
      return;
    }
    let isMounted = true;
    const nextImage = new Image();
    nextImage.crossOrigin = 'anonymous';
    nextImage.onload = () => {
      if (isMounted) setState({ image: nextImage, failed: false });
    };
    nextImage.onerror = () => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[letter-editor] An image asset failed to load.', {
          elementId,
        });
      }
      if (isMounted) setState({ failed: true });
    };
    nextImage.src = src;
    return () => {
      isMounted = false;
      nextImage.onload = null;
      nextImage.onerror = null;
    };
  }, [elementId, src]);

  return state;
}

interface ElementRendererProps {
  element: ThemeElement;
  canvasSize: CanvasSize;
  safeArea: SafeArea;
  selected: boolean;
  onSelect: (id: string) => void;
  onChange: (element: ThemeElement) => void;
  onInteractionModeChange: (mode: EditorInteractionMode) => void;
  registerNode: (id: string, node: Konva.Group | null) => void;
}

export function ElementRenderer({
  element,
  canvasSize,
  safeArea,
  selected,
  onSelect,
  onChange,
  onInteractionModeChange,
  registerNode,
}: ElementRendererProps) {
  const { image, failed: imageFailed } = useImageElement(
    element.src,
    element.id,
  );
  const pixel = toPixelRect(element, canvasSize);
  const commonShapeProps = {
    opacity: element.opacity,
    listening: true,
  };

  const constrainPosition = (position: { x: number; y: number }) => {
    const candidate = findNearestValidPosition(
      {
        ...element,
        x: (position.x - pixel.width / 2) / canvasSize.width,
        y: (position.y - pixel.height / 2) / canvasSize.height,
      },
      safeArea,
      canvasSize,
    );
    return {
      x: candidate.x * canvasSize.width + pixel.width / 2,
      y: candidate.y * canvasSize.height + pixel.height / 2,
    };
  };

  return (
    <Group
      ref={(node) => registerNode(element.id, node)}
      id={element.id}
      name="theme-element"
      x={pixel.x + pixel.width / 2}
      y={pixel.y + pixel.height / 2}
      width={pixel.width}
      height={pixel.height}
      offsetX={pixel.width / 2}
      offsetY={pixel.height / 2}
      rotation={element.rotation}
      opacity={element.locked ? 0.78 : 1}
      draggable={!element.locked}
      dragBoundFunc={constrainPosition}
      onClick={(event) => {
        event.cancelBubble = true;
        onSelect(element.id);
      }}
      onTap={(event) => {
        event.cancelBubble = true;
        onSelect(element.id);
      }}
      onDragStart={() => {
        onSelect(element.id);
        onInteractionModeChange('dragging-element');
      }}
      onDragEnd={(event) => {
        const candidate = findNearestValidPosition(
          {
            ...element,
            x: (event.target.x() - pixel.width / 2) / canvasSize.width,
            y: (event.target.y() - pixel.height / 2) / canvasSize.height,
          },
          safeArea,
          canvasSize,
        );
        onChange(candidate);
        onInteractionModeChange('idle');
      }}
      shadowColor={selected ? 'rgba(122, 38, 58, .3)' : 'rgba(43, 37, 35, .18)'}
      shadowBlur={selected ? 8 : 4}
      shadowOffsetY={2}
    >
      {element.type === 'image' && image ? (
        <KonvaImage
          image={image}
          width={pixel.width}
          height={pixel.height}
          {...commonShapeProps}
        />
      ) : null}
      {element.type === 'image' && imageFailed ? (
        <>
          <Rect
            width={pixel.width}
            height={pixel.height}
            fill="#f5eee7"
            stroke="#b9aaa0"
            dash={[5, 4]}
            {...commonShapeProps}
          />
          <Text
            text="Ảnh không tải được"
            width={pixel.width}
            height={pixel.height}
            align="center"
            verticalAlign="middle"
            fill="#6f6661"
            fontFamily="Segoe UI, Arial, sans-serif"
            fontSize={Math.max(8, pixel.height * 0.14)}
            {...commonShapeProps}
          />
        </>
      ) : null}
      {element.type === 'text' ? (
        <Text
          text={element.text ?? ''}
          width={pixel.width}
          height={pixel.height}
          fill={element.fill ?? '#7a263a'}
          stroke={element.stroke}
          strokeWidth={
            element.stroke
              ? Math.max(0.5, (element.strokeWidth ?? 0.002) * canvasSize.width)
              : 0
          }
          fontFamily={
            element.fontFamily ||
            'Segoe Print, Segoe UI, Helvetica Neue, Arial, sans-serif'
          }
          fontSize={Math.max(8, pixel.height * (element.fontSizeScale ?? 0.58))}
          fontStyle={element.fontStyle ?? 'bold'}
          letterSpacing={(element.letterSpacing ?? 0) * canvasSize.width}
          align="center"
          verticalAlign="middle"
          wrap="word"
          {...commonShapeProps}
        />
      ) : null}
      {element.type === 'shape' && element.shape === 'circle' ? (
        <Ellipse
          x={pixel.width / 2}
          y={pixel.height / 2}
          radiusX={pixel.width / 2}
          radiusY={pixel.height / 2}
          fill={element.fill ?? '#e9a8b8'}
          stroke={element.stroke}
          strokeWidth={
            element.stroke
              ? Math.max(0.5, (element.strokeWidth ?? 0.003) * canvasSize.width)
              : 0
          }
          {...commonShapeProps}
        />
      ) : null}
      {element.type === 'shape' && element.shape !== 'circle' ? (
        <Rect
          width={pixel.width}
          height={pixel.height}
          cornerRadius={
            element.kind === 'washi'
              ? Math.min(pixel.width, pixel.height) * 0.04
              : Math.min(pixel.width, pixel.height) * 0.18
          }
          fill={element.fill ?? '#e9a8b8'}
          stroke={element.stroke}
          strokeWidth={
            element.stroke
              ? Math.max(0.5, (element.strokeWidth ?? 0.003) * canvasSize.width)
              : 0
          }
          {...commonShapeProps}
        />
      ) : null}
    </Group>
  );
}
