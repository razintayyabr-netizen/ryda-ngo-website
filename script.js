/* ============================================================
   RYDA — Enhanced Site Script
   Handles: scroll-reveal, nav active state, mobile menu,
   hero parallax, card tilt, blog/bulletin CRUD,
   newsroom feed with category tabs, animated counters,
   header scroll class, contact form → Gmail draft.
   ============================================================ */

"use strict";

// ─── Media-query flags ────────────────────────────────────
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const prefersReducedData   = window.matchMedia("(prefers-reduced-data: reduce)").matches;
const hasFinePointer       = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const supportsIO           = "IntersectionObserver" in window;
const shouldAnimate        = !prefersReducedMotion && !prefersReducedData;
const canTiltCards         = hasFinePointer && shouldAnimate;

// ─── Scroll-reveal ────────────────────────────────────────
const REVEAL_SELECTOR =
  ".hero-copy, .hero-panel, .card, .program-card, .value-card, .cta-card," +
  " .story-band, .impact-item, .journey-card, .contact-card, .newsroom-item";

const revealItems = Array.from(document.querySelectorAll(REVEAL_SELECTOR));
let revealObserver = null;

function revealImmediately(items) {
  items.forEach((el) => el.classList.add("is-visible"));
}

function observeRevealItems(items, withStagger = true) {
  if (!items.length) return;
  if (!revealObserver) { revealImmediately(items); return; }
  items.forEach((el, i) => {
    if (withStagger) el.style.transitionDelay = `${Math.min(i * 45, 260)}ms`;
    revealObserver.observe(el);
  });
}

if (shouldAnimate && supportsIO) {
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -28px 0px" }
  );
}

observeRevealItems(revealItems);

// ─── Header scroll class ─────────────────────────────────
const siteHeader = document.querySelector(".site-header");

if (siteHeader) {
  const onScroll = () => {
    siteHeader.classList.toggle("scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ─── Mobile menu ─────────────────────────────────────────
const menuToggle = document.querySelector(".menu-toggle");
const siteNav    = document.getElementById("site-nav");
const navLinks   = Array.from(document.querySelectorAll(".site-nav a"));

function setMenuState(isOpen) {
  if (!siteHeader || !menuToggle || !siteNav) return;
  siteHeader.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
}

if (menuToggle && siteHeader) {
  menuToggle.addEventListener("click", () => {
    setMenuState(!siteHeader.classList.contains("menu-open"));
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenuState(false); });
  document.addEventListener("click", (e) => {
    if (!siteHeader.classList.contains("menu-open")) return;
    if (e.target instanceof Node && !siteHeader.contains(e.target)) setMenuState(false);
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => { if (window.innerWidth <= 760) setMenuState(false); });
});
window.addEventListener("resize", () => { if (window.innerWidth > 760) setMenuState(false); });

// ─── Active nav by section ────────────────────────────────
const sections = Array.from(document.querySelectorAll("main section[id], footer[id]"));

function highlightNav(id) {
  navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`));
}

if (supportsIO && sections.length) {
  let activeId = "";
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) activeId = entry.target.id; });
      if (activeId) highlightNav(activeId);
    },
    { rootMargin: "-40% 0px -52% 0px", threshold: 0 }
  );
  sections.forEach((s) => sectionObserver.observe(s));
} else {
  const fallbackNav = () => {
    let cur = "";
    sections.forEach((s) => {
      const r = s.getBoundingClientRect();
      if (r.top <= 130 && r.bottom >= 130) cur = s.id;
    });
    highlightNav(cur);
  };
  fallbackNav();
  window.addEventListener("scroll", fallbackNav, { passive: true });
}

// ─── Hero orb parallax ───────────────────────────────────
const heroOrbs = Array.from(document.querySelectorAll(".hero-orb"));

if (heroOrbs.length && shouldAnimate) {
  let rafId = 0;
  const updateParallax = () => {
    rafId = 0;
    if (window.innerWidth < 760) { heroOrbs.forEach((o) => (o.style.transform = "")); return; }
    const offset = Math.min(window.scrollY * 0.09, 22);
    heroOrbs.forEach((o, i) => {
      const dir = i === 0 ? -1 : 1;
      o.style.transform = `translate3d(${dir * offset}px, ${offset * -0.55}px, 0)`;
    });
  };
  const scheduleParallax = () => { if (!rafId) rafId = requestAnimationFrame(updateParallax); };
  scheduleParallax();
  window.addEventListener("scroll", scheduleParallax, { passive: true });
  window.addEventListener("resize", scheduleParallax);
}

// ─── Card tilt ────────────────────────────────────────────
const TILT_SELECTOR = ".impact-item, .program-card, .journey-card, .evidence-card, .contact-card, .stat-tile";
const tiltBound = new WeakSet();

function attachTilt(card) {
  if (!canTiltCards || tiltBound.has(card)) return;
  tiltBound.add(card);
  card.classList.add("tilt-ready");
  let frame = 0, nx = 0, ny = 0;
  const paint = () => {
    frame = 0;
    card.style.transform = `perspective(860px) rotateX(${ny * -4}deg) rotateY(${nx * 5}deg) translateY(-5px)`;
  };
  card.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    const r = card.getBoundingClientRect();
    nx = (e.clientX - r.left - r.width  / 2) / r.width;
    ny = (e.clientY - r.top  - r.height / 2) / r.height;
    if (!frame) frame = requestAnimationFrame(paint);
  });
  card.addEventListener("pointerenter", () => { card.style.willChange = "transform"; });
  card.addEventListener("pointerleave", () => {
    if (frame) { cancelAnimationFrame(frame); frame = 0; }
    card.style.transform = "";
    card.style.willChange = "";
  });
}

if (canTiltCards) {
  document.querySelectorAll(TILT_SELECTOR).forEach((c) => attachTilt(c));
}

// ─── Animated counters ────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  if (isNaN(target) || !shouldAnimate) { el.textContent = target; return; }
  const duration = 1200;
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

const statTiles = Array.from(document.querySelectorAll(".stat-tile"));

if (statTiles.length) {
  const counterFired = new WeakSet();
  const counterObserver = supportsIO
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || counterFired.has(entry.target)) return;
            counterFired.add(entry.target);
            const counter = entry.target.querySelector(".js-counter");
            if (counter) animateCounter(counter);
            entry.target.classList.add("is-visible");
            counterObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.4 }
      )
    : null;

  statTiles.forEach((tile) => {
    if (counterObserver) {
      counterObserver.observe(tile);
    } else {
      tile.classList.add("is-visible");
      const counter = tile.querySelector(".js-counter");
      if (counter) animateCounter(counter);
    }
  });
}

// ─── Newsroom data & rendering ────────────────────────────
const newsroomData = [
  {
    id: "nr-1",
    title: "RYDA Releases New Documentation Brief on Restrictions on Fundamental Freedoms",
    category: "Report",
    author: "RYDA Team",
    summary:
      "A new RYDA briefing highlights restrictions on expression, movement, and association affecting Rohingya communities across camps and crisis zones.",
    date: "2026-03-18",
  },
  {
    id: "nr-2",
    title: "Youth Leadership Training Expands Community Representation",
    category: "Leadership",
    author: "RYDA Team",
    summary:
      "Leadership workshops are helping Rohingya youths, girls, and women strengthen advocacy, organization, and public engagement skills.",
    date: "2026-03-10",
  },
  {
    id: "nr-3",
    title: "RYDA Submits Briefing to UN Special Rapporteur on Human Rights Situation",
    category: "Advocacy",
    author: "RYDA Advocacy Unit",
    summary:
      "RYDA has submitted a detailed briefing to the UN Special Rapporteur outlining documented violations and urging stronger international protection measures.",
    date: "2026-02-28",
  },
  {
    id: "nr-4",
    title: "Emergency Response: Food and Medical Aid Distributed in Cox's Bazar",
    category: "Emergency",
    author: "RYDA Relief Team",
    summary:
      "Following flooding that displaced hundreds of families, RYDA coordinated emergency food parcels, hygiene kits, and basic medical support in affected areas.",
    date: "2026-02-14",
  },
  {
    id: "nr-5",
    title: "RYDA Issues Public Statement on Arbitrary Detention Reports",
    category: "Statement",
    author: "RYDA Team",
    summary:
      "RYDA is deeply concerned by verified reports of arbitrary detention and calls on relevant authorities to uphold international human rights standards.",
    date: "2026-01-30",
  },
  {
    id: "nr-6",
    title: "New Research Report: Education Barriers Facing Rohingya Youth",
    category: "Report",
    author: "RYDA Research Unit",
    summary:
      "A new RYDA research publication documents the systemic barriers preventing Rohingya children and youth from accessing quality education, alongside policy recommendations.",
    date: "2026-01-18",
  },
];

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(dateStr) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(`${dateStr}T12:00:00`));
}

function buildNewsroomItem(item) {
  return `
    <article class="newsroom-item" data-category="${escapeHtml(item.category)}">
      <span class="newsroom-badge">${escapeHtml(item.category)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary)}</p>
      <div class="newsroom-meta">
        <span class="newsroom-author">${escapeHtml(item.author)}</span>
        <span>${escapeHtml(formatDate(item.date))}</span>
      </div>
    </article>
  `;
}

function renderNewsroom(filter = "") {
  const grid = document.getElementById("newsroom-grid");
  if (!grid) return;

  const filtered = filter
    ? newsroomData.filter((item) => item.category === filter)
    : newsroomData;

  if (!filtered.length) {
    grid.innerHTML = `<div class="newsroom-empty"><p>No updates found for this category.</p></div>`;
    return;
  }

  grid.innerHTML = filtered
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(buildNewsroomItem)
    .join("");

  const newItems = Array.from(grid.querySelectorAll(".newsroom-item"));
  observeRevealItems(newItems, true);
  if (canTiltCards) newItems.forEach((c) => attachTilt(c));
}

// Tabs
const newsroomTabsEl = document.getElementById("newsroom-tabs");

if (newsroomTabsEl) {
  newsroomTabsEl.addEventListener("click", (e) => {
    const tab = e.target.closest(".newsroom-tab");
    if (!tab) return;

    Array.from(newsroomTabsEl.querySelectorAll(".newsroom-tab")).forEach((t) => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");
    renderNewsroom(tab.dataset.filter || "");
  });
}

// Initial render
renderNewsroom();

// ─── Blog / Bulletin ─────────────────────────────────────
const BLOG_KEY = "ryda-blog-posts";

const defaultPosts = [
  {
    id: "post-1",
    title: "RYDA Releases New Documentation Brief on Restrictions on Fundamental Freedoms",
    category: "Documentation",
    author: "RYDA Team",
    summary:
      "A new RYDA briefing highlights restrictions on expression, movement, and association affecting Rohingya communities.",
    content:
      "RYDA continues to document and verify violations affecting Rohingya communities, including restrictions on fundamental freedoms and barriers to protection.\n\nThrough public reporting and evidence preservation, the organization works to strengthen accountability efforts and inform advocacy with credible information from the field.",
    date: "2026-03-18",
  },
  {
    id: "post-2",
    title: "Youth Leadership Training Expands Community Representation",
    category: "Leadership",
    author: "RYDA Team",
    summary:
      "Leadership workshops are helping Rohingya youths, girls, and women strengthen advocacy, organization, and public engagement skills.",
    content:
      "RYDA's leadership activities focus on building confidence, communication, and responsibility among Rohingya youths, girls, and women.\n\nBy creating space for community members to organize and participate in decision-making, the organization is expanding local representation and long-term resilience.",
    date: "2026-03-10",
  },
];

const blogForm          = document.getElementById("blog-form");
const blogPostsEl       = document.getElementById("blog-posts");
const blogMessage       = document.getElementById("blog-message");
const blogResetBtn      = document.getElementById("blog-reset");
const blogClearAllBtn   = document.getElementById("blog-clear-all");
const blogSearchInput   = document.getElementById("blog-search");
const blogFilterSelect  = document.getElementById("blog-filter");

const contactForm       = document.getElementById("gmail-contact-form");
const contactResetBtn   = document.getElementById("contact-reset");
const contactFormNote   = document.getElementById("contact-form-note");

function loadPosts() {
  try {
    const raw = localStorage.getItem(BLOG_KEY);
    if (!raw) return defaultPosts;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultPosts;
  } catch {
    return defaultPosts;
  }
}

function savePosts(posts) {
  localStorage.setItem(BLOG_KEY, JSON.stringify(posts));
}

function normalizeText(str) {
  return str.trim().toLowerCase();
}

function buildPostMarkup(post) {
  const badge  = post.category ? `<span class="blog-badge">${escapeHtml(post.category)}</span>` : "";
  const author = post.author   ? `By ${escapeHtml(post.author)}` : "By RYDA";
  return `
    <article class="blog-post card">
      <div class="blog-post-head">
        <h3>${escapeHtml(post.title)}</h3>
        ${badge}
      </div>
      <div class="blog-meta">
        <span class="blog-byline">${author}</span>
        <span class="blog-byline">${escapeHtml(formatDate(post.date))}</span>
      </div>
      <p class="blog-summary">${escapeHtml(post.summary)}</p>
      <p class="blog-content">${escapeHtml(post.content)}</p>
      <div class="blog-post-actions">
        <button class="text-button" type="button" data-delete-post="${escapeHtml(post.id)}">Delete Post</button>
      </div>
    </article>
  `;
}

function syncCategoryFilter(allPosts) {
  if (!blogFilterSelect) return;
  const current    = blogFilterSelect.value;
  const categories = [...new Set(allPosts.map((p) => p.category.trim()).filter(Boolean))].sort();
  blogFilterSelect.innerHTML = [
    '<option value="">All categories</option>',
    ...categories.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`),
  ].join("");
  if (current && categories.includes(current)) blogFilterSelect.value = current;
}

function getFilteredPosts(allPosts) {
  const search   = normalizeText(blogSearchInput  ? blogSearchInput.value  : "");
  const category = normalizeText(blogFilterSelect ? blogFilterSelect.value : "");
  return allPosts.filter((post) => {
    if (category && normalizeText(post.category) !== category) return false;
    if (!search) return true;
    const hay = [post.title, post.summary, post.content, post.author, post.category].join(" ").toLowerCase();
    return hay.includes(search);
  });
}

function renderBlog(allPosts) {
  if (!blogPostsEl) return;
  syncCategoryFilter(allPosts);
  const filtered = getFilteredPosts(allPosts);
  const hasFilter = Boolean(
    (blogSearchInput  && blogSearchInput.value.trim()) ||
    (blogFilterSelect && blogFilterSelect.value.trim())
  );
  if (!filtered.length) {
    blogPostsEl.innerHTML = `
      <div class="empty-state">
        <h3>${hasFilter ? "No matching posts" : "No posts yet"}</h3>
        <p>${hasFilter ? "Try a different search or category." : "Publish the first story to start the Bulletin."}</p>
      </div>`;
    return;
  }
  blogPostsEl.innerHTML = filtered.map(buildPostMarkup).join("");
  const newCards = Array.from(blogPostsEl.querySelectorAll(".blog-post"));
  observeRevealItems(newCards);
  if (canTiltCards) newCards.forEach((c) => attachTilt(c));
}

let posts = loadPosts().sort((a, b) => new Date(b.date) - new Date(a.date));
renderBlog(posts);

// Publish post
if (blogForm && blogMessage) {
  blogForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data    = new FormData(blogForm);
    const title   = data.get("title").toString().trim();
    const category = data.get("category").toString().trim();
    const author  = data.get("author").toString().trim() || "RYDA Team";
    const summary = data.get("summary").toString().trim();
    const content = data.get("content").toString().trim();

    if (!title || !summary || !content) {
      blogMessage.textContent = "Please complete the title, summary, and full story fields.";
      return;
    }

    const newPost = {
      id: `post-${Date.now()}`,
      title,
      category,
      author,
      summary,
      content,
      date: new Date().toISOString().slice(0, 10),
    };

    posts = [newPost, ...posts];
    savePosts(posts);
    renderBlog(posts);
    blogForm.reset();
    blogMessage.textContent = "Post published successfully.";
  });
}

// Clear editor
if (blogResetBtn && blogForm && blogMessage) {
  blogResetBtn.addEventListener("click", () => {
    blogForm.reset();
    blogMessage.textContent = "Editor cleared.";
  });
}

// Restore demo posts
if (blogClearAllBtn) {
  blogClearAllBtn.addEventListener("click", () => {
    posts = [...defaultPosts];
    savePosts(posts);
    renderBlog(posts);
    if (blogMessage) blogMessage.textContent = "Demo posts restored.";
  });
}

// Search & filter
if (blogSearchInput)  blogSearchInput.addEventListener("input",  () => renderBlog(posts));
if (blogFilterSelect) blogFilterSelect.addEventListener("change", () => renderBlog(posts));

// Delete post (event delegation)
if (blogPostsEl) {
  blogPostsEl.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const postId = target.dataset.deletePost;
    if (!postId) return;
    posts = posts.filter((p) => p.id !== postId);
    savePosts(posts);
    renderBlog(posts);
    if (blogMessage) blogMessage.textContent = "Post deleted.";
  });
}

// ─── Contact form → Gmail ─────────────────────────────────
if (contactForm && contactFormNote) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data         = new FormData(contactForm);
    const name         = data.get("name").toString().trim();
    const email        = data.get("email").toString().trim();
    const organization = data.get("organization").toString().trim();
    const inquiryType  = data.get("type").toString().trim();
    const subject      = data.get("subject").toString().trim();
    const message      = data.get("message").toString().trim();

    if (!name || !email || !subject || !message) {
      contactFormNote.textContent = "Please complete your name, email, subject, and message.";
      return;
    }

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Organization: ${organization || "Not provided"}`,
      `Inquiry Type: ${inquiryType || "General"}`,
      "",
      "Message:",
      message,
    ].join("\n");

    const gmailUrl =
      "https://mail.google.com/mail/?view=cm&fs=1" +
      `&to=${encodeURIComponent("ryda.rohingya@gmail.com")}` +
      `&su=${encodeURIComponent(`[RYDA Website] ${subject}`)}` +
      `&body=${encodeURIComponent(body)}`;

    window.open(gmailUrl, "_blank", "noopener");
    contactFormNote.textContent = "Gmail draft opened in a new tab.";
  });
}

if (contactResetBtn && contactForm && contactFormNote) {
  contactResetBtn.addEventListener("click", () => {
    contactForm.reset();
    contactFormNote.textContent = "Form cleared.";
  });
}
