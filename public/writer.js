/* ============================================================
   RYDA — Writer Panel Script v3.0 (Firebase)
   - Auth via token check
   - Posts stored in Firestore
   - Images uploaded to Firebase Storage
   - Rich text editor with toolbar
   - Post management (list, delete)
   ============================================================ */
"use strict";

// Firebase config
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBieGnfxoFqHLLZHz-MnHWRzl1eBarD7yo",
  authDomain: "ryda-68015.firebaseapp.com",
  projectId: "ryda-68015",
  storageBucket: "ryda-68015.firebasestorage.app",
  messagingSenderId: "845909692038",
  appId: "1:845909692038:web:94c8c4a51a737e5abacb07"
};

const TOKEN_KEY = "ryda_writer_token";
const DRAFT_KEY = "ryda_writer_draft";
const VALID_TOKEN = "RYDA5555";

// ─── State ────────────────────────────────────────────────
let writerToken = sessionStorage.getItem(TOKEN_KEY) || "";
let firebaseReady = false;
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
const imgFileInput    = document.getElementById("f-image-file");
const imgUrlInput     = document.getElementById("f-image");
const uploadStatus    = document.getElementById("upload-status");
const uploadPreview   = document.getElementById("upload-preview");
const uploadPreviewImg = document.getElementById("upload-preview-img");

// ─── Firebase Init ────────────────────────────────────────
let firestore;

function initFirebase() {
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    firestore = firebase.firestore();
    firebaseReady = true;
  } catch(e) {
    console.error("Firebase init error:", e);
  }
}

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

function verifyToken(token) {
  return token === VALID_TOKEN;
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

    const ok = verifyToken(token);

    loginBtn.disabled = false;
    loginBtnText.hidden = false;
    loginSpinner.hidden = true;

    if (ok) {
      writerToken = token;
      sessionStorage.setItem(TOKEN_KEY, token);
      initFirebase();
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

// Auto-login
if (writerToken && verifyToken(writerToken)) {
  initFirebase();
  showDashboard();
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
    e.preventDefault();
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

// ─── Clear form ───────────────────────────────────────────
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

// ─── Publish to Firestore ─────────────────────────────────
if (postForm) {
  postForm.addEventListener("submit", async e => {
    e.preventDefault();

    if (!firebaseReady) {
      showFeedback("Firebase not initialized. Please refresh and log in again.", "error");
      return;
    }

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

    const now = new Date().toISOString();
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);

    const postData = {
      title,
      slug,
      category: fd.get("category")?.toString() || "Article",
      author: fd.get("author")?.toString().trim() || "RYDA Team",
      summary,
      content: contentHtml,
      featured_image: fd.get("featured_image")?.toString().trim() || null,
      tags,
      date: now,
      createdAt: now,
      published: true
    };

    setPublishLoading(true);
    showFeedback("", "");

    try {
      const docRef = await firestore.collection("posts").add(postData);
      showFeedback(`✓ "${postData.title}" published successfully. (ID: ${docRef.id})`, "success");
      clearForm();
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
    } catch (err) {
      console.error("Publish error:", err);
      showFeedback("Failed to publish: " + (err.message || "Unknown error"), "error");
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

// ─── Fetch posts from Firestore ───────────────────────────
async function fetchPosts() {
  if (!postsList) return;
  if (!firebaseReady) {
    postsList.innerHTML = '<div class="posts-empty">Firebase not available. Refresh the page.</div>';
    return;
  }
  postsList.innerHTML = '<div class="posts-loading">Loading posts…</div>';

  try {
    const snapshot = await firestore.collection("posts")
      .orderBy("createdAt", "desc")
      .get();

    allPosts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().createdAt // Firestore stored date
    }));

    renderPostsList(allPosts);
  } catch (err) {
    console.error("Fetch error:", err);
    postsList.innerHTML = '<div class="posts-empty">Could not load posts. ' + esc(err.message) + '</div>';
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
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    .map(post => buildPostRow(post))
    .join("");

  postsList.querySelectorAll("[data-delete-id]").forEach(btn => {
    btn.addEventListener("click", () => confirmDelete(btn.dataset.deleteId, btn.dataset.deleteTitle));
  });
}

function buildPostRow(post) {
  const dateStr = post.date || post.createdAt || "";
  const date = dateStr ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(dateStr)) : "No date";
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
    await firestore.collection("posts").doc(id).delete();
    allPosts = allPosts.filter(p => p.id !== id);
    renderPostsList(allPosts);
  } catch (err) {
    alert("Failed to delete: " + err.message);
  }
}

if (postsSearch) postsSearch.addEventListener("input", () => renderPostsList(allPosts));
if (refreshPostsBtn) refreshPostsBtn.addEventListener("click", fetchPosts);

// ─── Image Upload to Cloudinary ────────────────────────
if (imgFileInput) {
  imgFileInput.addEventListener("change", async () => {
    const file = imgFileInput.files[0];
    if (!file) return;

    // Validate size
    if (file.size > 10 * 1024 * 1024) {
      showUploadStatus("✗ Image must be under 10MB", "error");
      imgFileInput.value = "";
      return;
    }

    // Validate type
    if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/)) {
      showUploadStatus("✗ Only JPG, PNG, WebP, or GIF allowed", "error");
      imgFileInput.value = "";
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = e => {
      uploadPreviewImg.src = e.target.result;
      uploadPreview.hidden = false;
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    showUploadStatus("↑ Uploading to Cloudinary…", "loading");
    imgFileInput.disabled = true;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ryda-images");

      const res = await fetch("https://api.cloudinary.com/v1_1/ryda-ngo/image/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Cloudinary upload failed");

      const data = await res.json();
      imgUrlInput.value = data.secure_url;
      showUploadStatus("✓ Image uploaded to Cloudinary", "success");
      saveDraft();
    } catch (err) {
      console.error("Upload error:", err);
      // Fallback: base64 data URI
      try {
        const b64 = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(file);
        });
        imgUrlInput.value = b64;
        showUploadStatus("⚠ Cloudinary failed — using local image", "warning");
        saveDraft();
      } catch {
        showUploadStatus("✗ Upload failed", "error");
        uploadPreview.hidden = true;
      }
    }

    imgFileInput.disabled = false;
    imgFileInput.value = "";
  });
}

function showUploadStatus(msg, type) {
  if (!uploadStatus) return;
  uploadStatus.textContent = msg;
  uploadStatus.hidden = false;
  uploadStatus.className = "upload-status " + (type || "");
  if (type === "loading") uploadStatus.classList.add("is-loading");
}

// ─── Helper ───────────────────────────────────────────────
function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
