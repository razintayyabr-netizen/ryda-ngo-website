const revealItems = document.querySelectorAll(
  ".hero-copy, .hero-panel, .card, .program-card, .value-card, .cta-card, .story-band, .impact-item, .journey-card, .blog-post, .contact-card"
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -30px 0px",
  }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 45, 260)}ms`;
  observer.observe(item);
});

const heroOrbs = document.querySelectorAll(".hero-orb");
const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.getElementById("site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const sections = document.querySelectorAll("main section[id], footer[id]");
const interactiveCards = document.querySelectorAll(".card, .program-card, .value-card, .impact-item, .journey-card, .blog-post, .contact-card");

function setMenuState(isOpen) {
  if (!siteHeader || !menuToggle || !siteNav) {
    return;
  }

  siteHeader.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = !siteHeader.classList.contains("menu-open");
    setMenuState(isOpen);
  });
}

function setActiveNav() {
  let currentId = "";

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 140 && rect.bottom >= 140) {
      currentId = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${currentId}`);
  });
}

setActiveNav();
window.addEventListener("scroll", setActiveNav, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 760) {
    setMenuState(false);
  }
});
window.addEventListener(
  "scroll",
  () => {
    const offset = Math.min(window.scrollY * 0.12, 28);
    heroOrbs.forEach((orb, index) => {
      const modifier = index === 0 ? -1 : 1;
      orb.style.transform = `translate3d(${modifier * offset}px, ${offset * -0.7}px, 0)`;
    });
  },
  { passive: true }
);

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 760) {
      setMenuState(false);
    }
  });
});

interactiveCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (window.innerWidth < 960) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left - rect.width / 2) / rect.width;
    const offsetY = (event.clientY - rect.top - rect.height / 2) / rect.height;
    card.style.transform = `perspective(900px) rotateX(${offsetY * -4}deg) rotateY(${offsetX * 5}deg) translateY(-6px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

const blogStorageKey = "ryda-blog-posts";
const defaultPosts = [
  {
    id: "post-1",
    title: "RYDA Expands Education Support for Rohingya Youth",
    category: "Education",
    author: "RYDA Team",
    summary:
      "A new round of learning support activities is helping more young people continue their education in camp settings.",
    content:
      "RYDA continues to invest in education support for Rohingya youth, girls, and women through community learning initiatives, awareness sessions, and practical guidance that helps learners stay connected to opportunity.\n\nThis work strengthens confidence, encourages participation, and supports a more resilient future for the community.",
    date: "2026-03-18",
  },
  {
    id: "post-2",
    title: "Youth Leadership Workshops Strengthen Community Voice",
    category: "Leadership",
    author: "RYDA Team",
    summary:
      "Leadership workshops are equipping participants with confidence, critical thinking, and advocacy skills.",
    content:
      "RYDA's youth leadership activities focus on developing communication, responsibility, and community participation.\n\nBy helping young leaders grow their confidence and civic awareness, the organization is strengthening local capacity and long-term resilience.",
    date: "2026-03-10",
  },
];

const blogForm = document.getElementById("blog-form");
const blogPostsContainer = document.getElementById("blog-posts");
const blogMessage = document.getElementById("blog-message");
const blogResetButton = document.getElementById("blog-reset");
const blogClearAllButton = document.getElementById("blog-clear-all");
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

function attachRevealAnimations() {
  document.querySelectorAll(".blog-post").forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 45, 220)}ms`;
    observer.observe(item);
  });
}

function renderPosts(posts) {
  if (!posts.length) {
    blogPostsContainer.innerHTML = `
      <div class="empty-state">
        <h3>No posts yet</h3>
        <p>Publish the first story to start the RYDA newsroom.</p>
      </div>
    `;
    return;
  }

  blogPostsContainer.innerHTML = posts.map(buildPostMarkup).join("");
  attachRevealAnimations();
}

let posts = loadPosts().sort((a, b) => new Date(b.date) - new Date(a.date));
renderPosts(posts);

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
  renderPosts(posts);
  blogForm.reset();
  blogMessage.textContent = "Post published successfully.";
});

blogResetButton.addEventListener("click", () => {
  blogForm.reset();
  blogMessage.textContent = "Editor cleared.";
});

blogClearAllButton.addEventListener("click", () => {
  posts = [...defaultPosts];
  savePosts(posts);
  renderPosts(posts);
  blogMessage.textContent = "Demo posts restored.";
});

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
  renderPosts(posts);
  blogMessage.textContent = "Post deleted.";
});

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
