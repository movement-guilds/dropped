import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth?.token;
    const { pathname } = req.nextUrl;

    // Handle MembershipRevoked
    if (token?.error === "MembershipRevoked" && !pathname.startsWith("/login")) {
      return NextResponse.redirect(
        new URL(`/login?error=MembershipRevoked`, req.url)
      );
    }

    // Wallet link gate (opt-in via REQUIRE_WALLET_LINK=true)
    const requireWalletLink = process.env.REQUIRE_WALLET_LINK === "true";
    const walletLinked = !!(token as Record<string, unknown>)?.walletAddress;

    if (
      requireWalletLink &&
      !walletLinked &&
      !pathname.startsWith("/link-wallet") &&
      !pathname.startsWith("/api/wallet/") // excludes /nonce and /link
    ) {
      return NextResponse.redirect(new URL("/link-wallet", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Protect all routes EXCEPT:
     * - /login (sign-in page)
     * - /api/auth/* (NextAuth OAuth callbacks — MUST be excluded or OAuth breaks)
     * - /api/wallet/* (nonce issuance + wallet link — excluded to prevent infinite redirect)
     * - /_next/* (Next.js internals)
     * - /favicon.ico and static files
     */
    "/((?!login|api/auth|api/wallet|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
