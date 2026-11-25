(function (global) {
  'use strict';

  const selectedServices = new Set();

  function getSelectedServices() {
    return selectedServices;
  }

  function renderChecklist() {
    const container = document.getElementById('order-services-checklist');
    if (!container || !global.ShieldEyeCatalog) return;

    container.innerHTML = global.ShieldEyeCatalog.SERVICES.map((svc) => {
      const checked = selectedServices.has(svc.name) ? 'checked' : '';
      return `
        <label class="svc-check-item">
          <input type="checkbox" value="${svc.name}" ${checked} />
          <span>${svc.name}</span>
        </label>
      `;
    }).join('');
  }

  function syncUI() {
    const countEl = document.getElementById('basket-count');
    const summaryCountEl = document.getElementById('summary-service-count');
    const chipsContainer = document.getElementById('summary-selected-chips');
    const checklist = document.getElementById('order-services-checklist');

    if (countEl) countEl.textContent = String(selectedServices.size);
    if (summaryCountEl) summaryCountEl.textContent = String(selectedServices.size);

    if (checklist) {
      checklist.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        cb.checked = selectedServices.has(cb.value);
      });
    }

    if (chipsContainer) {
      if (selectedServices.size === 0) {
        chipsContainer.innerHTML = '<span class="empty-chip">No services selected yet — pick from the list or cards</span>';
      } else {
        chipsContainer.innerHTML = Array.from(selectedServices).map((name) => `
          <span class="selected-chip">
            ${name}
            <button type="button" class="js-remove-service" data-service="${name}" aria-label="Remove ${name}">&times;</button>
          </span>
        `).join('');
      }
    }

    document.querySelectorAll('#services-grid .service-card').forEach((card) => {
      const btn = card.querySelector('.js-order-service');
      if (!btn) return;
      const isSel = selectedServices.has(btn.dataset.serviceName);
      card.classList.toggle('selected', isSel);
      btn.classList.toggle('btn-cyan', isSel);
      btn.classList.toggle('btn-primary', !isSel);
      btn.innerHTML = isSel ? 'Selected &check;' : 'Order Service';
    });

    if (global.ShieldEyeCheckout) {
      global.ShieldEyeCheckout.updatePreview();
    }
  }

  function toggleService(serviceName, categoryHint) {
    if (selectedServices.has(serviceName)) {
      selectedServices.delete(serviceName);
    } else {
      selectedServices.add(serviceName);
      if (categoryHint) {
        const catSelect = document.getElementById('order-category');
        if (catSelect && Array.from(catSelect.options).some((o) => o.value === categoryHint)) {
          catSelect.value = categoryHint;
        }
      }
    }
    syncUI();
  }

  function selectService(serviceName, scrollToForm) {
    if (serviceName) {
      selectedServices.add(serviceName);
    }
    syncUI();
    if (scrollToForm) {
      const target = document.getElementById('request-service');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function selectPackage(packageName, scrollToForm) {
    const pkgSelect = document.getElementById('order-package');
    if (pkgSelect && packageName) {
      pkgSelect.value = packageName;
    }
    if (global.ShieldEyeCheckout) {
      global.ShieldEyeCheckout.updatePreview();
    }
    if (scrollToForm) {
      const target = document.getElementById('request-service');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function clearServices() {
    selectedServices.clear();
    syncUI();
  }

  function initCart() {
    renderChecklist();

    document.addEventListener('click', (e) => {
      const orderBtn = e.target.closest('.js-order-service');
      if (orderBtn) {
        const name = orderBtn.dataset.serviceName;
        const cat = orderBtn.dataset.serviceCategory;
        const wasSelected = selectedServices.has(name);
        toggleService(name, cat);
        if (!wasSelected) {
          const reqSection = document.getElementById('request-service');
          if (reqSection && window.innerWidth < 768) {
            // Keep smooth browsing on desktop; allow quick jump via basket button
          }
        }
        return;
      }

      const pkgBtn = e.target.closest('.js-request-package');
      if (pkgBtn) {
        selectPackage(pkgBtn.dataset.packageName, true);
        return;
      }

      const removeBtn = e.target.closest('.js-remove-service');
      if (removeBtn) {
        selectedServices.delete(removeBtn.dataset.service);
        syncUI();
      }
    });

    const checklist = document.getElementById('order-services-checklist');
    if (checklist) {
      checklist.addEventListener('change', (e) => {
        if (e.target.matches('input[type="checkbox"]')) {
          if (e.target.checked) {
            selectedServices.add(e.target.value);
          } else {
            selectedServices.delete(e.target.value);
          }
          syncUI();
        }
      });
    }

    const clearBtn = document.getElementById('clear-selected-services');
    if (clearBtn) {
      clearBtn.addEventListener('click', clearServices);
    }

    syncUI();
  }

  global.ShieldEyeCart = {
    getSelectedServices,
    toggleService,
    selectService,
    selectPackage,
    clearServices,
    initCart
  };
})(window);
