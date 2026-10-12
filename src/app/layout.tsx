import Script from "next/script";
import "./globals.css";
import 'tippy.js/dist/tippy.css';
import "@fortawesome/fontawesome-free/css/all.min.css"
import type { Metadata } from "next";
import Providers from "./Index";
import { Site } from "@/libs/site";
import Analytics from "@/hooks/Analytics";

export const metadata: Metadata = {
  // Plain string form (no `template`) so each page's own metadata title is
  // shown verbatim in the browser tab — no automatic " | Ozelu" suffix is
  // appended. Pages that don't define their own title fall back to this one.
  // If a page wants the suffix back, it can opt in by exporting:
  //   title: { template: "%s | Ozelu", default: "..." }
  title: Site?.seo?.title,
  description: Site?.seo?.description,
  metadataBase: new URL(Site?.url),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: Site?.seo?.title,
    description: Site?.seo?.description,
    url: Site?.url,
    siteName: Site?.name,
    images: [
      {
        url: Site?.logo,
        width: 800,
        height: 600,
      },
    ],
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        {googleSiteVerification ? (
          <meta
            name="google-site-verification"
            content={googleSiteVerification}
          />
        ) : null}
        <link rel="icon" type="image/png" href="/favicon-ozelu.png" />
        <link
          rel="apple-touch-icon"
          href="/favicon-ozelu.png"
          type="image/png"
          sizes="all"
        />
        <meta name="theme-color" content="#000000" />
        <Script src="https://js.stripe.com/v3/"></Script>
        {/* <!-- font awesome --> */}
        {/* <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"
          integrity="sha512-KfkfwYDsLkIlwQp6LFnl8zNdLGxu9YAA1QvwINks4PhcElQSvqcyVLLD9aMhXd13uQjoXtEKNosOWaZqXgel0g=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        /> */}
        {/* <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"/> */}
        {/* <!-- Magnific Popup core CSS file --> */}
        <link rel="stylesheet" href="/css/magnific-popup.css" />
        <Script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></Script>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></Script>
        <Script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></Script>
        {/* <!-- <link rel="icon" type="image/x-icon" href="https://img.icons8.com/material-outlined/24/000000/compact-camera--v1.png"> --> */}
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/bluebird/3.3.4/bluebird.min.js"></Script>
        <Script src="https://secure.gosell.io/js/sdk/tap.min.js"></Script>
        {/* <!-- CSS --> */}
        <link rel="stylesheet" href="/css/flickity.min.css" />
        <link rel="stylesheet" href="/css/bootstrap-reboot.css" />
        <link rel="preload" as="image" href={Site?.logos?.secondary}/>
        <link rel="stylesheet" href="/css/CollectionGridItems.css" />
        <Script src="/js/flickity.pkgd.min.js"></Script>
        <Script
          src="//mozilla.github.io/pdf.js/build/pdf.js"
          crossOrigin="anonymous"
        ></Script>
        <Analytics />
      </head>
      <body className="rtl_false lazyloadt4sed">
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}
