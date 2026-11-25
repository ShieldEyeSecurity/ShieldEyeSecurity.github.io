(function (global) {
  'use strict';

  const WHATSAPP_NUMBER = '923337998890';

  const SERVICES = [
    {
      id: 'cctv-camera-installation',
      name: 'CCTV Camera Installation',
      categories: ['CCTV Cameras', 'Installation Services', 'Home Security', 'Commercial Security'],
      image: 'assets/images/services/cctv-installation.jpg',
      alt: 'Technician performing CCTV camera installation on building exterior',
      description: 'Complete indoor and outdoor dome, bullet, and wide-angle CCTV camera mounting with neat cabling across Karachi.',
      features: ['Site inspection & blind-spot mapping', 'Weatherproof outdoor mounting', 'Clean concealed conduit routing'],
      keywords: 'cctv camera installation dome bullet outdoor indoor analog hd karachi'
    },
    {
      id: 'ip-camera-installation',
      name: 'IP Camera Installation',
      categories: ['IP Cameras', 'CCTV Cameras', 'Installation Services', 'Commercial Security'],
      image: 'assets/images/services/night-vision-security.jpg',
      alt: 'High-resolution IP security cameras mounted on commercial facade',
      description: 'Network-grade PoE IP camera installation supporting crisp HD surveillance, smart motion zones, and NVR integration.',
      features: ['PoE Cat6 structured cabling', 'Hikvision, Dahua & Tiandy support', 'High-clarity day & night imaging'],
      keywords: 'ip camera poe network hd 4k hikvision dahua tiandy wizsense'
    },
    {
      id: 'dvr-systems',
      name: 'DVR Systems',
      categories: ['Recording Systems', 'Home Security', 'Security Accessories'],
      image: 'assets/images/services/dvr-nvr-setup.jpg',
      alt: 'DVR surveillance recording system setup with multiple camera feeds',
      description: 'Reliable Digital Video Recorder setup with surveillance hard disks, BNC terminations, and continuous loop recording.',
      features: ['4, 8, and 16 channel DVR setup', 'Surveillance HDD installation', 'Scheduled & motion recording'],
      keywords: 'dvr digital video recorder bnc coaxial hard disk hdd recording'
    },
    {
      id: 'nvr-systems',
      name: 'NVR Systems',
      categories: ['Recording Systems', 'IP Cameras', 'Commercial Security'],
      image: 'assets/images/services/dvr-nvr-setup.jpg',
      alt: 'Network Video Recorder NVR configuration for IP cameras',
      description: 'High-bandwidth Network Video Recorders engineered for multi-camera IP surveillance, extended retention, and remote playback.',
      features: ['Multi-channel PoE NVR setup', 'Extended storage retention planning', 'Centralized playback & export'],
      keywords: 'nvr network video recorder ip storage poe commercial warehouse'
    },
    {
      id: 'access-control-systems',
      name: 'Access Control Systems',
      categories: ['Access Control', 'Commercial Security', 'Installation Services'],
      image: 'assets/images/services/access-control-systems.jpg',
      alt: 'Biometric and electronic access control system installed at doorway',
      description: 'Control entry to offices, server rooms, and residential buildings using biometric, PIN, and smart card access terminals.',
      features: ['Biometric & keypad terminals', 'Entry audit trail logging', 'Door controller & exit switch setup'],
      keywords: 'access control biometric fingerprint entry door office security'
    },
    {
      id: 'hidden-camera-solutions',
      name: 'Hidden Camera Solutions',
      categories: ['CCTV Cameras', 'Home Security', 'Commercial Security'],
      image: 'assets/images/services/remote-mobile-monitoring.jpg',
      alt: 'Discreet indoor surveillance camera monitoring setup',
      description: 'Discreet indoor camera configurations designed for lawful residential, nanny-room, and cash-counter oversight.',
      features: ['Compact low-profile enclosures', 'Clear indoor audio/video options', 'App-linked remote viewing'],
      keywords: 'hidden camera discreet indoor pinhole covert home shop counter'
    },
    {
      id: 'time-attendance-systems',
      name: 'Time Attendance Systems',
      categories: ['Access Control', 'Commercial Security'],
      image: 'assets/images/services/access-control-systems.jpg',
      alt: 'Employee biometric time and attendance terminal',
      description: 'Automated biometric and RFID staff attendance machines for offices, clinics, schools, warehouses, and factories.',
      features: ['Fingerprint, face & card verification', 'Shift & attendance log export', 'LAN/USB reporting integration'],
      keywords: 'time attendance biometric staff employee machine office factory'
    },
    {
      id: 'rfid-systems',
      name: 'RFID Systems',
      categories: ['Access Control', 'Security Accessories', 'Commercial Security'],
      image: 'assets/images/services/access-control-systems.jpg',
      alt: 'RFID keycard and tag reader access control unit',
      description: 'Contactless RFID card and keyfob reader installations for secure gates, office floors, and restricted storage rooms.',
      features: ['Fast contactless card & fob entry', 'Multi-door controller support', 'Instant lost-card deactivation'],
      keywords: 'rfid card reader keyfob contactless gate door access'
    },
    {
      id: 'magnetic-door-locks',
      name: 'Magnetic Door Locks',
      categories: ['Access Control', 'Security Accessories', 'Commercial Security'],
      image: 'assets/images/services/access-control-systems.jpg',
      alt: 'Electromagnetic door lock hardware with access reader',
      description: 'Heavy-duty electromagnetic locks for glass, wooden, and metal doors paired with push-to-exit buttons and backup power.',
      features: ['High holding-force maglocks', 'Glass, wood & steel door brackets', 'Fail-safe emergency release'],
      keywords: 'magnetic door lock maglock em lock access control hardware'
    },
    {
      id: 'gsm-home-security',
      name: 'GSM Home Security',
      categories: ['Home Security', 'Security Accessories', 'Installation Services'],
      image: 'assets/images/services/alarm-intruder-detection.jpg',
      alt: 'GSM home security alarm and cellular alert panel',
      description: 'SIM-enabled GSM alarm panels that send immediate call and SMS alerts during unauthorized entry even if Wi-Fi drops.',
      features: ['Cellular SIM call & SMS alerts', 'Door/window contact triggers', 'Battery-backed siren response'],
      keywords: 'gsm home security sim alarm cellular sms call alert'
    },
    {
      id: 'cctv-repair-and-maintenance',
      name: 'CCTV Repair and Maintenance',
      categories: ['Repair & Maintenance', 'CCTV Cameras', 'Recording Systems'],
      image: 'assets/images/services/repair-maintenance.jpg',
      alt: 'Technician repairing and calibrating CCTV camera system',
      description: 'Fast troubleshooting for offline cameras, blurry night vision, DVR/NVR beep errors, power supplies, and damaged cabling.',
      features: ['Camera & BNC connector repair', 'DVR/NVR & HDD diagnostics', 'Scheduled preventive maintenance'],
      keywords: 'cctv repair maintenance troubleshooting fix offline camera hard disk power supply'
    },
    {
      id: 'alarm-monitoring',
      name: 'Alarm Monitoring',
      categories: ['Home Security', 'Commercial Security', 'Security Accessories'],
      image: 'assets/images/services/alarm-intruder-detection.jpg',
      alt: 'Intrusion alarm monitoring control interface',
      description: 'Integrated intrusion alarm setups with high-decibel sirens, panic buttons, and real-time mobile alert notifications.',
      features: ['Zone-based intrusion detection', 'Instant mobile alert notifications', 'Loud indoor & outdoor sirens'],
      keywords: 'alarm monitoring intruder siren panic alert security'
    },
    {
      id: 'sensor-integration',
      name: 'Sensor Integration',
      categories: ['Security Accessories', 'Home Security', 'Commercial Security'],
      image: 'assets/images/services/alarm-intruder-detection.jpg',
      alt: 'Motion and perimeter security sensor setup',
      description: 'Motion PIR sensors, magnetic door/window contacts, and perimeter beam detectors connected into unified security alerts.',
      features: ['PIR motion & perimeter beams', 'Door & shutter magnetic sensors', 'Linked camera recording triggers'],
      keywords: 'sensor integration pir motion door contact perimeter beam'
    },
    {
      id: 'wireless-security-systems',
      name: 'Wireless Security Systems',
      categories: ['Home Security', 'CCTV Cameras', 'IP Cameras'],
      image: 'assets/images/services/remote-mobile-monitoring.jpg',
      alt: 'Wireless smart security camera controlled via smartphone',
      description: 'Clean cable-free Wi-Fi cameras and wireless alarm kits ideal for apartments, rented shops, and quick deployments.',
      features: ['Minimal-drilling quick installation', 'Two-way audio & pan/tilt options', 'Cloud/SD & app alert support'],
      keywords: 'wireless security wifi camera smart home apartment shop'
    },
    {
      id: 'remote-camera-monitoring',
      name: 'Remote Camera Monitoring',
      categories: ['CCTV Cameras', 'IP Cameras', 'Recording Systems', 'Commercial Security'],
      image: 'assets/images/services/remote-mobile-monitoring.jpg',
      alt: 'Remote live CCTV camera monitoring on mobile phone',
      description: 'Configure secure live smartphone, tablet, and desktop viewing with motion notifications and multi-branch camera dashboards.',
      features: ['Android, iOS & PC live viewing', 'Instant motion alert configuration', 'Multi-location feed aggregation'],
      keywords: 'remote camera monitoring mobile live viewing smartphone app 24/7'
    }
  ];

  const PACKAGES = [
    {
      id: 'basic-home-package',
      name: 'Basic Home Security Package',
      propertyType: 'Apartments & Small Homes',
      promoImage: 'assets/images/promotional/promo-basic-home-package.jpg',
      kitImage: 'assets/images/packages/basic-home-security.jpg',
      alt: 'Basic Home Security Package with unbranded CCTV cameras and DVR',
      featured: false,
      features: [
        'Generic unbranded CCTV cameras',
        'DVR recording unit',
        'Hard-drive storage setup',
        'Mobile viewing configuration',
        'Professional installation'
      ],
      keywords: 'basic home security package generic unbranded dvr mobile viewing'
    },
    {
      id: 'standard-4-camera-package',
      name: 'Standard 4-Camera Package',
      propertyType: 'Homes, Shops & Small Offices',
      promoImage: 'assets/images/promotional/promo-standard-4-camera-package.jpg',
      kitImage: 'assets/images/packages/standard-home-security.jpg',
      alt: 'Standard 4-Camera CCTV Security Package',
      featured: true,
      features: [
        'Four CCTV cameras (indoor/outdoor mix)',
        'DVR/NVR recording system',
        'Remote mobile viewing',
        'Infrared night vision',
        'Motion alerts configuration',
        'Professional installation'
      ],
      keywords: 'standard 4 camera package 4-camera home shop office night vision'
    },
    {
      id: 'advanced-8-camera-package',
      name: 'Advanced 8-Camera Package',
      propertyType: 'Villas, Plazas & Medium Offices',
      promoImage: 'assets/images/promotional/promo-advanced-8-camera-package.jpg',
      kitImage: 'assets/images/packages/advanced-security.jpg',
      alt: 'Advanced 8-Camera CCTV Security Package',
      featured: false,
      features: [
        'Eight high-clarity CCTV cameras',
        'DVR/NVR recording system',
        'Extended hard-drive storage',
        'Remote mobile viewing',
        'Infrared night vision',
        'Professional installation'
      ],
      keywords: 'advanced 8 camera package 8-camera extended storage villa office'
    },
    {
      id: 'business-office-security',
      name: 'Business & Office Security',
      propertyType: 'Corporate Offices, Showrooms & Clinics',
      promoImage: 'assets/images/promotional/promo-business-office-security.jpg',
      kitImage: 'assets/images/packages/business-commercial-security.jpg',
      alt: 'Business and Office Security Package with CCTV and access control',
      featured: false,
      features: [
        'Smart CCTV surveillance coverage',
        'Biometric access control integration',
        'AI-powered threat detection capabilities where supported',
        'Real-time security alerts',
        'Centralized security management',
        'Corporate building protection'
      ],
      keywords: 'business office security commercial biometric access control corporate'
    },
    {
      id: 'complete-security-solutions',
      name: 'Complete Security Solutions',
      propertyType: 'Warehouses, Factories & Multi-Site Estates',
      promoImage: 'assets/images/promotional/promo-complete-security-solutions.jpg',
      kitImage: 'assets/images/packages/enterprise-security-solutions.jpg',
      alt: 'Complete Security Solutions for Warehouses and Industries',
      featured: true,
      features: [
        'Full-site CCTV surveillance',
        'Access control systems',
        'Intrusion alarm systems',
        'Biometric security & attendance',
        'Perimeter protection',
        'Centralized security monitoring',
        'Repair and maintenance support',
        '24/7 security protection'
      ],
      keywords: 'complete security solutions enterprise warehouse factory perimeter alarm biometric'
    }
  ];

  let activeCategory = 'All';
  let activeSearchQuery = '';

  function buildWhatsappLink(message) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  function matchesQuery(item, query) {
    if (!query) return true;
    const q = query.trim().toLowerCase();
    const haystack = [
      item.name,
      item.description || '',
      item.propertyType || '',
      item.keywords || '',
      ...(item.categories || []),
      ...(item.features || [])
    ].join(' ').toLowerCase();
    return haystack.includes(q);
  }

  function renderServices() {
    const grid = document.getElementById('services-grid');
    if (!grid) return;

    const selectedSet = global.ShieldEyeCart ? global.ShieldEyeCart.getSelectedServices() : new Set();

    const filtered = SERVICES.filter((svc) => {
      const catMatch = activeCategory === 'All' || svc.categories.includes(activeCategory);
      const searchMatch = matchesQuery(svc, activeSearchQuery);
      return catMatch && searchMatch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '';
    } else {
      grid.innerHTML = filtered.map((svc) => {
        const isSelected = selectedSet.has(svc.name);
        const waMsg = `Hello ShieldEye Security, I would like to request a quote for ${svc.name} in Karachi.`;
        return `
          <article class="service-card ${isSelected ? 'selected' : ''}" data-service-id="${svc.id}">
            <div class="service-card-media">
              <img src="${svc.image}" alt="${svc.alt}" loading="lazy" width="600" height="375" />
              <span class="service-cat-badge">${svc.categories[0]}</span>
            </div>
            <div class="service-card-body">
              <h3>${svc.name}</h3>
              <p>${svc.description}</p>
              <ul class="card-features">
                ${svc.features.map((f) => `<li>${f}</li>`).join('')}
              </ul>
              <span class="card-quote-tag">Contact for Details &bull; Karachi</span>
              <div class="card-actions">
                <button
                  type="button"
                  class="btn ${isSelected ? 'btn-cyan' : 'btn-primary'} btn-sm js-order-service"
                  data-service-name="${svc.name}"
                  data-service-category="${svc.categories[0]}"
                >
                  ${isSelected ? 'Selected &check;' : 'Order Service'}
                </button>
                <a
                  href="${buildWhatsappLink(waMsg)}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-whatsapp btn-sm"
                  aria-label="Inquire about ${svc.name} on WhatsApp"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </article>
        `;
      }).join('');
    }

    updateSearchMeta(filtered.length);
  }

  function renderPackages() {
    const grid = document.getElementById('packages-grid');
    if (!grid) return;

    const filtered = PACKAGES.filter((pkg) => matchesQuery(pkg, activeSearchQuery));

    grid.innerHTML = filtered.map((pkg) => {
      const waMsg = `Hello ShieldEye Security, I would like to request a quote for the ${pkg.name} (${pkg.propertyType}) in Karachi.`;
      return `
        <article class="package-card ${pkg.featured ? 'featured' : ''}" data-package-id="${pkg.id}">
          <div class="package-media-wrap">
            <img class="package-promo-img" src="${pkg.promoImage}" alt="${pkg.alt}" loading="lazy" width="800" height="500" />
            <img class="package-kit-thumb" src="${pkg.kitImage}" alt="${pkg.name} hardware kit preview" loading="lazy" width="168" height="168" />
          </div>
          <div class="package-body">
            <span class="package-property-tag">${pkg.propertyType}</span>
            <h3>${pkg.name}</h3>
            <ul class="card-features">
              ${pkg.features.map((f) => `<li>${f}</li>`).join('')}
            </ul>
            <div class="package-quote-line">Request a Quote &mdash; Contact for Details</div>
            <div class="card-actions">
              <button
                type="button"
                class="btn btn-primary btn-sm js-request-package"
                data-package-name="${pkg.name}"
              >
                Request Package
              </button>
              <a
                href="${buildWhatsappLink(waMsg)}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-whatsapp btn-sm"
                aria-label="WhatsApp quote for ${pkg.name}"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    return filtered.length;
  }

  function updateSearchMeta(serviceCount) {
    const metaEl = document.getElementById('search-results-meta');
    const countEl = document.getElementById('search-results-count');
    const noResultsEl = document.getElementById('search-no-results');
    const pkgCount = PACKAGES.filter((p) => matchesQuery(p, activeSearchQuery)).length;

    if (!metaEl || !countEl || !noResultsEl) return;

    if (activeSearchQuery.trim() !== '' || activeCategory !== 'All') {
      metaEl.hidden = false;
      countEl.textContent = `Showing ${serviceCount} service${serviceCount === 1 ? '' : 's'} & ${pkgCount} package${pkgCount === 1 ? '' : 's'}${activeCategory !== 'All' ? ` in "${activeCategory}"` : ''}${activeSearchQuery ? ` matching "${activeSearchQuery}"` : ''}.`;
    } else {
      metaEl.hidden = true;
    }

    noResultsEl.hidden = !(activeSearchQuery.trim() !== '' && serviceCount === 0 && pkgCount === 0);
  }

  function setCategory(category) {
    activeCategory = category || 'All';
    document.querySelectorAll('#service-categories .cat-btn').forEach((btn) => {
      const isMatch = btn.dataset.category === activeCategory;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', String(isMatch));
    });
    renderServices();
  }

  function setSearchQuery(query) {
    activeSearchQuery = query || '';
    renderServices();
    renderPackages();
  }

  function initCatalog() {
    const catBar = document.getElementById('service-categories');
    if (catBar) {
      catBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.cat-btn');
        if (!btn) return;
        setCategory(btn.dataset.category);
      });
    }

    renderServices();
    renderPackages();
  }

  global.ShieldEyeCatalog = {
    WHATSAPP_NUMBER,
    SERVICES,
    PACKAGES,
    initCatalog,
    renderServices,
    renderPackages,
    setCategory,
    setSearchQuery,
    buildWhatsappLink
  };
})(window);
