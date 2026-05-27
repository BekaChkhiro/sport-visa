import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Georgian } from 'next/font/google';

import { MarketingChrome } from '@/components/marketing-chrome';
import { ThemeProvider } from '@/components/theme-provider';

import './globals.css';

const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ['georgian', 'latin'],
  display: 'swap',
  variable: '--font-noto-sans-georgian',
  weight: ['400', '500', '600', '700'],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Sport Visa',
    template: '%s · Sport Visa',
  },
  description:
    'Sport Visa — პლატფორმა, სადაც ფეხბურთელები კლუბებს პოულობენ და კლუბები — ფეხბურთელებს.',
  keywords: ['ფეხბურთი', 'სპორტი', 'კლუბი', 'ფეხბურთელი', 'sport visa', 'football', 'georgia'],
  authors: [{ name: 'Sport Visa' }],
  creator: 'Sport Visa',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'ka_GE',
    url: siteUrl,
    siteName: 'Sport Visa',
    title: 'Sport Visa — ფეხბურთელები კლუბებს ენახებიან',
    description:
      'Sport Visa — პლატფორმა, სადაც ფეხბურთელები კლუბებს პოულობენ და კლუბები — ფეხბურთელებს.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Sport Visa',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sport Visa — ფეხბურთელები კლუბებს ენახებიან',
    description:
      'Sport Visa — პლატფორმა, სადაც ფეხბურთელები კლუბებს პოულობენ და კლუბები — ფეხბურთელებს.',
    images: ['/og.png'],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" suppressHydrationWarning className={notoSansGeorgian.variable}>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MarketingChrome>{children}</MarketingChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
