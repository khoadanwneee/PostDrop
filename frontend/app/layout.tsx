import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'PostDrop — Thư gửi đến tương lai',
  description:
    'PostDrop — viết hôm nay, nhận lại một lá thư vào đúng ngày trong tương lai.',
  icons: { icon: '/logo.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fbf7f0',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi">
      <head />
      <body>
        {children}
      </body>
    </html>
  );
}
