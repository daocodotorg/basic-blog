import { describe, expect, test } from "vitest";
import { derivePlainTextDescriptionFromBlocks } from "./deriveDescriptionFromBlocks.js";
import type { BlockDTO } from "./types.js";

function row(order: number, block: BlockDTO) {
  return { order, block };
}

describe("derivePlainTextDescriptionFromBlocks", () => {
  test("returns undefined for empty blocks", () => {
    expect(derivePlainTextDescriptionFromBlocks([])).toBeUndefined();
  });

  test("joins paragraph and heading text in order", () => {
    const out = derivePlainTextDescriptionFromBlocks([
      row(0, { type: "paragraph", text: "First line." }),
      row(1, { type: "heading", level: 2, text: "Subhead" }),
      row(2, { type: "paragraph", text: "Second line." }),
    ]);
    expect(out).toBe("First line. Subhead Second line.");
  });

  test("sorts by order field", () => {
    const out = derivePlainTextDescriptionFromBlocks([
      row(2, { type: "paragraph", text: "B" }),
      row(0, { type: "paragraph", text: "A" }),
      row(1, { type: "paragraph", text: "C" }),
    ]);
    expect(out).toBe("A C B");
  });

  test("truncates long text with ellipsis", () => {
    const long = "word ".repeat(80).trim();
    const out = derivePlainTextDescriptionFromBlocks([row(0, { type: "paragraph", text: long })]);
    expect(out).toBeDefined();
    expect(out!.length).toBeLessThanOrEqual(161);
    expect(out!.endsWith("…")).toBe(true);
  });

  test("skips images", () => {
    const out = derivePlainTextDescriptionFromBlocks([
      row(0, { type: "image", url: "https://x.com/a.png", alt: "x" }),
      row(1, { type: "paragraph", text: "Only this." }),
    ]);
    expect(out).toBe("Only this.");
  });
});
