import { formatDateParam, minutesToTime } from "@/lib/datetime/format";

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
