'use client';

import { useEffect, useRef, useState } from 'react';

export type PublicMap = {
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

type Props = { map?: PublicMap; address?: string };

const TRUCK_ICON = '/images/track-truck.svg';
const DEFAULT_CENTER: [number, number] = [24.4539, 54.3773];
const NEARBY_KM = 25;

function googleEmbedSrc(address?: string) {
  const q = encodeURIComponent(address || 'Dubai, United Arab Emirates');
  return `https://maps.google.com/maps?q=${q}&z=12&output=embed`;
}

function GoogleAddressMap({ address }: { address?: string }) {
  return (
    <div className="track-order-map mb-4">
      <iframe
        className="track-order-map__iframe"
        title="Delivery map"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={googleEmbedSrc(address)}
      />
    </div>
  );
}

function loadLeaflet(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  const w = window as any;
  if (w.L) return Promise.resolve(w.L);
  if (w.__demoLeafletPromise) return w.__demoLeafletPromise;
  w.__demoLeafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-demo-leaflet]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.dataset.demoLeaflet = '1';
      document.head.appendChild(link);
    }
    const existing = document.querySelector('script[data-demo-leaflet]');
    const onReady = () => resolve(w.L);
    if (existing) {
      existing.addEventListener('load', onReady);
      existing.addEventListener('error', () => reject(new Error('leaflet failed')));
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.async = true;
    s.dataset.demoLeaflet = '1';
    s.onload = onReady;
    s.onerror = () => reject(new Error('leaflet failed'));
    document.head.appendChild(s);
  });
  return w.__demoLeafletPromise;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function etaMinutes(lat1: number, lng1: number, lat2: number, lng2: number) {
  const km = haversineKm(lat1, lng1, lat2, lng2);
  const minutes = Math.round((km / 25) * 60);
  return Math.min(180, Math.max(1, minutes || 1));
}

async function geocodeNominatim(address: string) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`,
  );
  const rows = await res.json();
  const lat = Number(rows?.[0]?.lat);
  const lng = Number(rows?.[0]?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function publicCourierLabel(name?: string | null) {
  const n = (name || '').trim();
  if (!n || /admin/i.test(n) || /^demo/i.test(n)) return 'Your courier';
  return n;
}

const HOME_PIN = `
  <svg class="track-map__home" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M14 0C7.4 0 2 5.3 2 11.8c0 8.4 12 24.2 12 24.2s12-15.8 12-24.2C26 5.3 20.6 0 14 0z" fill="#e11d48"/>
    <circle cx="14" cy="12" r="5.2" fill="#fff"/>
    <path d="M14 8.6l3.4 3.1h-1.1v2.7h-4.6v-2.7H10.6z" fill="#e11d48"/>
  </svg>
`;

function OwnDeliveryMap({ map, address }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<any>(null);
  const destPosRef = useRef<{ lat: number; lng: number } | null>(null);
  const geocodeTriedRef = useRef(false);
  const [resolvedDest, setResolvedDest] = useState<{ lat: number; lng: number } | null>(null);

  const dest = map?.destination || {};
  const destAddress = dest.address || address || '';
  const mode = map?.mode || 'static';
  const live = mode === 'live' && map?.courier && Number.isFinite(Number(map.courier.lat));
  const courier = live ? map?.courier : null;
  const trail = live ? map?.trail || [] : [];
  const trailKey = trail.map((p) => `${p.lat},${p.lng}`).join('|');

  useEffect(() => {
    if (!hostRef.current) return;
    let cancelled = false;

    const fromServer =
      dest.lat != null &&
      dest.lng != null &&
      Number.isFinite(Number(dest.lat)) &&
      Number.isFinite(Number(dest.lng))
        ? { lat: Number(dest.lat), lng: Number(dest.lng) }
        : null;
    if (fromServer) destPosRef.current = fromServer;

    async function resolveDest() {
      if (destPosRef.current) return destPosRef.current;
      if (geocodeTriedRef.current || !destAddress) return null;
      geocodeTriedRef.current = true;
      try {
        destPosRef.current = await geocodeNominatim(destAddress);
      } catch {
        destPosRef.current = null;
      }
      if (destPosRef.current && !cancelled) setResolvedDest(destPosRef.current);
      return destPosRef.current;
    }

    async function mount() {
      const L = await loadLeaflet();
      if (cancelled || !hostRef.current) return;
      const destPos = await resolveDest();
      if (cancelled || !hostRef.current) return;

      const houseIcon = L.divIcon({
        className: 'track-map-marker',
        html: HOME_PIN,
        iconSize: [28, 36],
        iconAnchor: [14, 36],
      });
      const heading = Number(courier?.heading) || 0;
      const truckIcon = L.divIcon({
        className: 'track-map-marker',
        html: `<div class="track-map__truck"><img src="${TRUCK_ICON}" alt="" style="transform:rotate(${heading}deg)" /></div>`,
        iconSize: [52, 52],
        iconAnchor: [26, 26],
      });

      if (!leafletRef.current) {
        const center: [number, number] = courier
          ? [courier.lat, courier.lng]
          : destPos
            ? [destPos.lat, destPos.lng]
            : DEFAULT_CENTER;
        const instance = L.map(hostRef.current, {
          zoomControl: true,
          attributionControl: true,
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
        }).addTo(instance);
        instance.setView(center, courier ? 15 : 13);
        instance.invalidateSize();
        leafletRef.current = {
          map: instance,
          house: destPos
            ? L.marker([destPos.lat, destPos.lng], { icon: houseIcon, title: 'Delivery address' }).addTo(instance)
            : null,
          truck: null,
          line: L.polyline([], { color: '#0f766e', weight: 4, opacity: 0.85 }).addTo(instance),
          followed: false,
        };
      }

      const layer = leafletRef.current;
      if (destPos && !layer.house) {
        layer.house = L.marker([destPos.lat, destPos.lng], {
          icon: houseIcon,
          title: 'Delivery address',
        }).addTo(layer.map);
      } else if (destPos && layer.house) {
        layer.house.setLatLng([destPos.lat, destPos.lng]);
      }

      if (courier) {
        if (!layer.truck) {
          layer.truck = L.marker([courier.lat, courier.lng], {
            icon: truckIcon,
            title: 'Your courier',
          }).addTo(layer.map);
        } else {
          layer.truck.setLatLng([courier.lat, courier.lng]);
          layer.truck.setIcon(truckIcon);
        }
        layer.line.setLatLngs(trail.map((p) => [p.lat, p.lng]));

        const nearby =
          destPos && haversineKm(courier.lat, courier.lng, destPos.lat, destPos.lng) < NEARBY_KM;
        if (nearby && destPos && !layer.followed) {
          layer.map.fitBounds(
            [
              [courier.lat, courier.lng],
              [destPos.lat, destPos.lng],
            ],
            { padding: [48, 48], maxZoom: 15 },
          );
          layer.followed = true;
        } else if (!layer.followed) {
          layer.map.setView([courier.lat, courier.lng], 15);
          layer.followed = true;
        } else {
          layer.map.panTo([courier.lat, courier.lng], { animate: true, duration: 0.6 });
        }
      } else {
        if (layer.truck) {
          layer.map.removeLayer(layer.truck);
          layer.truck = null;
        }
        layer.line.setLatLngs([]);
        layer.followed = false;
        if (destPos) layer.map.setView([destPos.lat, destPos.lng], 13);
      }

      requestAnimationFrame(() => layer.map.invalidateSize());
    }

    mount().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [
    courier?.lat,
    courier?.lng,
    courier?.heading,
    dest.lat,
    dest.lng,
    destAddress,
    trailKey,
    live,
  ]);

  useEffect(() => {
    return () => {
      if (leafletRef.current?.map) {
        leafletRef.current.map.remove();
        leafletRef.current = null;
      }
    };
  }, []);

  const destForEta =
    resolvedDest ||
    (dest.lat != null && dest.lng != null
      ? { lat: Number(dest.lat), lng: Number(dest.lng) }
      : destPosRef.current);
  const eta =
    live && courier
      ? map?.eta_minutes != null
        ? map.eta_minutes
        : destForEta
          ? etaMinutes(courier.lat, courier.lng, destForEta.lat, destForEta.lng)
          : null
      : null;
  const overlay =
    mode === 'waiting'
      ? 'Waiting for the courier to share location…'
      : mode === 'completed'
        ? 'Delivered'
        : null;

  return (
    <div className="track-order-map mb-4">
      <div ref={hostRef} className="track-order-map__canvas" />
      {live ? (
        <div className="track-order-map__chip track-order-map__chip--live">
          <span className="track-order-map__pulse" />
          {publicCourierLabel(courier?.name)} · On the way
        </div>
      ) : null}
      {eta != null ? (
        <div className="track-order-map__chip track-order-map__chip--eta">
          {eta} min
        </div>
      ) : null}
      {overlay ? (
        <div className="track-order-map__overlay">
          <div className="track-order-map__overlay-card">{overlay}</div>
        </div>
      ) : null}
    </div>
  );
}

export default function TrackingMap({ map, address }: Props) {
  const destAddress = map?.destination?.address || address || '';
  const mode = map?.mode || 'static';
  const useOwnBoyMap = mode === 'live' || mode === 'waiting';

  if (!useOwnBoyMap) {
    return <GoogleAddressMap address={destAddress} />;
  }

  return <OwnDeliveryMap map={map} address={destAddress} />;
}
