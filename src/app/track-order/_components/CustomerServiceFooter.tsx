'use client';

export default function CustomerServiceFooter() {
  // Digits only for wa.me — matches site phone +971545679479
  const wa = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971545679479').replace(/\D/g, '');
  return (
    <div className="text-center py-4">
      <h2 className="h5 mb-2">📞 Customer Service</h2>
      <p className="mb-3">
        For any kind of support, please email{' '}
        <a href="mailto:care@ozelu.com">
          <strong>care@ozelu.com</strong>
        </a>{' '}
        or contact us on{' '}
        <a
          href={`https://wa.me/${wa}`}
          target="_blank"
          rel="noreferrer"
        >
          <strong>WhatsApp</strong>
        </a>
        .
      </p>
      <p
        className="fw-semibold mb-0"
        style={{ color: '#4db6ac', letterSpacing: '0.04em' }}
      >
        OZELU STUDIO &amp; PRINT
      </p>
    </div>
  );
}
