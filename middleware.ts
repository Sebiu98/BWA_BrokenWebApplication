import { NextRequest, NextResponse } from "next/server";

const CANONICAL_LOOPBACK_HOST = "127.0.0.1";

const resolveRequestHostname = (request: NextRequest): string => {
  const rawHost =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    request.nextUrl.host;

  const firstHost = rawHost.split(",")[0]?.trim() ?? "";
  const hostname = firstHost.split(":")[0]?.trim().toLowerCase() ?? "";

  return hostname;
};

export function middleware(request: NextRequest) {
  const hostname = resolveRequestHostname(request);

  if (hostname !== "localhost") {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.hostname = CANONICAL_LOOPBACK_HOST;

  return NextResponse.redirect(redirectUrl, 308);
}

export const config = {
  matcher: "/:path*",
};