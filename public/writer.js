/* ============================================================
   RYDA — Writer Panel Script v2.0
   - Token authentication via /api/auth
   - Rich text editor with toolbar
   - Post publishing via /api/posts
   - Post management (list, delete)
   - Preview mode
   - Character counting
   - Draft persistence (localStorage)
   ============================================================ */
"use strict";

const API = "/api";
const TOKEN_KEY = "ryda_writer_token";
const DRAFT_KEY = "ryda_writer_draft";

// ─── State ────────────────────────────────────────────────
let writerToken = sessionStorage.getItem(TOKEN_KEY) || "";
let allPosts = [];
let currentPanel = "new-post";
let isEditorPreview = false;

// ─── DOM refs ─────────────────────────────────────────────
const loginScreen  = document.getElementById("login-screen");
const dashboard    = document.getElementById("dashboard");
const loginForm    = document.getElementById("login-form");
const tokenInput   = document.getElementById("token-input");
const loginBtn     = document.getElementById("login-btn");
const loginBtnText = document.getElementById("login-btn-text");
const loginSpinner = document.getElementById("login-spinner");
const loginError   = document.getElementById("login-error");
const logoutBtn    = document.getElementById("logout-btn");

const panels    = document.querySelectorAll(".panel");
const sbLinks   = document.querySelectorAll(".sb-link[data-panel]");
const postForm  = document.getElementById("post-form");
const publishBtn      = document.getElementById("publish-btn");
const publishBtnText  = document.getElementById("publish-btn-text");
const publishSpinner  = document.getElementById("publish-spinner");
const formFeedback    = document.getElementById("form-feedback");
const draftClear      = document.getElementById("draft-clear");
const richEditor      = document.getElementById("f-content");
const contentHidden   = document.getElementById("f-content-hidden");
const previewBtn      = document.getElementById("preview-btn");
const previewClose    = document.getElementById("preview-close");
const postPreview     = document.getElementById("post-preview");
const postsList       = document.getElementById("posts-list");
const postsSearch     = document.getElementById("posts-search");
const refreshPostsBtn = document.getElementById("refresh-posts");

// ─── Auth ─────────────────────────────────────────────────
function showDashboard() {
  loginScreen.hidden = true;
  dashboard.hidden = false;
  switchPanel("new-post");
  restoreDraft();
}

function showLogin() {
  loginScreen.hidden = false;
  dashboard.hidden = true;
  writerToken = "";
  sessionStorage.removeItem(TOKEN_KEY);
}

async function verifyToken(token) {
  try {
    const res = await fetch(`${API}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    return res.ok;
  } catch {
    // If API not available (local dev without backend), accept any non-empty token
    return token.length >= 4;
  }
}

if (loginForm) {
  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    const token = tokenInput.value.trim();
    if (!token) return;

    loginBtn.disabled = true;
    loginBtnText.hidden = true;
    loginSpinner.hidden = false;
    loginError.hidden = true;

    const ok = await verifyToken(token);

    loginBtn.disabled = false;
    loginBtnText.hidden = false;
    loginSpinner.hidden = true;

    if (ok) {
      writerToken = token;
      sessionStorage.setItem(TOKEN_KEY, token);
      showDashboard();
    } else {
      loginError.hidden = false;
      tokenInput.select();
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    if (confirm("Log out from the writer panel?")) showLogin();
  });
}

// Auto-login if token in session
if (writerToken) {
  verifyToken(writerToken).then(ok => {
    if (ok) showDashboard();
    else showLogin();
  });
}

// ─── Panel switching ──────────────────────────────────────
function switchPanel(name) {
  currentPanel = name;
  panels.forEach(p => p.classList.toggle("is-active", p.id === `panel-${name}`));
  sbLinks.forEach(l => l.classList.toggle("is-active", l.dataset.panel === name));
  if (name === "all-posts") fetchPosts();
}

sbLinks.forEach(l => {
  l.addEventListener("click", () => switchPanel(l.dataset.panel));
});

// ─── Toolbar / Rich Editor ────────────────────────────────
const toolBtns = document.querySelectorAll(".tool-btn");

toolBtns.forEach(btn => {
  btn.addEventListener("mousedown", e => {
    e.preventDefault(); // Keep focus in editor
    execFormat(btn.dataset.cmd);
  });
});

function execFormat(cmd) {
  richEditor.focus();
  switch (cmd) {
    case "bold":        document.execCommand("bold"); break;
    case "italic":      document.execCommand("italic"); break;
    case "underline":   document.execCommand("underline"); break;
    case "h2":          wrapBlock("H2"); break;
    case "h3":          wrapBlock("H3"); break;
    case "ul":          document.execCommand("insertUnorderedList"); break;
    case "ol":          document.execCommand("insertOrderedList"); break;
    case "blockquote":  wrapBlock("BLOCKQUOTE"); break;
    case "clear":       document.execCommand("removeFormat"); break;
  }
  syncHidden();
  updateToolbarState();
}

function wrapBlock(tag) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  const block = document.createElement(tag);
  block.appendChild(range.extractContents());
  range.insertNode(block);
  sel.collapse(block, block.childNodes.length);
}

function syncHidden() {
  if (contentHidden) contentHidden.value = richEditor.innerHTML;
}

function updateToolbarState() {
  toolBtns.forEach(btn => {
    const cmd = btn.dataset.cmd;
    let active = false;
    if (cmd === "bold") active = document.queryCommandState("bold");
    if (cmd === "italic") active = document.queryCommandState("italic");
    if (cmd === "underline") active = document.queryCommandState("underline");
    btn.classList.toggle("is-active", active);
  });
}

if (richEditor) {
  richEditor.addEventListener("input", () => { syncHidden(); saveDraft(); });
  richEditor.addEventListener("keyup", updateToolbarState);
  richEditor.addEventListener("mouseup", updateToolbarState);
  richEditor.addEventListener("keydown", e => {
    if (e.key === "Tab") { e.preventDefault(); document.execCommand("insertText", false, "    "); }
  });
}

// ─── Character counter ────────────────────────────────────
const charCountEls = document.querySelectorAll(".char-count[data-field]");

function updateCharCount(el) {
  const field = document.getElementById(el.dataset.field);
  if (!field) return;
  const max = parseInt(el.dataset.max, 10);
  const len = field.value.length;
  el.textContent = `${len} / ${max}`;
  el.classList.toggle("is-near", len > max * 0.85);
  el.classList.toggle("is-over", len > max);
}

charCountEls.forEach(el => {
  const field = document.getElementById(el.dataset.field);
  if (field) {
    field.addEventListener("input", () => updateCharCount(el));
    updateCharCount(el);
  }
});

// ─── Draft saving ─────────────────────────────────────────
function saveDraft() {
  if (!postForm) return;
  try {
    const fd = new FormData(postForm);
    const draft = {
      title: fd.get("title") || "",
      category: fd.get("category") || "",
      author: fd.get("author") || "",
      summary: fd.get("summary") || "",
      featured_image: fd.get("featured_image") || "",
      tags: fd.get("tags") || "",
      content_html: richEditor ? richEditor.innerHTML : "",
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {}
}

function restoreDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw || !postForm) return;
    const draft = JSON.parse(raw);
    const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
    set("f-title", draft.title);
    set("f-author", draft.author);
    set("f-summary", draft.summary);
    set("f-image", draft.featured_image);
    set("f-tags", draft.tags);
    if (draft.category) {
      const sel = document.getElementById("f-category");
      if (sel) sel.value = draft.category;
    }
    if (draft.content_html && richEditor) {
      richEditor.innerHTML = draft.content_html;
      syncHidden();
    }
    charCountEls.forEach(el => updateCharCount(el));
  } catch {}
}

if (postForm) {
  postForm.querySelectorAll("input, textarea, select").forEach(el => {
    el.addEventListener("input", saveDraft);
    el.addEventListener("change", saveDraft);
  });
}

// ─── Clear form / draft ───────────────────────────────────
function clearForm() {
  if (!postForm) return;
  postForm.reset();
  if (richEditor) { richEditor.innerHTML = ""; syncHidden(); }
  if (formFeedback) { formFeedback.textContent = ""; formFeedback.className = "form-feedback"; }
  if (isEditorPreview) togglePreview();
  charCountEls.forEach(el => updateCharCount(el));
  try { localStorage.removeItem(DRAFT_KEY); } catch {}
}

if (draftClear) draftClear.addEventListener("click", () => {
  if (confirm("Clear the editor and discard the current draft?")) clearForm();
});

// ─── Preview ──────────────────────────────────────────────
function togglePreview() {
  isEditorPreview = !isEditorPreview;

  const editorForm = document.querySelector(".editor-form");
  const fields = postForm ? Array.from(postForm.querySelectorAll(".field-group, .field-row")) : [];

  if (isEditorPreview) {
    buildPreview();
    postPreview.hidden = false;
    previewBtn.hidden = true;
    previewClose.hidden = false;
    fields.forEach(f => { f.style.display = "none"; });
  } else {
    postPreview.hidden = true;
    previewBtn.hidden = false;
    previewClose.hidden = true;
    fields.forEach(f => { f.style.display = ""; });
  }
}

function buildPreview() {
  const fd = new FormData(postForm);
  const title   = fd.get("title")?.toString().trim() || "(Untitled)";
  const category = fd.get("category")?.toString() || "General";
  const author  = fd.get("author")?.toString().trim() || "RYDA Team";
  const summary = fd.get("summary")?.toString().trim() || "";
  const image   = fd.get("featured_image")?.toString().trim() || "";
  const content = richEditor ? richEditor.innerHTML : "";

  document.getElementById("prev-badge").textContent = category;
  document.getElementById("prev-title").textContent = title;
  document.getElementById("prev-meta").textContent = `${author} · ${new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date())}`;
  document.getElementById("prev-summary").textContent = summary;
  document.getElementById("prev-body").innerHTML = content || "<p><em>No content yet.</em></p>";

  const imgWrap = document.getElementById("prev-image-wrap");
  const img = document.getElementById("prev-image");
  if (image) { img.src = image; imgWrap.hidden = false; }
  else imgWrap.hidden = true;
}

if (previewBtn)  previewBtn.addEventListener("click", togglePreview);
if (previewClose) previewClose.addEventListener("click", togglePreview);

// ─── Publish ──────────────────────────────────────────────
if (postForm) {
  postForm.addEventListener("submit", async e => {
    e.preventDefault();

    syncHidden();

    const fd = new FormData(postForm);
    const title   = fd.get("title")?.toString().trim();
    const summary = fd.get("summary")?.toString().trim();
    const content = (richEditor ? richEditor.innerText : fd.get("content")?.toString())?.trim();
    const contentHtml = richEditor ? richEditor.innerHTML.trim() : "";

    if (!title) { showFeedback("Post title is required.", "error"); return; }
    if (!summary) { showFeedback("A summary is required.", "error"); return; }
    if (!content) { showFeedback("Post content cannot be empty.", "error"); return; }

    const tags = (fd.get("tags") || "")
      .toString()
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      title,
      category: fd.get("category")?.toString() || "General",
      author: fd.get("author")?.toString().trim() || "RYDA Team",
      summary,
      content: contentHtml, // store rich HTML
      featured_image: fd.get("featured_image")?.toString().trim() || null,
      tags,
    };

    setPublishLoading(true);
    showFeedback("", "");

    // 15-second safety timeout to prevent infinite loading
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(`${API}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Writer-Token": writerToken,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (res.ok && data.post) {
        showFeedback(`✓ "${data.post.title}" published successfully.`, "success");
        clearForm();
        try { localStorage.removeItem(DRAFT_KEY); } catch {}
      } else if (res.status === 401) {
        showFeedback("Session expired. Please log out and log back in.", "error");
      } else {
        showFeedback(data.error || "Failed to publish. Please check your token.", "error");
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        showFeedback("Request timed out. The server is taking too long to respond.", "error");
      } else if (err.message.includes("fetch") || err.message.includes("Failed")) {
        showFeedback("⚠ API not reachable. Post would be saved when deployed to Vercel.", "error");
      } else {
        showFeedback("Network error. Check your connection or Redis configuration.", "error");
      }
    }

    setPublishLoading(false);
  });
}

function setPublishLoading(loading) {
  if (!publishBtn) return;
  publishBtn.disabled = loading;
  publishBtnText.hidden = loading;
  publishSpinner.hidden = !loading;
}

function showFeedback(msg, type) {
  if (!formFeedback) return;
  formFeedback.textContent = msg;
  formFeedback.className = `form-feedback${type ? " " + type : ""}`;
}

// ─── Fetch & render posts ─────────────────────────────────
async function fetchPosts() {
  if (!postsList) return;
  postsList.innerHTML = '<div class="posts-loading">Loading posts…</div>';

  try {
    const res = await fetch(`${API}/posts`);
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    allPosts = data.posts || [];
    renderPostsList(allPosts);
  } catch {
    postsList.innerHTML = '<div class="posts-empty">Could not load posts. API may be unavailable in local development.</div>';
  }
}

function renderPostsList(posts) {
  if (!postsList) return;
  const search = (postsSearch?.value || "").toLowerCase().trim();
  const filtered = search
    ? posts.filter(p => p.title.toLowerCase().includes(search) || p.category.toLowerCase().includes(search))
    : posts;

  if (!filtered.length) {
    postsList.innerHTML = '<div class="posts-empty">No posts found.</div>';
    return;
  }

  postsList.innerHTML = filtered
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(post => buildPostRow(post))
    .join("");

  postsList.querySelectorAll("[data-delete-id]").forEach(btn => {
    btn.addEventListener("click", () => confirmDelete(btn.dataset.deleteId, btn.dataset.deleteTitle));
  });
}

function buildPostRow(post) {
  const date = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(post.date));
  const titleSafe = esc(post.title);
  const catSafe   = esc(post.category);
  const authSafe  = esc(post.author);
  return `
  <div class="post-row">
    <div class="post-row-info">
      <span class="post-row-badge">${catSafe}</span>
      <div class="post-row-title" title="${titleSafe}">${titleSafe}</div>
      <div class="post-row-meta">${authSafe} · ${esc(date)}</div>
    </div>
    <div class="post-row-actions">
      <button class="btn btn-danger" type="button"
        data-delete-id="${esc(post.id)}"
        data-delete-title="${titleSafe}">Delete</button>
    </div>
  </div>`;
}

async function confirmDelete(id, title) {
  if (!confirm(`Delete post:\n"${title}"?\n\nThis cannot be undone.`)) return;

  try {
    const res = await fetch(`${API}/posts?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "X-Writer-Token": writerToken },
    });
    if (res.ok) {
      allPosts = allPosts.filter(p => p.id !== id);
      renderPostsList(allPosts);
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete post.");
    }
  } catch {
    alert("Network error. Could not delete post.");
  }
}

if (postsSearch) postsSearch.addEventListener("input", () => renderPostsList(allPosts));
if (refreshPostsBtn) refreshPostsBtn.addEventListener("click", fetchPosts);

// ─── Helper ───────────────────────────────────────────────
function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
