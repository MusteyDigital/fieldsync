import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const COOKIE = "fs_admin";

export function token(): string {
  return createHash("sha256")
    .update(`${process.env.ADMIN_PASSCODE ?? ""}:fieldsync`)
    .digest("hex");
}

export function passcodeOk(input: string): boolean {
  const p = process.env.ADMIN_PASSCODE;
  if (!p) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(p).digest();
  return timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  if (!process.env.ADMIN_PASSCODE) return false;
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const a = Buffer.from(v);
  const b = Buffer.from(token());
  return a.length === b.length && timingSafeEqual(a, b);
}
