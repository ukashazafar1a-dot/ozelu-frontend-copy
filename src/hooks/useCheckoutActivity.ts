'use client';

import { useEffect, useRef } from 'react';
import useApp from '@/store/useApp';
import {
  trackCheckoutEvent,
  trackCheckoutEventDebounced,
  initCheckoutHeartbeat,
  getCheckoutSessionId,
} from '@/helpers/checkoutActivity';

type CustomerFields = {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  city?: string;
  area?: string;
  address?: string;
};

type Options = {
  pagePath?: string;
  customer?: CustomerFields;
  enabled?: boolean;
};

/** Real user-entered contact — not auto-selected city/area on form load. */
function hasTypedContact(customer: CustomerFields = {}) {
  return [customer.firstname, customer.lastname, customer.email, customer.phone, customer.address].some(
    (v) => v && String(v).trim(),
  );
}

/** Dedupe React Strict Mode double-mount only (in-memory; refresh clears). */
const recentPageViews = new Map();

function shouldSendPageView(trackKey: string) {
  const now = Date.now();
  const last = recentPageViews.get(trackKey);
  if (last && now - last < 1500) return false;
  recentPageViews.set(trackKey, now);
  return true;
}

export default function useCheckoutActivity(orderType: string, options: Options = {}) {
  const { sessionId: appSessionId } = useApp();
  const { pagePath = '', customer = {}, enabled = true } = options;
  const formStartedRef = useRef(false);

  const firstname = customer?.firstname || '';
  const lastname = customer?.lastname || '';
  const email = customer?.email || '';
  const phone = customer?.phone || '';
  const city = customer?.city || '';
  const area = customer?.area || '';
  const address = customer?.address || '';

  // New session (refresh / resume bind) must restart form_started tracking.
  useEffect(() => {
    formStartedRef.current = false;
  }, [appSessionId]);

  // Fire page_view on every form-page visit. Full refresh starts a new session row.
  useEffect(() => {
    if (!enabled || !orderType) return undefined;

    let cancelled = false;
    let cleanupHeartbeat: (() => void) | undefined;

    const sendPageView = () => {
      const session_id = getCheckoutSessionId(appSessionId);
      if (!session_id) return false;

      const trackKey = `${session_id}:${orderType}:${pagePath}`;
      if (!shouldSendPageView(trackKey)) {
        cleanupHeartbeat = initCheckoutHeartbeat(session_id, orderType, pagePath);
        return true;
      }

      trackCheckoutEvent({
        session_id,
        order_type: orderType,
        event: 'page_view',
        page_path: pagePath,
      });
      cleanupHeartbeat = initCheckoutHeartbeat(session_id, orderType, pagePath);
      return true;
    };

    if (!sendPageView()) {
      const timer = window.setTimeout(() => {
        if (!cancelled) sendPageView();
      }, 150);
      return () => {
        cancelled = true;
        window.clearTimeout(timer);
        cleanupHeartbeat?.();
      };
    }

    return () => {
      cancelled = true;
      cleanupHeartbeat?.();
    };
  }, [enabled, orderType, pagePath, appSessionId]);

  useEffect(() => {
    if (!enabled || !orderType) return;

    const session_id = getCheckoutSessionId(appSessionId);
    if (!session_id) return;

    const customerPayload = {
      firstname,
      lastname,
      email,
      phone,
      city,
      area,
      address,
    };

    // Many forms auto-set city on mount — that must NOT count as typing contact info.
    if (!hasTypedContact(customerPayload)) return;

    if (!formStartedRef.current) {
      formStartedRef.current = true;
      trackCheckoutEvent({
        session_id,
        order_type: orderType,
        event: 'form_started',
        page_path: pagePath,
      });
    }

    trackCheckoutEventDebounced(
      `${session_id}:${orderType}:fields`,
      {
        session_id,
        order_type: orderType,
        event: 'field_update',
        page_path: pagePath,
        customer: customerPayload,
      },
      Number(process.env.NEXT_PUBLIC_CHECKOUT_FIELD_DEBOUNCE_MS) || 2000,
    );
  }, [
    enabled,
    orderType,
    appSessionId,
    pagePath,
    firstname,
    lastname,
    email,
    phone,
    city,
    area,
    address,
  ]);

  const markFormStarted = () => {
    const session_id = getCheckoutSessionId(appSessionId);
    if (!enabled || !orderType || !session_id || formStartedRef.current) return;
    formStartedRef.current = true;
    trackCheckoutEvent({
      session_id,
      order_type: orderType,
      event: 'form_started',
      page_path: pagePath,
    });
  };

  return { markFormStarted };
}
