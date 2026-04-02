# RYDA NGO Website v2.0

**Rohingya Youth Development Association** — World-class NGO website with a full writer panel and Vercel backend.

---

## 🌐 Live Features

- Editorial-grade responsive website
- Newsroom with category filtering — pulls from both API and static fallback data
- **Writer Panel** (`/writer.html`) — Protected publishing dashboard for RYDA team members
- Persistent blog/news backend via **Vercel KV** (Redis)
- Gmail contact form integration
- Scroll-reveal animations, animated counters, mobile-first responsive design

---

## 🚀 Deploying to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial RYDA v2 release"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ryda-ngo-website.git
git push -u origin main
```

### Step 2 — Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework Preset: **Other** (it's plain HTML + serverless functions)
4. Click **Deploy**

### Step 3 — Create Vercel KV Store

1. In your Vercel project dashboard → **Storage** tab
2. Click **Create Database** → choose **KV (Redis)**
3. Name it `ryda-posts` (or anything you like)
4. Click **Connect** to link it to your project
5. Vercel will **automatically set** `KV_REST_API_URL` and `KV_REST_API_TOKEN` as environment variables

### Step 4 — Set Writer Token

1. In your Vercel project → **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name:** `WRITER_TOKEN`
   - **Value:** A strong secret (e.g., run `openssl rand -hex 24` to generate one)
3. Click **Save** and **Redeploy**

### Step 5 — Access the Writer Panel

Visit `https://your-site.vercel.app/writer.html` and enter the `WRITER_TOKEN` you set.

---

## ✍️ Writer Panel Guide

The writer panel at `/writer.html` allows authorized RYDA team members to:

| Feature | Description |
|---|---|
| **Rich text editor** | Bold, italic, headings, lists, blockquotes |
| **Post categories** | Statement, Report, Emergency, Advocacy, Leadership, Research, Documentation |
| **Live preview** | See exactly how the post will look before publishing |
| **Post management** | View, search, and delete all published posts |
| **Draft autosave** | Drafts auto-save to browser localStorage |
| **Editorial guidelines** | Built-in writing standards and safety guidance |

**Authentication:** Token-based. Writers enter the `WRITER_TOKEN` — it's verified against the Vercel env variable. Token is stored in `sessionStorage` (cleared on tab close).

---

## 📁 Project Structure

```
ryda-ngo-website/
├── api/
│   ├── posts.js          ← CRUD API for blog posts (Vercel KV)
│   └── auth.js           ← Token verification endpoint
├── assets/
│   └── ryda-logo.svg
├── index.html            ← Main website
├── styles.css            ← Main website styles
├── script.js             ← Main website JavaScript
├── writer.html           ← Writer/publisher panel
├── writer.css            ← Writer panel styles
├── writer.js             ← Writer panel JavaScript
├── package.json          ← Vercel KV dependency
├── vercel.json           ← Vercel routing & headers config
├── .env.example          ← Environment variables template
└── README.md
```

---

## 🔒 Security Notes

- The `WRITER_TOKEN` is **never exposed** in frontend code — it's only validated server-side in `/api/auth.js`
- All write/delete operations to the API require the token in the `X-Writer-Token` header
- GET (reading posts) is public — no auth needed
- Never commit a `.env` file to GitHub (it's in `.gitignore`)

---

## 🛠 Local Development

```bash
npm install -g vercel
vercel dev
```

This runs the serverless functions locally. You'll need to add a `.env` file with your actual KV credentials and writer token.

---

## 📞 Contact

- Email: ryda.rohingya@gmail.com
- Phone: +880 1843-959525
- Twitter/X: [@RYDA35](https://x.com/RYDA35)
- Instagram: [@ryda.467](https://www.instagram.com/ryda.467/)
- Facebook: [RYDA Community](https://www.facebook.com/share/1B9sauUHNF/)
