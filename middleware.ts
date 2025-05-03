import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  // Initialize Supabase client using cookies
  const cookieStore = await cookies();
  // console.log(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.SUPABASE_ANON_KEY!
  // );

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // This is used for setting cookies in middleware
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Check if the user is authenticated
    if (!session) {
      // If the user is not authenticated and trying to access a protected route
      if (
        !request.nextUrl.pathname.startsWith("/login") &&
        !request.nextUrl.pathname.startsWith("/register") &&
        !request.nextUrl.pathname.startsWith("/_next") &&
        !request.nextUrl.pathname.startsWith("/api")
      ) {
        const url = new URL("/login", request.url);
        return NextResponse.redirect(url);
      }
    } else {
      // If the user is authenticated and trying to access auth routes
      if (
        request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/register")
      ) {
        const url = new URL("/", request.url);
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // If there's an error, allow the request to continue
    // This prevents authentication errors from blocking the entire site
    return NextResponse.next();
  }
}

// Update the matcher to exclude static files and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)",
  ],
};
