// Preloader
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader').classList.add('hidden');
  }, 1500);
});

// Reveal animations
const revealItems = document.querySelectorAll(
  ".hero-copy, .hero-panel, .card, .program-card, .value-card, .cta-card, .story-band, .impact-item, .journey-card, .blog-post, .contact-card, .stat-card, .testimonial-card, .story-card, .team-card, .donation-card"
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

// Header scroll effect
const header = document.querySelector('.site-header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  
  lastScroll = currentScroll;
}, { passive: true });

// Animated counters
const animateCounter = (element, target, duration = 2000) => {
  let start = 0;
  const increment = target / (duration / 16);
  
  const updateCounter = () => {
    start += increment;
    if (start < target) {
      element.textContent = Math.floor(start).toLocaleString();
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target.toLocaleString();
    }
  };
  
  updateCounter();
};

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.count);
        animateCounter(entry.target, target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('[data-count]').forEach((counter) => {
  counterObserver.observe(counter);
});

// Hero orbs parallax
const heroOrbs = document.querySelectorAll(".hero-orb");

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

// Mobile menu
const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.getElementById("site-nav");
const navLinks = document.querySelectorAll(".site-nav a");

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

// Active nav on scroll
const sections = document.querySelectorAll("main section[id], footer[id]");

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

// Close menu on resize
window.addEventListener("resize", () => {
  if (window.innerWidth > 760) {
    setMenuState(false);
  }
});

// Close menu on nav click
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 760) {
      setMenuState(false);
    }
  });
});

// Interactive card tilt effect
const interactiveCards = document.querySelectorAll(".card, .program-card, .value-card, .impact-item, .journey-card, .blog-post, .contact-card, .stat-card, .donation-card, .team-card");

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

// Blog system
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
  {
    id: "post-3",
    title: "Humanitarian Response: Emergency Relief Distribution",
    category: "Relief",
    author: "Mohammed Karim",
    summary:
      "RYDA coordinated emergency food and supplies distribution to 500 families affected by recent flooding.",
    content:
      "In response to the devastating floods that affected multiple camps in Cox's Bazar, RYDA mobilized volunteers and resources to provide immediate relief to affected families.\n\nThe distribution included essential food items, clean water, hygiene kits, and temporary shelter materials. Our team worked around the clock to ensure no family was left without support during this critical time.",
    date: "2026-03-05",
  },
];

const blogForm = document.getElementById("blog-form");
const blogPostsContainer = document.getElementById("blog-posts");
const blogMessage = document.getElementById("blog-message");
const blogResetButton = document.getElementById("blog-reset");
const blogClearAllButton = document.getElementById("blog-clear-all");

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

if (blogForm) {
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
      blogMessage.style.color = "#c56a2d";
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
    blogMessage.textContent = "✓ Post published successfully!";
    blogMessage.style.color = "#0f6a68";
    
    setTimeout(() => {
      blogMessage.textContent = "";
    }, 3000);
  });
}

if (blogResetButton) {
  blogResetButton.addEventListener("click", () => {
    blogForm.reset();
    blogMessage.textContent = "Editor cleared.";
    blogMessage.style.color = "var(--muted)";
  });
}

if (blogClearAllButton) {
  blogClearAllButton.addEventListener("click", () => {
    posts = [...defaultPosts];
    savePosts(posts);
    renderPosts(posts);
    blogMessage.textContent = "Demo posts restored.";
    blogMessage.style.color = "#0f6a68";
  });
}

if (blogPostsContainer) {
  blogPostsContainer.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const postId = target.dataset.deletePost;
    if (!postId) {
      return;
    }

    if (confirm('Are you sure you want to delete this post?')) {
      posts = posts.filter((post) => post.id !== postId);
      savePosts(posts);
      renderPosts(posts);
      blogMessage.textContent = "Post deleted.";
      blogMessage.style.color = "var(--muted)";
    }
  });
}

// Newsletter Form
const newsletterForm = document.getElementById('newsletter-form');
const newsletterEmail = document.getElementById('newsletter-email');
const newsletterMessage = document.getElementById('newsletter-message');

if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = newsletterEmail.value.trim();
    
    if (!email || !email.includes('@')) {
      newsletterMessage.textContent = 'Please enter a valid email address.';
      newsletterMessage.style.color = '#c56a2d';
      return;
    }
    
    // Simulate subscription
    newsletterMessage.textContent = '✓ Thank you for subscribing!';
    newsletterMessage.style.color = '#0f6a68';
    newsletterEmail.value = '';
    
    setTimeout(() => {
      newsletterMessage.textContent = '';
    }, 4000);
  });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Donation button interactions
document.querySelectorAll('.donation-card button').forEach(button => {
  button.addEventListener('click', function() {
    const amount = this.textContent.match(/\$(\d+)/)?.[1] || '';
    alert(`Thank you for your interest in donating $${amount}!\n\nIn a production environment, this would connect to a secure payment processor like Stripe or PayPal.\n\nFor now, please contact us at ryda.rohingya@gmail.com to make a donation.`);
  });
});

// Success story "Read more" links
document.querySelectorAll('.story-card .text-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Full story coming soon! This would open a detailed case study page.');
  });
});

// Keyboard navigation improvements
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && siteHeader.classList.contains('menu-open')) {
    setMenuState(false);
  }
});

// Performance: Lazy load images (if any external images were added)
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        imageObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });
}

console.log('🌟 RYDA Website Loaded\nBuilt with care for Rohingya Youth Development Association');
