import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    // Middleware desativado temporariamente a pedido do usuário
    // O sistema usará localStorage e auto-login.
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
