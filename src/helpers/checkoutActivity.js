import { baseURL } from '@/libs/utils';

const SESSION_COOKIE = 'session_id';
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (storage lifetime)
const SESSION_CHANGED_EVENT = 'checkout-session-changed';

/** True after this page load has chosen a session (refresh starts a new one). */
let pageSessionLocked = false;

function readCookie(name) {
  if (typeof document === 'undefined') return null;
  return (
    document.cookie
      .split('; ')
      .find((r) => r.startsWith(`${name}=`))
      ?.split('=')
      .slice(1)
      .join('=') || null
  );
}

function writeCookie(name, value, maxAgeSeconds = SESSION_COOKIE_MAX_AGE) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}`;
}

function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
}

function setSessionCookie(sessionId) {
  writeCookie(SESSION_COOKIE, sessionId);
}

function notifySessionChanged(sessionId) {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(
      new CustomEvent(SESSION_CHANGED_EVENT, { detail: { sessionId } }),
    );
  } catch (_) {
    /* ignore */
  }
}

function getSessionIdFromCookie() {
  return readCookie(SESSION_COOKIE);
}

function lockSession(sessionId) {
  setSessionCookie(sessionId);
  pageSessionLocked = true;
  return sessionId;
}

/**
 * Full page refresh = new session row.
 * Same page (typing, upload, client navigation) keeps this session.
 * Recovery resume / in-flight upload can lock an explicit id.
 */
export function ensureActiveCheckoutSessionId(preferredSessionId) {
  if (typeof document === 'undefined') {
    return (preferredSessionId && String(preferredSessionId).trim()) || null;
  }

  const preferred =
    preferredSessionId && String(preferredSessionId).trim()
      ? String(preferredSessionId).trim()
      : null;

  if (pageSessionLocked) {
    const current = getSessionIdFromCookie() || preferred;
    if (current) return lockSession(current);
  }

  const next = generateSessionId();
  lockSession(next);
  notifySessionChanged(next);
  return next;
}

/**
 * Force-bind a session (recovery email ?resume=1&session_id=...).
 */
export function bindCheckoutSessionId(sessionId) {
  if (!sessionId || typeof document === 'undefined') return null;
  const id = String(sessionId).trim();
  if (!id) return null;
  lockSession(id);
  notifySessionChanged(id);
  return id;
}

/**
 * Keep an explicit session (uploads / in-flight work). Does not start a new row.
 */
export function touchCheckoutSessionId(sessionId) {
  if (!sessionId || typeof document === 'undefined') {
    return ensureActiveCheckoutSessionId(sessionId);
  }
  const id = String(sessionId).trim();
  if (!id) return ensureActiveCheckoutSessionId(null);
  return lockSession(id);
}

/** Live session for this page load. */
export function getCheckoutSessionId(fallbackSessionId) {
  return ensureActiveCheckoutSessionId(fallbackSessionId);
}

export { SESSION_CHANGED_EVENT };

let debounceTimers = {};

function debounceFieldUpdate(key, fn, delay = 2000) {
  if (debounceTimers[key]) clearTimeout(debounceTimers[key]);
  debounceTimers[key] = setTimeout(fn, delay);
}

export async function trackCheckoutEvent(payload = {}) {
  try {
    // If caller already chose a session (upload / resume), keep it.
    const session_id = payload.session_id
      ? touchCheckoutSessionId(payload.session_id)
      : ensureActiveCheckoutSessionId(null);
    if (!session_id) return;

    const body = {
      ...payload,
      session_id,
    };

    await fetch(`${baseURL}/api/checkout-sessions/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch (err) {
    console.warn('trackCheckoutEvent skipped:', err?.message || err);
  }
}

export function trackCheckoutEventDebounced(key, payload, delay) {
  debounceFieldUpdate(key, () => trackCheckoutEvent(payload), delay);
}

export async function trackFileUploaded({ sessionId, orderType, pagePath, file }) {
  if (!file?.key || !orderType) return;
  // Keep the upload session (S3 key prefix) — do not rotate mid-upload.
  const session_id = sessionId
    ? touchCheckoutSessionId(sessionId)
    : ensureActiveCheckoutSessionId(null);
  if (!session_id) return;

  // Sequence: form_started then file_uploaded (same session_id as S3 key)
  await trackCheckoutEvent({
    session_id,
    order_type: orderType,
    event: 'form_started',
    page_path: pagePath,
  });
  return trackCheckoutEvent({
    session_id,
    order_type: orderType,
    event: 'file_uploaded',
    page_path: pagePath,
    file: {
      key: file.key,
      name: file.name,
      size: file.size,
      mimeType: file.mimeType || file.type,
    },
  });
}

export function trackFileRemoved({ sessionId, orderType, pagePath, file }) {
  if (!file?.key || !orderType) return;
  const session_id = sessionId
    ? touchCheckoutSessionId(sessionId)
    : ensureActiveCheckoutSessionId(null);
  if (!session_id) return;
  return trackCheckoutEvent({
    session_id,
    order_type: orderType,
    event: 'file_removed',
    page_path: pagePath,
    file: { key: file.key, name: file.name },
  });
}

export function trackPageView({ sessionId, pagePath }) {
  return trackCheckoutEvent({
    session_id: sessionId,
    event: 'page_view',
    page_path: pagePath,
  });
}

export function sendCheckoutHeartbeat({ sessionId, orderType, pagePath }) {
  if (typeof navigator === 'undefined' || !navigator.sendBeacon) return;
  const session_id = ensureActiveCheckoutSessionId(sessionId);
  if (!session_id) return;
  try {
    navigator.sendBeacon(
      `${baseURL}/api/checkout-sessions/track`,
      new Blob(
        [
          JSON.stringify({
            session_id,
            order_type: orderType || undefined,
            event: 'heartbeat',
            page_path: pagePath,
          }),
        ],
        { type: 'application/json' },
      ),
    );
  } catch (_) {
    /* ignore */
  }
}

export function initCheckoutHeartbeat(sessionId, orderType, pagePath) {
  if (typeof document === 'undefined') return () => {};
  const handler = () => {
    if (document.visibilityState === 'hidden') {
      sendCheckoutHeartbeat({ sessionId, orderType, pagePath });
    }
  };
  document.addEventListener('visibilitychange', handler);
  return () => document.removeEventListener('visibilitychange', handler);
}
