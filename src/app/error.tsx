"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <title>Demo</title>
      <meta name="robots" content="noindex, nofollow" />
      <div className="text-center p-5 my-5">
        <h2 className="mb-3">Something went wrong!</h2>
        <button onClick={() => reset()} className="btn btn-info btn--primary">
          Try again
        </button>
      </div>
    </>
  );
}
