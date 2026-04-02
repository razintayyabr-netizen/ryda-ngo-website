/* ============================================================
   RYDA — Main Site Script v2.0
   - Scroll reveal
   - Animated counters
   - Mobile menu
   - Active nav highlight
   - Newsroom tabs + rendering (API + static fallback)
   - Footer contact → Gmail draft
   ============================================================ */
"use strict";

const API_BASE = "/api";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const supportsIO = "IntersectionObserver" in window;

// ─── Static newsroom fallback data ───────────────────────
const STATIC_NEWS = [
  {
    id: "nr-1",
    title: "RYDA Releases Documentation Brief on Restrictions on Fundamental Freedoms",
    category: "Report",
    author: "RYDA Team",
    summary: "A new RYDA briefing highlights restrictions on expression, movement, and association affecting Rohingya communities across camps and crisis zones.",
    date: "2026-03-18T12:00:00Z",
  },
  {
    id: "nr-2",
    title: "Youth Leadership Training Expands Community Representation",
    category: "Leadership",
    author: "RYDA Team",
    summary: "Leadership workshops are helping Rohingya youths, girls, and women strengthen advocacy, organization, and public engagement skills.",
    date: "2026-03-10T12:00:00Z",
  },
  {
    id: "nr-3",
    title: "RYDA Submits Briefing to UN Special Rapporteur",
    category: "Advocacy",
    author: "RYDA Advocacy Unit",
    summary: "RYDA submitted a detailed briefing to the UN Special Rapporteur outlining documented violations and urging stronger international protection measures.",
    date: "2026-02-28T12:00:00Z",
  },
  {
    id: "nr-4",
    title: "Emergency Response: Food and Medical Aid in Cox's Bazar",
    category: "Emergency",
    author: "RYDA Relief Team",
    summary: "Following flooding, RYDA coordinated emergency food parcels, hygiene kits, and basic medical support for affected families.",
    date: "2026-02-14T12:00:00Z",
  },
  {
    id: "nr-5",
    title: "RYDA Issues Public Statement on Arbitrary Detention Reports",
    category: "Statement",
    author: "RYDA Team",
    summary: "RYDA is deeply concerned by verified reports of arbitrary detention and calls on authorities to uphold international human rights standards.",
    date: "2026-01-30T12:00:00Z",
  },
  {
    id: "nr-6",
    title: "New Research Report: Education Barriers Facing Rohingya Youth",
    category: "Report",
    author: "RYDA Research Unit",
    summary: "A new RYDA publication documents systemic barriers preventing Rohingya children from accessing quality education, with policy recommendations.",
    date: "2026-01-18T12:00:00Z",
  },
];

// ─── Helpers ─────────────────────────────────────────────
function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtDate(iso) {
  try {
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" })
      .format(new Date(iso));
  } catch {
    return iso;
  }
}

// ─── Scroll Reveal ───────────────────────────────────────
function setupReveal() {
  if (!supportsIO) {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-visible");
        observer.unobserve(e.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
  );
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}
setupReveal();

// ─── Header scroll ───────────────────────────────────────
const siteHeader = document.getElementById("site-header");
if (siteHeader) {
  const onScroll = () => siteHeader.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ─── Mobile menu ─────────────────────────────────────────
const menuToggle = document.querySelector(".menu-toggle");
if (menuToggle && siteHeader) {
  menuToggle.addEventListener("click", () => {
    const open = siteHeader.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") siteHeader.classList.remove("menu-open"); });
  document.addEventListener("click", e => {
    if (!siteHeader.contains(e.target)) siteHeader.classList.remove("menu-open");
  });
  document.querySelectorAll(".site-nav a").forEach(a => {
    a.addEventListener("click", () => { if (window.innerWidth <= 768) siteHeader.classList.remove("menu-open"); });
  });
}

// ─── Active nav ──────────────────────────────────────────
const navLinks = Array.from(document.querySelectorAll(".site-nav a[href^='#']"));
const sections = Array.from(document.querySelectorAll("section[id], footer[id]"));

if (supportsIO && sections.length) {
  const sectionObserver = new IntersectionObserver(
    entries => {
      const visible = entries.filter(e => e.isIntersecting).map(e => e.target.id);
      if (!visible.length) return;
      navLinks.forEach(a => a.classList.toggle("is-active", visible.includes(a.getAttribute("href")?.slice(1))));
    },
    { rootMargin: "-40% 0px -52% 0px", threshold: 0 }
  );
  sections.forEach(s => sectionObserver.observe(s));
}

// ─── Animated counters ───────────────────────────────────
function animCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  if (isNaN(target) || prefersReducedMotion) { el.textContent = target; return; }
  const dur = 1400;
  const start = performance.now();
  const tick = now => {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}

if (supportsIO) {
  const fired = new WeakSet();
  const counterObs = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (!e.isIntersecting || fired.has(e.target)) return;
        fired.add(e.target);
        const counter = e.target.querySelector(".js-count");
        if (counter) animCounter(counter);
        counterObs.unobserve(e.target);
      });
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll(".stat-item").forEach(el => counterObs.observe(el));
}

// ─── Newsroom ─────────────────────────────────────────────
const newsroomGrid = document.getElementById("newsroom-grid");
const newsroomTabs = document.getElementById("newsroom-tabs");
let allNews = [];
let activeFilter = "";

function buildNewsCard(item) {
  return `
  <article class="news-card reveal">
    <span class="news-badge">${esc(item.category)}</span>
    <h3>${esc(item.title)}</h3>
    <p>${esc(item.summary)}</p>
    <div class="news-meta">
      <span class="news-meta-author">${esc(item.author)}</span>
      <span class="news-meta-date">${esc(fmtDate(item.date))}</span>
    </div>
  </article>`;
}

function renderNews(filter) {
  if (!newsroomGrid) return;
  const list = filter ? allNews.filter(n => n.category === filter) : allNews;
  const sorted = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!sorted.length) {
    newsroomGrid.innerHTML = `<div class="newsroom-empty"><p>No updates in this category yet.</p></div>`;
    return;
  }

  newsroomGrid.innerHTML = sorted.map(buildNewsCard).join("");
  // Trigger reveal for new cards
  if (supportsIO) {
    const obs = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); } }); },
      { threshold: 0.08 }
    );
    newsroomGrid.querySelectorAll(".news-card").forEach(c => obs.observe(c));
  } else {
    newsroomGrid.querySelectorAll(".news-card").forEach(c => c.classList.add("is-visible"));
  }
}

async function loadNews() {
  // Try API first (published blog posts), then merge with static
  try {
    const res = await fetch(`${API_BASE}/posts`);
    if (res.ok) {
      const data = await res.json();
      const apiPosts = (data.posts || []).map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        author: p.author,
        summary: p.summary,
        date: p.date,
      }));
      allNews = [...apiPosts, ...STATIC_NEWS];
    } else {
      allNews = [...STATIC_NEWS];
    }
  } catch {
    allNews = [...STATIC_NEWS];
  }
  renderNews(activeFilter);
}

if (newsroomTabs) {
  newsroomTabs.addEventListener("click", e => {
    const tab = e.target.closest(".tab");
    if (!tab) return;
    Array.from(newsroomTabs.querySelectorAll(".tab")).forEach(t => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");
    activeFilter = tab.dataset.filter || "";
    renderNews(activeFilter);
  });
}

loadNews();

// ─── Footer contact → Gmail ───────────────────────────────
const contactForm = document.getElementById("contact-form");
const fcfNote = document.getElementById("fcf-note");

if (contactForm && fcfNote) {
  contactForm.addEventListener("submit", e => {
    e.preventDefault();
    const fd = new FormData(contactForm);
    const name    = fd.get("name")?.toString().trim();
    const email   = fd.get("email")?.toString().trim();
    const subject = fd.get("subject")?.toString().trim();
    const message = fd.get("message")?.toString().trim();

    if (!name || !email || !subject || !message) {
      fcfNote.textContent = "Please fill in all fields.";
      return;
    }

    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    const url = "https://mail.google.com/mail/?view=cm&fs=1" +
      `&to=${encodeURIComponent("ryda.rohingya@gmail.com")}` +
      `&su=${encodeURIComponent(`[RYDA] ${subject}`)}` +
      `&body=${encodeURIComponent(body)}`;

    window.open(url, "_blank", "noopener");
    fcfNote.textContent = "Gmail draft opened in a new tab.";
    contactForm.reset();
  });
}
