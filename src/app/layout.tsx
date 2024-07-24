import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import clsx from 'clsx';
import 'katex/dist/katex.css'
import Footer from '@/components/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Notion Blog',
  description: 'Showroom powered by AI',
  icons: [
    {
      rel: 'alternate icon',
      type: 'image/png',
      url: '/logo.png',
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <div
          className={clsx(
            'flex flex-col h-screen w-full items-center text-base-content',
            'bg-gradient-to-r from-primary/10 via-40% via-blue-50 to-primary/20'
          )}
        >
          <div className="flex flex-1 w-full overflow-y-auto">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
