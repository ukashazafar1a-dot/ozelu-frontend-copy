import Link from "next/link";

export default function NotFound() {
  return (
    <div className="d-flex align-items-center justify-content-center my-5 p-5 flex-column">
      <h2 className="h1">Not Found</h2>
      <p className="font-primary">Could not find requested resource</p>
      <Link href="/" className="btn--primary-new btn--green font-primary">
        Return Home
      </Link>
    </div>
  );
}
