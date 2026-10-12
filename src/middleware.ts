import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
 
  const response = NextResponse.next();
  
  // 1. Handle Guest Session Cookie
  let sessionCookie = request.cookies.get("session_id")?.value;
  if(!sessionCookie){
    sessionCookie = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    if(sessionCookie){
      response.cookies.set("session_id",sessionCookie,{
        path: "/",
        httpOnly: false, // allow frontend access
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }
  }
  // 2. Handle Redirects
  try {
    const host = request.headers.get("host");
    const data = await fetch(`http://${host}/redirects`);
    const { redirects } = await data.json();
    if (redirects) {
      for (const redirect of redirects) {
        if (request.nextUrl.pathname === redirect.path) {
          return NextResponse.redirect(new URL(redirect.target, request.url));
        }
      }
    }
  } catch (error) {
    console.log("Error", error);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!redirects/|redirects$|css|images|js|api|_next/static|_next/image|favicon.ico|favicon-ozelu.png|sitemap.xml|robots.txt).*)",
  ],
};
