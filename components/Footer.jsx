import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="is-footer-grid">
          <div className="is-footer-brand">
            <h3>RYDA</h3>
            <p>Rohingya Youth Development Association — Documenting violations, building leaders, delivering aid since establishment in Cox's Bazar, Bangladesh.</p>
          </div>
          <div className="is-footer-col">
            <h4>Organization</h4>
            <ul>
              <li><Link href="/#about">About Us</Link></li>
              <li><Link href="/#programs">Programs</Link></li>
              <li><Link href="/#values">Our Values</Link></li>
              <li><Link href="/newsroom">Newsroom</Link></li>
            </ul>
          </div>
          <div className="is-footer-col">
            <h4>Get Involved</h4>
            <ul>
              <li><Link href="https://donate.stripe.com" target="_blank" rel="noreferrer">Donate</Link></li>
              <li><Link href="/#contact">Partner With Us</Link></li>
              <li><Link href="/#contact">Volunteer</Link></li>
              <li><Link href="/#contact">Media Inquiries</Link></li>
              <li><Link href="/writer" target="_blank">Writer</Link></li>
            </ul>
          </div>
          <div className="is-footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:ryda.rohingya@gmail.com">ryda.rohingya@gmail.com</a></li>
              <li><span>Cox's Bazar, Bangladesh</span></li>
            </ul>
          </div>
        </div>
        <div className="is-footer-bottom">
          <span>© {new Date().getFullYear()} RYDA. All rights reserved.</span>
          <div className="is-footer-social">
            <a href="https://x.com/RYDA35" target="_blank" rel="noreferrer" aria-label="X (Twitter)">𝕏</a>
            <a href="https://www.instagram.com/ryda.467/" target="_blank" rel="noreferrer" aria-label="Instagram">📷</a>
            <a href="https://www.facebook.com/share/1B9sauUHNF/" target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
          </div>
        </div>
      </div>
    </footer>
  );
}