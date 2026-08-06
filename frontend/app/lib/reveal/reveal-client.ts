// Typed client for the public reveal flow (/api/reveal/*). No auth token
// from localStorage is used here — access is entirely governed by the
// capability token in the URL fragment and the short-lived session token it
// exchanges for (see backend/src/reveal/reveal.service.ts).

import type { LetterDesignSnapshot } from '@/app/types/letter-editor';

export interface RevealAttachment {
  id: string;
  clientId?: string;
  role: 'decoration' | 'inline' | 'attachment' | 'future_video';
  mimeType: string;
  byteSize: number;
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  zIndex: number;
  altText?: string;
  contentPath: string;
}

export interface RevealPresentation {
  title: string;
  recipientName: string;
  letterType: string;
  paper: string;
  font: 'serif' | 'modern' | 'hand';
  envelope: string;
  note?: string;
  content: string;
  designSnapshot?: LetterDesignSnapshot | null;
  attachments: RevealAttachment[];
}

export interface RevealContentResponse {
  letterId: string;
  rendererVersion: number;
  presentation: RevealPresentation;
}

export interface RevealExchangeResponse {
  letterId: string;
  sessionToken: string;
  expiresAt: string;
  rendererVersion: number;
}

export type ExchangeOutcome =
  | { ok: true; result: RevealExchangeResponse }
  | { ok: false; reason: 'not-ready' | 'invalid' };

export async function exchangeRevealToken(
  letterId: string,
  capabilityToken: string,
): Promise<ExchangeOutcome> {
  const response = await fetch('/api/reveal/exchange', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ letterId, capabilityToken }),
  });
  if (response.status === 403) return { ok: false, reason: 'not-ready' };
  if (!response.ok) return { ok: false, reason: 'invalid' };
  const result = (await response.json()) as RevealExchangeResponse;
  return { ok: true, result };
}

export async function fetchRevealContent(
  letterId: string,
  sessionToken: string,
): Promise<RevealContentResponse | null> {
  const response = await fetch('/api/reveal/content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({ letterId }),
  });
  if (!response.ok) return null;
  return (await response.json()) as RevealContentResponse;
}

export async function fetchRevealAttachmentBlob(
  contentPath: string,
  sessionToken: string,
): Promise<Blob | null> {
  const response = await fetch(contentPath, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  if (!response.ok) return null;
  return response.blob();
}
