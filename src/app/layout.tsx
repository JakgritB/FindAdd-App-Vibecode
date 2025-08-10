import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';  // ← ต้องมีบรรทัดนี้

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FindAdd V1.0 - ระบบจัดเส้นทางส่งพัสดุ',
  description: 'ระบบช่วยจัดเส้นทางการส่งพัสดุอย่างมีประสิทธิภาพ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={inter.className}>{children}</body>
    </html>
  );
}