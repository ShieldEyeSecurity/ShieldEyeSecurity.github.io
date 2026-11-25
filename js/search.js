(function (global) {
  'use strict';

  function buildSearchIndex() {
    const items = [];
    if (!global.ShieldEyeCatalog) return items;

    global.ShieldEyeCatalog.SERVICES.forEach((svc) => {
      items.push({
        label: svc.name,
        type: 'Service',
        target: '#services',
        query: svc.name
      });
    });

    global.ShieldEyeCatalog.PACKAGES.forEach((pkg) => {
      items.push({
        label: pkg.name,
        type: 'Package',
        target: '#packages',
        query: pkg.name
      });
    });

    const categories = [
      'CCTV Cameras', 'IP Cameras', 'Recording Systems', 'Access Control',
      'Home Security', 'Commercial Security', 'Security Accessories',
      'Installation Services', 'Repair & Maintenance'
    ];
    categories.forEach((cat) => {
      items.push({
        label: cat,
        type: 'Category',
        target: '#services',
        query: cat,
        isCategory: true
      });
    });

    return items;
  }

  function initSearch() {
    const input = document.getElementById('smart-search-input');
    const clearBtn = document.getElementById('search-clear-btn');
    const suggestionsEl = document.getElementById('search-suggestions');
    const trendingWrap = document.getElementById('trending-pills');
    const resetMetaBtn = document.getElementById('reset-all-filters-btn');
    const noResultsResetBtn = document.getElementById('no-results-reset-btn');
    const navSearchToggle = document.getElementById('nav-search-toggle');

    if (!input || !global.ShieldEyeCatalog) return;

    const index = buildSearchIndex();

    function applyQuery(val, scrollToTarget) {
      const clean = (val || '').trim();
      if (clearBtn) clearBtn.hidden = clean.length === 0;
      global.ShieldEyeCatalog.setSearchQuery(clean);
      if (scrollToTarget) {
        const el = document.querySelector(scrollToTarget);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }

    function renderSuggestions(val) {
      if (!suggestionsEl) return;
      const q = (val || '').trim().toLowerCase();
      if (!q) {
        suggestionsEl.hidden = true;
        suggestionsEl.innerHTML = '';
        return;
      }

      const matches = index.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 7);
      if (matches.length === 0) {
        suggestionsEl.hidden = true;
        return;
      }

      suggestionsEl.innerHTML = matches.map((m) => `
        <button type="button" class="suggestion-item" role="option" data-query="${m.query}" data-target="${m.target}" data-is-cat="${Boolean(m.isCategory)}">
          <span>${m.label}</span>
          <span class="suggestion-type">${m.type}</span>
        </button>
      `).join('');
      suggestionsEl.hidden = false;
    }

    input.addEventListener('input', () => {
      applyQuery(input.value);
      renderSuggestions(input.value);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (suggestionsEl) suggestionsEl.hidden = true;
      }
    });

    if (suggestionsEl) {
      suggestionsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.suggestion-item');
        if (!btn) return;
        const isCat = btn.dataset.isCat === 'true';
        if (isCat) {
          input.value = '';
          if (clearBtn) clearBtn.hidden = true;
          global.ShieldEyeCatalog.setSearchQuery('');
          global.ShieldEyeCatalog.setCategory(btn.dataset.query);
        } else {
          input.value = btn.dataset.query;
          applyQuery(btn.dataset.query, btn.dataset.target);
        }
        suggestionsEl.hidden = true;
        const target = document.querySelector(btn.dataset.target);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-input-wrap') && suggestionsEl) {
        suggestionsEl.hidden = true;
      }
    });

    if (trendingWrap) {
      trendingWrap.addEventListener('click', (e) => {
        const pill = e.target.closest('.trending-pill');
        if (!pill) return;
        const q = pill.dataset.query;
        input.value = q;
        global.ShieldEyeCatalog.setCategory('All');
        applyQuery(q, '#services');
        if (suggestionsEl) suggestionsEl.hidden = true;
      });
    }

    function resetAll() {
      input.value = '';
      if (clearBtn) clearBtn.hidden = true;
      if (suggestionsEl) suggestionsEl.hidden = true;
      global.ShieldEyeCatalog.setCategory('All');
      global.ShieldEyeCatalog.setSearchQuery('');
    }

    if (clearBtn) clearBtn.addEventListener('click', resetAll);
    if (resetMetaBtn) resetMetaBtn.addEventListener('click', resetAll);
    if (noResultsResetBtn) noResultsResetBtn.addEventListener('click', resetAll);

    if (navSearchToggle) {
      navSearchToggle.addEventListener('click', () => {
        const section = document.getElementById('smart-search-section');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => input.focus({ preventScroll: true }), 350);
      });
    }
  }

  global.ShieldEyeSearch = {
    initSearch
  };
})(window);
