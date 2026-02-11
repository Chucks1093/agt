import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
	"https://agt-75nf.vercel.app",
	"http://localhost:5173",
	"http://localhost:3000",
];

function getCorsHeaders(req: NextRequest) {
	const origin = req.headers.get("origin") || "";
	const isAllowed = ALLOWED_ORIGINS.includes(origin);

	return {
		"Access-Control-Allow-Origin": isAllowed ? origin : "null",
		"Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
		Vary: "Origin",
	};
}

export function proxy(req: NextRequest) {
	// only apply to API routes
	if (!req.nextUrl.pathname.startsWith("/api")) {
		return NextResponse.next();
	}

	const cors = getCorsHeaders(req);

	// Handle preflight
	if (req.method === "OPTIONS") {
		return new NextResponse(null, { status: 204, headers: cors });
	}

	// For real requests, continue but attach CORS headers
	const res = NextResponse.next();
	Object.entries(cors).forEach(([k, v]) => res.headers.set(k, v));
	return res;
}

export const config = {
	matcher: ["/api/:path*"],
};
