"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { TIME_ZONE_COOKIE } from "@/lib/dates";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

// Reports the browser's timezone to the server via a cookie so server-side
// date logic uses the user's calendar day. Re-renders once if it changed.
export function TimeZoneSync() {
  const router = useRouter();

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const current = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${TIME_ZONE_COOKIE}=`))
      ?.slice(TIME_ZONE_COOKIE.length + 1);

    if (!timeZone || decodeURIComponent(current ?? "") === timeZone) return;

    // Not HttpOnly: it is written here in the browser and holds no secret.
    // Secure over HTTPS (production); omitted on plain-HTTP localhost, where
    // some browsers would otherwise drop the cookie.
    const secure = window.location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${TIME_ZONE_COOKIE}=${encodeURIComponent(timeZone)}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax${secure}`;
    router.refresh();
  }, [router]);

  return null;
}
