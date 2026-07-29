import { LetterAvailableEmail } from './email-provider';
import * as QRCode from 'qrcode';

export interface RenderedLetterAvailableEmail {
  subject: string;
  text: string;
  html: string;
  qrCode: Buffer;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function renderLetterAvailableEmail(
  message: LetterAvailableEmail,
): Promise<RenderedLetterAvailableEmail> {
  const recipientName = message.recipientName.trim() || 'there';
  const letterTitle = message.letterTitle.trim() || 'Your letter';
  const revealUrl = new URL(message.revealUrl).toString();
  const qrCode = await QRCode.toBuffer(revealUrl, {
    type: 'png',
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 240,
  });

  return {
    subject: `${letterTitle} has arrived`,
    text: [
      `Hello ${recipientName},`,
      '',
      `“${letterTitle}” is now available in PostDrop.`,
      '',
      `Open it securely: ${revealUrl}`,
      '',
      'This notification does not contain the private contents of the letter.',
    ].join('\n'),
    html: [
      '<div style="font-family:Georgia,serif;color:#312a25;line-height:1.6">',
      `<p>Hello ${escapeHtml(recipientName)},</p>`,
      `<p><strong>${escapeHtml(letterTitle)}</strong> is now available in PostDrop.</p>`,
      `<p><a href="${escapeHtml(revealUrl)}" style="display:inline-block;padding:12px 20px;background:#7f1d1d;color:#fff;text-decoration:none;border-radius:6px">Reveal your letter</a></p>`,
      '<p><img src="cid:postdrop-reveal-qr" width="240" height="240" alt="QR code to reveal your letter" /></p>',
      '<p style="color:#6f6259;font-size:14px">The secure link can be exchanged for a short-lived reveal session after the scheduled arrival time.</p>',
      '<p style="color:#6f6259;font-size:14px">This notification does not contain the private contents of the letter.</p>',
      '</div>',
    ].join(''),
    qrCode,
  };
}
