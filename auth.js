// api/auth.js — Verify writer token
export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { token } = req.body || {};
  const valid = process.env.WRITER_TOKEN;

  if (!valid) {
    return res.status(500).json({ error: "WRITER_TOKEN env var not set." });
  }

  if (token === valid) {
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ ok: false, error: "Invalid token." });
}
