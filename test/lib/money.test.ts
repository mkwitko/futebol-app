import { centsToReaisInput, formatCentsToBRL, reaisInputToCents } from "@/lib/money";

describe("money", () => {
  describe("reaisInputToCents", () => {
    it("parses comma-decimal input (pt-BR)", () => {
      expect(reaisInputToCents("20,50")).toBe(2050);
    });

    it("parses period-decimal input (decimal-pad keyboard)", () => {
      expect(reaisInputToCents("20.50")).toBe(2050);
    });

    it("treats period as thousand separator when a comma is present", () => {
      expect(reaisInputToCents("1.234,56")).toBe(123456);
    });

    it("returns undefined for empty/invalid/negative input (free match)", () => {
      expect(reaisInputToCents("")).toBeUndefined();
      expect(reaisInputToCents(undefined)).toBeUndefined();
      expect(reaisInputToCents("abc")).toBeUndefined();
      expect(reaisInputToCents("-20")).toBeUndefined();
    });
  });

  describe("formatCentsToBRL", () => {
    it("formats integer cents as BRL with two decimals", () => {
      expect(formatCentsToBRL(2000)).toContain("20,00");
      expect(formatCentsToBRL(2050)).toContain("20,50");
    });
  });

  describe("centsToReaisInput", () => {
    it("is the inverse of reaisInputToCents for a typical price", () => {
      expect(centsToReaisInput(2050)).toBe("20,50");
    });
  });
});
