import { describe, expect, it } from "vitest";

import {
  formatDateParamInTimeZone,
  getDayRangeInTimeZone,
  isValidTimeZone,
  parseDateParam,
} from "@/lib/dates";

const HOUR = 60 * 60 * 1000;

function range(dateParam: string, timeZone: string) {
  const { start, end } = getDayRangeInTimeZone(dateParam, timeZone);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
    hours: (end.getTime() - start.getTime()) / HOUR,
  };
}

describe("test environment", () => {
  it("runs in a non-UTC process timezone", () => {
    // Asia/Kathmandu is UTC+5:45 (ICU may report its alias "Asia/Katmandu").
    expect(new Date("2026-10-15T00:00:00Z").getTimezoneOffset()).toBe(-345);
  });
});

describe("getDayRangeInTimeZone", () => {
  it("spans local midnight to local midnight on a normal day", () => {
    expect(range("2026-10-15", "America/Los_Angeles")).toEqual({
      start: "2026-10-15T07:00:00.000Z",
      end: "2026-10-16T07:00:00.000Z",
      hours: 24,
    });
  });

  it("is 23 hours when DST starts", () => {
    expect(range("2026-03-08", "America/Los_Angeles")).toEqual({
      start: "2026-03-08T08:00:00.000Z",
      end: "2026-03-09T07:00:00.000Z",
      hours: 23,
    });
  });

  it("is 25 hours when DST ends", () => {
    expect(range("2026-11-01", "America/Los_Angeles")).toEqual({
      start: "2026-11-01T07:00:00.000Z",
      end: "2026-11-02T08:00:00.000Z",
      hours: 25,
    });
  });

  it("starts on the right day where DST begins at midnight", () => {
    // Chile skips 00:00 -> 01:00 on 2026-09-06.
    const { start, end } = getDayRangeInTimeZone(
      "2026-09-06",
      "America/Santiago"
    );
    expect(formatDateParamInTimeZone(start, "America/Santiago")).toBe(
      "2026-09-06"
    );
    expect(formatDateParamInTimeZone(end, "America/Santiago")).toBe(
      "2026-09-07"
    );
    expect((end.getTime() - start.getTime()) / HOUR).toBe(23);
  });

  it("handles extreme offsets", () => {
    expect(range("2026-10-15", "Pacific/Kiritimati")).toEqual({
      start: "2026-10-14T10:00:00.000Z",
      end: "2026-10-15T10:00:00.000Z",
      hours: 24,
    });
    expect(range("2026-10-15", "Pacific/Pago_Pago")).toEqual({
      start: "2026-10-15T11:00:00.000Z",
      end: "2026-10-16T11:00:00.000Z",
      hours: 24,
    });
  });

  it("handles month and year boundaries", () => {
    expect(range("2026-12-31", "UTC")).toEqual({
      start: "2026-12-31T00:00:00.000Z",
      end: "2027-01-01T00:00:00.000Z",
      hours: 24,
    });
  });

  it("rejects invalid dates", () => {
    expect(() => getDayRangeInTimeZone("2026-02-31", "UTC")).toThrow();
  });
});

describe("formatDateParamInTimeZone", () => {
  it("returns the local calendar day of an instant", () => {
    // 8pm Oct 15 in Los Angeles is already Oct 16 in UTC and Tokyo.
    const instant = new Date("2026-10-16T03:00:00.000Z");
    expect(formatDateParamInTimeZone(instant, "America/Los_Angeles")).toBe(
      "2026-10-15"
    );
    expect(formatDateParamInTimeZone(instant, "UTC")).toBe("2026-10-16");
    expect(formatDateParamInTimeZone(instant, "Asia/Tokyo")).toBe("2026-10-16");
  });

  it("puts each range boundary on the requested day", () => {
    const { start, end } = getDayRangeInTimeZone(
      "2026-11-01",
      "America/Los_Angeles"
    );
    expect(formatDateParamInTimeZone(start, "America/Los_Angeles")).toBe(
      "2026-11-01"
    );
    expect(
      formatDateParamInTimeZone(new Date(end.getTime() - 1), "America/Los_Angeles")
    ).toBe("2026-11-01");
  });
});

describe("parseDateParam", () => {
  it("parses a valid date as local midnight", () => {
    const date = parseDateParam("2026-10-15");
    expect(date && [date.getFullYear(), date.getMonth(), date.getDate()]).toEqual(
      [2026, 9, 15]
    );
  });

  it.each(["2026-02-31", "2026-13-01", "2026-1-5", "oct 15", "", undefined])(
    "rejects %s",
    (value) => {
      expect(parseDateParam(value)).toBeUndefined();
    }
  );
});

describe("isValidTimeZone", () => {
  it("accepts IANA names", () => {
    expect(isValidTimeZone("America/Los_Angeles")).toBe(true);
    expect(isValidTimeZone("UTC")).toBe(true);
  });

  it.each(["Not/AZone", "", "<script>", undefined])("rejects %s", (value) => {
    expect(isValidTimeZone(value)).toBe(false);
  });
});
