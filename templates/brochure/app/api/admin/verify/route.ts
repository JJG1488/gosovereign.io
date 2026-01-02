import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-context";

export const dynamic = "force-dynamic";

export async function GET() {
  const isAuthenticated = await isAdminAuthenticated();
  return NextResponse.json({ authenticated: isAuthenticated });
}
