import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'YouShop - Votre boutique en ligne',
    template: '%s | YouShop',
  },
  description:
    'YouShop est votre destination shopping en ligne pour des produits de qualité à prix compétitifs.',
  keywords: ['e-commerce', 'boutique en ligne', 'shopping', 'produits', 'YouShop'],
  authors: [{ name: 'YouShop' }],
  creator: 'YouShop',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://youshop.com',
    siteName: 'YouShop',
    title: 'YouShop - Votre boutique en ligne',
    description:
      'YouShop est votre destination shopping en ligne pour des produits de qualité à prix compétitifs.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouShop - Votre boutique en ligne',
    description:
      'YouShop est votre destination shopping en ligne pour des produits de qualité à prix compétitifs.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
