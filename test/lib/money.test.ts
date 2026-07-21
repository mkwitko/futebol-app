import { centsToReaisInput, formatCentsToBRL, maskBRLInput, reaisInputToCents } from "@/lib/money";

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

    it("is tolerant to the R$ prefix emitted by maskBRLInput", () => {
      expect(reaisInputToCents("R$ 0,15")).toBe(15);
      expect(reaisInputToCents("R$ 15,00")).toBe(1500);
      expect(reaisInputToCents("R$ 1.234,56")).toBe(123456);
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

  describe("maskBRLInput (cents-first)", () => {
    it("treats each digit as a new centavo decimal place", () => {
      expect(maskBRLInput("1")).toBe("0,01");
      expect(maskBRLInput("15")).toBe("0,15");
      expect(maskBRLInput("150")).toBe("1,50");
      expect(maskBRLInput("1500")).toBe("15,00");
    });

    it("groups thousands in the reais part", () => {
      expect(maskBRLInput("123456")).toBe("1.234,56");
    });

    it("returns empty string when no digits are present (free match)", () => {
      expect(maskBRLInput("")).toBe("");
      expect(maskBRLInput("foo")).toBe("");
      expect(maskBRLInput("R$ ")).toBe("");
    });

    it("strips non-digits (including comma/period) so the entry is pure cents", () => {
      // The mask ignores punctuation; the user only types digits.
      expect(maskBRLInput("12,5")).toBe("1,25");
      expect(maskBRLInput("12.5")).toBe("1,25");
    });

    it("round-trips through reaisInputToCents to the same centavo count", () => {
      const cases = ["1", "15", "150", "1500", "12345", "123456"];
      for (const c of cases) {
        const masked = maskBRLInput(c);
        expect(reaisInputToCents(masked)).toBe(Number(c));
      }
    });
  });
});
