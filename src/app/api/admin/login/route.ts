import { NextResponse } from "next/server";
import { COOKIE, passcodeOk, token } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({ passcode: "" }));
  if (typeof body.passcode !== "string" || !passcodeOk(body.passcode)) {
    return NextResponse.json({ error: "Wrong passcode" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
