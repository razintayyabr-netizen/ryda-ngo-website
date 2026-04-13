import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Sitemap() {
  const baseUrl = 'https://ryda-rohingya.org';
  
  const links = [
    { url: baseUrl, label: 'Home' },
    { url: `${baseUrl}/newsroom`, label: 'Newsroom' },
    { url: `${baseUrl}/writer`, label: 'Writer Panel' },
  ];

  return (
    <>
      <Header />
      <main style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        background: '#FFFFFF'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center'
        }}>
          <span style={{
            display: 'inline-flex',
            padding: '6px 14px',
            borderRadius: '999px',
            border: '1px solid rgba(37, 99, 235, 0.2)',
            background: 'rgba(37, 99, 235, 0.06)',
            color: '#2563EB',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.72rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase'
          }}>Sitemap</span>
          <h1 style={{
            fontFamily: '"Outfit", sans-serif',
            fontSize: '2.4rem',
            fontWeight: 800,
            color: '#0F172A',
            marginTop: '16px',
            marginBottom: '40px'
          }}>Site Navigation</h1>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            textAlign: 'left'
          }}>
            {links.map(link => (
              <li key={link.url}>
                <a href={link.url} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  textDecoration: 'none',
                  fontFamily: '"Outfit", sans-serif',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)'
                }}>{link.label}
                  <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontFamily: '"JetBrains Mono", monospace' }}>{link.url}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}