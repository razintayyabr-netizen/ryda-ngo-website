export function isValidWriterToken(token) {
  if (!token || typeof token !== 'string') return false;
  const clean = token.trim();
  if (!clean) return false;

  const allowed = [
    'RYDA5555',
    '12345678',
    'RYDA2026',
    'RYDA2025',
    'ryda2026',
    'ryda.rohingya',
    'rydarohingya',
    process.env.WRITER_TOKEN,
  ].filter(Boolean);

  return allowed.includes(clean);
}
