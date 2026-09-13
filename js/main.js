/* ============================================================
   MAIN JAVASCRIPT - Portfolio UI Shell
   ============================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     DOM Elements
     ---------------------------------------------------------- */
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  const mobileNavOverlay = document.querySelector(".mobile-nav-overlay");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-links a");
  const backToTopBtn = document.querySelector(".back-to-top");
  const mainNavLinks = document.querySelectorAll(".main-nav a");
  const themeToggles = document.querySelectorAll(".theme-toggle");

  /* ----------------------------------------------------------
     Theme (light / dark)
     ---------------------------------------------------------- */
  const THEME_KEY = "portfolio-theme";

  function setThemeToggleState(theme) {
    themeToggles.forEach(function(toggle) {
      toggle.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
      toggle.setAttribute(
        "aria-label",
        theme === "light" ? "Switch to dark mode" : "Switch to light mode"
      );
    });
  }

  // The theme attribute is already set by the inline script in <head>
  // (before first paint, to avoid a flash of the wrong theme). Here we
  // just sync the toggle button's state and wire up the click handler.
  setThemeToggleState(document.documentElement.getAttribute("data-theme") || "dark");

  themeToggles.forEach(function(toggle) {
    toggle.addEventListener("click", () => {
      const nextTheme = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", nextTheme);
      setThemeToggleState(nextTheme);
      try {
        localStorage.setItem(THEME_KEY, nextTheme);
      } catch (e) {
        /* localStorage unavailable (private mode, etc.) — theme still applies for this session */
      }
    });
  });

  /* ----------------------------------------------------------
     Section Reveal
     ---------------------------------------------------------- */
  const revealSections = document.querySelectorAll(".about, .education, .skills, .experience, .projects, .certifications, .contact");

  function revealVisibleSections() {
    var viewportHeight = window.innerHeight;
    revealSections.forEach(function (section) {
      var rect = section.getBoundingClientRect();
      var visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
      if (visibleHeight > viewportHeight * 0.5) {
        section.classList.add("in-view");
      }
    });
  }

  function setupRevealObserver() {
    if (!("IntersectionObserver" in window)) {
      revealSections.forEach(function (section) {
        section.classList.add("in-view");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    revealSections.forEach(function (section) {
      if (!section.classList.contains("in-view")) {
        observer.observe(section);
      }
    });
  }

  /* ----------------------------------------------------------
     Header Scroll Behavior
     ---------------------------------------------------------- */
  let isMenuOpen = false;
  let lastScrollY = 0;
  const SCROLL_THRESHOLD = 10;

  function updateHeaderState() {
    const currentScrollY = window.scrollY;

    if (currentScrollY > SCROLL_THRESHOLD) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    lastScrollY = currentScrollY;
  }

  /* ----------------------------------------------------------
     Mobile Menu
     ---------------------------------------------------------- */
  function openMenu() {
    isMenuOpen = true;
    menuToggle.setAttribute("aria-expanded", "true");
    mobileNav.classList.add("open");
    mobileNavOverlay.classList.add("open");
    document.body.classList.add("menu-open");
    menuToggle.setAttribute("aria-label", "Close menu");
  }

  function closeMenu() {
    isMenuOpen = false;
    menuToggle.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("open");
    mobileNavOverlay.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-label", "Open menu");
    menuToggle.focus();
  }

  function toggleMenu() {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  /* ----------------------------------------------------------
     Active Navigation State
     ---------------------------------------------------------- */
  function setActiveNavLink() {
    const sections = document.querySelectorAll("section[id]");
    const scrollPos = window.scrollY + 120;

    let currentSectionId = null;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute("id");
      }
    });

    // Desktop nav
    mainNavLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSectionId}`) {
        link.classList.add("active");
      }
    });

    // Mobile nav
    mobileNavLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSectionId}`) {
        link.classList.add("active");
      }
    });
  }

  /* ----------------------------------------------------------
     Back to Top
     ---------------------------------------------------------- */
  function scrollToTop(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ----------------------------------------------------------
     Event Listeners
     ---------------------------------------------------------- */
  if (menuToggle) {
    menuToggle.addEventListener("click", toggleMenu);
  }

  if (mobileNavOverlay) {
    mobileNavOverlay.addEventListener("click", closeMenu);
  }

  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", scrollToTop);
  }

  // Scroll handler with passive listener for performance
  let scrollTicking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          updateHeaderState();
          setActiveNavLink();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    },
    { passive: true }
  );

  // Initial state
  updateHeaderState();

  // Immediately reveal sections already in view, then enable animations
  // and observe the rest. Order matters: reveal first, hide second so
  // already-visible content never flashes hidden.
  revealVisibleSections();
  document.documentElement.classList.add("reveal-enabled");
  setupRevealObserver();

  /* ----------------------------------------------------------
     Keyboard Navigation
     ---------------------------------------------------------- */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMenuOpen) {
      closeMenu();
    }
  });

  /* ----------------------------------------------------------
     Set current year in footer
     ---------------------------------------------------------- */
  const yearSpan = document.getElementById("current-year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  /* ----------------------------------------------------------
     Handle hash navigation on load
     ---------------------------------------------------------- */
  if (window.location.hash) {
    setTimeout(() => {
      const target = document.querySelector(window.location.hash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }

  /* ----------------------------------------------------------
     Typing Animation
     ---------------------------------------------------------- */
  const TYPING_PHRASES = [
    "Computer Engineering Student",
    "Full-Stack Developer",
    "Data Science Enthusiast",
    "Aspiring AI Engineer"
  ];

  const TYPING_SPEED = 80;
  const DELETING_SPEED = 40;
  const PAUSE_AFTER_TYPE = 2000;
  const PAUSE_AFTER_DELETE = 400;

  function initTypingAnimation() {
    const typingEl = document.getElementById("typing-text");
    if (!typingEl) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      typingEl.textContent = TYPING_PHRASES[0];
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId = null;

    function tick() {
      const phrase = TYPING_PHRASES[phraseIndex];

      if (!isDeleting) {
        charIndex++;
        typingEl.textContent = phrase.slice(0, charIndex);

        if (charIndex === phrase.length) {
          timeoutId = setTimeout(() => {
            isDeleting = true;
            tick();
          }, PAUSE_AFTER_TYPE);
          return;
        }

        timeoutId = setTimeout(tick, TYPING_SPEED);
      } else {
        charIndex--;
        typingEl.textContent = phrase.slice(0, charIndex);

        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % TYPING_PHRASES.length;
          timeoutId = setTimeout(tick, PAUSE_AFTER_DELETE);
          return;
        }

        timeoutId = setTimeout(tick, DELETING_SPEED);
      }
    }

    tick();
  }

  initTypingAnimation();

})();
