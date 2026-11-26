/* ============================================================
   RYDA — Writer Panel Script v6.0 (World-Class Editorial Suite)
   Story Quotations, In-Body Photo Inserter, Drag-and-Drop Uploader,
   Inquiries Manager & Multi-Photo Gallery
   ============================================================ */
(function() {
"use strict";

const TOKEN_KEY = "ryda_writer_token";
const DRAFT_KEY = "ryda_writer_draft";
const VALID_TOKEN = "RYDA5555";

// ─── State ────────────────────────────────────────────────
let writerToken = typeof sessionStorage !== "undefined" ? (sessionStorage.getItem(TOKEN_KEY) || "") : "";
let allPosts = [];
let allInquiries = [];
let postViewMap = {};
let currentPanel = "new-post";
let isEditorPreview = false;
let uploadedImages = []; // [{ url: string, caption: string, credit: string }]
let editingPostId = null;
let savedRange = null;
let editingFigureEl = null; // If editing an existing inline <figure> in the modal

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

const sidebarEl         = document.querySelector(".sidebar");
const mobileSidebarBtn  = document.getElementById("mobile-sidebar-btn");
const sidebarBackdrop   = document.getElementById("sidebar-backdrop");

// Inline Photo Modal refs
const ipmModal          = document.getElementById("inline-photo-modal");
const ipmTitle          = document.getElementById("ipm-title");
const ipmClose          = document.getElementById("ipm-close");
const ipmCancel         = document.getElementById("ipm-cancel");
const ipmTabs           = document.querySelectorAll("[data-ipm-tab]");
const ipmPaneUpload     = document.getElementById("ipm-pane-upload");
const ipmPaneGallery    = document.getElementById("ipm-pane-gallery");
const ipmPaneUrl        = document.getElementById("ipm-pane-url");
const ipmDropzone       = document.getElementById("ipm-dropzone");
const ipmFileInput      = document.getElementById("ipm-file-input");
const ipmUploadStatus   = document.getElementById("ipm-upload-status");
const ipmGalGrid        = document.getElementById("ipm-gallery-grid");
const ipmGalCount       = document.getElementById("ipm-gal-count");
const ipmUrlInput       = document.getElementById("ipm-url-input");
const ipmUrlLoad        = document.getElementById("ipm-url-load");
const ipmPreviewBox     = document.getElementById("ipm-preview-box");
const ipmPreviewImg     = document.getElementById("ipm-preview-img");
const ipmCaption        = document.getElementById("ipm-caption");
const ipmCredit         = document.getElementById("ipm-credit");
const ipmLayout         = document.getElementById("ipm-layout");
const ipmInsertBtn      = document.getElementById("ipm-insert-btn");
let ipmSelectedUrl      = "";

const editorWordCount   = document.getElementById("editor-word-count");
const editorSaveStatus  = document.getElementById("editor-save-status");
const postsCatFilter    = document.getElementById("posts-cat-filter");
const postsSummaryBar   = document.getElementById("posts-summary-bar");
const newPostQuickBtn   = document.getElementById("new-post-quick-btn");
const adminHealthStatus = document.getElementById("admin-health-status");
const refreshHealthBtn  = document.getElementById("refresh-health-btn");
const exportPostsBtn    = document.getElementById("export-posts-btn");
const exportInqBtn      = document.getElementById("export-inquiries-btn");

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
  if (name === "analytics") fetchAnalytics();
  if (name === "admin-tools") refreshAdminHealth();
}

sbLinks.forEach(l => {
  l.addEventListener("click", () => {
    switchPanel(l.dataset.panel);
    if (sidebarEl) sidebarEl.classList.remove("is-open");
    if (sidebarBackdrop) sidebarBackdrop.hidden = true;
  });
});

if (mobileSidebarBtn && sidebarEl) {
  mobileSidebarBtn.addEventListener("click", () => {
    const open = sidebarEl.classList.toggle("is-open");
    if (sidebarBackdrop) sidebarBackdrop.hidden = !open;
  });
}
if (sidebarBackdrop && sidebarEl) {
  sidebarBackdrop.addEventListener("click", () => {
    sidebarEl.classList.remove("is-open");
    sidebarBackdrop.hidden = true;
  });
}

// ─── Selection & Clean HTML Helpers ───────────────────────
function saveEditorSelection() {
  if (!richEditor) return;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  if (!richEditor.contains(range.commonAncestorContainer)) return;
  const ancEl = range.commonAncestorContainer.nodeType === 1
    ? range.commonAncestorContainer
    : range.commonAncestorContainer.parentElement;
  if (ancEl && ancEl.closest && ancEl.closest(".inline-fig-controls, figure[contenteditable='false']")) return;
  savedRange = range.cloneRange();
}

function getCleanEditorHTML() {
  if (!richEditor) return "";
  const clone = richEditor.cloneNode(true);
  clone.querySelectorAll(".inline-fig-controls").forEach(el => el.remove());
  clone.querySelectorAll("figure[contenteditable]").forEach(el => el.removeAttribute("contenteditable"));
  return clone.innerHTML;
}

function createEmptyParagraph() {
  const p = document.createElement("p");
  p.appendChild(document.createElement("br"));
  return p;
}

function placeCaretAtStart(el) {
  if (!el) return;
  richEditor.focus();
  const sel = window.getSelection();
  const range = document.createRange();
  range.setStart(el, 0);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  savedRange = range.cloneRange();
}

function getTopLevelEditorBlock(node) {
  let cur = node && node.nodeType === 1 ? node : node?.parentElement;
  while (cur && cur !== richEditor && cur.parentElement !== richEditor) {
    cur = cur.parentElement;
  }
  return cur && cur !== richEditor ? cur : null;
}

function hasMeaningfulContent(node) {
  if (!node) return false;
  if (node.querySelector && node.querySelector("img, figure, blockquote, hr")) return true;
  return (node.textContent || "").replace(/\u00a0/g, " ").trim().length > 0;
}

// ─── Toolbar / Rich Editor Commands ───────────────────────
const toolBtns = document.querySelectorAll(".tool-btn");

toolBtns.forEach(btn => {
  btn.addEventListener("mousedown", e => {
    e.preventDefault();
    saveEditorSelection();
    execFormat(btn.dataset.cmd);
  });
});

function insertHTMLAtCursor(html, splitCurrentBlock = false) {
  if (!richEditor) return;

  // Build fragment from html
  const temp = document.createElement("div");
  temp.innerHTML = html.trim();
  const nodesToInsert = Array.from(temp.childNodes);
  if (!nodesToInsert.length) return;

  // Restore saved range if current selection isn't inside richEditor
  const sel = window.getSelection();
  let range = null;
  if (sel && sel.rangeCount > 0 && richEditor.contains(sel.getRangeAt(0).commonAncestorContainer)) {
    range = sel.getRangeAt(0);
  } else if (savedRange && richEditor.contains(savedRange.commonAncestorContainer)) {
    range = savedRange.cloneRange();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  // If splitting a paragraph/div block (e.g. inserting a photo or quote mid-paragraph)
  if (splitCurrentBlock && range) {
    const topBlock = getTopLevelEditorBlock(range.startContainer);
    if (topBlock && /^(P|DIV|H2|H3|H4)$/i.test(topBlock.tagName) && !topBlock.closest("blockquote, .testimony-card, figure")) {
      range.deleteContents();

      // Extract AFTER-cursor content FIRST so startContainer/startOffset on the left stay valid!
      const afterRange = document.createRange();
      afterRange.setStart(range.startContainer, range.startOffset);
      afterRange.setEnd(topBlock, topBlock.childNodes.length);
      const afterFrag = afterRange.extractContents();

      // Now extract BEFORE-cursor content safely
      const beforeRange = document.createRange();
      beforeRange.setStart(topBlock, 0);
      const safeEndNode = richEditor.contains(range.startContainer) ? range.startContainer : topBlock;
      const safeEndOffset = safeEndNode === topBlock
        ? topBlock.childNodes.length
        : Math.min(range.startOffset, safeEndNode.nodeType === 3 ? safeEndNode.length : safeEndNode.childNodes.length);
      beforeRange.setEnd(safeEndNode, safeEndOffset);
      const beforeFrag = beforeRange.extractContents();

      const beforeEl = document.createElement(topBlock.tagName === "DIV" ? "p" : topBlock.tagName.toLowerCase());
      beforeEl.appendChild(beforeFrag);

      const afterEl = document.createElement("p");
      afterEl.appendChild(afterFrag);

      const afterHasContent = hasMeaningfulContent(afterEl);
      const filteredNodes = afterHasContent
        ? nodesToInsert.filter((n, i) => !(i === nodesToInsert.length - 1 && n.tagName === "P" && !hasMeaningfulContent(n)))
        : nodesToInsert;

      const parent = topBlock.parentNode;
      if (hasMeaningfulContent(beforeEl)) {
        parent.insertBefore(beforeEl, topBlock);
      }

      let lastInserted = null;
      filteredNodes.forEach(n => {
        lastInserted = parent.insertBefore(n, topBlock);
      });

      let focusTarget = null;
      if (afterHasContent) {
        focusTarget = parent.insertBefore(afterEl, topBlock);
      } else {
        if (lastInserted && lastInserted.tagName === "P" && !hasMeaningfulContent(lastInserted)) {
          focusTarget = lastInserted;
        } else {
          focusTarget = parent.insertBefore(createEmptyParagraph(), topBlock);
        }
      }

      parent.removeChild(topBlock);
      decorateInlineFigures();
      placeCaretAtStart(focusTarget);
      syncHidden();
      saveDraft();
      return;
    }
  }

  // Standard insertion at range or end of editor
  richEditor.focus();
  if (range) {
    range.deleteContents();
    const frag = document.createDocumentFragment();
    let lastNode = null;
    nodesToInsert.forEach(n => {
      lastNode = frag.appendChild(n);
    });
    range.insertNode(frag);
    if (lastNode) {
      if (lastNode.tagName === "P") {
        placeCaretAtStart(lastNode);
      } else {
        range.setStartAfter(lastNode);
        range.collapse(true);
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
        savedRange = range.cloneRange();
      }
    }
  } else {
    let lastNode = null;
    nodesToInsert.forEach(n => {
      lastNode = richEditor.appendChild(n);
    });
    if (splitCurrentBlock && (!lastNode || lastNode.tagName !== "P")) {
      lastNode = richEditor.appendChild(createEmptyParagraph());
    }
    if (lastNode) placeCaretAtStart(lastNode);
  }

  decorateInlineFigures();
  syncHidden();
  saveDraft();
}

function buildInlineFigureHTML(url, caption = "", credit = "", layout = "center") {
  const alignClass = ["center", "wide", "left", "right"].includes(layout) ? `align-${layout}` : "align-center";
  const capText = (caption || "").trim();
  const credText = (credit || "").trim();
  const figcaptionHTML = (capText || credText)
    ? `<figcaption>${esc(capText)}${capText && credText ? ' ' : ''}${credText ? `<span class="photo-credit">${esc(credText)}</span>` : ''}</figcaption>`
    : "";
  return `<figure class="article-inline-image ${alignClass}" contenteditable="false"><img src="${esc(url)}" alt="${esc(capText || "Article photo")}" loading="lazy" />${figcaptionHTML}</figure><p><br></p>`;
}

function decorateInlineFigures() {
  if (!richEditor) return;
  richEditor.querySelectorAll("figure.article-inline-image").forEach(fig => {
    fig.setAttribute("contenteditable", "false");
    if (fig.querySelector(".inline-fig-controls")) return;

    const bar = document.createElement("div");
    bar.className = "inline-fig-controls";
    bar.setAttribute("contenteditable", "false");
    bar.innerHTML = `
      <button type="button" class="ifc-btn ifc-edit" title="Edit caption, credit or alignment">✏️ Edit Caption &amp; Size</button>
      <button type="button" class="ifc-btn ifc-up" title="Move photo up">↑</button>
      <button type="button" class="ifc-btn ifc-down" title="Move photo down">↓</button>
      <button type="button" class="ifc-btn ifc-para" title="Add paragraph below">↵ Text Below</button>
      <button type="button" class="ifc-btn ifc-del" title="Remove photo from body">✕</button>
    `;

    bar.querySelector(".ifc-edit").addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      openInlinePhotoModal({ figureEl: fig });
    });

    bar.querySelector(".ifc-up").addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      const prev = fig.previousElementSibling;
      if (prev && fig.parentNode) {
        fig.parentNode.insertBefore(fig, prev);
        syncHidden();
        saveDraft();
      }
    });

    bar.querySelector(".ifc-down").addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      const next = fig.nextElementSibling;
      if (next && fig.parentNode) {
        fig.parentNode.insertBefore(next, fig);
        syncHidden();
        saveDraft();
      }
    });

    bar.querySelector(".ifc-para").addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      const p = createEmptyParagraph();
      if (fig.nextSibling) fig.parentNode.insertBefore(p, fig.nextSibling);
      else fig.parentNode.appendChild(p);
      placeCaretAtStart(p);
      syncHidden();
      saveDraft();
    });

    bar.querySelector(".ifc-del").addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      fig.remove();
      syncHidden();
      saveDraft();
    });

    fig.insertBefore(bar, fig.firstChild);
  });
}

function execFormat(cmd) {
  if (!richEditor) return;
  richEditor.focus();

  switch (cmd) {
    case "undo":
      document.execCommand("undo");
      break;
    case "redo":
      document.execCommand("redo");
      break;
    case "bold":
      document.execCommand("bold");
      break;
    case "italic":
      document.execCommand("italic");
      break;
    case "underline":
      document.execCommand("underline");
      break;
    case "link": {
      const sel = window.getSelection();
      const hasSel = sel && sel.rangeCount > 0 && richEditor.contains(sel.anchorNode) && sel.toString().trim().length > 0;
      const url = prompt("Enter URL (https://...):", "https://");
      if (url && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/"))) {
        if (hasSel) {
          document.execCommand("createLink", false, url);
        } else {
          const text = prompt("Enter link text:", url) || url;
          insertHTMLAtCursor(`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(text)}</a> `, false);
        }
      }
      break;
    }
    case "hr":
      insertHTMLAtCursor(`<hr /><p><br></p>`, true);
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
      `, true);
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
      `, true);
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
      `, true);
      break;
    }
    case "insertInlinePhoto":
      openInlinePhotoModal();
      break;
    case "clear":
      document.execCommand("removeFormat");
      break;
  }
  syncHidden();
  updateToolbarState();
}

function insertInlinePhotoIntoBody(url, caption = "", credit = "", layout = "center") {
  if (!url) return;
  const figHtml = buildInlineFigureHTML(url, caption, credit, layout);
  insertHTMLAtCursor(figHtml, true);
  showUploadStatus("✓ Photo inserted cleanly into story body", "success");
}

// ─── Inline Photo Modal Logic ─────────────────────────────
function switchIpmTab(tabName) {
  ipmTabs.forEach(t => t.classList.toggle("is-active", t.dataset.ipmTab === tabName));
  if (ipmPaneUpload) { ipmPaneUpload.hidden = tabName !== "upload"; ipmPaneUpload.classList.toggle("is-active", tabName === "upload"); }
  if (ipmPaneGallery) { ipmPaneGallery.hidden = tabName !== "gallery"; ipmPaneGallery.classList.toggle("is-active", tabName === "gallery"); }
  if (ipmPaneUrl) { ipmPaneUrl.hidden = tabName !== "url"; ipmPaneUrl.classList.toggle("is-active", tabName === "url"); }
}

function setIpmSelectedPhoto(url, caption = "", credit = "") {
  ipmSelectedUrl = url || "";
  if (ipmPreviewImg && ipmPreviewBox) {
    if (ipmSelectedUrl) {
      ipmPreviewImg.src = ipmSelectedUrl;
      ipmPreviewBox.hidden = false;
    } else {
      ipmPreviewImg.src = "";
      ipmPreviewBox.hidden = true;
    }
  }
  if (caption && ipmCaption && !ipmCaption.value) ipmCaption.value = caption;
  if (credit && ipmCredit && !ipmCredit.value) ipmCredit.value = credit;
  if (ipmInsertBtn) ipmInsertBtn.disabled = !ipmSelectedUrl;
  renderIpmGallery();
}

function renderIpmGallery() {
  if (!ipmGalGrid) return;
  if (ipmGalCount) ipmGalCount.textContent = String(uploadedImages.length);
  if (!uploadedImages.length) {
    ipmGalGrid.innerHTML = '<div class="ipm-gallery-empty">No photos uploaded to this post yet. Use "Upload New Photo" or "Image URL".</div>';
    return;
  }
  ipmGalGrid.innerHTML = uploadedImages.map((imgObj, i) => `
    <button type="button" class="ipm-gal-item${imgObj.url === ipmSelectedUrl ? " is-selected" : ""}" data-ipm-gal-idx="${i}">
      <img src="${esc(imgObj.url)}" alt="${esc(imgObj.caption || `Photo ${i + 1}`)}">
      ${i === 0 ? '<span class="ipm-gal-badge">Cover</span>' : ''}
    </button>
  `).join("");

  ipmGalGrid.querySelectorAll("[data-ipm-gal-idx]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.ipmGalIdx, 10);
      const item = uploadedImages[idx];
      if (!item) return;
      if (ipmCaption) ipmCaption.value = item.caption || "";
      if (ipmCredit) ipmCredit.value = item.credit || "";
      setIpmSelectedPhoto(item.url);
    });
  });
}

function openInlinePhotoModal(opts = {}) {
  if (!ipmModal) return;
  editingFigureEl = opts.figureEl || null;
  ipmSelectedUrl = "";

  if (ipmUploadStatus) { ipmUploadStatus.hidden = true; ipmUploadStatus.textContent = ""; }
  if (ipmUrlInput) ipmUrlInput.value = "";
  if (ipmCaption) ipmCaption.value = opts.caption || "";
  if (ipmCredit) ipmCredit.value = opts.credit || "";
  if (ipmLayout) ipmLayout.value = opts.layout || "center";

  if (editingFigureEl) {
    const img = editingFigureEl.querySelector("img");
    const capEl = editingFigureEl.querySelector("figcaption");
    const credEl = editingFigureEl.querySelector(".photo-credit");
    const creditText = credEl ? credEl.textContent.trim() : "";
    let captionText = "";
    if (capEl) {
      const cloneCap = capEl.cloneNode(true);
      cloneCap.querySelectorAll(".photo-credit").forEach(el => el.remove());
      captionText = cloneCap.textContent.trim();
    }
    const cls = editingFigureEl.className || "";
    const alignMatch = cls.match(/align-(center|wide|left|right)/);
    if (ipmTitle) ipmTitle.textContent = "Edit Inline Story Photo";
    if (ipmInsertBtn) ipmInsertBtn.textContent = "✓ Save Photo Changes";
    if (ipmCaption) ipmCaption.value = captionText;
    if (ipmCredit) ipmCredit.value = creditText;
    if (ipmLayout) ipmLayout.value = alignMatch ? alignMatch[1] : "center";
    setIpmSelectedPhoto(img ? img.getAttribute("src") : "");
    switchIpmTab(uploadedImages.length ? "gallery" : "upload");
  } else {
    if (ipmTitle) ipmTitle.textContent = "Insert Photo in Story";
    if (ipmInsertBtn) ipmInsertBtn.textContent = "📷 Insert Photo at Cursor";
    if (opts.url) {
      setIpmSelectedPhoto(opts.url, opts.caption || "", opts.credit || "");
      switchIpmTab("gallery");
    } else {
      setIpmSelectedPhoto("");
      switchIpmTab("upload");
    }
  }

  renderIpmGallery();
  ipmModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeInlinePhotoModal() {
  if (!ipmModal) return;
  ipmModal.hidden = true;
  document.body.style.overflow = "";
  editingFigureEl = null;
}

if (ipmClose) ipmClose.addEventListener("click", closeInlinePhotoModal);
if (ipmCancel) ipmCancel.addEventListener("click", closeInlinePhotoModal);
if (ipmModal) {
  ipmModal.addEventListener("click", e => {
    if (e.target === ipmModal) closeInlinePhotoModal();
  });
}
ipmTabs.forEach(tab => {
  tab.addEventListener("click", () => switchIpmTab(tab.dataset.ipmTab));
});

async function uploadSingleInlineFile(file) {
  if (!file) return null;
  if (file.size > 6 * 1024 * 1024) {
    throw new Error(`File "${file.name}" is over the 6MB limit`);
  }
  if (!file.type.match(/^image\/(jpeg|png|webp|gif|avif)$/)) {
    throw new Error(`File "${file.name}" is not a supported image format`);
  }
  const formData = new FormData();
  formData.append("files", file);
  formData.append("token", writerToken);

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Upload failed");
  const url = (data.urls && data.urls[0]) || data.url;
  if (url) {
    uploadedImages.push({ url, caption: "", credit: "" });
    renderGallery();
  }
  return url;
}

if (ipmFileInput) {
  ipmFileInput.addEventListener("change", async () => {
    const file = ipmFileInput.files && ipmFileInput.files[0];
    ipmFileInput.value = "";
    if (!file) return;
    if (ipmUploadStatus) {
      ipmUploadStatus.hidden = false;
      ipmUploadStatus.className = "ipm-status is-loading";
      ipmUploadStatus.textContent = `↑ Uploading "${file.name}"...`;
    }
    try {
      const url = await uploadSingleInlineFile(file);
      if (ipmUploadStatus) {
        ipmUploadStatus.className = "ipm-status success";
        ipmUploadStatus.textContent = "✓ Photo uploaded! Add a caption below and click Insert.";
      }
      setIpmSelectedPhoto(url);
    } catch (err) {
      if (ipmUploadStatus) {
        ipmUploadStatus.className = "ipm-status error";
        ipmUploadStatus.textContent = "✗ " + (err.message || "Upload failed");
      }
    }
  });
}

if (ipmDropzone) {
  ipmDropzone.addEventListener("dragover", e => { e.preventDefault(); ipmDropzone.classList.add("is-dragover"); });
  ipmDropzone.addEventListener("dragleave", () => ipmDropzone.classList.remove("is-dragover"));
  ipmDropzone.addEventListener("drop", async e => {
    e.preventDefault();
    ipmDropzone.classList.remove("is-dragover");
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file) return;
    if (ipmUploadStatus) {
      ipmUploadStatus.hidden = false;
      ipmUploadStatus.className = "ipm-status is-loading";
      ipmUploadStatus.textContent = `↑ Uploading "${file.name}"...`;
    }
    try {
      const url = await uploadSingleInlineFile(file);
      if (ipmUploadStatus) {
        ipmUploadStatus.className = "ipm-status success";
        ipmUploadStatus.textContent = "✓ Photo uploaded! Add a caption below and click Insert.";
      }
      setIpmSelectedPhoto(url);
    } catch (err) {
      if (ipmUploadStatus) {
        ipmUploadStatus.className = "ipm-status error";
        ipmUploadStatus.textContent = "✗ " + (err.message || "Upload failed");
      }
    }
  });
}

if (ipmUrlLoad && ipmUrlInput) {
  ipmUrlLoad.addEventListener("click", () => {
    const u = ipmUrlInput.value.trim();
    if (!u) return;
    if (!u.startsWith("http://") && !u.startsWith("https://") && !u.startsWith("/api/")) {
      alert("Please enter a valid HTTP, HTTPS, or /api/ image URL.");
      return;
    }
    if (!uploadedImages.some(x => x.url === u)) {
      uploadedImages.push({ url: u, caption: "", credit: "" });
      renderGallery();
    }
    setIpmSelectedPhoto(u);
  });
}

if (ipmInsertBtn) {
  ipmInsertBtn.addEventListener("click", () => {
    if (!ipmSelectedUrl) return;
    const cap = (ipmCaption?.value || "").trim();
    const cred = (ipmCredit?.value || "").trim();
    const layout = ipmLayout?.value || "center";

    // Sync caption/credit back to gallery entry if present
    const matchGal = uploadedImages.find(x => x.url === ipmSelectedUrl);
    if (matchGal) {
      if (cap && !matchGal.caption) matchGal.caption = cap;
      if (cred && !matchGal.credit) matchGal.credit = cred;
      renderGallery();
    }

    if (editingFigureEl) {
      const tmp = document.createElement("div");
      tmp.innerHTML = buildInlineFigureHTML(ipmSelectedUrl, cap, cred, layout);
      const newFig = tmp.querySelector("figure");
      if (newFig && editingFigureEl.parentNode) {
        editingFigureEl.parentNode.replaceChild(newFig, editingFigureEl);
        decorateInlineFigures();
        syncHidden();
        saveDraft();
        showUploadStatus("✓ Inline photo updated", "success");
      }
    } else {
      insertInlinePhotoIntoBody(ipmSelectedUrl, cap, cred, layout);
    }
    closeInlinePhotoModal();
  });
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
  if (contentHidden && richEditor) contentHidden.value = getCleanEditorHTML();
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
  richEditor.addEventListener("input", () => { saveEditorSelection(); syncHidden(); saveDraft(); });
  richEditor.addEventListener("keyup", () => { saveEditorSelection(); updateToolbarState(); });
  richEditor.addEventListener("mouseup", () => { saveEditorSelection(); updateToolbarState(); });
  richEditor.addEventListener("focus", saveEditorSelection);
  richEditor.addEventListener("blur", saveEditorSelection);
  richEditor.addEventListener("keydown", e => {
    if (e.key === "Tab") { e.preventDefault(); document.execCommand("insertText", false, "    "); }
  });

  // Direct image paste inside rich editor
  richEditor.addEventListener("paste", async e => {
    const items = Array.from(e.clipboardData?.items || []);
    const imgItem = items.find(it => it.type && it.type.startsWith("image/"));
    if (!imgItem) return;
    e.preventDefault();
    saveEditorSelection();
    const file = imgItem.getAsFile();
    if (!file) return;
    showUploadStatus("↑ Uploading pasted photo...", "loading");
    try {
      const url = await uploadSingleInlineFile(file);
      if (url) {
        insertInlinePhotoIntoBody(url, "", "");
        showUploadStatus("✓ Pasted photo inserted at cursor! Click '✏️ Edit Caption & Size' to add a caption.", "success");
      }
    } catch (err) {
      showUploadStatus("✗ " + (err.message || "Paste upload failed"), "error");
    }
  });

  // Direct image drag-and-drop inside rich editor at drop point
  richEditor.addEventListener("dragover", e => {
    if (e.dataTransfer && Array.from(e.dataTransfer.types || []).includes("Files")) {
      e.preventDefault();
      richEditor.classList.add("is-drop-target");
    }
  });
  richEditor.addEventListener("dragleave", () => richEditor.classList.remove("is-drop-target"));
  richEditor.addEventListener("drop", async e => {
    richEditor.classList.remove("is-drop-target");
    const files = Array.from(e.dataTransfer?.files || []).filter(f => f.type && f.type.startsWith("image/"));
    if (!files.length) return;
    e.preventDefault();

    // Place caret at drop coordinates if browser supports it
    if (document.caretRangeFromPoint) {
      const dropRange = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (dropRange && richEditor.contains(dropRange.commonAncestorContainer)) {
        savedRange = dropRange;
      }
    }
    showUploadStatus(`↑ Uploading ${files.length} dropped photo(s)...`, "loading");
    for (const file of files) {
      try {
        const url = await uploadSingleInlineFile(file);
        if (url) insertInlinePhotoIntoBody(url, "", "");
      } catch (err) {
        showUploadStatus("✗ " + (err.message || "Drop upload failed"), "error");
      }
    }
  });
}

document.addEventListener("selectionchange", () => {
  if (document.activeElement === richEditor) saveEditorSelection();
});

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
        if (img) {
          if (img.caption || img.credit) {
            insertInlinePhotoIntoBody(img.url, img.caption, img.credit, "center");
          } else {
            openInlinePhotoModal({ url: img.url, caption: img.caption, credit: img.credit });
          }
        }
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
function updateEditorWordCount() {
  if (!editorWordCount || !richEditor) return;
  const text = (richEditor.innerText || "").trim();
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const mins = Math.max(1, Math.ceil(words / 200));
  editorWordCount.textContent = `${words.toLocaleString("en-US")} word${words === 1 ? "" : "s"} · ${mins} min read`;
}

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
      content_html: getCleanEditorHTML(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    if (editorSaveStatus) {
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      editorSaveStatus.textContent = `✓ Saved ${now}`;
    }
    updateEditorWordCount();
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
      decorateInlineFigures();
      syncHidden();
    }
    updateEditorWordCount();
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
  const content  = getCleanEditorHTML();

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
    const contentHtml = getCleanEditorHTML().trim();

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
    const [res, viewsRes] = await Promise.all([
      fetch("/api/posts"),
      fetch("/api/views?all=1", { cache: "no-store" }).catch(() => null),
    ]);
    if (!res.ok) throw new Error("Failed to fetch");

    const data = await res.json();
    allPosts = Array.isArray(data) ? data : (data.posts || []);
    try { postViewMap = viewsRes && viewsRes.ok ? await viewsRes.json() : {}; } catch { postViewMap = {}; }
    renderPostsList(allPosts);
  } catch (err) {
    console.error("Fetch error:", err);
    postsList.innerHTML = '<div class="posts-empty">Could not load posts. ' + esc(err.message) + '</div>';
  }
}

function renderPostsList(posts) {
  if (!postsList) return;
  const search = (postsSearch?.value || "").toLowerCase().trim();
  const catVal = (postsCatFilter?.value || "").toLowerCase().trim();

  if (postsSummaryBar) {
    const totalViews = posts.reduce((acc, p) => acc + Number(postViewMap[p.id] || 0), 0);
    const storyCount = posts.filter(p => (p.category || "").toLowerCase().includes("stor")).length;
    const photoCount = posts.reduce((acc, p) => acc + ((p.images && p.images.length) || (p.featured_image ? 1 : 0)), 0);
    postsSummaryBar.innerHTML = `
      <span class="psb-pill"><strong>${posts.length}</strong> Total Posts</span>
      <span class="psb-pill"><strong>${storyCount}</strong> Stories</span>
      <span class="psb-pill"><strong>${photoCount}</strong> Photos</span>
      <span class="psb-pill"><strong>${totalViews.toLocaleString("en-US")}</strong> Total Views</span>
    `;
    postsSummaryBar.hidden = false;
  }

  const filtered = posts.filter(p => {
    const matchSearch = !search ||
      (p.title && p.title.toLowerCase().includes(search)) ||
      (p.category && p.category.toLowerCase().includes(search)) ||
      (p.author && p.author.toLowerCase().includes(search));
    const matchCat = !catVal || (p.category && p.category.toLowerCase().replace(/s$/, "") === catVal.replace(/s$/, ""));
    return matchSearch && matchCat;
  });

  if (!filtered.length) {
    postsList.innerHTML = '<div class="posts-empty">No posts match your search or category filter.</div>';
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

  postsList.querySelectorAll("[data-dup-id]").forEach(btn => {
    btn.addEventListener("click", () => duplicatePostToEditor(btn.dataset.dupId));
  });

  postsList.querySelectorAll("[data-copy-url]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const fullUrl = window.location.origin + btn.dataset.copyUrl;
      try {
        await navigator.clipboard.writeText(fullUrl);
        const old = btn.textContent;
        btn.textContent = "✓ Copied";
        setTimeout(() => { btn.textContent = old; }, 1600);
      } catch {
        prompt("Copy article URL:", fullUrl);
      }
    });
  });
}

function buildPostRow(post) {
  const dateStr = post.date || post.createdAt || "";
  const date = dateStr ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(dateStr)) : "No date";
  const titleSafe = esc(post.title);
  const catSafe   = esc(post.category);
  const authSafe  = esc(post.author);
  const imageCount = (post.images && post.images.length) || (post.featured_image ? 1 : 0);
  const thumbUrl = post.featured_image || (Array.isArray(post.images) && post.images[0]?.url) || "";
  const views = Number(postViewMap[post.id] || 0);
  const href = `/newsroom/${encodeURIComponent(post.slug || post.id)}`;
  return `
  <div class="post-row post-row-with-thumb">
    <div class="post-row-thumb">
      ${thumbUrl ? `<img src="${esc(thumbUrl)}" alt="" loading="lazy">` : `<span class="post-row-thumb-empty">RYDA</span>`}
    </div>
    <div class="post-row-info">
      <span class="post-row-badge">${catSafe}</span> ${imageCount > 0 ? `<span class="post-row-badge" style="background:rgba(200,149,42,0.18);color:#C8952A;">${imageCount} photo${imageCount > 1 ? 's' : ''}</span>` : ''}
      <div class="post-row-title" title="${titleSafe}">${titleSafe}</div>
      <div class="post-row-meta">${authSafe} · ${esc(date)} · <span class="post-row-views">👁 ${views.toLocaleString("en-US")} view${views === 1 ? "" : "s"}</span></div>
    </div>
    <div class="post-row-actions">
      <a class="btn btn-outline btn-sm" href="${href}" target="_blank" rel="noopener">View ↗</a>
      <button class="btn btn-outline btn-sm" type="button" data-copy-url="${esc(href)}" title="Copy public article link">🔗 Copy</button>
      <button class="btn btn-outline btn-sm" type="button" data-edit-id="${esc(post.id)}">✏️ Edit</button>
      <button class="btn btn-outline btn-sm" type="button" data-dup-id="${esc(post.id)}" title="Clone into a new draft">📋 Clone</button>
      <button class="btn btn-danger" type="button"
        data-delete-id="${esc(post.id)}"
        data-delete-title="${titleSafe}">Delete</button>
    </div>
  </div>`;
}

async function duplicatePostToEditor(id) {
  await loadPostForEdit(id);
  editingPostId = null;
  const titleEl = document.getElementById("f-title");
  if (titleEl && titleEl.value) titleEl.value = `${titleEl.value} (Copy)`;
  if (publishBtnText) publishBtnText.textContent = "Publish Post";
  if (editingBanner) editingBanner.hidden = true;
  if (editorPanelHeading) editorPanelHeading.textContent = "Publish Story or Article (Cloned Draft)";
  if (editorPanelSub) editorPanelSub.textContent = "Cloned from existing post — update details and publish as a new story.";
  saveDraft();
  showFeedback("Cloned post into a new draft. Edit and click Publish Post.", "success");
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
      decorateInlineFigures();
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

  const currentToken = writerToken || (typeof sessionStorage !== "undefined" ? sessionStorage.getItem(TOKEN_KEY) : "");
  const btn = document.querySelector(`[data-delete-id="${CSS.escape(id)}"]`);
  const originalText = btn ? btn.textContent : "Delete";
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Deleting…";
  }

  try {
    const res = await fetch(`/api/posts/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "x-writer-token": currentToken }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Delete failed");

    allPosts = allPosts.filter(p => p.id !== id && p.slug !== id);
    renderPostsList(allPosts);

    if (editingPostId === id) {
      clearForm();
    }
  } catch (err) {
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalText;
    }
    alert("Failed to delete post: " + (err.message || "Unknown error"));
  }
}


if (postsSearch) postsSearch.addEventListener("input", () => renderPostsList(allPosts));
if (postsCatFilter) postsCatFilter.addEventListener("change", () => renderPostsList(allPosts));
if (refreshPostsBtn) refreshPostsBtn.addEventListener("click", fetchPosts);
if (newPostQuickBtn) newPostQuickBtn.addEventListener("click", () => {
  clearForm();
  switchPanel("new-post");
});

// ─── Audience & Views Analytics ───────────────────────────
const analyticsRoot = document.getElementById("analytics-root");
const analyticsRange = document.getElementById("an-range");
const refreshAnalyticsBtn = document.getElementById("refresh-analytics");

const fmtN = (n) => Number(n || 0).toLocaleString("en-US");
const COUNTRY_NAMES = (() => {
  try { return new Intl.DisplayNames(["en"], { type: "region" }); } catch { return null; }
})();
const countryLabel = (code) => {
  if (!code) return "Unknown";
  let flag = "";
  try { flag = code.length === 2 ? String.fromCodePoint(...[...code.toUpperCase()].map(c => 127397 + c.charCodeAt(0))) + " " : ""; } catch {}
  let name = code;
  try { name = (COUNTRY_NAMES && COUNTRY_NAMES.of(code)) || code; } catch {}
  return flag + name;
};

async function fetchAnalytics() {
  if (!analyticsRoot) return;
  analyticsRoot.innerHTML = '<div class="posts-loading">Loading audience statistics…</div>';
  const days = analyticsRange ? analyticsRange.value : "14";
  const token = writerToken || (typeof sessionStorage !== "undefined" ? sessionStorage.getItem(TOKEN_KEY) : "") || "";
  try {
    const [statsRes, postsRes] = await Promise.all([
      fetch(`/api/views?stats=1&days=${encodeURIComponent(days)}`, { headers: { "x-writer-token": token }, cache: "no-store" }),
      allPosts.length ? Promise.resolve(null) : fetch("/api/posts"),
    ]);
    if (!statsRes.ok) throw new Error(statsRes.status === 401 ? "Unauthorized — please log in again." : "Failed to load statistics");
    const stats = await statsRes.json();
    if (postsRes && postsRes.ok) {
      const d = await postsRes.json();
      allPosts = Array.isArray(d) ? d : (d.posts || []);
    }
    renderAnalytics(stats);
  } catch (err) {
    analyticsRoot.innerHTML = '<div class="posts-empty">Could not load statistics. ' + esc(err.message) + '</div>';
  }
}

function barList(items, labelFn, emptyText) {
  if (!items || !items.length) return `<div class="an-empty">${esc(emptyText)}</div>`;
  const max = Math.max(...items.map(i => i.count), 1);
  return items.map(i => `
    <div class="an-bar-row">
      <div class="an-bar-label" title="${esc(labelFn(i.key))}">${esc(labelFn(i.key))}</div>
      <div class="an-bar-track"><div class="an-bar-fill" style="width:${Math.max(3, (i.count / max) * 100)}%"></div></div>
      <div class="an-bar-val">${fmtN(i.count)}</div>
    </div>`).join("");
}

function renderTrendChart(daily) {
  const W = 760, H = 220, padL = 40, padR = 12, padT = 16, padB = 30;
  const n = daily.length;
  const series = daily.map(d => ({ date: d.date, reads: d.article, pages: d.page + d.article, writer: d.writer, unique: d.unique }));
  const max = Math.max(5, ...series.map(s => s.pages));
  const niceMax = Math.ceil(max / 5) * 5;
  const x = (i) => padL + (n === 1 ? (W - padL - padR) / 2 : (i * (W - padL - padR)) / (n - 1));
  const y = (v) => padT + (H - padT - padB) * (1 - v / niceMax);
  const line = (key) => series.map((s, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(s[key]).toFixed(1)}`).join(" ");
  const area = (key) => `${line(key)} L${x(n - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
  const grid = [0, 0.25, 0.5, 0.75, 1].map(f => {
    const v = Math.round(niceMax * f);
    return `<line x1="${padL}" x2="${W - padR}" y1="${y(v)}" y2="${y(v)}" class="an-grid"/><text x="${padL - 8}" y="${y(v) + 4}" class="an-axis" text-anchor="end">${fmtN(v)}</text>`;
  }).join("");
  const step = Math.ceil(n / 7);
  const labels = series.map((s, i) => (i % step === 0 || i === n - 1)
    ? `<text x="${x(i)}" y="${H - 8}" class="an-axis" text-anchor="middle">${new Date(s.date + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}</text>` : "").join("");
  const dots = series.map((s, i) => `<circle cx="${x(i)}" cy="${y(s.reads)}" r="3.2" class="an-dot"><title>${s.date}\nArticle reads: ${fmtN(s.reads)}\nAll views: ${fmtN(s.pages)}\nUnique visitors: ${fmtN(s.unique)}\nWriter panel: ${fmtN(s.writer)}</title></circle>`).join("");
  return `
    <svg viewBox="0 0 ${W} ${H}" class="an-chart" role="img" aria-label="Daily views trend">
      <defs>
        <linearGradient id="anGradA" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#0FA693" stop-opacity="0.35"/><stop offset="100%" stop-color="#0FA693" stop-opacity="0"/></linearGradient>
        <linearGradient id="anGradB" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#C8952A" stop-opacity="0.18"/><stop offset="100%" stop-color="#C8952A" stop-opacity="0"/></linearGradient>
      </defs>
      ${grid}
      <path d="${area("pages")}" fill="url(#anGradB)"/>
      <path d="${line("pages")}" class="an-line-b"/>
      <path d="${area("reads")}" fill="url(#anGradA)"/>
      <path d="${line("reads")}" class="an-line-a"/>
      ${dots}
      ${labels}
    </svg>
    <div class="an-legend"><span><i style="background:#0FA693"></i>Article reads</span><span><i style="background:#C8952A"></i>All site views</span></div>`;
}

function renderAnalytics(s) {
  const t = s.totals || {};
  const daily = s.daily || [];
  const rangeReads = daily.reduce((a, d) => a + d.article, 0);
  const rangeViews = daily.reduce((a, d) => a + d.article + d.page, 0);
  const rangeWriter = daily.reduce((a, d) => a + d.writer, 0);
  const today = daily[daily.length - 1] || { article: 0, page: 0, writer: 0, unique: 0 };

  // Map post ids to titles
  const byId = {};
  allPosts.forEach(p => { if (p.id) byId[p.id] = p; if (p.slug) byId[p.slug] = p; });
  const posts = (s.posts || [])
    .filter(p => byId[p.id])
    .sort((a, b) => b.views - a.views);
  const avgPerArticle = posts.length ? Math.round(posts.reduce((a, p) => a + p.views, 0) / posts.length) : 0;
  const unread = allPosts.filter(p => !(s.posts || []).some(x => x.id === p.id)).length;

  const kpi = (label, value, sub, accent) => `
    <div class="an-kpi ${accent || ""}">
      <div class="an-kpi-label">${label}</div>
      <div class="an-kpi-value">${value}</div>
      <div class="an-kpi-sub">${sub}</div>
    </div>`;

  const rows = posts.slice(0, 25).map((p, i) => {
    const post = byId[p.id];
    const href = `/newsroom/${encodeURIComponent(post.slug || post.id)}`;
    const share = t.articleViews ? ((p.views / t.articleViews) * 100).toFixed(1) : "0.0";
    return `
      <tr>
        <td class="an-rank">${i + 1}</td>
        <td class="an-title-cell"><a href="${href}" target="_blank" rel="noopener">${esc(post.title)}</a><span>${esc(post.category || "")} · ${esc(post.author || "RYDA Team")}</span></td>
        <td class="an-num"><strong>${fmtN(p.views)}</strong></td>
        <td class="an-num">${fmtN(p.unique)}</td>
        <td class="an-num">${p.week ? `<span class="an-up">+${fmtN(p.week)}</span>` : "—"}</td>
        <td class="an-num an-share"><div class="an-share-bar"><div style="width:${share}%"></div></div>${share}%</td>
      </tr>`;
  }).join("");

  analyticsRoot.innerHTML = `
    <div class="an-kpis">
      ${kpi("Article reads", fmtN(t.articleViews), `${fmtN(rangeReads)} in selected range · ${fmtN(today.article)} today`, "is-teal")}
      ${kpi("Unique readers", fmtN(t.uniqueReaders), "Distinct people who read at least one article", "is-gold")}
      ${kpi("Total site views", fmtN(t.allViews), `${fmtN(rangeViews)} in range · ${fmtN(t.uniqueVisitors)} unique visitors`)}
      ${kpi("Writer panel visits", fmtN(t.writerVisits), `${fmtN(rangeWriter)} in range · ${fmtN(t.uniqueWriters)} unique devices`)}
    </div>

    <div class="an-card">
      <div class="an-card-head"><h3>Daily traffic</h3><span class="an-muted">Hover points for details · UTC days</span></div>
      ${renderTrendChart(daily)}
    </div>

    <div class="an-card">
      <div class="an-card-head">
        <h3>Most-read articles</h3>
        <span class="an-muted">${fmtN(posts.length)} articles with readers · avg ${fmtN(avgPerArticle)} views/article${unread ? ` · ${unread} not yet read` : ""}</span>
      </div>
      ${rows ? `
      <div class="an-table-wrap">
        <table class="an-table">
          <thead><tr><th>#</th><th>Article</th><th class="an-num">Views</th><th class="an-num">Unique</th><th class="an-num">Last 7d</th><th class="an-num">Share</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>` : '<div class="an-empty">No article reads recorded yet. Views will appear here as soon as readers open articles.</div>'}
    </div>

    <div class="an-grid3">
      <div class="an-card"><div class="an-card-head"><h3>Traffic sources</h3></div>${barList(s.referrers, k => k, "No referral data yet.")}</div>
      <div class="an-card"><div class="an-card-head"><h3>Top countries</h3></div>${barList(s.countries, countryLabel, "No location data yet.")}</div>
      <div class="an-card"><div class="an-card-head"><h3>Devices</h3></div>${barList(s.devices, k => k, "No device data yet.")}
        <div class="an-card-head" style="margin-top:18px"><h3>Top pages</h3></div>${barList(s.topPages, k => k, "No page views yet.")}
      </div>
    </div>

    <p class="an-foot">Storage: <code>${esc(s.storage)}</code> · Updated ${esc(new Date(s.generatedAt).toLocaleString())} · Repeat visits to the same page within 30 minutes count once. Search-engine bots and link-preview crawlers are excluded.</p>
  `;
}

if (refreshAnalyticsBtn) refreshAnalyticsBtn.addEventListener("click", fetchAnalytics);
if (analyticsRange) analyticsRange.addEventListener("change", fetchAnalytics);

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
            <button type="button" class="btn btn-danger" data-del-inq="${esc(msg.id)}" title="Delete this message">Delete</button>
          </div>
        </div>
        <div class="inquiry-subject"><strong>Subject:</strong> ${esc(msg.subject || 'General Inquiry')}</div>
        <div class="inquiry-body">${esc(msg.message)}</div>
      </div>
    `;
  }).join("");

  inquiriesList.querySelectorAll("[data-del-inq]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.delInq;
      if (!id || !confirm("Delete this inquiry message?")) return;
      try {
        const res = await fetch(`/api/contact?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: { "x-writer-token": writerToken }
        });
        if (!res.ok) throw new Error("Delete failed");
        allInquiries = allInquiries.filter(m => m.id !== id);
        renderInquiriesList(allInquiries);
        if (inquiriesCountBadge) {
          inquiriesCountBadge.textContent = String(allInquiries.length);
          inquiriesCountBadge.hidden = allInquiries.length === 0;
        }
      } catch (err) {
        alert("Failed to delete message: " + err.message);
      }
    });
  });
}

if (inquiriesSearch) inquiriesSearch.addEventListener("input", () => renderInquiriesList(allInquiries));
if (refreshInquiriesBtn) refreshInquiriesBtn.addEventListener("click", fetchInquiries);

// ─── Admin Tools, Health & Backup ─────────────────────────
async function refreshAdminHealth() {
  if (!adminHealthStatus) return;
  adminHealthStatus.innerHTML = "Checking live database, views, and storage…";
  const token = writerToken || (typeof sessionStorage !== "undefined" ? sessionStorage.getItem(TOKEN_KEY) : "") || "";
  try {
    const [postsRes, statsRes] = await Promise.all([
      fetch("/api/posts", { cache: "no-store" }),
      fetch("/api/views?stats=1&days=14", { headers: { "x-writer-token": token }, cache: "no-store" }).catch(() => null),
    ]);
    const posts = postsRes.ok ? await postsRes.json() : [];
    const stats = statsRes && statsRes.ok ? await statsRes.json() : null;
    allPosts = Array.isArray(posts) ? posts : [];
    const storageMode = stats?.storage || "unknown";
    const isPersistent = String(storageMode).toLowerCase().includes("redis");
    adminHealthStatus.innerHTML = `
      <div class="health-grid">
        <div class="health-stat">
          <span class="health-label">Storage Engine</span>
          <strong class="${isPersistent ? "health-ok" : "health-warn"}">${esc(storageMode)}</strong>
        </div>
        <div class="health-stat">
          <span class="health-label">Active Posts</span>
          <strong>${allPosts.length}</strong>
        </div>
        <div class="health-stat">
          <span class="health-label">Total Article Views</span>
          <strong>${fmtN(stats?.totals?.articleViews || 0)}</strong>
        </div>
        <div class="health-stat">
          <span class="health-label">Unique Visitors</span>
          <strong>${fmtN(stats?.totals?.uniqueVisitors || 0)}</strong>
        </div>
      </div>
    `;
  } catch (err) {
    adminHealthStatus.innerHTML = `<span style="color:var(--danger)">Could not check system status: ${esc(err.message)}</span>`;
  }
}

function downloadJsonFile(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

if (refreshHealthBtn) refreshHealthBtn.addEventListener("click", refreshAdminHealth);
if (exportPostsBtn) {
  exportPostsBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/posts", { cache: "no-store" });
      const data = await res.json();
      const dateTag = new Date().toISOString().slice(0, 10);
      downloadJsonFile(`ryda-posts-backup-${dateTag}.json`, data);
    } catch (err) {
      alert("Export failed: " + err.message);
    }
  });
}
if (exportInqBtn) {
  exportInqBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/contact", { headers: { "x-writer-token": writerToken }, cache: "no-store" });
      const data = await res.json();
      const dateTag = new Date().toISOString().slice(0, 10);
      downloadJsonFile(`ryda-inquiries-backup-${dateTag}.json`, data);
    } catch (err) {
      alert("Export failed: " + err.message);
    }
  });
}

function showUploadStatus(msg, type) {
  if (!uploadStatus) return;
  uploadStatus.textContent = msg;
  uploadStatus.hidden = false;
  uploadStatus.className = "upload-status " + (type || "");
  if (type === "loading") uploadStatus.classList.add("is-loading");
}

// Handle URL parameter edit (?edit=post-id)
function initWriter() {
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get("edit");
  if (editId) {
    loadPostForEdit(editId);
  }
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initWriter);
} else {
  initWriter();
}
})();