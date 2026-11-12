import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    const pathname = request.nextUrl.pathname;
    if (pathname === "/" || pathname === "/studio" || pathname.startsWith("/studio/")) {
      return NextResponse.redirect(new URL("/nguyenngocdiepportfolio", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/studio/:path*"],
};
