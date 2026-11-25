(function (global) {
  'use strict';

  const STORAGE_KEYS = {
    UUID: 'se_visitor_uuid',
    LOCAL_TOTAL_COUNTED: 'se_local_total_counted',
    LOCAL_TODAY_DATE: 'se_local_today_date',
    REMOTE_TOTAL_COUNTED: 'se_remote_total_counted',
    REMOTE_TODAY_DATE: 'se_remote_today_date',
    LOCAL_STATS: 'se_local_visitor_stats',
    ONLINE_SESSIONS: 'se_online_sessions'
  };

  function getConfig() {
    return Object.assign({
      mode: 'countapi',
      namespace: 'shieldeye-security-karachi-pk',
      timezone: 'Asia/Karachi',
      onlineWindowMs: 5 * 60 * 1000,
      heartbeatIntervalMs: 30 * 1000,
      requestTimeoutMs: 15000,
      countApi: { baseUrl: 'https://countapi.mileshilliard.com/api/v1' },
      firebase: { databaseURL: '' }
    }, global.VISITOR_COUNTER_CONFIG || {});
  }

  function generateUUID() {
    if (global.crypto && typeof global.crypto.randomUUID === 'function') {
      return global.crypto.randomUUID();
    }
    return 'se-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  function getOrCreateVisitorId() {
    let id = localStorage.getItem(STORAGE_KEYS.UUID);
    if (!id) {
      id = generateUUID();
      localStorage.setItem(STORAGE_KEYS.UUID, id);
    }
    return id;
  }

  function getPakistanDateString() {
    try {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Karachi',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(new Date());
      const map = {};
      parts.forEach((p) => { map[p.type] = p.value; });
      return `${map.year}-${map.month}-${map.day}`;
    } catch (_) {
      const utcMs = Date.now() + (new Date().getTimezoneOffset() * 60000);
      const pkt = new Date(utcMs + (5 * 3600000));
      return pkt.toISOString().slice(0, 10);
    }
  }

  function getPakistanTimeString() {
    try {
      return new Intl.DateTimeFormat('en-PK', {
        timeZone: 'Asia/Karachi',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(new Date());
    } catch (_) {
      return 'PKT (UTC+5)';
    }
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function fetchWithTimeout(url, options, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, Object.assign({}, options || {}, { signal: controller.signal }))
      .finally(() => clearTimeout(timer));
  }

  function readLocalStats(pktDate) {
    let data = { totalVisitors: 0, totalViews: 0, daily: {} };
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_STATS);
      if (raw) data = Object.assign(data, JSON.parse(raw));
    } catch (_) {
      // ignore parse errors
    }
    if (!data.daily || typeof data.daily !== 'object') data.daily = {};
    if (typeof data.daily[pktDate] !== 'number') {
      data.daily = { [pktDate]: 0 };
    }
    return data;
  }

  function writeLocalStats(data) {
    try {
      localStorage.setItem(STORAGE_KEYS.LOCAL_STATS, JSON.stringify(data));
    } catch (_) {
      // ignore quota errors
    }
  }

  function updateLocalPresence(visitorId, windowMs) {
    const now = Date.now();
    let sessions = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ONLINE_SESSIONS);
      if (raw) sessions = JSON.parse(raw) || {};
    } catch (_) {
      sessions = {};
    }

    Object.keys(sessions).forEach((id) => {
      if (!sessions[id] || (now - sessions[id]) > windowMs) {
        delete sessions[id];
      }
    });

    sessions[visitorId] = now;
    try {
      localStorage.setItem(STORAGE_KEYS.ONLINE_SESSIONS, JSON.stringify(sessions));
    } catch (_) {
      // ignore
    }
    return Math.max(1, Object.keys(sessions).length);
  }

  async function countApiRequest(baseUrl, action, key, timeoutMs) {
    const cleanBase = baseUrl.replace(/\/$/, '');
    const endpoint = `${cleanBase}/${action}/${encodeURIComponent(key)}`;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetchWithTimeout(endpoint, { method: 'GET' }, timeoutMs);
        if (res.status === 404 && action === 'get') {
          // Key not initialized yet on CountAPI — initialize with a hit
          return countApiRequest(baseUrl, 'hit', key, timeoutMs);
        }
        if (res.status === 503 || res.status === 429) {
          await sleep(600 * (attempt + 1));
          continue;
        }
        if (!res.ok) throw new Error(`CountAPI HTTP ${res.status}`);
        const json = await res.json();
        const val = Number(json.value ?? json.count ?? json.hits);
        if (!Number.isFinite(val)) throw new Error('Invalid CountAPI payload');
        return val;
      } catch (err) {
        if (attempt === 1) throw err;
        await sleep(500);
      }
    }
    throw new Error('CountAPI retries exhausted');
  }

  async function firebaseGet(baseUrl, path, timeoutMs) {
    const res = await fetchWithTimeout(`${baseUrl.replace(/\/$/, '')}/${path}.json`, { method: 'GET' }, timeoutMs);
    if (!res.ok) throw new Error(`Firebase HTTP ${res.status}`);
    return res.json();
  }

  async function firebasePut(baseUrl, path, data, timeoutMs) {
    const res = await fetchWithTimeout(`${baseUrl.replace(/\/$/, '')}/${path}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }, timeoutMs);
    if (!res.ok) throw new Error(`Firebase PUT HTTP ${res.status}`);
    return res.json();
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = typeof val === 'number' ? val.toLocaleString('en-US') : String(val);
  }

  function initVisitorStats() {
    const cfg = getConfig();
    const visitorId = getOrCreateVisitorId();
    const pktDate = getPakistanDateString();
    const dateBadge = document.getElementById('pkt-date-badge');
    const modeNote = document.getElementById('visitor-mode-note');

    if (dateBadge) {
      dateBadge.textContent = `${pktDate} \u2022 ${getPakistanTimeString()} PKT`;
    }

    const isNewLocalTotal = !localStorage.getItem(STORAGE_KEYS.LOCAL_TOTAL_COUNTED);
    const isNewLocalToday = localStorage.getItem(STORAGE_KEYS.LOCAL_TODAY_DATE) !== pktDate;

    const localData = readLocalStats(pktDate);
    if (isNewLocalTotal) {
      localData.totalVisitors += 1;
      localStorage.setItem(STORAGE_KEYS.LOCAL_TOTAL_COUNTED, '1');
    }
    if (isNewLocalToday) {
      localData.daily[pktDate] = (localData.daily[pktDate] || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.LOCAL_TODAY_DATE, pktDate);
    }
    localData.totalViews += 1;
    writeLocalStats(localData);

    const localOnline = updateLocalPresence(visitorId, cfg.onlineWindowMs);
    setText('stat-total-visitors', localData.totalVisitors);
    setText('stat-today-visitors', localData.daily[pktDate]);
    setText('stat-online-visitors', localOnline);
    setText('stat-total-views', localData.totalViews);

    let activeBackend = 'local';
    let lastRemoteViews = localData.totalViews;
    let viewSyncTimer = null;

    async function syncWithCountAPI() {
      const ns = cfg.namespace;
      const base = cfg.countApi.baseUrl;
      const totalKey = `${ns}_total_visitors`;
      const todayKey = `${ns}_daily_${pktDate}`;
      const viewsKey = `${ns}_total_views`;

      const needRemoteTotal = !localStorage.getItem(STORAGE_KEYS.REMOTE_TOTAL_COUNTED);
      const needRemoteToday = localStorage.getItem(STORAGE_KEYS.REMOTE_TODAY_DATE) !== pktDate;

      let successCount = 0;

      const totalPromise = countApiRequest(base, needRemoteTotal ? 'hit' : 'get', totalKey, cfg.requestTimeoutMs)
        .then((val) => {
          localStorage.setItem(STORAGE_KEYS.REMOTE_TOTAL_COUNTED, '1');
          setText('stat-total-visitors', val);
          successCount += 1;
        });

      const todayPromise = countApiRequest(base, needRemoteToday ? 'hit' : 'get', todayKey, cfg.requestTimeoutMs)
        .then((val) => {
          localStorage.setItem(STORAGE_KEYS.REMOTE_TODAY_DATE, pktDate);
          setText('stat-today-visitors', val);
          successCount += 1;
        });

      const viewsPromise = countApiRequest(base, 'hit', viewsKey, cfg.requestTimeoutMs)
        .then((val) => {
          lastRemoteViews = Math.max(val, localData.totalViews);
          setText('stat-total-views', lastRemoteViews);
          successCount += 1;
        });

      await Promise.allSettled([totalPromise, todayPromise, viewsPromise]);

      if (successCount === 0) {
        throw new Error('All CountAPI requests failed');
      }

      setText('stat-online-visitors', updateLocalPresence(visitorId, cfg.onlineWindowMs));
      activeBackend = 'countapi';
      if (modeNote) {
        modeNote.textContent = successCount === 3
          ? 'Synced via CountAPI (unique browser UUID + PKT daily reset; Online count tracks active 5-min browser sessions).'
          : `Partially synced via CountAPI (${successCount}/3 metrics live; remaining metric using local fallback).`;
      }
    }

    async function syncWithFirebase() {
      const dbUrl = (cfg.firebase && cfg.firebase.databaseURL || '').trim();
      if (!dbUrl) throw new Error('Firebase databaseURL not configured');

      const needRemoteTotal = !localStorage.getItem(STORAGE_KEYS.REMOTE_TOTAL_COUNTED);
      const needRemoteToday = localStorage.getItem(STORAGE_KEYS.REMOTE_TODAY_DATE) !== pktDate;

      const stats = (await firebaseGet(dbUrl, 'visitorStats', cfg.requestTimeoutMs)) || {};
      const nextTotal = (stats.totalVisitors || 0) + (needRemoteTotal ? 1 : 0);
      const dailyMap = stats.daily || {};
      const nextToday = (dailyMap[pktDate] || 0) + (needRemoteToday ? 1 : 0);
      const nextViews = (stats.totalViews || 0) + 1;

      await firebasePut(dbUrl, 'visitorStats/totalVisitors', nextTotal, cfg.requestTimeoutMs);
      await firebasePut(dbUrl, `visitorStats/daily/${pktDate}`, nextToday, cfg.requestTimeoutMs);
      await firebasePut(dbUrl, 'visitorStats/totalViews', nextViews, cfg.requestTimeoutMs);
      await firebasePut(dbUrl, `presence/${visitorId}`, Date.now(), cfg.requestTimeoutMs);

      const presenceMap = (await firebaseGet(dbUrl, 'presence', cfg.requestTimeoutMs)) || {};
      const now = Date.now();
      let onlineCount = 0;
      for (const [id, ts] of Object.entries(presenceMap)) {
        if (typeof ts === 'number' && (now - ts) <= cfg.onlineWindowMs) {
          onlineCount += 1;
        } else {
          fetchWithTimeout(`${dbUrl.replace(/\/$/, '')}/presence/${encodeURIComponent(id)}.json`, { method: 'DELETE' }, cfg.requestTimeoutMs).catch(() => {});
        }
      }

      localStorage.setItem(STORAGE_KEYS.REMOTE_TOTAL_COUNTED, '1');
      localStorage.setItem(STORAGE_KEYS.REMOTE_TODAY_DATE, pktDate);
      lastRemoteViews = nextViews;

      setText('stat-total-visitors', nextTotal);
      setText('stat-today-visitors', nextToday);
      setText('stat-total-views', nextViews);
      setText('stat-online-visitors', Math.max(1, onlineCount));

      activeBackend = 'firebase';
      if (modeNote) {
        modeNote.textContent = 'Live Firebase Realtime Database mode (PKT daily reset & 5-min multi-user presence).';
      }
    }

    function applyLocalFallback(reason) {
      activeBackend = 'local';
      if (modeNote) {
        modeNote.textContent = `Browser-local analytics active (${reason}). Static GitHub Pages hosting cannot globally synchronize real-time presence without Firebase RTDB.`;
      }
    }

    function recordSectionOrCatalogVisit() {
      const currentData = readLocalStats(getPakistanDateString());
      currentData.totalViews += 1;
      writeLocalStats(currentData);

      if (activeBackend === 'countapi') {
        lastRemoteViews += 1;
        setText('stat-total-views', lastRemoteViews);
        clearTimeout(viewSyncTimer);
        viewSyncTimer = setTimeout(() => {
          const viewsKey = `${cfg.namespace}_total_views`;
          countApiRequest(cfg.countApi.baseUrl, 'hit', viewsKey, cfg.requestTimeoutMs)
            .then((val) => {
              lastRemoteViews = val;
              setText('stat-total-views', val);
            })
            .catch(() => {});
        }, 500);
      } else if (activeBackend === 'firebase' && cfg.firebase && cfg.firebase.databaseURL) {
        lastRemoteViews += 1;
        setText('stat-total-views', lastRemoteViews);
        clearTimeout(viewSyncTimer);
        viewSyncTimer = setTimeout(() => {
          firebasePut(cfg.firebase.databaseURL, 'visitorStats/totalViews', lastRemoteViews, cfg.requestTimeoutMs).catch(() => {});
        }, 500);
      } else {
        setText('stat-total-views', currentData.totalViews);
      }
    }

    // Track catalog & section visits cleanly (nav links, category filters, solution tabs)
    document.addEventListener('click', (e) => {
      if (
        e.target.closest('.nav-link[href^="#"], .mobile-nav-link[href^="#"], .footer-links-col a[href^="#"]') ||
        e.target.closest('#service-categories .cat-btn') ||
        e.target.closest('#solutions-tabs .sol-tab')
      ) {
        recordSectionOrCatalogVisit();
      }
    });

    (async function runSync() {
      if (cfg.mode === 'firebase' && cfg.firebase && cfg.firebase.databaseURL) {
        try {
          await syncWithFirebase();
          return;
        } catch (_) {
          // fall through
        }
      }

      if (cfg.mode === 'countapi') {
        try {
          await syncWithCountAPI();
          return;
        } catch (_) {
          applyLocalFallback('remote counter unavailable');
          return;
        }
      }

      applyLocalFallback('local mode configured');
    })();

    // Heartbeat timer for 5-minute online window + PKT midnight rollover
    setInterval(() => {
      const currentPktDate = getPakistanDateString();
      if (dateBadge) {
        dateBadge.textContent = `${currentPktDate} \u2022 ${getPakistanTimeString()} PKT`;
      }

      if (activeBackend === 'firebase' && cfg.firebase && cfg.firebase.databaseURL) {
        const dbUrl = cfg.firebase.databaseURL;
        firebasePut(dbUrl, `presence/${visitorId}`, Date.now(), cfg.requestTimeoutMs)
          .then(() => firebaseGet(dbUrl, 'presence', cfg.requestTimeoutMs))
          .then((presenceMap) => {
            if (!presenceMap) return;
            const now = Date.now();
            const count = Object.values(presenceMap).filter((ts) => typeof ts === 'number' && (now - ts) <= cfg.onlineWindowMs).length;
            setText('stat-online-visitors', Math.max(1, count));
          })
          .catch(() => {});
      } else {
        setText('stat-online-visitors', updateLocalPresence(visitorId, cfg.onlineWindowMs));
      }
    }, cfg.heartbeatIntervalMs);
  }

  global.ShieldEyeVisitors = {
    initVisitorStats,
    getPakistanDateString
  };
})(window);
