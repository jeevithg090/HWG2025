import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatDate,
  getInitials,
  humanize,
  parseList,
  toNumber,
  truncate,
} from "@/lib/format";
import { normalizeBaseUrl } from "@/lib/config";

describe("format helpers", () => {
  it("toNumber accepts numbers and numeric strings", () => {
    expect(toNumber(5)).toBe(5);
    expect(toNumber("1500.50")).toBe(1500.5);
    expect(toNumber("abc")).toBeNull();
    expect(toNumber(null)).toBeNull();
    expect(toNumber("")).toBeNull();
  });

  it("formatCurrency formats or falls back", () => {
    expect(formatCurrency(1500)).toBe("$1,500");
    expect(formatCurrency("99.5")).toBe("$99.50");
    expect(formatCurrency(undefined)).toBe("Budget not specified");
    expect(formatCurrency(null, "—")).toBe("—");
  });

  it("formatDate handles invalid input", () => {
    expect(formatDate("2025-01-05T12:00:00Z")).toMatch(/Jan 5, 2025/);
    expect(formatDate("not a date")).toBe("—");
    expect(formatDate(undefined, "Flexible")).toBe("Flexible");
  });

  it("humanize, initials, truncate and parseList", () => {
    expect(humanize("in_progress")).toBe("In progress");
    expect(humanize("HACKATHON")).toBe("Hackathon");
    expect(getInitials("Ada Byron Lovelace")).toBe("AB");
    expect(getInitials("")).toBe("U");
    expect(truncate("hello world", 5)).toBe("hello…");
    expect(truncate("short", 10)).toBe("short");
    expect(parseList(" React, Node ,, React ")).toEqual(["React", "Node"]);
  });

  it("normalizeBaseUrl strips trailing slashes and falls back", () => {
    expect(normalizeBaseUrl("http://api.example.com///", "x")).toBe("http://api.example.com");
    expect(normalizeBaseUrl("  ", "http://fallback")).toBe("http://fallback");
    expect(normalizeBaseUrl(undefined, "http://fallback/")).toBe("http://fallback");
  });
});
