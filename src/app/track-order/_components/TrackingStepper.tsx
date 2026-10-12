'use client';

import { useState } from 'react';
import ProofMediaLightbox, { isVideoMedia } from './ProofMediaLightbox';

type Stage = {
  key: string;
  title: string;
  status: string;
  completed_at?: string | null;
  by_name?: string | null;
  view_proof?: boolean;
  proof_media?: Array<{ url?: string | null; content_type?: string | null }>;
  show_courier_link?: boolean;
};

type Props = {
  stages: Stage[];
  courierTrackingUrl?: string | null;
};

function formatTs(v?: string | null) {
  if (!v) return '';
  try {
    return new Date(v).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function TrackingStepper({ stages, courierTrackingUrl }: Props) {
  const [proof, setProof] = useState<Stage | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<{
    url?: string | null;
    content_type?: string | null;
  } | null>(null);
  const doneCount = stages.filter((s) => s.status === 'completed').length;
  const railPct =
    stages.length > 1 ? Math.max(0, Math.min(100, ((doneCount - 0.5) / (stages.length - 1)) * 100)) : 0;

  return (
    <div className="mb-4">
      <div className="track-order-stepper">
        <div className="track-order-stepper__rail" aria-hidden="true">
          <div className="track-order-stepper__rail-fill" style={{ width: `${railPct}%` }} />
        </div>
        {stages.map((stage) => {
          const done = stage.status === 'completed';
          return (
            <div key={stage.key} className="track-order-stepper__step">
              <div
                className={`track-order-stepper__dot ${
                  done ? 'track-order-stepper__dot--done' : 'track-order-stepper__dot--pending'
                }`}
              >
                {done ? '✓' : '·'}
              </div>
              <div className="small fw-semibold">{stage.title}</div>
              <div className="small text-muted">
                {done ? 'Completed' : 'Pending'}
              </div>
              {done && stage.completed_at ? (
                <div className="small text-muted">{formatTs(stage.completed_at)}</div>
              ) : null}
              {stage.view_proof ? (
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0"
                  onClick={() => setProof(stage)}
                >
                  View Proof
                </button>
              ) : null}
              {stage.show_courier_link && courierTrackingUrl ? (
                <a
                  href={courierTrackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-link btn-sm p-0"
                >
                  Courier Tracking Link
                </a>
              ) : null}
            </div>
          );
        })}
      </div>

      {proof ? (
        <div className="border rounded p-3 mt-3">
          <div className="d-flex justify-content-between mb-2">
            <strong>Proof — {proof.title}</strong>
            <button type="button" className="btn btn-sm btn-light" onClick={() => { setProof(null); setLightboxMedia(null); }}>
              Close
            </button>
          </div>
          <div className="d-flex flex-wrap gap-2 track-order-proof-grid">
            {(proof.proof_media || []).map((m, i) => {
              const video = isVideoMedia(m);
              return (
                <button
                  key={i}
                  type="button"
                  className="track-order-proof-thumb"
                  onClick={() => setLightboxMedia(m)}
                  aria-label={video ? 'Play proof video' : 'View proof image'}
                >
                  {video ? (
                    <>
                      <video
                        src={m.url || ''}
                        muted
                        playsInline
                        preload="metadata"
                        className="track-order-proof-media"
                      />
                      <span className="track-order-proof-thumb__play" aria-hidden="true">
                        ▶
                      </span>
                    </>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.url || ''}
                      alt="proof"
                      className="track-order-proof-media"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <ProofMediaLightbox media={lightboxMedia} onClose={() => setLightboxMedia(null)} />
    </div>
  );
}
