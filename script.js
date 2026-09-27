/* =====================================================================
   FPAA CONNECT 2.0 — Application Script
   Falakata Polytechnic Alumni Association (ESTD 2024)
   ---------------------------------------------------------------------
   Vanilla JS single-page application. Runs in DEMO MODE (localStorage)
   when supabase-config.js has no URL/anon key; otherwise uses Supabase.

   Sections:
     UTILITIES · DATA / API · AUTH · NAVIGATION · HOME / DASHBOARD
     MY FPAA · MEMBERSHIP · DIRECTORY · CAREER · EVENTS · DONATIONS
     ACHIEVEMENTS · MEMORIES · SCHEMES · NOTICES · CHAT · SUPPORT
     NOTIFICATIONS · ADMIN · REPORTS · BOOT
   ===================================================================== */
(function () {
"use strict";

const CONFIG = Object.assign({
  SUPABASE_URL: "", SUPABASE_ANON_KEY: "", LOGO_URL: "assets/fpaa-logo.png",
  PUBLIC_SITE_URL: "", CONTACT_EMAIL: "", CONTACT_PHONE: "", CONTACT_ADDRESS: ""
}, window.FPAA_CONFIG || {});

/* =====================================================================
   UTILITIES
   ===================================================================== */

/* ---- Safe HTML templating: every interpolation is escaped unless raw() ---- */
class SafeHTML { constructor(s) { this.s = s; } toString() { return this.s; } }
const raw = (s) => new SafeHTML(String(s == null ? "" : s));
function esc(s) {
  return String(s).replace(/[&<>"'`]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "`": "&#96;" }[c]));
}
function toSafe(v) {
  if (v == null || v === false || v === true) return "";
  if (v instanceof SafeHTML) return v.s;
  if (Array.isArray(v)) return v.map(toSafe).join("");
  return esc(String(v));
}
function h(strings, ...vals) {
  let out = strings[0];
  for (let i = 0; i < vals.length; i++) out += toSafe(vals[i]) + strings[i + 1];
  return new SafeHTML(out);
}
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
function setHTML(el, safe) { if (el) el.innerHTML = toSafe(safe); }

/* ---- Icons (24px stroke set) ---- */
const ICON_PATHS = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.4c2.2.7 3.5 2.8 3.5 5.6"/>',
  idcard: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.2"/><path d="M5.8 16c.6-1.5 1.8-2.3 3.2-2.3s2.6.8 3.2 2.3M14.5 10h4M14.5 13.5h3"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12.5h18"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
  heart: '<path d="M12 20s-7.5-4.4-9.2-9.2C1.6 7.3 4 4 7.3 4c2 0 3.5 1.1 4.7 2.8C13.2 5.1 14.7 4 16.7 4 20 4 22.4 7.3 21.2 10.8 19.5 15.6 12 20 12 20z"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5.5h2.5A1.5 1.5 0 0 1 21 7c0 2.5-2 4.5-4.3 4.7M7 5.5H4.5A1.5 1.5 0 0 0 3 7c0 2.5 2 4.5 4.3 4.7"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  school: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5M22 9v6"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10.3 20a1.9 1.9 0 0 0 3.4 0"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.4 8.3 8 9 4.6-.7 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>',
  chevR: '<path d="m9 18 6-6-6-6"/>',
  chevD: '<path d="m6 9 6 6 6-6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  checks: '<path d="m2 12.5 4.5 4.5L16 7.5M11 16l1 1 9.5-9.5"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  building: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3"/>',
  rupee: '<path d="M6 4h12M6 8.5h12M9 4c6 0 6 9 0 9H6l8 7"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 16V5M7 9.5l5-5 5 5M5 20h14"/>',
  printer: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/>',
  logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4"/>',
  login: '<path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M14 17l5-5-5-5M19 12H8"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  send: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.7A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/>',
  filter: '<path d="M3 5h18l-7 8.5V20l-4-2v-4.5z"/>',
  up: '<path d="m6 15 6-6 6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  star: '<path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.4l-5.6 2.9 1.1-6.2L3 9.7l6.2-.9z"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14 7 21l5-3 5 3-1.5-7"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  pie: '<path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
  key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m11 12 9-9M16 7l3 3M14 9l2 2"/>',
  userPlus: '<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3.1-7 7-7s7 3 7 7M19 8v6M16 11h6"/>',
  alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.01"/>',
  sparkles: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
  megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h3l6 5V5L7 10H4a1 1 0 0 0-1 1z"/><path d="M17 8a5 5 0 0 1 0 8M19.5 5.5a8.5 8.5 0 0 1 0 13"/>',
  book: '<path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h13"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  handshake: '<path d="m11 17 2 2a1.4 1.4 0 0 0 2-2M14 14l2.5 2.5a1.4 1.4 0 0 0 2-2L15 11"/><path d="m21 11-4-4-3 1-3-1-4 4 7 7M3 11l4-4"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.3 1 2.1h5c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  grip: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8-1.3-1.3a4 4 0 0 1-5-5L13 2.5 15.5 5z"/>',
  female: '<circle cx="12" cy="9" r="5"/><path d="M12 14v7M9 18h6"/>',
  male: '<circle cx="10" cy="14" r="5"/><path d="M14 10l6-6M15 4h5v5"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8S10.5 3 8 3.5 7.5 8 12 8zm0 0s1.5-5 4-4.5.5 4.5-4 4.5z"/>',
  support: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m5.6 5.6 3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6"/>',
  ppt: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4M8 13V8h3a2 2 0 0 1 0 4H8"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  dot: '<circle cx="12" cy="12" r="4"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
  arrowL: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  sort: '<path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4"/>',
  certificate: '<rect x="3" y="4" width="18" height="13" rx="2"/><circle cx="16" cy="15" r="3"/><path d="m14.5 17.5-1 4 2.5-1.5 2.5 1.5-1-4M7 8h10M7 11.5h5"/>'
};
function icon(name, cls = "ico") {
  return raw(`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ICON_PATHS.dot}</svg>`);
}

/* ---- Formatting ---- */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function toDate(v) { if (!v) return null; const d = v instanceof Date ? v : new Date(v); return isNaN(d) ? null : d; }
function fmtDate(v) { const d = toDate(v); return d ? `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : "—"; }
function fmtDateTime(v) { const d = toDate(v); if (!d) return "—"; let hr = d.getHours(); const ap = hr >= 12 ? "PM" : "AM"; hr = hr % 12 || 12; return `${fmtDate(d)}, ${hr}:${String(d.getMinutes()).padStart(2, "0")} ${ap}`; }
function fmtTime(v) { const d = toDate(v); if (!d) return ""; let hr = d.getHours(); const ap = hr >= 12 ? "PM" : "AM"; hr = hr % 12 || 12; return `${hr}:${String(d.getMinutes()).padStart(2, "0")} ${ap}`; }
function fmtTime24(t) { if (!t) return "—"; const [H, M] = String(t).split(":").map(Number); if (isNaN(H)) return t; const ap = H >= 12 ? "PM" : "AM"; return `${H % 12 || 12}:${String(M || 0).padStart(2, "0")} ${ap}`; }
function fmtINR(n) { const v = Number(n) || 0; return "₹" + v.toLocaleString("en-IN", { maximumFractionDigits: 0 }); }
function fmtNum(n) { return (Number(n) || 0).toLocaleString("en-IN"); }
function relTime(v) {
  const d = toDate(v); if (!d) return "";
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 45) return "just now";
  if (s < 3600) return Math.round(s / 60) + " min ago";
  if (s < 86400) return Math.round(s / 3600) + " hr ago";
  if (s < 86400 * 7) return Math.round(s / 86400) + " d ago";
  return fmtDate(d);
}
function isoDay(d) { const x = toDate(d) || new Date(); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`; }
function daysFromNow(n, hour = 10, min = 0) { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(hour, min, 0, 0); return d; }
function initials(name) { return String(name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase() || "?"; }
function hashStr(s) { let x = 2166136261; for (const c of String(s)) { x ^= c.charCodeAt(0); x = Math.imul(x, 16777619); } return x >>> 0; }
function maskMobile(m) { const d = String(m || "").replace(/\D/g, ""); if (d.length < 6) return d ? "****" : "—"; return d.slice(0, 6) + "*".repeat(d.length - 6); }
function maskMobileTail(m) { const d = String(m || "").replace(/\D/g, ""); if (!d) return "—"; return "*".repeat(Math.max(0, d.length - 2)) + d.slice(-2); }
function maskEmail(e) { const [u, dom] = String(e || "").split("@"); if (!dom) return "—"; return (u.slice(0, 2) || "") + "•••@" + dom; }
function truncate(s, n) { s = String(s || ""); return s.length > n ? s.slice(0, n - 1) + "…" : s; }
function slug(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function uuid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => { const r = (Math.random() * 16) | 0; return (c === "x" ? r : (r & 0x3) | 0x8).toString(16); });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function debounce(fn, ms = 200) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
function uniq(arr) { return Array.from(new Set(arr)); }
function countBy(arr, fn) { const m = {}; arr.forEach((x) => { const k = fn(x); m[k] = (m[k] || 0) + 1; }); return m; }
function sum(arr, fn) { return arr.reduce((a, x) => a + (Number(fn(x)) || 0), 0); }

/* ---- Deterministic RNG for demo data ---- */
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ---- Validation ---- */
const RX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  mobile: /^[6-9]\d{9}$/,
  membership: /^FPAA-M-\d{4}-\d{6}$/,
  pin: /^[1-9]\d{5}$/
};
function normMobile(v) { let d = String(v || "").replace(/\D/g, ""); if (d.length === 12 && d.startsWith("91")) d = d.slice(2); if (d.length === 11 && d.startsWith("0")) d = d.slice(1); return d; }
function normMembership(v) { return String(v || "").trim().toUpperCase().replace(/\s+/g, ""); }
const isEmail = (v) => RX.email.test(String(v || "").trim());
const isMobile = (v) => RX.mobile.test(normMobile(v));

/* ---- Password hashing (demo mode only; Supabase handles real auth) ---- */
function sha256Fallback(ascii) {
  function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
  const maxWord = Math.pow(2, 32); let result = ""; const words = []; const bitLen = ascii.length * 8;
  let hash = [], k = []; let primeCounter = 0; const isC = {};
  for (let c = 2; primeCounter < 64; c++) { if (!isC[c]) { for (let i = 0; i < 313; i += c) isC[i] = c; hash[primeCounter] = (Math.pow(c, .5) * maxWord) | 0; k[primeCounter++] = (Math.pow(c, 1 / 3) * maxWord) | 0; } }
  hash = hash.slice(0, 8);
  ascii += "\x80"; while (ascii.length % 64 - 56) ascii += "\x00";
  for (let i = 0; i < ascii.length; i++) { const j = ascii.charCodeAt(i); if (j >> 8) return ""; words[i >> 2] |= j << ((3 - i) % 4) * 8; }
  words[words.length] = ((bitLen / maxWord) | 0); words[words.length] = bitLen;
  for (let j = 0; j < words.length;) {
    const w = words.slice(j, j += 16); const oldHash = hash; hash = hash.slice(0, 8);
    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2]; const a = hash[0], e = hash[4];
      const t1 = hash[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & hash[5]) ^ ((~e) & hash[6])) + k[i] + (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
      const t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(t1 + t2) | 0].concat(hash); hash[4] = (hash[4] + t1) | 0;
    }
    for (let i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  for (let i = 0; i < 8; i++) for (let j = 3; j + 1; j--) { const b = (hash[i] >> (j * 8)) & 255; result += ((b < 16) ? 0 : "") + b.toString(16); }
  return result;
}
async function hashPassword(pw, salt) {
  const input = salt + "::" + pw;
  try {
    if (window.crypto && crypto.subtle && window.isSecureContext) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch (e) { /* fall through */ }
  return sha256Fallback(unescape(encodeURIComponent(input)));
}
function randomToken(n = 32) {
  const a = new Uint8Array(n);
  if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a); else for (let i = 0; i < n; i++) a[i] = Math.floor(Math.random() * 256);
  return Array.from(a).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ---- Generated artwork (SVG data URIs used for demo photos) ---- */
const ART_PALETTES = [
  ["#0B2141", "#1E4A80", "#3B82F6", "#93C5FD"],
  ["#1E1B4B", "#4338CA", "#6366F1", "#C7D2FE"],
  ["#15365F", "#0E7490", "#22D3EE", "#CFFAFE"],
  ["#3B1F5C", "#7C3AED", "#A78BFA", "#EDE9FE"],
  ["#2B1D0E", "#A16207", "#D7A52B", "#FEF3C7"],
  ["#0F2744", "#3B82F6", "#F59E0B", "#FDE68A"]
];
function art(kind, seed = 1, opts = {}) {
  const r = mulberry32(hashStr(kind + ":" + seed));
  const p = opts.palette || ART_PALETTES[Math.floor(r() * ART_PALETTES.length)];
  const W = 1200, H = 675;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">`;
  s += `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p[0]}"/><stop offset=".65" stop-color="${p[1]}"/><stop offset="1" stop-color="${p[2]}"/></linearGradient>`;
  s += `<radialGradient id="glow" cx=".75" cy=".25" r=".5"><stop offset="0" stop-color="${p[3]}" stop-opacity=".7"/><stop offset="1" stop-color="${p[3]}" stop-opacity="0"/></radialGradient>`;
  s += `<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE7A3"/><stop offset="1" stop-color="#C08A16"/></linearGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#sky)"/><rect width="${W}" height="${H}" fill="url(#glow)"/>`;
  for (let i = 0; i < 40; i++) s += `<circle cx="${(r() * W) | 0}" cy="${(r() * H * 0.5) | 0}" r="${(r() * 2 + .5).toFixed(1)}" fill="#fff" opacity="${(r() * .5 + .2).toFixed(2)}"/>`;
  s += `<circle cx="${900 + r() * 150}" cy="${120 + r() * 60}" r="${50 + r() * 30}" fill="${p[3]}" opacity=".55"/>`;
  s += `<path d="M0 ${480 + r() * 40} Q 300 ${400 + r() * 60} 600 ${470 + r() * 30} T 1200 ${440 + r() * 40} V675 H0z" fill="${p[0]}" opacity=".55"/>`;
  s += `<path d="M0 ${560} Q 400 ${510 + r() * 30} 800 ${560} T 1200 ${540} V675 H0z" fill="${p[0]}" opacity=".85"/>`;
  const fg = "rgba(255,255,255,.92)", fg2 = "rgba(255,255,255,.55)";
  if (kind === "campus" || kind === "memory") {
    s += `<g transform="translate(330 250)"><rect x="0" y="80" width="540" height="240" fill="${fg}" rx="6"/><path d="M-20 90 L270 0 L560 90z" fill="${p[3]}"/>`;
    for (let c = 0; c < 6; c++) for (let rr = 0; rr < 3; rr++) s += `<rect x="${40 + c * 80}" y="${110 + rr * 60}" width="44" height="36" rx="4" fill="${p[1]}" opacity="${.5 + r() * .5}"/>`;
    s += `<rect x="240" y="250" width="60" height="70" fill="${p[1]}"/><path d="M270 0 V-70" stroke="${fg}" stroke-width="5"/><path d="M270 -70 h60 l-12 16 12 16 h-60z" fill="#D7A52B"/></g>`;
    for (let t = 0; t < 7; t++) { const x = 60 + t * 170 + r() * 40; s += `<circle cx="${x}" cy="${560 - r() * 20}" r="${36 + r() * 20}" fill="${p[0]}" opacity=".9"/>`; }
  } else if (kind === "graduation") {
    for (let i = 0; i < 9; i++) { const x = 140 + i * 110 + r() * 40, y = 160 + r() * 260, rot = (r() * 60 - 30) | 0, sc = .7 + r() * .7;
      s += `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})"><path d="M-60 0 L0 -28 L60 0 L0 28z" fill="${fg}"/><path d="M-34 12 v24 c0 12 68 12 68 0 v-24 l-34 16z" fill="${fg2}"/><path d="M46 4 v34" stroke="#D7A52B" stroke-width="4"/><circle cx="46" cy="42" r="6" fill="#D7A52B"/></g>`; }
    for (let i = 0; i < 70; i++) s += `<rect x="${(r() * W) | 0}" y="${(r() * 500) | 0}" width="8" height="14" rx="2" fill="${["#FDE68A", "#93C5FD", "#C4B5FD", "#fff"][i % 4]}" transform="rotate(${(r() * 90) | 0} ${(r() * W) | 0} ${(r() * 500) | 0})" opacity=".85"/>`;
  } else if (kind === "meetup" || kind === "seminar") {
    if (kind === "seminar") { s += `<rect x="330" y="110" width="540" height="260" rx="14" fill="${fg}"/>`; for (let b = 0; b < 7; b++) { const bh = 40 + r() * 170; s += `<rect x="${380 + b * 66}" y="${340 - bh}" width="40" height="${bh}" rx="6" fill="${[p[1], p[2], "#D7A52B"][b % 3]}"/>`; } }
    const rows = kind === "seminar" ? 2 : 1;
    for (let rw = 0; rw < rows; rw++) for (let i = 0; i < 11; i++) { const x = 70 + i * 106 + (rw ? 50 : 0), y = (kind === "seminar" ? 470 : 390) + rw * 90, c = rw ? p[0] : fg;
      s += `<circle cx="${x}" cy="${y}" r="${30}" fill="${c}" opacity="${rw ? .95 : .9}"/><rect x="${x - 46}" y="${y + 34}" width="92" height="120" rx="44" fill="${c}" opacity="${rw ? .95 : .9}"/>`; }
  } else if (kind === "workshop") {
    const gear = (cx, cy, R, teeth, col) => { let g = `<g transform="translate(${cx} ${cy})" fill="${col}">`; for (let t = 0; t < teeth; t++) g += `<rect x="-${R * .14}" y="-${R + 18}" width="${R * .28}" height="36" rx="6" transform="rotate(${t * 360 / teeth})"/>`; return g + `<circle r="${R}"/><circle r="${R * .38}" fill="${p[1]}"/></g>`; };
    s += gear(470, 320, 130, 12, fg) + gear(720, 230, 80, 9, fg2) + gear(760, 440, 66, 8, "#D7A52B");
  } else if (kind === "sports") {
    s += `<rect x="120" y="360" width="960" height="260" rx="20" fill="#16A34A" opacity=".75"/><path d="M600 360 V620M120 490 H1080" stroke="#fff" stroke-width="5" opacity=".7"/><circle cx="600" cy="490" r="70" fill="none" stroke="#fff" stroke-width="5" opacity=".7"/>`;
    s += `<circle cx="760" cy="300" r="46" fill="#fff"/><path d="M730 280 l30 -14 30 14 -10 32 h-40z" fill="${p[0]}" opacity=".8"/>`;
  } else if (kind === "cultural") {
    s += `<rect x="200" y="380" width="800" height="60" rx="8" fill="${fg}"/>`;
    for (let i = 0; i < 6; i++) { const x = 260 + i * 136; s += `<path d="M${x} 100 L${x - 60} 380 L${x + 60} 380z" fill="#FDE68A" opacity=".18"/><circle cx="${x}" cy="100" r="16" fill="#FDE68A"/>`; }
    s += `<g transform="translate(600 330)"><ellipse rx="70" ry="22" fill="url(#gold)"/><path d="M0 -70 C 22 -40 22 -20 0 -12 C -22 -20 -22 -40 0 -70z" fill="#FDBA74"/></g>`;
  } else if (kind === "trophy" || kind === "portrait") {
    for (let i = 0; i < 16; i++) s += `<path d="M600 300 L${600 + Math.cos(i * Math.PI / 8) * 700} ${300 + Math.sin(i * Math.PI / 8) * 700} L${600 + Math.cos(i * Math.PI / 8 + .12) * 700} ${300 + Math.sin(i * Math.PI / 8 + .12) * 700}z" fill="#fff" opacity=".05"/>`;
    if (kind === "trophy") s += `<g transform="translate(600 300)"><path d="M-110 -150 H110 V-40 A110 110 0 0 1 -110 -40z" fill="url(#gold)"/><path d="M-110 -130 H-170 A60 60 0 0 0 -100 -30 M110 -130 H170 A60 60 0 0 1 100 -30" stroke="url(#gold)" stroke-width="18" fill="none"/><rect x="-22" y="60" width="44" height="80" fill="url(#gold)"/><rect x="-100" y="140" width="200" height="40" rx="8" fill="url(#gold)"/><path d="m0 -120 14 30 32 4 -24 22 7 32 -29 -16 -29 16 7 -32 -24 -22 32 -4z" fill="#fff" opacity=".9"/></g>`;
    else s += `<g transform="translate(600 330)"><circle r="200" fill="${fg2}"/><circle cy="-50" r="80" fill="${fg}"/><path d="M-150 160 C -150 40 150 40 150 160z" fill="${fg}"/><circle r="200" fill="none" stroke="#D7A52B" stroke-width="10"/></g>`;
  }
  s += `</svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);
}
function avatarColor(name) { const hue = hashStr(name) % 360; return `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${(hue + 40) % 360} 75% 58%))`; }
function avatar(name, photo, cls = "") {
  if (photo) return h`<span class="avatar ${cls}"><img src="${photo}" alt="${name}"></span>`;
  return h`<span class="avatar ${cls}" style="background:${avatarColor(name)}" aria-hidden="true">${initials(name)}</span>`;
}

/* ---- Toasts ---- */
function toast(type, title, msg = "", ms = 4200) {
  const stack = $("#toastStack"); if (!stack) return;
  const iconName = { success: "check", error: "alert", warn: "alert", info: "info" }[type] || "info";
  const el = document.createElement("div");
  el.className = "toast " + type; el.setAttribute("role", type === "error" ? "alert" : "status");
  setHTML(el, h`${icon(iconName)}<div class="t-body"><b>${title}</b>${msg ? h`<span>${msg}</span>` : ""}</div><button class="icon-btn" style="width:30px;height:30px;border-radius:9px;box-shadow:none" aria-label="Dismiss">${icon("x", "ico ico-sm")}</button>`);
  const kill = () => { el.classList.add("out"); setTimeout(() => el.remove(), 280); };
  el.querySelector("button").addEventListener("click", kill);
  stack.appendChild(el);
  setTimeout(kill, ms);
}
function alertBox(type, title, msg) {
  const ic = { success: "check", error: "alert", warn: "alert", info: "info" }[type] || "info";
  return h`<div class="alert alert-${type}" role="${type === "error" ? "alert" : "status"}">${icon(ic)}<div>${title ? h`<b>${title}</b>` : ""}${msg || ""}</div></div>`;
}
function formMsg(el, type, title, msg) { if (el) setHTML(el, type ? alertBox(type, title, msg) : ""); }
function emptyState(title, msg = "", iconName = "layers", action = null) {
  return h`<div class="empty"><span class="ico-tile soft">${icon(iconName)}</span><b>${title}</b>${msg ? h`<span class="small">${msg}</span>` : ""}${action || ""}</div>`;
}
function loadingBlock(label = "Loading…") { return h`<div class="loading-block"><span class="spinner"></span>${label}</div>`; }

/* ---- Button busy state: disables and shows label while fn runs ---- */
async function busy(btn, label, fn) {
  if (!btn) return fn();
  if (btn.dataset.busy === "1") return;
  const prev = btn.innerHTML; btn.dataset.busy = "1"; btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span>${esc(label)}`;
  try { return await fn(); }
  finally { if (btn.isConnected) { btn.innerHTML = prev; btn.disabled = false; } btn.dataset.busy = ""; }
}

/* ---- Modal ---- */
const Modal = {
  onClose: null, lastFocus: null,
  open({ title, eyebrow = "", body, foot = "", size = "", onMount = null, onClose = null }) {
    const root = $("#modalRoot"), m = $("#modal");
    if (!root || !m) return;
    this.lastFocus = document.activeElement;
    m.className = "modal " + size;
    setHTML(m, h`<div class="modal-head"><div class="ttl">${eyebrow ? h`<span class="eyebrow">${eyebrow}</span>` : ""}<h3 id="modalTitle">${title}</h3></div>
      <button class="icon-btn modal-close" data-action="modal-close" aria-label="Close dialog">${icon("x")}</button></div>
      <div class="modal-body">${body}</div>${foot ? h`<div class="modal-foot">${foot}</div>` : ""}`);
    this.onClose = onClose;
    root.classList.add("open"); root.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open");
    if (onMount) onMount(m);
    setTimeout(() => { const f = m.querySelector("input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button.btn"); (f || m.querySelector(".modal-close")).focus({ preventScroll: true }); }, 60);
  },
  close() {
    const root = $("#modalRoot"); if (!root || !root.classList.contains("open")) return;
    root.classList.remove("open"); root.setAttribute("aria-hidden", "true"); document.body.classList.remove("modal-open");
    const cb = this.onClose; this.onClose = null;
    setTimeout(() => { if (!root.classList.contains("open")) setHTML($("#modal"), ""); }, 300);
    if (cb) cb();
    if (this.lastFocus && this.lastFocus.focus) try { this.lastFocus.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  },
  get el() { return $("#modal"); },
  isOpen() { const r = $("#modalRoot"); return !!(r && r.classList.contains("open")); }
};
function confirmDialog({ title = "Please confirm", message = "", confirmText = "Confirm", danger = false }) {
  return new Promise((resolve) => {
    let done = false;
    Modal.open({
      title, size: "sm", eyebrow: "Confirmation",
      body: h`<p>${message}</p>`,
      foot: h`<button class="btn btn-ghost" data-cd="no">Cancel</button><button class="btn ${danger ? "btn-danger" : "btn-primary"}" data-cd="yes">${confirmText}</button>`,
      onMount: (m) => {
        m.querySelector('[data-cd="yes"]').addEventListener("click", () => { done = true; Modal.close(); resolve(true); });
        m.querySelector('[data-cd="no"]').addEventListener("click", () => { Modal.close(); });
      },
      onClose: () => { if (!done) resolve(false); }
    });
  });
}
function promptDialog({ title, label, placeholder = "", confirmText = "Submit", required = true, multiline = true, danger = false }) {
  return new Promise((resolve) => {
    let done = false;
    Modal.open({
      title, size: "sm", eyebrow: "Action required",
      body: h`<div class="field"><label for="pdInput">${label}${required ? h` <span class="req">*</span>` : ""}</label>
        ${multiline ? h`<textarea id="pdInput" class="textarea" maxlength="500" placeholder="${placeholder}"></textarea>` : h`<input id="pdInput" class="input" maxlength="200" placeholder="${placeholder}">`}
        <span class="err" id="pdErr"></span></div>`,
      foot: h`<button class="btn btn-ghost" data-pd="no">Cancel</button><button class="btn ${danger ? "btn-danger" : "btn-primary"}" data-pd="yes">${confirmText}</button>`,
      onMount: (m) => {
        m.querySelector('[data-pd="yes"]').addEventListener("click", () => {
          const v = m.querySelector("#pdInput").value.trim();
          if (required && !v) { m.querySelector("#pdErr").textContent = "This field is required."; m.querySelector("#pdInput").classList.add("invalid"); return; }
          done = true; Modal.close(); resolve(v);
        });
        m.querySelector('[data-pd="no"]').addEventListener("click", () => Modal.close());
      },
      onClose: () => { if (!done) resolve(null); }
    });
  });
}

/* ---- Forms ---- */
function formValues(form) {
  const o = {};
  $$("input[name],select[name],textarea[name]", form).forEach((el) => {
    if (el.type === "checkbox") o[el.name] = el.checked;
    else if (el.type === "file") o[el.name] = el.files;
    else if (el.type === "radio") { if (el.checked) o[el.name] = el.value; }
    else o[el.name] = el.value.trim();
  });
  return o;
}
function clearErrors(form) { $$(".invalid", form).forEach((e) => e.classList.remove("invalid")); $$(".err", form).forEach((e) => (e.textContent = "")); }
function fieldError(form, name, msg) {
  const el = form.querySelector(`[name="${name}"]`); if (!el) return;
  el.classList.add("invalid"); el.setAttribute("aria-invalid", "true");
  const box = el.closest(".field"); const err = box && box.querySelector(".err"); if (err) err.textContent = msg;
}
function validate(form, rules) {
  clearErrors(form); const v = formValues(form); let ok = true; let first = null;
  for (const [name, checks] of Object.entries(rules)) {
    for (const [test, msg] of checks) {
      if (!test(v[name], v)) { fieldError(form, name, msg); ok = false; if (!first) first = form.querySelector(`[name="${name}"]`); break; }
    }
  }
  if (first) first.focus();
  return ok ? v : null;
}
const req = (m = "This field is required.") => [(x) => x != null && String(x).trim() !== "", m];
const vEmail = [(x) => !x || isEmail(x), "Enter a valid email address."];
const vMobile = [(x) => !x || isMobile(x), "Enter a valid 10-digit Indian mobile number (starts with 6–9)."];
const vPin = [(x) => !x || RX.pin.test(x), "Enter a valid 6-digit PIN code."];
const vUrl = [(x) => !x || /^https?:\/\/[^\s]+\.[^\s]+/i.test(x), "Enter a valid link starting with http:// or https://"];
const vAmount = (min = 1) => [(x) => Number(x) >= min && Number(x) <= 10000000, `Enter an amount of at least ${fmtINR(min)}.`];
function field({ label, name, type = "text", value = "", required = false, placeholder = "", hint = "", options = null, disabled = false, span = false, attrs = "", rows = 4 }) {
  const id = "f_" + name + "_" + Math.random().toString(36).slice(2, 7);
  let control;
  if (options) {
    control = h`<select class="select" id="${id}" name="${name}" ${raw(disabled ? "disabled" : "")} ${raw(attrs)}>${placeholder ? h`<option value="">${placeholder}</option>` : ""}${options.map((o) => { const ov = typeof o === "object" ? o.value : o, ol = typeof o === "object" ? o.label : o; return h`<option value="${ov}" ${raw(String(ov) === String(value) ? "selected" : "")}>${ol}</option>`; })}</select>`;
  } else if (type === "textarea") {
    control = h`<textarea class="textarea" id="${id}" name="${name}" rows="${rows}" placeholder="${placeholder}" ${raw(disabled ? "disabled" : "")} ${raw(attrs)}>${value}</textarea>`;
  } else {
    control = h`<input class="input" id="${id}" name="${name}" type="${type}" value="${value}" placeholder="${placeholder}" ${raw(disabled ? "disabled" : "")} ${raw(attrs)}>`;
  }
  return h`<div class="field ${span ? "span-2" : ""}"><label for="${id}">${label}${required ? h` <span class="req">*</span>` : ""}</label>${control}${hint ? h`<span class="hint">${hint}</span>` : ""}<span class="err"></span></div>`;
}

/* ---- Images: validate + downscale large files before storing ---- */
async function readImageFile(file, { types = ["image/jpeg", "image/png", "image/webp"], maxMB = 20, maxW = 1400, quality = 0.84 } = {}) {
  if (!file) throw new Error("No file selected.");
  if (!types.includes(file.type)) throw new Error(`Unsupported file type "${file.type || "unknown"}". Allowed: ${types.map((t) => t.split("/")[1].toUpperCase()).join(", ")}.`);
  if (file.size > maxMB * 1024 * 1024) throw new Error(`File is larger than ${maxMB} MB.`);
  const dataUrl = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => rej(new Error("Could not read the file.")); fr.readAsDataURL(file); });
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("The image could not be decoded.")); i.src = dataUrl; });
  const scale = Math.min(1, maxW / Math.max(img.width, img.height));
  if (scale === 1 && file.size < 350 * 1024) return dataUrl;
  const c = document.createElement("canvas"); c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
  const ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL(file.type === "image/png" && file.size < 1.5 * 1024 * 1024 ? "image/png" : "image/jpeg", quality);
}
function readAnyFile(file, maxMB = 3) {
  return new Promise((res, rej) => {
    if (!file) return rej(new Error("No file selected."));
    if (file.size > maxMB * 1024 * 1024) return rej(new Error(`Attachment must be under ${maxMB} MB in demo mode.`));
    const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => rej(new Error("Could not read the file.")); fr.readAsDataURL(file);
  });
}

/* ---- Script loader + downloads + exports ---- */
const _scripts = {};
function loadScript(src) {
  if (_scripts[src]) return _scripts[src];
  _scripts[src] = new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.async = true; s.onload = res; s.onerror = () => { delete _scripts[src]; rej(new Error("Could not load " + src)); }; document.head.appendChild(s); });
  return _scripts[src];
}
function downloadBlob(filename, content, mime) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function downloadDataUrl(filename, dataUrl) { const a = document.createElement("a"); a.href = dataUrl; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); }
function csvCell(v) { const s = v == null ? "" : String(v); const safe = /^[=+\-@]/.test(s) ? "'" + s : s; return /[",\n\r]/.test(safe) ? '"' + safe.replace(/"/g, '""') + '"' : safe; }
function exportCSV(filename, rows, cols) {
  const lines = [cols.map((c) => csvCell(c.label)).join(",")].concat(rows.map((r) => cols.map((c) => csvCell(typeof c.get === "function" ? c.get(r) : r[c.key])).join(",")));
  downloadBlob(filename, "﻿" + lines.join("\r\n"), "text/csv;charset=utf-8");
  toast("success", "CSV exported", filename);
}
async function exportExcel(filename, sheet, rows, cols) {
  const data = rows.map((r) => { const o = {}; cols.forEach((c) => (o[c.label] = typeof c.get === "function" ? c.get(r) : r[c.key])); return o; });
  try {
    await loadScript("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js");
    const ws = window.XLSX.utils.json_to_sheet(data); const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, sheet.slice(0, 30)); window.XLSX.writeFile(wb, filename.replace(/\.xlsx?$/, "") + ".xlsx");
    toast("success", "Excel exported", filename.replace(/\.xlsx?$/, "") + ".xlsx");
  } catch (e) {
    // Offline fallback: SpreadsheetML that Excel opens directly
    const x = (s) => esc(s == null ? "" : String(s));
    let xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="h"><Font ss:Bold="1"/><Interior ss:Color="#DCE8FF" ss:Pattern="Solid"/></Style></Styles><Worksheet ss:Name="${x(sheet.slice(0, 30))}"><Table>`;
    xml += "<Row>" + cols.map((c) => `<Cell ss:StyleID="h"><Data ss:Type="String">${x(c.label)}</Data></Cell>`).join("") + "</Row>";
    data.forEach((r) => { xml += "<Row>" + cols.map((c) => { const v = r[c.label]; const num = typeof v === "number"; return `<Cell><Data ss:Type="${num ? "Number" : "String"}">${x(v)}</Data></Cell>`; }).join("") + "</Row>"; });
    xml += "</Table></Worksheet></Workbook>";
    downloadBlob(filename.replace(/\.xlsx?$/, "") + ".xls", xml, "application/vnd.ms-excel");
    toast("info", "Excel exported (offline format)", "Saved as .xls — opens in Microsoft Excel.");
  }
}
function publicBaseUrl() {
  if (CONFIG.PUBLIC_SITE_URL) return CONFIG.PUBLIC_SITE_URL.replace(/\/$/, "") + "/index.html";
  return location.href.split("#")[0].split("?")[0].replace(/login\.html$/, "index.html");
}
function absoluteUrl(path) { try { return new URL(path, location.href).href; } catch (e) { return path; } }
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast("success", "Copied to clipboard"); }
  catch (e) { const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); toast("success", "Copied to clipboard"); } catch (er) { toast("error", "Copy failed", "Please copy the link manually."); } t.remove(); }
}
function printHTML(title, bodyHTML, css) {
  let frame = document.getElementById("printFrame");
  if (frame) frame.remove();
  frame = document.createElement("iframe"); frame.id = "printFrame"; frame.className = "print-frame"; frame.title = "Print preview";
  document.body.appendChild(frame);
  const doc = frame.contentWindow.document;
  doc.open();
  doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Manrope:wght@700;800&family=Playfair+Display:wght@700&display=swap" rel="stylesheet"><style>${css}</style></head><body>${bodyHTML}</body></html>`);
  doc.close();
  const go = () => { try { frame.contentWindow.focus(); frame.contentWindow.print(); } catch (e) { toast("error", "Print failed", "Your browser blocked printing. Please try again."); } };
  const imgs = Array.from(doc.images); let pending = imgs.length;
  if (!pending) setTimeout(go, 350);
  else imgs.forEach((im) => { const fin = () => { if (--pending === 0) setTimeout(go, 250); }; if (im.complete) fin(); else { im.onload = fin; im.onerror = fin; } });
  setTimeout(() => { if (pending > 0) { pending = 0; go(); } }, 2500);
}
/* =====================================================================
   DATA / API — constants, demo seed, localStorage store, Supabase adapter
   ===================================================================== */
const DEPARTMENTS = ["Electronics", "Civil", "Mechanical", "Electrical", "Food Processing Technology"];
const PROFESSIONS = ["Govt. Sector Job", "Private Sector Job", "Self Employed", "Higher Studies"];
const CATEGORIES = [
  { id: "alumni", name: "Alumni Membership", fee: 100, term: "one-time", validity: "Renewal cycle ends 31 Mar 2027", tag: "Most popular" },
  { id: "social", name: "Social Media Handling", fee: 500, term: "per year · renewal", validity: "Valid for 1 year, renewable" },
  { id: "mgmt", name: "Management Committee Membership", fee: 5000, term: "one time", validity: "Lifetime committee eligibility" }
];
const CAT_BY_NAME = Object.fromEntries(CATEGORIES.map((c) => [c.name, c]));
const PAY_MODES = ["UPI", "Bank Transfer (NEFT/IMPS)", "Cash (Office Receipt)", "Cheque / DD"];
const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract", "Apprenticeship"];
const EXPERIENCE = ["Fresher", "1–3 years", "3–5 years", "5+ years"];
const NOTICE_CATEGORIES = ["General", "Membership", "Event", "Finance", "Scholarship", "Academic"];
const DONATION_PURPOSES = ["General Contribution", "Scholarship Fund", "Infrastructure Development", "Alumni Welfare Fund", "Event Sponsorship", "Skill Development Programme"];
const SUPPORT_CATEGORIES = ["Membership", "Payment", "Profile Update", "Technical", "Scheme", "Other"];
const SUPPORT_STATUSES = ["Open", "In Progress", "Resolved", "Closed"];
const APP_STATUSES = ["Pending", "Under Review", "Approved", "Rejected", "Verified"];
const SCHEME_STATUSES = ["Submitted", "Under Review", "Shortlisted", "Approved", "Rejected"];
const DONATION_GOAL = 500000;

const ROLES = {
  member: "Alumni Member",
  committee: "Committee Member",
  superadmin: "Super Admin",
  registration: "Registration Committee",
  finance: "Finance Committee",
  content: "Content Admin"
};
const ADMIN_ROLES = ["committee", "superadmin", "registration", "finance", "content"];

const TABLES = ["members", "profiles", "membership_applications", "payments", "donations", "events", "job_postings", "achievements",
  "memories", "notices", "notifications", "support_requests", "support_replies", "scheme_applications", "volunteer_opportunities",
  "committee_roles", "audit_logs", "member_chat_messages", "chat_read_receipts", "homepage_gallery_feed", "dashboard_live_feed"];

const DB_KEY = "fpaa_connect_db_v1";
const SESSION_KEY = "fpaa_connect_session";

const S = {
  db: null, session: null, profile: null, member: null,
  route: { name: "home", param: "" },
  ui: {
    dir: { q: "", dept: "", prof: "", adm: "", pass: "", sort: "name", page: 1 },
    jobs: { q: "", dept: "", type: "", loc: "", exp: "", sort: "new" },
    events: { tab: "upcoming", q: "", sort: "date" },
    ach: { q: "", year: "", sort: "new" },
    mem: { q: "", batch: "", year: "", sort: "new" },
    ntc: { q: "", cat: "", pri: "", sort: "new" },
    about: "about",
    scheme: { tab: "eligibility" },
    admin: {},
    accessMsg: null
  },
  chat: { conv: "community", tab: "chats", q: "", typing: {}, presence: {} },
  galleryTimer: null, galleryIdx: 0,
  timers: []
};

/* ---------- Demo seed ---------- */
const FIRST_M = ["Rahul", "Arindam", "Sourav", "Debashis", "Pritam", "Subhajit", "Amit", "Rajib", "Tanmoy", "Sujoy", "Bikash", "Partha", "Suman", "Abhijit", "Sanjib", "Dipankar", "Koushik", "Nirmal", "Biswajit", "Anup", "Prasenjit", "Ujjwal", "Sandip", "Mithun", "Rakesh", "Joydeep", "Arnab", "Sumit"];
const FIRST_F = ["Sneha", "Priyanka", "Moumita", "Rimpa", "Sushmita", "Ankita", "Payel", "Tanushree", "Riya", "Puja", "Barnali", "Debjani", "Sayani", "Madhumita", "Rupsha", "Shreya", "Mousumi", "Nandini"];
const LAST = ["Barman", "Roy", "Sarkar", "Das", "Ghosh", "Dey", "Paul", "Saha", "Chakraborty", "Mondal", "Bhowmik", "Sen", "Adhikari", "Karmakar", "Pradhan", "Oraon", "Rava", "Biswas", "Kundu", "Mitra", "Nath", "Majumder", "Basak", "Sutradhar", "Tamang", "Lama", "Singha"];
const CITIES = [["Falakata", "West Bengal", "7352"], ["Alipurduar", "West Bengal", "7361"], ["Jalpaiguri", "West Bengal", "7351"], ["Siliguri", "West Bengal", "7344"], ["Cooch Behar", "West Bengal", "7361"], ["Dhupguri", "West Bengal", "7352"], ["Birpara", "West Bengal", "7352"], ["Kolkata", "West Bengal", "7000"], ["Durgapur", "West Bengal", "7132"], ["Bengaluru", "Karnataka", "5600"], ["Pune", "Maharashtra", "4110"], ["Guwahati", "Assam", "7810"]];
const COMPANIES = {
  "Govt. Sector Job": ["WBSEDCL", "Indian Railways (NFR)", "PWD, Govt. of West Bengal", "PHE Department, WB", "BSNL", "WB Irrigation & Waterways", "Food Corporation of India", "NHPC Ltd."],
  "Private Sector Job": ["ABC Engineering Pvt. Ltd.", "Larsen & Toubro", "Tata Projects", "Siemens India", "ITC Ltd.", "Havells India", "Exide Industries", "Amul Dairy", "Schneider Electric", "Kalpataru Power", "Bosch India", "Emami Agrotech"],
  "Self Employed": ["Barman Electricals", "North Bengal Agro Foods", "Dooars Civil Works", "Sen Auto Service", "Himalayan Tech Solutions", "Tea Garden Supplies Co.", "Green Valley Fabrication"],
  "Higher Studies": ["Jalpaiguri Govt. Engineering College", "NIT Durgapur", "Jadavpur University", "IIT Kharagpur", "MAKAUT", "North Bengal University"]
};

function seedMembers(r) {
  const out = [];
  const mgmtIdx = new Set([2, 5, 9, 17, 23, 31, 44, 60]);
  const socialIdx = new Set([7, 14, 28, 39, 52, 71, 88, 103, 119, 134]);
  const inactiveIdx = new Set([45, 98, 150]);
  const usedNames = new Set();
  for (let i = 0; i < 170; i++) {
    const female = r() < 0.34;
    let name;
    do { name = (female ? FIRST_F : FIRST_M)[Math.floor(r() * (female ? FIRST_F : FIRST_M).length)] + " " + LAST[Math.floor(r() * LAST.length)]; } while (usedNames.has(name));
    usedNames.add(name);
    const dRoll = r();
    const dept = dRoll < 0.2 ? "Electronics" : dRoll < 0.42 ? "Civil" : dRoll < 0.66 ? "Mechanical" : dRoll < 0.88 ? "Electrical" : "Food Processing Technology";
    const adm = 2008 + Math.floor(r() * 15);
    const pRoll = r();
    const prof = pRoll < 0.38 ? "Private Sector Job" : pRoll < 0.64 ? "Govt. Sector Job" : pRoll < 0.80 ? "Self Employed" : "Higher Studies";
    const city = CITIES[r() < 0.55 ? Math.floor(r() * 7) : Math.floor(r() * CITIES.length)];
    const since = 2024 + Math.floor(r() * 3);
    const cat = mgmtIdx.has(i) ? CATEGORIES[2].name : socialIdx.has(i) ? CATEGORIES[1].name : CATEGORIES[0].name;
    const mobile = String(6 + Math.floor(r() * 4)) + String(Math.floor(r() * 1e9)).padStart(9, "0");
    const first = name.split(" ")[0].toLowerCase(), last = name.split(" ")[1].toLowerCase();
    out.push({
      id: uuid(), membership_no: `FPAA-M-${since}-${String(i + 1).padStart(6, "0")}`, full_name: name,
      email: `${first}.${last}${i + 1}@example.com`, mobile, gender: female ? "Female" : "Male",
      department: dept, admission_year: adm, passing_year: adm + 3, profession: prof,
      company: COMPANIES[prof][Math.floor(r() * COMPANIES[prof].length)],
      city: city[0], state: city[1], pin: city[2] + String(10 + Math.floor(r() * 89)),
      address: ["Ward No. " + (1 + Math.floor(r() * 18)), "Station Road", "Polytechnic College Road", "Netaji Para", "Subhash Pally", "College Para", "Madari Road", "NH-31 Bypass"][Math.floor(r() * 8)],
      category: cat, status: inactiveIdx.has(i) ? "Inactive" : "Active", member_since: since,
      valid_till: cat === CATEGORIES[2].name ? "Lifetime" : inactiveIdx.has(i) ? "2025" : "2027",
      photo: null, user_id: null, created_at: new Date(since, Math.floor(r() * 9), 1 + Math.floor(r() * 27), 11, 0).toISOString()
    });
  }
  // Fixed demo identities
  Object.assign(out[0], { membership_no: "FPAA-M-2026-000001", full_name: "Rahul Barman", email: "member@fpaa.in", mobile: "9876543206", gender: "Male", department: "Mechanical", admission_year: 2014, passing_year: 2017, profession: "Private Sector Job", company: "ABC Engineering Pvt. Ltd.", city: "Falakata", state: "West Bengal", pin: "735211", address: "Polytechnic College Road", category: "Alumni Membership", status: "Active", member_since: 2026, valid_till: "2027", created_at: new Date(2026, 0, 12, 10).toISOString() });
  Object.assign(out[11], { membership_no: "FPAA-M-2024-000012", full_name: "Sneha Roy", email: "sneha.roy12@example.com", mobile: "9123456712", gender: "Female", department: "Food Processing Technology", admission_year: 2016, passing_year: 2019, profession: "Govt. Sector Job", company: "Food Corporation of India", city: "Alipurduar", state: "West Bengal", pin: "736121", category: "Alumni Membership", status: "Active", member_since: 2024, valid_till: "2027" });
  Object.assign(out[2], { full_name: "Arindam Sarkar", email: "committee@fpaa.in", department: "Electrical", category: "Management Committee Membership", status: "Active", valid_till: "Lifetime" });
  return out;
}

async function buildSeed() {
  const r = mulberry32(20240517);
  const db = {}; TABLES.forEach((t) => (db[t] = []));
  const now = new Date();
  const members = seedMembers(r); db.members = members;

  // ---- Profiles (accounts) — demo credentials only ----
  const mkProfile = async (email, full_name, role, pw, member, mobile) => {
    const salt = randomToken(8);
    const p = { id: uuid(), email, full_name, mobile: member ? member.mobile : mobile, role, member_id: member ? member.id : null, auth_method: "Email + Password", status: "Active", salt, password_hash: await hashPassword(pw, salt), last_login: null, created_at: new Date(2026, 0, 5).toISOString() };
    if (member) member.user_id = p.id;
    return p;
  };
  db.profiles = [
    await mkProfile("member@fpaa.in", "Rahul Barman", "member", "Member@123", members[0]),
    await mkProfile("newuser@fpaa.in", "Sneha Roy", "member", "Welcome@123", null, "9123456712"),
    await mkProfile("admin@fpaa.in", "FPAA Super Admin", "superadmin", "Admin@123", null, "9800000001"),
    await mkProfile("registration@fpaa.in", "Registration Desk", "registration", "Admin@123", null, "9800000002"),
    await mkProfile("finance@fpaa.in", "Finance Committee", "finance", "Admin@123", null, "9800000003"),
    await mkProfile("content@fpaa.in", "Content Team", "content", "Admin@123", null, "9800000004"),
    await mkProfile("committee@fpaa.in", "Arindam Sarkar", "committee", "Admin@123", members[2])
  ];
  db.committee_roles = db.profiles.filter((p) => p.role !== "member").map((p) => ({ id: uuid(), user_id: p.id, role: p.role, assigned_at: p.created_at }));
  const U = Object.fromEntries(db.profiles.map((p) => [p.email.split("@")[0], p]));

  // ---- Membership applications + payments ----
  const apps = [
    { n: "APP-2026-0001", name: "Rahul Barman", email: "member@fpaa.in", mobile: "9876543206", dept: "Mechanical", adm: 2014, cat: 0, st: "Verified", pay: "Verified", ref: "UPI/602611234567", d: -258, user: U.member },
    { n: "APP-2026-0102", name: "Rahul Barman", email: "member@fpaa.in", mobile: "9876543206", dept: "Mechanical", adm: 2014, cat: 1, st: "Under Review", pay: "Pending", ref: "UPI/602688445120", d: -6, user: U.member },
    { n: "APP-2026-0103", name: "Moumita Ghosh", email: "moumita.g@example.com", mobile: "9832012345", dept: "Civil", adm: 2019, cat: 0, st: "Pending", pay: "Pending", ref: "UPI/602690112233", d: -3 },
    { n: "APP-2026-0104", name: "Subhajit Oraon", email: "subhajit.o@example.com", mobile: "7001234598", dept: "Electrical", adm: 2018, cat: 0, st: "Pending", pay: "Pending", ref: "NEFT/SBIN2609771", d: -2 },
    { n: "APP-2026-0105", name: "Payel Kundu", email: "payel.k@example.com", mobile: "8250012345", dept: "Food Processing Technology", adm: 2020, cat: 0, st: "Under Review", pay: "Verified", ref: "UPI/602677001188", d: -9 },
    { n: "APP-2026-0106", name: "Tanmoy Rava", email: "tanmoy.r@example.com", mobile: "9002312345", dept: "Electronics", adm: 2015, cat: 2, st: "Pending", pay: "Pending", ref: "CHQ/004512", d: -1 },
    { n: "APP-2026-0107", name: "Barnali Sen", email: "barnali.s@example.com", mobile: "6297012345", dept: "Civil", adm: 2017, cat: 1, st: "Pending", pay: "Pending", ref: "UPI/602699887766", d: 0 },
    { n: "APP-2026-0098", name: "Koushik Dey", email: "koushik.d@example.com", mobile: "9564012345", dept: "Mechanical", adm: 2012, cat: 0, st: "Rejected", pay: "Rejected", ref: "UPI/INVALID-REF", d: -21, note: "Payment reference could not be matched with bank statement." },
    { n: "APP-2026-0099", name: "Ankita Paul", email: "ankita.p@example.com", mobile: "9735012345", dept: "Electronics", adm: 2019, cat: 0, st: "Approved", pay: "Pending", ref: "Cash Receipt #221", d: -12 },
    { n: "APP-2025-0412", name: "Sneha Roy", email: "sneha.roy12@example.com", mobile: "9123456712", dept: "Food Processing Technology", adm: 2016, cat: 0, st: "Verified", pay: "Verified", ref: "UPI/5024AA1901", d: -520 },
    { n: "APP-2026-0100", name: "Joydeep Lama", email: "joydeep.l@example.com", mobile: "7797012345", dept: "Electrical", adm: 2016, cat: 0, st: "Verified", pay: "Verified", ref: "UPI/602655001234", d: -30 },
    { n: "APP-2026-0101", name: "Riya Majumder", email: "riya.m@example.com", mobile: "8918012345", dept: "Civil", adm: 2021, cat: 0, st: "Under Review", pay: "Pending", ref: "IMPS/602644778899", d: -5 }
  ];
  apps.forEach((a) => {
    const c = CATEGORIES[a.cat]; const d = daysFromNow(a.d, 11, 20);
    const app = { id: uuid(), application_no: a.n, full_name: a.name, email: a.email, mobile: a.mobile, department: a.dept, admission_year: a.adm, passing_year: a.adm + 3, category: c.name, amount: c.fee, payment_mode: a.ref.startsWith("UPI") ? "UPI" : a.ref.startsWith("NEFT") || a.ref.startsWith("IMPS") ? "Bank Transfer (NEFT/IMPS)" : a.ref.startsWith("CHQ") ? "Cheque / DD" : "Cash (Office Receipt)", payment_ref: a.ref, payment_status: a.pay, status: a.st, submitted_at: d.toISOString(), reviewed_at: a.st === "Pending" ? null : daysFromNow(a.d + 2).toISOString(), notes: a.note || "", user_id: a.user ? a.user.id : null, member_id: null, profession: "", company: "", city: "", gender: "" };
    if (a.n === "APP-2026-0001") app.member_id = members[0].id;
    if (a.n === "APP-2025-0412") app.member_id = members[11].id;
    db.membership_applications.push(app);
    db.payments.push({ id: uuid(), application_id: app.id, application_no: app.application_no, member_name: app.full_name, category: app.category, amount: app.amount, mode: app.payment_mode, reference: app.payment_ref, paid_at: d.toISOString(), status: a.pay, verified_by: a.pay === "Pending" ? null : "Finance Committee", department: app.department });
  });
  // Historic verified membership payments for revenue reports (sampled members)
  members.filter((m, i) => i % 3 === 0 && i > 1 && m.status === "Active").forEach((m, k) => {
    const c = CAT_BY_NAME[m.category];
    db.payments.push({ id: uuid(), application_id: null, application_no: `APP-${m.member_since}-${String(200 + k).padStart(4, "0")}`, member_name: m.full_name, category: m.category, amount: c.fee, mode: k % 3 ? "UPI" : "Cash (Office Receipt)", reference: `UPI/${m.member_since}${String(100000 + k * 37)}`, paid_at: new Date(Math.min(Date.now() - 86400000 * 3, new Date(m.created_at).getTime())).toISOString(), status: "Verified", verified_by: "Finance Committee", department: m.department });
  });

  // ---- Donations ----
  const donors = [
    ["DON-2026-0001", "General Contribution", 5000, "Rahul Barman", "member@fpaa.in", "9876543206", "Verified", -120, U.member, "Proud to support FPAA."],
    ["DON-2026-0014", "Scholarship Fund", 2500, "Rahul Barman", "member@fpaa.in", "9876543206", "Pending", -4, U.member, "For the Sir M. Visvesvaraya scholarship."]
  ];
  const purposes = DONATION_PURPOSES;
  for (let i = 0; i < 22; i++) {
    const m = members[5 + i * 7]; const amt = [500, 1000, 1500, 2000, 2500, 5000, 10000, 11000, 25000][Math.floor(r() * 9)];
    const st = i % 9 === 4 ? "Rejected" : i % 5 === 2 ? "Pending" : "Verified";
    donors.push([`DON-2026-${String(i + 2).padStart(4, "0")}`, purposes[Math.floor(r() * purposes.length)], amt, m.full_name, m.email, m.mobile, st, -Math.floor(r() * 250) - 1, null, i % 3 ? "Best wishes to FPAA." : ""]);
  }
  donors.forEach((d) => db.donations.push({ id: uuid(), donation_no: d[0], purpose: d[1], amount: d[2], donor_name: d[3], email: d[4], mobile: d[5], status: d[6], donated_at: daysFromNow(d[7], 14).toISOString(), user_id: d[8] ? d[8].id : null, message: d[9], payment_mode: "UPI", payment_ref: "UPI/" + (600000000 + Math.floor(r() * 99999999)), department: "" }));

  // ---- Events ----
  const ev = [
    ["FPAA Annual Alumni Meet 2026", "The flagship homecoming of Falakata Polytechnic alumni — felicitation of distinguished alumni, department reunions, cultural evening and the release of the FPAA souvenir.", 12, "10:00", "Falakata Polytechnic Main Auditorium", "meetup"],
    ["Career Guidance Seminar: Diploma to Degree", "Alumni from NIT Durgapur, Jadavpur University and industry walk final-year students through lateral entry, GATE and job pathways.", 27, "11:30", "Seminar Hall, Block B", "seminar"],
    ["Skill Development Workshop: PLC & Industrial Automation", "Hands-on workshop under the Dr. A.P.J. Abdul Kalam Youth Skill Development Programme, led by alumni engineers from Siemens and Schneider Electric.", 48, "09:30", "Electrical Engineering Lab", "workshop"],
    ["Alumni Friendly Cricket Match", "Batch-vs-batch T10 cricket at the polytechnic ground. Register your team of 11 with the Events desk.", 80, "07:00", "Falakata Polytechnic Ground", "sports"],
    ["Foundation Day Celebration", "FPAA marked its foundation day with a tree plantation drive, blood donation camp and a cultural programme by current students.", -20, "10:00", "Campus Lawn", "cultural"],
    ["Industry Connect: Food Processing Opportunities", "Panel discussion with alumni entrepreneurs in dairy, tea and agro-processing on starting food businesses in North Bengal.", -65, "14:00", "Food Processing Technology Dept.", "seminar"],
    ["Convocation & Alumni Welcome 2026", "The graduating batch of 2026 was welcomed into the alumni family with membership kits and mentoring pledges.", -120, "11:00", "Main Auditorium", "graduation"],
    ["Mentorship Circle Launch", "Launch of the FPAA mentorship circle pairing 60 students with alumni mentors across all five departments.", -200, "16:00", "Online + Seminar Hall", "meetup"]
  ];
  ev.forEach((e, i) => db.events.push({ id: uuid(), title: e[0], description: e[1], date: isoDay(daysFromNow(e[2])), time: e[3], venue: e[4], image: art(e[5], i + 11), registration_link: i === 1 ? "https://example.org/fpaa/seminar-registration" : "", registrations: i === 0 ? [U.member.id] : [], registration_count: [118, 64, 22, 40, 210, 75, 180, 95][i], status: "Published", created_at: daysFromNow(e[2] - 30).toISOString() }));

  // ---- Jobs ----
  const jobs = [
    ["Junior Engineer (Electrical)", "WBSEDCL", "Jalpaiguri", "₹32,000 – ₹38,000 / month", "Electrical", "Full-time", "Fresher", "Published", "Maintenance of 33/11 kV substations and distribution network in Jalpaiguri division. Diploma in Electrical Engineering required.", 3],
    ["Site Supervisor – Civil", "Tata Projects", "Siliguri", "₹25,000 – ₹30,000 / month", "Civil", "Full-time", "1–3 years", "Published", "Supervise RCC and highway works on the NH-31 expansion package. Knowledge of AutoCAD and quantity estimation preferred.", 6],
    ["Graduate Apprentice Trainee", "Indian Railways (NFR)", "Alipurduar Jn.", "₹9,000 stipend / month", "Mechanical", "Apprenticeship", "Fresher", "Published", "One-year apprenticeship at the Alipurduar diesel loco shed under the Apprentices Act.", 9],
    ["Quality Control Executive", "Amul Dairy", "Kolkata", "₹22,000 – ₹27,000 / month", "Food Processing Technology", "Full-time", "Fresher", "Published", "Quality testing of milk and milk products, HACCP documentation and FSSAI compliance.", 12],
    ["Embedded Systems Intern", "Himalayan Tech Solutions", "Siliguri", "₹10,000 / month", "Electronics", "Internship", "Fresher", "Published", "Six-month internship on microcontroller firmware (ARM/AVR), PCB testing and IoT prototypes.", 15],
    ["Maintenance Technician", "ITC Ltd.", "Kolkata", "₹20,000 – ₹24,000 / month", "Mechanical", "Full-time", "1–3 years", "Published", "Preventive and breakdown maintenance of packaging machinery in a 3-shift plant.", 19],
    ["Electrical Design Engineer", "Schneider Electric", "Bengaluru", "₹4.2 – ₹5.5 LPA", "Electrical", "Full-time", "3–5 years", "Published", "LT panel design, load calculation and single-line diagrams using EPLAN.", 24],
    ["Draughtsman (Civil)", "Dooars Civil Works", "Falakata", "₹15,000 – ₹18,000 / month", "Civil", "Contract", "Fresher", "Published", "Prepare building plans and structural drawings for residential projects in Alipurduar district.", 28],
    ["Production Supervisor – Tea Processing", "Emami Agrotech", "Birpara", "₹21,000 / month", "Food Processing Technology", "Full-time", "1–3 years", "Published", "Supervise CTC tea processing lines and maintain production records.", 33],
    ["Service Engineer – Solar", "Green Valley Fabrication", "Cooch Behar", "₹18,000 – ₹22,000 / month", "Electrical", "Full-time", "Fresher", "Pending", "Installation and servicing of rooftop solar systems across North Bengal.", 1],
    ["CNC Operator", "Bosch India", "Pune", "₹19,000 / month", "Mechanical", "Full-time", "Fresher", "Pending", "Operate and set CNC turning centres; read engineering drawings.", 0],
    ["Telecom Technician", "Unverified Recruiter", "Remote", "₹80,000 / month", "Electronics", "Part-time", "Fresher", "Rejected", "Work-from-home telecom job with registration fee.", 14]
  ];
  jobs.forEach((j, i) => db.job_postings.push({ id: uuid(), title: j[0], company: j[1], location: j[2], salary: j[3], department: j[4], job_type: j[5], experience: j[6], status: j[7], description: j[8], apply_link: "https://example.org/careers/" + slug(j[0]), posted_at: daysFromNow(-j[9], 9).toISOString(), posted_by: i === 9 ? U.member.id : null, poster_name: i === 9 ? "Rahul Barman" : "FPAA Career Cell", review_note: j[7] === "Rejected" ? "Recruiter could not be verified; asks for a registration fee." : "" }));

  // ---- Achievements ----
  const ach = [
    ["Debashis Chakraborty", "Promoted to Assistant Engineer", "WBSEDCL", "Recognised for commissioning three rural substations ahead of schedule, bringing reliable power to 40 villages in Alipurduar district.", -12, "trophy"],
    ["Priyanka Das", "Cleared GATE 2026 with AIR 412", "Jadavpur University", "After completing her diploma in Electronics, Priyanka pursued B.Tech through lateral entry and secured an all-India rank of 412 in GATE ECE.", -40, "portrait"],
    ["Sourav Mondal", "Founded North Bengal Agro Foods", "North Bengal Agro Foods", "A Food Processing Technology alumnus, Sourav built a pineapple-processing unit that now employs 35 people from Falakata.", -75, "portrait"],
    ["Tanushree Saha", "Best Young Engineer Award", "Institution of Engineers (India), Siliguri Centre", "Awarded for her work on low-cost flood-resilient culverts for tea-garden roads.", -90, "trophy"],
    ["Rajib Pradhan", "Selected for Indian Railways Technical Cadre", "Indian Railways (NFR)", "Rajib joined NFR as a Junior Engineer (Mechanical) and now mentors FPAA apprentices at the Alipurduar shed.", -130, "portrait"],
    ["Madhumita Sen", "Patent filed: Smart Irrigation Controller", "MAKAUT Research Cell", "Co-inventor of a sensor-based irrigation controller designed for small farms in the Dooars.", -160, "trophy"],
    ["Anup Biswas", "Gold Medal – State Skill Competition", "WB State Council of Technical Education", "Won gold in the Electrical Installation trade at the West Bengal state skill competition.", -190, "trophy"],
    ["Rimpa Karmakar", "Led Metro Viaduct Survey Team", "Larsen & Toubro", "Rimpa led a 12-member survey team for a metro viaduct package — the first FPAA alumna in the role.", -230, "portrait"],
    ["Sujoy Tamang", "Started Himalayan Tech Solutions", "Himalayan Tech Solutions", "An IoT startup from Siliguri that now offers internships to FPAA Electronics students.", -300, "portrait"]
  ];
  ach.forEach((a, i) => db.achievements.push({ id: uuid(), member_name: a[0], title: a[1], organization: a[2], description: a[3], date: isoDay(daysFromNow(a[4])), photo: art(a[5], i + 31), status: "Published", submitted_by: null, created_at: daysFromNow(a[4]).toISOString() }));

  // ---- Memories ----
  const memKinds = ["campus", "graduation", "meetup", "workshop", "sports", "cultural", "memory", "seminar"];
  const caps = ["First day at the Mechanical workshop", "Farewell of the 2017 batch", "Industrial visit to Chukha hydel project", "Tech fest robotics team", "Inter-polytechnic football final", "Saraswati Puja in the hostel", "Survey camp at Jaldapara", "Final year project exhibition", "Annual sports day relay", "Diploma results day", "Civil dept. group photo", "Food processing lab – first batch", "Our favourite canteen corner", "Morning assembly, 2012"];
  caps.forEach((c, i) => { const yr = 2010 + (i * 3) % 16; db.memories.push({ id: uuid(), caption: c, batch: `${yr - 3}–${yr}`, year: yr, member_name: members[20 + i * 9].full_name, photo: art(memKinds[i % memKinds.length], i + 51), status: i >= 12 ? "Pending" : "Published", user_id: null, created_at: daysFromNow(-(i * 11) - 2).toISOString() }); });

  // ---- Notices ----
  const nts = [
    ["Membership renewal window for 2026–27 is open", "Membership", "Important", -1, "Members under Social Media Handling category must renew by 31 March 2027. Renewal can be paid via UPI and verified by the Finance Committee.", "Renewal-Guidelines-2026.pdf"],
    ["Applications invited: Falakata Alumni Scheme 2026", "Scholarship", "Urgent", -2, "Applications for the Savitribai Fule and Sir M. Visvesvaraya Excellence Scholarships close on 31 October 2026. Apply through the Falakata Alumni Scheme section.", "Scheme-Notification-2026.pdf"],
    ["Annual Alumni Meet 2026 — registration open", "Event", "Normal", -4, "Register for the Annual Alumni Meet from the Events section. Department-wise reunion slots will be announced separately.", ""],
    ["Updated bank account for FPAA donations", "Finance", "Important", -9, "All donations must be made only to the association's official account shown in the Donations section. Always record your UTR/reference number.", "FPAA-Bank-Details.pdf"],
    ["Profile verification drive", "Membership", "Normal", -14, "Members are requested to update their current profession and address in My FPAA to keep the alumni directory accurate.", ""],
    ["Mentorship circle – volunteer mentors needed", "General", "Normal", -21, "Alumni interested in mentoring final-year students may write to the Registration Committee through a support request.", ""],
    ["Minutes of the Executive Committee meeting", "General", "Normal", -33, "Minutes of the executive committee meeting held on campus are available for members.", "EC-Minutes.pdf"],
    ["Revised syllabus orientation for Electrical dept.", "Academic", "Normal", -47, "Alumni are invited to share industry feedback on the revised Electrical Engineering syllabus.", ""],
    ["Donation receipts for FY 2025–26 issued", "Finance", "Normal", -60, "Verified donors can view receipts under My FPAA → My Donations.", ""],
    ["FPAA Connect 2.0 platform launched", "General", "Normal", -100, "The official digital platform of Falakata Polytechnic Alumni Association is now live for all members.", ""]
  ];
  nts.forEach((n, i) => db.notices.push({ id: uuid(), notice_no: `FPAA/NOT/2026/${String(40 - i).padStart(3, "0")}`, title: n[0], category: n[1], priority: n[2], date: isoDay(daysFromNow(n[3])), description: n[4], attachment_name: n[5], attachment_data: null, status: "Published", created_at: daysFromNow(n[3]).toISOString() }));

  // ---- Scheme definitions (stored in volunteer_opportunities for DB compatibility) ----
  db.volunteer_opportunities = [
    { id: "scheme-savitribai", code: "SFES", name: "Savitribai Fule Excellence Scholarship", audience: "Female students", icon: "female", tone: "f-rose",
      summary: "Merit-cum-means scholarship honouring Savitribai Fule, supporting meritorious female diploma students of Falakata Polytechnic.",
      eligibility: ["Female student currently enrolled in any diploma programme of Falakata Polytechnic", "Minimum 70% aggregate in the last semester examination", "Annual family income below ₹2,50,000", "No other full scholarship for the same academic year"],
      criteria: ["Academic merit (60% weightage)", "Family income (25% weightage)", "Short statement of purpose and interview (15% weightage)", "Final selection by the FPAA Scheme Review Committee"],
      benefits: ["₹10,000 scholarship per academic year", "Alumni mentor from the student's department", "Priority access to FPAA workshops and internships", "Certificate of Excellence at the Annual Alumni Meet"],
      documents: ["Latest semester mark sheet", "Institute ID card", "Family income certificate", "Aadhaar card (masked copy)", "Bank passbook first page"],
      deadline: "31 Oct 2026", seats: 10 },
    { id: "scheme-visvesvaraya", code: "SMVES", name: "Sir M. Visvesvaraya Excellence Scholarship", audience: "Male students", icon: "male", tone: "f-blue",
      summary: "Honouring Bharat Ratna Sir M. Visvesvaraya, this scholarship rewards meritorious male diploma students with financial need.",
      eligibility: ["Male student currently enrolled in any diploma programme of Falakata Polytechnic", "Minimum 70% aggregate in the last semester examination", "Annual family income below ₹2,50,000", "Regular attendance of at least 75%"],
      criteria: ["Academic merit (60% weightage)", "Family income (25% weightage)", "Project work / technical activity (15% weightage)", "Final selection by the FPAA Scheme Review Committee"],
      benefits: ["₹10,000 scholarship per academic year", "Industry visit sponsored by FPAA", "Alumni mentor from the student's department", "Certificate of Excellence at the Annual Alumni Meet"],
      documents: ["Latest semester mark sheet", "Institute ID card", "Family income certificate", "Attendance certificate", "Bank passbook first page"],
      deadline: "31 Oct 2026", seats: 10 },
    { id: "scheme-kalam", code: "APJYSDP", name: "Dr. A.P.J. Abdul Kalam Youth Skill Development Programme", audience: "Students & young alumni", icon: "wrench", tone: "f-gold",
      summary: "Industry-oriented skill training, certification and placement support delivered by FPAA alumni and partner organisations.",
      eligibility: ["Current students of Falakata Polytechnic (any semester)", "Alumni who passed out within the last 3 years", "Commitment to attend at least 80% of sessions"],
      criteria: ["First-come, first-served within track capacity", "Preference to students without prior industry training", "Short aptitude test for advanced tracks"],
      benefits: ["Free hands-on training tracks: PLC & Automation, AutoCAD & Revit, Embedded Systems, Food Safety (FSSAI)", "Certificate issued by FPAA", "Interview preparation and placement referrals through alumni network"],
      documents: ["Institute ID card or diploma certificate", "Passport-size photograph", "Aadhaar card (masked copy)"],
      deadline: "Rolling admissions", seats: 60 }
  ];
  const schApps = [
    ["scheme-savitribai", "Ankita Barman", "Female", "Civil", "5th", 82.4, 180000, "Under Review"], ["scheme-savitribai", "Shreya Pradhan", "Female", "Electronics", "3rd", 88.1, 120000, "Shortlisted"],
    ["scheme-savitribai", "Nandini Oraon", "Female", "Food Processing Technology", "5th", 76.5, 90000, "Submitted"], ["scheme-savitribai", "Sayani Dey", "Female", "Electrical", "3rd", 71.2, 240000, "Approved"],
    ["scheme-visvesvaraya", "Arnab Singha", "Male", "Mechanical", "5th", 84.9, 150000, "Under Review"], ["scheme-visvesvaraya", "Sumit Rava", "Male", "Electrical", "3rd", 79.3, 110000, "Submitted"],
    ["scheme-visvesvaraya", "Mithun Basak", "Male", "Civil", "5th", 91.0, 200000, "Approved"], ["scheme-visvesvaraya", "Rakesh Nath", "Male", "Electronics", "3rd", 65.0, 300000, "Rejected"],
    ["scheme-kalam", "Prasenjit Das", "Male", "Electrical", "6th", 72.0, 0, "Approved"], ["scheme-kalam", "Rupsha Ghosh", "Female", "Electronics", "4th", 80.2, 0, "Submitted"],
    ["scheme-kalam", "Ujjwal Sutradhar", "Male", "Mechanical", "Alumni 2024", 68.4, 0, "Under Review"], ["scheme-kalam", "Debjani Paul", "Female", "Food Processing Technology", "2nd", 74.6, 0, "Submitted"]
  ];
  schApps.forEach((s, i) => db.scheme_applications.push({ id: uuid(), application_no: `FAS-2026-${String(i + 1).padStart(4, "0")}`, scheme_id: s[0], applicant_name: s[1], gender: s[2], department: s[3], semester: s[4], percentage: s[5], family_income: s[6], mobile: "9" + String(700000000 + i * 1234567).slice(0, 9), email: slug(s[1]).replace("-", ".") + "@example.com", track: s[0] === "scheme-kalam" ? ["PLC & Automation", "Embedded Systems", "AutoCAD & Revit", "Food Safety (FSSAI)"][i % 4] : "", statement: "I wish to continue my technical education and contribute to my community.", status: s[7], remarks: s[7] === "Rejected" ? "Does not meet the minimum marks criterion." : "", submitted_at: daysFromNow(-i * 3 - 1).toISOString(), user_id: i === 1 ? U.member.id : null }));

  // ---- Support ----
  const tickets = [
    ["SUP-2026-0007", U.member, "Membership card photo not updating", "Profile Update", "In Progress", -3, ["I uploaded a new profile photo but the membership card still shows my initials.", "Thank you, Rahul. We have refreshed your record — please check again after logging out and in. — Registration Desk"]],
    ["SUP-2026-0004", U.member, "Donation receipt for DON-2026-0001", "Payment", "Resolved", -40, ["Please share a receipt for my donation DON-2026-0001.", "Your donation has been verified. The receipt is available in My Donations. — Finance Committee"]],
    ["SUP-2026-0009", U.newuser, "How do I link my membership?", "Membership", "Open", -1, ["I have membership number FPAA-M-2024-000012 but my account shows no membership."]],
    ["SUP-2026-0005", null, "Scholarship application deadline", "Scheme", "Closed", -25, ["Is the scholarship deadline extended?", "The deadline is 31 Oct 2026 as per notice FPAA/NOT/2026/039. — Scheme Committee"]],
    ["SUP-2026-0008", null, "Cannot sign in after changing my phone", "Technical", "Open", -2, ["I changed my mobile number and my recovery key no longer works. Please update my number."]]
  ];
  tickets.forEach((t) => {
    const tk = { id: uuid(), ticket_no: t[0], user_id: t[1] ? t[1].id : null, requester_name: t[1] ? t[1].full_name : "Guest Alumni", requester_email: t[1] ? t[1].email : "guest@example.com", subject: t[2], category: t[3], status: t[4], assigned_to: t[3] === "Payment" ? "Finance Committee" : "Registration Committee", created_at: daysFromNow(t[5], 10).toISOString(), updated_at: daysFromNow(t[5] + (t[6].length > 1 ? 1 : 0), 15).toISOString() };
    db.support_requests.push(tk);
    t[6].forEach((msg, k) => db.support_replies.push({ id: uuid(), ticket_id: tk.id, author_name: k === 0 ? tk.requester_name : "FPAA Support", author_role: k === 0 ? "member" : "admin", message: msg, created_at: daysFromNow(t[5] + k, 10 + k * 5).toISOString() }));
  });

  // ---- Notifications ----
  const nf = [
    [null, "notice", "Scholarship applications open", "Falakata Alumni Scheme 2026 applications close on 31 Oct 2026.", "#scheme", -2],
    [U.member, "membership", "Social Media Handling application under review", "APP-2026-0102 is being reviewed by the Registration Committee.", "#my-fpaa", -5],
    [U.member, "donation", "Donation verified", "Thank you! DON-2026-0001 of ₹5,000 has been verified.", "#my-fpaa", -118],
    [null, "event", "Annual Alumni Meet 2026", "Registration is open for the Annual Alumni Meet.", "#events", -4],
    [U.member, "support", "Reply on SUP-2026-0007", "The Registration Desk replied to your support request.", "#my-fpaa", -2],
    [null, "job", "New job: Junior Engineer (Electrical)", "WBSEDCL, Jalpaiguri — posted on Career & Jobs.", "#careers", -3],
    [U.newuser, "membership", "Link your membership", "Connect your approved membership record from My FPAA.", "#my-fpaa", -1],
    [null, "achievement", "New alumni achievement", "Debashis Chakraborty promoted to Assistant Engineer.", "#achievements", -12]
  ];
  nf.forEach((n) => db.notifications.push({ id: uuid(), user_id: n[0] ? n[0].id : null, type: n[1], title: n[2], message: n[3], link: n[4], created_at: daysFromNow(n[5], 9).toISOString(), read_by: n[5] < -60 ? [U.member.id] : [] }));

  // ---- Dashboard feed & gallery ----
  const feed = [
    ["announcement", "Falakata Alumni Scheme 2026 is open", "Scholarship applications for female and male students close 31 Oct.", -0.2],
    ["event", "Annual Alumni Meet — 118 registrations", "Department reunion slots will be published next week.", -1],
    ["notice", "Membership renewal window open", "Social Media Handling members can renew for 2026–27.", -1.5],
    ["gallery", "New photos: Foundation Day 2026", "Tree plantation and blood donation camp highlights added to the gallery.", -3],
    ["achievement", "Priyanka Das cleared GATE 2026", "AIR 412 in Electronics & Communication.", -6],
    ["job", "3 new jobs published", "WBSEDCL, Tata Projects and ITC Ltd. are hiring diploma engineers.", -8],
    ["announcement", "Mentorship circle crosses 60 pairs", "Thank you to every alumni mentor who volunteered.", -14],
    ["event", "Career seminar confirmed", "Diploma to Degree guidance seminar — Seminar Hall, Block B.", -18]
  ];
  feed.forEach((f) => db.dashboard_live_feed.push({ id: uuid(), type: f[0], title: f[1], body: f[2], created_at: new Date(Date.now() + f[3] * 86400000).toISOString(), status: "Published" }));
  const gal = [["campus", "Falakata Polytechnic campus — home of FPAA"], ["meetup", "Alumni Meet 2025 — reunion of the 2010–2015 batches"], ["graduation", "Convocation & Alumni Welcome 2026"], ["workshop", "PLC & Automation workshop by alumni engineers"], ["cultural", "Foundation Day cultural evening"], ["seminar", "Career Guidance Seminar: Diploma to Degree"]];
  gal.forEach((g, i) => db.homepage_gallery_feed.push({ id: uuid(), image: i === 0 ? "assets/campus.jpg" : art(g[0], i + 71), caption: g[1], sort_order: i, created_at: daysFromNow(-i * 9).toISOString() }));

  // ---- Chat ----
  const chatPeople = [members[3], members[4], members[6], members[8], members[10], members[2]];
  const cm = [
    [chatPeople[0], "Good morning everyone! Registration for the Annual Meet is open 🎉", -26],
    [chatPeople[1], "Registered already. Will the 2012 Mechanical batch get a separate reunion slot?", -25.5],
    [chatPeople[5], "Yes — department-wise slots will be shared by the Events desk next week.", -25],
    [chatPeople[2], "Anyone from Civil working in Siliguri? Tata Projects has a site supervisor opening.", -8],
    [chatPeople[3], "Shared it with my juniors. Thanks!", -7.5],
    [members[0], "Posted a solar service engineer job — waiting for admin approval.", -3],
    [chatPeople[4], "Congratulations Priyanka on the GATE rank 👏", -2],
    [chatPeople[0], "Reminder: scholarship applications close 31 October. Please share with current students.", -0.6]
  ];
  cm.forEach((c) => db.member_chat_messages.push({ id: uuid(), conversation_id: "community", sender_id: c[0].id, sender_name: c[0].full_name, body: c[1], created_at: new Date(Date.now() + c[2] * 3600000).toISOString() }));
  const dmId = "dm:" + [members[0].id, chatPeople[0].id].sort().join(":");
  [[chatPeople[0], "Hi Rahul, can you help coordinate the Mechanical batch reunion?", -30], [members[0], "Sure! I'll collect names from the 2014–17 batch.", -29.5], [chatPeople[0], "Great, thanks. Let's finalise by Friday.", -1]].forEach((c) =>
    db.member_chat_messages.push({ id: uuid(), conversation_id: dmId, sender_id: c[0].id, sender_name: c[0].full_name, body: c[1], created_at: new Date(Date.now() + c[2] * 3600000).toISOString() }));
  // Mark all but the newest DM + last 2 community messages as read by the demo member
  const sortedC = db.member_chat_messages.filter((m) => m.conversation_id === "community").sort((a, b) => a.created_at.localeCompare(b.created_at));
  sortedC.slice(0, -2).forEach((m) => db.chat_read_receipts.push({ id: uuid(), message_id: m.id, user_id: members[0].id, read_at: m.created_at }));
  db.member_chat_messages.filter((m) => m.conversation_id === dmId).slice(0, 2).forEach((m) => { db.chat_read_receipts.push({ id: uuid(), message_id: m.id, user_id: members[0].id, read_at: m.created_at }); db.chat_read_receipts.push({ id: uuid(), message_id: m.id, user_id: chatPeople[0].id, read_at: m.created_at }); });

  // ---- Audit ----
  [["Super Admin", "Approved membership application", "APP-2026-0100"], ["Finance Committee", "Verified payment", "APP-2026-0105"], ["Content Team", "Published notice", "FPAA/NOT/2026/040"], ["Registration Desk", "Rejected application", "APP-2026-0098"]].forEach((a, i) =>
    db.audit_logs.push({ id: uuid(), actor: a[0], action: a[1], entity: "record", entity_ref: a[2], created_at: daysFromNow(-i * 3 - 1, 12).toISOString() }));

  db._meta = { version: 1, seeded_at: now.toISOString() };
  return db;
}

/* ---------- Store + API adapter ---------- */
let supabaseClient = null;
const API = {
  mode: (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY) ? "supabase" : "demo",
  async init() {
    if (this.mode === "supabase") {
      try {
        await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
        supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
        S.db = {}; TABLES.forEach((t) => (S.db[t] = []));
        return;
      } catch (e) {
        console.error(e);
        toast("error", "Could not connect to Supabase", "Falling back to demo mode.");
        this.mode = "demo";
      }
    }
    const saved = this.readLocal();
    if (saved && saved._meta && saved._meta.version === 1) { S.db = saved; TABLES.forEach((t) => { if (!Array.isArray(S.db[t])) S.db[t] = []; });
      const DEMO_MOBILES = { "newuser@fpaa.in": "9123456712", "admin@fpaa.in": "9800000001", "registration@fpaa.in": "9800000002", "finance@fpaa.in": "9800000003", "content@fpaa.in": "9800000004" };
      let fixed = false; S.db.profiles.forEach((p) => { if (!p.mobile) { const m = p.member_id && S.db.members.find((x) => x.id === p.member_id); const mob = (m && m.mobile) || DEMO_MOBILES[p.email]; if (mob) { p.mobile = mob; fixed = true; } } if (/OTP/.test(p.auth_method || "")) { p.auth_method = "Email + Password"; fixed = true; } }); if (fixed) this.persist();
      const campus = S.db.homepage_gallery_feed.find((g) => /^Falakata Polytechnic campus/.test(g.caption || "") && String(g.image).startsWith("data:image/svg")); if (campus) { campus.image = "assets/campus.jpg"; this.persist(); } }
    else { S.db = await buildSeed(); this.persist(); }
  },
  readLocal() { try { return JSON.parse(localStorage.getItem(DB_KEY) || "null"); } catch (e) { return null; } },
  persist() {
    if (this.mode !== "demo") return;
    try { localStorage.setItem(DB_KEY, JSON.stringify(S.db)); }
    catch (e) { toast("error", "Demo storage is full", "Browser storage limit reached. Remove some uploaded photos or reset demo data."); throw new Error("Storage limit reached."); }
  },
  async latency(ms) { if (this.mode === "demo") await sleep(ms || 260 + Math.random() * 260); },
  all(table) { return (S.db && S.db[table]) || []; },
  get(table, id) { return this.all(table).find((r) => r.id === id) || null; },
  find(table, fn) { return this.all(table).find(fn) || null; },
  /* Load tables the signed-in user may read (Supabase RLS decides what comes back). */
  async loadAll() {
    if (this.mode !== "supabase") return;
    await Promise.all(TABLES.map(async (t) => {
      const { data, error } = await supabaseClient.from(t).select("*").limit(5000);
      S.db[t] = error ? [] : data || [];
    }));
    // Directory falls back to the masked public view if full member rows are restricted
    if (!S.db.members.length) { const { data } = await supabaseClient.from("member_directory").select("*"); S.db.members = data || []; }
  },
  async insert(table, row) {
    const rec = Object.assign({ id: uuid(), created_at: new Date().toISOString() }, row);
    if (this.mode === "supabase") {
      const { data, error } = await supabaseClient.from(table).insert(rec).select().single();
      if (error) throw new Error(error.message);
      S.db[table].push(data); return data;
    }
    await this.latency(); S.db[table].push(rec); this.persist(); return rec;
  },
  async update(table, id, patch) {
    if (this.mode === "supabase") {
      const { data, error } = await supabaseClient.from(table).update(patch).eq("id", id).select().single();
      if (error) throw new Error(error.message);
      const i = S.db[table].findIndex((r) => r.id === id); if (i >= 0) S.db[table][i] = data; return data;
    }
    await this.latency();
    const rec = this.get(table, id); if (!rec) throw new Error("Record not found.");
    Object.assign(rec, patch); this.persist(); return rec;
  },
  async remove(table, id) {
    if (this.mode === "supabase") {
      const { error } = await supabaseClient.from(table).delete().eq("id", id);
      if (error) throw new Error(error.message);
    } else await this.latency();
    S.db[table] = S.db[table].filter((r) => r.id !== id); this.persist();
  },
  /* Silent local write (no latency) — used for read receipts / presence */
  quiet(table, row) { const rec = Object.assign({ id: uuid(), created_at: new Date().toISOString() }, row); S.db[table].push(rec); if (this.mode === "supabase") supabaseClient.from(table).insert(rec).then(() => {}); else this.persist(); return rec; },
  async resetDemo() { localStorage.removeItem(DB_KEY); S.db = await buildSeed(); this.persist(); }
};
function actorName() { return S.profile ? S.profile.full_name + " (" + ROLES[S.profile.role] + ")" : "Guest"; }
function audit(action, ref) { try { API.quiet("audit_logs", { actor: actorName(), action, entity: "record", entity_ref: ref }); } catch (e) { /* ignore */ } }
function notify(userId, type, title, message, link) { try { API.quiet("notifications", { user_id: userId || null, type, title, message, link, read_by: [] }); refreshBadges(); } catch (e) { /* ignore */ } }
function nextNo(table, field, prefix, pad = 4) {
  const nums = API.all(table).map((r) => String(r[field] || "")).filter((v) => v.startsWith(prefix)).map((v) => parseInt(v.slice(prefix.length), 10) || 0);
  return prefix + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(pad, "0");
}
function nextMembershipNo() {
  const yr = new Date().getFullYear();
  const serials = API.all("members").map((m) => parseInt(String(m.membership_no).slice(-6), 10) || 0);
  return `FPAA-M-${yr}-${String(Math.max(0, ...serials) + 1).padStart(6, "0")}`;
}
/* =====================================================================
   AUTH — sessions, roles, permissions, login page
   ===================================================================== */
const PERMS = {
  "admin.view": ADMIN_ROLES,
  "admin.overview": ADMIN_ROLES,
  "admin.applications": ["superadmin", "registration"],
  "admin.members": ["superadmin", "registration"],
  "admin.schemes": ["superadmin", "registration", "committee"],
  "admin.careers": ["superadmin", "content", "committee"],
  "admin.payments": ["superadmin", "finance"],
  "admin.donations": ["superadmin", "finance"],
  "admin.finance": ["superadmin", "finance", "committee"],
  "admin.support": ["superadmin", "registration", "finance"],
  "admin.content": ["superadmin", "content"],
  "admin.accounts": ["superadmin"],
  "members.fullMobile": ["superadmin", "registration"]
};
function can(perm) { return !!(S.profile && (PERMS[perm] || []).includes(S.profile.role)); }
function isAdmin() { return !!(S.profile && ADMIN_ROLES.includes(S.profile.role)); }
function isSignedIn() { return !!S.profile; }
function hasActiveMembership() { return !!(S.member && S.member.status === "Active"); }
function hasMemberAccess() { return isSignedIn() && (hasActiveMembership() || isAdmin()); }
function myChatId() { return S.member ? S.member.id : S.profile ? S.profile.id : null; }

const Auth = {
  readSession() {
    for (const store of [localStorage, sessionStorage]) {
      try {
        const s = JSON.parse(store.getItem(SESSION_KEY) || "null");
        if (s && s.token && s.expires_at && Date.parse(s.expires_at) > Date.now()) return s;
        if (s) store.removeItem(SESSION_KEY);
      } catch (e) { /* ignore */ }
    }
    return null;
  },
  writeSession(profile, remember) {
    const s = { token: randomToken(24), user_id: profile.id, role: profile.role, created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + (remember ? 30 : 0.5) * 86400000).toISOString(), remember: !!remember };
    (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(s));
    (remember ? sessionStorage : localStorage).removeItem(SESSION_KEY);
    return s;
  },
  clearSession() { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); },
  async restore() {
    S.profile = null; S.member = null; S.session = null;
    if (API.mode === "supabase") {
      const { data } = await supabaseClient.auth.getSession();
      if (data && data.session) {
        await API.loadAll();
        S.profile = API.get("profiles", data.session.user.id);
        if (!S.profile) { const { data: p } = await supabaseClient.from("profiles").select("*").eq("id", data.session.user.id).single(); S.profile = p || null; }
        S.session = data.session;
      } else {
        await API.loadAll();
      }
    } else {
      const s = this.readSession(); if (!s) return;
      const p = API.get("profiles", s.user_id);
      if (!p || p.status !== "Active") { this.clearSession(); return; }
      S.session = s; S.profile = p;
    }
    this.bindMember();
  },
  bindMember() {
    S.member = null;
    if (!S.profile) return;
    S.member = (S.profile.member_id && API.get("members", S.profile.member_id)) || API.find("members", (m) => m.user_id === S.profile.id) || null;
  },
  async completeLogin(profile, remember, method) {
    if (profile.status !== "Active") throw new Error("This account is disabled. Please contact the FPAA Registration Committee.");
    if (API.mode === "demo") {
      profile.last_login = new Date().toISOString(); profile.last_auth_method = method; API.persist();
      this.writeSession(profile, remember);
    }
    audit("Signed in via " + method, profile.email);
  },
  /* Recovery ("master") key = first 4 letters of the registered name in CAPITALS
     + last 4 digits of the registered mobile. e.g. Rahul Barman, 9876543206 → RAHU3206 */
  recoveryKey(name, mobile) {
    const letters = String(name || "").replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 4);
    const digits = normMobile(mobile).slice(-4);
    return letters && digits.length === 4 ? letters + digits : "";
  },
  profileMobile(p) { const m = p.member_id && API.get("members", p.member_id); return normMobile((m && m.mobile) || p.mobile || ""); },
  findByIdentifier(id) {
    id = String(id || "").trim().toLowerCase();
    if (id.includes("@")) return API.find("profiles", (x) => x.email.toLowerCase() === id);
    const mob = normMobile(id); if (!RX.mobile.test(mob)) return null;
    return API.find("profiles", (x) => this.profileMobile(x) === mob);
  },
  async loginPassword(identifier, password, remember) {
    identifier = identifier.trim().toLowerCase();
    if (API.mode === "supabase") {
      let email = identifier;
      if (!identifier.includes("@")) {
        const { data } = await supabaseClient.rpc("email_for_mobile", { p_mobile: normMobile(identifier) });
        if (!data) throw new Error("Incorrect email/mobile or password.");
        email = data;
      }
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message === "Invalid login credentials" ? "Incorrect email/mobile or password." : error.message);
      if (!remember) sessionStorage.setItem("fpaa_sb_ephemeral", "1");
      return data;
    }
    await API.latency(500);
    const p = this.findByIdentifier(identifier);
    if (!p || (await hashPassword(password, p.salt)) !== p.password_hash) throw new Error("Incorrect email/mobile or password.");
    await this.completeLogin(p, remember, "Email + Password");
    return p;
  },
  async signUp({ full_name, email, mobile, password }, remember) {
    email = email.trim().toLowerCase(); mobile = normMobile(mobile); full_name = full_name.trim().replace(/\s+/g, " ");
    if (API.mode === "supabase") {
      const { data, error } = await supabaseClient.auth.signUp({ email, password, options: { data: { full_name, mobile }, emailRedirectTo: absoluteUrl("login.html") } });
      if (error) throw new Error(error.message);
      return { needsConfirmation: !data.session };
    }
    await API.latency(600);
    if (API.find("profiles", (x) => x.email.toLowerCase() === email)) throw new Error("An account with this email already exists. Please sign in instead.");
    if (API.find("profiles", (x) => this.profileMobile(x) === mobile)) throw new Error("This mobile number is already registered. Please sign in instead.");
    const salt = randomToken(8);
    const p = await API.insert("profiles", { email, full_name, mobile, role: "member", member_id: null, auth_method: "Email + Password", status: "Active", salt, password_hash: await hashPassword(password, salt), last_login: null });
    // Auto-link an approved membership record when BOTH email and mobile match it.
    const m = API.find("members", (x) => !x.user_id && (x.email || "").toLowerCase() === email && x.mobile === mobile);
    if (m) { await API.update("members", m.id, { user_id: p.id }); await API.update("profiles", p.id, { member_id: m.id }); }
    audit("Created account (sign up)", email);
    notify(p.id, "membership", "Welcome to FPAA Connect 2.0", m ? `Your membership ${m.membership_no} is linked to this account.` : "Link your approved membership from My FPAA, or apply for membership.", "#my-fpaa");
    await this.completeLogin(p, remember, "Email + Password");
    return { needsConfirmation: false, linked: m ? m.membership_no : null };
  },
  failKey(id) { return "fpaa_reset_fail_" + String(id).toLowerCase(); },
  async resetWithRecoveryKey(identifier, key, newPassword) {
    key = String(key || "").trim().toUpperCase();
    if (API.mode === "supabase") {
      const { data, error } = await supabaseClient.rpc("reset_password_with_master_key", { p_identifier: identifier.trim().toLowerCase(), p_key: key, p_new_password: newPassword });
      if (error) throw new Error(error.message);
      if (!data) throw new Error("The email/mobile or recovery key is incorrect.");
      return;
    }
    await API.latency(600);
    const lock = JSON.parse(localStorage.getItem(this.failKey(identifier)) || '{"n":0,"t":0}');
    if (lock.n >= 5 && Date.now() - lock.t < 15 * 60000) throw new Error("Too many incorrect attempts. Please wait 15 minutes and try again.");
    const p = this.findByIdentifier(identifier);
    const expected = p ? this.recoveryKey(p.full_name, this.profileMobile(p)) : "";
    if (!p || !expected || key !== expected) {
      localStorage.setItem(this.failKey(identifier), JSON.stringify({ n: (lock.n >= 5 ? 0 : lock.n) + 1, t: Date.now() }));
      throw new Error("The email/mobile or recovery key is incorrect.");
    }
    localStorage.removeItem(this.failKey(identifier));
    const salt = randomToken(8);
    await API.update("profiles", p.id, { salt, password_hash: await hashPassword(newPassword, salt) });
    audit("Reset password with recovery key", p.email);
  },
  async logout() {
    try { if (API.mode === "supabase") await supabaseClient.auth.signOut(); } catch (e) { /* ignore */ }
    if (S.profile) audit("Signed out", S.profile.email);
    this.clearSession(); S.profile = null; S.member = null;
    location.href = "login.html";
  }
};

/* ---------- Sign in / Sign up page (login.html) ---------- */
const vPassword = [(x) => !x || (x.length >= 8 && /[A-Za-z]/.test(x) && /\d/.test(x)), "Use at least 8 characters with letters and numbers."];
function pwField({ label, name, placeholder = "", autocomplete = "current-password", hint = "" }) {
  const id = "pw_" + name;
  return h`<div class="field"><label for="${id}">${label} <span class="req">*</span></label><div class="pw-wrap"><input class="input" id="${id}" name="${name}" type="password" placeholder="${placeholder}" autocomplete="${autocomplete}"><button type="button" class="pw-toggle" data-action="pw-toggle" aria-label="Show password" title="Show password">${icon("eye")}</button></div>${hint ? h`<span class="hint">${hint}</span>` : ""}<span class="err"></span></div>`;
}
const LoginPage = {
  view: "signin", prefill: "",
  init() {
    const feats = [["users", "Alumni directory"], ["idcard", "Digital membership card"], ["briefcase", "Career & jobs"], ["school", "Falakata Alumni Scheme"]];
    setHTML($("#loginFeats"), feats.map((f) => h`<div>${icon(f[0])}${f[1]}</div>`));
    if (isSignedIn()) { this.redirect(); return; }
    const q = new URLSearchParams(location.search).get("mode");
    if (q === "signup" || location.hash === "#signup") this.view = "signup";
    this.render();
    document.addEventListener("click", (e) => this.onClick(e));
    document.addEventListener("submit", (e) => this.onSubmit(e));
    document.addEventListener("input", (e) => { if (e.target.closest("#signupForm") && ["full_name", "mobile"].includes(e.target.name)) this.updateKeyPreview(); });
  },
  next() { const n = new URLSearchParams(location.search).get("next"); return n && /^[a-z-]+(\/[a-z-]+)?$/.test(n) ? n : null; },
  redirect() { const n = this.next(); location.href = "index.html#" + (n || (isAdmin() ? "admin" : "my-fpaa")); },
  demoBox() {
    if (API.mode !== "demo" || this.view !== "signin") return "";
    const acc = [["member@fpaa.in", "Member@123", "Alumni Member"], ["newuser@fpaa.in", "Welcome@123", "New user (unlinked)"], ["admin@fpaa.in", "Admin@123", "Super Admin"], ["registration@fpaa.in", "Admin@123", "Registration"], ["finance@fpaa.in", "Admin@123", "Finance"], ["content@fpaa.in", "Admin@123", "Content Admin"], ["committee@fpaa.in", "Admin@123", "Committee"]];
    return h`<div class="demo-accounts"><b>${icon("key", "ico ico-sm")} Demo accounts</b> <span class="muted">— tap to fill (demo mode only)</span>
      <div class="row">${acc.map((a) => h`<button type="button" class="chip gold" data-action="demo-fill" data-email="${a[0]}" data-pw="${a[1]}" title="${a[0]}">${a[2]}</button>`)}</div>
      <div class="small muted" style="margin-top:8px">Demo recovery key for Alumni Member: <b class="mono">RAHU3206</b></div></div>`;
  },
  tabs() {
    return h`<div class="tabs" role="tablist" aria-label="Sign in or sign up">${[["signin", "Sign in"], ["signup", "Sign up"]].map((t) => h`<button type="button" role="tab" aria-selected="${String(this.view === t[0])}" class="tab ${this.view === t[0] ? "active" : ""}" data-action="login-view" data-view="${t[0]}">${t[1]}</button>`)}</div>`;
  },
  head(title, sub) {
    return h`<div class="row" style="gap:14px"><img src="${CONFIG.LOGO_URL}" alt="" style="width:52px;height:52px"><div><span class="eyebrow">FPAA Connect 2.0</span><h2 style="margin:2px 0 0">${title}</h2></div></div><p class="muted" style="margin:10px 0 0">${sub}</p>`;
  },
  render() {
    const card = $("#loginCard"); const v = this.view;
    document.title = (v === "signup" ? "Sign up" : v === "forgot" ? "Reset password" : "Sign in") + " — FPAA Connect 2.0";
    const remember = h`<label class="check"><input type="checkbox" name="remember" checked> Remember me on this device</label>`;
    if (v === "forgot") {
      setHTML(card, h`${this.head("Reset password", "Enter your registered email or mobile and your recovery key, then choose a new password.")}
        <div class="alert alert-info" style="margin-top:16px">${icon("key")}<div><b>Your recovery key</b>First 4 letters of your registered name in CAPITALS + last 4 digits of your registered mobile number.<br><span class="small">Example: Rahul Barman · 98765 43206 → <b class="mono">RAHU3206</b></span></div></div>
        <form id="forgotForm" class="stack" style="margin-top:16px" novalidate>
          ${field({ label: "Registered email or mobile", name: "identifier", required: true, value: this.prefill, placeholder: "you@example.com or 10-digit mobile", attrs: 'autocomplete="username"' })}
          ${field({ label: "Recovery key", name: "recovery_key", required: true, placeholder: "RAHU3206", attrs: 'maxlength="8" autocomplete="off" style="text-transform:uppercase;letter-spacing:.12em;font-family:ui-monospace,Menlo,Consolas,monospace"' })}
          ${pwField({ label: "New password", name: "new_password", placeholder: "At least 8 characters", autocomplete: "new-password", hint: "Use at least 8 characters with letters and numbers." })}
          ${pwField({ label: "Confirm new password", name: "confirm_password", placeholder: "Re-enter new password", autocomplete: "new-password" })}
          <button class="btn btn-primary btn-block" type="submit">${icon("key")}Reset password</button>
          <div class="form-msg" id="loginMsg"></div>
          <button type="button" class="link-btn" data-action="login-view" data-view="signin">${icon("arrowL", "ico ico-sm")} Back to sign in</button></form>`);
      return;
    }
    if (v === "signup") {
      setHTML(card, h`${this.head("Create your account", "Join FPAA Connect 2.0 with your name, mobile number and email.")}${this.tabs()}
        <form id="signupForm" class="stack" novalidate>
          ${field({ label: "Full name", name: "full_name", required: true, placeholder: "As on your diploma certificate", attrs: 'autocomplete="name" maxlength="80"' })}
          ${field({ label: "Mobile number", name: "mobile", type: "tel", required: true, placeholder: "10-digit mobile number", attrs: 'inputmode="numeric" maxlength="16" autocomplete="tel"' })}
          ${field({ label: "Email", name: "email", type: "email", required: true, placeholder: "you@example.com", attrs: 'autocomplete="email"' })}
          ${pwField({ label: "Create password", name: "password", placeholder: "At least 8 characters", autocomplete: "new-password", hint: "Use at least 8 characters with letters and numbers." })}
          ${pwField({ label: "Confirm password", name: "confirm_password", placeholder: "Re-enter password", autocomplete: "new-password" })}
          <div class="alert alert-warn" id="keyPreview">${icon("key")}<div><b>Your recovery key: <span class="mono" id="keyPreviewVal">—</span></b>First 4 letters of your name in CAPITALS + last 4 digits of your mobile. You will need it if you forget your password.</div></div>
          ${remember}
          <button class="btn btn-primary btn-block" type="submit">${icon("userPlus")}Create account</button>
          <div class="form-msg" id="loginMsg"></div></form>
        <p class="small muted" style="margin-top:16px;text-align:center">Already have an account? <button type="button" class="link-btn small" data-action="login-view" data-view="signin">Sign in</button></p>`);
      return;
    }
    if (v === "welcome") {
      const w = this.welcome || {};
      setHTML(card, h`${this.head("Account created", "Welcome to FPAA Connect 2.0, " + (w.name || "") + ".")}
        <div class="verify-card" style="margin-top:18px"><div class="row"><span class="ico-tile teal">${icon("check")}</span><div><span class="eyebrow">Save this safely</span><h3 style="margin:2px 0 0">Recovery key: <span class="mono">${w.key}</span></h3></div></div>
          <p class="small" style="margin:12px 0 0">Use this key with <b>Forgot password</b> if you ever forget your password. It is made from the first 4 letters of your name and the last 4 digits of your mobile — do not share it.</p></div>
        ${w.linked ? h`<div style="margin-top:14px">${alertBox("success", "Membership linked", "Your approved membership " + w.linked + " was found and linked automatically.")}</div>` : ""}
        ${w.confirm ? h`<div style="margin-top:14px">${alertBox("info", "Confirm your email", "We sent a confirmation link to " + w.email + ". Open it, then sign in.")}</div>` : ""}
        <button class="btn btn-primary btn-block" style="margin-top:18px" data-action="${w.confirm ? "login-view" : "welcome-continue"}" data-view="signin">${icon("login")}${w.confirm ? "Go to sign in" : "Continue to FPAA Connect 2.0"}</button>`);
      return;
    }
    setHTML(card, h`${this.head("Welcome back", "Sign in to access My FPAA, the alumni directory and member services.")}${this.tabs()}
      <form id="pwForm" class="stack" novalidate>
        ${field({ label: "Email or mobile number", name: "email", required: true, value: this.prefill, placeholder: "you@example.com or 10-digit mobile", attrs: 'autocomplete="username"' })}
        ${pwField({ label: "Password", name: "password", placeholder: "Your password" })}
        <div class="row-between">${remember}<button type="button" class="link-btn small" data-action="login-view" data-view="forgot">Forgot password?</button></div>
        <button class="btn btn-primary btn-block" type="submit">${icon("login")}Sign in</button>
        <div class="form-msg" id="loginMsg"></div></form>
      ${this.demoBox()}
      <p class="small muted" style="margin-top:16px;text-align:center">New to FPAA Connect 2.0? <button type="button" class="link-btn small" data-action="login-view" data-view="signup">Create an account</button> · <a href="index.html#membership">Verify a membership</a></p>`);
  },
  updateKeyPreview() {
    const f = $("#signupForm"); if (!f) return;
    const k = Auth.recoveryKey(f.querySelector('[name="full_name"]').value, f.querySelector('[name="mobile"]').value);
    $("#keyPreviewVal").textContent = k || "—";
  },
  onClick(e) {
    const b = e.target.closest("[data-action]"); if (!b) return;
    const a = b.dataset.action;
    if (a === "login-view") { this.view = b.dataset.view; this.render(); const f = $("#loginCard input:not([type=checkbox])"); if (f && !f.value) f.focus(); }
    if (a === "welcome-continue") this.redirect();
    if (a === "demo-fill") {
      if (this.view !== "signin") { this.view = "signin"; this.render(); }
      $('#pwForm [name="email"]').value = b.dataset.email; $('#pwForm [name="password"]').value = b.dataset.pw;
      toast("info", "Demo credentials filled", "Press Sign in to continue.", 2500);
    }
    if (a === "pw-toggle") {
      const i = b.parentElement.querySelector("input"); const show = i.type === "password";
      i.type = show ? "text" : "password"; setHTML(b, icon(show ? "eyeOff" : "eye"));
      b.setAttribute("aria-label", show ? "Hide password" : "Show password"); b.title = show ? "Hide password" : "Show password";
    }
  },
  async onSubmit(e) {
    const form = e.target; e.preventDefault();
    const btn = form.querySelector('button[type="submit"]'); const msg = $("#loginMsg");
    const vIdentifier = [(x) => !x || isEmail(x) || isMobile(x), "Enter a valid email address or 10-digit mobile number."];
    if (form.id === "pwForm") {
      const v = validate(form, { email: [req("Email or mobile is required."), vIdentifier], password: [req("Password is required.")] });
      if (!v) return;
      await busy(btn, "Signing in…", async () => {
        try { await Auth.loginPassword(v.email, v.password, v.remember); formMsg(msg, "success", "Signed in", "Redirecting to FPAA Connect 2.0…"); await Auth.restore(); setTimeout(() => this.redirect(), 400); }
        catch (err) { formMsg(msg, "error", "Sign in failed", err.message); }
      });
    } else if (form.id === "signupForm") {
      const v = validate(form, {
        full_name: [req("Full name is required."), [(x) => x.replace(/[^A-Za-z]/g, "").length >= 3, "Enter your full name (at least 3 letters)."]],
        mobile: [req("Mobile number is required."), vMobile], email: [req("Email is required."), vEmail],
        password: [req("Create a password."), vPassword], confirm_password: [req("Confirm your password."), [(x, all) => x === all.password, "Passwords do not match."]]
      });
      if (!v) return;
      await busy(btn, "Creating account…", async () => {
        try {
          const r = await Auth.signUp(v, v.remember);
          this.welcome = { name: v.full_name.split(" ")[0], key: Auth.recoveryKey(v.full_name, v.mobile), linked: r.linked, confirm: r.needsConfirmation, email: v.email };
          if (!r.needsConfirmation) await Auth.restore();
          this.view = "welcome"; this.render(); toast("success", "Account created", "Welcome to FPAA Connect 2.0.");
        } catch (err) { formMsg(msg, "error", "Could not create account", err.message); }
      });
    } else if (form.id === "forgotForm") {
      const v = validate(form, {
        identifier: [req("Email or mobile is required."), vIdentifier],
        recovery_key: [req("Recovery key is required."), [(x) => /^[A-Za-z]{1,4}\d{4}$/.test(x.trim()), "Recovery key is 4 letters followed by 4 digits, e.g. RAHU3206."]],
        new_password: [req("Enter a new password."), vPassword], confirm_password: [req("Confirm the new password."), [(x, all) => x === all.new_password, "Passwords do not match."]]
      });
      if (!v) return;
      await busy(btn, "Resetting…", async () => {
        try {
          await Auth.resetWithRecoveryKey(v.identifier, v.recovery_key, v.new_password);
          this.prefill = v.identifier; this.view = "signin"; this.render();
          formMsg($("#loginMsg"), "success", "Password reset", "Your password has been changed. Sign in with your new password.");
          $('#pwForm [name="password"]').focus();
        } catch (err) { formMsg(msg, "error", "Could not reset password", err.message); }
      });
    }
  }
};
/* =====================================================================
   NAVIGATION — routes, router, sidebar, topbar, footer, event delegation
   ===================================================================== */
const Views = {};      // route id -> render() returning SafeHTML
const Mounts = {};     // route id -> after-render hook
const Actions = {};    // data-action -> handler(el, event)
const Filters = {};    // data-filter group -> re-render function

const ROUTES = [
  { id: "home", label: "Home", icon: "home", group: "Main" },
  { id: "my-fpaa", label: "My FPAA", icon: "user", group: "Main" },
  { id: "about", label: "About", icon: "info", group: "Main" },
  { id: "directory", label: "Alumni Directory", icon: "users", group: "Community", protected: true },
  { id: "membership", label: "Membership", icon: "idcard", group: "Community" },
  { id: "careers", label: "Career & Jobs", icon: "briefcase", group: "Community", protected: true },
  { id: "events", label: "Events", icon: "calendar", group: "Community", protected: true },
  { id: "donations", label: "Donations", icon: "heart", group: "Community", protected: true },
  { id: "achievements", label: "Achievements", icon: "trophy", group: "Community", protected: true },
  { id: "memories", label: "Memories", icon: "image", group: "Community", protected: true },
  { id: "scheme", label: "Falakata Alumni Scheme", icon: "school", group: "Community", protected: true },
  { id: "notices", label: "Notices", icon: "megaphone", group: "Community", protected: true },
  { id: "admin", label: "Admin", icon: "shield", group: "Administration", admin: true }
];
const ROUTE_BY_ID = Object.fromEntries(ROUTES.map((r) => [r.id, r]));

const Router = {
  parse() {
    const hash = decodeURIComponent((location.hash || "#home").slice(1));
    if (hash.startsWith("verify=")) return { name: "membership", param: "", verify: normMembership(hash.slice(7)) };
    const [name, ...rest] = hash.split("/");
    return { name: ROUTE_BY_ID[name] ? name : "home", param: rest.join("/") };
  },
  go(hash) { if (location.hash === hash) this.render(); else location.hash = hash; },
  render() {
    const r = this.parse();
    const route = ROUTE_BY_ID[r.name];
    if (route.protected && !hasMemberAccess()) {
      S.ui.accessMsg = { module: route.label, reason: !isSignedIn() ? "signin" : "membership" };
      history.replaceState(null, "", "#my-fpaa"); return this.render();
    }
    if (route.admin && !isAdmin()) {
      S.ui.accessMsg = { module: "Admin Dashboard", reason: isSignedIn() ? "role" : "signin" };
      history.replaceState(null, "", "#my-fpaa"); return this.render();
    }
    const changed = S.route.name !== r.name;
    S.route = r;
    Home.stopGallery();
    const view = $("#view");
    let html;
    try { html = Views[r.name](r); }
    catch (err) { console.error(err); html = h`<div class="glass card">${alertBox("error", "Could not load this section.", "Please try again. " + err.message)}</div>`; }
    setHTML(view, html);
    if (changed) { view.classList.remove("view-enter"); void view.offsetWidth; view.classList.add("view-enter"); window.scrollTo({ top: 0, behavior: "auto" }); }
    if (Mounts[r.name]) { try { Mounts[r.name](r); } catch (err) { console.error(err); } }
    Nav.update();
    document.body.classList.remove("nav-open");
    $("#burgerBtn") && $("#burgerBtn").setAttribute("aria-expanded", "false");
  },
  refresh() { this.render(); }
};

const Nav = {
  renderSidebar() {
    let group = null; const parts = [];
    ROUTES.forEach((r) => {
      if (r.admin && !isAdmin()) return;
      if (r.group !== group) { group = r.group; parts.push(h`<div class="sb-group">${group}</div>`); }
      const locked = r.protected && !hasMemberAccess();
      parts.push(h`<a class="sb-link" href="#${r.id}" data-route="${r.id}">${icon(r.icon)}<span>${r.label}</span>${locked ? h`<span class="lock" title="Members only">${icon("lock", "ico ico-sm")}</span>` : ""}</a>`);
    });
    setHTML($("#sbNav"), parts);
    const mb = $("#modeBadge");
    if (mb) { mb.textContent = API.mode === "demo" ? "Demo mode · local data" : "Live · Supabase"; mb.classList.toggle("live", API.mode !== "demo"); }
  },
  renderTopbar() {
    setHTML($("#burgerBtn"), icon("menu"));
    let actions;
    if (isSignedIn()) {
      const unread = Notifications.unreadCount();
      actions = h`<button class="icon-btn" data-action="notif-open" aria-label="Notifications${unread ? ", " + unread + " unread" : ""}">${icon("bell")}${unread ? h`<span class="badge">${unread > 99 ? "99+" : unread}</span>` : ""}</button>
        <a class="user-chip" href="#my-fpaa" title="My FPAA">${avatar(S.profile.full_name, S.member && S.member.photo, "sm")}<span class="who"><b>${S.profile.full_name}</b><span>${ROLES[S.profile.role]}</span></span></a>
        <button class="icon-btn" data-action="logout" aria-label="Log out" title="Log out">${icon("logout")}</button>`;
    } else {
      actions = h`<a class="btn btn-ghost btn-sm" href="login.html?mode=signup">${icon("userPlus", "ico ico-sm")}<span>Sign up</span></a><a class="btn btn-primary btn-sm" href="login.html">${icon("login", "ico ico-sm")}Sign in</a>`;
    }
    setHTML($("#tbActions"), actions);
  },
  update() {
    $$(".sb-link").forEach((a) => a.classList.toggle("active", a.dataset.route === S.route.name));
    const r = ROUTE_BY_ID[S.route.name];
    $("#tbName").textContent = r.label;
    $("#tbCrumb").textContent = r.group === "Main" ? "FPAA Connect 2.0" : r.group;
    document.title = r.label + " — FPAA Connect 2.0";
  },
  renderFooter() {
    setHTML($("#siteFooter"), h`<div class="ft-inner">
        <div class="ft-brand"><img src="${CONFIG.LOGO_URL}" alt="FPAA emblem"><div><b>FALAKATA POLYTECHNIC ALUMNI ASSOCIATION</b><span class="fc">FPAA CONNECT 2.0</span><i>“Connecting the Past. Empowering the Present. Building the Future.”</i></div></div>
        <nav class="ft-links" aria-label="Footer">
          <button data-action="go" data-to="#about">About</button><button data-action="go" data-to="#membership">Membership</button>
          <button data-action="footer-contact">Contact</button><button data-action="go" data-to="#notices">Notices</button>
          <button data-action="footer-privacy">Privacy</button><button data-action="footer-terms">Terms</button>
        </nav></div>
      <div class="ft-copy"><span>© ${new Date().getFullYear()} Falakata Polytechnic Alumni Association · ESTD 2024</span><span>${API.mode === "demo" ? "Demo mode — sample data only" : "Official FPAA Connect 2.0 platform"}</span></div>`);
  },
  all() { this.renderSidebar(); this.renderTopbar(); this.renderFooter(); }
};
function refreshBadges() { Nav.renderTopbar(); Chat.renderLauncher(); }

Actions["nav-toggle"] = () => { const open = !document.body.classList.contains("nav-open"); document.body.classList.toggle("nav-open", open); $("#burgerBtn").setAttribute("aria-expanded", String(open)); };
Actions["nav-close"] = () => { document.body.classList.remove("nav-open"); $("#burgerBtn").setAttribute("aria-expanded", "false"); };
Actions["go"] = (el) => { Modal.close(); Router.go(el.dataset.to); };
Actions["modal-close"] = () => Modal.close();
Actions["logout"] = async () => { if (await confirmDialog({ title: "Log out of FPAA Connect 2.0?", message: "You will need to sign in again to access member services.", confirmText: "Log out" })) Auth.logout(); };
Actions["footer-contact"] = () => Modal.open({
  title: "Contact FPAA", eyebrow: "Falakata Polytechnic Alumni Association",
  body: h`<dl class="kv"><dt>Email</dt><dd>${CONFIG.CONTACT_EMAIL || "—"}</dd><dt>Phone</dt><dd>${CONFIG.CONTACT_PHONE || "—"}</dd><dt>Address</dt><dd>${CONFIG.CONTACT_ADDRESS || "—"}</dd><dt>Office hours</dt><dd>Mon – Sat, 10:00 AM – 5:00 PM</dd></dl>
    <div class="divider"></div><p class="muted small">Members can raise a support request from My FPAA for membership, payment, profile or scheme queries — every request gets a ticket number and a tracked reply.</p>`,
  foot: h`<button class="btn btn-ghost" data-action="modal-close">Close</button><button class="btn btn-primary" data-action="support-new">${icon("support")}New support request</button>`
});
Actions["footer-privacy"] = () => Modal.open({
  title: "Privacy Policy", eyebrow: "FPAA Connect 2.0", size: "lg",
  body: h`<div class="stack small">
    <p><b>What we collect.</b> Name, email, mobile number, department, admission and passing year, profession, organisation, address and an optional profile photo — only to administer FPAA membership and alumni services.</p>
    <p><b>Who can see it.</b> Your full profile is private. The alumni directory shows only name, department, profession, organisation, passing year and a masked mobile number (e.g. 987654****). Full mobile numbers are visible only to the Registration Committee and Super Admin.</p>
    <p><b>Public verification.</b> Anyone with your membership number can confirm your name, category, status and validity — nothing else.</p>
    <p><b>Payments & donations.</b> We store payment reference numbers for verification. We never store card numbers, UPI PINs or bank passwords.</p>
    <p><b>Your choices.</b> You can update your contact and professional details from My FPAA, or raise a support request to correct or delete your data.</p>
    <p><b>Security.</b> Access is role-based and every administrative action is recorded in an audit log.</p></div>`,
  foot: h`<button class="btn btn-primary" data-action="modal-close">I understand</button>`
});
Actions["footer-terms"] = () => Modal.open({
  title: "Terms of Use", eyebrow: "FPAA Connect 2.0", size: "lg",
  body: h`<div class="stack small">
    <p>FPAA Connect 2.0 is the official platform of Falakata Polytechnic Alumni Association (ESTD 2024). By using it you agree to:</p>
    <ol style="padding-left:18px;margin:0;display:grid;gap:8px">
      <li>Provide accurate information in membership, scheme and donation forms.</li>
      <li>Use alumni contact details only for association and professional purposes — never for spam, marketing or harassment.</li>
      <li>Post only genuine job opportunities. The Career Cell may reject or remove any listing, especially those asking candidates for fees.</li>
      <li>Keep community chat respectful. Moderators may remove messages that violate these terms.</li>
      <li>Membership fees are as published: Alumni Membership ₹100, Social Media Handling ₹500/year (renewal), Management Committee Membership ₹5000 (one time). Fees are non-refundable once verified.</li>
      <li>Certificates and membership cards remain the property of FPAA and are valid only while membership is active.</li>
    </ol></div>`,
  foot: h`<button class="btn btn-primary" data-action="modal-close">Close</button>`
});

/* ---- Global delegation ---- */
function bindGlobalEvents() {
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el || el.disabled) return;
    const fn = Actions[el.dataset.action];
    if (!fn) { console.error("FPAA Connect 2.0: no handler for action", el.dataset.action); return; }
    if (el.tagName === "A" || el.type === "submit") e.preventDefault();
    try { const r = fn(el, e); if (r && r.catch) r.catch((err) => { console.error(err); toast("error", "Something went wrong", err.message); }); }
    catch (err) { console.error(err); toast("error", "Something went wrong", err.message); }
  });
  const onFilter = (e) => {
    const el = e.target.closest("[data-filter]"); if (!el) return;
    const [group, key] = el.dataset.filter.split(".");
    if (!S.ui[group]) S.ui[group] = {};
    S.ui[group][key] = el.type === "checkbox" ? el.checked : el.value;
    if (key !== "page") S.ui[group].page = 1;
    if (Filters[group]) Filters[group]();
  };
  document.addEventListener("input", debounce(onFilter, 160));
  document.addEventListener("change", (e) => { if (e.target.matches("select[data-filter],input[type=date][data-filter],input[type=checkbox][data-filter]")) onFilter(e); });
  document.addEventListener("submit", (e) => {
    const form = e.target.closest("form[data-submit]"); if (!form) return;
    e.preventDefault();
    const fn = Actions[form.dataset.submit];
    if (!fn) { console.error("FPAA Connect 2.0: no submit handler", form.dataset.submit); return; }
    const r = fn(form, e); if (r && r.catch) r.catch((err) => { console.error(err); toast("error", "Something went wrong", err.message); });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (Modal.isOpen()) Modal.close();
    else if (document.body.classList.contains("chat-open")) Chat.close();
    else if (document.body.classList.contains("nav-open")) Actions["nav-close"]();
  });
  window.addEventListener("hashchange", () => { Modal.close(); Router.render(); });
  window.addEventListener("storage", (e) => { if (e.key === DB_KEY && e.newValue) { try { S.db = JSON.parse(e.newValue); Auth.bindMember(); Chat.onExternalUpdate(); refreshBadges(); } catch (er) { /* ignore */ } } });
}

/* ---- Shared small renderers ---- */
function statusPill(status) {
  const map = { Active: "green", Verified: "green", Approved: "green", Published: "green", Resolved: "green", Linked: "green", Shortlisted: "blue",
    Pending: "amber", "Under Review": "blue", "In Progress": "blue", Submitted: "blue", Open: "amber", Draft: "slate", "Pending Payment": "amber",
    Rejected: "red", Inactive: "slate", Closed: "slate", Disabled: "red", "Not linked": "slate", Registered: "violet", Upcoming: "blue", Completed: "slate" };
  return h`<span class="pill pill-${map[status] || "slate"}">${status}</span>`;
}
function pageHead({ eyebrow, title, sub, actions = "" }) {
  return h`<div class="page-head reveal"><div style="min-width:0"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1>${sub ? h`<p>${sub}</p>` : ""}</div>${actions ? h`<div class="btn-group">${actions}</div>` : ""}</div>`;
}
function selectFilter(filterKey, value, options, placeholder) {
  return h`<select class="select" data-filter="${filterKey}" aria-label="${placeholder}"><option value="">${placeholder}</option>${options.map((o) => { const v = typeof o === "object" ? o.value : o, l = typeof o === "object" ? o.label : o; return h`<option value="${v}" ${raw(String(v) === String(value) ? "selected" : "")}>${l}</option>`; })}</select>`;
}
function searchFilter(filterKey, value, placeholder) {
  return h`<label class="input-icon"><span class="sr-only">${placeholder}</span>${icon("search")}<input class="input" type="search" data-filter="${filterKey}" value="${value}" placeholder="${placeholder}"></label>`;
}
function pager(group, page, totalPages, total, perPage) {
  if (total === 0) return "";
  const from = (page - 1) * perPage + 1, to = Math.min(total, page * perPage);
  const pages = []; for (let p = Math.max(1, page - 2); p <= Math.min(totalPages, page + 2); p++) pages.push(p);
  return h`<div class="pager"><span>Showing ${from}–${to} of ${fmtNum(total)}</span><div class="pages">
    <button class="pg" data-action="page" data-group="${group}" data-page="${page - 1}" ${raw(page <= 1 ? "disabled" : "")} aria-label="Previous page">‹</button>
    ${pages.map((p) => h`<button class="pg ${p === page ? "active" : ""}" data-action="page" data-group="${group}" data-page="${p}">${p}</button>`)}
    <button class="pg" data-action="page" data-group="${group}" data-page="${page + 1}" ${raw(page >= totalPages ? "disabled" : "")} aria-label="Next page">›</button></div></div>`;
}
Actions["page"] = (el) => { const g = el.dataset.group; S.ui[g].page = Number(el.dataset.page); if (Filters[g]) Filters[g](); const anchor = $(`[data-list="${g}"]`); if (anchor) anchor.scrollIntoView({ behavior: "smooth", block: "start" }); };
const DEFAULT_SORT = { dir: "name", jobs: "new", events: "date", ach: "new", mem: "new", ntc: "new", aApps: "new", aMembers: "no", aSch: "new", aJobs: "new", aPay: "new", aDon: "new", aSup: "upd", aEvt: "date", aNtc: "new", aAch: "new", aMem: "new", aAcc: "new" };
Actions["clear-filters"] = (el) => {
  const g = el.dataset.group; const keep = { events: { tab: S.ui.events.tab } }[g] || {};
  Object.keys(S.ui[g]).forEach((k) => { if (k === "page") S.ui[g][k] = 1; else if (k === "sort") S.ui[g][k] = DEFAULT_SORT[g] || ""; else if (!(k in keep) && !k.startsWith("__")) S.ui[g][k] = ""; });
  Router.render(); toast("info", "Filters cleared", "", 1600);
};
/* =====================================================================
   HOME / DASHBOARD — hero, statistics, gallery, live feed, charts, PPT
   ===================================================================== */
const CHART_COLORS = ["#15365F", "#3B82F6", "#6366F1", "#8B5CF6", "#D7A52B", "#0EA5A4", "#93C5FD", "#F472B6"];

/* Donut chart: no labels on slices — details live in legend cards beside it */
function donutChart(id, segments, centerValue, centerLabel) {
  const total = sum(segments, (s) => s.value) || 1;
  const R = 70, C = 2 * Math.PI * R; let offset = 0;
  const segs = segments.map((s, i) => {
    const len = (s.value / total) * C; const gap = segments.length > 1 ? 2 : 0;
    const el = h`<circle class="seg" data-seg="${id}:${i}" cx="100" cy="100" r="${R}" fill="none" stroke="${s.color}" stroke-width="24" stroke-dasharray="${Math.max(0, len - gap)} ${C}" stroke-dashoffset="${-offset}"><title>${s.label}: ${fmtNum(s.value)}</title></circle>`;
    offset += len; return el;
  });
  return h`<div class="chart-body" data-chart="${id}">
    <div class="donut-wrap"><svg viewBox="0 0 200 200" role="img" aria-label="${centerLabel} chart"><circle cx="100" cy="100" r="${R}" fill="none" stroke="rgba(21,54,95,.07)" stroke-width="24"/>${segs}</svg>
      <div class="donut-center"><div><b style="${String(centerValue).length > 6 ? "font-size:1.15rem" : ""}">${centerValue}</b><span>${centerLabel}</span></div></div></div>
    <div class="legend">${segments.map((s, i) => h`<div class="legend-item" data-seg="${id}:${i}"><span class="sw" style="background:${s.color}"></span><span class="lb" title="${s.label}">${s.label}</span><span class="vl">${fmtNum(s.value)}<small>${Math.round((s.value / total) * 100)}%</small></span></div>`)}</div></div>`;
}
function bindChartHover(root = document) {
  $$("[data-chart]", root).forEach((chart) => {
    chart.addEventListener("mouseover", (e) => { const t = e.target.closest("[data-seg]"); if (!t) return; $$(`[data-seg="${t.dataset.seg}"]`, chart).forEach((x) => x.classList.add("hl")); });
    chart.addEventListener("mouseout", (e) => { const t = e.target.closest("[data-seg]"); if (!t) return; $$(`[data-seg="${t.dataset.seg}"]`, chart).forEach((x) => x.classList.remove("hl")); });
  });
}
/* Grouped/stacked bar chart */
function barChart(labels, series, { height = 240, money = false } = {}) {
  const W = 640, H = height, padL = 54, padB = 30, padT = 12;
  const totals = labels.map((_, i) => sum(series, (s) => s.values[i]));
  const max = Math.max(1, ...totals); const niceMax = Math.ceil(max / Math.pow(10, Math.floor(Math.log10(max)))) * Math.pow(10, Math.floor(Math.log10(max)));
  const bw = (W - padL - 10) / labels.length; const barW = Math.min(38, bw * 0.6);
  let g = "";
  for (let t = 0; t <= 4; t++) { const y = padT + (H - padT - padB) * (1 - t / 4); const v = (niceMax * t) / 4; g += `<line x1="${padL}" x2="${W}" y1="${y}" y2="${y}" stroke="rgba(21,54,95,.08)"/><text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="#5B6B82">${esc(money ? (v >= 1000 ? "₹" + Math.round(v / 1000) + "k" : "₹" + v) : fmtNum(v))}</text>`; }
  labels.forEach((lb, i) => {
    let yAcc = H - padB; const x = padL + i * bw + (bw - barW) / 2;
    series.forEach((s) => {
      const hgt = ((s.values[i] || 0) / niceMax) * (H - padT - padB);
      if (hgt > 0) g += `<rect class="bar" x="${x}" y="${yAcc - hgt}" width="${barW}" height="${hgt}" rx="5" fill="${s.color}"><title>${esc(lb)} · ${esc(s.name)}: ${esc(money ? fmtINR(s.values[i]) : fmtNum(s.values[i]))}</title></rect>`;
      yAcc -= hgt;
    });
    g += `<text x="${x + barW / 2}" y="${H - 10}" text-anchor="middle" font-size="11" fill="#5B6B82">${esc(lb)}</text>`;
  });
  return h`<div class="bar-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart">${raw(g)}</svg>
    <div class="chart-legend-inline">${series.map((s) => h`<span><i style="background:${s.color}"></i>${s.name}</span>`)}</div></div>`;
}

const Stats = {
  members() { return API.all("members"); },
  deptSegments() { const c = countBy(this.members(), (m) => m.department); return DEPARTMENTS.map((d, i) => ({ label: d, value: c[d] || 0, color: CHART_COLORS[i] })); },
  profSegments() { const c = countBy(this.members(), (m) => m.profession); return PROFESSIONS.map((p, i) => ({ label: p, value: c[p] || 0, color: CHART_COLORS[[1, 0, 4, 2][i]] })); },
  yearBands() {
    const ms = this.members(); if (!ms.length) return [];
    const minY = Math.min(...ms.map((m) => m.passing_year)), maxY = Math.max(...ms.map((m) => m.passing_year));
    const bands = []; for (let y = minY; y <= maxY; y += 3) bands.push([y, Math.min(y + 2, maxY)]);
    return bands.map((b, i) => ({ label: b[0] === b[1] ? String(b[0]) : `${b[0]} – ${b[1]}`, value: ms.filter((m) => m.passing_year >= b[0] && m.passing_year <= b[1]).length, color: CHART_COLORS[(i + 1) % CHART_COLORS.length] }));
  },
  catCounts() { const c = countBy(this.members().filter((m) => m.status === "Active"), (m) => m.category); return CATEGORIES.map((x) => c[x.name] || 0); }
};

const Home = {
  stopGallery() { if (S.galleryTimer) { clearInterval(S.galleryTimer); S.galleryTimer = null; } if (S.tickerTimer) { clearInterval(S.tickerTimer); S.tickerTimer = null; } },
  slides() { return API.all("homepage_gallery_feed").slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)); },
  feed() { return API.all("dashboard_live_feed").filter((f) => f.status !== "Draft").slice().sort((a, b) => b.created_at.localeCompare(a.created_at)); },
  gallery() {
    const slides = this.slides();
    if (!slides.length) return emptyState("No gallery photos yet.", "Content admins can upload photos from Admin → Dashboard Feed & Gallery.", "image");
    const i = Math.min(S.galleryIdx, slides.length - 1);
    return h`<div class="gallery-frame" id="galleryFrame" aria-roledescription="carousel" aria-label="FPAA photo gallery">
      ${slides.map((s, k) => h`<div class="gallery-slide ${k === i ? "active" : ""}" aria-hidden="${String(k !== i)}"><img src="${s.image}" alt="${s.caption}" loading="${k < 2 ? "eager" : "lazy"}"><div class="gallery-caption">${s.caption}</div></div>`)}
      <span class="gallery-counter" id="galleryCounter">${i + 1} / ${slides.length}</span>
      <button class="gallery-nav prev" data-action="gallery-prev" aria-label="Previous photo">${icon("chevL")}</button>
      <button class="gallery-nav next" data-action="gallery-next" aria-label="Next photo">${icon("chevR")}</button>
      <div class="gallery-dots">${slides.map((_, k) => h`<button class="${k === i ? "active" : ""}" data-action="gallery-go" data-i="${k}" aria-label="Show photo ${k + 1}"></button>`)}</div></div>`;
  },
  showSlide(idx) {
    const slides = $$("#galleryFrame .gallery-slide"); if (!slides.length) return;
    S.galleryIdx = (idx + slides.length) % slides.length;
    slides.forEach((s, k) => { s.classList.toggle("active", k === S.galleryIdx); s.setAttribute("aria-hidden", String(k !== S.galleryIdx)); });
    $$("#galleryFrame .gallery-dots button").forEach((d, k) => d.classList.toggle("active", k === S.galleryIdx));
    const c = $("#galleryCounter"); if (c) c.textContent = `${S.galleryIdx + 1} / ${slides.length}`;
  },
  startGallery() {
    this.stopGallery();
    S.galleryTimer = setInterval(() => { const f = $("#galleryFrame"); if (!f) return this.stopGallery(); if (!f.matches(":hover")) this.showSlide(S.galleryIdx + 1); }, 3000);
    const feed = this.feed(); let t = 0;
    S.tickerTimer = setInterval(() => { const el = $("#liveTicker"); if (!el || !feed.length) return; t = (t + 1) % feed.length; el.style.opacity = 0; setTimeout(() => { el.textContent = feed[t].title; el.style.opacity = 1; }, 250); }, 4200);
  },
  feedIcon(type) { return { event: ["calendar", ""], notice: ["megaphone", "gold"], announcement: ["sparkles", "violet"], gallery: ["image", "teal"], achievement: ["trophy", "gold"], job: ["briefcase", ""] }[type] || ["bell", ""]; },
  feedList(limit = 8) {
    const f = this.feed().slice(0, limit);
    if (!f.length) return emptyState("No data available.", "Live updates will appear here.", "bell");
    return h`<div class="feed-list">${f.map((x) => { const [ic, tone] = this.feedIcon(x.type); return h`<div class="feed-item"><span class="ico-tile ${tone}">${icon(ic, "ico ico-sm")}</span><div class="fi-body"><b>${x.title}</b><p>${x.body}</p><div class="fi-meta"><span class="chip slate">${x.type}</span><span>${relTime(x.created_at)}</span></div></div></div>`; })}</div>`;
  }
};

Views.home = () => {
  const ms = Stats.members(); const active = ms.filter((m) => m.status === "Active").length;
  const years = uniq(ms.map((m) => m.passing_year)).sort();
  const prof = Stats.profSegments().slice().sort((a, b) => b.value - a.value)[0] || { label: "—", value: 0 };
  const cats = Stats.catCounts();
  const upcoming = API.all("events").filter((e) => e.date >= isoDay(new Date()) && e.status !== "Draft").sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const notices = API.all("notices").filter((n) => n.status === "Published").sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const feed = Home.feed();
  const stat = (ic, tone, label, value, sub, d) => h`<div class="glass stat-card card-lift reveal" style="animation-delay:${d}ms"><span class="ico-tile ${tone}">${icon(ic)}</span><div class="sc-body"><div class="sc-label">${label}</div><div class="sc-value">${value}</div><div class="sc-sub">${sub}</div></div></div>`;
  return h`
  <section class="home-hero reveal" aria-label="FPAA Connect 2.0">
    <div class="hero-lines"></div><div class="float-ring fr-1"></div><div class="float-ring fr-2"></div><span class="photo-credit">${icon("pin", "ico ico-sm")}Falakata Polytechnic campus</span>
    <div class="hero-main">
      <div class="hero-emblem" id="heroEmblem"><img src="${CONFIG.LOGO_URL}" alt="FPAA emblem — Falakata Polytechnic Alumni Association, ESTD 2024"></div>
      <div class="hero-copy"><span class="eyebrow">${icon("sparkles", "ico ico-sm")} Falakata Polytechnic Alumni Association · ESTD 2024</span>
        <h1>FPAA <span class="nowrap">CONNECT <span class="ver-badge">2.0</span></span></h1>
        <p class="tagline">“Connecting the Past. Empowering the Present. Building the Future.”</p>
        <div class="btn-group">
          <a class="btn btn-gold" href="#membership">${icon("idcard")}Apply for Membership</a>
          <button class="btn btn-ghost" data-action="verify-open">${icon("shield")}Verify Membership</button>
          <a class="btn btn-ghost" href="#directory">${icon("users")}Alumni Directory</a>
          <a class="btn btn-ghost" href="#donations">${icon("heart")}Donate</a>
        </div></div></div>
    <div class="hero-stats">
      <div class="hero-stat"><b data-count="${ms.length}">${fmtNum(ms.length)}</b><span>Total Alumni</span></div>
      <div class="hero-stat"><b data-count="${active}">${fmtNum(active)}</b><span>Active Members</span></div>
      <div class="hero-stat"><b>${DEPARTMENTS.length}</b><span>Departments</span></div>
      <div class="hero-stat"><b>${years.length}</b><span>Pass-out Years</span></div>
    </div>
  </section>

  <div class="stat-grid">
    ${stat("users", "", "Total Alumni", fmtNum(ms.length), "Registered in FPAA Connect 2.0", 0)}
    ${stat("shield", "teal", "Active Members", fmtNum(active), `${fmtNum(ms.length - active)} inactive`, 60)}
    ${stat("building", "violet", "Departments", DEPARTMENTS.length, "Electronics · Civil · Mechanical · Electrical · FPT", 120)}
    ${stat("calendar", "", "Pass-out Years", years.length, years.length ? `${years[0]} – ${years[years.length - 1]}` : "—", 180)}
    ${stat("briefcase", "gold", "Current Profession", PROFESSIONS.length + " sectors", `Top: ${prof.label} · ${prof.value}`, 240)}
    ${stat("idcard", "violet", "Membership", `${cats[0]} · ${cats[1]} · ${cats[2]}`, "Alumni · Social Media · Committee", 300)}
  </div>

  <div class="home-split">
    <section class="glass card reveal" aria-label="Live gallery">
      <div class="live-bar"><span class="lb-tag"><span class="live-dot"></span>LIVE UPDATE</span><span class="lb-text" id="liveTicker" style="transition:opacity .25s">FPAA Connect 2.0 Community Updates${feed[0] ? " — " + feed[0].title : ""}</span></div>
      ${Home.gallery()}
    </section>
    <section class="glass card reveal" aria-label="Live feed">
      <div class="card-head"><div><span class="eyebrow"><span class="live-dot"></span> Live Update</span><h3>Association Feed</h3><p class="sub">Updates, events, notices and announcements</p></div></div>
      ${Home.feedList(8)}
    </section>
  </div>

  <section class="section">
    <div class="section-head reveal"><div><span class="eyebrow">${icon("pie", "ico ico-sm")} Alumni analytics</span><h2>FPAA at a glance</h2><p>Distribution of registered alumni by passing year, department and current profession.</p></div>
      <button class="btn btn-ghost" data-action="ppt-export">${icon("ppt")}Download Full FPAA Dashboard PPT</button></div>
    <div class="grid grid-3">
      <div class="glass card chart-card reveal"><div class="card-head"><div><span class="eyebrow">Chart 1</span><h3>Alumni by Passing Year</h3></div></div>${donutChart("yr", Stats.yearBands(), fmtNum(ms.length), "Alumni")}</div>
      <div class="glass card chart-card reveal"><div class="card-head"><div><span class="eyebrow">Chart 2</span><h3>Alumni by Department</h3></div></div>${donutChart("dept", Stats.deptSegments(), DEPARTMENTS.length, "Depts")}</div>
      <div class="glass card chart-card reveal"><div class="card-head"><div><span class="eyebrow">Chart 3</span><h3>Alumni by Current Profession</h3></div></div>${donutChart("prof", Stats.profSegments(), PROFESSIONS.length, "Sectors")}</div>
    </div>
  </section>

  <section class="section grid grid-2">
    <div class="glass card reveal"><div class="card-head"><div><span class="eyebrow">${icon("calendar", "ico ico-sm")} Events</span><h3>Upcoming events</h3></div><a class="btn btn-soft btn-sm" href="#events">View all</a></div>
      ${upcoming.length ? h`<div class="quick-list">${upcoming.map((e) => { const d = toDate(e.date); return h`<button class="quick-item" data-action="event-view" data-id="${e.id}"><span class="date-badge"><b>${d.getDate()}</b><span>${MONTHS[d.getMonth()]}</span></span><span class="qi-body"><b>${e.title}</b><span>${fmtTime24(e.time)} · ${e.venue}</span></span>${icon("chevR")}</button>`; })}</div>` : emptyState("No upcoming events.", "", "calendar")}</div>
    <div class="glass card reveal"><div class="card-head"><div><span class="eyebrow">${icon("megaphone", "ico ico-sm")} Notices</span><h3>Latest notices</h3></div><a class="btn btn-soft btn-sm" href="#notices">View all</a></div>
      ${notices.length ? h`<div class="quick-list">${notices.map((n) => { const d = toDate(n.date); return h`<a class="quick-item" href="#notices" style="text-decoration:none"><span class="date-badge" style="${n.priority === "Urgent" ? "background:linear-gradient(135deg,#EF4444,#DB2777)" : n.priority === "Important" ? "background:var(--grad-gold);color:#3A2A05" : ""}"><b>${d.getDate()}</b><span>${MONTHS[d.getMonth()]}</span></span><span class="qi-body"><b>${n.title}</b><span>${n.notice_no} · ${n.category}</span></span>${icon("chevR")}</a>`; })}</div>` : emptyState("No data available.", "", "megaphone")}</div>
  </section>`;
};
Mounts.home = () => {
  Home.startGallery(); bindChartHover($("#view"));
  const em = $("#heroEmblem");
  if (em && window.matchMedia("(pointer:fine)").matches) {
    const img = em.querySelector("img");
    em.addEventListener("mousemove", (e) => { const r = em.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; img.style.animation = "none"; img.style.transform = `rotateY(${x * 30}deg) rotateX(${-y * 30}deg) scale(1.05)`; });
    em.addEventListener("mouseleave", () => { img.style.transform = ""; img.style.animation = ""; });
  }
};
Actions["gallery-prev"] = () => Home.showSlide(S.galleryIdx - 1);
Actions["gallery-next"] = () => Home.showSlide(S.galleryIdx + 1);
Actions["gallery-go"] = (el) => Home.showSlide(Number(el.dataset.i));

/* ---- Download Full FPAA Dashboard PPT (PptxGenJS, loaded on demand) ---- */
Actions["ppt-export"] = (el) => busy(el, "Preparing PPT…", async () => {
  try { await loadScript("https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js"); }
  catch (e) { toast("error", "Could not build the PPT", "The presentation library needs an internet connection. Please try again when online."); return; }
  const pptx = new window.PptxGenJS(); pptx.layout = "LAYOUT_WIDE"; pptx.title = "FPAA Connect 2.0 Dashboard";
  const NAVY = "15365F", BLUE = "3B82F6", GOLD = "D7A52B";
  const logo = await fetch(absoluteUrl(CONFIG.LOGO_URL)).then((r) => r.blob()).then((bl) => new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(null); fr.readAsDataURL(bl); })).catch(() => null);
  const ms = Stats.members(); const active = ms.filter((m) => m.status === "Active").length;
  const s1 = pptx.addSlide(); s1.background = { color: NAVY };
  if (logo) s1.addImage({ data: logo, x: 0.6, y: 1.3, w: 2.6, h: 2.6 });
  s1.addText("FPAA CONNECT 2.0", { x: 3.6, y: 1.5, w: 9, h: 0.9, fontSize: 44, bold: true, color: "FFFFFF", fontFace: "Arial" });
  s1.addText("Falakata Polytechnic Alumni Association · ESTD 2024", { x: 3.6, y: 2.4, w: 9, h: 0.5, fontSize: 18, color: GOLD, bold: true });
  s1.addText("Connecting the Past. Empowering the Present. Building the Future.", { x: 3.6, y: 3.0, w: 9, h: 0.5, fontSize: 16, color: "DCE8FF", italic: true });
  s1.addText("Dashboard report · " + fmtDate(new Date()), { x: 3.6, y: 4.2, w: 9, h: 0.4, fontSize: 12, color: "BFD6FF" });
  const s2 = pptx.addSlide(); s2.addText("Key statistics", { x: 0.5, y: 0.3, w: 12, h: 0.7, fontSize: 28, bold: true, color: NAVY });
  const kp = [["Total Alumni", ms.length], ["Active Members", active], ["Departments", DEPARTMENTS.length], ["Pass-out Years", uniq(ms.map((m) => m.passing_year)).length], ["Verified Donations", fmtINR(sum(API.all("donations").filter((d) => d.status === "Verified"), (d) => d.amount))], ["Upcoming Events", API.all("events").filter((e) => e.date >= isoDay(new Date())).length]];
  kp.forEach((k, i) => { const x = 0.5 + (i % 3) * 4.2, y = 1.3 + Math.floor(i / 3) * 2.2; s2.addShape(pptx.ShapeType.roundRect, { x, y, w: 3.9, h: 1.9, fill: { color: i % 2 ? "EEF4FF" : "E0E7FF" }, line: { color: "C7D2FE" }, rectRadius: 0.15 }); s2.addText(String(k[1]), { x, y: y + 0.25, w: 3.9, h: 0.9, fontSize: 34, bold: true, color: NAVY, align: "center" }); s2.addText(k[0], { x, y: y + 1.15, w: 3.9, h: 0.5, fontSize: 14, color: "5B6B82", align: "center" }); });
  const chartSlide = (title, segs) => { const s = pptx.addSlide(); s.addText(title, { x: 0.5, y: 0.3, w: 12, h: 0.7, fontSize: 28, bold: true, color: NAVY }); s.addChart(pptx.ChartType.doughnut, [{ name: title, labels: segs.map((x) => x.label), values: segs.map((x) => x.value) }], { x: 0.6, y: 1.2, w: 6.2, h: 5.6, holeSize: 58, showLegend: false, dataLabelColor: "FFFFFF", showValue: false, showPercent: false, chartColors: segs.map((x) => x.color.replace("#", "")) }); s.addTable([[{ text: "Category", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } }, { text: "Alumni", options: { bold: true, color: "FFFFFF", fill: { color: NAVY } } }]].concat(segs.map((x) => [x.label, String(x.value)])), { x: 7.3, y: 1.5, w: 5.3, fontSize: 14, border: { type: "solid", color: "DCE3F0", pt: 1 }, fill: { color: "F7FAFF" } }); };
  chartSlide("Alumni by Passing Year", Stats.yearBands()); chartSlide("Alumni by Department", Stats.deptSegments()); chartSlide("Alumni by Current Profession", Stats.profSegments());
  const s6 = pptx.addSlide(); s6.addText("Membership & finance", { x: 0.5, y: 0.3, w: 12, h: 0.7, fontSize: 28, bold: true, color: NAVY });
  const cats = Stats.catCounts(); const fin = Reports.summary({});
  s6.addTable([[{ text: "Membership category", options: { bold: true, color: "FFFFFF", fill: { color: BLUE } } }, { text: "Fee", options: { bold: true, color: "FFFFFF", fill: { color: BLUE } } }, { text: "Active members", options: { bold: true, color: "FFFFFF", fill: { color: BLUE } } }]].concat(CATEGORIES.map((c, i) => [c.name, fmtINR(c.fee) + (c.id === "social" ? "/year" : c.id === "mgmt" ? " one time" : ""), String(cats[i])])), { x: 0.5, y: 1.3, w: 12.3, fontSize: 14, border: { type: "solid", color: "DCE3F0", pt: 1 } });
  s6.addTable([["Membership revenue (verified)", fmtINR(fin.membership)], ["Donation revenue (verified)", fmtINR(fin.donation)], ["Total verified", fmtINR(fin.total)], ["Pending verification", fmtINR(fin.pending)], ["Rejected", fmtINR(fin.rejected)]], { x: 0.5, y: 3.6, w: 7, fontSize: 14, border: { type: "solid", color: "DCE3F0", pt: 1 }, fill: { color: "F7FAFF" } });
  await pptx.writeFile({ fileName: `FPAA-Connect-Dashboard-${isoDay(new Date())}.pptx` });
  toast("success", "PPT downloaded", "FPAA dashboard presentation saved.");
});
/* =====================================================================
   MY FPAA — member area, profile, linking, certificate & card printing
   ===================================================================== */
const MyFPAA = {
  myApps() { if (!S.profile) return []; const em = S.profile.email.toLowerCase(); return API.all("membership_applications").filter((a) => a.user_id === S.profile.id || (a.email || "").toLowerCase() === em).sort((a, b) => b.submitted_at.localeCompare(a.submitted_at)); },
  myDonations() { if (!S.profile) return []; const em = S.profile.email.toLowerCase(); return API.all("donations").filter((d) => d.user_id === S.profile.id || (d.email || "").toLowerCase() === em).sort((a, b) => b.donated_at.localeCompare(a.donated_at)); },
  myTickets() { if (!S.profile) return []; return API.all("support_requests").filter((t) => t.user_id === S.profile.id).sort((a, b) => b.updated_at.localeCompare(a.updated_at)); },
  infoCard(ic, tone, eyebrow, title, rows) {
    return h`<article class="glass mf-info card-lift reveal"><div class="mf-info-head"><span class="ico-tile ${tone}">${icon(ic)}</span><div class="ttl"><span class="eyebrow">${eyebrow}</span><h3>${title}</h3></div></div>
      <div class="info-rows">${rows.map((r) => h`<div class="info-row"><span class="k">${r[0]}</span><span class="v">${r[1] == null || r[1] === "" ? "—" : r[1]}</span></div>`)}</div></article>`;
  },
  accessBanner() {
    const a = S.ui.accessMsg; if (!a) return "";
    S.ui.accessMsg = null;
    const msg = a.reason === "signin" ? `Please sign in with your FPAA account to open ${a.module}.`
      : a.reason === "role" ? `${a.module} is available only to committee and administrator roles.`
      : `${a.module} is available to members with an active FPAA membership. Link your approved membership below, or apply for membership.`;
    return h`<div class="reveal" style="margin-bottom:18px">${alertBox("warn", "Members-only area", msg)}</div>`;
  },
  gate() {
    return h`<div class="glass gate reveal"><img src="${CONFIG.LOGO_URL}" alt="FPAA emblem"><span class="eyebrow">Members area</span><h2>Sign in to My FPAA</h2>
      <p>View your membership, print your certificate and membership card, track applications and donations, and access the alumni directory, jobs, events and more.</p>
      <div class="btn-group" style="justify-content:center"><a class="btn btn-primary" href="login.html?next=my-fpaa">${icon("login")}Sign in</a><a class="btn btn-gold" href="login.html?mode=signup&next=my-fpaa">${icon("userPlus")}Create account</a><a class="btn btn-ghost" href="#membership">${icon("idcard")}Apply for membership</a><button class="btn btn-ghost" data-action="verify-open">${icon("shield")}Verify a membership</button></div></div>`;
  },
  hero() {
    const m = S.member, p = S.profile; const active = hasActiveMembership();
    return h`<section class="mf-hero reveal" aria-label="Profile summary">
      <div class="mf-avatar">${m && m.photo ? h`<img class="av" src="${m.photo}" alt="${p.full_name}">` : h`<span class="av" style="display:grid;place-items:center;background:${avatarColor(p.full_name)};color:#fff;font:800 2.6rem var(--font-head)">${initials(p.full_name)}</span>`}
        ${active ? h`<span class="verified" title="Verified member">${icon("check")}</span>` : ""}</div>
      <div class="mf-id"><span class="eyebrow">Signed-in individual</span><h2>${m ? m.full_name : p.full_name}</h2>
        <div class="meta">${m ? h`<span class="chip mono">${m.membership_no}</span><span class="chip violet">${m.category}</span>` : h`<span class="chip slate">No membership linked</span>`}<span class="chip slate">${icon("lock", "ico ico-sm")} Private profile</span>${isAdmin() ? h`<span class="chip gold">${ROLES[p.role]}</span>` : ""}</div>
        <div class="email">${icon("mail", "ico ico-sm")} ${p.email}</div></div>
      <div class="mf-status">
        <div class="box"><div class="lbl">Membership status</div><div class="val">${m ? statusPill(m.status) : statusPill("Not linked")}</div></div>
        <div class="box"><div class="lbl">Member since</div><div class="val">${m ? m.member_since : "—"}</div></div>
      </div></section>`;
  },
  linkCard() {
    return h`<section class="glass card reveal" aria-label="Link your membership"><div class="card-head"><div class="row" style="gap:14px;align-items:flex-start"><span class="ico-tile gold">${icon("link")}</span><div><span class="eyebrow">Link your membership</span><h3>Connect your approved membership record</h3>
      <p class="sub">If your FPAA membership was approved offline or before you created this account, connect it using your <b>Membership Number</b> and the <b>Registered Mobile Number</b> on the membership record. Once linked, your certificate, membership card and member services unlock.</p></div></div></div>
      <form data-submit="link-membership" novalidate><div class="form-grid">
        ${field({ label: "Membership Number", name: "membership_no", required: true, placeholder: "FPAA-M-2026-000001", hint: "Format: FPAA-M-YYYY-NNNNNN", attrs: 'autocomplete="off" style="text-transform:uppercase"' })}
        ${field({ label: "Registered Mobile", name: "mobile", type: "tel", required: true, placeholder: "10-digit mobile number", attrs: 'inputmode="numeric" maxlength="16"' })}
      </div>
      <div class="form-actions" style="justify-content:space-between">${API.mode === "demo" ? h`<span class="small muted">Demo: try <b class="mono">FPAA-M-2024-000012</b> with <b class="mono">9123456712</b></span>` : h`<span></span>`}
        <div class="btn-group"><a class="btn btn-ghost" href="#membership">${icon("idcard")}Apply instead</a><button class="btn btn-primary" type="submit">${icon("link")}Link Membership</button></div></div>
      <div class="form-msg" id="linkMsg"></div></form></section>`;
  },
  quickAccess() {
    const q = [["directory", "users", "", "Alumni Directory", "Find and connect with batchmates across departments."], ["careers", "briefcase", "gold", "Career & Jobs", "Verified openings posted by alumni and partners."], ["events", "calendar", "violet", "Events", "Meets, seminars and workshops — register online."],
      ["donations", "heart", "", "Donations", "Support scholarships and campus development."], ["achievements", "trophy", "gold", "Achievements", "Celebrate alumni milestones and awards."], ["chat", "chat", "teal", "Community Chat", "Message the FPAA community in real time."],
      ["memories", "image", "violet", "Memories", "Share and relive campus moments."], ["scheme", "school", "", "Falakata Alumni Scheme", "Scholarships and skill development programmes."], ["notices", "megaphone", "gold", "Notices", "Official circulars and announcements."]];
    return h`<section class="section reveal"><div class="section-head"><div><span class="eyebrow">${icon("sparkles", "ico ico-sm")} Members only</span><h2>FPAA Member Quick Access</h2></div></div>
      <div class="mf-quick">${q.map((x) => x[0] === "chat" ? h`<button class="mf-qcard" data-action="chat-open">${h`<span class="ico-tile ${x[2]}">${icon(x[1])}</span>`}<span><b>${x[3]}</b><span>${x[4]}</span></span></button>`
        : h`<a class="mf-qcard" href="#${x[0]}" style="text-decoration:none"><span class="ico-tile ${x[2]}">${icon(x[1])}</span><span><b>${x[3]}</b><span>${x[4]}</span></span></a>`)}</div></section>`;
  },
  infoGrid() {
    const m = S.member || {}, p = S.profile;
    return h`<section class="section"><div class="section-head reveal"><div><span class="eyebrow">${icon("idcard", "ico ico-sm")} Your record</span><h2>Membership profile</h2></div></div>
      <div class="mf-info-grid">
        ${this.infoCard("user", "", "Section A", "Personal Information", [["Full Name", m.full_name || p.full_name], ["Email", p.email], ["Mobile", m.mobile ? maskMobileTail(m.mobile) : "—"], ["Gender", m.gender]])}
        ${this.infoCard("idcard", "violet", "Section B", "Membership Information", [["Membership Number", m.membership_no], ["Category", m.category], ["Status", m.status ? statusPill(m.status) : "—"], ["Member Since", m.member_since], ["Valid Till", m.valid_till]])}
        ${this.infoCard("school", "teal", "Section C", "Academic Details", [["Institution", "Falakata Polytechnic"], ["Department", m.department], ["Admission Year", m.admission_year], ["Passing Year", m.passing_year]])}
        ${this.infoCard("briefcase", "gold", "Section D", "Professional Information", [["Current Profession", m.profession], ["Company / Organization", m.company]])}
        ${this.infoCard("pin", "", "Section E", "Address Information", [["City", m.city], ["State", m.state], ["PIN Code", m.pin], ["Address", m.address]])}
        ${this.infoCard("key", "violet", "Section F", "Account Information", [["Account Status", S.member ? statusPill("Linked") : statusPill("Not linked")], ["Role", ROLES[p.role]], ["Authentication", "Email / mobile + password"], ["Recovery key", (Auth.recoveryKey(p.full_name, Auth.profileMobile(p)).slice(0, 4) || "—") + "••••"], ["Last Login", p.last_login ? fmtDateTime(p.last_login) : "—"]])}
      </div></section>`;
  },
  profileForm() {
    const m = S.member; const dis = !m;
    return h`<section class="glass card reveal" aria-label="Profile and professional information"><div class="card-head"><div><span class="eyebrow">${icon("edit", "ico ico-sm")} Edit profile</span><h3>Profile & Professional Information</h3><p class="sub">Name, email and department are identity fields and can only be corrected by the Registration Committee.</p></div></div>
      ${dis ? h`<div style="margin-bottom:14px">${alertBox("info", "Link your membership to edit your profile.", "Profile details are stored on your membership record.")}</div>` : ""}
      <form data-submit="profile-save" novalidate><div class="form-grid">
        ${field({ label: "Full Name", name: "full_name", value: m ? m.full_name : S.profile.full_name, disabled: true })}
        ${field({ label: "Email", name: "email", value: S.profile.email, disabled: true })}
        ${field({ label: "Mobile", name: "mobile", type: "tel", value: m ? m.mobile : "", required: true, disabled: dis, attrs: 'inputmode="numeric" maxlength="16"' })}
        ${field({ label: "Department", name: "department", value: m ? m.department : "", disabled: true })}
        ${field({ label: "Current Profession", name: "profession", value: m ? m.profession : "", options: PROFESSIONS, required: true, disabled: dis, placeholder: "Select profession" })}
        ${field({ label: "Company / Organization", name: "company", value: m ? m.company : "", disabled: dis, placeholder: "Where do you work or study?", attrs: 'maxlength="120"' })}
        ${field({ label: "City", name: "city", value: m ? m.city : "", required: true, disabled: dis, attrs: 'maxlength="60"' })}
        ${field({ label: "State", name: "state", value: m ? m.state : "", required: true, disabled: dis, attrs: 'maxlength="60"' })}
        ${field({ label: "PIN Code", name: "pin", value: m ? m.pin : "", required: true, disabled: dis, attrs: 'inputmode="numeric" maxlength="6"' })}
        ${field({ label: "Address", name: "address", value: m ? m.address : "", disabled: dis, attrs: 'maxlength="160"' })}
        <div class="field span-2"><span class="field-label">Profile Photo</span><div class="file-drop">
          <img class="preview-thumb" id="photoPreview" src="${m && m.photo ? m.photo : art("portrait", 3)}" alt="Profile photo preview">
          <div class="grow"><input type="file" name="photo" accept="image/jpeg,image/png,image/webp" data-preview="#photoPreview" ${raw(dis ? "disabled" : "")} aria-label="Choose profile photo"><div class="hint small muted">JPG, PNG or WEBP · large photos are resized automatically · preview shown before saving</div></div></div><span class="err"></span></div>
      </div>
      <div class="form-actions"><button class="btn btn-primary" type="submit" ${raw(dis ? "disabled" : "")}>${icon("check")}SAVE PROFILE CHANGES</button></div>
      <div class="form-msg" id="profileMsg"></div></form></section>`;
  },
  membershipPanel() {
    const m = S.member; const active = hasActiveMembership();
    return h`<section class="glass card reveal" aria-label="Membership details"><div class="card-head"><div><span class="eyebrow">${icon("idcard", "ico ico-sm")} Membership</span><h3>Membership Details</h3><p class="sub">Your digital membership card and printable documents.</p></div>${m ? statusPill(m.status) : ""}</div>
      ${m ? h`<div class="member-mini-card" aria-label="Membership card preview">
          <div class="mc-top"><img src="${CONFIG.LOGO_URL}" alt=""><div><b>FALAKATA POLYTECHNIC<br>ALUMNI ASSOCIATION</b><span>FPAA CONNECT 2.0 · MEMBER</span></div></div>
          <div><div class="chipline"></div></div>
          <div><div class="mc-name">${m.full_name}</div><div class="mc-no">${m.membership_no}</div></div>
          <div class="mc-foot"><span>Category<b>${m.category.replace(" Membership", "")}</b></span><span>Dept.<b>${m.department === "Food Processing Technology" ? "Food Proc. Tech." : m.department}</b></span><span>Valid till<b>${m.valid_till}</b></span></div></div>
        <dl class="kv" style="margin-top:18px"><dt>Category</dt><dd>${m.category}</dd><dt>Fee</dt><dd>${fmtINR((CAT_BY_NAME[m.category] || {}).fee)} ${m.category === "Social Media Handling" ? "/ year (renewal)" : m.category.startsWith("Management") ? "one time" : ""}</dd><dt>Member since</dt><dd>${m.member_since}</dd><dt>Valid till</dt><dd>${m.valid_till}</dd><dt>Verification link</dt><dd><button class="link-btn" data-action="copy-verify" data-no="${m.membership_no}">${icon("copy", "ico ico-sm")} Copy public verification link</button></dd></dl>`
        : emptyState("No membership linked.", "Link your approved membership or apply for a new one to receive your certificate and membership card.", "idcard")}
      ${m && !active ? h`<div style="margin-top:14px">${alertBox("warn", "Membership not active", m.status === "Pending Payment" ? "Your membership will activate once the Finance Committee verifies your payment." : "Renew your membership to re-activate your certificate, card and member services.")}</div>` : ""}
      <div class="btn-group" style="margin-top:18px">
        <button class="btn btn-primary" data-action="print-certificate" ${raw(active ? "" : "disabled")} title="${active ? "Print membership certificate" : "Requires an active membership"}">${icon("certificate")}PRINT CERTIFICATE</button>
        <button class="btn btn-gold" data-action="print-card" ${raw(active ? "" : "disabled")} title="${active ? "Print membership card" : "Requires an active membership"}">${icon("printer")}PRINT MEMBERSHIP CARD</button>
      </div></section>`;
  },
  appsSection() {
    const apps = this.myApps();
    return h`<section class="glass card reveal"><div class="card-head"><div><span class="eyebrow">${icon("file", "ico ico-sm")} Applications</span><h3>My Membership Applications</h3></div><a class="btn btn-soft btn-sm" href="#membership">${icon("plus", "ico ico-sm")}New application</a></div>
      ${apps.length ? h`<div class="table-wrap"><table class="data-table"><thead><tr><th>Application No.</th><th>Category</th><th>Submitted</th><th>Status</th><th>Payment</th><th>Verification</th><th></th></tr></thead><tbody>
        ${apps.map((a) => h`<tr><td class="t-strong mono">${a.application_no}</td><td>${a.category}</td><td class="nowrap">${fmtDate(a.submitted_at)}</td><td>${statusPill(a.status)}</td><td>${statusPill(a.payment_status)}</td><td class="small">${a.status === "Rejected" ? a.notes || "Rejected by committee" : a.reviewed_at ? "Reviewed " + fmtDate(a.reviewed_at) : "Awaiting review"}</td><td><button class="btn btn-ghost btn-xs" data-action="app-view" data-id="${a.id}">${icon("eye", "ico ico-sm")}View</button></td></tr>`)}
      </tbody></table></div>` : emptyState("No membership applications found.", "Applications you submit will appear here with their review status.", "file")}</section>`;
  },
  donationsSection() {
    const d = this.myDonations();
    return h`<section class="glass card reveal"><div class="card-head"><div><span class="eyebrow">${icon("heart", "ico ico-sm")} Contributions</span><h3>My Donations</h3></div><a class="btn btn-soft btn-sm" href="#donations">${icon("plus", "ico ico-sm")}Donate</a></div>
      ${d.length ? h`<div class="table-wrap"><table class="data-table"><thead><tr><th>Donation No.</th><th>Purpose</th><th>Amount</th><th>Status</th><th>Date</th><th></th></tr></thead><tbody>
        ${d.map((x) => h`<tr><td class="t-strong mono">${x.donation_no}</td><td>${x.purpose}</td><td class="t-strong">${fmtINR(x.amount)}</td><td>${statusPill(x.status)}</td><td class="nowrap">${fmtDate(x.donated_at)}</td><td><button class="btn btn-ghost btn-xs" data-action="donation-view" data-id="${x.id}">${icon("eye", "ico ico-sm")}View</button></td></tr>`)}
      </tbody></table></div>` : emptyState("No donations found.", "Your contributions to FPAA will appear here once submitted.", "heart")}</section>`;
  },
  supportSection() {
    const t = this.myTickets();
    return h`<section class="glass card reveal"><div class="card-head"><div><span class="eyebrow">${icon("support", "ico ico-sm")} Member service</span><h3>My Support Requests</h3></div><button class="btn btn-primary btn-sm" data-action="support-new">${icon("plus", "ico ico-sm")}NEW SUPPORT REQUEST</button></div>
      ${t.length ? h`<div class="table-wrap"><table class="data-table"><thead><tr><th>Ticket No.</th><th>Subject</th><th>Category</th><th>Status</th><th>Created</th><th>Last reply</th><th></th></tr></thead><tbody>
        ${t.map((x) => { const last = Support.replies(x.id).slice(-1)[0]; return h`<tr><td class="t-strong mono">${x.ticket_no}</td><td class="break">${x.subject}</td><td>${x.category}</td><td>${statusPill(x.status)}</td><td class="nowrap">${fmtDate(x.created_at)}</td><td class="small">${last ? h`${last.author_role === "admin" ? "FPAA Support" : "You"} · ${relTime(last.created_at)}` : "—"}</td><td><button class="btn btn-ghost btn-xs" data-action="ticket-view" data-id="${x.id}">${icon("chat", "ico ico-sm")}Open</button></td></tr>`; })}
      </tbody></table></div>` : emptyState("No support requests yet.", "Raise a request for membership, payment, profile or technical help.", "support")}</section>`;
  }
};

Views["my-fpaa"] = () => {
  const head = pageHead({ eyebrow: "Member area", title: "MY FPAA", sub: "View your signed-in account details, membership status, applications, contributions and support requests in one place." });
  const banner = MyFPAA.accessBanner();
  if (!isSignedIn()) return h`${head}${banner}${MyFPAA.gate()}`;
  const p = S.profile;
  return h`${head}${banner}
    <div class="glass mf-signed reveal" style="margin-bottom:18px">${avatar(p.full_name, S.member && S.member.photo)}<div class="who"><span class="eyebrow">Signed in as</span><b>${S.member ? S.member.full_name : p.full_name}</b><span>${p.email}</span></div>
      <div class="btn-group">${isAdmin() ? h`<a class="btn btn-soft btn-sm" href="#admin">${icon("shield", "ico ico-sm")}Admin Dashboard</a>` : ""}<button class="btn btn-ghost btn-sm" data-action="myfpaa-refresh">${icon("refresh", "ico ico-sm")}Refresh</button><button class="btn btn-ghost btn-sm" data-action="logout">${icon("logout", "ico ico-sm")}Logout</button></div></div>
    ${MyFPAA.hero()}
    ${!S.member ? h`<div class="section">${MyFPAA.linkCard()}</div>` : ""}
    ${hasActiveMembership() ? MyFPAA.quickAccess() : ""}
    ${MyFPAA.infoGrid()}
    <div class="section mf-panels">${MyFPAA.profileForm()}${MyFPAA.membershipPanel()}</div>
    <div class="section stack">${MyFPAA.appsSection()}${MyFPAA.donationsSection()}${MyFPAA.supportSection()}</div>`;
};
Mounts["my-fpaa"] = () => bindFilePreviews($("#view"));

function bindFilePreviews(root) {
  $$("input[type=file][data-preview]", root).forEach((inp) => inp.addEventListener("change", async () => {
    const f = inp.files[0]; const box = inp.closest(".field"); const err = box && box.querySelector(".err"); if (err) err.textContent = "";
    if (!f) return;
    try { const url = await readImageFile(f, { maxW: 600 }); const img = $(inp.dataset.preview); if (img) img.src = url; inp.dataset.processed = "1"; inp._dataUrl = url; }
    catch (e) { if (err) err.textContent = e.message; inp.value = ""; inp._dataUrl = null; }
  }));
}

Actions["myfpaa-refresh"] = (el) => busy(el, "Refreshing…", async () => {
  try {
    if (API.mode === "supabase") await API.loadAll(); else { await API.latency(400); const saved = API.readLocal(); if (saved) S.db = saved; }
    Auth.bindMember(); Nav.all(); Router.render(); toast("success", "My FPAA refreshed", "Your latest membership details are shown.");
  } catch (e) { toast("error", "Could not load My FPAA.", "Please try again."); }
});
Actions["link-membership"] = async (form) => {
  const msg = $("#linkMsg"); formMsg(msg, null);
  const v = validate(form, {
    membership_no: [req("Membership number is required."), [(x) => RX.membership.test(normMembership(x)), "Use the format FPAA-M-YYYY-NNNNNN."]],
    mobile: [req("Registered mobile is required."), vMobile]
  });
  if (!v) return;
  const btn = form.querySelector('[type="submit"]');
  await busy(btn, "Linking…", async () => {
    await API.latency(500);
    const no = normMembership(v.membership_no), mob = normMobile(v.mobile);
    const m = API.find("members", (x) => x.membership_no === no);
    const fail = (detail) => formMsg(msg, "error", "Membership could not be linked.", detail);
    if (!m) return fail("Please check your membership number and registered mobile.");
    if (m.user_id && m.user_id !== S.profile.id) return fail("This membership is already linked to another FPAA Connect 2.0 account. Raise a support request if you believe this is a mistake.");
    if (m.mobile !== mob) return fail("Please check your membership number and registered mobile.");
    if (S.member) return fail("Your account is already linked to " + S.member.membership_no + ".");
    try {
      await API.update("members", m.id, { user_id: S.profile.id });
      await API.update("profiles", S.profile.id, { member_id: m.id });
      Auth.bindMember(); audit("Linked membership", no);
      notify(S.profile.id, "membership", "Membership linked", `${no} is now connected to your account.`, "#my-fpaa");
      toast("success", "Membership linked", `${no} is now connected to your account.`);
      Nav.all(); Router.render();
    } catch (e) { fail(e.message); }
  });
};
Actions["profile-save"] = async (form) => {
  const msg = $("#profileMsg"); formMsg(msg, null);
  if (!S.member) return;
  const v = validate(form, { mobile: [req("Mobile is required."), vMobile], profession: [req("Select your current profession.")], city: [req("City is required.")], state: [req("State is required.")], pin: [req("PIN code is required."), vPin] });
  if (!v) { formMsg(msg, "error", "Could not update profile.", "Please check your information."); return; }
  const btn = form.querySelector('[type="submit"]');
  await busy(btn, "Saving…", async () => {
    try {
      const patch = { mobile: normMobile(v.mobile), profession: v.profession, company: v.company, city: v.city, state: v.state, pin: v.pin, address: v.address };
      const inp = form.querySelector('input[name="photo"]');
      if (inp && inp.files && inp.files[0]) patch.photo = inp._dataUrl || (await readImageFile(inp.files[0], { maxW: 600 }));
      await API.update("members", S.member.id, patch);
      if (S.profile.mobile !== patch.mobile) await API.update("profiles", S.profile.id, { mobile: patch.mobile });
      audit("Updated own profile", S.member.membership_no);
      formMsg(msg, "success", "Profile updated successfully.", "Your changes are saved to your membership record.");
      toast("success", "Profile updated successfully.");
      Nav.renderTopbar();
      setTimeout(() => { if (S.route.name === "my-fpaa") Router.render(); }, 900);
    } catch (e) { formMsg(msg, "error", "Could not update profile.", e.message || "Please check your information."); }
  });
};
Actions["copy-verify"] = (el) => copyText(publicBaseUrl() + "#verify=" + el.dataset.no);
Actions["print-certificate"] = (el) => { const m = el.dataset.id ? API.get("members", el.dataset.id) : S.member; if (!m || m.status !== "Active") return toast("error", "Certificate unavailable", "An active membership is required."); Certificates.certificate(m); };
Actions["print-card"] = (el) => { const m = el.dataset.id ? API.get("members", el.dataset.id) : S.member; if (!m || m.status !== "Active") return toast("error", "Membership card unavailable", "An active membership is required."); Certificates.card(m); };
Actions["app-view"] = (el) => {
  const a = API.get("membership_applications", el.dataset.id); if (!a) return;
  Modal.open({ title: a.application_no, eyebrow: "Membership application", body: h`<div class="row" style="margin-bottom:14px">${statusPill(a.status)} <span class="small muted">Payment:</span> ${statusPill(a.payment_status)}</div>
    <dl class="kv"><dt>Applicant</dt><dd>${a.full_name}</dd><dt>Category</dt><dd>${a.category}</dd><dt>Amount</dt><dd>${fmtINR(a.amount)}</dd><dt>Department</dt><dd>${a.department}</dd><dt>Admission / Passing</dt><dd>${a.admission_year} / ${a.passing_year}</dd><dt>Payment mode</dt><dd>${a.payment_mode}</dd><dt>Reference</dt><dd class="mono">${a.payment_ref}</dd><dt>Submitted</dt><dd>${fmtDateTime(a.submitted_at)}</dd><dt>Reviewed</dt><dd>${a.reviewed_at ? fmtDateTime(a.reviewed_at) : "Awaiting review"}</dd>${a.notes ? h`<dt>Committee note</dt><dd>${a.notes}</dd>` : ""}</dl>`,
    foot: h`<button class="btn btn-primary" data-action="modal-close">Close</button>` });
};

/* ---- Printable certificate & card ---- */
const Certificates = {
  logo() { return absoluteUrl(CONFIG.LOGO_URL); },
  certificate(m) {
    const verify = publicBaseUrl() + "#verify=" + m.membership_no;
    const css = `@page{size:A4 landscape;margin:0}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;font-family:Inter,Arial,sans-serif;color:#0F2744}
      .page{width:297mm;height:210mm;padding:10mm;background:linear-gradient(135deg,#F7FAFF,#EEF4FF)}
      .frame{position:relative;height:100%;border:3px solid #D7A52B;outline:1.5px solid #15365F;outline-offset:-9px;border-radius:6px;padding:16mm 22mm;text-align:center;background:radial-gradient(circle at 50% 55%,rgba(59,130,246,.06),transparent 60%)}
      .wm{position:absolute;left:50%;top:54%;width:110mm;transform:translate(-50%,-50%);opacity:.045}
      .logo{width:30mm;height:30mm}.org{font:800 15pt Manrope,Arial;letter-spacing:.14em;color:#15365F;margin-top:3mm}.est{font-size:9pt;letter-spacing:.3em;color:#9C7414;font-weight:700}
      h1{font:700 32pt "Playfair Display",Georgia,serif;margin:6mm 0 2mm;color:#15365F}.sub{font-size:11pt;color:#5B6B82;letter-spacing:.1em;text-transform:uppercase}
      .name{font:800 27pt Manrope,Arial;margin:5mm 0 2mm;color:#0B2141;border-bottom:1.5px solid #D7A52B;display:inline-block;padding:0 10mm 2mm}
      .body{font-size:12pt;line-height:1.7;max-width:210mm;margin:3mm auto 0;color:#29466B}
      .meta{display:flex;justify-content:center;gap:12mm;margin-top:6mm;font-size:10pt}.meta b{display:block;font-size:12pt;color:#15365F}.meta span{color:#5B6B82;text-transform:uppercase;letter-spacing:.08em;font-size:8pt}
      .sig{position:absolute;bottom:14mm;left:22mm;right:22mm;display:flex;justify-content:space-between;align-items:flex-end;font-size:10pt}.sig div{width:60mm;border-top:1px solid #15365F;padding-top:2mm;color:#29466B}
      .sig div.seal{width:24mm;height:24mm;border-top:0;padding:0;border-radius:50%;background:radial-gradient(circle,#FFE7A3,#D7A52B 60%,#9C7414);display:grid;place-items:center;color:#3A2A05;font:800 8pt Arial;letter-spacing:.08em;box-shadow:0 0 0 2mm rgba(215,165,43,.25)}
      .ver{position:absolute;bottom:5mm;left:0;right:0;font-size:7.5pt;color:#8394AB}`;
    const html = `<div class="page"><div class="frame"><img class="wm" src="${esc(this.logo())}" alt=""><img class="logo" src="${esc(this.logo())}" alt="FPAA emblem">
      <div class="org">FALAKATA POLYTECHNIC ALUMNI ASSOCIATION</div><div class="est">ESTD 2024 · FPAA CONNECT 2.0</div>
      <h1>Certificate of Membership</h1><div class="sub">This is to certify that</div><div class="name">${esc(m.full_name)}</div>
      <div class="body">an alumnus/alumna of the <b>${esc(m.department)}</b> department (Batch ${esc(m.admission_year)}–${esc(m.passing_year)}) of Falakata Polytechnic, is a registered member of the <b>Falakata Polytechnic Alumni Association</b> under the category <b>${esc(m.category)}</b>, and is entitled to all rights and privileges of membership.</div>
      <div class="meta"><div><span>Membership No.</span><b>${esc(m.membership_no)}</b></div><div><span>Member Since</span><b>${esc(m.member_since)}</b></div><div><span>Valid Till</span><b>${esc(m.valid_till)}</b></div><div><span>Issued On</span><b>${esc(fmtDate(new Date()))}</b></div></div>
      <div class="sig"><div>President<br><small>FPAA</small></div><div class="seal">FPAA<br>SEAL</div><div>General Secretary<br><small>FPAA</small></div></div>
      <div class="ver">Verify this certificate at ${esc(verify)}</div></div></div>`;
    printHTML("FPAA Membership Certificate — " + m.membership_no, html, css);
    audit("Printed certificate", m.membership_no); toast("info", "Opening print dialog…", "Choose 'Save as PDF' to keep a digital copy.");
  },
  card(m) {
    const verify = publicBaseUrl() + "#verify=" + m.membership_no;
    const photo = m.photo ? `<img src="${esc(m.photo)}" alt="">` : `<div class="ini" style="background:${esc(avatarColor(m.full_name))}">${esc(initials(m.full_name))}</div>`;
    const css = `@page{size:A4 portrait;margin:15mm}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;font-family:Inter,Arial,sans-serif}
      h2{font:800 14pt Manrope,Arial;color:#15365F;margin:0 0 2mm}p{color:#5B6B82;font-size:9pt;margin:0 0 6mm}
      .wrap{display:flex;gap:8mm;flex-wrap:wrap}.card{width:85.6mm;height:54mm;border-radius:3.5mm;overflow:hidden;position:relative;color:#fff;padding:4mm;background:linear-gradient(135deg,#0B2141,#15365F 40%,#3B82F6 85%,#6366F1)}
      .card:before{content:"";position:absolute;right:-18mm;top:-18mm;width:50mm;height:50mm;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.22),transparent 70%)}
      .top{display:flex;gap:2.5mm;align-items:center}.top img{width:10mm;height:10mm}.top b{font-size:5.6pt;letter-spacing:.08em;line-height:1.25;display:block}.top span{font-size:4.6pt;color:#BFD6FF;letter-spacing:.14em}
      .mid{display:flex;gap:3mm;margin-top:3mm;align-items:center}.ph{width:17mm;height:20mm;border-radius:2mm;overflow:hidden;border:.6mm solid #fff;flex:none}.ph img{width:100%;height:100%;object-fit:cover}.ini{width:100%;height:100%;display:grid;place-items:center;font:800 13pt Manrope,Arial}
      .nm{font:800 10pt Manrope,Arial;line-height:1.15}.no{font-family:Menlo,monospace;font-size:7pt;letter-spacing:.08em;color:#DCE8FF;margin-top:1mm}.cat{display:inline-block;margin-top:1.5mm;font-size:5.5pt;font-weight:800;background:linear-gradient(135deg,#F7DD8B,#D7A52B);color:#3A2A05;padding:.6mm 2mm;border-radius:3mm;letter-spacing:.06em}
      .ft{position:absolute;left:4mm;right:4mm;bottom:3.2mm;display:flex;justify-content:space-between;font-size:4.8pt;color:#BFD6FF;text-transform:uppercase;letter-spacing:.06em}.ft b{display:block;color:#fff;font-size:6.2pt;letter-spacing:0;text-transform:none}
      .back{background:linear-gradient(160deg,#F7FAFF,#E0E7FF);color:#0F2744}.back:before{display:none}.back .t{font:800 7pt Manrope,Arial;color:#15365F;letter-spacing:.1em}.back ul{margin:2mm 0 0;padding-left:3.5mm;font-size:5.6pt;line-height:1.5;color:#29466B}
      .back .v{position:absolute;left:4mm;right:4mm;bottom:3mm;font-size:4.8pt;color:#5B6B82;word-break:break-all}.back .sg{position:absolute;right:4mm;bottom:9mm;width:26mm;border-top:.3mm solid #15365F;font-size:5pt;text-align:center;padding-top:.8mm;color:#29466B}
      .stripe{height:6mm;margin:-4mm -4mm 3mm;background:linear-gradient(90deg,#15365F,#3B82F6,#D7A52B)}`;
    const html = `<h2>FPAA Membership Card — ${esc(m.membership_no)}</h2><p>Print on card stock at 100% scale (CR80 size 85.6 × 54 mm). Cut along the edges and laminate.</p><div class="wrap">
      <div class="card"><div class="top"><img src="${esc(this.logo())}" alt=""><div><b>FALAKATA POLYTECHNIC<br>ALUMNI ASSOCIATION</b><span>FPAA CONNECT 2.0 · ESTD 2024</span></div></div>
        <div class="mid"><div class="ph">${photo}</div><div><div class="nm">${esc(m.full_name)}</div><div class="no">${esc(m.membership_no)}</div><div class="cat">${esc(m.category.toUpperCase())}</div></div></div>
        <div class="ft"><span>Department<b>${esc(m.department)}</b></span><span>Batch<b>${esc(m.passing_year)}</b></span><span>Valid till<b>${esc(m.valid_till)}</b></span></div></div>
      <div class="card back"><div class="stripe"></div><div class="t">MEMBER PRIVILEGES</div><ul><li>Access to FPAA Connect 2.0 member services</li><li>Alumni directory, events and career network</li><li>Eligible to vote in FPAA general meetings</li><li>This card is the property of FPAA and non-transferable</li></ul>
        <div class="sg">General Secretary</div><div class="v">Verify: ${esc(verify)}</div></div></div>`;
    printHTML("FPAA Membership Card — " + m.membership_no, html, css);
    audit("Printed membership card", m.membership_no); toast("info", "Opening print dialog…", "Print at 100% scale for the correct card size.");
  }
};
/* =====================================================================
   MEMBERSHIP — categories, application, payment status, verification
   ===================================================================== */
const Membership = {
  verifyResult(no) {
    no = normMembership(no);
    if (!RX.membership.test(no)) return alertBox("error", "Invalid membership number", "Use the format FPAA-M-YYYY-NNNNNN.");
    const m = API.find("members", (x) => x.membership_no === no);
    if (!m) return h`<div class="verify-card bad">${alertBox("error", "No membership found", `No FPAA membership matches ${no}. Check the number and try again.`)}</div>`;
    const ok = m.status === "Active";
    return h`<div class="verify-card ${ok ? "" : "bad"}"><div class="row-between" style="margin-bottom:12px"><div class="row"><span class="ico-tile ${ok ? "teal" : "soft"}">${icon(ok ? "shield" : "alert")}</span><div><span class="eyebrow">${ok ? "Verified FPAA member" : "Membership not active"}</span><h3 style="margin:2px 0 0">${m.full_name}</h3></div></div>${statusPill(m.status)}</div>
      <dl class="kv"><dt>Member Name</dt><dd>${m.full_name}</dd><dt>Membership Number</dt><dd class="mono">${m.membership_no}</dd><dt>Category</dt><dd>${m.category}</dd><dt>Status</dt><dd>${m.status}</dd><dt>Member Since</dt><dd>${m.member_since}</dd><dt>Valid Till</dt><dd>${m.valid_till}</dd></dl>
      <div class="privacy-note">${icon("lock", "ico ico-sm")} Contact details and personal information are never shown on public verification.</div>
      <div class="btn-group" style="margin-top:12px"><button class="btn btn-ghost btn-sm" data-action="copy-verify" data-no="${m.membership_no}">${icon("copy", "ico ico-sm")}Copy verification link</button></div></div>`;
  },
  verifyForm(prefill = "", id = "verifyForm") {
    return h`<form data-submit="verify-submit" id="${id}" novalidate><div class="row" style="align-items:flex-start">
      <div class="field grow"><label for="${id}-no">Membership Number</label><input class="input mono" id="${id}-no" name="membership_no" value="${prefill}" placeholder="FPAA-M-2026-000001" style="text-transform:uppercase" autocomplete="off"><span class="err"></span></div>
      <button class="btn btn-primary" type="submit" style="margin-top:26px">${icon("shield")}VERIFY MEMBERSHIP</button></div><div class="verify-result"></div></form>`;
  },
  applicationForm(prefCat = "") {
    const p = S.profile, m = S.member;
    const years = []; for (let y = new Date().getFullYear(); y >= 1990; y--) years.push(y);
    return h`<form data-submit="apply-submit" id="applyForm" novalidate>
      <div class="form-grid">
        ${field({ label: "Full Name", name: "full_name", required: true, value: m ? m.full_name : p ? p.full_name : "", attrs: 'maxlength="80" autocomplete="name"' })}
        ${field({ label: "Email", name: "email", type: "email", required: true, value: p ? p.email : "", attrs: 'autocomplete="email"' })}
        ${field({ label: "Mobile", name: "mobile", type: "tel", required: true, value: m ? m.mobile : "", placeholder: "10-digit mobile", attrs: 'inputmode="numeric" maxlength="16" autocomplete="tel"' })}
        ${field({ label: "Gender", name: "gender", options: ["Female", "Male", "Other"], placeholder: "Select", value: m ? m.gender : "" })}
        ${field({ label: "Department", name: "department", required: true, options: DEPARTMENTS, placeholder: "Select department", value: m ? m.department : "" })}
        ${field({ label: "Current Profession", name: "profession", required: true, options: PROFESSIONS, placeholder: "Select profession", value: m ? m.profession : "" })}
        ${field({ label: "Admission Year", name: "admission_year", required: true, options: years, placeholder: "Select year", value: m ? m.admission_year : "" })}
        ${field({ label: "Passing Year", name: "passing_year", required: true, options: years, placeholder: "Select year", value: m ? m.passing_year : "" })}
        ${field({ label: "Company / Organization", name: "company", value: m ? m.company : "", attrs: 'maxlength="120"' })}
        ${field({ label: "City", name: "city", value: m ? m.city : "", attrs: 'maxlength="60"' })}
        ${field({ label: "Membership Category", name: "category", required: true, options: CATEGORIES.map((c) => ({ value: c.name, label: `${c.name} — ${fmtINR(c.fee)} ${c.term}` })), placeholder: "Select category", value: prefCat, span: true })}
        ${field({ label: "Payment Mode", name: "payment_mode", required: true, options: PAY_MODES, placeholder: "Select payment mode" })}
        ${field({ label: "Payment Reference / UTR", name: "payment_ref", required: true, placeholder: "e.g. UPI/602611234567", hint: "Transaction ID, UTR, cheque number or office receipt number.", attrs: 'maxlength="40"' })}
        <div class="field span-2"><div class="alert alert-info">${icon("rupee")}<div><b>Amount payable: <span id="applyAmount">${prefCat ? fmtINR(CAT_BY_NAME[prefCat].fee) : "Select a category"}</span></b>Pay only to the official FPAA account published by the Finance Committee, then enter the reference above. Payments are verified before membership is issued.</div></div></div>
        <label class="check span-2"><input type="checkbox" name="declaration"> I declare that I am an alumnus/alumna of Falakata Polytechnic and the information provided is true.</label>
        <span class="err span-2" data-err="declaration"></span>
      </div>
      <div class="form-actions"><button class="btn btn-ghost" type="reset">Clear</button><button class="btn btn-primary" type="submit">${icon("send")}Submit Application</button></div>
      <div class="form-msg" id="applyMsg"></div></form>`;
  }
};

Views.membership = (r) => {
  const cats = Stats.catCounts();
  const benefits = [
    ["Lifetime alumni identity with digital membership card & certificate", "Access to alumni directory, career & jobs and events", "Vote in FPAA general body meetings", "Eligible to mentor students & join committees"],
    ["All Alumni Membership benefits", "Manage FPAA social media handles & campaigns", "Content publishing access for FPAA pages", "Recognition as FPAA Digital Volunteer"],
    ["All Alumni Membership benefits", "Eligible for Management Committee posts", "Participate in policy & fund decisions", "Special invite to institutional meetings"]
  ];
  const verifyNo = r.verify || "";
  return h`${pageHead({ eyebrow: "Join FPAA", title: "Membership", sub: "Become a member of Falakata Polytechnic Alumni Association — choose a category, apply online and receive your digital membership card and certificate.",
    actions: h`<a class="btn btn-primary" href="#membership" data-action="scroll-to" data-to="#applySection">${icon("idcard")}Apply now</a><button class="btn btn-ghost" data-action="scroll-to" data-to="#verifySection">${icon("shield")}Verify membership</button>` })}
    <div class="tier-grid">${CATEGORIES.map((c, i) => h`<article class="glass tier reveal ${i === 0 ? "featured" : ""} ${i === 2 ? "gold-tier" : ""}" style="animation-delay:${i * 80}ms">
      ${i === 0 ? h`<span class="ribbon">POPULAR</span>` : ""}<span class="eyebrow" style="${i === 0 ? "color:#BFD6FF" : ""}">${icon(["idcard", "globe", "award"][i], "ico ico-sm")} ${["Category 1", "Category 2", "Category 3"][i]}</span>
      <h3 style="margin-top:8px">${c.name.toUpperCase()}</h3><div class="price">${fmtINR(c.fee)} <small>${i === 1 ? "/ year" : i === 2 ? "one time" : ""}</small></div><div class="per">${i === 1 ? "₹500/year renewal" : i === 2 ? "₹5000 one time" : "One-time membership fee"} · ${fmtNum(cats[i])} active members</div>
      <ul class="tier-list">${benefits[i].map((b) => h`<li>${icon("check")}<span>${b}</span></li>`)}</ul>
      <button class="btn ${i === 0 ? "btn-gold" : i === 2 ? "btn-primary" : "btn-primary"} btn-block" data-action="apply-cat" data-cat="${c.name}">${icon("send")}Apply for ${c.name.replace(" Membership", "")}</button></article>`)}</div>

    <section class="section"><div class="section-head reveal"><div><span class="eyebrow">Process</span><h2>How membership works</h2></div></div>
      <div class="steps reveal"><div class="step"><b>Apply online</b><span>Fill the application with your academic and professional details.</span></div><div class="step"><b>Pay the fee</b><span>Pay via UPI, bank transfer, cash or cheque and enter the reference.</span></div><div class="step"><b>Verification</b><span>Finance verifies payment; Registration Committee reviews and approves.</span></div><div class="step"><b>Membership issued</b><span>Receive your membership number, certificate and digital card.</span></div></div></section>

    <section class="section grid grid-2">
      <div class="glass card reveal"><div class="card-head"><div><span class="eyebrow">${icon("check", "ico ico-sm")} Eligibility</span><h3>Who can join</h3></div></div>
        <ul class="sch-list"><li>${icon("check")}<span>Pass-out students of any diploma programme of Falakata Polytechnic — Electronics, Civil, Mechanical, Electrical or Food Processing Technology.</span></li><li>${icon("check")}<span>Final-semester students may apply; membership activates after results.</span></li><li>${icon("check")}<span>Management Committee Membership is open to existing members in good standing.</span></li><li>${icon("check")}<span>Social Media Handling requires annual renewal at ₹500/year.</span></li></ul></div>
      <div class="glass card reveal" id="verifySection"><div class="card-head"><div><span class="eyebrow">${icon("shield", "ico ico-sm")} Public verification</span><h3>Verify a membership</h3><p class="sub">Confirm that a membership number is genuine. Only public details are shown.</p></div></div>
        ${Membership.verifyForm(verifyNo, "verifyPage")}</div>
    </section>

    <section class="section grid split-2" id="applySection">
      <div class="glass card reveal"><div class="card-head"><div><span class="eyebrow">${icon("file", "ico ico-sm")} Application</span><h3>Membership application form</h3><p class="sub">${isSignedIn() ? "Your application will appear in My FPAA → My Membership Applications." : "Tip: sign in first to track this application from My FPAA."}</p></div></div>
        ${Membership.applicationForm(S.ui.applyCat || "")}</div>
      <div class="stack">
        <div class="glass card reveal"><div class="card-head"><div><span class="eyebrow">${icon("rupee", "ico ico-sm")} Payment status</span><h3>Track application</h3><p class="sub">Check review and payment verification status.</p></div></div>
          <form data-submit="track-app" novalidate><div class="stack">${field({ label: "Application Number", name: "application_no", placeholder: "APP-2026-0103", attrs: 'style="text-transform:uppercase" autocomplete="off"' })}${field({ label: "Registered Mobile", name: "mobile", type: "tel", placeholder: "10-digit mobile", attrs: 'inputmode="numeric" maxlength="16"' })}
          <button class="btn btn-primary btn-block" type="submit">${icon("search")}Check status</button></div><div class="form-msg" id="trackMsg"></div></form></div>
        <div class="glass card reveal"><div class="card-head"><div><span class="eyebrow">${icon("info", "ico ico-sm")} Fees</span><h3>Membership fees</h3></div></div>
          <dl class="kv"><dt>Alumni Membership</dt><dd>₹100</dd><dt>Social Media Handling</dt><dd>₹500/year renewal</dd><dt>Management Committee</dt><dd>₹5000 one time</dd></dl></div>
      </div>
    </section>`;
};
Mounts.membership = (r) => {
  const form = $("#applyForm");
  if (form) {
    const cat = form.querySelector('[name="category"]'); const amt = $("#applyAmount");
    cat.addEventListener("change", () => { amt.textContent = cat.value ? fmtINR(CAT_BY_NAME[cat.value].fee) + (cat.value === "Social Media Handling" ? " / year" : "") : "Select a category"; });
    const adm = form.querySelector('[name="admission_year"]'), pas = form.querySelector('[name="passing_year"]');
    adm.addEventListener("change", () => { if (adm.value && !pas.value) pas.value = String(Number(adm.value) + 3); });
    form.addEventListener("reset", () => { const keep = form._keepMsg; form._keepMsg = false; setTimeout(() => { amt.textContent = "Select a category"; clearErrors(form); if (!keep) formMsg($("#applyMsg"), null); }, 0); });
  }
  if (r.verify) { const f = $("#verifyPage"); setHTML(f.querySelector(".verify-result"), Membership.verifyResult(r.verify)); setTimeout(() => $("#verifySection").scrollIntoView({ behavior: "smooth", block: "center" }), 200); }
  if (S.ui.applyCat) { S.ui.applyCat = ""; setTimeout(() => $("#applySection").scrollIntoView({ behavior: "smooth" }), 150); }
};
Actions["scroll-to"] = (el) => { const t = $(el.dataset.to); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); };
Actions["apply-cat"] = (el) => {
  const sel = $('#applyForm [name="category"]');
  if (sel) { sel.value = el.dataset.cat; sel.dispatchEvent(new Event("change")); $("#applySection").scrollIntoView({ behavior: "smooth" }); setTimeout(() => $('#applyForm [name="full_name"]').focus({ preventScroll: true }), 500); }
  else { S.ui.applyCat = el.dataset.cat; Router.go("#membership"); }
};
Actions["verify-open"] = () => Modal.open({ title: "Verify membership", eyebrow: "Public verification", body: h`<p class="muted small">Enter a membership number to confirm it is genuine. Only public details are shown.</p>${Membership.verifyForm("", "verifyModal")}` });
Actions["verify-submit"] = async (form) => {
  const inp = form.querySelector('[name="membership_no"]'); const out = form.querySelector(".verify-result"); clearErrors(form);
  if (!inp.value.trim()) { fieldError(form, "membership_no", "Enter a membership number."); inp.focus(); return; }
  await busy(form.querySelector('[type="submit"]'), "Verifying…", async () => {
    setHTML(out, loadingBlock("Verifying…"));
    try {
      if (API.mode === "supabase" && !S.db.members.length) {
        const { data } = await supabaseClient.rpc("verify_membership", { p_membership_no: normMembership(inp.value) });
        if (data && data[0]) S.db.members.push(data[0]);
      } else await API.latency(450);
      setHTML(out, Membership.verifyResult(inp.value));
    } catch (e) { setHTML(out, alertBox("error", "Verification failed", "Please try again.")); }
  });
};
Actions["apply-submit"] = async (form) => {
  const msg = $("#applyMsg"); formMsg(msg, null);
  const v = validate(form, {
    full_name: [req("Full name is required."), [(x) => x.length >= 3, "Enter your full name."]], email: [req("Email is required."), vEmail], mobile: [req("Mobile is required."), vMobile],
    department: [req("Select your department.")], profession: [req("Select your profession.")], admission_year: [req("Select admission year.")],
    passing_year: [req("Select passing year."), [(x, all) => Number(x) > Number(all.admission_year), "Passing year must be after admission year."]],
    category: [req("Select a membership category.")], payment_mode: [req("Select a payment mode.")], payment_ref: [req("Payment reference is required."), [(x) => /^[A-Za-z0-9#\/\-_. ]{4,40}$/.test(x), "Enter a valid reference (4–40 letters/numbers)."]]
  });
  if (!v) return;
  if (!v.declaration) { $('[data-err="declaration"]').textContent = "Please accept the declaration to continue."; return; }
  $('[data-err="declaration"]').textContent = "";
  const mobile = normMobile(v.mobile);
  const dup = API.find("membership_applications", (a) => a.mobile === mobile && a.category === v.category && ["Pending", "Under Review"].includes(a.status));
  if (dup) return formMsg(msg, "error", "Application already in progress", `${dup.application_no} for ${dup.category} is ${dup.status.toLowerCase()}. Track it using the form on the right.`);
  const existing = API.find("members", (m) => m.mobile === mobile && m.category === v.category && m.status === "Active");
  if (existing) return formMsg(msg, "error", "Already a member", `This mobile is registered to active membership ${existing.membership_no} in the same category.`);
  await busy(form.querySelector('[type="submit"]'), "Submitting…", async () => {
    try {
      const c = CAT_BY_NAME[v.category]; const no = nextNo("membership_applications", "application_no", `APP-${new Date().getFullYear()}-`);
      const app = await API.insert("membership_applications", { application_no: no, full_name: v.full_name, email: v.email.toLowerCase(), mobile, gender: v.gender, department: v.department, admission_year: Number(v.admission_year), passing_year: Number(v.passing_year), profession: v.profession, company: v.company, city: v.city, category: v.category, amount: c.fee, payment_mode: v.payment_mode, payment_ref: v.payment_ref, payment_status: "Pending", status: "Pending", submitted_at: new Date().toISOString(), reviewed_at: null, notes: "", user_id: S.profile ? S.profile.id : null, member_id: null });
      await API.insert("payments", { application_id: app.id, application_no: no, member_name: v.full_name, category: v.category, amount: c.fee, mode: v.payment_mode, reference: v.payment_ref, paid_at: new Date().toISOString(), status: "Pending", verified_by: null, department: v.department });
      audit("Submitted membership application", no);
      notify("admins", "membership", "New membership application", `${no} · ${v.full_name} · ${v.category}`, "#admin/applications");
      if (S.profile) notify(S.profile.id, "membership", "Application submitted", `${no} has been received and is pending review.`, "#my-fpaa");
      form._keepMsg = true; form.reset();
      formMsg(msg, "success", `Application ${no} submitted`, "Keep this number to track your application. The Finance Committee will verify your payment and the Registration Committee will review your details.");
      toast("success", "Application submitted", no);
    } catch (e) { formMsg(msg, "error", "Could not submit application.", e.message); }
  });
};
Actions["track-app"] = async (form) => {
  const msg = $("#trackMsg");
  const v = validate(form, { application_no: [req("Application number is required.")], mobile: [req("Mobile is required."), vMobile] }); if (!v) return;
  await busy(form.querySelector('[type="submit"]'), "Checking…", async () => {
    await API.latency(400);
    const a = API.find("membership_applications", (x) => x.application_no === v.application_no.trim().toUpperCase() && x.mobile === normMobile(v.mobile));
    if (!a) return formMsg(msg, "error", "No matching application", "Check the application number and the mobile number used when applying.");
    const mem = a.member_id ? API.get("members", a.member_id) : null;
    formMsg(msg, a.status === "Rejected" ? "error" : "info", `${a.application_no} · ${a.category}`, h`<div class="row" style="margin-top:6px">Status: ${statusPill(a.status)} Payment: ${statusPill(a.payment_status)}</div>${mem ? h`<div style="margin-top:6px">Membership number: <b class="mono">${mem.membership_no}</b></div>` : ""}${a.notes ? h`<div style="margin-top:6px">${a.notes}</div>` : ""}`);
  });
};

/* =====================================================================
   DIRECTORY — searchable alumni directory with privacy-protected contacts
   ===================================================================== */
const Directory = {
  PER: 24,
  filtered() {
    const f = S.ui.dir; const q = (f.q || "").toLowerCase().trim();
    let list = API.all("members").filter((m) =>
      (!q || [m.full_name, m.company, m.city, m.department, m.profession, String(m.passing_year)].join(" ").toLowerCase().includes(q)) &&
      (!f.dept || m.department === f.dept) && (!f.prof || m.profession === f.prof) &&
      (!f.adm || String(m.admission_year) === f.adm) && (!f.pass || String(m.passing_year) === f.pass));
    const sorters = { name: (a, b) => a.full_name.localeCompare(b.full_name), "name-desc": (a, b) => b.full_name.localeCompare(a.full_name), "pass-new": (a, b) => b.passing_year - a.passing_year || a.full_name.localeCompare(b.full_name), "pass-old": (a, b) => a.passing_year - b.passing_year || a.full_name.localeCompare(b.full_name) };
    return list.sort(sorters[f.sort] || sorters.name);
  },
  mobileFor(m) { return can("members.fullMobile") ? m.mobile : maskMobile(m.mobile); },
  list() {
    const all = this.filtered(); const f = S.ui.dir;
    const pages = Math.max(1, Math.ceil(all.length / this.PER)); const page = Math.min(Math.max(1, Number(f.page) || 1), pages); f.page = page;
    const count = $("#dirCount"); if (count) count.textContent = `${fmtNum(all.length)} alumni`;
    if (!all.length) return emptyState("No alumni match your filters.", "Try a different search or clear the filters.", "users", h`<button class="btn btn-soft btn-sm" data-action="clear-filters" data-group="dir">Clear filters</button>`);
    const slice = all.slice((page - 1) * this.PER, page * this.PER);
    return h`<div class="dir-grid">${slice.map((m) => h`<button class="glass dir-card card-lift" data-action="member-view" data-id="${m.id}" aria-label="View profile of ${m.full_name}">
      ${m.status !== "Active" ? h`<span class="dc-status">${statusPill(m.status)}</span>` : ""}${avatar(m.full_name, m.photo)}<b>${m.full_name}</b>
      <span class="dc-role">${m.profession}${m.company ? " · " + m.company : ""}</span>
      <span class="dc-chips"><span class="chip">${m.department}</span><span class="chip gold">Batch ${m.passing_year}</span></span>
      <span class="dc-foot"><span>${icon("phone", "ico ico-sm")} ${this.mobileFor(m)}</span><span>${m.city}</span></span></button>`)}</div>
      ${pager("dir", page, pages, all.length, this.PER)}`;
  }
};
Filters.dir = () => setHTML($('[data-list="dir"]'), Directory.list());
Views.directory = () => {
  const f = S.ui.dir; const ms = API.all("members");
  const admYears = uniq(ms.map((m) => m.admission_year)).sort((a, b) => b - a), passYears = uniq(ms.map((m) => m.passing_year)).sort((a, b) => b - a);
  return h`${pageHead({ eyebrow: "Community", title: "Alumni Directory", sub: "Search FPAA alumni by name, department, profession and batch. Contact details are privacy-protected.",
    actions: h`<span class="chip slate">${icon("lock", "ico ico-sm")} ${can("members.fullMobile") ? "Full contact access (" + ROLES[S.profile.role] + ")" : "Mobile numbers masked"}</span>` })}
    <div class="glass toolbar reveal">${searchFilter("dir.q", f.q, "Search name, company, city…")}
      ${selectFilter("dir.dept", f.dept, DEPARTMENTS, "All departments")}${selectFilter("dir.prof", f.prof, PROFESSIONS, "All professions")}
      ${selectFilter("dir.adm", f.adm, admYears, "Admission year")}${selectFilter("dir.pass", f.pass, passYears, "Passing year")}
      <select class="select" data-filter="dir.sort" aria-label="Sort">${[["name", "Name A–Z"], ["name-desc", "Name Z–A"], ["pass-new", "Passing year: newest"], ["pass-old", "Passing year: oldest"]].map((o) => h`<option value="${o[0]}" ${raw(f.sort === o[0] ? "selected" : "")}>${o[1]}</option>`)}</select>
      <button class="btn btn-ghost btn-sm" data-action="clear-filters" data-group="dir">${icon("x", "ico ico-sm")}Clear</button><span class="count" id="dirCount"></span></div>
    <div data-list="dir">${Directory.list()}</div>`;
};
Mounts.directory = () => Filters.dir();
Actions["member-view"] = (el) => {
  const m = API.get("members", el.dataset.id); if (!m) return;
  const full = can("members.fullMobile"); const isMe = S.member && S.member.id === m.id;
  Modal.open({
    title: m.full_name, eyebrow: "Alumni profile", size: "lg",
    body: h`<div class="profile-modal-top">${avatar(m.full_name, m.photo)}<div class="grow"><div class="row">${statusPill(m.status)}<span class="chip violet">${m.category}</span><span class="chip">${m.department}</span></div>
        <p class="muted" style="margin:8px 0 0">${m.profession}${m.company ? " at " + m.company : ""}</p></div></div>
      <dl class="kv"><dt>Membership No.</dt><dd class="mono">${m.membership_no}</dd><dt>Department</dt><dd>${m.department}</dd><dt>Admission / Passing</dt><dd>${m.admission_year} / ${m.passing_year}</dd><dt>Current Profession</dt><dd>${m.profession}</dd><dt>Company / Organization</dt><dd>${m.company || "—"}</dd><dt>Location</dt><dd>${m.city}, ${m.state}</dd>
        <dt>Mobile</dt><dd>${full ? m.mobile : maskMobile(m.mobile)}</dd><dt>Email</dt><dd>${full ? m.email : maskEmail(m.email)}</dd></dl>
      <div class="privacy-note">${icon("lock", "ico ico-sm")} ${full ? "You can see full contact details because of your " + ROLES[S.profile.role] + " role. Do not share them outside FPAA work." : "Contact details are masked to protect member privacy. Use community chat to reach this member."}</div>`,
    foot: h`${!isMe && m.status === "Active" ? h`<button class="btn btn-primary" data-action="chat-dm" data-id="${m.id}">${icon("chat")}Message</button>` : ""}<button class="btn btn-ghost" data-action="modal-close">Close</button>`
  });
};
/* =====================================================================
   CAREER — job listings, filters, submission (admin approval required)
   ===================================================================== */
const Career = {
  published() { return API.all("job_postings").filter((j) => j.status === "Published"); },
  filtered() {
    const f = S.ui.jobs; const q = (f.q || "").toLowerCase().trim();
    const list = this.published().filter((j) => (!q || [j.title, j.company, j.location, j.description].join(" ").toLowerCase().includes(q)) && (!f.dept || j.department === f.dept) && (!f.type || j.job_type === f.type) && (!f.loc || j.location === f.loc) && (!f.exp || j.experience === f.exp));
    const s = { new: (a, b) => b.posted_at.localeCompare(a.posted_at), old: (a, b) => a.posted_at.localeCompare(b.posted_at), company: (a, b) => a.company.localeCompare(b.company) };
    return list.sort(s[f.sort] || s.new);
  },
  card(j, mine = false) {
    const hue = hashStr(j.company) % 360;
    return h`<article class="glass job-card card-lift"><div class="jc-top"><span class="jc-logo" style="background:linear-gradient(135deg,hsl(${hue} 65% 42%),hsl(${(hue + 40) % 360} 70% 56%))">${initials(j.company)}</span>
        <div class="t"><h3>${j.title}</h3><div class="company">${j.company}</div></div>${mine || j.status !== "Published" ? statusPill(j.status) : ""}</div>
      <div class="jc-meta"><span>${icon("pin")}${j.location}</span><span>${icon("rupee")}${j.salary || "Not disclosed"}</span><span>${icon("briefcase")}${j.job_type}</span><span>${icon("award")}${j.experience}</span></div>
      <div class="row" style="gap:6px"><span class="chip">${j.department}</span></div>
      <p class="desc">${j.description}</p>
      ${mine && j.review_note ? h`<p class="small" style="color:var(--red);margin:0">${j.review_note}</p>` : ""}
      <div class="jc-foot"><span class="small muted">Posted ${relTime(j.posted_at)}</span><div class="btn-group"><button class="btn btn-ghost btn-sm" data-action="job-view" data-id="${j.id}">Details</button>
        ${j.status === "Published" && j.apply_link ? h`<a class="btn btn-primary btn-sm" href="${safeUrl(j.apply_link)}" target="_blank" rel="noopener noreferrer">${icon("external", "ico ico-sm")}Apply</a>` : ""}</div></div></article>`;
  },
  list() {
    const all = this.filtered(); const c = $("#jobCount"); if (c) c.textContent = `${all.length} open position${all.length === 1 ? "" : "s"}`;
    if (!all.length) return emptyState("No jobs match your filters.", "Try another department, job type or location.", "briefcase", h`<button class="btn btn-soft btn-sm" data-action="clear-filters" data-group="jobs">Clear filters</button>`);
    return h`<div class="job-grid">${all.map((j) => this.card(j))}</div>`;
  },
  form(j = {}) {
    return h`<form data-submit="${j.id ? "job-save" : "job-submit"}" data-id="${j.id || ""}" novalidate><div class="form-grid">
      ${field({ label: "Position", name: "title", required: true, value: j.title, attrs: 'maxlength="90"' })}${field({ label: "Company", name: "company", required: true, value: j.company, attrs: 'maxlength="90"' })}
      ${field({ label: "Location", name: "location", required: true, value: j.location, attrs: 'maxlength="60"' })}${field({ label: "Salary", name: "salary", value: j.salary, placeholder: "e.g. ₹25,000 / month", attrs: 'maxlength="50"' })}
      ${field({ label: "Department", name: "department", required: true, options: DEPARTMENTS, placeholder: "Select", value: j.department })}${field({ label: "Job Type", name: "job_type", required: true, options: JOB_TYPES, placeholder: "Select", value: j.job_type })}
      ${field({ label: "Experience", name: "experience", required: true, options: EXPERIENCE, placeholder: "Select", value: j.experience })}${field({ label: "Application Link", name: "apply_link", type: "url", value: j.apply_link, placeholder: "https://", attrs: 'maxlength="300"' })}
      ${field({ label: "Description", name: "description", type: "textarea", required: true, value: j.description, span: true, attrs: 'maxlength="1500"' })}
    </div>${j.id ? "" : h`<div style="margin-top:14px">${alertBox("info", "Admin approval required", "The Career Cell verifies every listing before it is published. Never post jobs that charge candidates a fee.")}</div>`}
    <div class="form-actions"><button type="button" class="btn btn-ghost" data-action="modal-close">Cancel</button><button class="btn btn-primary" type="submit">${icon(j.id ? "check" : "send")}${j.id ? "Save changes" : "Submit for approval"}</button></div></form>`;
  },
  rules: { title: [req()], company: [req()], location: [req()], department: [req()], job_type: [req()], experience: [req()], apply_link: [vUrl], description: [req(), [(x) => x.length >= 30, "Please describe the role in at least 30 characters."]] }
};
Filters.jobs = () => setHTML($('[data-list="jobs"]'), Career.list());
Views.careers = () => {
  const f = S.ui.jobs; const locs = uniq(Career.published().map((j) => j.location)).sort();
  const mine = API.all("job_postings").filter((j) => S.profile && j.posted_by === S.profile.id).sort((a, b) => b.posted_at.localeCompare(a.posted_at));
  return h`${pageHead({ eyebrow: "Community", title: "Career & Jobs", sub: "Verified opportunities shared by FPAA alumni, partner companies and the Career Cell. Every listing is reviewed before it is published.",
    actions: h`<button class="btn btn-primary" data-action="job-new">${icon("plus")}Post a Job</button>` })}
    <div class="glass toolbar reveal">${searchFilter("jobs.q", f.q, "Search position, company, location…")}${selectFilter("jobs.dept", f.dept, DEPARTMENTS, "All departments")}${selectFilter("jobs.type", f.type, JOB_TYPES, "Job type")}${selectFilter("jobs.loc", f.loc, locs, "Location")}${selectFilter("jobs.exp", f.exp, EXPERIENCE, "Experience")}
      <select class="select" data-filter="jobs.sort" aria-label="Sort">${[["new", "Newest first"], ["old", "Oldest first"], ["company", "Company A–Z"]].map((o) => h`<option value="${o[0]}" ${raw(f.sort === o[0] ? "selected" : "")}>${o[1]}</option>`)}</select>
      <button class="btn btn-ghost btn-sm" data-action="clear-filters" data-group="jobs">${icon("x", "ico ico-sm")}Clear</button><span class="count" id="jobCount"></span></div>
    <div data-list="jobs">${Career.list()}</div>
    ${mine.length ? h`<section class="section"><div class="section-head"><div><span class="eyebrow">Your submissions</span><h2>Jobs you posted</h2></div></div><div class="job-grid">${mine.map((j) => Career.card(j, true))}</div></section>` : ""}`;
};
Mounts.careers = () => Filters.jobs();
Actions["job-view"] = (el) => {
  const j = API.get("job_postings", el.dataset.id); if (!j) return;
  Modal.open({ title: j.title, eyebrow: j.company, size: "lg", body: h`<div class="row" style="margin-bottom:14px">${statusPill(j.status)}<span class="chip">${j.department}</span><span class="chip violet">${j.job_type}</span></div>
    <dl class="kv"><dt>Company</dt><dd>${j.company}</dd><dt>Position</dt><dd>${j.title}</dd><dt>Location</dt><dd>${j.location}</dd><dt>Salary</dt><dd>${j.salary || "Not disclosed"}</dd><dt>Experience</dt><dd>${j.experience}</dd><dt>Posted</dt><dd>${fmtDate(j.posted_at)} by ${j.poster_name || "FPAA Career Cell"}</dd></dl>
    <div class="divider"></div><h4>Job description</h4><p style="white-space:pre-wrap">${j.description}</p>
    <div class="alert alert-warn" style="margin-top:10px">${icon("alert")}<div>FPAA never asks candidates to pay for a job. Report suspicious listings through a support request.</div></div>`,
    foot: h`<button class="btn btn-ghost" data-action="modal-close">Close</button>${j.apply_link && j.status === "Published" ? h`<a class="btn btn-primary" href="${safeUrl(j.apply_link)}" target="_blank" rel="noopener noreferrer">${icon("external")}Apply now</a>` : ""}` });
};
Actions["job-new"] = () => Modal.open({ title: "Post a job", eyebrow: "Career & Jobs", size: "lg", body: Career.form() });
Actions["job-submit"] = async (form) => {
  const v = validate(form, Career.rules); if (!v) return;
  await busy(form.querySelector('[type="submit"]'), "Submitting…", async () => {
    try {
      const direct = can("admin.careers");
      await API.insert("job_postings", Object.assign(v, { status: direct ? "Published" : "Pending", posted_at: new Date().toISOString(), posted_by: S.profile.id, poster_name: S.profile.full_name, review_note: "" }));
      audit("Submitted job posting", v.title);
      if (!direct) notify("admins", "job", "Job awaiting approval", `${v.title} · ${v.company}`, "#admin/careers");
      Modal.close(); toast("success", direct ? "Job published" : "Job submitted for approval", direct ? v.title : "The Career Cell will review it shortly."); Router.render();
    } catch (e) { toast("error", "Could not submit the job.", e.message); }
  });
};

/* =====================================================================
   EVENTS — upcoming / past, registration, details
   ===================================================================== */
const Events = {
  today() { return isoDay(new Date()); },
  isUpcoming(e) { return e.date >= this.today(); },
  filtered() {
    const f = S.ui.events; const q = (f.q || "").toLowerCase().trim();
    const list = API.all("events").filter((e) => e.status !== "Draft" && (f.tab === "past" ? !this.isUpcoming(e) : this.isUpcoming(e)) && (!q || [e.title, e.venue, e.description].join(" ").toLowerCase().includes(q)));
    const s = { date: (a, b) => f.tab === "past" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date), "date-desc": (a, b) => b.date.localeCompare(a.date), title: (a, b) => a.title.localeCompare(b.title) };
    return list.sort(s[f.sort] || s.date);
  },
  registered(e) { return !!(S.profile && (e.registrations || []).includes(S.profile.id)); },
  card(e) {
    const d = toDate(e.date); const up = this.isUpcoming(e); const reg = this.registered(e);
    return h`<article class="glass evt-card card-lift"><div class="ec-img"><img src="${e.image || art("meetup", e.id)}" alt="${e.title}" loading="lazy"><span class="ec-date"><b>${d.getDate()}</b><span>${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}</span></span><span class="ec-tag">${statusPill(up ? (reg ? "Registered" : "Upcoming") : "Completed")}</span></div>
      <div class="ec-body"><h3>${e.title}</h3><div class="ec-meta"><span>${icon("calendar")}${fmtDate(e.date)}</span><span>${icon("clock")}${fmtTime24(e.time)}</span><span>${icon("pin")}${e.venue}</span></div><p>${e.description}</p>
        <div class="ec-foot"><button class="btn btn-ghost btn-sm" data-action="event-view" data-id="${e.id}">Details</button>${up ? h`<button class="btn ${reg ? "btn-soft" : "btn-primary"} btn-sm" data-action="event-register" data-id="${e.id}">${icon(reg ? "check" : "calendar", "ico ico-sm")}${reg ? "Registered · Cancel" : "Register"}</button>` : h`<span class="small muted" style="align-self:center">${fmtNum(e.registration_count)} attended</span>`}</div></div></article>`;
  },
  list() {
    const all = this.filtered();
    if (!all.length) return emptyState(S.ui.events.tab === "past" ? "No past events found." : "No upcoming events found.", "Try a different search.", "calendar");
    return h`<div class="evt-grid">${all.map((e) => this.card(e))}</div>`;
  }
};
Filters.events = () => setHTML($('[data-list="events"]'), Events.list());
Views.events = () => {
  const f = S.ui.events; const all = API.all("events").filter((e) => e.status !== "Draft"); const upN = all.filter((e) => Events.isUpcoming(e)).length;
  return h`${pageHead({ eyebrow: "Community", title: "Events", sub: "Alumni meets, seminars, workshops and celebrations — register online and never miss a reunion." })}
    <div class="glass toolbar reveal"><div class="tabs" role="tablist"><button class="tab ${f.tab !== "past" ? "active" : ""}" data-action="events-tab" data-tab="upcoming" role="tab">Upcoming (${upN})</button><button class="tab ${f.tab === "past" ? "active" : ""}" data-action="events-tab" data-tab="past" role="tab">Past (${all.length - upN})</button></div>
      ${searchFilter("events.q", f.q, "Search events, venues…")}
      <select class="select" data-filter="events.sort" aria-label="Sort">${[["date", "By date"], ["date-desc", "Latest first"], ["title", "Title A–Z"]].map((o) => h`<option value="${o[0]}" ${raw(f.sort === o[0] ? "selected" : "")}>${o[1]}</option>`)}</select>
      <button class="btn btn-ghost btn-sm" data-action="clear-filters" data-group="events">${icon("x", "ico ico-sm")}Clear</button></div>
    <div data-list="events">${Events.list()}</div>`;
};
Actions["events-tab"] = (el) => { S.ui.events.tab = el.dataset.tab; Router.render(); };
Actions["event-view"] = (el) => {
  const e = API.get("events", el.dataset.id); if (!e) return; const up = Events.isUpcoming(e); const reg = Events.registered(e);
  Modal.open({ title: e.title, eyebrow: up ? "Upcoming event" : "Past event", size: "lg", body: h`<img class="modal-hero-img" src="${e.image || art("meetup", e.id)}" alt="${e.title}">
    <dl class="kv"><dt>Date</dt><dd>${fmtDate(e.date)}</dd><dt>Time</dt><dd>${fmtTime24(e.time)}</dd><dt>Venue</dt><dd>${e.venue}</dd><dt>Registrations</dt><dd>${fmtNum(e.registration_count)}</dd>${e.registration_link ? h`<dt>Registration link</dt><dd><a href="${safeUrl(e.registration_link)}" target="_blank" rel="noopener noreferrer">${e.registration_link}</a></dd>` : ""}</dl>
    <div class="divider"></div><p style="white-space:pre-wrap">${e.description}</p>`,
    foot: h`<button class="btn btn-ghost" data-action="modal-close">Close</button>${up && isSignedIn() ? h`<button class="btn ${reg ? "btn-soft" : "btn-primary"}" data-action="event-register" data-id="${e.id}">${icon(reg ? "check" : "calendar")}${reg ? "Cancel registration" : "Register"}</button>` : ""}` });
};
Actions["event-register"] = (el) => {
  if (!isSignedIn()) { S.ui.accessMsg = { module: "Event registration", reason: "signin" }; return Router.go("#my-fpaa"); }
  const e = API.get("events", el.dataset.id); if (!e) return; const reg = Events.registered(e);
  return busy(el, reg ? "Cancelling…" : "Registering…", async () => {
    try {
      const regs = (e.registrations || []).filter((x) => x !== S.profile.id); if (!reg) regs.push(S.profile.id);
      await API.update("events", e.id, { registrations: regs, registration_count: Math.max(0, (e.registration_count || 0) + (reg ? -1 : 1)) });
      audit(reg ? "Cancelled event registration" : "Registered for event", e.title);
      if (!reg) notify(S.profile.id, "event", "Registration confirmed", `You are registered for ${e.title} on ${fmtDate(e.date)}.`, "#events");
      toast("success", reg ? "Registration cancelled" : "You're registered!", e.title);
      if (!reg && e.registration_link) window.open(e.registration_link, "_blank", "noopener");
      Modal.close(); if (S.route.name === "events") Filters.events(); else Router.render();
    } catch (err) { toast("error", "Could not update registration.", err.message); }
  });
};

/* =====================================================================
   DONATIONS — contribute, verification status, receipts
   ===================================================================== */
const Donations = {
  verified() { return API.all("donations").filter((d) => d.status === "Verified"); },
  form() {
    const p = S.profile, m = S.member;
    return h`<form data-submit="donate-submit" id="donateForm" novalidate><div class="form-grid">
      ${field({ label: "Purpose", name: "purpose", required: true, options: DONATION_PURPOSES, value: "General Contribution", span: true })}
      <div class="field span-2"><span class="field-label">Amount <span class="req">*</span></span><div class="amount-chips">${[500, 1000, 2500, 5000, 10000].map((a) => h`<button type="button" class="amount-chip ${a === 1000 ? "active" : ""}" data-action="amount-pick" data-amount="${a}">${fmtINR(a)}</button>`)}</div>
        <input class="input" name="amount" type="number" min="1" step="1" value="1000" inputmode="numeric" aria-label="Custom amount" style="margin-top:8px"><span class="err"></span></div>
      ${field({ label: "Donor Name", name: "donor_name", required: true, value: m ? m.full_name : p ? p.full_name : "", attrs: 'maxlength="80"' })}
      ${field({ label: "Email", name: "email", type: "email", required: true, value: p ? p.email : "" })}
      ${field({ label: "Mobile", name: "mobile", type: "tel", required: true, value: m ? m.mobile : "", attrs: 'inputmode="numeric" maxlength="16"' })}
      ${field({ label: "Payment Mode", name: "payment_mode", required: true, options: PAY_MODES, placeholder: "Select" })}
      ${field({ label: "Payment Reference / UTR", name: "payment_ref", required: true, span: true, placeholder: "Transaction ID / UTR / receipt no.", attrs: 'maxlength="40"' })}
      ${field({ label: "Message", name: "message", type: "textarea", span: true, rows: 3, placeholder: "Optional message to the association", attrs: 'maxlength="400"' })}
    </div><div class="form-actions"><button class="btn btn-primary" type="submit">${icon("heart")}Submit Donation</button></div><div class="form-msg" id="donateMsg"></div></form>`;
  }
};
Views.donations = () => {
  const ver = Donations.verified(); const raised = sum(ver, (d) => d.amount); const pct = Math.min(100, Math.round((raised / DONATION_GOAL) * 100));
  const recent = ver.slice().sort((a, b) => b.donated_at.localeCompare(a.donated_at)).slice(0, 6);
  const mine = MyFPAA.myDonations();
  return h`${pageHead({ eyebrow: "Give back", title: "Donations", sub: "Your contribution funds scholarships, skill programmes and campus development at Falakata Polytechnic. Every donation is verified by the Finance Committee." })}
    <div class="don-layout">
      <section class="glass card reveal"><div class="card-head"><div><span class="eyebrow">${icon("heart", "ico ico-sm")} Contribute</span><h3>Make a donation</h3><p class="sub">Pay to the official FPAA account, then submit the reference for verification.</p></div></div>${Donations.form()}</section>
      <div class="stack">
        <section class="glass card reveal"><span class="eyebrow">${icon("target", "ico ico-sm")} Annual goal</span><h3 style="margin-top:6px">${fmtINR(raised)} <span class="muted small">raised of ${fmtINR(DONATION_GOAL)}</span></h3>
          <div class="progress" style="margin:12px 0 8px"><span style="width:${pct}%"></span></div><div class="row-between small muted"><span>${pct}% of goal</span><span>${fmtNum(uniq(ver.map((d) => d.email)).length)} verified donors</span></div>
          <div class="grid grid-2" style="margin-top:16px;gap:10px"><div class="stat-card glass" style="box-shadow:none;padding:14px"><div class="sc-body"><div class="sc-label">Pending</div><div class="sc-value" style="font-size:1.3rem">${fmtNum(API.all("donations").filter((d) => d.status === "Pending").length)}</div></div></div><div class="stat-card glass" style="box-shadow:none;padding:14px"><div class="sc-body"><div class="sc-label">Verified</div><div class="sc-value" style="font-size:1.3rem">${fmtNum(ver.length)}</div></div></div></div></section>
        <section class="glass card reveal"><div class="card-head"><div><span class="eyebrow">Thank you</span><h3>Recent verified donors</h3></div></div>
          ${recent.length ? h`<div class="donor-list">${recent.map((d) => h`<div class="donor-row">${avatar(d.donor_name, null, "sm")}<div class="grow"><b>${d.donor_name}</b><span>${d.purpose} · ${relTime(d.donated_at)}</span></div><b>${fmtINR(d.amount)}</b></div>`)}</div>` : emptyState("No donations found.", "", "heart")}</section>
        <section class="glass card reveal"><div class="card-head"><div><span class="eyebrow">Your giving</span><h3>My donations</h3></div></div>
          ${mine.length ? h`<div class="donor-list">${mine.map((d) => h`<button class="donor-row" style="width:100%;text-align:left;font:inherit;cursor:pointer" data-action="donation-view" data-id="${d.id}"><span class="ico-tile soft" style="width:36px;height:36px">${icon("heart", "ico ico-sm")}</span><span class="grow"><b class="mono">${d.donation_no}</b><span>${d.purpose}</span></span><span style="text-align:right"><b>${fmtINR(d.amount)}</b><br>${statusPill(d.status)}</span></button>`)}</div>` : emptyState("No donations found.", "Your donations will appear here.", "heart")}</section>
      </div></div>`;
};
Actions["amount-pick"] = (el) => { $$(".amount-chip").forEach((c) => c.classList.toggle("active", c === el)); const i = $('#donateForm [name="amount"]'); i.value = el.dataset.amount; };
Actions["donate-submit"] = async (form) => {
  const msg = $("#donateMsg"); formMsg(msg, null);
  const v = validate(form, { purpose: [req()], amount: [req("Enter an amount."), vAmount(1)], donor_name: [req("Donor name is required.")], email: [req("Email is required."), vEmail], mobile: [req("Mobile is required."), vMobile], payment_mode: [req("Select a payment mode.")], payment_ref: [req("Payment reference is required."), [(x) => /^[A-Za-z0-9#\/\-_. ]{4,40}$/.test(x), "Enter a valid reference."]] });
  if (!v) return;
  await busy(form.querySelector('[type="submit"]'), "Submitting…", async () => {
    try {
      const no = nextNo("donations", "donation_no", `DON-${new Date().getFullYear()}-`);
      await API.insert("donations", { donation_no: no, purpose: v.purpose, amount: Math.round(Number(v.amount)), donor_name: v.donor_name, email: v.email.toLowerCase(), mobile: normMobile(v.mobile), message: v.message, payment_mode: v.payment_mode, payment_ref: v.payment_ref, status: "Pending", donated_at: new Date().toISOString(), user_id: S.profile ? S.profile.id : null, department: S.member ? S.member.department : "" });
      audit("Submitted donation", no); notify("admins", "donation", "Donation awaiting verification", `${no} · ${fmtINR(v.amount)} · ${v.donor_name}`, "#admin/donations");
      if (S.profile) notify(S.profile.id, "donation", "Donation received", `${no} of ${fmtINR(v.amount)} is pending verification.`, "#my-fpaa");
      toast("success", "Thank you for your donation!", `${no} is pending verification.`); Router.render();
      setTimeout(() => formMsg($("#donateMsg"), "success", `Donation ${no} submitted`, "The Finance Committee will verify your payment. Track it in My FPAA → My Donations."), 50);
    } catch (e) { formMsg(msg, "error", "Could not submit donation.", e.message); }
  });
};
Actions["donation-view"] = (el) => {
  const d = API.get("donations", el.dataset.id); if (!d) return;
  const mine = S.profile && (d.user_id === S.profile.id || d.email === S.profile.email);
  if (!mine && !can("admin.donations")) return toast("error", "Not available", "You can only view your own donations.");
  Modal.open({ title: d.donation_no, eyebrow: "Donation details", body: h`<div class="row" style="margin-bottom:14px">${statusPill(d.status)}<span class="chip gold">${fmtINR(d.amount)}</span></div>
    <dl class="kv"><dt>Purpose</dt><dd>${d.purpose}</dd><dt>Amount</dt><dd>${fmtINR(d.amount)}</dd><dt>Donor</dt><dd>${d.donor_name}</dd><dt>Email</dt><dd>${d.email}</dd><dt>Mobile</dt><dd>${can("admin.donations") ? d.mobile : maskMobileTail(d.mobile)}</dd><dt>Payment</dt><dd>${d.payment_mode || "—"} · <span class="mono">${d.payment_ref || "—"}</span></dd><dt>Date</dt><dd>${fmtDateTime(d.donated_at)}</dd>${d.message ? h`<dt>Message</dt><dd>${d.message}</dd>` : ""}${d.review_note ? h`<dt>Finance note</dt><dd>${d.review_note}</dd>` : ""}</dl>`,
    foot: h`<button class="btn btn-ghost" data-action="modal-close">Close</button>${d.status === "Verified" ? h`<button class="btn btn-primary" data-action="donation-receipt" data-id="${d.id}">${icon("printer")}Print receipt</button>` : ""}` });
};
Actions["donation-receipt"] = (el) => {
  const d = API.get("donations", el.dataset.id); if (!d || d.status !== "Verified") return;
  const css = `@page{size:A5 landscape;margin:12mm}body{font-family:Inter,Arial,sans-serif;color:#0F2744;margin:0}.r{border:2px solid #15365F;border-radius:10px;padding:10mm;position:relative}.h{display:flex;gap:5mm;align-items:center;border-bottom:1px solid #D7A52B;padding-bottom:4mm}.h img{width:18mm}.h b{font:800 12pt Manrope,Arial;display:block;color:#15365F}.h span{font-size:8pt;color:#5B6B82;letter-spacing:.1em}h2{font:800 14pt Manrope,Arial;margin:5mm 0 3mm}table{width:100%;border-collapse:collapse;font-size:10pt}td{padding:2mm 0;border-bottom:1px dashed #DCE3F0}td:first-child{color:#5B6B82;width:40%}.amt{font:800 16pt Manrope,Arial;color:#15365F}.f{margin-top:6mm;font-size:8pt;color:#5B6B82;display:flex;justify-content:space-between}`;
  printHTML("Donation receipt " + d.donation_no, `<div class="r"><div class="h"><img src="${esc(Certificates.logo())}" alt=""><div><b>FALAKATA POLYTECHNIC ALUMNI ASSOCIATION</b><span>FPAA CONNECT 2.0 · DONATION RECEIPT</span></div></div><h2>Receipt ${esc(d.donation_no)}</h2>
    <table><tr><td>Received from</td><td><b>${esc(d.donor_name)}</b></td></tr><tr><td>Purpose</td><td>${esc(d.purpose)}</td></tr><tr><td>Amount</td><td class="amt">${esc(fmtINR(d.amount))}</td></tr><tr><td>Payment</td><td>${esc(d.payment_mode || "")} · ${esc(d.payment_ref || "")}</td></tr><tr><td>Date</td><td>${esc(fmtDate(d.donated_at))}</td></tr><tr><td>Status</td><td>Verified by Finance Committee</td></tr></table>
    <div class="f"><span>Thank you for supporting FPAA.</span><span>Generated ${esc(fmtDate(new Date()))}</span></div></div>`, css);
};
/* =====================================================================
   ACHIEVEMENTS
   ===================================================================== */
const Achievements = {
  filtered() {
    const f = S.ui.ach; const q = (f.q || "").toLowerCase().trim();
    const list = API.all("achievements").filter((a) => a.status === "Published" && (!q || [a.member_name, a.title, a.organization, a.description].join(" ").toLowerCase().includes(q)) && (!f.year || a.date.startsWith(f.year)));
    const s = { new: (a, b) => b.date.localeCompare(a.date), old: (a, b) => a.date.localeCompare(b.date), name: (a, b) => a.member_name.localeCompare(b.member_name) };
    return list.sort(s[f.sort] || s.new);
  },
  list() {
    const all = this.filtered();
    if (!all.length) return emptyState("No achievements found.", "Try a different search or year.", "trophy");
    return h`<div class="ach-grid">${all.map((a) => h`<button class="glass ach-card card-lift" data-action="ach-view" data-id="${a.id}"><span class="ac-img"><img src="${a.photo || art("trophy", a.id)}" alt="" loading="lazy"><span class="ac-medal">${icon("award")}</span></span>
      <span class="ac-body"><h3>${a.title}</h3><span class="who">${a.member_name}</span><p>${a.description}</p><span class="ac-foot"><span>${icon("building", "ico ico-sm")} ${a.organization}</span><span>${fmtDate(a.date)}</span></span></span></button>`)}</div>`;
  },
  form(a = {}, admin = false) {
    return h`<form data-submit="${admin ? "adm-ach-save" : "ach-submit"}" data-id="${a.id || ""}" novalidate><div class="form-grid">
      ${field({ label: "Member", name: "member_name", required: true, value: a.member_name || (!admin && S.member ? S.member.full_name : ""), attrs: 'maxlength="80"' })}${field({ label: "Achievement Title", name: "title", required: true, value: a.title, attrs: 'maxlength="100"' })}
      ${field({ label: "Organization", name: "organization", required: true, value: a.organization, attrs: 'maxlength="100"' })}${field({ label: "Date", name: "date", type: "date", required: true, value: a.date || isoDay(new Date()) })}
      ${field({ label: "Description", name: "description", type: "textarea", required: true, value: a.description, span: true, attrs: 'maxlength="1000"' })}
      <div class="field span-2"><span class="field-label">Photo</span><div class="file-drop"><img class="preview-thumb" id="achPrev" src="${a.photo || art("trophy", 9)}" alt="Preview"><div class="grow"><input type="file" name="photo" accept="image/jpeg,image/png,image/webp" data-preview="#achPrev" aria-label="Achievement photo"><div class="hint small muted">JPG, PNG or WEBP</div></div></div><span class="err"></span></div>
      ${admin ? field({ label: "Status", name: "status", options: ["Published", "Draft", "Pending"], value: a.status || "Published" }) : ""}
    </div>${admin ? "" : h`<p class="small muted" style="margin-top:12px">Submissions are reviewed by the Content Admin before publishing.</p>`}
    <div class="form-actions"><button type="button" class="btn btn-ghost" data-action="modal-close">Cancel</button><button class="btn btn-primary" type="submit">${icon(admin ? "check" : "send")}${admin ? "Save" : "Submit for review"}</button></div></form>`;
  },
  rules: { member_name: [req()], title: [req()], organization: [req()], date: [req()], description: [req(), [(x) => x.length >= 20, "Please write at least 20 characters."]] }
};
Filters.ach = () => setHTML($('[data-list="ach"]'), Achievements.list());
Views.achievements = () => {
  const f = S.ui.ach; const years = uniq(API.all("achievements").filter((a) => a.status === "Published").map((a) => a.date.slice(0, 4))).sort().reverse();
  return h`${pageHead({ eyebrow: "Community", title: "Achievements", sub: "Celebrating the milestones, awards and success stories of Falakata Polytechnic alumni.", actions: h`<button class="btn btn-primary" data-action="ach-new">${icon("plus")}Share an achievement</button>` })}
    <div class="glass toolbar reveal">${searchFilter("ach.q", f.q, "Search member, title, organization…")}${selectFilter("ach.year", f.year, years, "All years")}
      <select class="select" data-filter="ach.sort" aria-label="Sort">${[["new", "Newest first"], ["old", "Oldest first"], ["name", "Member A–Z"]].map((o) => h`<option value="${o[0]}" ${raw(f.sort === o[0] ? "selected" : "")}>${o[1]}</option>`)}</select>
      <button class="btn btn-ghost btn-sm" data-action="clear-filters" data-group="ach">${icon("x", "ico ico-sm")}Clear</button></div>
    <div data-list="ach">${Achievements.list()}</div>`;
};
Actions["ach-view"] = (el) => { const a = API.get("achievements", el.dataset.id); if (!a) return; Modal.open({ title: a.title, eyebrow: "Alumni achievement", size: "lg", body: h`<img class="modal-hero-img" src="${a.photo || art("trophy", a.id)}" alt=""><dl class="kv"><dt>Member</dt><dd>${a.member_name}</dd><dt>Organization</dt><dd>${a.organization}</dd><dt>Date</dt><dd>${fmtDate(a.date)}</dd></dl><div class="divider"></div><p style="white-space:pre-wrap">${a.description}</p>`, foot: h`<button class="btn btn-primary" data-action="modal-close">Close</button>` }); };
Actions["ach-new"] = () => Modal.open({ title: "Share an achievement", eyebrow: "Achievements", size: "lg", body: Achievements.form(), onMount: (m) => bindFilePreviews(m) });
Actions["ach-submit"] = async (form) => {
  const v = validate(form, Achievements.rules); if (!v) return;
  await busy(form.querySelector('[type="submit"]'), "Submitting…", async () => {
    try {
      const inp = form.querySelector('[name="photo"]'); const photo = inp.files[0] ? (inp._dataUrl || await readImageFile(inp.files[0])) : art("trophy", Date.now());
      await API.insert("achievements", { member_name: v.member_name, title: v.title, organization: v.organization, date: v.date, description: v.description, photo, status: "Pending", submitted_by: S.profile.id });
      notify("admins", "achievement", "Achievement awaiting review", v.title, "#admin/achievements"); audit("Submitted achievement", v.title);
      Modal.close(); toast("success", "Achievement submitted", "It will appear after review by the Content Admin.");
    } catch (e) { toast("error", "Could not submit.", e.message); }
  });
};

/* =====================================================================
   MEMORIES — alumni gallery with upload + approval
   ===================================================================== */
const Memories = {
  filtered() {
    const f = S.ui.mem; const q = (f.q || "").toLowerCase().trim();
    const list = API.all("memories").filter((m) => m.status === "Published" && (!q || [m.caption, m.member_name, m.batch].join(" ").toLowerCase().includes(q)) && (!f.batch || m.batch === f.batch) && (!f.year || String(m.year) === f.year));
    const s = { new: (a, b) => b.created_at.localeCompare(a.created_at), year: (a, b) => b.year - a.year, "year-asc": (a, b) => a.year - b.year };
    return list.sort(s[f.sort] || s.new);
  },
  list() {
    const all = this.filtered();
    if (!all.length) return emptyState("No memories found.", "Be the first to share a campus memory.", "image");
    return h`<div class="mem-masonry">${all.map((m, i) => h`<button class="mem-item" data-action="mem-view" data-id="${m.id}"><img src="${m.photo}" alt="${m.caption}" loading="lazy" style="aspect-ratio:${[4 / 3, 1, 3 / 4, 16 / 10][i % 4]};object-fit:cover"><span class="mi-badge chip gold">${m.year}</span><span class="mi-cap"><b>${m.caption}</b><span>${m.member_name} · Batch ${m.batch}</span></span></button>`)}</div>`;
  }
};
Filters.mem = () => setHTML($('[data-list="mem"]'), Memories.list());
Views.memories = () => {
  const f = S.ui.mem; const pub = API.all("memories").filter((m) => m.status === "Published");
  const mine = API.all("memories").filter((m) => S.profile && m.user_id === S.profile.id && m.status !== "Published");
  return h`${pageHead({ eyebrow: "Community", title: "Memories", sub: "Photographs and moments from the classrooms, labs, hostels and fields of Falakata Polytechnic.", actions: h`<button class="btn btn-primary" data-action="mem-new">${icon("upload")}Upload memory</button>` })}
    ${mine.length ? h`<div style="margin-bottom:16px">${alertBox("info", `${mine.length} of your upload${mine.length > 1 ? "s are" : " is"} awaiting approval`, "Memories are published after review by the Content Admin.")}</div>` : ""}
    <div class="glass toolbar reveal">${searchFilter("mem.q", f.q, "Search caption, member…")}${selectFilter("mem.batch", f.batch, uniq(pub.map((m) => m.batch)).sort(), "All batches")}${selectFilter("mem.year", f.year, uniq(pub.map((m) => String(m.year))).sort().reverse(), "All years")}
      <select class="select" data-filter="mem.sort" aria-label="Sort">${[["new", "Recently added"], ["year", "Year: newest"], ["year-asc", "Year: oldest"]].map((o) => h`<option value="${o[0]}" ${raw(f.sort === o[0] ? "selected" : "")}>${o[1]}</option>`)}</select>
      <button class="btn btn-ghost btn-sm" data-action="clear-filters" data-group="mem">${icon("x", "ico ico-sm")}Clear</button></div>
    <div data-list="mem">${Memories.list()}</div>`;
};
Actions["mem-view"] = (el) => {
  const list = Memories.filtered(); let i = list.findIndex((m) => m.id === el.dataset.id); if (i < 0) { const one = API.get("memories", el.dataset.id); if (!one) return; list.splice(0, list.length, one); i = 0; }
  const show = () => { const m = list[i]; Modal.open({ title: m.caption, eyebrow: `Memory ${i + 1} of ${list.length}`, size: "lg",
    body: h`<img class="lightbox-img" src="${m.photo}" alt="${m.caption}"><dl class="kv" style="margin-top:14px"><dt>Shared by</dt><dd>${m.member_name}</dd><dt>Batch</dt><dd>${m.batch}</dd><dt>Year</dt><dd>${m.year}</dd></dl>`,
    foot: h`<button class="btn btn-ghost" data-lb="prev" ${raw(list.length < 2 ? "disabled" : "")}>${icon("chevL")}Previous</button><button class="btn btn-ghost" data-lb="next" ${raw(list.length < 2 ? "disabled" : "")}>Next${icon("chevR")}</button>`,
    onMount: (mm) => { mm.querySelector('[data-lb="prev"]').onclick = () => { i = (i - 1 + list.length) % list.length; show(); }; mm.querySelector('[data-lb="next"]').onclick = () => { i = (i + 1) % list.length; show(); }; } }); };
  show();
};
function memoryForm(m = {}, admin = false) {
  const yrs = []; for (let y = new Date().getFullYear(); y >= 1990; y--) yrs.push(y);
  return h`<form data-submit="${admin ? "adm-memory-save" : "mem-submit"}" data-id="${m.id || ""}" novalidate><div class="form-grid">
    <div class="field span-2"><span class="field-label">Photo ${m.id ? "" : h`<span class="req">*</span>`}</span><div class="file-drop"><img class="preview-thumb" id="memPrev" src="${m.photo || art("memory", 5)}" alt="Preview"><div class="grow"><input type="file" name="photo" accept="image/jpeg,image/png,image/webp" data-preview="#memPrev" aria-label="Memory photo"><div class="hint small muted">JPG, PNG or WEBP · large photos are resized automatically</div></div></div><span class="err"></span></div>
    ${field({ label: "Caption", name: "caption", required: true, value: m.caption, span: true, attrs: 'maxlength="120"' })}
    ${field({ label: "Batch", name: "batch", required: true, value: m.batch || (S.member ? `${S.member.admission_year}–${S.member.passing_year}` : ""), placeholder: "e.g. 2014–2017", attrs: 'maxlength="20"' })}
    ${field({ label: "Year", name: "year", required: true, options: yrs, value: m.year || "", placeholder: "Year of photo" })}
    ${field({ label: "Member Name", name: "member_name", required: true, value: m.member_name || (S.member ? S.member.full_name : S.profile ? S.profile.full_name : ""), span: !admin, attrs: 'maxlength="80"' })}
    ${admin ? field({ label: "Status", name: "status", options: ["Pending", "Approved", "Published"], value: m.status || "Published" }) : ""}
  </div><div class="form-actions"><button type="button" class="btn btn-ghost" data-action="modal-close">Cancel</button><button class="btn btn-primary" type="submit">${icon("upload")}${admin ? "Save" : "Upload memory"}</button></div></form>`;
}
Actions["mem-new"] = () => Modal.open({ title: "Upload a memory", eyebrow: "Memories", size: "lg", body: memoryForm(), onMount: (m) => bindFilePreviews(m) });
Actions["mem-submit"] = async (form) => {
  const v = validate(form, { caption: [req()], batch: [req()], year: [req()], member_name: [req()] }); if (!v) return;
  const inp = form.querySelector('[name="photo"]'); if (!inp.files[0]) { fieldError(form, "photo", "Please choose a photo."); return; }
  await busy(form.querySelector('[type="submit"]'), "Uploading…", async () => {
    try {
      const photo = inp._dataUrl && inp._dataUrl.length > 0 ? await readImageFile(inp.files[0]) : await readImageFile(inp.files[0]);
      await API.insert("memories", { caption: v.caption, batch: v.batch, year: Number(v.year), member_name: v.member_name, photo, status: "Pending", user_id: S.profile.id });
      notify("admins", "memory", "Memory awaiting approval", v.caption, "#admin/memories"); audit("Uploaded memory", v.caption);
      Modal.close(); toast("success", "Memory uploaded", "It will be published after approval."); Router.render();
    } catch (e) { toast("error", "Upload failed", e.message); }
  });
};

/* =====================================================================
   SCHEMES — FALAKATA ALUMNI SCHEME (three scheme folders + detail view)
   ===================================================================== */
const Schemes = {
  all() { return API.all("volunteer_opportunities"); },
  apps(id) { return API.all("scheme_applications").filter((a) => !id || a.scheme_id === id); },
  mine(id) { return this.apps(id).filter((a) => S.profile && a.user_id === S.profile.id); }
};
Views.scheme = (r) => {
  const sc = r.param ? Schemes.all().find((s) => s.id === r.param) : null;
  if (sc) return Schemes.detail(sc);
  const mine = Schemes.mine();
  return h`${pageHead({ eyebrow: "Scholarships & skills", title: "FALAKATA ALUMNI SCHEME", sub: "Alumni-funded programmes that reward merit, support students in need and build job-ready skills. Open a folder to see eligibility, benefits and how to apply." })}
    <div class="sch-grid">${Schemes.all().map((s, i) => h`<button class="sch-folder ${s.tone} reveal" style="animation-delay:${i * 90}ms" data-action="go" data-to="#scheme/${s.id}">
      <span class="row" style="justify-content:space-between;width:100%"><span class="ico-tile">${icon(s.icon)}</span><span class="chip slate">${icon("folder", "ico ico-sm")} ${s.code}</span></span>
      <h3>${s.name}</h3><span class="chip ${i === 0 ? "violet" : i === 1 ? "" : "gold"}" style="align-self:flex-start">${s.audience}</span><p>${s.summary}</p>
      <span class="sf-foot"><span>${icon("calendar", "ico ico-sm")} ${s.deadline}</span><span>${s.seats} seats</span><span style="color:var(--indigo)">Open folder ${icon("chevR", "ico ico-sm")}</span></span></button>`)}</div>
    <section class="section glass card reveal"><div class="card-head"><div><span class="eyebrow">${icon("file", "ico ico-sm")} Your applications</span><h3>My scheme applications</h3></div></div>
      ${mine.length ? h`<div class="table-wrap"><table class="data-table"><thead><tr><th>Application No.</th><th>Scheme</th><th>Submitted</th><th>Status</th><th>Remarks</th></tr></thead><tbody>${mine.map((a) => h`<tr><td class="mono t-strong">${a.application_no}</td><td>${(Schemes.all().find((s) => s.id === a.scheme_id) || {}).name}</td><td>${fmtDate(a.submitted_at)}</td><td>${statusPill(a.status)}</td><td class="small">${a.remarks || "—"}</td></tr>`)}</tbody></table></div>`
        : emptyState("No scheme applications yet.", "Open a scheme folder to apply for yourself or help a student apply.", "school")}</section>`;
};
Schemes.detail = (s) => {
  const tab = S.ui.scheme.tab || "eligibility";
  const tabs = [["eligibility", "Eligibility"], ["criteria", "Criteria"], ["benefits", "Benefits"], ["application", "Application"], ["documents", "Documents"], ["status", "Status"]];
  const listOf = (arr, ic) => h`<ul class="sch-list">${arr.map((x) => h`<li>${icon(ic)}<span>${x}</span></li>`)}</ul>`;
  let body;
  if (tab === "eligibility") body = listOf(s.eligibility, "check");
  else if (tab === "criteria") body = listOf(s.criteria, "target");
  else if (tab === "benefits") body = listOf(s.benefits, "gift");
  else if (tab === "documents") body = h`${listOf(s.documents, "file")}<p class="small muted" style="margin-top:12px">Keep scanned copies ready. The Scheme Review Committee will request originals during verification. Never share full Aadhaar numbers — upload masked copies only.</p>`;
  else if (tab === "application") body = Schemes.form(s);
  else {
    const apps = Schemes.apps(s.id); const mine = Schemes.mine(s.id); const c = countBy(apps, (a) => a.status);
    body = h`<div class="grid grid-4" style="margin-bottom:18px">${SCHEME_STATUSES.slice(0, 4).map((st) => h`<div class="glass stat-card" style="box-shadow:none"><div class="sc-body"><div class="sc-label">${st}</div><div class="sc-value">${c[st] || 0}</div></div></div>`)}</div>
      <div class="grid grid-2"><div><h4>My applications</h4>${mine.length ? h`<div class="stack">${mine.map((a) => h`<div class="donor-row"><span class="grow"><b class="mono">${a.application_no}</b><span>${a.applicant_name} · ${fmtDate(a.submitted_at)}</span></span>${statusPill(a.status)}</div>`)}</div>` : emptyState("No applications found.", "", "file")}</div>
      <div><h4>Track an application</h4><form data-submit="scheme-track" novalidate class="stack">${field({ label: "Application Number", name: "application_no", placeholder: "FAS-2026-0001", attrs: 'style="text-transform:uppercase"' })}${field({ label: "Mobile", name: "mobile", type: "tel", attrs: 'inputmode="numeric" maxlength="16"' })}<button class="btn btn-primary" type="submit">${icon("search")}Check status</button><div class="form-msg" id="schTrackMsg"></div></form></div></div>`;
  }
  return h`<button class="btn btn-ghost btn-sm reveal" data-action="go" data-to="#scheme" style="margin-bottom:14px">${icon("arrowL", "ico ico-sm")}All schemes</button>
    <section class="glass sch-detail-head reveal"><span class="ico-tile ${s.tone === "f-gold" ? "gold" : s.tone === "f-rose" ? "violet" : ""}">${icon(s.icon, "ico ico-lg")}</span><div style="min-width:0"><span class="eyebrow">Falakata Alumni Scheme · ${s.code}</span><h1 style="font-size:clamp(1.4rem,2.6vw,2rem);margin:6px 0">${s.name}</h1><p class="muted" style="margin:0">${s.summary}</p>
      <div class="row" style="margin-top:10px"><span class="chip violet">${s.audience}</span><span class="chip">${icon("calendar", "ico ico-sm")} Last date: ${s.deadline}</span><span class="chip gold">${s.seats} seats</span></div></div></section>
    <div class="section"><div class="tabs reveal" role="tablist">${tabs.map((t) => h`<button class="tab ${tab === t[0] ? "active" : ""}" role="tab" aria-selected="${String(tab === t[0])}" data-action="scheme-tab" data-tab="${t[0]}">${t[1]}</button>`)}</div></div>
    <section class="glass card reveal" style="margin-top:14px">${body}</section>`;
};
Schemes.form = (s) => {
  const isKalam = s.id === "scheme-kalam"; const gender = s.id === "scheme-savitribai" ? "Female" : s.id === "scheme-visvesvaraya" ? "Male" : "";
  return h`<form data-submit="scheme-apply" data-scheme="${s.id}" novalidate><div class="form-grid">
    ${field({ label: "Applicant Name", name: "applicant_name", required: true, attrs: 'maxlength="80"' })}
    ${field({ label: "Gender", name: "gender", required: true, options: gender ? [gender] : ["Female", "Male", "Other"], value: gender, placeholder: gender ? "" : "Select", hint: gender ? `This scholarship is for ${s.audience.toLowerCase()}.` : "" })}
    ${field({ label: "Department", name: "department", required: true, options: DEPARTMENTS, placeholder: "Select" })}
    ${field({ label: "Semester / Status", name: "semester", required: true, options: isKalam ? ["1st", "2nd", "3rd", "4th", "5th", "6th", "Alumni (passed within 3 years)"] : ["2nd", "3rd", "4th", "5th", "6th"], placeholder: "Select" })}
    ${field({ label: "Last semester %", name: "percentage", type: "number", required: !isKalam, attrs: 'min="0" max="100" step="0.01" inputmode="decimal"' })}
    ${isKalam ? field({ label: "Training track", name: "track", required: true, options: ["PLC & Automation", "AutoCAD & Revit", "Embedded Systems", "Food Safety (FSSAI)"], placeholder: "Select" }) : field({ label: "Annual family income (₹)", name: "family_income", type: "number", required: true, attrs: 'min="0" step="1000" inputmode="numeric"' })}
    ${field({ label: "Mobile", name: "mobile", type: "tel", required: true, attrs: 'inputmode="numeric" maxlength="16"' })}
    ${field({ label: "Email", name: "email", type: "email" })}
    ${field({ label: "Statement of purpose", name: "statement", type: "textarea", required: true, span: true, rows: 3, placeholder: "Why are you applying? (50–600 characters)", attrs: 'maxlength="600"' })}
    <label class="check span-2"><input type="checkbox" name="declaration"> I confirm the information is correct and I will produce original documents during verification.</label><span class="err span-2" data-err="sdecl"></span>
  </div><div class="form-actions"><button class="btn btn-primary" type="submit">${icon("send")}Submit application</button></div><div class="form-msg" id="schMsg"></div></form>`;
};
Actions["scheme-tab"] = (el) => { S.ui.scheme.tab = el.dataset.tab; Router.render(); };
Actions["scheme-apply"] = async (form) => {
  const s = Schemes.all().find((x) => x.id === form.dataset.scheme); const isKalam = s.id === "scheme-kalam";
  const rules = { applicant_name: [req()], gender: [req(), [(x) => s.id === "scheme-savitribai" ? x === "Female" : s.id === "scheme-visvesvaraya" ? x === "Male" : true, `This scholarship is only for ${s.audience.toLowerCase()}.`]], department: [req()], semester: [req()], mobile: [req(), vMobile], email: [vEmail], statement: [req(), [(x) => x.length >= 50, "Please write at least 50 characters."]] };
  if (!isKalam) { rules.percentage = [req(), [(x) => Number(x) >= 70 && Number(x) <= 100, "Minimum 70% is required for this scholarship."]]; rules.family_income = [req(), [(x) => Number(x) >= 0 && Number(x) < 250000, "Family income must be below ₹2,50,000."]]; }
  else { rules.track = [req()]; rules.percentage = [[(x) => !x || (Number(x) >= 0 && Number(x) <= 100), "Enter a valid percentage."]]; }
  const v = validate(form, rules); if (!v) return;
  if (!v.declaration) { $('[data-err="sdecl"]').textContent = "Please confirm the declaration."; return; } $('[data-err="sdecl"]').textContent = "";
  const mob = normMobile(v.mobile);
  const dup = API.find("scheme_applications", (a) => a.scheme_id === s.id && a.mobile === mob && a.status !== "Rejected");
  if (dup) return formMsg($("#schMsg"), "error", "Already applied", `${dup.application_no} is ${dup.status.toLowerCase()} for this scheme.`);
  await busy(form.querySelector('[type="submit"]'), "Submitting…", async () => {
    try {
      const no = nextNo("scheme_applications", "application_no", `FAS-${new Date().getFullYear()}-`);
      await API.insert("scheme_applications", { application_no: no, scheme_id: s.id, applicant_name: v.applicant_name, gender: v.gender, department: v.department, semester: v.semester, percentage: v.percentage ? Number(v.percentage) : null, family_income: v.family_income ? Number(v.family_income) : 0, track: v.track || "", mobile: mob, email: v.email, statement: v.statement, status: "Submitted", remarks: "", submitted_at: new Date().toISOString(), user_id: S.profile ? S.profile.id : null });
      audit("Submitted scheme application", no); notify("admins", "scheme", "New scheme application", `${no} · ${s.name}`, "#admin/schemes");
      form.reset(); formMsg($("#schMsg"), "success", `Application ${no} submitted`, "Track it from the Status tab using the application number and mobile.");
      toast("success", "Scheme application submitted", no);
    } catch (e) { formMsg($("#schMsg"), "error", "Could not submit application.", e.message); }
  });
};
Actions["scheme-track"] = async (form) => {
  const v = validate(form, { application_no: [req()], mobile: [req(), vMobile] }); if (!v) return;
  await busy(form.querySelector('[type="submit"]'), "Checking…", async () => {
    await API.latency(350);
    const a = API.find("scheme_applications", (x) => x.application_no === v.application_no.trim().toUpperCase() && x.mobile === normMobile(v.mobile));
    if (!a) return formMsg($("#schTrackMsg"), "error", "No matching application", "Check the application number and mobile.");
    formMsg($("#schTrackMsg"), "info", `${a.application_no} · ${a.applicant_name}`, h`<div class="row" style="margin-top:6px">${statusPill(a.status)}</div>${a.remarks ? h`<div style="margin-top:6px">${a.remarks}</div>` : ""}`);
  });
};

/* =====================================================================
   NOTICES
   ===================================================================== */
const Notices = {
  isNew(n) { return (Date.now() - Date.parse(n.date)) / 86400000 <= 7; },
  filtered() {
    const f = S.ui.ntc; const q = (f.q || "").toLowerCase().trim(); const rank = { Urgent: 0, Important: 1, Normal: 2 };
    const list = API.all("notices").filter((n) => n.status === "Published" && (!q || [n.title, n.notice_no, n.description].join(" ").toLowerCase().includes(q)) && (!f.cat || n.category === f.cat) && (!f.pri || n.priority === f.pri));
    const s = { new: (a, b) => b.date.localeCompare(a.date), old: (a, b) => a.date.localeCompare(b.date), pri: (a, b) => rank[a.priority] - rank[b.priority] || b.date.localeCompare(a.date) };
    return list.sort(s[f.sort] || s.new);
  },
  flags(n) { return h`${n.priority === "Urgent" ? h`<span class="flag flag-urgent">${icon("alert", "ico ico-sm")}URGENT</span>` : ""}${n.priority === "Important" ? h`<span class="flag flag-important">${icon("star", "ico ico-sm")}IMPORTANT NOTICE</span>` : ""}${this.isNew(n) ? h`<span class="flag flag-new">NEW</span>` : ""}`; },
  list() {
    const all = this.filtered();
    if (!all.length) return emptyState("No notices found.", "Try another category or search.", "megaphone");
    return h`<div class="ntc-list">${all.map((n) => { const d = toDate(n.date); return h`<article class="glass ntc-card ${n.priority === "Urgent" ? "urgent" : n.priority === "Important" ? "important" : ""}">
      <span class="nc-date"><b>${d.getDate()}</b><span>${MONTHS[d.getMonth()]} ${d.getFullYear()}</span></span>
      <div class="nc-body"><div class="nc-tags">${this.flags(n)}<span class="chip slate">${n.category}</span><span class="small muted mono">${n.notice_no}</span></div><h3>${n.title}</h3><p>${n.description}</p>
        ${n.attachment_name ? h`<span class="nc-attach">${icon("file", "ico ico-sm")} ${n.attachment_name}</span>` : ""}</div>
      <div class="nc-actions"><button class="btn btn-ghost btn-sm" data-action="notice-view" data-id="${n.id}">${icon("eye", "ico ico-sm")}View</button><button class="btn btn-primary btn-sm" data-action="notice-download" data-id="${n.id}">${icon("download", "ico ico-sm")}Download</button></div></article>`; })}</div>`;
  }
};
Filters.ntc = () => setHTML($('[data-list="ntc"]'), Notices.list());
Views.notices = () => {
  const f = S.ui.ntc;
  return h`${pageHead({ eyebrow: "Official", title: "Notices", sub: "Circulars, announcements and official communication from Falakata Polytechnic Alumni Association." })}
    <div class="glass toolbar reveal">${searchFilter("ntc.q", f.q, "Search title, notice number…")}${selectFilter("ntc.cat", f.cat, NOTICE_CATEGORIES, "All categories")}${selectFilter("ntc.pri", f.pri, ["Urgent", "Important", "Normal"], "All priorities")}
      <select class="select" data-filter="ntc.sort" aria-label="Sort">${[["new", "Newest first"], ["old", "Oldest first"], ["pri", "Priority"]].map((o) => h`<option value="${o[0]}" ${raw(f.sort === o[0] ? "selected" : "")}>${o[1]}</option>`)}</select>
      <button class="btn btn-ghost btn-sm" data-action="clear-filters" data-group="ntc">${icon("x", "ico ico-sm")}Clear</button></div>
    <div data-list="ntc">${Notices.list()}</div>`;
};
Actions["notice-view"] = (el) => { const n = API.get("notices", el.dataset.id); if (!n) return; Modal.open({ title: n.title, eyebrow: n.notice_no, size: "lg", body: h`<div class="row" style="margin-bottom:12px">${Notices.flags(n)}<span class="chip slate">${n.category}</span></div><dl class="kv"><dt>Notice No.</dt><dd class="mono">${n.notice_no}</dd><dt>Date</dt><dd>${fmtDate(n.date)}</dd><dt>Category</dt><dd>${n.category}</dd><dt>Attachment</dt><dd>${n.attachment_name || "—"}</dd></dl><div class="divider"></div><p style="white-space:pre-wrap">${n.description}</p>`, foot: h`<button class="btn btn-ghost" data-action="modal-close">Close</button><button class="btn btn-primary" data-action="notice-download" data-id="${n.id}">${icon("download")}Download</button>` }); };
Actions["notice-download"] = (el) => {
  const n = API.get("notices", el.dataset.id); if (!n) return;
  if (n.attachment_data) { downloadDataUrl(n.attachment_name || n.notice_no + ".pdf", n.attachment_data); toast("success", "Download started", n.attachment_name); return; }
  const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(n.notice_no)}</title><style>body{font-family:Arial,sans-serif;max-width:720px;margin:40px auto;color:#0F2744;line-height:1.6}header{display:flex;gap:16px;align-items:center;border-bottom:3px solid #D7A52B;padding-bottom:12px}header b{font-size:18px;color:#15365F;display:block}header span{font-size:12px;letter-spacing:.12em;color:#5B6B82}.meta{display:flex;justify-content:space-between;margin:18px 0;font-size:14px}h1{font-size:22px;color:#15365F}footer{margin-top:60px;text-align:right}</style></head><body>
    <header><img src="${esc(absoluteUrl(CONFIG.LOGO_URL))}" width="64" height="64" alt=""><div><b>FALAKATA POLYTECHNIC ALUMNI ASSOCIATION</b><span>ESTD 2024 · FPAA CONNECT 2.0</span></div></header>
    <div class="meta"><span>Notice No.: <b>${esc(n.notice_no)}</b></span><span>Date: <b>${esc(fmtDate(n.date))}</b></span></div><h1>${esc(n.title)}</h1><p>${esc(n.description).replace(/\n/g, "<br>")}</p>${n.attachment_name ? `<p><i>Referenced attachment: ${esc(n.attachment_name)}</i></p>` : ""}<footer>General Secretary<br>Falakata Polytechnic Alumni Association</footer></body></html>`;
  downloadBlob(`${n.notice_no.replace(/\//g, "-")}.html`, doc, "text/html"); toast("success", "Notice downloaded", "Open the file and print or save as PDF.");
};
/* =====================================================================
   ABOUT — About Us, Vision, Goals, Core Values, Commitment
   ===================================================================== */
const ABOUT_TABS = [["about", "About Us", "info"], ["vision", "Our Vision", "target"], ["goals", "Association Goals", "layers"], ["values", "Core Values", "star"], ["commitment", "Our Commitment", "handshake"]];
Views.about = () => {
  const tab = S.ui.about || "about";
  const pillars = [
    ["users", "", "Alumni network", "A lifelong, verified network of diploma engineers across Electronics, Civil, Mechanical, Electrical and Food Processing Technology."],
    ["school", "violet", "Mentorship", "Alumni mentors guide current students on higher studies, competitive exams, internships and careers."],
    ["briefcase", "gold", "Career support", "A reviewed job board, referrals and interview preparation through the FPAA Career Cell."],
    ["bulb", "teal", "Knowledge sharing", "Seminars, workshops and industry talks that bring real-world practice back to the classroom."],
    ["building", "", "Institutional collaboration", "Working with Falakata Polytechnic on labs, syllabus feedback, placements and campus development."],
    ["heart", "gold", "Social initiatives", "Scholarships, blood donation camps, tree plantation and community programmes across the Dooars."],
    ["sparkles", "violet", "Alumni engagement", "Annual meets, reunions, achievements and memories that keep every batch connected."]
  ];
  let body;
  if (tab === "about") body = h`<h2>Falakata Polytechnic Alumni Association (FPAA)</h2>
    <p>Established in 2024, the Falakata Polytechnic Alumni Association brings together the pass-out students of Falakata Polytechnic, Alipurduar, West Bengal, into one organised and verified community. FPAA Connect 2.0 is the association's official digital platform — the single place for membership, the alumni directory, careers, events, donations, scholarships and member services.</p>
    <p>Our members work in government departments, private industry, their own enterprises and higher education institutions across India. Together we give back to the institution that shaped us and to the students who follow.</p>
    <div class="pillar-grid">${pillars.map((p) => h`<div class="pillar"><span class="ico-tile ${p[1]}">${icon(p[0])}</span><h4>${p[2]}</h4><p>${p[3]}</p></div>`)}</div>`;
  else if (tab === "vision") body = h`<h2>Our Vision</h2><p class="about-quote" style="font:700 1.15rem var(--font-head);color:var(--indigo)">To build a strong, lifelong and purposeful alumni community that connects the past, empowers the present and builds the future of Falakata Polytechnic and its students.</p>
    <div class="value-list">${[["globe", "A connected community", "Every alumnus, in every batch and department, reachable and recognised."], ["school", "Empowered students", "No meritorious student leaves education for want of guidance or funds."], ["building", "A stronger institution", "Alumni experience continuously enriching labs, curriculum and placements."]].map((v) => h`<div class="value-item"><span class="ico-tile soft">${icon(v[0])}</span><div><b>${v[1]}</b><p>${v[2]}</p></div></div>`)}</div>`;
  else if (tab === "goals") body = h`<h2>Association Goals</h2><div class="value-list">${[
      ["Build a verified alumni database", "Maintain accurate, privacy-protected records of all Falakata Polytechnic alumni with digital membership."],
      ["Support careers", "Share verified job opportunities, referrals and mentoring through the Career Cell."],
      ["Fund education", "Run the Falakata Alumni Scheme — Savitribai Fule and Sir M. Visvesvaraya Excellence Scholarships and the Dr. A.P.J. Abdul Kalam Youth Skill Development Programme."],
      ["Strengthen the institution", "Collaborate with Falakata Polytechnic on skill workshops, industry visits and infrastructure."],
      ["Engage and celebrate", "Organise alumni meets, recognise achievements and preserve shared memories."],
      ["Serve society", "Lead social initiatives in health, environment and community welfare across the Dooars region."]
    ].map((g, i) => h`<div class="value-item"><span class="ico-tile ${["", "gold", "violet", "teal", "", "gold"][i]}" style="font:800 1rem var(--font-head)">${i + 1}</span><div><b>${g[0]}</b><p>${g[1]}</p></div></div>`)}</div>`;
  else if (tab === "values") body = h`<h2>Core Values</h2><div class="pillar-grid">${[["shield", "Integrity", "Transparent finances, verified payments and an audit trail for every administrative action."], ["users", "Inclusion", "Every department, every batch, every alumnus — equal voice and equal access."], ["handshake", "Service", "We give our time, skills and resources to students and society."], ["award", "Excellence", "We celebrate merit and support one another to achieve more."], ["lock", "Privacy", "Member data is protected; contact details are never exposed publicly."], ["heart", "Gratitude", "We remember the institution and teachers who shaped us."]].map((v) => h`<div class="pillar"><span class="ico-tile soft">${icon(v[0])}</span><h4>${v[1]}</h4><p>${v[2]}</p></div>`)}</div>`;
  else body = h`<h2>Our Commitment</h2><p>FPAA commits to its members, to Falakata Polytechnic and to the wider community:</p>
    <ul class="sch-list">${["Every membership fee and donation is verified and reported transparently in finance reports.", "Every scholarship decision follows published eligibility, criteria and review by the Scheme Review Committee.", "Every job posting is reviewed by the Career Cell before it reaches members.", "Every member's personal information stays private and is used only for association work.", "Every support request receives a ticket number and a tracked reply."].map((c) => h`<li>${icon("check")}<span>${c}</span></li>`)}</ul>
    <div class="glass card" style="margin-top:18px;box-shadow:none"><div class="row" style="gap:14px"><span class="ico-tile gold">${icon("mail")}</span><div class="grow"><b>Contact FPAA</b><div class="small muted">${CONFIG.CONTACT_EMAIL} · ${CONFIG.CONTACT_PHONE}</div><div class="small muted">${CONFIG.CONTACT_ADDRESS}</div></div><button class="btn btn-ghost btn-sm" data-action="footer-contact">Contact details</button></div></div>`;
  return h`${pageHead({ eyebrow: "About FPAA", title: "ABOUT FPAA", sub: "Falakata Polytechnic Alumni Association — ESTD 2024." })}
    <section class="glass about-hero reveal"><div><span class="eyebrow">${icon("sparkles", "ico ico-sm")} Falakata Polytechnic · Alipurduar, West Bengal</span><h1 style="margin:8px 0 0">Falakata Polytechnic Alumni Association (FPAA)</h1>
      <p class="quote">“Connecting the Past. Empowering the Present. Building the Future.”</p>
      <div class="btn-group"><a class="btn btn-primary" href="#membership">${icon("idcard")}Become a member</a><a class="btn btn-ghost" href="#scheme">${icon("school")}Falakata Alumni Scheme</a></div></div>
      <img src="${CONFIG.LOGO_URL}" alt="FPAA emblem"></section>
    <div class="section"><div class="tabs reveal" role="tablist" aria-label="About sections">${ABOUT_TABS.map((t) => h`<button class="tab ${tab === t[0] ? "active" : ""}" role="tab" aria-selected="${String(tab === t[0])}" data-action="about-tab" data-tab="${t[0]}">${t[1]}</button>`)}</div></div>
    <section class="glass about-panel reveal" id="aboutPanel">${body}</section>`;
};
Actions["about-tab"] = (el) => { S.ui.about = el.dataset.tab; const y = window.scrollY; Router.render(); window.scrollTo(0, y); };
/* =====================================================================
   CHAT — FPAA community chat with DMs, presence, receipts, unread counts
   ===================================================================== */
const Chat = {
  replies: ["Sounds good! 👍", "Thanks for sharing.", "I'll check and get back to you.", "Great idea — count me in.", "Noted, thank you!", "Let's discuss at the Alumni Meet.", "Sure, happy to help.", "That's wonderful news!"],
  simCount: 0,
  me() { return myChatId(); },
  memberName(id) { const m = API.get("members", id); if (m) return m.full_name; const p = API.get("profiles", id); return p ? p.full_name : "FPAA Member"; },
  memberPhoto(id) { const m = API.get("members", id); return m ? m.photo : null; },
  presence(id) {
    if (id === this.me()) return "online";
    if (!S.chat.presence[id]) { const r = hashStr(id + new Date().getHours()) % 10; S.chat.presence[id] = r < 3 ? "online" : r < 5 ? "away" : "offline"; }
    return S.chat.presence[id];
  },
  convId(otherId) { return "dm:" + [this.me(), otherId].sort().join(":"); },
  otherOf(conv) { return conv.slice(3).split(":").find((x) => x !== this.me()); },
  messages(conv) { return API.all("member_chat_messages").filter((m) => m.conversation_id === conv).sort((a, b) => a.created_at.localeCompare(b.created_at)); },
  readBy(msgId, userId) { return API.all("chat_read_receipts").some((r) => r.message_id === msgId && r.user_id === userId); },
  unread(conv) { const me = this.me(); return this.messages(conv).filter((m) => m.sender_id !== me && !this.readBy(m.id, me)).length; },
  conversations() {
    const me = this.me(); const ids = uniq(API.all("member_chat_messages").map((m) => m.conversation_id)).filter((c) => c === "community" || (c.startsWith("dm:") && c.split(":").includes(me)));
    if (!ids.includes("community")) ids.unshift("community");
    return ids.map((id) => { const msgs = this.messages(id); return { id, last: msgs[msgs.length - 1], unread: this.unread(id) }; })
      .sort((a, b) => (b.last ? b.last.created_at : "").localeCompare(a.last ? a.last.created_at : ""));
  },
  totalUnread() { if (!hasMemberAccess()) return 0; return this.conversations().reduce((a, c) => a + c.unread, 0); },
  renderLauncher() {
    const l = $("#chatLauncher"); if (!l) return;
    const show = hasMemberAccess(); l.classList.toggle("hidden", !show); if (!show) return;
    const n = this.totalUnread();
    setHTML(l, h`${icon("chat")}<span class="lbl">Community Chat</span>${n ? h`<span class="badge">${n > 99 ? "99+" : n}</span>` : ""}`);
    l.setAttribute("aria-label", "Open community chat" + (n ? `, ${n} unread` : ""));
  },
  open(conv) {
    if (!hasMemberAccess()) { S.ui.accessMsg = { module: "Community Chat", reason: isSignedIn() ? "membership" : "signin" }; Router.go("#my-fpaa"); return; }
    if (conv) S.chat.conv = conv;
    document.body.classList.add("chat-open"); $("#chatWindow").setAttribute("aria-hidden", "false");
    if (conv && window.innerWidth <= 860) $("#chatWindow").classList.add("show-conv");
    this.render(); this.markRead(S.chat.conv);
    setTimeout(() => { const t = $("#chatInput"); if (t && window.innerWidth > 860) t.focus(); }, 250);
  },
  close() { document.body.classList.remove("chat-open"); $("#chatWindow").setAttribute("aria-hidden", "true"); $("#chatWindow").classList.remove("show-conv"); this.renderLauncher(); },
  markRead(conv) {
    const me = this.me(); let changed = false;
    this.messages(conv).forEach((m) => { if (m.sender_id !== me && !this.readBy(m.id, me)) { S.db.chat_read_receipts.push({ id: uuid(), message_id: m.id, user_id: me, read_at: new Date().toISOString() }); changed = true; } });
    if (changed) { try { API.persist(); } catch (e) { /* ignore */ } this.renderLauncher(); this.renderSide(); }
  },
  convTitle(conv) { return conv === "community" ? "FPAA Community" : this.memberName(this.otherOf(conv)); },
  sideList() {
    const q = (S.chat.q || "").toLowerCase();
    if (S.chat.tab === "members") {
      const list = API.all("members").filter((m) => m.status === "Active" && m.id !== this.me() && (!q || m.full_name.toLowerCase().includes(q) || m.department.toLowerCase().includes(q)))
        .sort((a, b) => ({ online: 0, away: 1, offline: 2 }[this.presence(a.id)] - { online: 0, away: 1, offline: 2 }[this.presence(b.id)]) || a.full_name.localeCompare(b.full_name)).slice(0, 80);
      if (!list.length) return h`<p class="small muted" style="padding:12px">No members found.</p>`;
      return list.map((m) => h`<button class="chat-item" data-action="chat-dm" data-id="${m.id}"><span class="presence ${this.presence(m.id)}">${avatar(m.full_name, m.photo, "sm")}</span><span class="ci-body"><span class="ci-top"><b>${m.full_name}</b><span>${this.presence(m.id)}</span></span><span class="ci-last"><span>${m.department} · ${m.passing_year}</span></span></span></button>`);
    }
    const convs = this.conversations().filter((c) => !q || this.convTitle(c.id).toLowerCase().includes(q));
    return convs.map((c) => { const title = this.convTitle(c.id); const other = c.id === "community" ? null : this.otherOf(c.id);
      return h`<button class="chat-item ${c.id === S.chat.conv ? "active" : ""}" data-action="chat-conv" data-conv="${c.id}">
        ${c.id === "community" ? h`<span class="ico-tile" style="width:34px;height:34px;border-radius:50%">${icon("users", "ico ico-sm")}</span>` : h`<span class="presence ${this.presence(other)}">${avatar(title, this.memberPhoto(other), "sm")}</span>`}
        <span class="ci-body"><span class="ci-top"><b>${title}</b><span>${c.last ? fmtTime(c.last.created_at) : ""}</span></span><span class="ci-last"><span>${c.last ? (c.last.sender_id === this.me() ? "You: " : c.id === "community" ? c.last.sender_name.split(" ")[0] + ": " : "") + c.last.body : "No messages yet"}</span>${c.unread ? h`<span class="badge">${c.unread}</span>` : ""}</span></span></button>`; });
  },
  renderSide() { const el = $("#chatList"); if (el) setHTML(el, this.sideList()); },
  msgsHTML() {
    const conv = S.chat.conv; const msgs = this.messages(conv); const me = this.me();
    if (!msgs.length) return h`<div class="chat-empty"><div><span class="ico-tile soft" style="margin:0 auto 10px">${icon("chat")}</span><b>Say hello 👋</b><p class="small">Messages in this conversation are visible only to FPAA members.</p></div></div>`;
    let lastDay = ""; const out = [];
    msgs.forEach((m) => {
      const day = fmtDate(m.created_at); if (day !== lastDay) { out.push(h`<div class="day-sep">${day === fmtDate(new Date()) ? "Today" : day}</div>`); lastDay = day; }
      const mine = m.sender_id === me;
      let ticks = "";
      if (mine) { const others = API.all("chat_read_receipts").filter((r) => r.message_id === m.id && r.user_id !== me); const read = others.length > 0; ticks = h`<svg class="ticks ${read ? "read" : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-label="${read ? "Read" : "Delivered"}">${raw(ICON_PATHS.checks)}</svg>`; }
      out.push(h`<div class="msg ${mine ? "me" : ""}"><div class="mb">${!mine && conv === "community" ? h`<span class="from">${m.sender_name}</span>` : ""}${m.body}</div><div class="mt">${fmtTime(m.created_at)}${ticks}</div></div>`);
    });
    return out;
  },
  headHTML() {
    const conv = S.chat.conv;
    if (conv === "community") { const online = API.all("members").filter((m) => m.status === "Active" && this.presence(m.id) === "online").length; return h`<button class="icon-btn chat-back" data-action="chat-back" aria-label="Back to conversations">${icon("arrowL")}</button><span class="ico-tile" style="width:40px;height:40px;border-radius:50%">${icon("users")}</span><div class="ch-who"><b>FPAA Community</b><span>${fmtNum(online)} members online</span></div><button class="icon-btn" data-action="chat-close" aria-label="Close chat">${icon("x")}</button>`; }
    const other = this.otherOf(conv); const name = this.memberName(other); const typing = S.chat.typing[conv];
    return h`<button class="icon-btn chat-back" data-action="chat-back" aria-label="Back to conversations">${icon("arrowL")}</button><span class="presence ${this.presence(other)}">${avatar(name, this.memberPhoto(other), "sm")}</span><div class="ch-who"><b>${name}</b><span class="${typing ? "typing" : ""}">${typing ? "typing…" : this.presence(other) === "online" ? "Online" : this.presence(other) === "away" ? "Away" : "Offline"}</span></div><button class="icon-btn" data-action="chat-close" aria-label="Close chat">${icon("x")}</button>`;
  },
  render() {
    const w = $("#chatWindow");
    setHTML(w, h`<aside class="chat-side"><div class="chat-side-head"><div class="row-between"><h3>Messages</h3><button class="icon-btn" data-action="chat-close" aria-label="Close chat" style="width:36px;height:36px">${icon("x")}</button></div>
        <div class="tabs"><button class="tab ${S.chat.tab !== "members" ? "active" : ""}" data-action="chat-tab" data-tab="chats">Chats</button><button class="tab ${S.chat.tab === "members" ? "active" : ""}" data-action="chat-tab" data-tab="members">Members</button></div>
        <label class="input-icon">${icon("search")}<input class="input" id="chatSearch" type="search" placeholder="Search…" value="${S.chat.q}" aria-label="Search chats"></label></div>
        <div class="chat-list" id="chatList">${this.sideList()}</div></aside>
      <section class="chat-main"><header class="chat-head" id="chatHead">${this.headHTML()}</header><div class="chat-msgs" id="chatMsgs" aria-live="polite">${this.msgsHTML()}</div>
        <form class="chat-compose" data-submit="chat-send"><label class="sr-only" for="chatInput">Message</label><textarea class="textarea" id="chatInput" rows="1" maxlength="1000" placeholder="Write a message…"></textarea><button class="btn btn-primary" type="submit" aria-label="Send message">${icon("send")}</button></form></section>`);
    const s = $("#chatSearch"); s.addEventListener("input", debounce(() => { S.chat.q = s.value; this.renderSide(); }, 150));
    const t = $("#chatInput"); t.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); t.form.requestSubmit(); } });
    t.addEventListener("input", () => { t.style.height = "auto"; t.style.height = Math.min(120, t.scrollHeight) + "px"; });
    this.scrollBottom();
  },
  refreshConv() { const m = $("#chatMsgs"); if (!m) return; setHTML(m, this.msgsHTML()); setHTML($("#chatHead"), this.headHTML()); this.renderSide(); this.scrollBottom(); },
  scrollBottom() { const m = $("#chatMsgs"); if (m) m.scrollTop = m.scrollHeight; },
  send(body) {
    const me = this.me(); const conv = S.chat.conv;
    const msg = API.quiet("member_chat_messages", { conversation_id: conv, sender_id: me, sender_name: S.member ? S.member.full_name : S.profile.full_name, body });
    this.refreshConv();
    // Realtime-style simulation (demo mode): recipients read, type and reply
    if (API.mode !== "demo") return;
    const other = conv === "community" ? API.all("members").filter((m) => m.status === "Active" && m.id !== me)[Math.floor(Math.random() * 100)] : API.get("members", this.otherOf(conv));
    if (!other) return;
    setTimeout(() => { API.quiet("chat_read_receipts", { message_id: msg.id, user_id: other.id, read_at: new Date().toISOString() }); if (document.body.classList.contains("chat-open") && S.chat.conv === conv) this.refreshConv(); }, 1400);
    if (conv !== "community" || Math.random() < 0.5) {
      setTimeout(() => { S.chat.typing[conv] = true; if (S.chat.conv === conv) setHTML($("#chatHead"), this.headHTML()); }, 1900);
      setTimeout(() => {
        S.chat.typing[conv] = false; S.chat.presence[other.id] = "online";
        API.quiet("member_chat_messages", { conversation_id: conv, sender_id: other.id, sender_name: other.full_name, body: this.replies[Math.floor(Math.random() * this.replies.length)] });
        if (document.body.classList.contains("chat-open") && S.chat.conv === conv) { this.refreshConv(); this.markRead(conv); } else { this.renderLauncher(); toast("info", "New message from " + other.full_name, "", 2500); }
      }, 3600 + Math.random() * 1500);
    }
  },
  onExternalUpdate() { if (document.body.classList.contains("chat-open")) this.refreshConv(); this.renderLauncher(); },
  tickPresence() { Object.keys(S.chat.presence).forEach((k) => { if (Math.random() < 0.15) S.chat.presence[k] = ["online", "away", "offline"][Math.floor(Math.random() * 3)]; }); if (document.body.classList.contains("chat-open")) { this.renderSide(); setHTML($("#chatHead"), this.headHTML()); } }
};
Actions["chat-open"] = () => Chat.open();
Actions["chat-close"] = () => Chat.close();
Actions["chat-tab"] = (el) => { S.chat.tab = el.dataset.tab; Chat.render(); };
Actions["chat-conv"] = (el) => { S.chat.conv = el.dataset.conv; $("#chatWindow").classList.add("show-conv"); Chat.refreshConv(); Chat.markRead(S.chat.conv); };
Actions["chat-back"] = () => { $("#chatWindow").classList.remove("show-conv"); Chat.renderSide(); };
Actions["chat-dm"] = (el) => { Modal.close(); S.chat.tab = "chats"; Chat.open(Chat.convId(el.dataset.id)); $("#chatWindow").classList.add("show-conv"); };
Actions["chat-send"] = (form) => { const t = $("#chatInput"); const body = t.value.trim(); if (!body) { t.focus(); return; } if (body.length > 1000) return toast("error", "Message too long", "Keep messages under 1000 characters."); t.value = ""; t.style.height = "auto"; Chat.send(body); t.focus(); };

/* =====================================================================
   SUPPORT — member tickets with threaded replies
   ===================================================================== */
const Support = {
  replies(id) { return API.all("support_replies").filter((r) => r.ticket_id === id).sort((a, b) => a.created_at.localeCompare(b.created_at)); },
  thread(t) {
    const rs = this.replies(t.id); const meIsAdminView = can("admin.support");
    if (!rs.length) return emptyState("No messages yet.", "", "chat");
    return h`<div class="thread" id="ticketThread">${rs.map((r) => { const mine = meIsAdminView ? r.author_role === "admin" : r.author_role !== "admin"; return h`<div class="bubble ${mine ? "me" : ""}">${r.message}<div class="meta">${r.author_role === "admin" ? r.author_name || "FPAA Support" : r.author_name} · ${fmtDateTime(r.created_at)}</div></div>`; })}</div>`;
  }
};
Actions["support-new"] = () => {
  if (!isSignedIn()) { Modal.close(); location.href = "login.html?next=my-fpaa"; return; }
  Modal.open({ title: "New support request", eyebrow: "Member service", body: h`<form data-submit="support-create" novalidate><div class="stack">
    ${field({ label: "Subject", name: "subject", required: true, attrs: 'maxlength="120"' })}${field({ label: "Category", name: "category", required: true, options: SUPPORT_CATEGORIES, placeholder: "Select category" })}
    ${field({ label: "Message", name: "message", type: "textarea", required: true, placeholder: "Describe your request. Include application, donation or membership numbers if relevant.", attrs: 'maxlength="1500"' })}</div>
    <div class="form-actions"><button type="button" class="btn btn-ghost" data-action="modal-close">Cancel</button><button class="btn btn-primary" type="submit">${icon("send")}Submit request</button></div></form>` });
};
Actions["support-create"] = async (form) => {
  const v = validate(form, { subject: [req()], category: [req()], message: [req(), [(x) => x.length >= 10, "Please add a few more details."]] }); if (!v) return;
  await busy(form.querySelector('[type="submit"]'), "Submitting…", async () => {
    try {
      const no = nextNo("support_requests", "ticket_no", `SUP-${new Date().getFullYear()}-`); const now = new Date().toISOString();
      const t = await API.insert("support_requests", { ticket_no: no, user_id: S.profile.id, requester_name: S.profile.full_name, requester_email: S.profile.email, subject: v.subject, category: v.category, status: "Open", assigned_to: v.category === "Payment" ? "Finance Committee" : "Registration Committee", created_at: now, updated_at: now });
      API.quiet("support_replies", { ticket_id: t.id, author_name: S.profile.full_name, author_role: "member", message: v.message, created_at: now });
      API.quiet("support_replies", { ticket_id: t.id, author_name: "FPAA Support (auto-reply)", author_role: "admin", message: `Thank you. Your request ${no} has been received and assigned to the ${t.assigned_to}. We usually reply within 2 working days.`, created_at: new Date(Date.now() + 1000).toISOString() });
      notify("admins", "support", "New support request", `${no} · ${v.subject}`, "#admin/support"); audit("Created support request", no);
      Modal.close(); toast("success", "Support request created", no); if (S.route.name === "my-fpaa") Router.render();
    } catch (e) { toast("error", "Could not create support request.", e.message); }
  });
};
Actions["ticket-view"] = (el) => {
  const t = API.get("support_requests", el.dataset.id); if (!t) return;
  const admin = can("admin.support"); if (!admin && (!S.profile || t.user_id !== S.profile.id)) return toast("error", "Not available");
  const open = t.status !== "Closed";
  Modal.open({ title: t.subject, eyebrow: `${t.ticket_no} · ${t.category}`, size: "lg",
    body: h`<div class="row" style="margin-bottom:12px">${statusPill(t.status)}<span class="chip slate">Assigned: ${t.assigned_to || "—"}</span><span class="small muted">Opened ${fmtDateTime(t.created_at)} by ${t.requester_name}</span></div>
      ${admin ? h`<div class="form-grid" style="margin-bottom:14px">${field({ label: "Status", name: "t_status", options: SUPPORT_STATUSES, value: t.status, attrs: 'data-ticket-field="status"' })}${field({ label: "Category", name: "t_category", options: SUPPORT_CATEGORIES, value: t.category, attrs: 'data-ticket-field="category"' })}${field({ label: "Assigned to", name: "t_assign", options: ["Registration Committee", "Finance Committee", "Content Admin", "Super Admin"], value: t.assigned_to, attrs: 'data-ticket-field="assigned_to"' })}</div>` : ""}
      ${Support.thread(t)}
      ${open ? h`<form data-submit="ticket-reply" data-id="${t.id}" novalidate style="margin-top:14px"><div class="field"><label for="tReply">Reply</label><textarea class="textarea" id="tReply" name="message" rows="3" maxlength="1500" placeholder="Write a reply…"></textarea><span class="err"></span></div><div class="form-actions"><button class="btn btn-primary" type="submit">${icon("send")}Send reply</button></div></form>` : alertBox("info", "This ticket is closed.", admin ? "Change the status to reopen it." : "Create a new support request if you need more help.")}`,
    foot: h`${admin && open ? h`<button class="btn btn-danger" data-action="ticket-close" data-id="${t.id}">${icon("ban")}Close ticket</button>` : ""}<button class="btn btn-ghost" data-action="modal-close">Close</button>`,
    onMount: (m) => {
      const th = m.querySelector("#ticketThread"); if (th) th.scrollTop = th.scrollHeight;
      $$("[data-ticket-field]", m).forEach((sel) => sel.addEventListener("change", async () => {
        try { const patch = { [sel.dataset.ticketField]: sel.value, updated_at: new Date().toISOString() }; await API.update("support_requests", t.id, patch); audit(`Updated ticket ${sel.dataset.ticketField}`, t.ticket_no);
          if (t.user_id && sel.dataset.ticketField === "status") notify(t.user_id, "support", `${t.ticket_no} is now ${sel.value}`, t.subject, "#my-fpaa");
          toast("success", "Ticket updated", `${sel.dataset.ticketField.replace("_", " ")}: ${sel.value}`); if (S.route.name === "admin") Admin.rerender(); }
        catch (e) { toast("error", "Could not update ticket.", e.message); }
      }));
    } });
};
Actions["ticket-reply"] = async (form) => {
  const v = validate(form, { message: [req("Write a reply first.")] }); if (!v) return;
  const t = API.get("support_requests", form.dataset.id); const admin = can("admin.support");
  await busy(form.querySelector('[type="submit"]'), "Sending…", async () => {
    try {
      await API.insert("support_replies", { ticket_id: t.id, author_name: admin ? `${S.profile.full_name} (${ROLES[S.profile.role]})` : S.profile.full_name, author_role: admin ? "admin" : "member", message: v.message });
      const patch = { updated_at: new Date().toISOString() }; if (admin && t.status === "Open") patch.status = "In Progress"; if (!admin && t.status === "Resolved") patch.status = "Open";
      await API.update("support_requests", t.id, patch);
      if (admin && t.user_id) notify(t.user_id, "support", `Reply on ${t.ticket_no}`, "The FPAA team replied to your support request.", "#my-fpaa");
      if (!admin) notify("admins", "support", `Member replied on ${t.ticket_no}`, t.subject, "#admin/support");
      audit("Replied to ticket", t.ticket_no); toast("success", "Reply sent");
      Actions["ticket-view"]({ dataset: { id: t.id } }); if (S.route.name === "my-fpaa" || S.route.name === "admin") setTimeout(() => { if (S.route.name === "admin") Admin.rerender(); }, 0);
    } catch (e) { toast("error", "Could not send reply.", e.message); }
  });
};
Actions["ticket-close"] = async (el) => {
  const t = API.get("support_requests", el.dataset.id);
  await busy(el, "Closing…", async () => { await API.update("support_requests", t.id, { status: "Closed", updated_at: new Date().toISOString() }); audit("Closed ticket", t.ticket_no); if (t.user_id) notify(t.user_id, "support", `${t.ticket_no} closed`, t.subject, "#my-fpaa"); });
  Modal.close(); toast("success", "Ticket closed", t.ticket_no); if (S.route.name === "admin") Admin.rerender();
};

/* =====================================================================
   NOTIFICATIONS — notification center
   ===================================================================== */
const Notifications = {
  visible() {
    if (!S.profile) return [];
    return API.all("notifications").filter((n) => !n.user_id || n.user_id === S.profile.id || (n.user_id === "admins" && isAdmin())).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  isRead(n) { return (n.read_by || []).includes(S.profile.id); },
  unreadCount() { return this.visible().filter((n) => !this.isRead(n)).length; },
  icon(t) { return { membership: ["idcard", ""], donation: ["heart", "gold"], event: ["calendar", "violet"], job: ["briefcase", ""], support: ["support", "teal"], notice: ["megaphone", "gold"], achievement: ["trophy", "gold"], scheme: ["school", "violet"], memory: ["image", "teal"] }[t] || ["bell", ""]; },
  body() {
    const list = this.visible();
    if (!list.length) return emptyState("No notifications.", "You're all caught up.", "bell");
    return h`<div class="notif-list">${list.map((n) => { const [ic, tone] = this.icon(n.type); const unread = !this.isRead(n); return h`<button class="notif ${unread ? "unread" : ""}" data-action="notif-read" data-id="${n.id}"><span class="ico-tile ${tone}">${icon(ic, "ico ico-sm")}</span><span class="n-body"><b>${n.title}</b><p>${n.message}</p><span class="n-meta"><span class="chip slate">${n.type}</span><span>${fmtDateTime(n.created_at)}</span>${n.link ? h`<span style="color:var(--blue)">Open ${icon("chevR", "ico ico-sm")}</span>` : ""}</span></span>${unread ? h`<span class="dot" aria-label="Unread"></span>` : ""}</button>`; })}</div>`;
  },
  async mark(ids) {
    const me = S.profile.id;
    for (const n of API.all("notifications").filter((x) => ids.includes(x.id))) { if (!(n.read_by || []).includes(me)) n.read_by = (n.read_by || []).concat(me); }
    if (API.mode === "supabase") for (const id of ids) { const n = API.get("notifications", id); await supabaseClient.from("notifications").update({ read_by: n.read_by }).eq("id", id); }
    else API.persist();
    refreshBadges();
  }
};
Actions["notif-open"] = () => {
  const n = Notifications.unreadCount();
  Modal.open({ title: "Notifications", eyebrow: n ? `${n} unread` : "All caught up", size: "lg", body: h`<div id="notifBody">${Notifications.body()}</div>`,
    foot: h`<button class="btn btn-ghost" data-action="modal-close">Close</button><button class="btn btn-primary" data-action="notif-read-all" ${raw(n ? "" : "disabled")}>${icon("checks")}Mark all as read</button>` });
};
Actions["notif-read"] = async (el) => {
  const n = API.get("notifications", el.dataset.id); if (!n) return;
  await Notifications.mark([n.id]);
  if (n.link) { Modal.close(); Router.go(n.link); } else setHTML($("#notifBody"), Notifications.body());
};
Actions["notif-read-all"] = (el) => busy(el, "Updating…", async () => { await Notifications.mark(Notifications.visible().map((n) => n.id)); setHTML($("#notifBody"), Notifications.body()); toast("success", "All notifications marked as read"); });
/* =====================================================================
   ADMIN — role-based administration dashboard
   ===================================================================== */
const ADMIN_PANELS = [
  { id: "overview", label: "Dashboard Overview", icon: "chart", group: "Overview", perm: "admin.overview" },
  { id: "applications", label: "Membership Applications", icon: "file", group: "Membership Review & Approval", perm: "admin.applications", badge: () => API.all("membership_applications").filter((a) => ["Pending", "Under Review"].includes(a.status)).length },
  { id: "members", label: "Members Database", icon: "users", group: "Membership Review & Approval", perm: "admin.members" },
  { id: "schemes", label: "Falakata Alumni Scheme Management", icon: "school", group: "Scheme Review & Approval", perm: "admin.schemes", badge: () => API.all("scheme_applications").filter((a) => ["Submitted", "Under Review"].includes(a.status)).length },
  { id: "careers", label: "Career & Jobs Review", icon: "briefcase", group: "Career Review & Approval", perm: "admin.careers", badge: () => API.all("job_postings").filter((j) => j.status === "Pending").length },
  { id: "payments", label: "Membership Payment Verification", icon: "rupee", group: "Finance Review & Verification", perm: "admin.payments", badge: () => API.all("payments").filter((p) => p.status === "Pending").length },
  { id: "donations", label: "Donation Verification", icon: "heart", group: "Finance Review & Verification", perm: "admin.donations", badge: () => API.all("donations").filter((d) => d.status === "Pending").length },
  { id: "finance", label: "Finance & Reports", icon: "pie", group: "Finance Review & Verification", perm: "admin.finance" },
  { id: "support", label: "Support Requests", icon: "support", group: "Support & Member Service", perm: "admin.support", badge: () => API.all("support_requests").filter((t) => t.status === "Open").length },
  { id: "feed", label: "Dashboard Feed & Gallery", icon: "image", group: "Content Management", perm: "admin.content" },
  { id: "events", label: "Events", icon: "calendar", group: "Content Management", perm: "admin.content" },
  { id: "notices", label: "Notices", icon: "megaphone", group: "Content Management", perm: "admin.content" },
  { id: "achievements", label: "Achievements", icon: "trophy", group: "Content Management", perm: "admin.content", badge: () => API.all("achievements").filter((a) => a.status === "Pending").length },
  { id: "memories", label: "Memories", icon: "layers", group: "Content Management", perm: "admin.content", badge: () => API.all("memories").filter((m) => m.status === "Pending").length },
  { id: "notifications", label: "Notifications", icon: "bell", group: "Content Management", perm: "admin.content" },
  { id: "accounts", label: "Create Alumni Accounts", icon: "userPlus", group: "Super Admin", perm: "admin.accounts" }
];
const uiOf = (g, defaults = {}) => { if (!S.ui[g]) S.ui[g] = Object.assign({ page: 1 }, defaults); return S.ui[g]; };
function paginate(group, rows, per = 12) {
  const u = uiOf(group); const pages = Math.max(1, Math.ceil(rows.length / per)); const page = Math.min(Math.max(1, Number(u.page) || 1), pages); u.page = page;
  return { slice: rows.slice((page - 1) * per, page * per), pager: pager(group, page, pages, rows.length, per) };
}
function admTable(cols, rows, { wide = false, tall = false, empty = "No data available." } = {}) {
  if (!rows.length) return emptyState(empty, "Adjust filters or add a new record.", "table");
  return h`<div class="table-wrap ${tall ? "tall" : ""}"><table class="data-table ${wide ? "wide" : ""}"><thead><tr>${cols.map((c) => h`<th>${c.label}</th>`)}</tr></thead><tbody>${rows.map((r) => h`<tr>${cols.map((c) => h`<td class="${c.cls || ""}">${c.render(r)}</td>`)}</tr>`)}</tbody></table></div>`;
}
function ab(action, id, label, ic, cls = "btn-ghost", extra = "") { return h`<button class="btn ${cls} btn-xs" data-action="${action}" data-id="${id}" ${raw(extra)}>${ic ? icon(ic, "ico ico-sm") : ""}${label}</button>`; }
function admToolbar(parts, count = "") { return h`<div class="glass toolbar">${parts}${count ? h`<span class="count">${count}</span>` : ""}</div>`; }
function sortSelect(group, value, opts) { return h`<select class="select" data-filter="${group}.sort" aria-label="Sort">${opts.map((o) => h`<option value="${o[0]}" ${raw(value === o[0] ? "selected" : "")}>${o[1]}</option>`)}</select>`; }
function textMatch(q, parts) { q = (q || "").toLowerCase().trim(); return !q || parts.join(" ").toLowerCase().includes(q); }
function sortBy(rows, key, dir = "desc") { return rows.slice().sort((a, b) => { const x = a[key] ?? "", y = b[key] ?? ""; return (typeof x === "number" ? x - y : String(x).localeCompare(String(y))) * (dir === "desc" ? -1 : 1); }); }
function applySort(rows, sort, map) { const [k, d] = (map[sort] || map[Object.keys(map)[0]]); return sortBy(rows, k, d); }

const Admin = {
  panel() { const p = S.route.param || "overview"; return ADMIN_PANELS.find((x) => x.id === p) || ADMIN_PANELS[0]; },
  rerender() { if (S.route.name === "admin") Router.render(); },
  nav(current) {
    let g = null; const out = [];
    ADMIN_PANELS.forEach((p) => { if (!can(p.perm)) return; if (p.group !== g) { g = p.group; out.push(h`<div class="grp">${g}</div>`); } const b = p.badge ? p.badge() : 0;
      out.push(h`<a class="adm-link ${p.id === current ? "active" : ""}" href="#admin/${p.id}">${icon(p.icon)}<span>${p.label}</span>${b ? h`<span class="badge">${b}</span>` : ""}</a>`); });
    return out;
  },
  listRender(group, fn) { Filters[group] = () => setHTML($(`[data-list="${group}"]`), fn()); return h`<div data-list="${group}">${fn()}</div>`; }
};
Views.admin = () => {
  const p = Admin.panel(); const allowed = can(p.perm);
  const content = allowed ? (AdminPanels[p.id] || AdminPanels.overview)() : alertBox("warn", "Restricted", `Your role (${ROLES[S.profile.role]}) does not have access to ${p.label}. Normal admins cannot use Super Admin controls.`);
  return h`${pageHead({ eyebrow: "Administration", title: "Admin Dashboard", sub: "Review applications, verify payments and donations, manage content and support members — actions available depend on your committee role." })}
    <div class="glass role-banner reveal"><span class="ico-tile gold">${icon("shield")}</span><div class="grow"><b>${S.profile.full_name}</b> <span class="chip gold">${ROLES[S.profile.role]}</span><div class="small muted">Access: ${ADMIN_PANELS.filter((x) => can(x.perm)).length} of ${ADMIN_PANELS.length} admin modules · all actions are recorded in the audit log</div></div></div>
    <div class="adm-layout"><nav class="glass adm-nav" aria-label="Admin sections">${Admin.nav(p.id)}</nav>
      <div class="adm-panel reveal"><div class="section-head" style="margin-bottom:14px"><div><span class="eyebrow">${icon(p.icon, "ico ico-sm")} ${p.group}</span><h2>${p.label}</h2></div></div>${content}</div></div>`;
};
Mounts.admin = () => { bindChartHover($("#view")); bindFilePreviews($("#view")); const ap = Admin.panel(); if (can(ap.perm) && AdminMounts[ap.id]) AdminMounts[ap.id](); };

const AdminPanels = {}; const AdminMounts = {};

/* ---------- Overview ---------- */
AdminPanels.overview = () => {
  const ms = API.all("members"); const apps = API.all("membership_applications"); const pays = API.all("payments"); const dons = API.all("donations");
  const tickets = API.all("support_requests"); const evs = API.all("events"); const jobs = API.all("job_postings");
  const card = (ic, tone, label, value, sub, link) => h`<a class="glass stat-card card-lift" href="${link}" style="text-decoration:none"><span class="ico-tile ${tone}">${icon(ic)}</span><div class="sc-body"><div class="sc-label">${label}</div><div class="sc-value">${value}</div><div class="sc-sub">${sub}</div></div></a>`;
  const appSeg = APP_STATUSES.map((s, i) => ({ label: s, value: apps.filter((a) => a.status === s).length, color: ["#D7A52B", "#3B82F6", "#6366F1", "#DC2626", "#16A34A"][i] }));
  const months = Reports.lastMonths(6); const fin = Reports.monthly(months, {});
  return h`<div class="adm-stat-grid">
      ${card("users", "", "Total Members", fmtNum(ms.length), `${ms.filter((m) => m.status === "Inactive").length} inactive`, "#admin/members")}
      ${card("shield", "teal", "Active Members", fmtNum(ms.filter((m) => m.status === "Active").length), "Verified & active", "#admin/members")}
      ${card("file", "gold", "Pending Applications", apps.filter((a) => ["Pending", "Under Review"].includes(a.status)).length, `${apps.length} total applications`, "#admin/applications")}
      ${card("rupee", "violet", "Pending Payments", pays.filter((p) => p.status === "Pending").length, fmtINR(sum(pays.filter((p) => p.status === "Pending"), (p) => p.amount)) + " awaiting", "#admin/payments")}
      ${card("heart", "", "Donations", fmtINR(sum(dons.filter((d) => d.status === "Verified"), (d) => d.amount)), `${dons.filter((d) => d.status === "Pending").length} pending verification`, "#admin/donations")}
      ${card("support", "teal", "Support Requests", tickets.filter((t) => ["Open", "In Progress"].includes(t.status)).length, `${tickets.length} total tickets`, "#admin/support")}
      ${card("calendar", "violet", "Events", evs.length, `${evs.filter((e) => e.date >= isoDay(new Date())).length} upcoming`, "#admin/events")}
      ${card("briefcase", "gold", "Jobs", jobs.filter((j) => j.status === "Published").length, `${jobs.filter((j) => j.status === "Pending").length} awaiting approval`, "#admin/careers")}
    </div>
    <div class="grid grid-2 section">
      <div class="glass card"><div class="card-head"><div><span class="eyebrow">Applications</span><h3>Applications by status</h3></div></div>${donutChart("aps", appSeg, apps.length, "Total")}</div>
      <div class="glass card"><div class="card-head"><div><span class="eyebrow">Finance</span><h3>Verified revenue — last 6 months</h3></div></div>${barChart(months.map((m) => m.label), [{ name: "Membership", color: "#3B82F6", values: fin.map((x) => x.membership) }, { name: "Donations", color: "#D7A52B", values: fin.map((x) => x.donation) }], { money: true })}</div>
    </div>
    <div class="grid grid-2 section">
      <div class="glass card"><div class="card-head"><div><span class="eyebrow">Members</span><h3>Members by department</h3></div></div>${donutChart("amd", Stats.deptSegments(), ms.length, "Members")}</div>
      <div class="glass card"><div class="card-head"><div><span class="eyebrow">Audit log</span><h3>Recent activity</h3></div>${API.mode === "demo" && can("admin.accounts") ? h`<button class="btn btn-ghost btn-sm" data-action="adm-reset-demo">${icon("refresh", "ico ico-sm")}Reset demo data</button>` : ""}</div>
        <div class="audit-list">${sortBy(API.all("audit_logs"), "created_at").slice(0, 10).map((a) => h`<div class="al"><span class="when">${relTime(a.created_at)}</span><span class="what"><b>${a.actor}</b> — ${a.action} <span class="mono small">${a.entity_ref || ""}</span></span></div>`)}</div></div>
    </div>`;
};
Actions["adm-reset-demo"] = async (el) => { if (!(await confirmDialog({ title: "Reset demo data?", message: "All demo records, uploads and changes in this browser will be replaced with fresh sample data. You will be signed out.", confirmText: "Reset data", danger: true }))) return; await API.resetDemo(); Auth.clearSession(); location.href = "login.html"; };

/* ---------- Membership applications ---------- */
AdminPanels.applications = () => {
  const u = uiOf("aApps", { sort: "new" });
  return h`${admToolbar(h`${searchFilter("aApps.q", u.q, "Search name, application no., mobile…")}${selectFilter("aApps.status", u.status, APP_STATUSES, "All statuses")}${selectFilter("aApps.cat", u.cat, CATEGORIES.map((c) => c.name), "All categories")}${selectFilter("aApps.pay", u.pay, ["Pending", "Verified", "Rejected"], "Payment status")}
    ${sortSelect("aApps", u.sort, [["new", "Newest first"], ["old", "Oldest first"], ["name", "Name A–Z"]])}<button class="btn btn-ghost btn-sm" data-action="clear-filters" data-group="aApps">${icon("x", "ico ico-sm")}Clear</button><button class="btn btn-soft btn-sm" data-action="adm-export" data-what="applications" data-fmt="csv">${icon("download", "ico ico-sm")}CSV</button>`)}
    ${Admin.listRender("aApps", AdminLists.applications)}`;
};
const AdminLists = {};
AdminLists.appRows = () => { const u = uiOf("aApps"); return applySort(API.all("membership_applications").filter((a) => textMatch(u.q, [a.full_name, a.application_no, a.mobile, a.email]) && (!u.status || a.status === u.status) && (!u.cat || a.category === u.cat) && (!u.pay || a.payment_status === u.pay)), u.sort, { new: ["submitted_at", "desc"], old: ["submitted_at", "asc"], name: ["full_name", "asc"] }); };
AdminLists.applications = () => {
  const rows = AdminLists.appRows(); const { slice, pager: pg } = paginate("aApps", rows, 12);
  return h`${admTable([
    { label: "Application", render: (a) => h`<span class="t-strong mono">${a.application_no}</span>` },
    { label: "Applicant", render: (a) => h`<b>${a.full_name}</b><div class="small muted">${can("members.fullMobile") ? a.mobile : maskMobile(a.mobile)}</div>` },
    { label: "Category", render: (a) => a.category }, { label: "Department", render: (a) => a.department },
    { label: "Submitted", render: (a) => fmtDate(a.submitted_at), cls: "nowrap" }, { label: "Amount", render: (a) => fmtINR(a.amount) },
    { label: "Payment", render: (a) => statusPill(a.payment_status) }, { label: "Status", render: (a) => statusPill(a.status) },
    { label: "Actions", render: (a) => h`<div class="actions">${ab("adm-app-view", a.id, "Review", "eye")}${["Pending", "Under Review"].includes(a.status) ? h`${ab("adm-app-approve", a.id, "Approve", "check", "btn-success")}${ab("adm-app-reject", a.id, "Reject", "x", "btn-danger")}` : ""}${a.payment_status === "Pending" && a.status !== "Rejected" ? ab("adm-app-verifypay", a.id, "Verify payment", "rupee", "btn-soft") : ""}</div>` }
  ], slice, { wide: true, empty: "No membership applications found." })}${pg}`;
};
const AdminOps = {
  async approveApp(a) {
    const payOk = a.payment_status === "Verified";
    let member = a.member_id ? API.get("members", a.member_id) : API.find("members", (m) => m.mobile === a.mobile && m.category === a.category);
    if (!member) {
      const yr = new Date().getFullYear(); const c = CAT_BY_NAME[a.category];
      member = await API.insert("members", { membership_no: nextMembershipNo(), full_name: a.full_name, email: a.email, mobile: a.mobile, gender: a.gender || "", department: a.department, admission_year: a.admission_year, passing_year: a.passing_year, profession: a.profession || "", company: a.company || "", city: a.city || "", state: "West Bengal", pin: "", address: "", category: a.category, status: payOk ? "Active" : "Pending Payment", member_since: yr, valid_till: c.id === "mgmt" ? "Lifetime" : String(yr + 1), photo: null, user_id: a.user_id || null });
      if (a.user_id) { const p = API.get("profiles", a.user_id); if (p && !p.member_id) await API.update("profiles", p.id, { member_id: member.id }); }
    } else if (payOk && member.status !== "Active") await API.update("members", member.id, { status: "Active", category: a.category });
    await API.update("membership_applications", a.id, { status: payOk ? "Verified" : "Approved", reviewed_at: new Date().toISOString(), member_id: member.id });
    audit("Approved membership application", a.application_no);
    if (a.user_id) notify(a.user_id, "membership", payOk ? "Membership activated" : "Application approved", payOk ? `${member.membership_no} is now active. Print your certificate from My FPAA.` : `${a.application_no} approved — membership activates after payment verification.`, "#my-fpaa");
    Auth.bindMember(); return member;
  },
  async verifyPayment(pay, app) {
    if (pay) await API.update("payments", pay.id, { status: "Verified", verified_by: actorName() });
    if (app) {
      const patch = { payment_status: "Verified" }; if (app.status === "Approved") patch.status = "Verified";
      await API.update("membership_applications", app.id, patch);
      if (app.member_id) { const m = API.get("members", app.member_id); if (m && m.status === "Pending Payment") await API.update("members", m.id, { status: "Active" }); }
      if (app.user_id) notify(app.user_id, "membership", "Payment verified", `Payment for ${app.application_no} (${fmtINR(app.amount)}) has been verified.`, "#my-fpaa");
    }
    audit("Verified payment", app ? app.application_no : pay.application_no); Auth.bindMember();
  },
  async rejectPayment(pay, app, reason) {
    if (pay) await API.update("payments", pay.id, { status: "Rejected", verified_by: actorName(), note: reason });
    if (app) { await API.update("membership_applications", app.id, { payment_status: "Rejected", notes: reason }); if (app.user_id) notify(app.user_id, "membership", "Payment could not be verified", `${app.application_no}: ${reason}`, "#my-fpaa"); }
    audit("Rejected payment", app ? app.application_no : pay.application_no);
  }
};
const payFor = (a) => API.find("payments", (p) => p.application_id === a.id);
Actions["adm-app-view"] = (el) => {
  const a = API.get("membership_applications", el.dataset.id); if (!a) return; const pay = payFor(a); const open = ["Pending", "Under Review"].includes(a.status);
  Modal.open({ title: a.full_name, eyebrow: `${a.application_no} · Applicant details`, size: "lg", body: h`<div class="row" style="margin-bottom:14px">Status ${statusPill(a.status)} Payment ${statusPill(a.payment_status)}</div>
    <dl class="kv"><dt>Category</dt><dd>${a.category} (${fmtINR(a.amount)})</dd><dt>Email</dt><dd>${a.email}</dd><dt>Mobile</dt><dd>${can("members.fullMobile") ? a.mobile : maskMobile(a.mobile)}</dd><dt>Gender</dt><dd>${a.gender || "—"}</dd><dt>Department</dt><dd>${a.department}</dd><dt>Admission / Passing</dt><dd>${a.admission_year} / ${a.passing_year}</dd><dt>Profession</dt><dd>${a.profession || "—"} ${a.company ? "· " + a.company : ""}</dd><dt>City</dt><dd>${a.city || "—"}</dd>
      <dt>Payment mode</dt><dd>${a.payment_mode}</dd><dt>Reference</dt><dd class="mono">${a.payment_ref}</dd><dt>Payment record</dt><dd>${pay ? h`${statusPill(pay.status)} ${pay.verified_by ? "by " + pay.verified_by : ""}` : "—"}</dd><dt>Submitted</dt><dd>${fmtDateTime(a.submitted_at)}</dd><dt>Reviewed</dt><dd>${a.reviewed_at ? fmtDateTime(a.reviewed_at) : "—"}</dd>${a.notes ? h`<dt>Notes</dt><dd>${a.notes}</dd>` : ""}
      ${a.member_id ? h`<dt>Membership</dt><dd class="mono">${(API.get("members", a.member_id) || {}).membership_no || "—"}</dd>` : ""}</dl>
    ${open && a.payment_status !== "Verified" ? h`<div style="margin-top:14px">${alertBox("info", "Payment not yet verified", "You can approve now — membership will stay 'Pending Payment' until Finance verifies the payment.")}</div>` : ""}`,
    foot: h`${a.status === "Pending" ? ab("adm-app-review", a.id, "Mark under review", "eye", "btn-soft") : ""}${a.payment_status === "Pending" && a.status !== "Rejected" && can("admin.applications") ? ab("adm-app-verifypay", a.id, "Verify payment", "rupee", "btn-soft") : ""}${open ? h`${ab("adm-app-reject", a.id, "Reject", "x", "btn-danger")}${ab("adm-app-approve", a.id, "Approve", "check", "btn-success")}` : h`<button class="btn btn-ghost" data-action="modal-close">Close</button>`}` });
};
Actions["adm-app-review"] = (el) => busy(el, "Updating…", async () => { const a = API.get("membership_applications", el.dataset.id); await API.update("membership_applications", a.id, { status: "Under Review", reviewed_at: new Date().toISOString() }); audit("Marked application under review", a.application_no); if (a.user_id) notify(a.user_id, "membership", "Application under review", a.application_no, "#my-fpaa"); Modal.close(); toast("success", "Marked under review", a.application_no); Admin.rerender(); });
Actions["adm-app-approve"] = async (el) => {
  const a = API.get("membership_applications", el.dataset.id); if (!a) return;
  if (!(await confirmDialog({ title: "Approve application?", message: `${a.full_name} — ${a.category}. ${a.payment_status === "Verified" ? "Payment is verified; membership will be activated immediately." : "Payment is not verified yet; membership will be created as 'Pending Payment'."}`, confirmText: "Approve" }))) return;
  try { const m = await AdminOps.approveApp(a); toast("success", "Application approved", `${a.application_no} → ${m.membership_no}`); Admin.rerender(); } catch (e) { toast("error", "Could not approve.", e.message); }
};
Actions["adm-app-reject"] = async (el) => {
  const a = API.get("membership_applications", el.dataset.id); const reason = await promptDialog({ title: "Reject application", label: "Reason (shared with the applicant)", confirmText: "Reject", danger: true }); if (!reason) return;
  try { await API.update("membership_applications", a.id, { status: "Rejected", notes: reason, reviewed_at: new Date().toISOString() }); audit("Rejected membership application", a.application_no); if (a.user_id) notify(a.user_id, "membership", "Application rejected", `${a.application_no}: ${reason}`, "#my-fpaa"); toast("success", "Application rejected", a.application_no); Admin.rerender(); }
  catch (e) { toast("error", "Could not reject.", e.message); }
};
Actions["adm-app-verifypay"] = (el) => busy(el, "Verifying…", async () => { const a = API.get("membership_applications", el.dataset.id); await AdminOps.verifyPayment(payFor(a), a); Modal.close(); toast("success", "Payment verified", a.application_no); Admin.rerender(); });

/* ---------- Members database ---------- */
AdminPanels.members = () => {
  const u = uiOf("aMembers", { sort: "no" }); const years = uniq(API.all("members").map((m) => m.passing_year)).sort((a, b) => b - a);
  return h`${admToolbar(h`${searchFilter("aMembers.q", u.q, "Search name, membership no., email, mobile…")}${selectFilter("aMembers.dept", u.dept, DEPARTMENTS, "All departments")}${selectFilter("aMembers.status", u.status, ["Active", "Inactive", "Pending Payment"], "All statuses")}${selectFilter("aMembers.cat", u.cat, CATEGORIES.map((c) => c.name), "All categories")}${selectFilter("aMembers.pass", u.pass, years, "Passing year")}
    ${sortSelect("aMembers", u.sort, [["no", "Membership no."], ["name", "Name A–Z"], ["new", "Newest first"], ["pass", "Passing year"]])}<button class="btn btn-ghost btn-sm" data-action="clear-filters" data-group="aMembers">${icon("x", "ico ico-sm")}Clear</button>
    <button class="btn btn-soft btn-sm" data-action="adm-export" data-what="members" data-fmt="csv">${icon("download", "ico ico-sm")}CSV</button><button class="btn btn-soft btn-sm" data-action="adm-export" data-what="members" data-fmt="xlsx">${icon("table", "ico ico-sm")}Excel</button>`)}
    ${Admin.listRender("aMembers", AdminLists.members)}`;
};
AdminLists.memberRows = () => { const u = uiOf("aMembers"); return applySort(API.all("members").filter((m) => textMatch(u.q, [m.full_name, m.membership_no, m.email, m.mobile, m.company]) && (!u.dept || m.department === u.dept) && (!u.status || m.status === u.status) && (!u.cat || m.category === u.cat) && (!u.pass || String(m.passing_year) === u.pass)), u.sort, { no: ["membership_no", "asc"], name: ["full_name", "asc"], new: ["created_at", "desc"], pass: ["passing_year", "desc"] }); };
AdminLists.members = () => {
  const rows = AdminLists.memberRows(); const { slice, pager: pg } = paginate("aMembers", rows, 15); const full = can("members.fullMobile");
  return h`${admTable([
    { label: "Membership Number", render: (m) => h`<span class="mono t-strong nowrap">${m.membership_no}</span>` }, { label: "Name", render: (m) => h`<div class="row nowrap" style="gap:8px;flex-wrap:nowrap">${avatar(m.full_name, m.photo, "sm")}<b>${m.full_name}</b></div>` },
    { label: "Email", render: (m) => m.email }, { label: "Mobile", render: (m) => full ? m.mobile : maskMobile(m.mobile), cls: "nowrap mono" }, { label: "Department", render: (m) => m.department },
    { label: "Admission Year", render: (m) => m.admission_year }, { label: "Passing Year", render: (m) => m.passing_year }, { label: "Profession", render: (m) => m.profession, cls: "nowrap" }, { label: "Company", render: (m) => m.company },
    { label: "Status", render: (m) => statusPill(m.status) }, { label: "Created Date", render: (m) => fmtDate(m.created_at), cls: "nowrap" },
    { label: "Actions", render: (m) => h`<div class="actions">${ab("member-view", m.id, "View", "eye")}${ab("adm-member-preview", m.id, "Preview", "idcard")}${ab("adm-member-edit", m.id, "Edit", "edit")}${ab("print-certificate", m.id, "Certificate", "certificate", "btn-soft", m.status === "Active" ? "" : "disabled")}${ab("print-card", m.id, "Card", "printer", "btn-soft", m.status === "Active" ? "" : "disabled")}</div>` }
  ], slice, { wide: true, tall: true, empty: "No members found." })}${pg}`;
};
Actions["adm-member-preview"] = (el) => {
  const m = API.get("members", el.dataset.id); if (!m) return;
  Modal.open({ title: "Membership card preview", eyebrow: m.membership_no, body: h`<div class="member-mini-card"><div class="mc-top"><img src="${CONFIG.LOGO_URL}" alt=""><div><b>FALAKATA POLYTECHNIC<br>ALUMNI ASSOCIATION</b><span>FPAA CONNECT 2.0 · MEMBER</span></div></div><div><div class="chipline"></div></div><div><div class="mc-name">${m.full_name}</div><div class="mc-no">${m.membership_no}</div></div><div class="mc-foot"><span>Category<b>${m.category.replace(" Membership", "")}</b></span><span>Batch<b>${m.passing_year}</b></span><span>Valid till<b>${m.valid_till}</b></span></div></div>
    <div style="margin-top:14px" class="row">${statusPill(m.status)}<span class="small muted">Certificate and card can be printed only for active members.</span></div>`,
    foot: h`<button class="btn btn-ghost" data-action="modal-close">Close</button>${ab("print-certificate", m.id, "Print Certificate", "certificate", "btn-primary", m.status === "Active" ? "" : "disabled")}${ab("print-card", m.id, "Print Membership Card", "printer", "btn-gold", m.status === "Active" ? "" : "disabled")}` });
};
Actions["adm-member-edit"] = (el) => {
  const m = API.get("members", el.dataset.id); if (!m) return;
  Modal.open({ title: "Edit member", eyebrow: m.membership_no, size: "lg", body: h`<form data-submit="adm-member-save" data-id="${m.id}" novalidate><div class="form-grid">
    ${field({ label: "Full Name", name: "full_name", required: true, value: m.full_name })}${field({ label: "Email", name: "email", type: "email", required: true, value: m.email })}
    ${field({ label: "Mobile", name: "mobile", type: "tel", required: true, value: m.mobile })}${field({ label: "Department", name: "department", options: DEPARTMENTS, value: m.department })}
    ${field({ label: "Admission Year", name: "admission_year", type: "number", value: m.admission_year })}${field({ label: "Passing Year", name: "passing_year", type: "number", value: m.passing_year })}
    ${field({ label: "Profession", name: "profession", options: PROFESSIONS, value: m.profession })}${field({ label: "Company", name: "company", value: m.company })}
    ${field({ label: "City", name: "city", value: m.city })}${field({ label: "State", name: "state", value: m.state })}${field({ label: "PIN Code", name: "pin", value: m.pin })}${field({ label: "Address", name: "address", value: m.address })}
    ${field({ label: "Category", name: "category", options: CATEGORIES.map((c) => c.name), value: m.category })}${field({ label: "Status", name: "status", options: ["Active", "Inactive", "Pending Payment"], value: m.status })}
    ${field({ label: "Member Since", name: "member_since", type: "number", value: m.member_since })}${field({ label: "Valid Till", name: "valid_till", value: m.valid_till, hint: "Year or 'Lifetime'" })}
  </div><div class="form-actions"><button type="button" class="btn btn-ghost" data-action="modal-close">Cancel</button><button class="btn btn-primary" type="submit">${icon("check")}Save member</button></div></form>` });
};
Actions["adm-member-save"] = async (form) => {
  const v = validate(form, { full_name: [req()], email: [req(), vEmail], mobile: [req(), vMobile], pin: [vPin], admission_year: [req()], passing_year: [req(), [(x, a) => Number(x) > Number(a.admission_year), "Must be after admission year."]], valid_till: [req()] }); if (!v) return;
  await busy(form.querySelector('[type="submit"]'), "Saving…", async () => {
    try { const m = API.get("members", form.dataset.id); await API.update("members", m.id, Object.assign(v, { mobile: normMobile(v.mobile), admission_year: Number(v.admission_year), passing_year: Number(v.passing_year), member_since: Number(v.member_since) })); audit("Edited member", m.membership_no); Auth.bindMember(); Modal.close(); toast("success", "Member updated", m.membership_no); Admin.rerender(); }
    catch (e) { toast("error", "Could not save member.", e.message); }
  });
};

/* ---------- Scheme applications ---------- */
AdminPanels.schemes = () => {
  const u = uiOf("aSch", { sort: "new" }); const schemes = Schemes.all();
  const counts = schemes.map((s) => h`<div class="glass stat-card"><span class="ico-tile ${s.tone === "f-gold" ? "gold" : s.tone === "f-rose" ? "violet" : ""}">${icon(s.icon)}</span><div class="sc-body"><div class="sc-label">${s.code}</div><div class="sc-value">${Schemes.apps(s.id).length}</div><div class="sc-sub">${Schemes.apps(s.id).filter((a) => a.status === "Approved").length} approved · ${s.seats} seats</div></div></div>`);
  return h`<div class="grid grid-3" style="margin-bottom:18px">${counts}</div>
    ${admToolbar(h`${searchFilter("aSch.q", u.q, "Search applicant, application no.…")}${selectFilter("aSch.scheme", u.scheme, schemes.map((s) => ({ value: s.id, label: s.name })), "All schemes")}${selectFilter("aSch.status", u.status, SCHEME_STATUSES, "All statuses")}${sortSelect("aSch", u.sort, [["new", "Newest first"], ["pct", "Highest %"], ["name", "Name A–Z"]])}<button class="btn btn-ghost btn-sm" data-action="clear-filters" data-group="aSch">${icon("x", "ico ico-sm")}Clear</button><button class="btn btn-soft btn-sm" data-action="adm-export" data-what="schemes" data-fmt="csv">${icon("download", "ico ico-sm")}CSV</button>`)}
    ${Admin.listRender("aSch", AdminLists.schemes)}`;
};
AdminLists.schRows = () => { const u = uiOf("aSch"); return applySort(Schemes.apps().filter((a) => textMatch(u.q, [a.applicant_name, a.application_no, a.mobile]) && (!u.scheme || a.scheme_id === u.scheme) && (!u.status || a.status === u.status)), u.sort, { new: ["submitted_at", "desc"], pct: ["percentage", "desc"], name: ["applicant_name", "asc"] }); };
AdminLists.schemes = () => {
  const rows = AdminLists.schRows(); const { slice, pager: pg } = paginate("aSch", rows, 12); const sn = (id) => (Schemes.all().find((s) => s.id === id) || {}).code;
  return h`${admTable([
    { label: "Application", render: (a) => h`<span class="mono t-strong">${a.application_no}</span>` }, { label: "Applicant", render: (a) => h`<b>${a.applicant_name}</b><div class="small muted">${a.gender}</div>` },
    { label: "Scheme", render: (a) => h`<span class="chip">${sn(a.scheme_id)}</span>` }, { label: "Department", render: (a) => a.department }, { label: "Semester", render: (a) => a.semester },
    { label: "%", render: (a) => a.percentage != null ? a.percentage : "—" }, { label: "Income", render: (a) => a.family_income ? fmtINR(a.family_income) : a.track || "—" }, { label: "Submitted", render: (a) => fmtDate(a.submitted_at), cls: "nowrap" },
    { label: "Status", render: (a) => statusPill(a.status) },
    { label: "Actions", render: (a) => h`<div class="actions">${ab("adm-sch-view", a.id, "Review", "eye")}${!["Approved", "Rejected"].includes(a.status) ? h`${ab("adm-sch-set", a.id, "Approve", "check", "btn-success", 'data-status="Approved"')}${ab("adm-sch-set", a.id, "Reject", "x", "btn-danger", 'data-status="Rejected"')}` : ""}</div>` }
  ], slice, { wide: true, empty: "No scheme applications found." })}${pg}`;
};
Actions["adm-sch-view"] = (el) => {
  const a = API.get("scheme_applications", el.dataset.id); if (!a) return; const s = Schemes.all().find((x) => x.id === a.scheme_id) || {};
  Modal.open({ title: a.applicant_name, eyebrow: `${a.application_no} · ${s.name}`, size: "lg", body: h`<dl class="kv"><dt>Scheme</dt><dd>${s.name}</dd><dt>Gender</dt><dd>${a.gender}</dd><dt>Department</dt><dd>${a.department}</dd><dt>Semester</dt><dd>${a.semester}</dd><dt>Last semester %</dt><dd>${a.percentage ?? "—"}</dd><dt>Family income</dt><dd>${a.family_income ? fmtINR(a.family_income) : "—"}</dd>${a.track ? h`<dt>Track</dt><dd>${a.track}</dd>` : ""}<dt>Mobile</dt><dd>${a.mobile}</dd><dt>Email</dt><dd>${a.email || "—"}</dd><dt>Submitted</dt><dd>${fmtDateTime(a.submitted_at)}</dd><dt>Statement</dt><dd style="white-space:pre-wrap">${a.statement}</dd></dl>
    <div class="divider"></div><form data-submit="adm-sch-update" data-id="${a.id}" novalidate><div class="form-grid">${field({ label: "Update status", name: "status", options: SCHEME_STATUSES, value: a.status })}${field({ label: "Remarks (visible to applicant)", name: "remarks", value: a.remarks, attrs: 'maxlength="200"' })}</div>
    <div class="form-actions"><button type="button" class="btn btn-ghost" data-action="modal-close">Cancel</button><button class="btn btn-primary" type="submit">${icon("check")}Update status</button></div></form>` });
};
Actions["adm-sch-update"] = async (form) => { const v = formValues(form); const a = API.get("scheme_applications", form.dataset.id); await busy(form.querySelector('[type="submit"]'), "Saving…", async () => { await API.update("scheme_applications", a.id, { status: v.status, remarks: v.remarks }); audit(`Scheme application → ${v.status}`, a.application_no); if (a.user_id) notify(a.user_id, "scheme", `${a.application_no}: ${v.status}`, v.remarks || "Scheme application status updated.", "#scheme"); Modal.close(); toast("success", "Status updated", `${a.application_no} → ${v.status}`); Admin.rerender(); }); };
Actions["adm-sch-set"] = async (el) => {
  const a = API.get("scheme_applications", el.dataset.id); const st = el.dataset.status; let remarks = a.remarks;
  if (st === "Rejected") { remarks = await promptDialog({ title: "Reject scheme application", label: "Reason", danger: true, confirmText: "Reject" }); if (!remarks) return; }
  await API.update("scheme_applications", a.id, { status: st, remarks }); audit(`Scheme application → ${st}`, a.application_no); if (a.user_id) notify(a.user_id, "scheme", `${a.application_no}: ${st}`, remarks || "", "#scheme"); toast("success", `Application ${st.toLowerCase()}`, a.application_no); Admin.rerender();
};

/* ---------- Career review ---------- */
AdminPanels.careers = () => {
  const u = uiOf("aJobs", { sort: "new" });
  return h`${admToolbar(h`${searchFilter("aJobs.q", u.q, "Search position, company…")}${selectFilter("aJobs.status", u.status, ["Pending", "Approved", "Published", "Rejected"], "All statuses")}${selectFilter("aJobs.dept", u.dept, DEPARTMENTS, "All departments")}${sortSelect("aJobs", u.sort, [["new", "Newest first"], ["old", "Oldest first"], ["company", "Company A–Z"]])}<button class="btn btn-ghost btn-sm" data-action="clear-filters" data-group="aJobs">${icon("x", "ico ico-sm")}Clear</button><button class="btn btn-primary btn-sm" data-action="job-new">${icon("plus", "ico ico-sm")}Add job</button>`)}
    ${Admin.listRender("aJobs", AdminLists.jobs)}`;
};
AdminLists.jobs = () => {
  const u = uiOf("aJobs"); const rows = applySort(API.all("job_postings").filter((j) => textMatch(u.q, [j.title, j.company, j.location]) && (!u.status || j.status === u.status) && (!u.dept || j.department === u.dept)), u.sort, { new: ["posted_at", "desc"], old: ["posted_at", "asc"], company: ["company", "asc"] });
  const { slice, pager: pg } = paginate("aJobs", rows, 12);
  return h`${admTable([
    { label: "Position", render: (j) => h`<b>${j.title}</b><div class="small muted">${j.company}</div>` }, { label: "Location", render: (j) => j.location }, { label: "Department", render: (j) => j.department }, { label: "Type", render: (j) => j.job_type },
    { label: "Posted by", render: (j) => j.poster_name || "—" }, { label: "Posted", render: (j) => fmtDate(j.posted_at), cls: "nowrap" }, { label: "Status", render: (j) => statusPill(j.status) },
    { label: "Actions", render: (j) => h`<div class="actions">${ab("job-view", j.id, "View", "eye")}${j.status === "Pending" ? ab("adm-job-status", j.id, "Approve", "check", "btn-success", 'data-status="Approved"') : ""}${["Pending", "Approved", "Rejected"].includes(j.status) ? ab("adm-job-status", j.id, "Publish", "globe", "btn-primary", 'data-status="Published"') : ""}${j.status !== "Rejected" ? ab("adm-job-status", j.id, "Reject", "x", "btn-danger", 'data-status="Rejected"') : ""}${ab("adm-job-edit", j.id, "Edit", "edit")}${ab("adm-job-delete", j.id, "Delete", "trash")}</div>` }
  ], slice, { wide: true, empty: "No job postings found." })}${pg}`;
};
Actions["adm-job-status"] = async (el) => {
  const j = API.get("job_postings", el.dataset.id); const st = el.dataset.status; let note = "";
  if (st === "Rejected") { note = await promptDialog({ title: "Reject job posting", label: "Reason (shared with the poster)", danger: true, confirmText: "Reject" }); if (!note) return; }
  await busy(el, "Updating…", async () => { await API.update("job_postings", j.id, { status: st, review_note: note }); audit(`Job ${st.toLowerCase()}`, j.title); if (j.posted_by) notify(j.posted_by, "job", `Your job post was ${st.toLowerCase()}`, j.title + (note ? " — " + note : ""), "#careers"); if (st === "Published") API.quiet("dashboard_live_feed", { type: "job", title: `New job: ${j.title}`, body: `${j.company}, ${j.location}`, status: "Published" }); });
  toast("success", `Job ${st.toLowerCase()}`, j.title); Admin.rerender();
};
Actions["adm-job-edit"] = (el) => { const j = API.get("job_postings", el.dataset.id); Modal.open({ title: "Edit job", eyebrow: j.company, size: "lg", body: Career.form(j) }); };
Actions["job-save"] = async (form) => { const v = validate(form, Career.rules); if (!v) return; await busy(form.querySelector('[type="submit"]'), "Saving…", async () => { const j = API.get("job_postings", form.dataset.id); await API.update("job_postings", j.id, v); audit("Edited job", v.title); Modal.close(); toast("success", "Job updated", v.title); Admin.rerender(); }); };
Actions["adm-job-delete"] = async (el) => { const j = API.get("job_postings", el.dataset.id); if (!(await confirmDialog({ title: "Delete job?", message: `${j.title} at ${j.company} will be permanently removed.`, confirmText: "Delete", danger: true }))) return; await API.remove("job_postings", j.id); audit("Deleted job", j.title); toast("success", "Job deleted"); Admin.rerender(); };

/* ---------- Payment verification ---------- */
AdminPanels.payments = () => {
  const u = uiOf("aPay", { sort: "new", status: "Pending" });
  return h`${admToolbar(h`${searchFilter("aPay.q", u.q, "Search member, application, reference…")}${selectFilter("aPay.status", u.status, ["Pending", "Verified", "Rejected"], "All statuses")}${selectFilter("aPay.mode", u.mode, PAY_MODES, "All modes")}${sortSelect("aPay", u.sort, [["new", "Newest first"], ["old", "Oldest first"], ["amt", "Amount"]])}<button class="btn btn-ghost btn-sm" data-action="clear-filters" data-group="aPay">${icon("x", "ico ico-sm")}Clear</button><button class="btn btn-soft btn-sm" data-action="adm-export" data-what="payments" data-fmt="csv">${icon("download", "ico ico-sm")}CSV</button>`)}
    ${Admin.listRender("aPay", AdminLists.payments)}`;
};
AdminLists.payments = () => {
  const u = uiOf("aPay"); const rows = applySort(API.all("payments").filter((p) => textMatch(u.q, [p.member_name, p.application_no, p.reference]) && (!u.status || p.status === u.status) && (!u.mode || p.mode === u.mode)), u.sort, { new: ["paid_at", "desc"], old: ["paid_at", "asc"], amt: ["amount", "desc"] });
  const { slice, pager: pg } = paginate("aPay", rows, 12);
  return h`${admTable([
    { label: "Application", render: (p) => h`<span class="mono t-strong">${p.application_no}</span>` }, { label: "Member", render: (p) => h`<b>${p.member_name}</b><div class="small muted">${p.category}</div>` },
    { label: "Amount", render: (p) => h`<b>${fmtINR(p.amount)}</b>` }, { label: "Payment mode", render: (p) => p.mode }, { label: "Reference number", render: (p) => h`<span class="mono">${p.reference}</span>` },
    { label: "Date", render: (p) => fmtDate(p.paid_at), cls: "nowrap" }, { label: "Status", render: (p) => statusPill(p.status) },
    { label: "Actions", render: (p) => p.status === "Pending" ? h`<div class="actions">${ab("adm-pay-verify", p.id, "Verify", "check", "btn-success")}${ab("adm-pay-reject", p.id, "Reject", "x", "btn-danger")}</div>` : h`<span class="small muted">${p.verified_by || ""}</span>` }
  ], slice, { wide: true, empty: "No payments found." })}${pg}`;
};
Actions["adm-pay-verify"] = (el) => busy(el, "Verifying…", async () => { const p = API.get("payments", el.dataset.id); await AdminOps.verifyPayment(p, p.application_id ? API.get("membership_applications", p.application_id) : null); toast("success", "Payment verified", `${p.application_no} · ${fmtINR(p.amount)}`); Admin.rerender(); });
Actions["adm-pay-reject"] = async (el) => { const p = API.get("payments", el.dataset.id); const reason = await promptDialog({ title: "Reject payment", label: "Reason", danger: true, confirmText: "Reject" }); if (!reason) return; await AdminOps.rejectPayment(p, p.application_id ? API.get("membership_applications", p.application_id) : null, reason); toast("success", "Payment rejected", p.application_no); Admin.rerender(); };

/* ---------- Donation verification ---------- */
AdminPanels.donations = () => {
  const u = uiOf("aDon", { sort: "new" });
  return h`${admToolbar(h`${searchFilter("aDon.q", u.q, "Search donor, donation no., reference…")}${selectFilter("aDon.status", u.status, ["Pending", "Verified", "Rejected"], "All statuses")}${selectFilter("aDon.purpose", u.purpose, DONATION_PURPOSES, "All purposes")}${sortSelect("aDon", u.sort, [["new", "Newest first"], ["old", "Oldest first"], ["amt", "Highest amount"]])}<button class="btn btn-ghost btn-sm" data-action="clear-filters" data-group="aDon">${icon("x", "ico ico-sm")}Clear</button><button class="btn btn-soft btn-sm" data-action="adm-export" data-what="donations" data-fmt="csv">${icon("download", "ico ico-sm")}CSV</button><button class="btn btn-soft btn-sm" data-action="adm-export" data-what="donations" data-fmt="xlsx">${icon("table", "ico ico-sm")}Excel</button>`)}
    ${Admin.listRender("aDon", AdminLists.donations)}`;
};
AdminLists.donRows = () => { const u = uiOf("aDon"); return applySort(API.all("donations").filter((d) => textMatch(u.q, [d.donor_name, d.donation_no, d.payment_ref, d.email]) && (!u.status || d.status === u.status) && (!u.purpose || d.purpose === u.purpose)), u.sort, { new: ["donated_at", "desc"], old: ["donated_at", "asc"], amt: ["amount", "desc"] }); };
AdminLists.donations = () => {
  const rows = AdminLists.donRows(); const { slice, pager: pg } = paginate("aDon", rows, 12);
  return h`${admTable([
    { label: "Donation", render: (d) => h`<span class="mono t-strong">${d.donation_no}</span>` }, { label: "Donor", render: (d) => h`<b>${d.donor_name}</b><div class="small muted">${d.email}</div>` }, { label: "Purpose", render: (d) => d.purpose },
    { label: "Amount", render: (d) => h`<b>${fmtINR(d.amount)}</b>` }, { label: "Reference", render: (d) => h`<span class="mono small">${d.payment_mode || ""} ${d.payment_ref || ""}</span>` }, { label: "Date", render: (d) => fmtDate(d.donated_at), cls: "nowrap" }, { label: "Status", render: (d) => statusPill(d.status) },
    { label: "Actions", render: (d) => h`<div class="actions">${ab("donation-view", d.id, "View", "eye")}${d.status === "Pending" ? h`${ab("adm-don-set", d.id, "Verify", "check", "btn-success", 'data-status="Verified"')}${ab("adm-don-set", d.id, "Reject", "x", "btn-danger", 'data-status="Rejected"')}` : ""}</div>` }
  ], slice, { wide: true, empty: "No donations found." })}${pg}`;
};
Actions["adm-don-set"] = async (el) => {
  const d = API.get("donations", el.dataset.id); const st = el.dataset.status; let note = "";
  if (st === "Rejected") { note = await promptDialog({ title: "Reject donation", label: "Reason (shared with donor)", danger: true, confirmText: "Reject" }); if (!note) return; }
  await busy(el, "Updating…", async () => { await API.update("donations", d.id, { status: st, review_note: note, verified_by: actorName() }); audit(`Donation ${st.toLowerCase()}`, d.donation_no); if (d.user_id) notify(d.user_id, "donation", st === "Verified" ? "Donation verified" : "Donation could not be verified", `${d.donation_no} · ${fmtINR(d.amount)}${note ? " — " + note : ""}`, "#my-fpaa"); });
  toast("success", `Donation ${st.toLowerCase()}`, d.donation_no); Admin.rerender();
};

/* ---------- Support ---------- */
AdminPanels.support = () => {
  const u = uiOf("aSup", { sort: "upd" });
  return h`${admToolbar(h`${searchFilter("aSup.q", u.q, "Search ticket, subject, requester…")}${selectFilter("aSup.status", u.status, SUPPORT_STATUSES, "All statuses")}${selectFilter("aSup.cat", u.cat, SUPPORT_CATEGORIES, "All categories")}${sortSelect("aSup", u.sort, [["upd", "Recently updated"], ["new", "Newest"], ["old", "Oldest"]])}<button class="btn btn-ghost btn-sm" data-action="clear-filters" data-group="aSup">${icon("x", "ico ico-sm")}Clear</button>`)}
    ${Admin.listRender("aSup", AdminLists.support)}`;
};
AdminLists.support = () => {
  const u = uiOf("aSup"); const rows = applySort(API.all("support_requests").filter((t) => textMatch(u.q, [t.ticket_no, t.subject, t.requester_name]) && (!u.status || t.status === u.status) && (!u.cat || t.category === u.cat)), u.sort, { upd: ["updated_at", "desc"], new: ["created_at", "desc"], old: ["created_at", "asc"] });
  const { slice, pager: pg } = paginate("aSup", rows, 12);
  return h`${admTable([
    { label: "Ticket", render: (t) => h`<span class="mono t-strong">${t.ticket_no}</span>` }, { label: "Subject", render: (t) => h`<b class="break">${t.subject}</b>` }, { label: "Requester", render: (t) => h`${t.requester_name}<div class="small muted">${t.requester_email}</div>` },
    { label: "Category", render: (t) => t.category }, { label: "Assigned", render: (t) => t.assigned_to || "—" }, { label: "Updated", render: (t) => relTime(t.updated_at), cls: "nowrap" }, { label: "Status", render: (t) => statusPill(t.status) },
    { label: "Actions", render: (t) => h`<div class="actions">${ab("ticket-view", t.id, "Open & reply", "chat", "btn-primary")}${t.status !== "Closed" ? ab("ticket-close", t.id, "Close", "ban") : ""}</div>` }
  ], slice, { wide: true, empty: "No support requests found." })}${pg}`;
};

/* ---------- Dashboard feed & gallery ---------- */
AdminPanels.feed = () => {
  const feed = Home.feed().concat(API.all("dashboard_live_feed").filter((f) => f.status === "Draft")); const slides = Home.slides();
  return h`<div class="grid" style="grid-template-columns:minmax(0,1fr)">
    <section class="glass card"><div class="card-head"><div><span class="eyebrow"><span class="live-dot"></span> Live feed</span><h3>Dashboard live feed</h3><p class="sub">Posts appear instantly on the Home dashboard.</p></div></div>
      <form data-submit="adm-feed-add" novalidate><div class="form-grid">${field({ label: "Type", name: "type", options: ["announcement", "event", "notice", "gallery", "achievement", "job"], value: "announcement" })}${field({ label: "Title", name: "title", required: true, attrs: 'maxlength="100"' })}${field({ label: "Details", name: "body", required: true, span: true, attrs: 'maxlength="200"' })}</div>
        <div class="form-actions"><button class="btn btn-primary" type="submit">${icon("send")}Post update</button></div></form>
      <div class="divider"></div>
      ${admTable([{ label: "Type", render: (f) => h`<span class="chip slate">${f.type}</span>` }, { label: "Update", render: (f) => h`<b>${f.title}</b><div class="small muted">${f.body}</div>` }, { label: "Posted", render: (f) => relTime(f.created_at), cls: "nowrap" }, { label: "Status", render: (f) => statusPill(f.status || "Published") },
        { label: "Actions", render: (f) => h`<div class="actions">${ab("adm-feed-toggle", f.id, f.status === "Draft" ? "Publish" : "Unpublish", f.status === "Draft" ? "globe" : "eyeOff")}${ab("adm-feed-delete", f.id, "Delete", "trash")}</div>` }], feed, { empty: "No data available." })}</section>
    <section class="glass card"><div class="card-head"><div><span class="eyebrow">${icon("image", "ico ico-sm")} Gallery</span><h3>Dashboard gallery</h3><p class="sub">Auto-changes every 3 seconds on Home with fade + zoom. Drag cards or use the arrows to reorder.</p></div><span class="chip">${slides.length} photos</span></div>
      <div class="file-drop"><span class="ico-tile soft">${icon("upload")}</span><div class="grow"><input type="file" id="galInput" accept="image/jpeg,image/png" multiple aria-label="Choose gallery photos"><div class="hint small muted">JPG or PNG · maximum 5 photos per upload · large files are resized automatically</div></div><button class="btn btn-primary btn-sm" data-action="adm-gal-upload" id="galUploadBtn" disabled>${icon("upload", "ico ico-sm")}Upload</button></div>
      <div class="upload-previews" id="galPreviews"></div><div class="form-msg" id="galMsg"></div>
      <div class="divider"></div>
      ${slides.length ? h`<div class="gal-admin-grid" id="galGrid">${slides.map((s, i) => h`<div class="gal-admin-item" draggable="true" data-gid="${s.id}"><span class="gi-order chip">#${i + 1}</span><img src="${s.image}" alt="${s.caption}"><div class="gi-body"><b title="${s.caption}">${s.caption}</b><div class="gi-actions">${ab("adm-gal-move", s.id, "", "chevL", "btn-ghost", `data-dir="-1" aria-label="Move earlier" ${i === 0 ? "disabled" : ""}`)}${ab("adm-gal-move", s.id, "", "chevR", "btn-ghost", `data-dir="1" aria-label="Move later" ${i === slides.length - 1 ? "disabled" : ""}`)}${ab("adm-gal-caption", s.id, "", "edit", "btn-ghost", 'aria-label="Edit caption"')}${ab("adm-gal-delete", s.id, "", "trash", "btn-ghost", 'aria-label="Delete photo"')}</div></div></div>`)}</div>` : emptyState("No gallery photos yet.", "Upload up to 5 photos at a time.", "image")}</section></div>`;
};
AdminMounts.feed = () => {
  const inp = $("#galInput"); const prev = $("#galPreviews"); const btn = $("#galUploadBtn"); if (!inp) return;
  inp.addEventListener("change", async () => {
    formMsg($("#galMsg"), null); inp._items = []; setHTML(prev, "");
    const files = Array.from(inp.files || []);
    if (files.length > 5) { formMsg($("#galMsg"), "error", "Too many photos", "You can upload a maximum of 5 photos per upload operation."); inp.value = ""; btn.disabled = true; return; }
    setHTML(prev, loadingBlock("Processing photos…"));
    const items = []; const errors = [];
    for (const f of files) { try { items.push({ name: f.name, url: await readImageFile(f, { types: ["image/jpeg", "image/png"], maxMB: 25, maxW: 1600, quality: 0.82 }), size: f.size }); } catch (e) { errors.push(`${f.name}: ${e.message}`); } }
    inp._items = items; btn.disabled = !items.length;
    setHTML(prev, items.map((it, i) => h`<figure><img src="${it.url}" alt=""><figcaption title="${it.name}">${(it.size / 1024 / 1024).toFixed(1)} MB · ${it.name}</figcaption><input class="input" style="min-height:32px;padding:4px 8px;font-size:.75rem;margin-top:4px" data-gcap="${i}" placeholder="Caption" maxlength="90" value="${it.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ")}"></figure>`));
    if (errors.length) formMsg($("#galMsg"), "warn", "Some files were skipped", errors.join(" · "));
  });
  // Drag & drop reorder
  const grid = $("#galGrid"); if (!grid) return; let dragId = null;
  grid.addEventListener("dragstart", (e) => { const it = e.target.closest("[data-gid]"); if (!it) return; dragId = it.dataset.gid; it.classList.add("dragging"); e.dataTransfer.effectAllowed = "move"; });
  grid.addEventListener("dragend", (e) => { $$(".dragging,.drop-target", grid).forEach((x) => x.classList.remove("dragging", "drop-target")); });
  grid.addEventListener("dragover", (e) => { e.preventDefault(); const it = e.target.closest("[data-gid]"); $$(".drop-target", grid).forEach((x) => x.classList.remove("drop-target")); if (it && it.dataset.gid !== dragId) it.classList.add("drop-target"); });
  grid.addEventListener("drop", async (e) => { e.preventDefault(); const it = e.target.closest("[data-gid]"); if (!it || !dragId || it.dataset.gid === dragId) return; const ids = Home.slides().map((s) => s.id); const from = ids.indexOf(dragId), to = ids.indexOf(it.dataset.gid); ids.splice(to, 0, ids.splice(from, 1)[0]); await Gallery.saveOrder(ids); });
};
const Gallery = { async saveOrder(ids) { for (let i = 0; i < ids.length; i++) { const s = API.get("homepage_gallery_feed", ids[i]); if (s.sort_order !== i) await API.update("homepage_gallery_feed", s.id, { sort_order: i }); } S.galleryIdx = 0; audit("Reordered gallery", ids.length + " photos"); toast("success", "Gallery order saved"); Admin.rerender(); } };
Actions["adm-gal-upload"] = (el) => busy(el, "Uploading…", async () => {
  const inp = $("#galInput"); const items = inp._items || []; if (!items.length) return;
  try { let order = Home.slides().length; for (let i = 0; i < items.length; i++) { const cap = ($(`[data-gcap="${i}"]`) || {}).value || items[i].name; await API.insert("homepage_gallery_feed", { image: items[i].url, caption: cap.trim() || "FPAA gallery photo", sort_order: order++ }); }
    API.quiet("dashboard_live_feed", { type: "gallery", title: `${items.length} new photo${items.length > 1 ? "s" : ""} added to the gallery`, body: "See the latest moments on the Home dashboard.", status: "Published" });
    audit("Uploaded gallery photos", String(items.length)); toast("success", "Photos uploaded", `${items.length} added to the dashboard gallery.`); Admin.rerender(); }
  catch (e) { formMsg($("#galMsg"), "error", "Upload failed", e.message); }
});
Actions["adm-gal-move"] = async (el) => { const ids = Home.slides().map((s) => s.id); const i = ids.indexOf(el.dataset.id); const j = i + Number(el.dataset.dir); if (j < 0 || j >= ids.length) return; [ids[i], ids[j]] = [ids[j], ids[i]]; await Gallery.saveOrder(ids); };
Actions["adm-gal-caption"] = async (el) => { const s = API.get("homepage_gallery_feed", el.dataset.id); const cap = await promptDialog({ title: "Edit caption", label: "Caption", multiline: false, confirmText: "Save" }); if (!cap) return; await API.update("homepage_gallery_feed", s.id, { caption: cap }); toast("success", "Caption updated"); Admin.rerender(); };
Actions["adm-gal-delete"] = async (el) => { if (!(await confirmDialog({ title: "Delete photo?", message: "This photo will be removed from the dashboard gallery.", confirmText: "Delete", danger: true }))) return; await API.remove("homepage_gallery_feed", el.dataset.id); await Gallery.saveOrder(Home.slides().map((s) => s.id)); };
Actions["adm-feed-add"] = async (form) => { const v = validate(form, { title: [req()], body: [req()] }); if (!v) return; await busy(form.querySelector('[type="submit"]'), "Posting…", async () => { await API.insert("dashboard_live_feed", { type: v.type, title: v.title, body: v.body, status: "Published" }); audit("Posted live feed update", v.title); toast("success", "Update posted to live feed"); Admin.rerender(); }); };
Actions["adm-feed-toggle"] = async (el) => { const f = API.get("dashboard_live_feed", el.dataset.id); await API.update("dashboard_live_feed", f.id, { status: f.status === "Draft" ? "Published" : "Draft" }); toast("success", "Feed updated"); Admin.rerender(); };
Actions["adm-feed-delete"] = async (el) => { if (!(await confirmDialog({ title: "Delete update?", message: "This live-feed post will be removed.", confirmText: "Delete", danger: true }))) return; await API.remove("dashboard_live_feed", el.dataset.id); toast("success", "Feed post deleted"); Admin.rerender(); };

/* ---------- Events CRUD ---------- */
AdminPanels.events = () => {
  const u = uiOf("aEvt", { sort: "date" });
  return h`${admToolbar(h`${searchFilter("aEvt.q", u.q, "Search events…")}${selectFilter("aEvt.when", u.when, [{ value: "up", label: "Upcoming" }, { value: "past", label: "Past" }], "All events")}${sortSelect("aEvt", u.sort, [["date", "Date (latest)"], ["date-asc", "Date (earliest)"], ["title", "Title A–Z"]])}<button class="btn btn-ghost btn-sm" data-action="clear-filters" data-group="aEvt">${icon("x", "ico ico-sm")}Clear</button><button class="btn btn-primary btn-sm" data-action="adm-evt-edit" data-id="">${icon("plus", "ico ico-sm")}Create event</button>`)}
    ${Admin.listRender("aEvt", AdminLists.events)}`;
};
AdminLists.events = () => {
  const u = uiOf("aEvt"); const today = isoDay(new Date());
  const rows = applySort(API.all("events").filter((e) => textMatch(u.q, [e.title, e.venue]) && (!u.when || (u.when === "up" ? e.date >= today : e.date < today))), u.sort, { date: ["date", "desc"], "date-asc": ["date", "asc"], title: ["title", "asc"] });
  const { slice, pager: pg } = paginate("aEvt", rows, 10);
  return h`${admTable([
    { label: "Event", render: (e) => h`<div class="row" style="flex-wrap:nowrap"><img src="${e.image}" alt="" style="width:64px;height:40px;object-fit:cover;border-radius:8px;flex:none"><b>${e.title}</b></div>` }, { label: "Date", render: (e) => fmtDate(e.date), cls: "nowrap" }, { label: "Time", render: (e) => fmtTime24(e.time), cls: "nowrap" }, { label: "Venue", render: (e) => e.venue },
    { label: "Registrations", render: (e) => fmtNum(e.registration_count) }, { label: "Status", render: (e) => statusPill(e.status === "Draft" ? "Draft" : e.date >= today ? "Upcoming" : "Completed") },
    { label: "Actions", render: (e) => h`<div class="actions">${ab("event-view", e.id, "View", "eye")}${ab("adm-evt-edit", e.id, "Edit", "edit")}${ab("adm-evt-delete", e.id, "Delete", "trash")}</div>` }
  ], slice, { wide: true, empty: "No events found." })}${pg}`;
};
Actions["adm-evt-edit"] = (el) => {
  const e = el.dataset.id ? API.get("events", el.dataset.id) : {};
  Modal.open({ title: e.id ? "Edit event" : "Create event", eyebrow: "Events", size: "lg", body: h`<form data-submit="adm-evt-save" data-id="${e.id || ""}" novalidate><div class="form-grid">
    ${field({ label: "Title", name: "title", required: true, value: e.title, span: true, attrs: 'maxlength="120"' })}${field({ label: "Date", name: "date", type: "date", required: true, value: e.date })}${field({ label: "Time", name: "time", type: "time", required: true, value: e.time || "10:00" })}
    ${field({ label: "Venue", name: "venue", required: true, value: e.venue, attrs: 'maxlength="120"' })}${field({ label: "Registration link", name: "registration_link", type: "url", value: e.registration_link, placeholder: "https:// (optional)" })}
    ${field({ label: "Description", name: "description", type: "textarea", required: true, value: e.description, span: true, attrs: 'maxlength="1500"' })}
    <div class="field span-2"><span class="field-label">Event image</span><div class="file-drop"><img class="preview-thumb" id="evtPrev" src="${e.image || art("meetup", 99)}" alt="Preview"><div class="grow"><input type="file" name="image" accept="image/jpeg,image/png,image/webp" data-preview="#evtPrev" aria-label="Event image"><div class="hint small muted">JPG, PNG or WEBP · 16:9 works best</div></div></div><span class="err"></span></div>
    ${field({ label: "Status", name: "status", options: ["Published", "Draft"], value: e.status || "Published" })}
  </div><div class="form-actions"><button type="button" class="btn btn-ghost" data-action="modal-close">Cancel</button><button class="btn btn-primary" type="submit">${icon("check")}Save event</button></div></form>`, onMount: (m) => bindFilePreviews(m) });
};
Actions["adm-evt-save"] = async (form) => {
  const v = validate(form, { title: [req()], date: [req()], time: [req()], venue: [req()], description: [req()], registration_link: [vUrl] }); if (!v) return;
  await busy(form.querySelector('[type="submit"]'), "Saving…", async () => {
    try { const inp = form.querySelector('[name="image"]'); const data = { title: v.title, date: v.date, time: v.time, venue: v.venue, description: v.description, registration_link: v.registration_link, status: v.status };
      if (inp.files[0]) data.image = inp._dataUrl || await readImageFile(inp.files[0]);
      if (form.dataset.id) { await API.update("events", form.dataset.id, data); audit("Edited event", v.title); }
      else { data.image = data.image || art(["meetup", "seminar", "workshop", "cultural"][Math.floor(Math.random() * 4)], Date.now()); data.registrations = []; data.registration_count = 0; await API.insert("events", data); audit("Created event", v.title); if (v.status === "Published") { notify(null, "event", "New event: " + v.title, `${fmtDate(v.date)} · ${v.venue}`, "#events"); API.quiet("dashboard_live_feed", { type: "event", title: "New event: " + v.title, body: `${fmtDate(v.date)} · ${v.venue}`, status: "Published" }); } }
      Modal.close(); toast("success", "Event saved", v.title); Admin.rerender(); }
    catch (e) { toast("error", "Could not save event.", e.message); }
  });
};
Actions["adm-evt-delete"] = async (el) => { const e = API.get("events", el.dataset.id); if (!(await confirmDialog({ title: "Delete event?", message: `${e.title} will be permanently removed.`, confirmText: "Delete", danger: true }))) return; await API.remove("events", e.id); audit("Deleted event", e.title); toast("success", "Event deleted"); Admin.rerender(); };

/* ---------- Notices CRUD ---------- */
AdminPanels.notices = () => {
  const u = uiOf("aNtc", { sort: "new" });
  return h`${admToolbar(h`${searchFilter("aNtc.q", u.q, "Search notices…")}${selectFilter("aNtc.cat", u.cat, NOTICE_CATEGORIES, "All categories")}${selectFilter("aNtc.status", u.status, ["Published", "Draft"], "All statuses")}${sortSelect("aNtc", u.sort, [["new", "Newest first"], ["old", "Oldest first"]])}<button class="btn btn-ghost btn-sm" data-action="clear-filters" data-group="aNtc">${icon("x", "ico ico-sm")}Clear</button><button class="btn btn-primary btn-sm" data-action="adm-ntc-edit" data-id="">${icon("plus", "ico ico-sm")}Create notice</button>`)}
    ${Admin.listRender("aNtc", AdminLists.notices)}`;
};
AdminLists.notices = () => {
  const u = uiOf("aNtc"); const rows = applySort(API.all("notices").filter((n) => textMatch(u.q, [n.title, n.notice_no]) && (!u.cat || n.category === u.cat) && (!u.status || n.status === u.status)), u.sort, { new: ["date", "desc"], old: ["date", "asc"] });
  const { slice, pager: pg } = paginate("aNtc", rows, 10);
  return h`${admTable([
    { label: "Notice No.", render: (n) => h`<span class="mono small nowrap">${n.notice_no}</span>` }, { label: "Title", render: (n) => h`<b>${n.title}</b>` }, { label: "Category", render: (n) => n.category }, { label: "Priority", render: (n) => h`<span class="chip ${n.priority === "Urgent" ? "violet" : n.priority === "Important" ? "gold" : "slate"}">${n.priority}</span>` },
    { label: "Date", render: (n) => fmtDate(n.date), cls: "nowrap" }, { label: "Attachment", render: (n) => n.attachment_name || "—" }, { label: "Status", render: (n) => statusPill(n.status) },
    { label: "Actions", render: (n) => h`<div class="actions">${ab("adm-ntc-edit", n.id, "Edit", "edit")}${ab("adm-ntc-toggle", n.id, n.status === "Published" ? "Unpublish" : "Publish", n.status === "Published" ? "eyeOff" : "globe", n.status === "Published" ? "btn-ghost" : "btn-primary")}${ab("adm-ntc-delete", n.id, "Delete", "trash")}</div>` }
  ], slice, { wide: true, empty: "No notices found." })}${pg}`;
};
Actions["adm-ntc-edit"] = (el) => {
  const n = el.dataset.id ? API.get("notices", el.dataset.id) : { notice_no: nextNo("notices", "notice_no", `FPAA/NOT/${new Date().getFullYear()}/`, 3), date: isoDay(new Date()), priority: "Normal", status: "Published" };
  Modal.open({ title: n.id ? "Edit notice" : "Create notice", eyebrow: "Notices", size: "lg", body: h`<form data-submit="adm-ntc-save" data-id="${n.id || ""}" novalidate><div class="form-grid">
    ${field({ label: "Title", name: "title", required: true, value: n.title, span: true, attrs: 'maxlength="140"' })}${field({ label: "Notice number", name: "notice_no", required: true, value: n.notice_no })}${field({ label: "Date", name: "date", type: "date", required: true, value: n.date })}
    ${field({ label: "Category", name: "category", required: true, options: NOTICE_CATEGORIES, value: n.category, placeholder: "Select" })}${field({ label: "Priority", name: "priority", options: ["Normal", "Important", "Urgent"], value: n.priority })}
    ${field({ label: "Description", name: "description", type: "textarea", required: true, value: n.description, span: true, attrs: 'maxlength="2000"' })}
    <div class="field span-2"><label for="ntcFile">Attachment ${n.attachment_name ? h`<span class="muted">(current: ${n.attachment_name})</span>` : ""}</label><input id="ntcFile" type="file" name="attachment" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" class="input"><span class="hint">PDF, image or Word document · max 3 MB</span><span class="err"></span></div>
    ${field({ label: "Status", name: "status", options: ["Published", "Draft"], value: n.status })}
  </div><div class="form-actions"><button type="button" class="btn btn-ghost" data-action="modal-close">Cancel</button><button class="btn btn-primary" type="submit">${icon("check")}Save notice</button></div></form>` });
};
Actions["adm-ntc-save"] = async (form) => {
  const v = validate(form, { title: [req()], notice_no: [req(), [(x) => !API.find("notices", (n) => n.notice_no === x && n.id !== form.dataset.id), "This notice number already exists."]], date: [req()], category: [req()], description: [req()] }); if (!v) return;
  await busy(form.querySelector('[type="submit"]'), "Saving…", async () => {
    try { const f = form.querySelector('[name="attachment"]').files[0]; const data = { title: v.title, notice_no: v.notice_no, date: v.date, category: v.category, priority: v.priority, description: v.description, status: v.status };
      if (f) { data.attachment_data = await readAnyFile(f, 3); data.attachment_name = f.name; }
      if (form.dataset.id) { await API.update("notices", form.dataset.id, data); audit("Edited notice", v.notice_no); }
      else { data.attachment_name = data.attachment_name || ""; data.attachment_data = data.attachment_data || null; await API.insert("notices", data); audit("Created notice", v.notice_no); if (v.status === "Published") { notify(null, "notice", v.title, v.notice_no, "#notices"); API.quiet("dashboard_live_feed", { type: "notice", title: v.title, body: `${v.notice_no} · ${v.category}`, status: "Published" }); } }
      Modal.close(); toast("success", "Notice saved", v.notice_no); Admin.rerender(); }
    catch (e) { fieldError(form, "attachment", e.message); toast("error", "Could not save notice.", e.message); }
  });
};
Actions["adm-ntc-toggle"] = async (el) => { const n = API.get("notices", el.dataset.id); const st = n.status === "Published" ? "Draft" : "Published"; await busy(el, "Updating…", () => API.update("notices", n.id, { status: st })); audit(`Notice ${st === "Published" ? "published" : "unpublished"}`, n.notice_no); toast("success", st === "Published" ? "Notice published" : "Notice unpublished", n.notice_no); Admin.rerender(); };
Actions["adm-ntc-delete"] = async (el) => { const n = API.get("notices", el.dataset.id); if (!(await confirmDialog({ title: "Delete notice?", message: `${n.notice_no} will be permanently removed.`, confirmText: "Delete", danger: true }))) return; await API.remove("notices", n.id); audit("Deleted notice", n.notice_no); toast("success", "Notice deleted"); Admin.rerender(); };

/* ---------- Achievements CRUD ---------- */
AdminPanels.achievements = () => {
  const u = uiOf("aAch", { sort: "new" });
  return h`${admToolbar(h`${searchFilter("aAch.q", u.q, "Search achievements…")}${selectFilter("aAch.status", u.status, ["Published", "Pending", "Draft"], "All statuses")}${sortSelect("aAch", u.sort, [["new", "Newest first"], ["old", "Oldest first"]])}<button class="btn btn-ghost btn-sm" data-action="clear-filters" data-group="aAch">${icon("x", "ico ico-sm")}Clear</button><button class="btn btn-primary btn-sm" data-action="adm-ach-edit" data-id="">${icon("plus", "ico ico-sm")}Create achievement</button>`)}
    ${Admin.listRender("aAch", AdminLists.achievements)}`;
};
AdminLists.achievements = () => {
  const u = uiOf("aAch"); const rows = applySort(API.all("achievements").filter((a) => textMatch(u.q, [a.member_name, a.title, a.organization]) && (!u.status || a.status === u.status)), u.sort, { new: ["date", "desc"], old: ["date", "asc"] });
  const { slice, pager: pg } = paginate("aAch", rows, 10);
  return h`${admTable([
    { label: "Achievement", render: (a) => h`<div class="row" style="flex-wrap:nowrap"><img src="${a.photo}" alt="" style="width:56px;height:40px;object-fit:cover;border-radius:8px;flex:none"><div><b>${a.title}</b><div class="small muted">${a.member_name}</div></div></div>` }, { label: "Organization", render: (a) => a.organization }, { label: "Date", render: (a) => fmtDate(a.date), cls: "nowrap" }, { label: "Status", render: (a) => statusPill(a.status) },
    { label: "Actions", render: (a) => h`<div class="actions">${ab("ach-view", a.id, "View", "eye")}${ab("adm-ach-edit", a.id, "Edit", "edit")}${ab("adm-ach-toggle", a.id, a.status === "Published" ? "Unpublish" : "Publish", a.status === "Published" ? "eyeOff" : "globe", a.status === "Published" ? "btn-ghost" : "btn-primary")}${ab("adm-ach-delete", a.id, "Delete", "trash")}</div>` }
  ], slice, { wide: true, empty: "No achievements found." })}${pg}`;
};
Actions["adm-ach-edit"] = (el) => { const a = el.dataset.id ? API.get("achievements", el.dataset.id) : {}; Modal.open({ title: a.id ? "Edit achievement" : "Create achievement", eyebrow: "Achievements", size: "lg", body: Achievements.form(a, true), onMount: (m) => bindFilePreviews(m) }); };
Actions["adm-ach-save"] = async (form) => {
  const v = validate(form, Achievements.rules); if (!v) return;
  await busy(form.querySelector('[type="submit"]'), "Saving…", async () => {
    try { const inp = form.querySelector('[name="photo"]'); const data = { member_name: v.member_name, title: v.title, organization: v.organization, date: v.date, description: v.description, status: v.status };
      if (inp.files[0]) data.photo = inp._dataUrl || await readImageFile(inp.files[0]);
      if (form.dataset.id) await API.update("achievements", form.dataset.id, data); else { data.photo = data.photo || art("trophy", Date.now()); await API.insert("achievements", data); if (v.status === "Published") API.quiet("dashboard_live_feed", { type: "achievement", title: `${v.member_name}: ${v.title}`, body: v.organization, status: "Published" }); }
      audit("Saved achievement", v.title); Modal.close(); toast("success", "Achievement saved", v.title); Admin.rerender(); }
    catch (e) { toast("error", "Could not save achievement.", e.message); }
  });
};
Actions["adm-ach-toggle"] = async (el) => { const a = API.get("achievements", el.dataset.id); const st = a.status === "Published" ? "Draft" : "Published"; await busy(el, "Updating…", () => API.update("achievements", a.id, { status: st })); audit(`Achievement ${st.toLowerCase()}`, a.title); if (st === "Published" && a.submitted_by) notify(a.submitted_by, "achievement", "Your achievement is published", a.title, "#achievements"); toast("success", st === "Published" ? "Achievement published" : "Achievement unpublished"); Admin.rerender(); };
Actions["adm-ach-delete"] = async (el) => { const a = API.get("achievements", el.dataset.id); if (!(await confirmDialog({ title: "Delete achievement?", message: `${a.title} will be permanently removed.`, confirmText: "Delete", danger: true }))) return; await API.remove("achievements", a.id); audit("Deleted achievement", a.title); toast("success", "Achievement deleted"); Admin.rerender(); };

/* ---------- Memories moderation ---------- */
AdminPanels.memories = () => {
  const u = uiOf("aMem", { sort: "new" });
  return h`${admToolbar(h`${searchFilter("aMem.q", u.q, "Search caption, member…")}${selectFilter("aMem.status", u.status, ["Pending", "Approved", "Published"], "All statuses")}${sortSelect("aMem", u.sort, [["new", "Newest first"], ["old", "Oldest first"]])}<button class="btn btn-ghost btn-sm" data-action="clear-filters" data-group="aMem">${icon("x", "ico ico-sm")}Clear</button><button class="btn btn-primary btn-sm" data-action="adm-memory-edit" data-id="">${icon("upload", "ico ico-sm")}Upload memory</button>`)}
    ${Admin.listRender("aMem", AdminLists.memories)}`;
};
AdminLists.memories = () => {
  const u = uiOf("aMem"); const rows = applySort(API.all("memories").filter((m) => textMatch(u.q, [m.caption, m.member_name, m.batch]) && (!u.status || m.status === u.status)), u.sort, { new: ["created_at", "desc"], old: ["created_at", "asc"] });
  const { slice, pager: pg } = paginate("aMem", rows, 10);
  return h`${admTable([
    { label: "Photo", render: (m) => h`<img src="${m.photo}" alt="" style="width:72px;height:48px;object-fit:cover;border-radius:8px">` }, { label: "Caption", render: (m) => h`<b>${m.caption}</b>` }, { label: "Member", render: (m) => m.member_name }, { label: "Batch", render: (m) => m.batch, cls: "nowrap" }, { label: "Year", render: (m) => m.year }, { label: "Status", render: (m) => statusPill(m.status) },
    { label: "Actions", render: (m) => h`<div class="actions">${m.status === "Pending" ? ab("adm-memory-status", m.id, "Approve", "check", "btn-success", 'data-status="Approved"') : ""}${m.status !== "Published" ? ab("adm-memory-status", m.id, "Publish", "globe", "btn-primary", 'data-status="Published"') : ab("adm-memory-status", m.id, "Unpublish", "eyeOff", "btn-ghost", 'data-status="Approved"')}${ab("adm-memory-edit", m.id, "Edit", "edit")}${ab("adm-memory-delete", m.id, "Delete", "trash")}</div>` }
  ], slice, { wide: true, empty: "No memories found." })}${pg}`;
};
Actions["adm-memory-status"] = async (el) => { const m = API.get("memories", el.dataset.id); const st = el.dataset.status; await busy(el, "Updating…", () => API.update("memories", m.id, { status: st })); audit(`Memory ${st.toLowerCase()}`, m.caption); if (st === "Published" && m.user_id) notify(m.user_id, "memory", "Your memory is published", m.caption, "#memories"); toast("success", `Memory ${st.toLowerCase()}`); Admin.rerender(); };
Actions["adm-memory-edit"] = (el) => { const m = el.dataset.id ? API.get("memories", el.dataset.id) : {}; Modal.open({ title: m.id ? "Edit memory" : "Upload memory", eyebrow: "Memories", size: "lg", body: memoryForm(m, true), onMount: (mm) => bindFilePreviews(mm) }); };
Actions["adm-memory-save"] = async (form) => {
  const v = validate(form, { caption: [req()], batch: [req()], year: [req()], member_name: [req()] }); if (!v) return;
  const inp = form.querySelector('[name="photo"]'); if (!form.dataset.id && !inp.files[0]) { fieldError(form, "photo", "Please choose a photo."); return; }
  await busy(form.querySelector('[type="submit"]'), "Saving…", async () => {
    try { const data = { caption: v.caption, batch: v.batch, year: Number(v.year), member_name: v.member_name, status: v.status }; if (inp.files[0]) data.photo = await readImageFile(inp.files[0]);
      if (form.dataset.id) await API.update("memories", form.dataset.id, data); else await API.insert("memories", Object.assign(data, { user_id: S.profile.id }));
      audit("Saved memory", v.caption); Modal.close(); toast("success", "Memory saved"); Admin.rerender(); }
    catch (e) { toast("error", "Could not save memory.", e.message); }
  });
};
Actions["adm-memory-delete"] = async (el) => { const m = API.get("memories", el.dataset.id); if (!(await confirmDialog({ title: "Delete memory?", message: `"${m.caption}" will be permanently removed.`, confirmText: "Delete", danger: true }))) return; await API.remove("memories", m.id); audit("Deleted memory", m.caption); toast("success", "Memory deleted"); Admin.rerender(); };

/* ---------- Notifications ---------- */
AdminPanels.notifications = () => {
  const list = sortBy(API.all("notifications"), "created_at").slice(0, 60);
  const aud = (n) => !n.user_id ? "All members" : n.user_id === "admins" ? "Admins" : (API.get("profiles", n.user_id) || {}).full_name || "Member";
  return h`<section class="glass card"><div class="card-head"><div><span class="eyebrow">${icon("send", "ico ico-sm")} Send</span><h3>Send a notification</h3></div></div>
      <form data-submit="adm-notif-send" novalidate><div class="form-grid">
        ${field({ label: "Audience", name: "audience", options: [{ value: "all", label: "All members" }, { value: "admins", label: "Admins only" }, { value: "member", label: "Specific member (by membership no.)" }], value: "all" })}${field({ label: "Membership No. (for specific member)", name: "membership_no", placeholder: "FPAA-M-2026-000001", attrs: 'style="text-transform:uppercase"' })}
        ${field({ label: "Type", name: "type", options: ["notice", "event", "membership", "donation", "job", "support", "scheme", "achievement"], value: "notice" })}${field({ label: "Link", name: "link", options: ROUTES.filter((r) => !r.admin).map((r) => ({ value: "#" + r.id, label: r.label })), value: "#notices" })}
        ${field({ label: "Title", name: "title", required: true, span: true, attrs: 'maxlength="100"' })}${field({ label: "Message", name: "message", required: true, span: true, attrs: 'maxlength="240"' })}
      </div><div class="form-actions"><button class="btn btn-primary" type="submit">${icon("send")}Send notification</button></div></form></section>
    <section class="glass card section"><div class="card-head"><div><span class="eyebrow">History</span><h3>Recent notifications</h3></div></div>
      ${admTable([{ label: "Type", render: (n) => h`<span class="chip slate">${n.type}</span>` }, { label: "Notification", render: (n) => h`<b>${n.title}</b><div class="small muted">${n.message}</div>` }, { label: "Audience", render: (n) => aud(n) }, { label: "Read by", render: (n) => (n.read_by || []).length }, { label: "Sent", render: (n) => relTime(n.created_at), cls: "nowrap" }, { label: "Actions", render: (n) => ab("adm-notif-delete", n.id, "Delete", "trash") }], list, { empty: "No notifications." })}</section>`;
};
Actions["adm-notif-send"] = async (form) => {
  const v = validate(form, { title: [req()], message: [req()], membership_no: [[(x, a) => a.audience !== "member" || RX.membership.test(normMembership(x)), "Enter a valid membership number."]] }); if (!v) return;
  let uid = null;
  if (v.audience === "admins") uid = "admins";
  if (v.audience === "member") { const m = API.find("members", (x) => x.membership_no === normMembership(v.membership_no)); if (!m) return fieldError(form, "membership_no", "No member with this number."); if (!m.user_id) return fieldError(form, "membership_no", "This member has no linked FPAA Connect 2.0 account yet."); uid = m.user_id; }
  await busy(form.querySelector('[type="submit"]'), "Sending…", async () => { await API.insert("notifications", { user_id: uid, type: v.type, title: v.title, message: v.message, link: v.link, read_by: [] }); audit("Sent notification", v.title); refreshBadges(); toast("success", "Notification sent"); Admin.rerender(); });
};
Actions["adm-notif-delete"] = async (el) => { await API.remove("notifications", el.dataset.id); refreshBadges(); toast("success", "Notification deleted"); Admin.rerender(); };

/* ---------- Super Admin: alumni accounts ---------- */
AdminPanels.accounts = () => {
  const u = uiOf("aAcc", { sort: "new" });
  return h`<section class="glass card"><div class="card-head"><div><span class="eyebrow">${icon("userPlus", "ico ico-sm")} Super Admin</span><h3>Create alumni account</h3><p class="sub">Create a login, assign a role and optionally link an existing membership record.</p></div></div>
      ${API.mode === "supabase" ? h`<div style="margin-bottom:14px">${alertBox("info", "Supabase mode", "Auth users must be created server-side (Edge Function or the Supabase dashboard). This form writes the profile and role; the member then signs up with the same email to set a password.")}</div>` : ""}
      <form data-submit="adm-acc-create" novalidate><div class="form-grid">
        ${field({ label: "Full name", name: "full_name", required: true, attrs: 'maxlength="80"' })}${field({ label: "Email (login)", name: "email", type: "email", required: true })}
        ${field({ label: "Role", name: "role", options: Object.entries(ROLES).map(([k, l]) => ({ value: k, label: l })), value: "member" })}${field({ label: "Mobile number", name: "mobile", type: "tel", required: true, hint: "Used for the member's recovery key.", attrs: 'inputmode="numeric" maxlength="16"' })}
        ${field({ label: "Link membership no. (optional)", name: "membership_no", placeholder: "FPAA-M-2026-000001", attrs: 'style="text-transform:uppercase"' })}${field({ label: "Assign membership category", name: "category", options: CATEGORIES.map((c) => c.name), placeholder: "Keep current category" })}
      </div><div class="form-actions"><button class="btn btn-primary" type="submit">${icon("userPlus")}Create account</button></div><div class="form-msg" id="accMsg"></div></form></section>
    <section class="section">${admToolbar(h`${searchFilter("aAcc.q", u.q, "Search name, email…")}${selectFilter("aAcc.role", u.role, Object.entries(ROLES).map(([k, l]) => ({ value: k, label: l })), "All roles")}${selectFilter("aAcc.status", u.status, ["Active", "Disabled"], "All statuses")}<button class="btn btn-ghost btn-sm" data-action="clear-filters" data-group="aAcc">${icon("x", "ico ico-sm")}Clear</button>`)}
      ${Admin.listRender("aAcc", AdminLists.accounts)}</section>`;
};
AdminLists.accounts = () => {
  const u = uiOf("aAcc"); const rows = sortBy(API.all("profiles").filter((p) => textMatch(u.q, [p.full_name, p.email]) && (!u.role || p.role === u.role) && (!u.status || p.status === u.status)), "created_at");
  const { slice, pager: pg } = paginate("aAcc", rows, 12);
  return h`${admTable([
    { label: "Account", render: (p) => h`<b>${p.full_name}</b><div class="small muted">${p.email}</div>` }, { label: "Role", render: (p) => h`<span class="chip ${p.role === "member" ? "" : "gold"}">${ROLES[p.role]}</span>` },
    { label: "Linked member", render: (p) => { const m = p.member_id && API.get("members", p.member_id); return m ? h`<span class="mono small">${m.membership_no}</span>` : statusPill("Not linked"); } },
    { label: "Authentication", render: (p) => p.auth_method }, { label: "Last login", render: (p) => p.last_login ? relTime(p.last_login) : "Never", cls: "nowrap" }, { label: "Status", render: (p) => statusPill(p.status) },
    { label: "Actions", render: (p) => p.id === S.profile.id ? h`<span class="small muted">You</span>` : h`<div class="actions">${ab("adm-acc-link", p.id, "Link member", "link")}${ab("adm-acc-role", p.id, "Role", "shield")}${ab("adm-acc-reset", p.id, "Reset password", "key")}${ab("adm-acc-toggle", p.id, p.status === "Active" ? "Disable" : "Enable", p.status === "Active" ? "ban" : "check", p.status === "Active" ? "btn-danger" : "btn-success")}</div>` }
  ], slice, { wide: true, empty: "No accounts found." })}${pg}`;
};
function tempPassword() { const c = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"; let s = ""; const r = randomToken(12); for (let i = 0; i < 10; i++) s += c[parseInt(r.slice(i * 2, i * 2 + 2), 16) % c.length]; return s + "@1"; }
function showTempPassword(email, pw, key) {
  Modal.open({ title: "Temporary password", eyebrow: email, size: "sm", body: h`<p class="small muted">Share this password securely with the member. It is shown only once — ask them to sign in and change it with Forgot password.</p><div class="row" style="margin-top:10px"><code class="mono" style="font-size:1.1rem;padding:10px 14px;border-radius:10px;background:#fff;border:1px solid var(--line)">${pw}</code><button class="btn btn-ghost btn-sm" data-action="copy-text" data-text="${pw}">${icon("copy", "ico ico-sm")}Copy</button></div>${key ? h`<p class="small" style="margin-top:12px">Recovery key: <b class="mono">${key}</b> (first 4 letters of name + last 4 digits of mobile)</p>` : ""}`, foot: h`<button class="btn btn-primary" data-action="modal-close">Done</button>` });
}
Actions["copy-text"] = (el) => copyText(el.dataset.text);
Actions["adm-acc-create"] = async (form) => {
  if (!can("admin.accounts")) return toast("error", "Super Admin only");
  const v = validate(form, { full_name: [req()], email: [req(), vEmail, [(x) => !API.find("profiles", (p) => p.email.toLowerCase() === x.toLowerCase()), "An account with this email already exists."]], mobile: [req(), vMobile, [(x) => !API.find("profiles", (p) => Auth.profileMobile(p) === normMobile(x)), "This mobile number is already registered."]], membership_no: [[(x) => !x || RX.membership.test(normMembership(x)), "Use format FPAA-M-YYYY-NNNNNN."]] }); if (!v) return;
  let member = null;
  if (v.membership_no) { member = API.find("members", (m) => m.membership_no === normMembership(v.membership_no)); if (!member) return fieldError(form, "membership_no", "No membership with this number."); if (member.user_id) return fieldError(form, "membership_no", "Already linked to another account."); }
  await busy(form.querySelector('[type="submit"]'), "Creating…", async () => {
    try {
      const pw = tempPassword(); const salt = randomToken(8);
      const p = await API.insert("profiles", { email: v.email.toLowerCase(), full_name: v.full_name, mobile: normMobile(v.mobile), role: v.role, member_id: member ? member.id : null, auth_method: "Email + Password", status: "Active", salt, password_hash: API.mode === "demo" ? await hashPassword(pw, salt) : null, last_login: null });
      if (member) await API.update("members", member.id, Object.assign({ user_id: p.id }, v.category ? { category: v.category } : {}));
      if (v.role !== "member") await API.insert("committee_roles", { user_id: p.id, role: v.role, assigned_at: new Date().toISOString() });
      notify(p.id, "membership", "Welcome to FPAA Connect 2.0", member ? `Your account is linked to ${member.membership_no}.` : "Link your membership from My FPAA.", "#my-fpaa");
      audit("Created account", v.email); form.reset(); Filters.aAcc();
      toast("success", "Account created", v.email); if (API.mode === "demo") showTempPassword(v.email, pw, Auth.recoveryKey(v.full_name, v.mobile));
    } catch (e) { formMsg($("#accMsg"), "error", "Could not create account.", e.message); }
  });
};
Actions["adm-acc-link"] = async (el) => {
  const p = API.get("profiles", el.dataset.id); const no = await promptDialog({ title: `Link membership — ${p.full_name}`, label: "Membership number", placeholder: "FPAA-M-2026-000001", multiline: false, confirmText: "Link" }); if (!no) return;
  const m = API.find("members", (x) => x.membership_no === normMembership(no)); if (!m) return toast("error", "Membership not found", normMembership(no)); if (m.user_id && m.user_id !== p.id) return toast("error", "Already linked", "This membership is linked to another account.");
  if (p.member_id && p.member_id !== m.id) { const old = API.get("members", p.member_id); if (old) await API.update("members", old.id, { user_id: null }); }
  await API.update("members", m.id, { user_id: p.id }); await API.update("profiles", p.id, { member_id: m.id }); audit("Linked member to account", `${m.membership_no} → ${p.email}`); toast("success", "Membership linked", `${m.membership_no} → ${p.full_name}`); Admin.rerender();
};
Actions["adm-acc-role"] = (el) => {
  const p = API.get("profiles", el.dataset.id);
  Modal.open({ title: "Change role", eyebrow: p.email, size: "sm", body: h`<form data-submit="adm-acc-role-save" data-id="${p.id}">${field({ label: "Role", name: "role", options: Object.entries(ROLES).map(([k, l]) => ({ value: k, label: l })), value: p.role })}<div class="form-actions"><button type="button" class="btn btn-ghost" data-action="modal-close">Cancel</button><button class="btn btn-primary" type="submit">Save role</button></div></form>` });
};
Actions["adm-acc-role-save"] = async (form) => { const p = API.get("profiles", form.dataset.id); const role = formValues(form).role; await API.update("profiles", p.id, { role }); const cr = API.find("committee_roles", (c) => c.user_id === p.id); if (role === "member" && cr) await API.remove("committee_roles", cr.id); else if (role !== "member") { if (cr) await API.update("committee_roles", cr.id, { role }); else await API.insert("committee_roles", { user_id: p.id, role, assigned_at: new Date().toISOString() }); } audit(`Changed role to ${ROLES[role]}`, p.email); Modal.close(); toast("success", "Role updated", `${p.full_name} → ${ROLES[role]}`); Admin.rerender(); };
Actions["adm-acc-reset"] = async (el) => {
  const p = API.get("profiles", el.dataset.id);
  if (API.mode === "supabase") { toast("info", "Use the recovery key", `${p.full_name} can reset their password from Forgot password using their recovery key.`); return; }
  if (!(await confirmDialog({ title: "Reset password?", message: `A new temporary password will be generated for ${p.email}.`, confirmText: "Reset" }))) return;
  const pw = tempPassword(); await API.update("profiles", p.id, { password_hash: await hashPassword(pw, p.salt) }); audit("Reset password", p.email); showTempPassword(p.email, pw);
};
Actions["adm-acc-toggle"] = async (el) => { const p = API.get("profiles", el.dataset.id); const st = p.status === "Active" ? "Disabled" : "Active"; await busy(el, "Updating…", () => API.update("profiles", p.id, { status: st })); audit(`Account ${st.toLowerCase()}`, p.email); toast("success", `Account ${st.toLowerCase()}`, p.email); Admin.rerender(); };

/* =====================================================================
   REPORTS — finance summaries, charts, exports
   ===================================================================== */
const Reports = {
  memberByEmail() { const m = {}; API.all("members").forEach((x) => (m[(x.email || "").toLowerCase()] = x)); return m; },
  transactions(f = {}) {
    const mbe = this.memberByEmail();
    const tx = API.all("payments").map((p) => ({ kind: "Membership", ref: p.application_no, name: p.member_name, category: p.category, department: p.department || "", amount: Number(p.amount) || 0, status: p.status, date: p.paid_at, mode: p.mode, reference: p.reference }))
      .concat(API.all("donations").map((d) => ({ kind: "Donation", ref: d.donation_no, name: d.donor_name, category: d.purpose, department: d.department || (mbe[(d.email || "").toLowerCase()] || {}).department || "", amount: Number(d.amount) || 0, status: d.status, date: d.donated_at, mode: d.payment_mode, reference: d.payment_ref })));
    return tx.filter((t) => (!f.from || t.date.slice(0, 10) >= f.from) && (!f.to || t.date.slice(0, 10) <= f.to) && (!f.dept || t.department === f.dept) &&
      (!f.cat || (f.cat === "__donations" ? t.kind === "Donation" : t.kind === "Membership" && t.category === f.cat))).sort((a, b) => b.date.localeCompare(a.date));
  },
  summary(f) {
    const tx = this.transactions(f); const ver = tx.filter((t) => t.status === "Verified");
    return { membership: sum(ver.filter((t) => t.kind === "Membership"), (t) => t.amount), donation: sum(ver.filter((t) => t.kind === "Donation"), (t) => t.amount), total: sum(ver, (t) => t.amount),
      pending: sum(tx.filter((t) => t.status === "Pending"), (t) => t.amount), rejected: sum(tx.filter((t) => t.status === "Rejected"), (t) => t.amount), count: tx.length, tx };
  },
  lastMonths(n) { const out = []; const d = new Date(); d.setDate(1); for (let i = n - 1; i >= 0; i--) { const x = new Date(d.getFullYear(), d.getMonth() - i, 1); out.push({ key: `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`, label: MONTHS[x.getMonth()] + " " + String(x.getFullYear()).slice(2) }); } return out; },
  monthly(months, f) { const tx = this.transactions(f).filter((t) => t.status === "Verified"); return months.map((m) => ({ membership: sum(tx.filter((t) => t.kind === "Membership" && t.date.startsWith(m.key)), (t) => t.amount), donation: sum(tx.filter((t) => t.kind === "Donation" && t.date.startsWith(m.key)), (t) => t.amount) })); }
};
AdminPanels.finance = () => {
  const u = uiOf("aFin"); const f = { from: u.from, to: u.to, dept: u.dept, cat: u.cat };
  return h`${admToolbar(h`<label class="field" style="flex:0 1 170px"><span class="field-label">From</span><input class="input" type="date" data-filter="aFin.from" value="${u.from || ""}"></label><label class="field" style="flex:0 1 170px"><span class="field-label">To</span><input class="input" type="date" data-filter="aFin.to" value="${u.to || ""}"></label>
      ${selectFilter("aFin.dept", u.dept, DEPARTMENTS, "All departments")}${selectFilter("aFin.cat", u.cat, CATEGORIES.map((c) => ({ value: c.name, label: c.name })).concat([{ value: "__donations", label: "Donations only" }]), "All categories")}
      <button class="btn btn-ghost btn-sm" data-action="clear-filters" data-group="aFin">${icon("x", "ico ico-sm")}Clear</button><button class="btn btn-soft btn-sm" data-action="adm-export" data-what="finance" data-fmt="csv">${icon("download", "ico ico-sm")}CSV</button><button class="btn btn-soft btn-sm" data-action="adm-export" data-what="finance" data-fmt="xlsx">${icon("table", "ico ico-sm")}Excel</button>`)}
    ${Admin.listRender("aFin", () => AdminLists.finance(f))}`;
};
AdminLists.finance = () => {
  const u = uiOf("aFin"); const f = { from: u.from, to: u.to, dept: u.dept, cat: u.cat }; const s = Reports.summary(f);
  const months = Reports.lastMonths(8); const mon = Reports.monthly(months, f);
  const kpi = (label, v, ic, tone) => h`<div class="glass stat-card"><span class="ico-tile ${tone}">${icon(ic)}</span><div class="sc-body"><div class="sc-label">${label}</div><div class="sc-value" style="font-size:1.45rem">${fmtINR(v)}</div></div></div>`;
  const ver = s.tx.filter((t) => t.status === "Verified");
  const srcSeg = CATEGORIES.map((c, i) => ({ label: c.name, value: sum(ver.filter((t) => t.kind === "Membership" && t.category === c.name), (t) => t.amount), color: CHART_COLORS[i + 1] })).concat([{ label: "Donations", value: s.donation, color: "#D7A52B" }]);
  const byCat = CATEGORIES.map((c) => { const t = s.tx.filter((x) => x.kind === "Membership" && x.category === c.name); return { name: c.name, count: t.length, verified: sum(t.filter((x) => x.status === "Verified"), (x) => x.amount), pending: sum(t.filter((x) => x.status === "Pending"), (x) => x.amount), rejected: sum(t.filter((x) => x.status === "Rejected"), (x) => x.amount) }; });
  const byPurpose = DONATION_PURPOSES.map((p) => { const t = s.tx.filter((x) => x.kind === "Donation" && x.category === p); return { name: p, count: t.length, verified: sum(t.filter((x) => x.status === "Verified"), (x) => x.amount), pending: sum(t.filter((x) => x.status === "Pending"), (x) => x.amount), rejected: sum(t.filter((x) => x.status === "Rejected"), (x) => x.amount) }; }).filter((r) => r.count);
  const brk = [{ label: "Category", render: (r) => h`<b>${r.name}</b>` }, { label: "Transactions", render: (r) => r.count }, { label: "Verified", render: (r) => fmtINR(r.verified) }, { label: "Pending", render: (r) => fmtINR(r.pending) }, { label: "Rejected", render: (r) => fmtINR(r.rejected) }];
  const { slice, pager: pg } = paginate("aFinTx", s.tx, 12);
  Filters.aFinTx = () => setHTML($('[data-list="aFin"]'), AdminLists.finance());
  return h`<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">${kpi("Membership revenue", s.membership, "idcard", "")}${kpi("Donation revenue", s.donation, "heart", "gold")}${kpi("Total verified", s.total, "check", "teal")}${kpi("Pending", s.pending, "clock", "violet")}${kpi("Rejected", s.rejected, "ban", "soft")}</div>
    <div class="grid section split-2">
      <div class="glass card"><div class="card-head"><div><span class="eyebrow">Trend</span><h3>Verified revenue by month</h3></div></div>${barChart(months.map((m) => m.label), [{ name: "Membership", color: "#3B82F6", values: mon.map((x) => x.membership) }, { name: "Donations", color: "#D7A52B", values: mon.map((x) => x.donation) }], { money: true, height: 260 })}</div>
      <div class="glass card"><div class="card-head"><div><span class="eyebrow">Sources</span><h3>Revenue by source</h3></div></div>${donutChart("fsrc", srcSeg, fmtINR(s.total).replace("₹", "₹"), "Verified")}</div></div>
    <div class="grid grid-2 section"><div class="glass card"><div class="card-head"><div><span class="eyebrow">Membership</span><h3>By membership category</h3></div></div>${admTable(brk, byCat)}</div><div class="glass card"><div class="card-head"><div><span class="eyebrow">Donations</span><h3>By purpose</h3></div></div>${admTable(brk, byPurpose, { empty: "No donations found." })}</div></div>
    <div class="glass card section"><div class="card-head"><div><span class="eyebrow">Ledger</span><h3>Transactions (${fmtNum(s.tx.length)})</h3></div></div>
      ${admTable([{ label: "Type", render: (t) => h`<span class="chip ${t.kind === "Donation" ? "gold" : ""}">${t.kind}</span>` }, { label: "Reference", render: (t) => h`<span class="mono small">${t.ref}</span>` }, { label: "Name", render: (t) => t.name }, { label: "Category / Purpose", render: (t) => t.category }, { label: "Department", render: (t) => t.department || "—" }, { label: "Amount", render: (t) => h`<b>${fmtINR(t.amount)}</b>` }, { label: "Date", render: (t) => fmtDate(t.date), cls: "nowrap" }, { label: "Status", render: (t) => statusPill(t.status) }], slice, { wide: true, empty: "No transactions for these filters." })}${pg}</div>`;
};
AdminMounts.finance = () => { Filters.aFin = () => { setHTML($('[data-list="aFin"]'), AdminLists.finance()); bindChartHover($('[data-list="aFin"]')); }; };

/* ---- Exports ---- */
Actions["adm-export"] = (el) => {
  const what = el.dataset.what, fmt = el.dataset.fmt; const stamp = isoDay(new Date()); const full = can("members.fullMobile");
  const defs = {
    members: [AdminLists.memberRows(), [{ label: "Membership Number", key: "membership_no" }, { label: "Name", key: "full_name" }, { label: "Email", key: "email" }, { label: "Mobile", get: (m) => full ? m.mobile : maskMobile(m.mobile) }, { label: "Department", key: "department" }, { label: "Admission Year", key: "admission_year" }, { label: "Passing Year", key: "passing_year" }, { label: "Profession", key: "profession" }, { label: "Company", key: "company" }, { label: "Category", key: "category" }, { label: "Status", key: "status" }, { label: "Member Since", key: "member_since" }, { label: "Valid Till", key: "valid_till" }, { label: "Created Date", get: (m) => fmtDate(m.created_at) }]],
    applications: [AdminLists.appRows(), [{ label: "Application No", key: "application_no" }, { label: "Name", key: "full_name" }, { label: "Email", key: "email" }, { label: "Mobile", get: (a) => full ? a.mobile : maskMobile(a.mobile) }, { label: "Category", key: "category" }, { label: "Department", key: "department" }, { label: "Amount", key: "amount" }, { label: "Payment Mode", key: "payment_mode" }, { label: "Reference", key: "payment_ref" }, { label: "Payment Status", key: "payment_status" }, { label: "Status", key: "status" }, { label: "Submitted", get: (a) => fmtDate(a.submitted_at) }]],
    donations: [AdminLists.donRows(), [{ label: "Donation No", key: "donation_no" }, { label: "Donor", key: "donor_name" }, { label: "Email", key: "email" }, { label: "Purpose", key: "purpose" }, { label: "Amount", key: "amount" }, { label: "Payment Mode", key: "payment_mode" }, { label: "Reference", key: "payment_ref" }, { label: "Status", key: "status" }, { label: "Date", get: (d) => fmtDate(d.donated_at) }]],
    payments: [API.all("payments").filter((p) => { const u = uiOf("aPay"); return textMatch(u.q, [p.member_name, p.application_no, p.reference]) && (!u.status || p.status === u.status) && (!u.mode || p.mode === u.mode); }), [{ label: "Application", key: "application_no" }, { label: "Member", key: "member_name" }, { label: "Category", key: "category" }, { label: "Amount", key: "amount" }, { label: "Mode", key: "mode" }, { label: "Reference", key: "reference" }, { label: "Date", get: (p) => fmtDate(p.paid_at) }, { label: "Status", key: "status" }, { label: "Verified By", key: "verified_by" }]],
    schemes: [AdminLists.schRows(), [{ label: "Application No", key: "application_no" }, { label: "Applicant", key: "applicant_name" }, { label: "Scheme", get: (a) => (Schemes.all().find((s) => s.id === a.scheme_id) || {}).name }, { label: "Gender", key: "gender" }, { label: "Department", key: "department" }, { label: "Semester", key: "semester" }, { label: "Percentage", key: "percentage" }, { label: "Family Income", key: "family_income" }, { label: "Status", key: "status" }, { label: "Submitted", get: (a) => fmtDate(a.submitted_at) }]],
    finance: [(() => { const u = uiOf("aFin"); return Reports.transactions({ from: u.from, to: u.to, dept: u.dept, cat: u.cat }); })(), [{ label: "Type", key: "kind" }, { label: "Reference", key: "ref" }, { label: "Name", key: "name" }, { label: "Category / Purpose", key: "category" }, { label: "Department", key: "department" }, { label: "Amount (INR)", key: "amount" }, { label: "Mode", key: "mode" }, { label: "Payment Reference", key: "reference" }, { label: "Date", get: (t) => fmtDate(t.date) }, { label: "Status", key: "status" }]]
  };
  const [rows, cols] = defs[what]; if (!rows.length) return toast("warn", "Nothing to export", "No rows match the current filters.");
  const name = `FPAA-${what}-${stamp}`;
  audit(`Exported ${what} (${fmt.toUpperCase()})`, `${rows.length} rows`);
  if (fmt === "csv") exportCSV(name + ".csv", rows, cols); else return busy(el, "Exporting…", () => exportExcel(name + ".xlsx", what, rows, cols));
};
/* =====================================================================
   BOOT
   ===================================================================== */
function safeUrl(u) { const s = String(u || "").trim(); return /^https?:\/\//i.test(s) ? s : "#"; }

async function boot() {
  const page = document.body.dataset.page;
  $$("[data-logo]").forEach((img) => { img.src = CONFIG.LOGO_URL; });
  const view = $("#view"); if (view) setHTML(view, loadingBlock("Loading FPAA Connect 2.0…"));
  try { await API.init(); await Auth.restore(); }
  catch (err) {
    console.error(err);
    const msg = alertBox("error", "Could not load FPAA Connect 2.0.", "Please try again. " + (err && err.message ? err.message : ""));
    if (view) setHTML(view, h`<div class="glass card">${msg}<div class="form-actions"><button class="btn btn-primary" onclick="location.reload()">Retry</button></div></div>`);
    else if ($("#loginCard")) setHTML($("#loginCard"), msg);
    return;
  }
  if (page === "login") { LoginPage.init(); return; }

  bindGlobalEvents(); Nav.all(); Chat.renderLauncher(); Router.render();

  // Presence + session housekeeping
  S.timers.push(setInterval(() => Chat.tickPresence(), 30000));
  S.timers.push(setInterval(() => { if (API.mode === "demo" && S.profile && !Auth.readSession()) { toast("warn", "Session expired", "Please sign in again."); setTimeout(() => (location.href = "login.html"), 1500); } }, 60000));
  if (API.mode === "supabase") supabaseClient.auth.onAuthStateChange(async (evt) => { if (evt === "SIGNED_OUT" || evt === "SIGNED_IN") { await Auth.restore(); Nav.all(); Router.render(); } });
  if (API.mode === "demo" && !localStorage.getItem("fpaa_demo_hint")) { localStorage.setItem("fpaa_demo_hint", "1"); setTimeout(() => toast("info", "Demo mode", "Sample data is stored in this browser. Sign in with member@fpaa.in / Member@123 or admin@fpaa.in / Admin@123.", 9000), 800); }
}

// Debug handle for developers (read-only use in the console)
window.FPAA = { get state() { return S; }, API, Router, Auth, version: "1.0.0" };

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
