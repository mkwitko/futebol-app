import { bestFieldPosition, fieldPositionAbbreviation } from "@/lib/player/position";

describe("bestFieldPosition", () => {
  it("returns the position with the highest overall", () => {
    const best = bestFieldPosition({ campo_atacante: 84, campo_meia: 70 });
    expect(best).toEqual({ pos: "campo_atacante", ovr: 84 });
    expect(fieldPositionAbbreviation(best!.pos)).toBe("ATA");
  });

  it("ignores null values", () => {
    const best = bestFieldPosition({ campo_meia: 70, campo_atacante: null as unknown as number });
    expect(best).toEqual({ pos: "campo_meia", ovr: 70 });
  });

  it("returns null for an empty map", () => {
    expect(bestFieldPosition({})).toBeNull();
  });
});
