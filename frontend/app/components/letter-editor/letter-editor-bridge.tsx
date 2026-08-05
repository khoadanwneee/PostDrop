'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getDefaultThemeForOrientation } from '@/app/data/letter-themes';
import {
  readLegacyDraft,
  readPersistedEditorDraft,
  writePersistedEditorDraft,
} from '@/app/hooks/use-local-storage-draft';
import { restoreEditorState } from '@/app/lib/letter-editor/persistence';
import type { LetterFont, PaperOrientation } from '@/app/types/letter-editor';
import {
  LetterEditor,
  type LetterEditorInitialDraft,
} from './letter-editor';
import { PaperOrientationSelector } from './paper-orientation-selector';

import { FutureVideoStep } from '../future-video/FutureVideoStep';
import type { UploadedVideo } from '@/app/types/future-video';

interface PortalHosts {
  editor: HTMLElement | null;
  orientation: HTMLElement | null;
  video: HTMLElement | null;
}

interface BridgeDraft {
  draft: LetterEditorInitialDraft;
  draftId?: string;
  mountRevision: number;
}

function getDraftId(legacyDraft: Record<string, unknown>) {
  const draftId = legacyDraft.draftId;
  return typeof draftId === 'string' && draftId.trim()
    ? draftId
    : undefined;
}

function getLetterFont(legacyDraft: Record<string, unknown>): LetterFont {
  const font = legacyDraft.font;
  return font === 'modern' || font === 'hand' || font === 'serif'
    ? font
    : 'serif';
}

function readInitialDraft() {
  const editorDraft = readPersistedEditorDraft();
  const legacyDraft = readLegacyDraft();
  return {
    draft: {
      ...restoreEditorState(editorDraft, legacyDraft),
      letterFont: getLetterFont(legacyDraft),
    } satisfies LetterEditorInitialDraft,
    draftId: getDraftId(legacyDraft),
  };
}

function withDraftId<T extends object>(draft: T, draftId?: string) {
  return draftId ? { ...draft, draftId } : draft;
}

export function LetterEditorBridge() {
  const hostsRef = useRef<PortalHosts>({
    editor: null,
    orientation: null,
    video: null,
  });
  const [hosts, setHosts] = useState<PortalHosts>({
    editor: null,
    orientation: null,
    video: null,
  });
  const [bridgeDraft, setBridgeDraft] = useState<BridgeDraft | null>(null);
  const [videoLetterId, setVideoLetterId] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    let disposed = false;

    const hydrate = (forceRemount = false) => {
      const restored = readInitialDraft();
      setBridgeDraft((current) => ({
        ...restored,
        mountRevision:
          (current?.mountRevision ?? 0) + (forceRemount ? 1 : 0),
      }));
    };

    const findHosts = () => {
      const nextHosts: PortalHosts = {
        editor: document.querySelector<HTMLElement>('#letter-editor-root'),
        orientation: document.querySelector<HTMLElement>(
          '#paper-orientation-root',
        ),
        video: document.querySelector<HTMLElement>('#future-video-root'),
      };
      const currentHosts = hostsRef.current;
      if (
        currentHosts.editor === nextHosts.editor &&
        currentHosts.orientation === nextHosts.orientation &&
        currentHosts.video === nextHosts.video
      ) {
        return;
      }

      hostsRef.current = nextHosts;
      setHosts(nextHosts);
      if (nextHosts.editor || nextHosts.orientation || nextHosts.video) hydrate();
      if (nextHosts.video) {
        setVideoLetterId(nextHosts.video.dataset.letterId || undefined);
      }
    };

    const handleDraftReset = () => {
      queueMicrotask(() => {
        if (!disposed) hydrate(true);
      });
    };

    // app.js resolves the real backend letterId asynchronously (see
    // ensureDraftLetter/ensureVideoStepLetterId) and announces it once ready,
    // since it lands after the host element already mounted.
    const handleLetterIdReady = (event: Event) => {
      const detail = (event as CustomEvent<{ letterId?: string }>).detail;
      if (detail?.letterId) setVideoLetterId(detail.letterId);
    };

    findHosts();
    const observer = new MutationObserver(findHosts);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('postdrop-draft-reset', handleDraftReset);
    window.addEventListener('postdrop-letter-id-ready', handleLetterIdReady);

    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener('postdrop-draft-reset', handleDraftReset);
      window.removeEventListener(
        'postdrop-letter-id-ready',
        handleLetterIdReady,
      );
    };
  }, []);

  const handleChange = useCallback(
    (draft: LetterEditorInitialDraft) => {
      window.dispatchEvent(
        new CustomEvent('postdrop-editor-change', {
          detail: withDraftId(draft, bridgeDraft?.draftId),
        }),
      );
    },
    [bridgeDraft?.draftId],
  );

  const handleOrientationSelect = useCallback(
    (paperOrientation: PaperOrientation) => {
      const latest = readInitialDraft();
      const selectedThemeId =
        latest.draft.paperOrientation === paperOrientation &&
        latest.draft.selectedThemeId
          ? latest.draft.selectedThemeId
          : getDefaultThemeForOrientation(paperOrientation).id;
      const nextDraft: LetterEditorInitialDraft = {
        ...latest.draft,
        paperOrientation,
        selectedThemeId,
      };

      let updatedAt = new Date().toISOString();
      try {
        updatedAt = writePersistedEditorDraft({
          paperOrientation,
          selectedThemeId,
          letterContent: nextDraft.letterContent,
          letterTitle: nextDraft.letterTitle,
          elements: nextDraft.userElements,
        }).updatedAt;
      } catch {
        window.dispatchEvent(
          new CustomEvent('postdrop-editor-toast', {
            detail: {
              message:
                'B\u1ea3n nh\u00e1p ch\u01b0a th\u1ec3 l\u01b0u v\u00ec b\u1ed9 nh\u1edb tr\u00ecnh duy\u1ec7t \u0111\u00e3 \u0111\u1ea7y.',
              type: 'error',
            },
          }),
        );
      }

      setBridgeDraft((current) => ({
        draft: nextDraft,
        draftId: latest.draftId,
        mountRevision: current?.mountRevision ?? 0,
      }));
      window.dispatchEvent(
        new CustomEvent('postdrop-paper-orientation-selected', {
          detail: withDraftId(
            {
              ...nextDraft,
              updatedAt,
            },
            latest.draftId,
          ),
        }),
      );
    },
    [],
  );

  const handleVideoConfirmed = useCallback((uploadedVideo: UploadedVideo) => {
    window.dispatchEvent(
      new CustomEvent('postdrop-video-confirmed', {
        detail: uploadedVideo,
      }),
    );
  }, []);

  const handleSkipVideo = useCallback(() => {
    window.dispatchEvent(new CustomEvent('postdrop-video-skipped'));
  }, []);

  const handleBackVideo = useCallback(() => {
    window.dispatchEvent(new CustomEvent('postdrop-video-back'));
  }, []);

  if (!bridgeDraft) return null;

  const orientationPortal = hosts.orientation
    ? createPortal(
        <>
          <link rel={'stylesheet'} href={'/letter-editor.css'} />
          <PaperOrientationSelector
            key={`paper-orientation-${bridgeDraft.draftId ?? 'anonymous'}-${bridgeDraft.mountRevision}`}
            currentOrientation={bridgeDraft.draft.paperOrientation}
            onSelect={handleOrientationSelect}
          />
        </>,
        hosts.orientation,
      )
    : null;
  const editorPortal = hosts.editor
    ? createPortal(
        <>
          <link rel={'stylesheet'} href={'/letter-editor.css'} />
          <LetterEditor
            key={`${hosts.editor.dataset.editorInstance ?? 'letter-editor'}-${bridgeDraft.draftId ?? 'anonymous'}-${bridgeDraft.mountRevision}`}
            initialDraft={bridgeDraft.draft}
            onChange={handleChange}
          />
        </>,
        hosts.editor,
      )
    : null;
  const videoPortal = hosts.video
    ? createPortal(
        <>
          <link rel={'stylesheet'} href={'/letter-editor.css'} />
          <FutureVideoStep
            key={`future-video-${bridgeDraft.draftId ?? 'anonymous'}-${bridgeDraft.mountRevision}`}
            letterId={videoLetterId}
            onVideoConfirmed={handleVideoConfirmed}
            onSkipStep={handleSkipVideo}
            onBackStep={handleBackVideo}
          />
        </>,
        hosts.video,
      )
    : null;

  return (
    <>
      {orientationPortal}
      {editorPortal}
      {videoPortal}
    </>
  );
}

