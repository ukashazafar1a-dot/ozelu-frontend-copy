'use client';

const FREE_DELIVERY_COLOR = '#6ec1cd';

type Tracking = {
  order_id: string;
  received_at?: string | null;
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
};

function formatDeliveryAmount(n: number) {
  const num = Number(n) || 0;
  return Number.isInteger(num) ? String(num) : String(parseFloat(num.toFixed(2)));
}

/** Match admin / storefront: always "{N} AED ✕ {message}" (even when N is 0). */
function FreeDeliveryLabel({
  strikeAmount,
  message,
}: {
  strikeAmount: number;
  message: string;
}) {
  const amount = Number(strikeAmount) || 0;

  return (
    <>
      <span className="text-muted" style={{ textDecoration: 'line-through' }}>
        {formatDeliveryAmount(amount)} AED
      </span>
      <span
        aria-hidden="true"
        style={{
          color: FREE_DELIVERY_COLOR,
          marginLeft: '0.65rem',
          marginRight: '0.65rem',
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        ✕
      </span>
      <span style={{ color: FREE_DELIVERY_COLOR }}>{message}</span>
    </>
  );
}

function DeliveryChargesRow({
  charges,
  freeDelivery,
  threshold,
}: {
  charges: number | null | undefined;
  freeDelivery: boolean;
  threshold?: number | null;
}) {
  const hasCharges = charges !== null && charges !== undefined;
  const amount = hasCharges ? Number(charges) || 0 : 0;
  const thr = Number(threshold) || 0;

  // Threshold free: order met minimum — show before area-free label
  if (freeDelivery && thr > 0) {
    const message = `Free Delivery Above ${formatDeliveryAmount(thr)} AED`;
    return (
      <div>
        Delivery Charges: <FreeDeliveryLabel strikeAmount={amount} message={message} />
      </div>
    );
  }

  if (freeDelivery) {
    return (
      <div>
        Delivery Charges: <FreeDeliveryLabel strikeAmount={amount} message="Free Delivery" />
      </div>
    );
  }

  // Area has 0 listed fee (order below threshold)
  if (hasCharges && amount === 0) {
    return (
      <div>
        Delivery Charges:{' '}
        <FreeDeliveryLabel strikeAmount={0} message="Free Delivery to Your Area" />
      </div>
    );
  }

  // No delivery field (soft-copy / retouch) or paid delivery
  return <div>Delivery Charges: AED {amount.toFixed(2)}</div>;
}

export default function OrderSummaryCard({ tracking }: { tracking: Tracking }) {
  const c = tracking.customer || {};
  const dateStr = tracking.received_at
    ? new Date(tracking.received_at).toDateString()
    : '—';

  return (
    <div className="track-order-card mb-4">
      <div className="track-order-card__meta">
        <div>
          <span className="track-order-card__label">Order no</span>
          <span className="track-order-card__value">{tracking.order_id}</span>
        </div>
        <div>
          <span className="track-order-card__label">Order date</span>
          <span className="track-order-card__value">{dateStr}</span>
        </div>
      </div>
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <h3>Delivery address</h3>
          <div className="track-order-card__row">{c.address || '—'}</div>
          <div className="track-order-card__row">City: {c.city || '—'}</div>
          <div className="track-order-card__row">Area: {c.area || '—'}</div>
        </div>
        <div className="col-md-6">
          <h3>Contact information</h3>
          <div className="track-order-card__row">Name: {c.name || '—'}</div>
          <div className="track-order-card__row">Email: {c.email || '—'}</div>
          <div className="track-order-card__row">Phone: {c.phone || '—'}</div>
        </div>
      </div>
      <table className="table table-sm mb-2">
        <thead>
          <tr>
            <th>SERVICE</th>
            <th className="text-end">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {(tracking.items_summary || []).map((row, i) => (
            <tr key={i}>
              <td>{row.label}</td>
              <td className="text-end">AED {Number(row.total || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-end small">
        <div>Sub Total: AED {Number(tracking.totals?.subtotal || 0).toFixed(2)}</div>
        <DeliveryChargesRow
          charges={tracking.totals?.delivery_charges}
          freeDelivery={!!tracking.totals?.free_delivery}
          threshold={tracking.totals?.free_delivery_threshold}
        />
        <div className="fw-semibold">
          Total: AED {Number(tracking.totals?.total || 0).toFixed(2)}
        </div>
      </div>
    </div>
  );
}
