import { LetterAvailableEmail } from './email-provider';

export interface RenderedLetterAvailableEmail {
  subject: string;
  text: string;
  html: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function renderLetterAvailableEmail(
  message: LetterAvailableEmail,
): RenderedLetterAvailableEmail {
  const recipientName = message.recipientName.trim() || 'there';
  const letterTitle = message.letterTitle.trim() || 'Your letter';

  return {
    subject: `${letterTitle} has arrived`,
    text: [
      `Hello ${recipientName},`,
      '',
      `“${letterTitle}” is now available in PostDrop.`,
      '',
      'This notification does not contain the private contents of the letter.',
    ].join('\n'),
    html: [
      '<div style="font-family:Georgia,serif;color:#312a25;line-height:1.6">',
      `<p>Hello ${escapeHtml(recipientName)},</p>`,
      `<p><strong>${escapeHtml(letterTitle)}</strong> is now available in PostDrop.</p>`,
      '<p style="color:#6f6259;font-size:14px">This notification does not contain the private contents of the letter.</p>',
      '</div>',
    ].join(''),
  };
}
