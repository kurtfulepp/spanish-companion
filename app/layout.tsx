import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { getSupabaseConfig } from '@/lib/supabase/config';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'KurtES — Your Spanish companion',
  description: 'Build everyday Spanish confidence with short, focused practice.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = getSupabaseConfig();

  return (
    <html
      lang="en"
      data-supabase-url={supabase.url || undefined}
      data-supabase-publishable-key={supabase.publishableKey || undefined}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
