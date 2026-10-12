'use client';

import { useEffect } from 'react';

type ProofMedia = {
  url?: string | null;
  content_type?: string | null;
};

function isVideoMedia(media: ProofMedia) {
  return (
    String(media.content_type || '').startsWith('video/') ||
    /\.(mp4|mov|webm|m4v|3gp)(\?|#|$)/i.test(String(media.url || ''))
  );
}

type Props = {
  media: ProofMedia | null;
  onClose: () => void;
};

export default function ProofMediaLightbox({ media, onClose }: Props) {
  useEffect(() => {
    if (!media) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [media, onClose]);

  if (!media?.url) return null;

  const video = isVideoMedia(media);

  return (
    <div
      className="track-order-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Proof media preview"
      onClick={onClose}
    >
      <div className="track-order-lightbox__backdrop" aria-hidden="true" />
      <div className="track-order-lightbox__content" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="track-order-lightbox__close"
          onClick={onClose}
          aria-label="Close preview"
        >
          ×
        </button>
        {video ? (
          <video
            src={media.url}
            controls
            autoPlay
            className="track-order-lightbox__media"
            preload="metadata"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media.url} alt="Proof" className="track-order-lightbox__media" />
        )}
      </div>
    </div>
  );
}

export { isVideoMedia };
