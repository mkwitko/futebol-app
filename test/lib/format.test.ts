import { formatDateParam, matchCountdown, minutesToTime } from "@/lib/datetime/format";

describe("minutesToTime", () => {
  it("converts minutes-since-midnight to zero-padded HH:MM", () => {
    expect(minutesToTime(0)).toBe("00:00");
    expect(minutesToTime(9 * 60)).toBe("09:00");
    expect(minutesToTime(19 * 60 + 30)).toBe("19:30");
    expect(minutesToTime(23 * 60 + 59)).toBe("23:59");
  });
});

describe("formatDateParam", () => {
  it("formats a local Date as yyyy-MM-dd (the wire format GET /courts/:id/availability?date= expects)", () => {
    expect(formatDateParam(new Date(2026, 6, 18))).toBe("2026-07-18");
    expect(formatDateParam(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

// now = 2026-07-18 10:00 local
const now = new Date(2026, 6, 18, 10, 0, 0);

describe("matchCountdown", () => {
  it("labels a match later today", () => {
    const iso = new Date(2026, 6, 18, 20, 0, 0).toISOString();
    expect(matchCountdown(iso, now)).toEqual({ kind: "today", time: "20:00" });
  });

  it("labels a match tomorrow", () => {
    const iso = new Date(2026, 6, 19, 9, 30, 0).toISOString();
    expect(matchCountdown(iso, now)).toEqual({ kind: "tomorrow", time: "09:30" });
  });

  it("labels a match 2-6 days ahead by day count", () => {
    const iso = new Date(2026, 6, 21, 18, 0, 0).toISOString();
    expect(matchCountdown(iso, now)).toEqual({ kind: "days", days: 3 });
  });

  it("falls back to absolute for 7+ days ahead", () => {
    const iso = new Date(2026, 6, 30, 18, 0, 0).toISOString();
    expect(matchCountdown(iso, now)).toEqual({ kind: "absolute", label: expect.any(String) });
  });

  it("falls back to absolute for past matches", () => {
    const iso = new Date(2026, 6, 17, 18, 0, 0).toISOString();
    expect(matchCountdown(iso, now)).toEqual({ kind: "absolute", label: expect.any(String) });
  });
});
