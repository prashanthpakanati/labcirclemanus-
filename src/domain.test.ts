import { describe, expect, it } from "vitest";
import { createDemoBooking, demoQuoteMinor, formatDemoRupees, readDemoBookings, saveDemoBooking, visibleServices, type DemoBooking } from "./domain";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
}

const booking: DemoBooking = createDemoBooking({
  kind: "blood", itemIds: ["cbc"], itemNames: ["Complete blood count"], locality: "Indiranagar", pinCode: "560038", visitDate: "2026-10-15", timeSlot: "08:00 – 10:00 AM", illustrativeTotalMinor: 45000,
}, new Date("2026-10-14T12:00:00Z"));

describe("catalogue and demo boundary", () => {
  it("filters the blood catalogue by query and category", () => {
    expect(visibleServices("blood", "thyroid").map(item => item.id)).toEqual(["thyroid"]);
    expect(visibleServices("blood", "", "Heart health").map(item => item.id)).toEqual(["lipid"]);
    expect(visibleServices("scan", "thyroid")).toEqual([]);
  });

  it("returns zero for an empty quote and includes only the selected demo items", () => {
    expect(demoQuoteMinor([])).toBe(0);
    expect(demoQuoteMinor(["cbc"])).toBe(45000);
    expect(demoQuoteMinor(["cbc", "vitd"])).toBe(130000);
    expect(demoQuoteMinor(["unknown"])).toBe(0);
  });

  it("formats demo rupees without making the quote a live price", () => {
    expect(formatDemoRupees(45000)).toContain("450");
  });

  it("persists and reloads only browser-local demo bookings", () => {
    const storage = memoryStorage();
    expect(readDemoBookings(storage)).toEqual([]);
    expect(saveDemoBooking(booking, storage)).toEqual([booking]);
    expect(readDemoBookings(storage)).toEqual([booking]);
  });

  it("recovers from malformed browser-local data without crashing", () => {
    const storage = { getItem: () => "not-json" };
    expect(readDemoBookings(storage)).toEqual([]);
  });
});
