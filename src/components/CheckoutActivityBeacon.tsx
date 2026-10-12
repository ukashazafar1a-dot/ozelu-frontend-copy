'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import useApp from '@/store/useApp';
import { trackPageView, getCheckoutSessionId } from '@/helpers/checkoutActivity';

export default function CheckoutActivityBeacon() {
  const pathname = usePathname();
  const { sessionId } = useApp();
  const lastPathRef = useRef('');

  useEffect(() => {
    if (!pathname) return;

    const tryTrack = () => {
      const session_id = getCheckoutSessionId(sessionId);
      if (!session_id) return false;
      if (lastPathRef.current === pathname) return true;
      lastPathRef.current = pathname;
      trackPageView({ sessionId: session_id, pagePath: pathname });
      return true;
    };

    if (!tryTrack()) {
      const timer = window.setTimeout(tryTrack, 150);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [pathname, sessionId]);

  return null;
}
