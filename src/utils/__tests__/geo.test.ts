/// <reference types="jest" />
import { destinationPoint, toDeg, toRad } from "@/utils/geo";

describe("destinationPoint", () => {
  it("moves ~1° north per 111 km when bearing is 0", () => {
    const p = destinationPoint(0, 0, 0, 111);
    expect(p.lat).toBeCloseTo(0.998, 1);
    expect(p.lon).toBeCloseTo(0, 3);
  });

  it("moves east (larger lon) when bearing is 90 at the equator", () => {
    const p = destinationPoint(0, 0, 90, 111);
    expect(p.lat).toBeCloseTo(0, 3);
    expect(p.lon).toBeCloseTo(1, 1);
  });

  it("goes west (smaller lon) for bearing 270 near Brno", () => {
    const origin = { lat: 49.195, lon: 16.606 };
    const p = destinationPoint(origin.lat, origin.lon, 270, 50);
    expect(p.lon).toBeLessThan(origin.lon);
    expect(p.lat).toBeCloseTo(origin.lat, 1);
  });
});

describe("toRad / toDeg", () => {
  it("round-trips a value", () => {
    expect(toDeg(toRad(123))).toBeCloseTo(123, 6);
  });
});
