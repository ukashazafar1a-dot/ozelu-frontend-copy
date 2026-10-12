'use client';

type Props = {
  label?: string | null;
  at?: string | null;
};

function formatExactDateTime(at: string) {
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return null;
  const datePart = d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timePart = d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
  // Prefer "before" over locale "at" — ETA is a deadline, not an exact minute
  return `${datePart} before ${timePart}`;
}

function formatBanner(at?: string | null, label?: string | null) {
  const trimmedLabel = label && String(label).trim() ? String(label).trim() : '';
  const exact = at ? formatExactDateTime(at) : null;

  if (exact) {
    return {
      headline: exact,
      detail: trimmedLabel || undefined,
    };
  }

  if (trimmedLabel) {
    return {
      headline: trimmedLabel,
      detail: 'We will confirm the exact delivery time shortly.',
    };
  }

  return {
    headline: 'Soon',
    detail: 'We will update your delivery time shortly.',
  };
}

export default function ExpectedArrivalBanner({ label, at }: Props) {
  const { headline, detail } = formatBanner(at, label);
  return (
    <div className="track-order-banner rounded-4 text-center text-white mb-4 px-3 py-4">
      <div className="track-order-banner__kicker">Expected to arrive</div>
      <div className="track-order-banner__headline px-2 mt-1">{headline}</div>
      {detail ? <div className="small mt-1 opacity-75">{detail}</div> : null}
    </div>
  );
}
