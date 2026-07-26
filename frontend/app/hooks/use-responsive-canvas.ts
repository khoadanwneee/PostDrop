'use client';

import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { PAPER_CONFIGS } from '@/app/config/paper-configs';
import { calculateFitScale } from '@/app/lib/letter-editor/zoom';
import type {
  CanvasSize,
  PaperOrientation,
} from '@/app/types/letter-editor';

export function getPaperCanvasSize(
  orientation: PaperOrientation,
  logicalWidth = 720,
): CanvasSize {
  const paper = PAPER_CONFIGS[orientation];
  return {
    width: logicalWidth,
    height: logicalWidth / paper.aspectRatio,
  };
}

export function useResponsiveCanvas(
  orientation: PaperOrientation,
  maxWidth = 720,
  zoom = 1,
) {
  const canvasSize = useMemo<CanvasSize>(
    () => getPaperCanvasSize(orientation, maxWidth),
    [maxWidth, orientation],
  );
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  const viewportRef = useCallback((node: HTMLDivElement | null) => {
    setViewport(node);
  }, []);
  const [viewportSize, setViewportSize] = useState<CanvasSize>(canvasSize);

  useLayoutEffect(() => {
    if (!viewport) return;

    let animationFrame = 0;
    let viewportTimer = 0;
    const commitSize = (size: CanvasSize) => {
      const width = Math.max(1, size.width);
      const height = Math.max(1, size.height);
      setViewportSize((current) =>
        Math.abs(current.width - width) < 0.5 &&
        Math.abs(current.height - height) < 0.5
          ? current
          : { width, height },
      );
    };
    const measure = () => {
      const rect = viewport.getBoundingClientRect();
      const styles = window.getComputedStyle(viewport);
      commitSize({
        width:
          rect.width -
          Number.parseFloat(styles.paddingLeft || '0') -
          Number.parseFloat(styles.paddingRight || '0'),
        height:
          rect.height -
          Number.parseFloat(styles.paddingTop || '0') -
          Number.parseFloat(styles.paddingBottom || '0'),
      });
    };
    const scheduleStableMeasurement = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        measure();
        animationFrame = requestAnimationFrame(measure);
      });
    };
    const handleViewportResize = () => {
      measure();
      scheduleStableMeasurement();
      window.clearTimeout(viewportTimer);
      viewportTimer = window.setTimeout(measure, 200);
    };

    measure();
    scheduleStableMeasurement();
    const settleTimer = window.setTimeout(measure, 0);
    const observer = new ResizeObserver(([entry]) => {
      commitSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(viewport);
    window.addEventListener('resize', handleViewportResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.clearTimeout(viewportTimer);
      window.clearTimeout(settleTimer);
      observer.disconnect();
      window.removeEventListener('resize', handleViewportResize);
    };
  }, [viewport]);

  const fitScale = calculateFitScale(viewportSize, canvasSize);
  const scale = fitScale * zoom;
  const displaySize = {
    width: canvasSize.width * scale,
    height: canvasSize.height * scale,
  };

  return {
    viewportRef,
    viewportElement: viewport,
    canvasSize,
    displaySize,
    fitScale,
    scale,
  };
}
