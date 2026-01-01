import { createMiddlewareClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: { headers: req.headers } });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res;
  }

  const supabase = createMiddlewareClient(
    { req, res },
    { supabaseUrl, supabaseKey }
  );

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;
  const isProtected = pathname.startsWith("/app/app");
  const isAuthCallback = pathname.startsWith("/app/auth/callback");

  if (isProtected && !session && !isAuthCallback) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/app/login";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"]
};
