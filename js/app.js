(function (global) {
  'use strict';

  function initHeaderAndMobileMenu() {
    const header = document.getElementById('site-header');
    const menuBtn = document.getElementById('mobile-menu-toggle');
    const drawer = document.getElementById('mobile-drawer');

    window.addEventListener('scroll', () => {
      if (!header) return;
      header.classList.toggle('scrolled', window.scrollY > 24);
    }, { passive: true });

    if (menuBtn && drawer) {
      menuBtn.addEventListener('click', () => {
        const isOpen = drawer.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', String(isOpen));
        drawer.setAttribute('aria-hidden', String(!isOpen));
      });

      drawer.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          drawer.classList.remove('open');
          menuBtn.setAttribute('aria-expanded', 'false');
          drawer.setAttribute('aria-hidden', 'true');
        });
      });
    }
  }

  function initHeroShowcase() {
    const img = document.getElementById('hero-rotator-img');
    const dots = Array.from(document.querySelectorAll('.showcase-dot'));
    if (!img || dots.length === 0) return;

    let currentIdx = 0;
    let timerId = null;

    function activateSlide(idx) {
      currentIdx = idx;
      const dot = dots[idx];
      img.src = dot.dataset.promo;
      img.alt = dot.dataset.alt || 'ShieldEye Security';
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        activateSlide(idx);
        if (timerId) {
          clearInterval(timerId);
          timerId = setInterval(() => activateSlide((currentIdx + 1) % dots.length), 5500);
        }
      });
    });

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion) {
      timerId = setInterval(() => activateSlide((currentIdx + 1) % dots.length), 5500);
    }
  }

  function initSolutionsTabs() {
    const tabBar = document.getElementById('solutions-tabs');
    const panels = document.querySelectorAll('.solution-panel');
    if (!tabBar) return;

    function openSolution(key) {
      tabBar.querySelectorAll('.sol-tab').forEach((t) => {
        const active = t.dataset.sol === key;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
      });
      panels.forEach((p) => {
        const active = p.dataset.panel === key;
        p.hidden = !active;
        p.classList.toggle('active', active);
      });
    }

    tabBar.addEventListener('click', (e) => {
      const tab = e.target.closest('.sol-tab');
      if (!tab) return;
      openSolution(tab.dataset.sol);
    });

    document.querySelectorAll('[data-open-sol]').forEach((link) => {
      link.addEventListener('click', () => {
        openSolution(link.dataset.openSol);
      });
    });
  }

  function initDeepShortcuts() {
    // Prefill service/package/mode buttons across Solutions & Contact sections
    document.querySelectorAll('[data-prefill-service]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (global.ShieldEyeCart) {
          global.ShieldEyeCart.selectService(btn.dataset.prefillService, false);
        }
      });
    });

    document.querySelectorAll('[data-prefill-package]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (global.ShieldEyeCart) {
          global.ShieldEyeCart.selectPackage(btn.dataset.prefillPackage, false);
        }
      });
    });

    document.querySelectorAll('[data-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modeVal = btn.dataset.mode;
        const radio = document.querySelector(`input[name="requestType"][value="${modeVal}"]`);
        if (radio) {
          radio.checked = true;
          if (global.ShieldEyeCheckout) global.ShieldEyeCheckout.updatePreview();
        }
      });
    });

    document.querySelectorAll('[data-filter-cat]').forEach((link) => {
      link.addEventListener('click', () => {
        if (global.ShieldEyeCatalog) {
          global.ShieldEyeCatalog.setCategory(link.dataset.filterCat);
        }
      });
    });
  }

  function initBackgroundAudio() {
    const audio = document.getElementById('bg-music');
    const toggleBtn = document.getElementById('audio-toggle-btn');
    const statusText = document.getElementById('audio-status-text');
    if (!audio || !toggleBtn) return;

    audio.volume = 0.32;
    let userExplicitlyPaused = false;

    function updateAudioUI(isPlaying) {
      toggleBtn.classList.toggle('playing', isPlaying);
      toggleBtn.setAttribute('aria-pressed', String(isPlaying));
      if (statusText) {
        statusText.textContent = isPlaying ? 'Music On' : 'Music Off';
      }
    }

    function attemptPlay() {
      if (userExplicitlyPaused) return;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => updateAudioUI(true))
          .catch(() => updateAudioUI(false));
      }
    }

    // Attempt immediate autoplay on page open
    attemptPlay();

    // Fallback: start smoothly on first user interaction if browser policy blocked autoplay
    const unlockEvents = ['pointerdown', 'keydown', 'touchstart'];
    function unlockOnGesture(e) {
      if (e.target.closest('#audio-toggle-btn')) return;
      if (audio.paused && !userExplicitlyPaused) {
        attemptPlay();
      }
      unlockEvents.forEach((evt) => document.removeEventListener(evt, unlockOnGesture));
    }
    unlockEvents.forEach((evt) => document.addEventListener(evt, unlockOnGesture, { passive: true }));

    toggleBtn.addEventListener('click', () => {
      if (audio.paused) {
        userExplicitlyPaused = false;
        audio.play().then(() => updateAudioUI(true)).catch(() => updateAudioUI(false));
      } else {
        userExplicitlyPaused = true;
        audio.pause();
        updateAudioUI(false);
      }
    });
  }

  function initScrollReveal() {
    const targets = document.querySelectorAll('.trust-card, .spotlight-banner, .equip-card, .about-grid, .contact-wrapper');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    targets.forEach((el) => el.classList.add('scroll-reveal'));
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    targets.forEach((el) => obs.observe(el));
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (global.ShieldEyeCatalog) global.ShieldEyeCatalog.initCatalog();
    if (global.ShieldEyeCart) global.ShieldEyeCart.initCart();
    if (global.ShieldEyeSearch) global.ShieldEyeSearch.initSearch();
    if (global.ShieldEyeCheckout) global.ShieldEyeCheckout.initCheckout();
    if (global.ShieldEyeVisitors) global.ShieldEyeVisitors.initVisitorStats();

    initHeaderAndMobileMenu();
    initHeroShowcase();
    initSolutionsTabs();
    initDeepShortcuts();
    initBackgroundAudio();
    initScrollReveal();
  });
})(window);
