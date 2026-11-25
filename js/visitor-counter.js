(function (global) {
  'use strict';

  const STORAGE_KEYS = {
    UUID: 'se_visitor_uuid',
    TOTAL_COUNTED: 'se_total_counted',
    TODAY_DATE: 'se_today_counted_date',
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
      requestTimeoutMs: 4500,
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

  /**
   * Returns current YYYY-MM-DD in Pakistan Standard Time (Asia/Karachi, UTC+5).
   */
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

  function fetchWithTimeout(url, options, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, Object.assign({}, options || {}, { signal: controller.signal }))
      .finally(() => clearTimeout(timer));
  }

  // Local deduplicated storage helper
  function readLocalStats(pktDate) {
    let data = { totalVisitors: 0, totalViews: 0, daily: {} };
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_STATS);
      if (raw) data = Object.assign(data, JSON.parse(raw));
    } catch (_) {
      // ignore parse errors
    }
    if (!data.daily || typeof data.daily !== 'object') data.daily = {};
    if (!data.daily[pktDate]) {
      // Keep only current PKT date to stay lightweight
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

    // Remove expired sessions outside 5-minute window
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
    return Object.keys(sessions).length;
  }

  // CountAPI provider (supports hit or get)
  async function countApiCall(baseUrl, action, key, timeoutMs) {
    const endpoint = `${baseUrl.replace(/\/$/, '')}/${action}/${encodeURIComponent(key)}`;
    const res = await fetchWithTimeout(endpoint, { method: 'GET' }, timeoutMs);
    if (!res.ok) throw new Error(`CountAPI HTTP ${res.status}`);
    const json = await res.json();
    const val = json.value ?? json.count ?? json.hits;
    if (typeof val !== 'number') throw new Error('Invalid CountAPI payload');
    return val;
  }

  // Firebase Realtime Database REST provider
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

    const isNewAllTimeVisitor = !localStorage.getItem(STORAGE_KEYS.TOTAL_COUNTED);
    const isNewTodayVisitor = localStorage.getItem(STORAGE_KEYS.TODAY_DATE) !== pktDate;

    // Update local deduplicated stats immediately so UI never stays blank
    const localData = readLocalStats(pktDate);
    if (isNewAllTimeVisitor) localData.totalVisitors += 1;
    if (isNewTodayVisitor) localData.daily[pktDate] = (localData.daily[pktDate] || 0) + 1;
    localData.totalViews += 1;
    writeLocalStats(localData);

    const localOnline = updateLocalPresence(visitorId, cfg.onlineWindowMs);
    setText('stat-total-visitors', localData.totalVisitors);
    setText('stat-today-visitors', localData.daily[pktDate]);
    setText('stat-online-visitors', localOnline);
    setText('stat-total-views', localData.totalViews);

    let activeBackend = 'local';

    async function syncWithCountAPI() {
      const ns = cfg.namespace;
      const base = cfg.countApi.baseUrl;
      const totalKey = `${ns}_total_visitors`;
      const todayKey = `${ns}_daily_${pktDate}`;
      const viewsKey = `${ns}_total_views`;

      const [totalVal, todayVal, viewsVal] = await Promise.all([
        countApiCall(base, isNewAllTimeVisitor ? 'hit' : 'get', totalKey, cfg.requestTimeoutMs),
        countApiCall(base, isNewTodayVisitor ? 'hit' : 'get', todayKey, cfg.requestTimeoutMs),
        countApiCall(base, 'hit', viewsKey, cfg.requestTimeoutMs)
      ]);

      localStorage.setItem(STORAGE_KEYS.TOTAL_COUNTED, '1');
      localStorage.setItem(STORAGE_KEYS.TODAY_DATE, pktDate);

      setText('stat-total-visitors', totalVal);
      setText('stat-today-visitors', todayVal);
      setText('stat-total-views', viewsVal);
      setText('stat-online-visitors', updateLocalPresence(visitorId, cfg.onlineWindowMs));

      activeBackend = 'countapi';
      if (modeNote) {
        modeNote.textContent = 'Synced via CountAPI (unique browser UUID + PKT daily reset; Online count tracks active 5-min browser sessions).';
      }
    }

    async function syncWithFirebase() {
      const dbUrl = (cfg.firebase && cfg.firebase.databaseURL || '').trim();
      if (!dbUrl) throw new Error('Firebase databaseURL not configured');

      const stats = (await firebaseGet(dbUrl, 'visitorStats', cfg.requestTimeoutMs)) || {};
      const nextTotal = (stats.totalVisitors || 0) + (isNewAllTimeVisitor ? 1 : 0);
      const dailyMap = stats.daily || {};
      const nextToday = (dailyMap[pktDate] || 0) + (isNewTodayVisitor ? 1 : 0);
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
          // Clean up expired sessions asynchronously
          fetchWithTimeout(`${dbUrl.replace(/\/$/, '')}/presence/${encodeURIComponent(id)}.json`, { method: 'DELETE' }, cfg.requestTimeoutMs).catch(() => {});
        }
      }

      localStorage.setItem(STORAGE_KEYS.TOTAL_COUNTED, '1');
      localStorage.setItem(STORAGE_KEYS.TODAY_DATE, pktDate);

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
      localStorage.setItem(STORAGE_KEYS.TOTAL_COUNTED, '1');
      localStorage.setItem(STORAGE_KEYS.TODAY_DATE, pktDate);
      activeBackend = 'local';
      if (modeNote) {
        modeNote.textContent = `Browser-local analytics active (${reason}). Static GitHub Pages hosting cannot globally synchronize real-time presence without Firebase RTDB.`;
      }
    }

    (async function runSync() {
      if (cfg.mode === 'firebase' && cfg.firebase && cfg.firebase.databaseURL) {
        try {
          await syncWithFirebase();
          return;
        } catch (_) {
          // fall through to CountAPI or local
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

    // Heartbeat timer for 5-minute online window + PKT midnight rollover check
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
