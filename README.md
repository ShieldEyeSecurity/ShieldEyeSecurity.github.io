# ShieldEye Security — Official Website

**Business Name:** ShieldEye Security  
**Tagline:** Strong Protection  
**Services:** 24/7 Security Services  
**Location:** Karachi, Pakistan  
**WhatsApp Order Number:** +92 333 7998890  

---

## Project Directory Structure

```text
ShieldEye Security/
├── index.html
├── visitor-counter-config.js
├── robots.txt
├── sitemap.xml
├── .nojekyll
├── README.md
├── assets/
│   ├── audio/
│   │   └── background.mp3
│   └── images/
│       ├── logo/
│       │   ├── shieldeye-logo.png
│       │   └── favicon.png
│       ├── services/
│       │   ├── access-control-systems.jpg
│       │   ├── alarm-intruder-detection.jpg
│       │   ├── cctv-installation.jpg
│       │   ├── dvr-nvr-setup.jpg
│       │   ├── night-vision-security.jpg
│       │   ├── remote-mobile-monitoring.jpg
│       │   ├── repair-maintenance.jpg
│       │   └── surveillance-24-7.jpg
│       ├── packages/
│       │   ├── advanced-security.jpg
│       │   ├── basic-home-security.jpg
│       │   ├── business-commercial-security.jpg
│       │   ├── enterprise-security-solutions.jpg
│       │   └── standard-home-security.jpg
│       └── promotional/
│           ├── promo-24-7-surveillance.jpg
│           ├── promo-advanced-8-camera-package.jpg
│           ├── promo-basic-home-package.jpg
│           ├── promo-business-office-security.jpg
│           ├── promo-cctv-repair-maintenance.jpg
│           ├── promo-complete-security-solutions.jpg
│           ├── promo-mobile-live-monitoring.jpg
│           ├── promo-night-vision-cameras.jpg
│           ├── promo-professional-cctv-installation.jpg
│           └── promo-standard-4-camera-package.jpg
├── css/
│   ├── style.css
│   ├── animations.css
│   └── responsive.css
└── js/
    ├── app.js
    ├── services.js
    ├── search.js
    ├── cart.js
    ├── whatsapp-checkout.js
    └── visitor-counter.js
```

---

## Key Features Implemented

- **Cinematic Dark Navy Security UI:** Built with `#071426`, `#0B1F38`, `#168BFF`, `#00C8FF`, chamfered tech cards, glassmorphism quick inquiry card, and responsive navigation.
- **15 Security Services & 9 Dynamic Categories:** Interactive filtering across `CCTV Cameras`, `IP Cameras`, `Recording Systems`, `Access Control`, `Home Security`, `Commercial Security`, `Security Accessories`, `Installation Services`, and `Repair & Maintenance`.
- **5 CCTV Security Packages (Zero Pricing):** Displays `"Contact for Details"` / `"Request a Quote"` across the entire site — no prices shown anywhere.
- **Promotional Solutions A–F:** Interactive tabs covering 24/7 Surveillance, 6-step Professional CCTV Installation, Night Vision, Mobile Live Monitoring, Repair & Maintenance, and Complete Security Solutions.
- **Smart Search System:** Instant search suggestions, live filtering across services & packages, trending keyword pills, clear button, and no-results WhatsApp fallback.
- **Multi-Service Order & WhatsApp Checkout:** Select multiple services, choose a package, enter Karachi area & property details, preview the formatted message live, validate required fields, and launch `https://wa.me/923337998890?text=...`.
- **Background Music Support:** Plays `assets/audio/background.mp3` with automatic browser gesture fallback and a navbar Music On/Off toggle.
- **Live Visitor Statistics System:** Tracks Total Visitors, Today's Visitors (resets midnight `Asia/Karachi` PKT), Online Visitors (5-minute heartbeat window), and Total Page Views.

---

## GitHub Pages Deployment Guide

This website uses 100% static HTML, CSS, JavaScript, and relative asset paths — no backend, PHP, or build step is required.

1. **Create a GitHub Repository** (for example `shieldeye-security` or `<username>.github.io`).
2. **Upload Project Files:**
   Push `index.html`, `visitor-counter-config.js`, `robots.txt`, `sitemap.xml`, `.nojekyll`, `README.md`, `assets/`, `css/`, and `js/` to the `main` branch.
   *(Note: You do not need to upload the raw unoptimized source folders if you prefer a smaller repo, though keeping only the project files listed above ensures fast deployment.)*
3. **Enable GitHub Pages:**
   - Go to **Repository Settings → Pages**.
   - Under **Build and deployment → Source**, choose **Deploy from a branch**.
   - Select **Branch: `main`** and folder **`/ (root)`**, then click **Save**.
4. **Access Your Live Site:**
   Wait 1–2 minutes and open `https://<your-github-username>.github.io/<repo-name>/`.

---

## Visitor Analytics Notes & Optional Firebase Setup

Static GitHub Pages hosting has no server-side database:

- **Default (`countapi`) Mode:** Uses `https://countapi.mileshilliard.com/api/v1` with no API keys required. Unique browser UUIDs in `localStorage` prevent counting page refreshes as new unique visitors, and PKT (`Asia/Karachi`) dates reset Today's Visitors at midnight PKT. However, public numeric counter APIs do not maintain a real-time multi-user presence list, so `Online Visitors` tracks active 5-minute browser sessions locally when using CountAPI.
- **Optional Firebase Realtime Database Mode (`firebase`):**
  1. Create a free Firebase project and enable **Realtime Database**.
  2. Open `visitor-counter-config.js`, set `mode: 'firebase'`, and set `firebase.databaseURL` to your public RTDB URL.
  3. **Security Warning:** Never place Firebase service account JSON or private admin credentials in `visitor-counter-config.js`. Configure Firebase Database Rules to permit only numeric increments and valid timestamps under `visitorStats` and `presence`.
- **Automatic Fallback:** If CountAPI or Firebase is unreachable, `js/visitor-counter.js` automatically falls back to browser-local analytics without throwing console errors.
