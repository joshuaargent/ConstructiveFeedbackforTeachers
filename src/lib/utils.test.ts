import { describe, it, expect } from "vitest";
import {
  cn,
  formatDate,
  formatNumber,
  formatCompactNumber,
  formatDuration,
  formatPace,
  truncate,
  slugify,
  capitalize,
  decodeHtmlEntities,
  groupBy,
  sortByDate,
  filterBySearch,
  isValidEmail,
  isValidUrl,
  generateId,
  randomItem,
  shuffle,
} from "@/lib/utils";

describe("cn - class name utility", () => {
  it("merges class names correctly", () => {
    const result = cn("text-lg", "text-red-500");
    expect(result).toContain("text-lg");
  });

  it("handles conditional classes", () => {
    const condition = false;
    const result = cn("base-class", condition && "conditional-class");
    expect(result).toContain("base-class");
  });
});

describe("formatDate", () => {
  it("formats date string", () => {
    const result = formatDate("2024-01-15");
    expect(result).toContain("January");
    expect(result).toContain("15");
    expect(result).toContain("2024");
  });

  it("formats Date object", () => {
    const date = new Date("2024-01-15");
    const result = formatDate(date);
    expect(result).toContain("January");
  });

  it("uses custom format", () => {
    const result = formatDate("2024-01-15", "yyyy-MM-dd");
    expect(result).toBe("2024-01-15");
  });
});

describe("formatNumber", () => {
  it("formats numbers with commas", () => {
    expect(formatNumber(1000)).toBe("1,000");
    expect(formatNumber(1000000)).toBe("1,000,000");
  });

  it("handles small numbers", () => {
    expect(formatNumber(100)).toBe("100");
  });
});

describe("formatCompactNumber", () => {
  it("formats compact numbers", () => {
    expect(formatCompactNumber(1500)).toMatch(/1\.5/);
    expect(formatCompactNumber(1500000)).toMatch(/1\.5/);
  });
});

describe("formatDuration", () => {
  it("formats seconds to mm:ss", () => {
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(3661)).toBe("1:01:01");
  });

  it("handles hours correctly", () => {
    expect(formatDuration(3600)).toBe("1:00:00");
    expect(formatDuration(7200)).toBe("2:00:00");
  });

  it("pads single digits", () => {
    expect(formatDuration(61)).toBe("1:01");
  });
});

describe("formatPace", () => {
  it("formats pace as min:sec", () => {
    expect(formatPace(330)).toBe("5:30");
    expect(formatPace(360)).toBe("6:00");
  });

  it("handles fast paces", () => {
    expect(formatPace(240)).toBe("4:00");
  });
});

describe("truncate", () => {
  it("truncates long strings", () => {
    const result = truncate("Hello World", 8);
    expect(result).toBe("Hello...");
  });

  it("does not truncate short strings", () => {
    const result = truncate("Hi", 10);
    expect(result).toBe("Hi");
  });

  it("uses custom suffix", () => {
    // Truncate leaves room for suffix, so 8 chars = (8-5) + "..." = 3 chars + suffix
    const result = truncate("Hello World", 8, "[...]");
    expect(result).toBe("Hel[...]");
  });
});

describe("slugify", () => {
  it("converts to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Hello! World?")).toBe("hello-world");
  });

  it("handles multiple spaces", () => {
    expect(slugify("Hello   World")).toBe("hello-world");
  });

  it("trims leading/trailing dashes", () => {
    expect(slugify("  Hello World  ")).toBe("hello-world");
  });
});

describe("capitalize", () => {
  it("capitalizes first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("handles already capitalized", () => {
    expect(capitalize("Hello")).toBe("Hello");
  });
});

describe("decodeHtmlEntities", () => {
  it("decodes common entities", () => {
    expect(decodeHtmlEntities("&amp;")).toBe("&");
    expect(decodeHtmlEntities("&lt;")).toBe("<");
    expect(decodeHtmlEntities("&gt;")).toBe(">");
    expect(decodeHtmlEntities("&quot;")).toBe('"');
  });

  it("decodes apostrophe", () => {
    expect(decodeHtmlEntities("&#39;")).toBe("'");
    expect(decodeHtmlEntities("&apos;")).toBe("'");
  });

  it("keeps unknown entities", () => {
    expect(decodeHtmlEntities("&unknown;")).toBe("&unknown;");
  });
});

describe("groupBy", () => {
  it("groups objects by key", () => {
    const items = [
      { name: "Alice", category: "A" },
      { name: "Bob", category: "B" },
      { name: "Charlie", category: "A" },
    ];
    const result = groupBy(items, "category");
    expect(result["A"]).toHaveLength(2);
    expect(result["B"]).toHaveLength(1);
  });
});

describe("sortByDate", () => {
  it("sorts by date descending", () => {
    const items = [
      { id: 1, date: "2024-01-01" },
      { id: 2, date: "2024-02-01" },
      { id: 3, date: "2024-01-15" },
    ];
    const result = sortByDate(items, "date", "desc");
    expect(result[0].id).toBe(2);
    expect(result[1].id).toBe(3);
    expect(result[2].id).toBe(1);
  });

  it("sorts by date ascending", () => {
    const items = [
      { id: 1, date: "2024-02-01" },
      { id: 2, date: "2024-01-01" },
    ];
    const result = sortByDate(items, "date", "asc");
    expect(result[0].id).toBe(2);
  });
});

describe("filterBySearch", () => {
  it("filters by search term", () => {
    const items = [
      { name: "Alice", email: "alice@test.com" },
      { name: "Bob", email: "bob@test.com" },
    ];
    const result = filterBySearch(items, "alice", ["name", "email"]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Alice");
  });

  it("returns all items for empty search", () => {
    const items = [{ name: "Alice" }, { name: "Bob" }];
    const result = filterBySearch(items, "", ["name"]);
    expect(result).toHaveLength(2);
  });
});

describe("isValidEmail", () => {
  it("validates correct emails", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("user.name@domain.co.uk")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(isValidEmail("invalid")).toBe(false);
    expect(isValidEmail("no@domain")).toBe(false);
    expect(isValidEmail("@domain.com")).toBe(false);
  });
});

describe("isValidUrl", () => {
  it("validates correct URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("http://test.org/path")).toBe(true);
  });

  it("rejects invalid URLs", () => {
    expect(isValidUrl("not-a-url")).toBe(false);
    expect(isValidUrl("")).toBe(false);
  });
});

describe("generateId", () => {
  it("generates unique IDs", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it("generates string IDs", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });
});

describe("randomItem", () => {
  it("returns an item from array", () => {
    const items = ["a", "b", "c"];
    const result = randomItem(items);
    expect(items).toContain(result);
  });
});

describe("shuffle", () => {
  it("returns array of same length", () => {
    const items = [1, 2, 3, 4, 5];
    const result = shuffle(items);
    expect(result).toHaveLength(5);
  });

  it("contains all original items", () => {
    const items = [1, 2, 3, 4, 5];
    const result = shuffle(items);
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("does not mutate original array", () => {
    const items = [1, 2, 3];
    const original = [...items];
    shuffle(items);
    expect(items).toEqual(original);
  });
});