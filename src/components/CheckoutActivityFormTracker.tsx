'use client';

import { useEffect, useRef } from 'react';
import { useFormikContext } from 'formik';
import { usePathname } from 'next/navigation';
import useCheckoutActivity from '@/hooks/useCheckoutActivity';
import { baseURL } from '@/libs/utils';
import { bindCheckoutSessionId } from '@/helpers/checkoutActivity';

type Props = {
  orderType: string;
};

/**
 * Tracks checkout activity and optionally resumes partial customer fields
 * from ?resume=1&session_id= (recovery email deep link).
 */
export default function CheckoutActivityFormTracker({
  orderType,
}: Props) {
  const { values, setFieldValue } = useFormikContext<any>();
  const pathname = usePathname();
  const resumedRef = useRef(false);
  const resumeBoundRef = useRef(false);

  // Bind recovery session before any track effects run (same row on resume).
  if (typeof window !== 'undefined' && !resumeBoundRef.current) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('resume') === '1') {
      const resumeSessionId = params.get('session_id');
      if (resumeSessionId) {
        bindCheckoutSessionId(resumeSessionId);
        resumeBoundRef.current = true;
      }
    }
  }

  useCheckoutActivity(orderType, {
    pagePath: pathname,
    customer: {
      firstname: values?.firstname || values?.name,
      lastname: values?.lastname,
      email: values?.email,
      phone: values?.phone,
      city: values?.city,
      area: values?.area,
      address: values?.address,
    },
  });

  useEffect(() => {
    if (resumedRef.current || typeof window === 'undefined' || !orderType) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('resume') !== '1') return;
    const sessionId = params.get('session_id');
    if (!sessionId) return;

    resumedRef.current = true;
    let cancelled = false;

    (async () => {
      try {
        const qs = new URLSearchParams({ order_type: orderType });
        const res = await fetch(
          `${baseURL}/api/checkout-sessions/public/${encodeURIComponent(sessionId)}?${qs}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        const customer = data?.session?.customer;
        if (!customer || cancelled) return;

        if ('name' in (values || {}) && customer.firstname && !values.name) {
          setFieldValue('name', customer.firstname, false);
        }

        const fields = [
          'firstname',
          'lastname',
          'email',
          'phone',
          'city',
          'area',
          'address',
        ] as const;

        for (const field of fields) {
          const val = customer[field];
          if (!val) continue;
          if (!(field in (values || {}))) continue;
          if (values[field]) continue;
          setFieldValue(field, val, false);
        }
      } catch (err) {
        console.warn('checkout resume skipped:', (err as Error)?.message || err);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Intentionally once on mount for resume deep-link
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderType]);

  return null;
}
