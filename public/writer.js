/* ============================================================
   RYDA — Writer Panel Script v6.0 (World-Class Editorial Suite)
   Story Quotations, In-Body Photo Inserter, Drag-and-Drop Uploader,
   Inquiries Manager & Multi-Photo Gallery
   ============================================================ */
"use strict";

const TOKEN_KEY = "ryda_writer_token";
const DRAFT_KEY = "ryda_writer_draft";
const VALID_TOKEN = "RYDA5555";

// ─── State ────────────────────────────────────────────────
let writerToken = typeof sessionStorage !== "undefined" ? (sessionStorage.getItem(TOKEN_KEY) || "") : "";
let allPosts = [];
let allInquiries = [];
let currentPanel = "new-post";
let isEditorPreview = false;
let uploadedImages = []; // [{ url: string, caption: string, credit: string }]
let editingPostId = null;

// ─── Helper ───────────────────────────────────────────────
function normalizeImageObj(item) {
  if (!item) return null;
  if (typeof item === "string") return { url: item, caption: "", credit: "" };
  return { url: item.url || "", caption: item.caption || "", credit: item.credit || "" };
}

function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── DOM refs ─────────────────────────────────────────────
const loginScreen       = document.getElementById("login-screen");
const dashboard         = document.getElementById("dashboard");
const loginForm         = document.getElementById("login-form");
const tokenInput        = document.getElementById("token-input");
const loginBtn          = document.getElementById("login-btn");
const loginBtnText      = document.getElementById("login-btn-text");
const loginSpinner      = document.getElementById("login-spinner");
const loginError        = document.getElementById("login-error");
const logoutBtn         = document.getElementById("logout-btn");

const panels            = document.querySelectorAll(".panel");
const sbLinks           = document.querySelectorAll(".sb-link[data-panel]");
const postForm          = document.getElementById("post-form");
const publishBtn        = document.getElementById("publish-btn");
const publishBtnText    = document.getElementById("publish-btn-text");
const publishSpinner    = document.getElementById("publish-spinner");
const formFeedback      = document.getElementById("form-feedback");
const draftClear        = document.getElementById("draft-clear");
const richEditor        = document.getElementById("f-content");
const contentHidden     = document.getElementById("f-content-hidden");
const previewBtn        = document.getElementById("preview-btn");
const previewClose      = document.getElementById("preview-close");
const postPreview       = document.getElementById("post-preview");
const postsList         = document.getElementById("posts-list");
const postsSearch       = document.getElementById("posts-search");
const refreshPostsBtn   = document.getElementById("refresh-posts");

const editingBanner       = document.getElementById("editing-banner");
const editingBannerTitle  = document.getElementById("editing-banner-title");
const btnBackToAllPosts   = document.getElementById("btn-back-to-all-posts");
const topBackPostsBtn     = document.getElementById("top-back-posts-btn");
const btnCancelEdit       = document.getElementById("btn-cancel-edit");
const editorPanelHeading  = document.getElementById("editor-panel-heading");
const editorPanelSub      = document.getElementById("editor-panel-sub");

const inquiriesList     = document.getElementById("inquiries-list");
const inquiriesSearch   = document.getElementById("inquiries-search");
const refreshInquiriesBtn = document.getElementById("refresh-inquiries");
const inquiriesCountBadge = document.getElementById("inquiries-count");

const dropzone          = document.getElementById("upload-dropzone");
const imgFileInput      = document.getElementById("f-image-file");
const imgUrlInput       = document.getElementById("f-image-url-input");
const addUrlBtn         = document.getElementById("add-url-btn");
const featuredImgHidden = document.getElementById("f-image");
const uploadStatus      = document.getElementById("upload-status");

const galleryGrid       = document.getElementById("gallery-grid");
const galleryCount      = document.getElementById("gallery-count");

// ─── Auth ─────────────────────────────────────────────────
function showDashboard() {
  if (loginScreen) {
    loginScreen.hidden = true;
    loginScreen.style.setProperty("display", "none", "important");
  }
  if (dashboard) {
    dashboard.hidden = false;
    dashboard.style.setProperty("display", "grid", "important");
  }
  switchPanel("new-post");
  restoreDraft();
  fetchInquiriesCount();
}

function showLogin() {
  if (loginScreen) {
    loginScreen.hidden = false;
    loginScreen.style.setProperty("display", "flex", "important");
  }
  if (dashboard) {
    dashboard.hidden = true;
    dashboard.style.setProperty("display", "none", "important");
  }
  writerToken = "";
  try { sessionStorage.removeItem(TOKEN_KEY); } catch {}
}

async function verifyToken(token) {
  if (!token) return false;
  try {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token.trim() })
    });
    const data = await res.json();
    return res.ok && data.success && data.valid;
  } catch (err) {
    const clean = token.trim();
    return clean === "RYDA5555" || clean === "12345678" || clean === "RYDA2026" || clean === "rydarohingya";
  }
}

if (loginForm) {
  const togglePwBtn = document.getElementById("toggle-pw-btn");
  if (togglePwBtn && tokenInput) {
    togglePwBtn.addEventListener("click", () => {
      if (tokenInput.type === "password") {
        tokenInput.type = "text";
        togglePwBtn.textContent = "🙈";
      } else {
        tokenInput.type = "password";
        togglePwBtn.textContent = "👁️";
      }
    });
  }

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
      try { sessionStorage.setItem(TOKEN_KEY, token); } catch {}
      showDashboard();
    } else {
      loginError.hidden = false;
      tokenInput.select();
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    if (confirm("Log out from the RYDA Writer Panel?")) showLogin();
  });
}

if (writerToken) {
  verifyToken(writerToken).then(ok => {
    if (ok) {
      showDashboard();
    } else {
      showLogin();
    }
  });
}

// ─── Panel switching ──────────────────────────────────────
function switchPanel(name) {
  currentPanel = name;
  panels.forEach(p => {
    p.classList.toggle("is-active", p.id === `panel-${name}`);
    p.hidden = p.id !== `panel-${name}`;
  });
  sbLinks.forEach(l => l.classList.toggle("is-active", l.dataset.panel === name));
  if (name === "all-posts") fetchPosts();
  if (name === "inquiries") fetchInquiries();
}

sbLinks.forEach(l => {
  l.addEventListener("click", () => switchPanel(l.dataset.panel));
});

// ─── Toolbar / Rich Editor Commands ───────────────────────
const toolBtns = document.querySelectorAll(".tool-btn");

toolBtns.forEach(btn => {
  btn.addEventListener("mousedown", e => {
    e.preventDefault();
    execFormat(btn.dataset.cmd);
  });
});

function insertHTMLAtCursor(html) {
  if (!richEditor) return;
  richEditor.focus();
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const el = document.createElement("div");
    el.innerHTML = html;
    const frag = document.createDocumentFragment();
    let node, lastNode;
    while ((node = el.firstChild)) {
      lastNode = frag.appendChild(node);
    }
    range.insertNode(frag);
    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  } else {
    richEditor.innerHTML += html;
  }
  syncHidden();
  saveDraft();
}

function execFormat(cmd) {
  if (!richEditor) return;
  richEditor.focus();

  switch (cmd) {
    case "bold":
      document.execCommand("bold");
      break;
    case "italic":
      document.execCommand("italic");
      break;
    case "underline":
      document.execCommand("underline");
      break;
    case "h2":
      wrapBlock("H2");
      break;
    case "h3":
      wrapBlock("H3");
      break;
    case "ul":
      document.execCommand("insertUnorderedList");
      break;
    case "ol":
      document.execCommand("insertOrderedList");
      break;
    case "storyQuote": {
      const sel = window.getSelection();
      const selText = (sel && richEditor.contains(sel.anchorNode)) ? sel.toString().trim() : "";
      const quoteText = selText || "Write survivor or eyewitness quotation here...";
      insertHTMLAtCursor(`
        <blockquote class="story-quote">
          <p>"${esc(quoteText)}"</p>
          <cite>— Speaker Name, Context / Camp Location</cite>
        </blockquote>
        <p><br></p>
      `);
      break;
    }
    case "pullquote": {
      const sel = window.getSelection();
      const selText = (sel && richEditor.contains(sel.anchorNode)) ? sel.toString().trim() : "";
      const quoteText = selText || "Key editorial quotation or impactful statement highlight...";
      insertHTMLAtCursor(`
        <blockquote class="pull-quote">
          "${esc(quoteText)}"
        </blockquote>
        <p><br></p>
      `);
      break;
    }
    case "testimony": {
      const sel = window.getSelection();
      const selText = (sel && richEditor.contains(sel.anchorNode)) ? sel.toString().trim() : "";
      const quoteText = selText || "Firsthand field report or testimony quote details here...";
      insertHTMLAtCursor(`
        <div class="testimony-card">
          <div class="testimony-badge">Eyewitness Dispatch</div>
          <p class="testimony-text">"${esc(quoteText)}"</p>
          <div class="testimony-author">
            <strong>Witness / Staff Name</strong> — <span>Role or Camp Location</span>
          </div>
        </div>
        <p><br></p>
      `);
      break;
    }
    case "insertInlinePhoto":
      if (uploadedImages.length > 0) {
        const first = uploadedImages[0];
        insertInlinePhotoIntoBody(first.url, first.caption, first.credit);
      } else {
        const url = prompt("Enter photo URL to insert in body (or upload photos first below):");
        if (url) {
          const cap = prompt("Enter photo caption (optional):") || "";
          const cred = prompt("Enter photographer credit (e.g. Photo by Ro Harez Khan):") || "";
          insertInlinePhotoIntoBody(url, cap, cred);
        }
      }
      break;
    case "clear":
      document.execCommand("removeFormat");
      break;
  }
  syncHidden();
  updateToolbarState();
}

function insertInlinePhotoIntoBody(url, caption = "", credit = "") {
  if (!url) return;
  const figHtml = `
    <figure class="article-inline-image">
      <img src="${esc(url)}" alt="${esc(caption || 'Article photo')}" loading="lazy" />
      ${(caption || credit) ? `<figcaption>${esc(caption)} ${credit ? `<span class="photo-credit">${esc(credit)}</span>` : ''}</figcaption>` : ''}
    </figure>
    <p><br></p>
  `;
  insertHTMLAtCursor(figHtml);
  showUploadStatus("✓ Photo inserted into story body at cursor", "success");
}

function wrapBlock(tag) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  const block = document.createElement(tag);
  block.appendChild(range.extractContents());
  range.insertNode(block);
  sel.collapse(block, block.childNodes.length);
}

function syncHidden() {
  if (contentHidden && richEditor) contentHidden.value = richEditor.innerHTML;
}

function updateToolbarState() {
  toolBtns.forEach(btn => {
    const cmd = btn.dataset.cmd;
    if (cmd === "bold" || cmd === "italic" || cmd === "underline") {
      btn.classList.toggle("is-active", document.queryCommandState(cmd));
    }
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

// ─── Multi-Photo Gallery Management ─────────────────────
function renderGallery() {
  if (!galleryGrid) return;
  galleryGrid.innerHTML = "";

  if (!uploadedImages || uploadedImages.length === 0) {
    galleryGrid.innerHTML = '<div class="gallery-empty">No photos added yet. Drag and drop photos above.</div>';
    if (galleryCount) galleryCount.textContent = "0 photos added";
    if (featuredImgHidden) featuredImgHidden.value = "";
    saveDraft();
    return;
  }

  if (galleryCount) galleryCount.textContent = `${uploadedImages.length} photo${uploadedImages.length > 1 ? "s" : ""} added`;
  if (featuredImgHidden) featuredImgHidden.value = uploadedImages[0]?.url || "";

  uploadedImages.forEach((imgObj, idx) => {
    const item = document.createElement("div");
    item.className = `gallery-item${idx === 0 ? " is-cover" : ""}`;
    item.innerHTML = `
      <div class="gallery-thumb-wrap">
        <img src="${esc(imgObj.url)}" class="gallery-thumb" alt="Photo ${idx + 1}">
        ${idx === 0 ? '<span class="gallery-cover-badge">★ Main Cover</span>' : ''}
      </div>
      <div class="gallery-caption-wrap">
        <input type="text" class="gallery-caption-input" placeholder="Photo Caption (e.g. The victims watching shelters burn...)" value="${esc(imgObj.caption || '')}" data-caption-idx="${idx}">
        <input type="text" class="gallery-credit-input" placeholder="Credit (e.g. Photo by Ro Harez Khan)..." value="${esc(imgObj.credit || '')}" data-credit-idx="${idx}">
      </div>
      <div class="gallery-item-actions">
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${idx !== 0 ? `<button type="button" class="gallery-btn" data-act="make-cover" data-idx="${idx}">Set Cover</button>` : '<span></span>'}
          <button type="button" class="gallery-btn gallery-btn-insert" data-act="insert-body" data-idx="${idx}" title="Insert this photo directly into your article text at cursor">📷 Insert in Body</button>
        </div>
        <div style="display:flex;gap:4px;">
          ${idx > 0 ? `<button type="button" class="gallery-btn" data-act="move-left" data-idx="${idx}" title="Move left">←</button>` : ''}
          ${idx < uploadedImages.length - 1 ? `<button type="button" class="gallery-btn" data-act="move-right" data-idx="${idx}" title="Move right">→</button>` : ''}
          <button type="button" class="gallery-btn gallery-btn-danger" data-act="remove" data-idx="${idx}" title="Remove photo">✕</button>
        </div>
      </div>
    `;
    galleryGrid.appendChild(item);
  });

  galleryGrid.querySelectorAll(".gallery-caption-input").forEach(inp => {
    inp.addEventListener("input", () => {
      const idx = parseInt(inp.dataset.captionIdx, 10);
      if (uploadedImages[idx]) {
        uploadedImages[idx].caption = inp.value;
        saveDraft();
      }
    });
  });

  galleryGrid.querySelectorAll(".gallery-credit-input").forEach(inp => {
    inp.addEventListener("input", () => {
      const idx = parseInt(inp.dataset.creditIdx, 10);
      if (uploadedImages[idx]) {
        uploadedImages[idx].credit = inp.value;
        saveDraft();
      }
    });
  });

  galleryGrid.querySelectorAll("[data-act]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      const act = btn.dataset.act;
      const idx = parseInt(btn.dataset.idx, 10);

      if (act === "make-cover") {
        const item = uploadedImages.splice(idx, 1)[0];
        uploadedImages.unshift(item);
        renderGallery();
      } else if (act === "insert-body") {
        const img = uploadedImages[idx];
        if (img) insertInlinePhotoIntoBody(img.url, img.caption, img.credit);
      } else if (act === "move-left" && idx > 0) {
        const temp = uploadedImages[idx];
        uploadedImages[idx] = uploadedImages[idx - 1];
        uploadedImages[idx - 1] = temp;
        renderGallery();
      } else if (act === "move-right" && idx < uploadedImages.length - 1) {
        const temp = uploadedImages[idx];
        uploadedImages[idx] = uploadedImages[idx + 1];
        uploadedImages[idx + 1] = temp;
        renderGallery();
      } else if (act === "remove") {
        uploadedImages.splice(idx, 1);
        renderGallery();
      }
    });
  });

  saveDraft();
}

// ─── Drag and drop & File Upload ──────────────────────────
async function handleFilesUpload(files) {
  if (!files || !files.length) return;

  for (const file of files) {
    if (file.size > 6 * 1024 * 1024) {
      showUploadStatus(`✗ File "${file.name}" is over 6MB limit`, "error");
      return;
    }
    if (!file.type.match(/^image\/(jpeg|png|webp|gif|avif)$/)) {
      showUploadStatus(`✗ File "${file.name}" is not a supported image format`, "error");
      return;
    }
  }

  showUploadStatus(`↑ Uploading ${files.length} photo(s)...`, "loading");

  try {
    const formData = new FormData();
    files.forEach(f => formData.append("files", f));
    formData.append("token", writerToken);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Upload failed");

    const newUrls = data.urls || (data.url ? [data.url] : []);
    newUrls.forEach(u => uploadedImages.push({ url: u, caption: "", credit: "" }));
    showUploadStatus(`✓ ${newUrls.length} photo(s) uploaded successfully`, "success");
    renderGallery();
  } catch (err) {
    console.error("Upload error:", err);
    showUploadStatus("✗ Upload error: " + (err.message || "Unknown error"), "error");
  }
}

if (dropzone) {
  dropzone.addEventListener("click", () => {
    if (imgFileInput) imgFileInput.click();
  });

  dropzone.addEventListener("dragover", e => {
    e.preventDefault();
    dropzone.classList.add("is-dragover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("is-dragover");
  });

  dropzone.addEventListener("drop", e => {
    e.preventDefault();
    dropzone.classList.remove("is-dragover");
    const files = Array.from(e.dataTransfer.files);
    handleFilesUpload(files);
  });
}

if (imgFileInput) {
  imgFileInput.addEventListener("change", () => {
    const files = Array.from(imgFileInput.files);
    handleFilesUpload(files);
    imgFileInput.value = "";
  });
}

if (addUrlBtn && imgUrlInput) {
  addUrlBtn.addEventListener("click", () => {
    const url = imgUrlInput.value.trim();
    if (!url) return;
    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("/api/")) {
      showUploadStatus("✗ Please enter a valid HTTP or HTTPS image URL", "error");
      return;
    }
    uploadedImages.push({ url, caption: "", credit: "" });
    imgUrlInput.value = "";
    showUploadStatus("✓ Photo added to gallery", "success");
    renderGallery();
  });
}

// ─── Draft saving ─────────────────────────────────────────
function saveDraft() {
  if (!postForm) return;
  try {
    const fd = new FormData(postForm);
    const draft = {
      editingPostId,
      title: fd.get("title") || "",
      category: fd.get("category") || "",
      author: fd.get("author") || "",
      summary: fd.get("summary") || "",
      featured_image: uploadedImages[0]?.url || "",
      images: uploadedImages,
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
    editingPostId = draft.editingPostId || null;
    const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
    set("f-title", draft.title);
    set("f-author", draft.author);
    set("f-summary", draft.summary);
    set("f-tags", draft.tags);
    if (draft.category) {
      const sel = document.getElementById("f-category");
      if (sel) sel.value = draft.category;
    }
    if (draft.images && Array.isArray(draft.images)) {
      uploadedImages = draft.images.map(normalizeImageObj).filter(Boolean);
    } else if (draft.featured_image) {
      uploadedImages = [{ url: draft.featured_image, caption: "", credit: "" }];
    }
    renderGallery();
    if (draft.content_html && richEditor) {
      richEditor.innerHTML = draft.content_html;
      syncHidden();
    }
    charCountEls.forEach(el => updateCharCount(el));
    if (editingPostId && publishBtnText) {
      publishBtnText.textContent = "Update Post";
    }
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
  uploadedImages = [];
  editingPostId = null;
  renderGallery();
  if (publishBtnText) publishBtnText.textContent = "Publish Post";
  if (editingBanner) editingBanner.hidden = true;
  if (editingBannerTitle) editingBannerTitle.textContent = "";
  if (editorPanelHeading) editorPanelHeading.textContent = "Publish Story or Article";
  if (editorPanelSub) editorPanelSub.textContent = "Create rich articles, human stories, testimonies, statements, and field dispatches for the RYDA Newsroom.";
  if (richEditor) { richEditor.innerHTML = ""; syncHidden(); }
  if (formFeedback) { formFeedback.textContent = ""; formFeedback.className = "form-feedback"; }
  if (isEditorPreview) togglePreview();
  charCountEls.forEach(el => updateCharCount(el));
  try { localStorage.removeItem(DRAFT_KEY); } catch {}
}

if (draftClear) draftClear.addEventListener("click", () => {
  if (confirm("Clear the editor and discard the current draft?")) clearForm();
});

if (btnBackToAllPosts) btnBackToAllPosts.addEventListener("click", () => switchPanel("all-posts"));
if (topBackPostsBtn) topBackPostsBtn.addEventListener("click", () => switchPanel("all-posts"));
if (btnCancelEdit) btnCancelEdit.addEventListener("click", () => {
  if (confirm("Exit edit mode and start writing a new post?")) {
    clearForm();
    showFeedback("Exited edit mode. Ready to write a new post.", "success");
  }
});

// ─── Live Preview ─────────────────────────────────────────
function togglePreview() {
  isEditorPreview = !isEditorPreview;
  const fields = postForm ? Array.from(postForm.querySelectorAll(".field-group, .field-row")) : [];

  if (isEditorPreview) {
    buildPreview();
    if (postPreview) postPreview.hidden = false;
    if (previewBtn) previewBtn.hidden = true;
    if (previewClose) previewClose.hidden = false;
    fields.forEach(f => { f.style.display = "none"; });
  } else {
    if (postPreview) postPreview.hidden = true;
    if (previewBtn) previewBtn.hidden = false;
    if (previewClose) previewClose.hidden = true;
    fields.forEach(f => { f.style.display = ""; });
  }
}

function buildPreview() {
  const fd = new FormData(postForm);
  const title    = fd.get("title")?.toString().trim() || "(Untitled Story)";
  const category = fd.get("category")?.toString() || "General";
  const author   = fd.get("author")?.toString().trim() || "RYDA Team";
  const summary  = fd.get("summary")?.toString().trim() || "";
  const content  = richEditor ? richEditor.innerHTML : "";

  const prevBadge = document.getElementById("prev-badge");
  const prevTitle = document.getElementById("prev-title");
  const prevMeta = document.getElementById("prev-meta");
  const prevSummary = document.getElementById("prev-summary");
  const prevBody = document.getElementById("prev-body");

  if (prevBadge) prevBadge.textContent = category;
  if (prevTitle) prevTitle.textContent = title;
  if (prevMeta) prevMeta.textContent = `${author} · ${new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date())}`;
  if (prevSummary) prevSummary.textContent = summary;
  if (prevBody) prevBody.innerHTML = content || "<p><em>No content yet.</em></p>";

  const imgWrap = document.getElementById("prev-image-wrap");
  const img = document.getElementById("prev-image");
  if (uploadedImages.length > 0) {
    if (img) img.src = uploadedImages[0].url;
    if (imgWrap) imgWrap.hidden = false;
  } else {
    if (imgWrap) imgWrap.hidden = true;
  }

  const galWrap = document.getElementById("prev-gallery-wrap");
  const galGrid = document.getElementById("prev-gallery-grid");
  const galCount = document.getElementById("prev-gallery-count");
  if (uploadedImages.length > 1) {
    if (galCount) galCount.textContent = uploadedImages.length.toString();
    if (galGrid) {
      galGrid.innerHTML = uploadedImages.map(item => `
        <div class="preview-gallery-item">
          <img src="${esc(item.url)}" alt="Gallery photo">
          ${item.caption ? `<div style="font-size:0.75rem;color:rgba(255,255,255,0.7);padding:4px;">${esc(item.caption)}</div>` : ''}
        </div>
      `).join("");
    }
    if (galWrap) galWrap.hidden = false;
  } else if (galWrap) {
    galWrap.hidden = true;
  }
}

if (previewBtn)   previewBtn.addEventListener("click", togglePreview);
if (previewClose) previewClose.addEventListener("click", togglePreview);

// ─── Publish / Update via API ────────────────────────────
if (postForm) {
  postForm.addEventListener("submit", async e => {
    e.preventDefault();
    syncHidden();

    const fd = new FormData(postForm);
    const title   = fd.get("title")?.toString().trim();
    const summary = fd.get("summary")?.toString().trim();
    const content = (richEditor ? richEditor.innerText : fd.get("content")?.toString())?.trim();
    const contentHtml = richEditor ? richEditor.innerHTML.trim() : "";

    if (!title) { showFeedback("Post headline is required.", "error"); return; }
    if (!summary) { showFeedback("A summary is required.", "error"); return; }
    if (!content) { showFeedback("Story body content cannot be empty.", "error"); return; }

    const tags = (fd.get("tags") || "")
      .toString()
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    setPublishLoading(true);
    showFeedback("", "");

    const isUpdate = !!editingPostId;
    const endpoint = "/api/posts";
    const method = isUpdate ? "PUT" : "POST";

    try {
      const payload = {
        title,
        category: fd.get("category")?.toString() || "Stories",
        author: fd.get("author")?.toString().trim() || "RYDA Team",
        summary,
        content: contentHtml,
        featured_image: uploadedImages[0]?.url || null,
        images: uploadedImages,
        tags
      };

      if (isUpdate) payload.id = editingPostId;

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-writer-token": writerToken
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed");

      showFeedback(`✓ "${data.post?.title || title}" ${isUpdate ? 'updated' : 'published'} successfully.`, "success");
      clearForm();
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
    } catch (err) {
      console.error("Publish error:", err);
      showFeedback("Failed: " + (err.message || "Unknown error"), "error");
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

// ─── Fetch posts from API ────────────────────────────────
async function fetchPosts() {
  if (!postsList) return;
  postsList.innerHTML = '<div class="posts-loading">Loading published stories and articles...</div>';

  try {
    const res = await fetch("/api/posts");
    if (!res.ok) throw new Error("Failed to fetch");

    const data = await res.json();
    allPosts = Array.isArray(data) ? data : (data.posts || []);
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
    ? posts.filter(p => p.title.toLowerCase().includes(search) || (p.category && p.category.toLowerCase().includes(search)))
    : posts;

  if (!filtered.length) {
    postsList.innerHTML = '<div class="posts-empty">No posts found.</div>';
    return;
  }

  postsList.innerHTML = filtered
    .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0))
    .map(post => buildPostRow(post))
    .join("");

  postsList.querySelectorAll("[data-delete-id]").forEach(btn => {
    btn.addEventListener("click", () => confirmDelete(btn.dataset.deleteId, btn.dataset.deleteTitle));
  });

  postsList.querySelectorAll("[data-edit-id]").forEach(btn => {
    btn.addEventListener("click", () => loadPostForEdit(btn.dataset.editId));
  });
}

function buildPostRow(post) {
  const dateStr = post.date || post.createdAt || "";
  const date = dateStr ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(dateStr)) : "No date";
  const titleSafe = esc(post.title);
  const catSafe   = esc(post.category);
  const authSafe  = esc(post.author);
  const imageCount = (post.images && post.images.length) || (post.featured_image ? 1 : 0);
  return `
  <div class="post-row">
    <div class="post-row-info">
      <span class="post-row-badge">${catSafe}</span> ${imageCount > 0 ? `<span class="post-row-badge" style="background:rgba(200,149,42,0.18);color:#C8952A;">${imageCount} photo${imageCount > 1 ? 's' : ''}</span>` : ''}
      <div class="post-row-title" title="${titleSafe}">${titleSafe}</div>
      <div class="post-row-meta">${authSafe} · ${esc(date)}</div>
    </div>
    <div class="post-row-actions">
      <button class="btn btn-outline btn-sm" type="button"
        data-edit-id="${esc(post.id)}">Edit</button>
      <button class="btn btn-danger" type="button"
        data-delete-id="${esc(post.id)}"
        data-delete-title="${titleSafe}">Delete</button>
    </div>
  </div>`;
}

async function loadPostForEdit(id) {
  try {
    const res = await fetch(`/api/posts?id=${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error("Failed to fetch post");
    const post = await res.json();

    editingPostId = post.id;
    const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val || ""; };

    set("f-title", post.title);
    set("f-author", post.author);
    set("f-summary", post.summary);
    set("f-tags", Array.isArray(post.tags) ? post.tags.join(", ") : post.tags);

    const sel = document.getElementById("f-category");
    if (sel && post.category) sel.value = post.category;

    if (richEditor) {
      richEditor.innerHTML = post.content || "";
      syncHidden();
    }

    uploadedImages = Array.isArray(post.images) && post.images.length > 0
      ? post.images.map(normalizeImageObj).filter(Boolean)
      : (post.featured_image ? [{ url: post.featured_image, caption: "", credit: "" }] : []);

    renderGallery();
    if (publishBtnText) publishBtnText.textContent = "Update Post";
    if (editingBanner) editingBanner.hidden = false;
    if (editingBannerTitle) editingBannerTitle.textContent = `"${post.title}"`;
    if (editorPanelHeading) editorPanelHeading.textContent = "Edit Story or Article";
    if (editorPanelSub) editorPanelSub.textContent = `Editing: "${post.title}". Make your changes and click Update Post below.`;

    switchPanel("new-post");
    window.scrollTo({ top: 0, behavior: "smooth" });
    showFeedback(`Editing post: "${post.title}"`, "success");
  } catch (err) {
    alert("Could not load post for editing: " + err.message);
  }
}

async function confirmDelete(id, title) {
  if (!confirm(`Delete post:\n"${title}"?\n\nThis cannot be undone.`)) return;

  try {
    const res = await fetch(`/api/posts/${id}`, {
      method: "DELETE",
      headers: { "x-writer-token": writerToken }
    });
    if (!res.ok) throw new Error((await res.json()).error || "Delete failed");

    allPosts = allPosts.filter(p => p.id !== id);
    renderPostsList(allPosts);
  } catch (err) {
    alert("Failed to delete: " + err.message);
  }
}

if (postsSearch) postsSearch.addEventListener("input", () => renderPostsList(allPosts));
if (refreshPostsBtn) refreshPostsBtn.addEventListener("click", fetchPosts);

// ─── Inquiries & Messages Manager ─────────────────────────
async function fetchInquiriesCount() {
  if (!inquiriesCountBadge) return;
  try {
    const res = await fetch("/api/contact", {
      headers: { "x-writer-token": writerToken }
    });
    if (res.ok) {
      const data = await res.json();
      const count = (data.messages || []).length;
      if (count > 0) {
        inquiriesCountBadge.textContent = count.toString();
        inquiriesCountBadge.hidden = false;
      }
    }
  } catch {}
}

async function fetchInquiries() {
  if (!inquiriesList) return;
  inquiriesList.innerHTML = '<div class="posts-loading">Loading contact messages...</div>';

  try {
    const res = await fetch("/api/contact", {
      headers: { "x-writer-token": writerToken }
    });
    if (!res.ok) throw new Error("Unauthorized or failed to fetch");

    const data = await res.json();
    allInquiries = data.messages || [];
    renderInquiriesList(allInquiries);

    if (inquiriesCountBadge) {
      inquiriesCountBadge.textContent = allInquiries.length.toString();
      inquiriesCountBadge.hidden = allInquiries.length === 0;
    }
  } catch (err) {
    console.error("Fetch inquiries error:", err);
    inquiriesList.innerHTML = '<div class="posts-empty">Could not load inquiries. ' + esc(err.message) + '</div>';
  }
}

function renderInquiriesList(messages) {
  if (!inquiriesList) return;
  const search = (inquiriesSearch?.value || "").toLowerCase().trim();
  const filtered = search
    ? messages.filter(m =>
        m.name.toLowerCase().includes(search) ||
        m.email.toLowerCase().includes(search) ||
        m.message.toLowerCase().includes(search) ||
        (m.subject && m.subject.toLowerCase().includes(search))
      )
    : messages;

  if (!filtered.length) {
    inquiriesList.innerHTML = '<div class="posts-empty">No contact messages received yet.</div>';
    return;
  }

  inquiriesList.innerHTML = filtered.map(msg => {
    const date = msg.date ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(msg.date)) : "Unknown date";
    return `
      <div class="inquiry-card">
        <div class="inquiry-header">
          <div>
            <span class="inquiry-name">${esc(msg.name)}</span>
            <a href="mailto:${esc(msg.email)}" class="inquiry-email">📧 ${esc(msg.email)}</a>
          </div>
          <div class="inquiry-meta">
            <span class="inquiry-date">${esc(date)}</span>
            <a href="mailto:${esc(msg.email)}?subject=Re:%20${encodeURIComponent(msg.subject || 'RYDA Inquiry')}" class="btn btn-outline btn-sm">
              Reply via Email ✉️
            </a>
          </div>
        </div>
        <div class="inquiry-subject"><strong>Subject:</strong> ${esc(msg.subject || 'General Inquiry')}</div>
        <div class="inquiry-body">${esc(msg.message)}</div>
      </div>
    `;
  }).join("");
}

if (inquiriesSearch) inquiriesSearch.addEventListener("input", () => renderInquiriesList(allInquiries));
if (refreshInquiriesBtn) refreshInquiriesBtn.addEventListener("click", fetchInquiries);

function showUploadStatus(msg, type) {
  if (!uploadStatus) return;
  uploadStatus.textContent = msg;
  uploadStatus.hidden = false;
  uploadStatus.className = "upload-status " + (type || "");
  if (type === "loading") uploadStatus.classList.add("is-loading");
}

// Handle URL parameter edit (?edit=post-id)
window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get("edit");
  if (editId) {
    loadPostForEdit(editId);
  }
});