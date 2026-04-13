import './globals.css';
import CursorTracker from '@/components/CursorTracker';

export const metadata = {
  metadataBase: new URL('https://ryda-rohingya.org'),
  title: {
    default: 'RYDA — Rohingya Youth Development Association',
    template: '%s — RYDA',
  },
  description: 'Rohingya Youth Development Association (RYDA) — Human rights advocacy, documentation, research, leadership, education, and humanitarian response for Rohingya communities.',
  keywords: ['RYDA', 'Rohingya', 'human rights', 'refugee advocacy', 'youth development', 'Cox\'s Bazar', 'documentation', 'humanitarian', 'NGO'],
  authors: [{ name: 'Rohingya Youth Development Association', url: 'https://ryda-rohingya.org' }],
  creator: 'Rohingya Youth Development Association',
  publisher: 'Rohingya Youth Development Association',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ryda-rohingya.org',
    siteName: 'RYDA',
    title: 'RYDA — Rohingya Youth Development Association',
    description: 'Documenting violations, amplifying voices, building leaders, delivering relief.',
    images: [
      {
        url: '/assets/ryda-logo.svg',
        width: 512,
        height: 512,
        alt: 'RYDA Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RYDA — Rohingya Youth Development Association',
    description: 'Documenting violations, amplifying voices, building leaders, delivering relief.',
    images: ['/assets/ryda-logo.svg'],
    creator: '@RYDA35',
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
  alternates: {
    canonical: 'https://ryda-rohingya.org',
  },
};

export const viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/assets/ryda-logo.svg" />
        <link rel="apple-touch-icon" href="/assets/ryda-logo.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('ryda-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NGO",
            "name": "Rohingya Youth Development Association",
            "alternateName": "RYDA",
            "url": "https://ryda-rohingya.org",
            "email": "ryda.rohingya@gmail.com",
            "telephone": "+880 1843-959525",
            "sameAs": [
              "https://x.com/RYDA35",
              "https://www.instagram.com/ryda.467/",
              "https://www.facebook.com/share/1B9sauUHNF/"
            ]
          })
        }} />
      </head>
      <body>
        <CursorTracker />
        {children}
      </body>
    </html>
  );
}