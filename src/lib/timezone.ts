import "server-only";
import { cookies, headers } from "next/headers";
import { isValidTimeZone, TIME_ZONE_COOKIE } from "@/lib/dates";

/**
 * The current user's IANA timezone, never the server's. Sources, in order:
 * the browser-reported cookie (see TimeZoneSync), Vercel's IP-based header,
 * then UTC.
 */
export async function getUserTimeZone() {
  const cookieTimeZone = (await cookies()).get(TIME_ZONE_COOKIE)?.value;
  if (isValidTimeZone(cookieTimeZone)) return cookieTimeZone;

  const ipTimeZone = (await headers()).get("x-vercel-ip-timezone") ?? undefined;
  if (isValidTimeZone(ipTimeZone)) return ipTimeZone;

  return "UTC";
}
