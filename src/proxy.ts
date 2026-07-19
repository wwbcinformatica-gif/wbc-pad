import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register") ||
    request.nextUrl.pathname.startsWith("/forgot-password") ||
    request.nextUrl.pathname.startsWith("/api/webhooks") ||
    request.nextUrl.pathname.startsWith("/api/config") ||
    request.nextUrl.pathname === "/"

  if (isAuthPage) return NextResponse.next({ request })

  const hasAuthCookie = request.cookies.getAll().some((c) =>
    c.name.startsWith("sb-")
  )

  if (!hasAuthCookie) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
