import './globals.css';

export const metadata = {
  metadataBase: new URL('https://ryda-rohingya.org'), // Assuming domain
  title: 'RYDA — Rohingya Youth Development Association',
  description: 'Rohingya Youth Development Association (RYDA) — Human rights advocacy, documentation, research, leadership, and humanitarian response for Rohingya communities.',
  themeColor: '#0B4D41',
  openGraph: {
    type: 'website',
    title: 'RYDA — Rohingya Youth Development Association',
    description: 'Documenting violations, amplifying voices, building leaders, delivering relief.',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" type="image/svg+xml" href="/assets/ryda-logo.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NGO",
            "name": "Rohingya Youth Development Association",
            "alternateName": "RYDA",
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
        {children}
      </body>
    </html>
  );
}
