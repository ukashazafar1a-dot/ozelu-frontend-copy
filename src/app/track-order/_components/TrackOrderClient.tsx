'use client';

import { useEffect, useState } from 'react';
import { baseURL } from '@/libs/utils';
import ExpectedArrivalBanner from './ExpectedArrivalBanner';
import TrackingStepper from './TrackingStepper';
import TrackingMap from './TrackingMap';
import OrderSummaryCard from './OrderSummaryCard';
import CustomerServiceFooter from './CustomerServiceFooter';

type PublicTracking = {
  order_id: string;
  order_type: string;
  received_at?: string | null;
  expected_delivery_at?: string | null;
  expected_delivery_label?: string | null;
  courier_tracking_url?: string | null;
  customer?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    area?: string | null;
  };
  items_summary?: { label: string; total: number }[];
  totals?: {
    subtotal?: number;
    delivery_charges?: number | null;
    free_delivery?: boolean;
    free_delivery_threshold?: number | null;
    total?: number;
  };
  stages?: Array<{
    key: string;
    title: string;
    status: string;
    completed_at?: string | null;
    by_name?: string | null;
    by_role?: string | null;
    view_proof?: boolean;
    proof_media?: Array<{ url?: string | null; content_type?: string | null }>;
    show_courier_link?: boolean;
  }>;
  map?: {
    mode?: 'static' | 'courier_link' | 'live' | 'waiting' | 'completed';
    destination?: { lat?: number | null; lng?: number | null; address?: string };
    courier?: {
      lat: number;
      lng: number;
      heading?: number | null;
      updated_at?: string;
      name?: string | null;
    } | null;
    eta_minutes?: number | null;
    trail?: { lat: number; lng: number }[];
  };
};

export default function TrackOrderClient({ orderId }: { orderId: string }) {
  const [tracking, setTracking] = useState<PublicTracking | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(
          `${baseURL}/api/orders/public/track/${encodeURIComponent(orderId)}`,
        );
        const data = await res.json();
        if (!res.ok || !data?.status) {
          throw new Error(data?.message || 'Order not found');
        }
        if (!cancelled) setTracking(data.tracking);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Unable to load tracking');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    const mode = tracking?.map?.mode;
    if (mode !== 'live' && mode !== 'waiting') return;
    const t = setInterval(() => {
      fetch(`${baseURL}/api/orders/public/track/${encodeURIComponent(orderId)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d?.status) setTracking(d.tracking);
        })
        .catch(() => undefined);
    }, 10000);
    return () => clearInterval(t);
  }, [orderId, tracking?.map?.mode]);

  if (loading) {
    return (
      <div className="track-order-page">
        <div className="container py-5 text-center track-order-page__inner">
          Loading tracking…
        </div>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="track-order-page">
        <div className="container py-5 text-center track-order-page__inner">
          <h1 className="h4">Track Your Order</h1>
          <p className="text-muted mb-0">{error || 'Order not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="track-order-page">
      <div className="container py-4 track-order-page__inner">
        <ExpectedArrivalBanner
          label={tracking.expected_delivery_label}
          at={tracking.expected_delivery_at}
        />

        <TrackingStepper
          stages={tracking.stages || []}
          courierTrackingUrl={tracking.courier_tracking_url}
        />

        <TrackingMap map={tracking.map} address={tracking.map?.destination?.address || ''} />

        <OrderSummaryCard tracking={tracking} />

        <CustomerServiceFooter />
      </div>
    </div>
  );
}
