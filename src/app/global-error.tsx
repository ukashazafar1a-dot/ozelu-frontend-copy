"use client";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {

  useEffect(()=>{
    Sentry.captureException(error)
  },[error]);
  return (
    <html>
      <head>
        <title>Demo</title>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="text-center p-5 my-5">
        <h2 className="mb-3">Something went wrong!</h2>
        <button onClick={() => reset()} className="btn btn-info btn--primary">
          Try again
        </button>
      </body>
    </html>
  );
}
