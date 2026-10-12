import { NextResponse } from "next/server";
export const runtime = "edge";
// To handle a GET request to /api
export async function GET(request: any, response: any) {
  // Do whatever you want
  try {
    const res = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/api/assets/redirects",
      { next: { revalidate: 60 } }
    );
    const result = await res.json();
    const { status, redirects } = result;
    return NextResponse.json({ redirects }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
