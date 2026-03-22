const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const supportsIntersectionObserver = "IntersectionObserver" in window;
const canTiltCards = hasFinePointer && !prefersReducedMotion;

const revealSelector =
  ".hero-copy, .hero-panel, .card, .program-card, .value-card, .cta-card, .story-band, .impact-item, .journey-card, .contact-card";
const revealItems = Array.from(document.querySelectorAll(revealSelector));
let revealObserver = null;

function revealImmediately(items) {
  items.forEach((item) => {
    item.classList.add("is-visible");
  });
}

function observeRevealItems(items, withStagger = true) {
  if (!items.length) {
    return;
  }

  if (!revealObserver) {
    revealImmediately(items);
    return;
  }

  items.forEach((item, index) => {
    if (withStagger) {
      item.style.transitionDelay = `${Math.min(index * 40, 240)}ms`;
    }
    revealObserver.observe(item);
  });
}

if (!prefersReducedMotion && supportsIntersectionObserver) {
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -30px 0px",
    }
  );
}

observeRevealItems(revealItems);

const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.getElementById("site-nav");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const sections = Array.from(document.querySelectorAll("main section[id], footer[id]"));
const heroOrbs = Array.from(document.querySelectorAll(".hero-orb"));

function setMenuState(isOpen) {
  if (!siteHeader || !menuToggle || !siteNav) {
    return;
  }

  siteHeader.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
}

if (menuToggle && siteHeader) {
  menuToggle.addEventListener("click", () => {
    const isOpen = !siteHeader.classList.contains("menu-open");
    setMenuState(isOpen);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
    }
  });

  document.addEventListener("click", (event) => {
    if (!siteHeader.classList.contains("menu-open")) {
      return;
    }
    if (event.target instanceof Node && !siteHeader.contains(event.target)) {
      setMenuState(false);
    }
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 760) {
      setMenuState(false);
    }
  });
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 760) {
    setMenuState(false);
  }
});

function highlightNavBySection(sectionId) {
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${sectionId}`);
  });
}

if (supportsIntersectionObserver && sections.length) {
  let activeId = "";
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeId = entry.target.id;
        }
      });

      if (activeId) {
        highlightNavBySection(activeId);
      }
    },
    {
      rootMargin: "-42% 0px -50% 0px",
      threshold: 0,
    }
  );

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });
} else {
  const setActiveNavByScroll = () => {
    let currentId = "";
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 140 && rect.bottom >= 140) {
        currentId = section.id;
      }
    });
    highlightNavBySection(currentId);
  };

  setActiveNavByScroll();
  window.addEventListener("scroll", setActiveNavByScroll, { passive: true });
}

if (heroOrbs.length && !prefersReducedMotion) {
  let rafId = 0;

  const updateHeroParallax = () => {
    rafId = 0;
    if (window.innerWidth < 760) {
      heroOrbs.forEach((orb) => {
        orb.style.transform = "";
      });
      return;
    }

    const offset = Math.min(window.scrollY * 0.1, 24);
    heroOrbs.forEach((orb, index) => {
      const direction = index === 0 ? -1 : 1;
      orb.style.transform = `translate3d(${direction * offset}px, ${offset * -0.6}px, 0)`;
    });
  };

  const requestParallaxUpdate = () => {
    if (rafId) {
      return;
    }
    rafId = window.requestAnimationFrame(updateHeroParallax);
  };

  requestParallaxUpdate();
  window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
  window.addEventListener("resize", requestParallaxUpdate);
}

const tiltCardSelector = ".program-card, .value-card, .impact-item, .journey-card, .contact-card, .blog-post";
const tiltBoundCards = new WeakSet();

function attachTilt(card) {
  if (!canTiltCards || tiltBoundCards.has(card)) {
    return;
  }

  tiltBoundCards.add(card);
  card.classList.add("tilt-ready");

  let frame = 0;
  let nextX = 0;
  let nextY = 0;

  const paintTilt = () => {
    frame = 0;
    card.style.transform = `perspective(900px) rotateX(${nextY * -4}deg) rotateY(${nextX * 5}deg) translateY(-6px)`;
  };

  card.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") {
      return;
    }

    const rect = card.getBoundingClientRect();
    nextX = (event.clientX - rect.left - rect.width / 2) / rect.width;
    nextY = (event.clientY - rect.top - rect.height / 2) / rect.height;

    if (!frame) {
      frame = window.requestAnimationFrame(paintTilt);
    }
  });

  card.addEventListener("pointerleave", () => {
    if (frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
    card.style.transform = "";
  });
}

if (canTiltCards) {
  document.querySelectorAll(tiltCardSelector).forEach((card) => attachTilt(card));
}

const blogStorageKey = "ryda-blog-posts";
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

const blogForm = document.getElementById("blog-form");
const blogPostsContainer = document.getElementById("blog-posts");
const blogMessage = document.getElementById("blog-message");
const blogResetButton = document.getElementById("blog-reset");
const blogClearAllButton = document.getElementById("blog-clear-all");
const blogSearchInput = document.getElementById("blog-search");
const blogFilterSelect = document.getElementById("blog-filter");

const contactForm = document.getElementById("gmail-contact-form");
const contactResetButton = document.getElementById("contact-reset");
const contactFormNote = document.getElementById("contact-form-note");

function loadPosts() {
  try {
    const storedPosts = window.localStorage.getItem(blogStorageKey);
    if (!storedPosts) {
      return defaultPosts;
    }

    const parsedPosts = JSON.parse(storedPosts);
    return Array.isArray(parsedPosts) && parsedPosts.length ? parsedPosts : defaultPosts;
  } catch (error) {
    return defaultPosts;
  }
}

function savePosts(posts) {
  window.localStorage.setItem(blogStorageKey, JSON.stringify(posts));
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(`${dateString}T12:00:00`));
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeText(value) {
  return value.trim().toLowerCase();
}

function buildPostMarkup(post) {
  const category = post.category ? `<span class="blog-badge">${escapeHtml(post.category)}</span>` : "";
  const author = post.author ? `By ${escapeHtml(post.author)}` : "By RYDA";

  return `
    <article class="blog-post card">
      <div class="blog-post-head">
        <h3>${escapeHtml(post.title)}</h3>
        ${category}
      </div>
      <div class="blog-meta">
        <span class="blog-byline">${author}</span>
        <span class="blog-byline">${formatDate(post.date)}</span>
      </div>
      <p class="blog-summary">${escapeHtml(post.summary)}</p>
      <p class="blog-content">${escapeHtml(post.content)}</p>
      <div class="blog-post-actions">
        <button class="text-button" type="button" data-delete-post="${post.id}">Delete Post</button>
      </div>
    </article>
  `;
}

function syncBlogCategoryFilter(allPosts) {
  if (!blogFilterSelect) {
    return;
  }

  const selectedCategory = blogFilterSelect.value;
  const categories = [...new Set(allPosts.map((post) => post.category.trim()).filter(Boolean))].sort();
  const optionsMarkup = [
    '<option value="">All categories</option>',
    ...categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`),
  ].join("");

  blogFilterSelect.innerHTML = optionsMarkup;
  if (selectedCategory && categories.includes(selectedCategory)) {
    blogFilterSelect.value = selectedCategory;
  }
}

function renderPosts(postList, hasActiveFilter) {
  if (!blogPostsContainer) {
    return;
  }

  if (!postList.length) {
    blogPostsContainer.innerHTML = `
      <div class="empty-state">
        <h3>${hasActiveFilter ? "No matching posts" : "No posts yet"}</h3>
        <p>${hasActiveFilter ? "Try a different search term or category." : "Publish the first story to start the RYDA newsroom."}</p>
      </div>
    `;
    return;
  }

  blogPostsContainer.innerHTML = postList.map(buildPostMarkup).join("");
  const newPostCards = Array.from(blogPostsContainer.querySelectorAll(".blog-post"));
  observeRevealItems(newPostCards);
  if (canTiltCards) {
    newPostCards.forEach((card) => attachTilt(card));
  }
}

let posts = loadPosts().sort((a, b) => new Date(b.date) - new Date(a.date));

function getFilteredPosts() {
  const searchTerm = normalizeText(blogSearchInput ? blogSearchInput.value : "");
  const selectedCategory = normalizeText(blogFilterSelect ? blogFilterSelect.value : "");

  return posts.filter((post) => {
    const matchesCategory = !selectedCategory || normalizeText(post.category) === selectedCategory;
    if (!matchesCategory) {
      return false;
    }

    if (!searchTerm) {
      return true;
    }

    const searchable = [post.title, post.summary, post.content, post.author, post.category]
      .join(" ")
      .toLowerCase();
    return searchable.includes(searchTerm);
  });
}

function renderBlog() {
  syncBlogCategoryFilter(posts);
  const filteredPosts = getFilteredPosts();
  const hasActiveFilter = Boolean(
    (blogSearchInput && blogSearchInput.value.trim()) || (blogFilterSelect && blogFilterSelect.value.trim())
  );
  renderPosts(filteredPosts, hasActiveFilter);
}

renderBlog();

if (blogForm && blogMessage) {
  blogForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(blogForm);
    const title = formData.get("title").toString().trim();
    const category = formData.get("category").toString().trim();
    const author = formData.get("author").toString().trim() || "RYDA Team";
    const summary = formData.get("summary").toString().trim();
    const content = formData.get("content").toString().trim();

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
    renderBlog();
    blogForm.reset();
    blogMessage.textContent = "Post published successfully.";
  });
}

if (blogResetButton && blogForm && blogMessage) {
  blogResetButton.addEventListener("click", () => {
    blogForm.reset();
    blogMessage.textContent = "Editor cleared.";
  });
}

if (blogClearAllButton && blogMessage) {
  blogClearAllButton.addEventListener("click", () => {
    posts = [...defaultPosts];
    savePosts(posts);
    renderBlog();
    blogMessage.textContent = "Demo posts restored.";
  });
}

if (blogSearchInput) {
  blogSearchInput.addEventListener("input", () => {
    renderBlog();
  });
}

if (blogFilterSelect) {
  blogFilterSelect.addEventListener("change", () => {
    renderBlog();
  });
}

if (blogPostsContainer && blogMessage) {
  blogPostsContainer.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const postId = target.dataset.deletePost;
    if (!postId) {
      return;
    }

    posts = posts.filter((post) => post.id !== postId);
    savePosts(posts);
    renderBlog();
    blogMessage.textContent = "Post deleted.";
  });
}

if (contactForm && contactFormNote) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = formData.get("name").toString().trim();
    const email = formData.get("email").toString().trim();
    const organization = formData.get("organization").toString().trim();
    const inquiryType = formData.get("type").toString().trim();
    const subject = formData.get("subject").toString().trim();
    const message = formData.get("message").toString().trim();

    if (!name || !email || !subject || !message) {
      contactFormNote.textContent = "Please complete your name, email, subject, and message.";
      return;
    }

    const emailBody = [
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
      `&body=${encodeURIComponent(emailBody)}`;

    window.open(gmailUrl, "_blank", "noopener");
    contactFormNote.textContent = "Gmail draft opened in a new tab.";
  });
}

if (contactResetButton && contactForm && contactFormNote) {
  contactResetButton.addEventListener("click", () => {
    contactForm.reset();
    contactFormNote.textContent = "Form cleared.";
  });
}
