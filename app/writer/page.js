import Script from 'next/script';
import './writer.css';

export const metadata = {
  title: 'RYDA Writer Panel — Publish News, Stories & Updates',
};

const rawHTML = `
  <!-- ═══ LOGIN GATE ═══════════════════════════════════════════════════════ -->
  <div class="login-screen" id="login-screen">
    <div class="login-card">
      <div class="login-brand">
        <img src="/assets/ryda-logo.svg" alt="RYDA" width="48" height="48">
        <div>
          <div class="login-title">RYDA</div>
          <div class="login-sub">Writer &amp; Publishing Portal</div>
        </div>
      </div>
      <p class="login-desc">Enter your authorized writer token to access the publishing dashboard.</p>
      <form id="login-form" novalidate>
        <div class="login-field">
          <label for="token-input">Access Token</label>
          <div style="position:relative;display:flex;align-items:center;">
            <input id="token-input" type="password" placeholder="••••••••••••" autocomplete="current-password" required style="padding-right:42px;width:100%;">
            <button type="button" id="toggle-pw-btn" style="position:absolute;right:10px;background:none;border:none;color:var(--on-bg-dim);cursor:pointer;font-size:1.1rem;padding:4px;" title="Show/Hide Password">👁️</button>
          </div>
        </div>
        <button class="btn btn-primary btn-full" type="submit" id="login-btn">
          <span id="login-btn-text">Access Dashboard</span>
          <span id="login-spinner" class="spinner" hidden></span>
        </button>
        <p class="login-error" id="login-error" hidden>Incorrect token. Please enter the valid RYDA writer token.</p>
      </form>
    </div>
  </div>

  <!-- ═══ WRITER DASHBOARD ═════════════════════════════════════════════════ -->
  <div class="dashboard" id="dashboard" hidden style="display: none !important;">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <img src="/assets/ryda-logo.svg" alt="" width="36" height="36" aria-hidden="true">
        <div>
          <span class="sb-title">RYDA</span>
          <span class="sb-sub">Writer Panel</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <button class="sb-link is-active" data-panel="new-post" type="button">
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M14.5 2.5L17.5 5.5L7 16H4V13L14.5 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
          New Story / Post
        </button>
        <button class="sb-link" data-panel="all-posts" type="button">
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M6.5 8.5H13.5M6.5 12H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          All Published Posts
        </button>
        <button class="sb-link" data-panel="analytics" type="button">
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M3 17V10M8 17V5M13 17V8M18 17V3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
          Audience &amp; Views
        </button>
        <button class="sb-link" data-panel="inquiries" type="button" id="sb-inquiries-link">
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M3 4H17C17.55 4 18 4.45 18 5V15C18 15.55 17.55 16 17 16H3C2.45 16 2 15.55 2 15V5C2 4.45 2.45 4 3 4Z" stroke="currentColor" stroke-width="1.5"/><path d="M2 5L10 11L18 5" stroke="currentColor" stroke-width="1.5"/></svg>
          Inquiries &amp; Messages
          <span class="badge-count" id="inquiries-count" hidden>0</span>
        </button>
        <button class="sb-link" data-panel="guidelines" type="button">
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M10 2L12.4 7.2L18 8.1L14 12L15 17.5L10 15L5 17.5L6 12L2 8.1L7.6 7.2L10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
          Guidelines
        </button>
        <button class="sb-link" data-panel="admin-tools" type="button">
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M10 13a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" stroke-width="1.5"/><path d="M16.2 12a1.4 1.4 0 00.28 1.54l.05.05a1.7 1.7 0 11-2.4 2.4l-.05-.05a1.4 1.4 0 00-1.54-.28 1.4 1.4 0 00-.84 1.28V17a1.7 1.7 0 11-3.4 0v-.08a1.4 1.4 0 00-.91-1.28 1.4 1.4 0 00-1.54.28l-.05.05a1.7 1.7 0 11-2.4-2.4l.05-.05a1.4 1.4 0 00.28-1.54 1.4 1.4 0 00-1.28-.84H3a1.7 1.7 0 110-3.4h.08a1.4 1.4 0 001.28-.91 1.4 1.4 0 00-.28-1.54l-.05-.05a1.7 1.7 0 112.4-2.4l.05.05a1.4 1.4 0 001.54.28h.07a1.4 1.4 0 00.84-1.28V3a1.7 1.7 0 113.4 0v.08a1.4 1.4 0 00.84 1.28 1.4 1.4 0 001.54-.28l.05-.05a1.7 1.7 0 112.4 2.4l-.05.05a1.4 1.4 0 00-.28 1.54v.07a1.4 1.4 0 001.28.84H17a1.7 1.7 0 110 3.4h-.08a1.4 1.4 0 00-1.28.84z" stroke="currentColor" stroke-width="1.3"/></svg>
          Admin Tools &amp; Backup
        </button>
      </nav>

      <div class="sidebar-footer">
        <a href="/" class="sb-link" target="_blank">
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M3 10H17M3 5H17M3 15H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          View Website
        </a>
        <button class="sb-link sb-logout" type="button" id="logout-btn">
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M13 3H17V17H13M8 7L3 10L8 13M3 10H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Log Out
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="main-panel">
      <div class="mobile-topbar">
        <button type="button" class="mobile-menu-btn" id="mobile-sidebar-btn" aria-label="Open menu">
          <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <span class="mobile-topbar-title">RYDA Writer Panel</span>
      </div>
      <div class="sidebar-backdrop" id="sidebar-backdrop" hidden></div>

      <!-- ─── NEW POST PANEL ──────────────────────────────────────── -->
      <div class="panel is-active" id="panel-new-post">
        <div class="panel-header">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
            <div>
              <h1 id="editor-panel-heading">Publish Story or Article</h1>
              <p id="editor-panel-sub">Create rich articles, human stories, testimonies, statements, and field dispatches for the RYDA Newsroom.</p>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="top-back-posts-btn" style="margin-top:4px;">
              ← Back to All Posts
            </button>
          </div>
        </div>

        <!-- Active Edit Banner -->
        <div class="editing-banner" id="editing-banner" hidden>
          <div class="editing-banner-left">
            <span class="editing-badge">✏️ Editing Post</span>
            <span class="editing-banner-title" id="editing-banner-title"></span>
          </div>
          <div class="editing-banner-actions">
            <button type="button" class="btn btn-outline btn-sm" id="btn-back-to-all-posts">
              ← Back to All Posts
            </button>
            <button type="button" class="btn btn-ghost-dark btn-sm" id="btn-cancel-edit">
              ✕ Cancel Edit (Start New Post)
            </button>
          </div>
        </div>

        <div class="editor-layout">
          <!-- Editor form -->
          <form class="editor-form" id="post-form" novalidate>

            <div class="field-group">
              <label for="f-title">Headline / Title <span class="req">*</span></label>
              <input id="f-title" name="title" type="text" maxlength="150"
                placeholder="Powerful, descriptive headline (required)" required>
              <span class="field-hint">E.g., At 12, Shohida Carries the Memory of Tula Toli Massacre. Max 150 characters.</span>
            </div>

            <div class="field-row">
              <div class="field-group">
                <label for="f-category">Category <span class="req">*</span></label>
                <select id="f-category" name="category">
                  <option value="Stories">Stories / Human Stories</option>
                  <option value="Reports">Reports &amp; Documentation</option>
                  <option value="Articles">Articles</option>
                  <option value="Statements">Official Statements</option>
                  <option value="Emergency">Emergency Updates</option>
                  <option value="Advocacy">Advocacy</option>
                  <option value="Leadership">Youth &amp; Leadership</option>
                  <option value="Research">Research &amp; Analysis</option>
                  <option value="Documentation">Human Rights Documentation</option>
                  <option value="Humanitarian">Humanitarian Response</option>
                  <option value="Training">Training</option>
                  <option value="Field Reports">Field Reports</option>
                  <option value="Media">Media Coverage</option>
                  <option value="Campaigns">Campaigns</option>
                </select>
              </div>
              <div class="field-group">
                <label for="f-author">Author / Byline</label>
                <input id="f-author" name="author" type="text" maxlength="80"
                  placeholder="E.g. Ro Asma, Nur Hossain, or RYDA Team" value="RYDA Team">
              </div>
            </div>

            <div class="field-group">
              <label for="f-summary">Summary / Excerpt <span class="req">*</span></label>
              <textarea id="f-summary" name="summary" rows="3" maxlength="320"
                placeholder="A compelling 1-2 sentence lead summary shown on newsroom cards and search previews..." required></textarea>
              <span class="field-hint char-count" data-max="320" data-field="f-summary">0 / 320</span>
            </div>

            <!-- Full story rich editor -->
            <div class="field-group">
              <div class="editor-header-flex">
                <label for="f-content">Full Story Body <span class="req">*</span></label>
                <div class="editor-meta-pills">
                  <span class="editor-stat-pill" id="editor-word-count">0 words · 1 min read</span>
                  <span class="editor-save-pill" id="editor-save-status">Draft auto-saved</span>
                </div>
              </div>
              
              <div class="editor-toolbar" role="toolbar" aria-label="Text formatting">
                <button type="button" class="tool-btn" data-cmd="undo" title="Undo (Ctrl+Z)">↶</button>
                <button type="button" class="tool-btn" data-cmd="redo" title="Redo (Ctrl+Y)">↷</button>
                <div class="tool-sep" aria-hidden="true"></div>
                <button type="button" class="tool-btn" data-cmd="bold" title="Bold (Ctrl+B)"><b>B</b></button>
                <button type="button" class="tool-btn" data-cmd="italic" title="Italic (Ctrl+I)"><i>I</i></button>
                <button type="button" class="tool-btn" data-cmd="underline" title="Underline (Ctrl+U)"><u>U</u></button>
                <button type="button" class="tool-btn" data-cmd="link" title="Insert or Edit Hyperlink">🔗 Link</button>
                <div class="tool-sep" aria-hidden="true"></div>
                <button type="button" class="tool-btn" data-cmd="h2" title="Section Heading (H2)">H2</button>
                <button type="button" class="tool-btn" data-cmd="h3" title="Sub-Heading (H3)">H3</button>
                <div class="tool-sep" aria-hidden="true"></div>
                <button type="button" class="tool-btn" data-cmd="ul" title="Bullet list">&#8226; List</button>
                <button type="button" class="tool-btn" data-cmd="ol" title="Numbered list">1. List</button>
                <button type="button" class="tool-btn" data-cmd="hr" title="Insert Section Divider">―</button>
                <div class="tool-sep" aria-hidden="true"></div>
                
                <!-- World-class quotation buttons -->
                <button type="button" class="tool-btn tool-quote-btn" data-cmd="storyQuote" title="Insert Highlighted Story Quote with Speaker Citation">
                  🗣️ Story Quote
                </button>
                <button type="button" class="tool-btn tool-quote-btn" data-cmd="pullquote" title="Insert Centered Editorial Pullquote">
                  📌 Pullquote
                </button>
                <button type="button" class="tool-btn tool-quote-btn" data-cmd="testimony" title="Insert Eyewitness Testimony Dispatch Box">
                  ⚡ Testimony
                </button>
                
                <div class="tool-sep" aria-hidden="true"></div>
                <button type="button" class="tool-btn tool-photo-btn" data-cmd="insertInlinePhoto" title="Insert an inline photo with caption anywhere in your story (even mid-paragraph)">
                  📷 Add Photo Here
                </button>
                <button type="button" class="tool-btn tool-clear" title="Clear formatting" data-cmd="clear">Clear</button>
              </div>

              <div id="f-content"
                class="rich-editor"
                contenteditable="true"
                role="textbox"
                aria-multiline="true"
                aria-label="Full story content"
                data-placeholder="Write your article or human story here. Place your cursor anywhere — even in the middle of a paragraph — and click '📷 Add Photo Here' (or paste/drag an image) to insert a photo with caption right there..."></div>
              <div class="editor-inline-tip">
                💡 <strong>Photo tip:</strong> Click anywhere inside your text (including the middle of a paragraph) and press <strong>📷 Add Photo Here</strong>, or drag/paste a photo directly into the editor.
              </div>
              <textarea id="f-content-hidden" name="content" style="display:none"></textarea>
            </div>

            <!-- Photos & Cover Upload Area -->
            <div class="field-group">
              <label>Article Photography &amp; Cover Images</label>
              
              <!-- Drag and drop zone -->
              <div class="upload-dropzone" id="upload-dropzone">
                <input id="f-image-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple class="hidden-file-input">
                <div class="dropzone-inner">
                  <div class="dropzone-icon">
                    <svg viewBox="0 0 24 24" fill="none" width="36" height="36">
                      <path d="M7 16C4.79086 16 3 14.2091 3 12C3 9.94474 4.54774 8.25049 6.55018 8.03223C7.03759 5.16781 9.51797 3 12.5 3C15.9065 3 18.7303 5.67073 18.9834 9.04351C20.7309 9.53931 22 11.1278 22 13C22 15.2091 20.2091 17 18 17H17" stroke="#0FA693" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M12 12V21M12 12L8.5 15.5M12 12L15.5 15.5" stroke="#0FA693" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="dropzone-text">
                    <strong>Drag &amp; Drop photos here</strong> or <span class="dropzone-link">browse files</span>
                  </div>
                  <span class="dropzone-hint">Upload multiple JPG, PNG, WebP photos (up to 6MB each). Photos are preserved in full original uncropped resolution across all orientations.</span>
                </div>
              </div>

              <!-- URL input fallback -->
              <div class="image-url-row">
                <input id="f-image-url-input" type="url" placeholder="Or paste direct image URL (https://...) and click Add">
                <button type="button" class="btn btn-outline btn-sm" id="add-url-btn">Add Image URL</button>
              </div>

              <input id="f-image" name="featured_image" type="hidden">
              <div class="upload-status" id="upload-status" hidden></div>
              
              <!-- Multi-photo gallery manager -->
              <div class="gallery-manager" id="gallery-manager">
                <div class="gallery-manager-header">
                  <span class="gallery-count" id="gallery-count">0 photos added</span>
                  <span class="field-hint">First photo is Main Cover. Use <strong>"📷 Insert in Body"</strong> to place any photo inside your text.</span>
                </div>
                <div class="gallery-grid" id="gallery-grid">
                  <div class="gallery-empty" id="gallery-empty">No photos added yet. Upload or paste URLs above.</div>
                </div>
              </div>
            </div>

            <div class="field-group">
              <label for="f-tags">Tags</label>
              <input id="f-tags" name="tags" type="text"
                placeholder="stories, human-rights, cox-bazar, justice, youth (comma-separated)">
              <span class="field-hint">Optional keywords for filtering and search.</span>
            </div>

            <!-- Preview toggle -->
            <div class="preview-toggle">
              <button type="button" class="btn btn-outline" id="preview-btn">👁️ Preview Post</button>
              <button type="button" class="btn btn-outline" id="preview-close" hidden>← Back to Editor</button>
            </div>

            <!-- Live preview -->
            <div class="post-preview" id="post-preview" hidden>
              <div class="preview-badge" id="prev-badge"></div>
              <h2 class="preview-title" id="prev-title"></h2>
              <div class="preview-meta" id="prev-meta"></div>
              <div class="preview-image-wrap" id="prev-image-wrap" hidden>
                <img id="prev-image" src="" alt="">
              </div>
              <div class="preview-summary" id="prev-summary"></div>
              <hr class="preview-rule">
              <div class="preview-body editorial-typography" id="prev-body"></div>
              <div class="preview-gallery-wrap" id="prev-gallery-wrap" hidden>
                <div class="preview-gallery-title">📷 Photo Gallery (<span id="prev-gallery-count">0</span> photos)</div>
                <div class="preview-gallery-grid" id="prev-gallery-grid"></div>
              </div>
            </div>

            <div class="form-actions">
              <button class="btn btn-primary btn-lg" type="submit" id="publish-btn">
                <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M14.5 2.5L17.5 5.5L7 16H4V13L14.5 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
                <span id="publish-btn-text">Publish Post</span>
                <span id="publish-spinner" class="spinner" hidden></span>
              </button>
              <button class="btn btn-ghost-dark" type="button" id="draft-clear">Clear Form</button>
            </div>

            <div class="form-feedback" id="form-feedback" aria-live="polite"></div>
          </form>
        </div>
      </div>

      <!-- ─── ALL POSTS PANEL ─────────────────────────────────────── -->
      <div class="panel" id="panel-all-posts" hidden>
        <div class="panel-header">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
            <div>
              <h1>All Published Posts &amp; Stories</h1>
              <p>View, edit, copy links, duplicate, or remove newsroom posts from the RYDA live database.</p>
            </div>
            <button type="button" class="btn btn-primary btn-sm" id="new-post-quick-btn">
              ＋ Write New Story
            </button>
          </div>
        </div>

        <div class="posts-summary-bar" id="posts-summary-bar" hidden></div>

        <div class="posts-toolbar">
          <input class="posts-search" id="posts-search" type="search" placeholder="Search by title, author, or keyword…">
          <select class="posts-cat-filter" id="posts-cat-filter" aria-label="Filter by category">
            <option value="">All Categories</option>
            <option value="Stories">Stories</option>
            <option value="Reports">Reports</option>
            <option value="Articles">Articles</option>
            <option value="Statements">Statements</option>
            <option value="Emergency">Emergency</option>
            <option value="Advocacy">Advocacy</option>
            <option value="Leadership">Leadership</option>
            <option value="Research">Research</option>
            <option value="Documentation">Documentation</option>
            <option value="Humanitarian">Humanitarian</option>
            <option value="Training">Training</option>
            <option value="Field Reports">Field Reports</option>
            <option value="Media">Media</option>
            <option value="Campaigns">Campaigns</option>
          </select>
          <button class="btn btn-outline btn-sm" type="button" id="refresh-posts">
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M2.5 10C2.5 5.86 5.86 2.5 10 2.5C12.43 2.5 14.6 3.65 16 5.5M17.5 10C17.5 14.14 14.14 17.5 10 17.5C7.57 17.5 5.4 16.35 4 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M16 2V6H12M4 18V14H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Refresh
          </button>
        </div>

        <div id="posts-list" class="posts-list">
          <div class="posts-loading">Loading posts…</div>
        </div>
      </div>

      <!-- ─── AUDIENCE & VIEWS PANEL ──────────────────────────────── -->
      <div class="panel" id="panel-analytics" hidden>
        <div class="panel-header">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
            <div>
              <h1>Audience &amp; Views</h1>
              <p>Who is reading RYDA — article reads, unique readers, site traffic and writer-panel (backend) visits. Bots and crawlers are excluded.</p>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <select id="an-range" class="an-range" aria-label="Date range">
                <option value="7">Last 7 days</option>
                <option value="14" selected>Last 14 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <button class="btn btn-outline btn-sm" type="button" id="refresh-analytics">↻ Refresh</button>
            </div>
          </div>
        </div>

        <div id="analytics-root">
          <div class="posts-loading">Loading audience statistics…</div>
        </div>
      </div>

      <!-- ─── INQUIRIES & MESSAGES PANEL ───────────────────────────── -->
      <div class="panel" id="panel-inquiries" hidden>
        <div class="panel-header">
          <h1>Inquiries &amp; Contact Messages</h1>
          <p>Messages submitted through the website contact form to <code>ryda.rohingya@gmail.com</code>.</p>
        </div>

        <div class="posts-toolbar">
          <input class="posts-search" id="inquiries-search" type="search" placeholder="Search inquiries by name, email, or message…">
          <button class="btn btn-outline btn-sm" type="button" id="refresh-inquiries">
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M2.5 10C2.5 5.86 5.86 2.5 10 2.5C12.43 2.5 14.6 3.65 16 5.5M17.5 10C17.5 14.14 14.14 17.5 10 17.5C7.57 17.5 5.4 16.35 4 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M16 2V6H12M4 18V14H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Refresh Messages
          </button>
        </div>

        <div id="inquiries-list" class="inquiries-list">
          <div class="posts-loading">Loading contact messages…</div>
        </div>
      </div>

      <!-- ─── GUIDELINES PANEL ────────────────────────────────────── -->
      <div class="panel" id="panel-guidelines" hidden>
        <div class="panel-header">
          <h1>Editorial &amp; Quoting Guidelines</h1>
          <p>Standards for ethical, accurate, and impactful storytelling and human rights documentation.</p>
        </div>

        <div class="guidelines-content">
          <div class="guideline-block">
            <h3>📖 Human Stories &amp; Quotations</h3>
            <ul>
              <li><strong>Story Quotation</strong> — Always highlight survivor, youth, and eyewitness voices using the <code>🗣️ Story Quote</code> tool. Include the speaker's name, age/role, and context in the citation.</li>
              <li><strong>In-Body Photos</strong> — Place compelling photographs with informative captions and photographer credits next to relevant sections using <code>📷 In-Body Photo</code>.</li>
              <li><strong>Eyewitness Testimonies</strong> — Use the <code>⚡ Testimony</code> box for urgent field dispatches and firsthand observer accounts.</li>
            </ul>
          </div>

          <div class="guideline-block">
            <h3>📌 Post Categories</h3>
            <ul>
              <li><strong>Stories</strong> — Survivor journeys, youth changemakers, personal narratives, and community resilience.</li>
              <li><strong>Reports</strong> — Human rights documentation briefs, land rights violations, forced recruitment reports.</li>
              <li><strong>Statements</strong> — Official RYDA organizational positions and urgent appeals.</li>
              <li><strong>Emergency</strong> — Humanitarian crises, camp fires, floods, health emergencies, and relief appeals.</li>
              <li><strong>Advocacy</strong> — Submissions to UN mechanisms and international accountability bodies.</li>
              <li><strong>Leadership</strong> — Youth and women leadership workshops and community organizing.</li>
            </ul>
          </div>

          <div class="guideline-block">
            <h3>✍️ Writing &amp; Safety Standards</h3>
            <ul>
              <li>Write in clear, accessible English for international audiences, journalists, and diplomats.</li>
              <li>Always verify facts with at least two independent community sources before publishing.</li>
              <li>Never publish names or identifying details of vulnerable individuals without informed consent.</li>
              <li>Use "Rohingya" as the community's self-identification.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- ─── ADMIN TOOLS & BACKUP PANEL ─────────────────────────── -->
      <div class="panel" id="panel-admin-tools" hidden>
        <div class="panel-header">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
            <div>
              <h1>Admin Tools, Health &amp; Backup</h1>
              <p>Inspect live storage status, export full JSON backups of your stories and inquiries, and jump to any public page.</p>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="refresh-health-btn">↻ Check System Status</button>
          </div>
        </div>

        <div class="admin-tools-grid" id="admin-tools-root">
          <div class="guideline-block">
            <h3>🗄️ Database &amp; Storage Status</h3>
            <div id="admin-health-status" class="admin-health-box">Checking live status…</div>
          </div>

          <div class="guideline-block">
            <h3>💾 Export &amp; Backup Data</h3>
            <p style="margin-bottom:14px;">Download portable JSON backups of all published articles or contact inquiries at any time.</p>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <button type="button" class="btn btn-primary btn-sm" id="export-posts-btn">⬇ Download All Posts (.json)</button>
              <button type="button" class="btn btn-outline btn-sm" id="export-inquiries-btn">⬇ Download Inquiries (.json)</button>
            </div>
          </div>

          <div class="guideline-block">
            <h3>🌐 Live Website Quick Links</h3>
            <div class="quick-links-grid">
              <a href="/" target="_blank" rel="noopener" class="btn btn-outline btn-sm">🏠 Homepage ↗</a>
              <a href="/newsroom" target="_blank" rel="noopener" class="btn btn-outline btn-sm">📰 Newsroom ↗</a>
              <a href="/about" target="_blank" rel="noopener" class="btn btn-outline btn-sm">ℹ️ About RYDA ↗</a>
              <a href="/sitemap" target="_blank" rel="noopener" class="btn btn-outline btn-sm">🗺️ Sitemap ↗</a>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>

  <!-- ═══ INLINE PHOTO MODAL (Insert / Edit Photo at Cursor) ═══════════════ -->
  <div class="ipm-backdrop" id="inline-photo-modal" hidden role="dialog" aria-modal="true" aria-labelledby="ipm-title">
    <div class="ipm-dialog">
      <div class="ipm-header">
        <div>
          <h3 id="ipm-title">Insert Photo in Story</h3>
          <p class="ipm-sub">Photo will be placed cleanly at your cursor position — even in the middle of a paragraph.</p>
        </div>
        <button type="button" class="ipm-close" id="ipm-close" aria-label="Close">✕</button>
      </div>

      <div class="ipm-tabs" id="ipm-tabs" role="tablist">
        <button type="button" class="ipm-tab is-active" data-ipm-tab="upload">↑ Upload New Photo</button>
        <button type="button" class="ipm-tab" data-ipm-tab="gallery">🖼️ From Post Photos (<span id="ipm-gal-count">0</span>)</button>
        <button type="button" class="ipm-tab" data-ipm-tab="url">🔗 Image URL</button>
      </div>

      <div class="ipm-body">
        <!-- Tab: Upload -->
        <div class="ipm-pane is-active" id="ipm-pane-upload">
          <label class="ipm-dropzone" id="ipm-dropzone">
            <input type="file" id="ipm-file-input" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" class="hidden-file-input">
            <div class="ipm-dropzone-inner">
              <span class="ipm-drop-icon">📷</span>
              <span><strong>Click to choose a photo</strong> or drag &amp; drop here</span>
              <span class="ipm-drop-hint">JPG, PNG, WebP, GIF up to 6MB — uncropped full quality</span>
            </div>
          </label>
          <div class="ipm-status" id="ipm-upload-status" hidden></div>
        </div>

        <!-- Tab: Gallery Picker -->
        <div class="ipm-pane" id="ipm-pane-gallery" hidden>
          <div class="ipm-gallery-grid" id="ipm-gallery-grid">
            <div class="ipm-gallery-empty">No photos uploaded to this post yet. Use "Upload New Photo" or "Image URL".</div>
          </div>
        </div>

        <!-- Tab: URL -->
        <div class="ipm-pane" id="ipm-pane-url" hidden>
          <div class="ipm-url-row">
            <input type="url" id="ipm-url-input" placeholder="https://example.com/photo.jpg">
            <button type="button" class="btn btn-outline btn-sm" id="ipm-url-load">Load Preview</button>
          </div>
        </div>

        <!-- Selected Photo Preview -->
        <div class="ipm-preview-box" id="ipm-preview-box" hidden>
          <img id="ipm-preview-img" src="" alt="Selected photo preview">
        </div>

        <!-- Caption, Credit & Layout -->
        <div class="ipm-fields">
          <div class="ipm-field">
            <label for="ipm-caption">Photo Caption</label>
            <input type="text" id="ipm-caption" placeholder="Describe what is shown in this photo (displayed underneath)...">
          </div>
          <div class="ipm-field-row">
            <div class="ipm-field">
              <label for="ipm-credit">Photographer Credit</label>
              <input type="text" id="ipm-credit" placeholder="e.g. Photo by Ro Harez Khan">
            </div>
            <div class="ipm-field">
              <label for="ipm-layout">Layout &amp; Alignment</label>
              <select id="ipm-layout">
                <option value="center">Centered (Recommended)</option>
                <option value="wide">Wide Editorial Feature</option>
                <option value="left">Float Left (Wrap text right)</option>
                <option value="right">Float Right (Wrap text left)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="ipm-footer">
        <button type="button" class="btn btn-ghost-dark btn-sm" id="ipm-cancel">Cancel</button>
        <button type="button" class="btn btn-primary btn-sm" id="ipm-insert-btn" disabled>📷 Insert Photo at Cursor</button>
      </div>
    </div>
  </div>
`;

export default function WriterPanel() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: rawHTML }} />
      <Script src="/writer.js" strategy="afterInteractive" />
    </>
  );
}
