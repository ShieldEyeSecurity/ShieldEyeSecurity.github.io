(function (global) {
  'use strict';

  function getSelectedPreferences() {
    const checks = document.querySelectorAll('#camera-preferences input[type="checkbox"]:checked');
    const vals = Array.from(checks).map((c) => c.value);
    return vals.length ? vals.join(', ') : 'No Preference';
  }

  function getRequestType() {
    const checked = document.querySelector('input[name="requestType"]:checked');
    return checked ? checked.value : 'New Installation';
  }

  function buildOrderMessage() {
    const name = (document.getElementById('order-name')?.value || '').trim() || '[Not provided]';
    const phone = (document.getElementById('order-phone')?.value || '').trim() || '[Not provided]';
    const property = document.getElementById('order-property')?.value || 'Home';
    const reqType = getRequestType();
    const category = document.getElementById('order-category')?.value || 'General Security Inquiry';
    const pkg = document.getElementById('order-package')?.value || 'None / Custom Service Selection';
    const area = (document.getElementById('order-area')?.value || '').trim() || '[Karachi area not specified]';
    const address = (document.getElementById('order-address')?.value || '').trim() || 'Will share on WhatsApp';
    const prefDate = document.getElementById('order-date')?.value || 'Flexible / Earliest Available';
    const notes = (document.getElementById('order-notes')?.value || '').trim() || 'None';
    const prefs = getSelectedPreferences();

    const selectedServices = global.ShieldEyeCart
      ? Array.from(global.ShieldEyeCart.getSelectedServices())
      : [];
    const servicesText = selectedServices.length ? selectedServices.join(', ') : 'General Consultation / Package Inquiry';

    return [
      'SHIELDEYE SECURITY – SERVICE REQUEST',
      '',
      `Customer Name: ${name}`,
      `Contact Number: ${phone}`,
      `Property Type: ${property}`,
      `Request Type: ${reqType}`,
      `Service Category: ${category}`,
      `Selected Services: ${servicesText}`,
      `Selected Package: ${pkg}`,
      `Preferred Date: ${prefDate}`,
      `Location: ${area}, Karachi`,
      `Installation Address: ${address}`,
      `Camera Preferences: ${prefs}`,
      `Additional Requirements: ${notes}`,
      '',
      'Please contact me regarding installation and service details.'
    ].join('\n');
  }

  function updatePreview() {
    const previewEl = document.getElementById('whatsapp-message-preview');
    const pkgTextEl = document.getElementById('summary-package-text');
    const pkgSelect = document.getElementById('order-package');

    if (pkgTextEl && pkgSelect) {
      pkgTextEl.textContent = pkgSelect.value;
    }
    if (previewEl) {
      previewEl.textContent = buildOrderMessage();
    }
  }

  function isValidPhone(raw) {
    const digits = raw.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  }

  function initCheckout() {
    const form = document.getElementById('service-order-form');
    const dateInput = document.getElementById('order-date');
    if (dateInput) {
      const todayStr = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', todayStr);
    }

    if (form) {
      form.addEventListener('input', updatePreview);
      form.addEventListener('change', updatePreview);

      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameEl = document.getElementById('order-name');
        const phoneEl = document.getElementById('order-phone');
        const areaEl = document.getElementById('order-area');
        const errName = document.getElementById('err-name');
        const errPhone = document.getElementById('err-phone');
        const errArea = document.getElementById('err-area');
        const formErr = document.getElementById('order-form-error');

        let valid = true;
        errName.textContent = '';
        errPhone.textContent = '';
        errArea.textContent = '';
        formErr.textContent = '';

        if (!nameEl.value.trim() || nameEl.value.trim().length < 2) {
          errName.textContent = 'Please enter your full name.';
          valid = false;
        }
        if (!isValidPhone(phoneEl.value)) {
          errPhone.textContent = 'Please enter a valid WhatsApp or phone number.';
          valid = false;
        }
        if (!areaEl.value.trim()) {
          errArea.textContent = 'Please enter your Karachi area or neighborhood.';
          valid = false;
        }

        const selectedCount = global.ShieldEyeCart ? global.ShieldEyeCart.getSelectedServices().size : 0;
        const pkgVal = document.getElementById('order-package')?.value || '';
        const hasPackage = pkgVal && pkgVal !== 'None / Custom Service Selection';

        if (selectedCount === 0 && !hasPackage) {
          formErr.textContent = 'Please select at least one security service or CCTV package above.';
          valid = false;
        }

        if (!valid) {
          const firstError = form.querySelector('.field-error:not(:empty), #order-form-error:not(:empty)');
          if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        const msg = buildOrderMessage();
        const url = global.ShieldEyeCatalog.buildWhatsappLink(msg);
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    }

    // Hero Quick Consultation Form
    const quickForm = document.getElementById('hero-quick-form');
    if (quickForm) {
      quickForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('hq-name').value.trim();
        const phone = document.getElementById('hq-phone').value.trim();
        const prop = document.getElementById('hq-property').value;
        const area = document.getElementById('hq-area').value.trim() || 'Karachi';
        const errEl = document.getElementById('hq-error');

        if (!name || !isValidPhone(phone)) {
          errEl.textContent = 'Enter your name and valid WhatsApp/phone number.';
          return;
        }
        errEl.textContent = '';

        const msg = [
          'SHIELDEYE SECURITY – QUICK CONSULTATION',
          '',
          `Customer Name: ${name}`,
          `Contact Number: ${phone}`,
          `Property Type: ${prop}`,
          `Location: ${area}, Karachi`,
          '',
          'Please contact me for a CCTV security consultation.'
        ].join('\n');

        window.open(global.ShieldEyeCatalog.buildWhatsappLink(msg), '_blank', 'noopener,noreferrer');
      });
    }

    // Contact Section Direct WhatsApp Form
    const contactForm = document.getElementById('contact-whatsapp-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contact-name').value.trim();
        const phone = document.getElementById('contact-phone').value.trim();
        const topic = document.getElementById('contact-topic').value;
        const message = document.getElementById('contact-message').value.trim();
        const errEl = document.getElementById('contact-form-error');

        if (!name || !isValidPhone(phone) || !message) {
          errEl.textContent = 'Please complete your name, valid phone number, and message.';
          return;
        }
        errEl.textContent = '';

        const msg = [
          'SHIELDEYE SECURITY – CONTACT INQUIRY',
          '',
          `Name: ${name}`,
          `Phone: ${phone}`,
          `Subject: ${topic}`,
          `Location: Karachi, Pakistan`,
          `Message: ${message}`
        ].join('\n');

        window.open(global.ShieldEyeCatalog.buildWhatsappLink(msg), '_blank', 'noopener,noreferrer');
      });
    }

    updatePreview();
  }

  global.ShieldEyeCheckout = {
    initCheckout,
    updatePreview,
    buildOrderMessage
  };
})(window);
