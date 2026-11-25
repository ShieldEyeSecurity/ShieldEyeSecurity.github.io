/**
 * ShieldEye Security — Visitor Counter Configuration
 *
 * Modes:
 *   - 'countapi' (default): Uses https://countapi.mileshilliard.com/api/v1 (no API keys required).
 *       Note: CountAPI provides simple numeric counters; it does NOT support multi-user real-time
 *       presence lists. Online Visitors uses a 5-minute heartbeat window (cross-tab local tracking
 *       in CountAPI mode, or true multi-user presence when Firebase RTDB mode is enabled).
 *   - 'firebase': Uses Firebase Realtime Database REST API with your public project databaseURL.
 *       IMPORTANT: Never put Firebase Admin SDK / service account private keys in client-side code!
 *       Configure Firebase Security Rules to validate increments and expire stale presence nodes.
 *   - 'local': Offline / browser-local storage mode only (not globally synchronized across users).
 */
window.VISITOR_COUNTER_CONFIG = {
  mode: 'countapi',
  namespace: 'shieldeye-security-karachi-pk',
  timezone: 'Asia/Karachi',
  onlineWindowMs: 5 * 60 * 1000, // 5-minute active window
  heartbeatIntervalMs: 30 * 1000, // Refresh heartbeat every 30s
  requestTimeoutMs: 4500,

  countApi: {
    baseUrl: 'https://countapi.mileshilliard.com/api/v1'
  },

  // Optional Firebase Realtime Database configuration (client-safe public URL only).
  // Set mode: 'firebase' above and provide your databaseURL (e.g. 'https://your-project-default-rtdb.firebaseio.com')
  firebase: {
    databaseURL: '',
    // Optional public Web API key if your RTDB rules require auth; never place service account JSON here.
    apiKey: ''
  }
};
