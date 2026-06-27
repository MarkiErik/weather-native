/// <reference types="jest" />
import { buildUpwindSamples, findArrival, type UpwindPoint } from "@/services/upwind";

describe("buildUpwindSamples", () => {
  it("creates 9 samples (3 distances × 3 angles)", () => {
    expect(buildUpwindSamples(49, 16, 270)).toHaveLength(9);
  });

  it("samples within ±30° of the wind source and to the west for a westerly wind", () => {
    const samples = buildUpwindSamples(49, 16, 270);
    for (const s of samples) {
      expect(Math.abs(s.bearing - 270)).toBeLessThanOrEqual(30);
      expect(s.lon).toBeLessThan(16); // west of origin
    }
  });

  it("uses the configured distances", () => {
    const distances = new Set(buildUpwindSamples(49, 16, 0).map((s) => s.distanceKm));
    expect(distances).toEqual(new Set([15, 30, 45]));
  });
});

function makePoint(over: Partial<UpwindPoint>): UpwindPoint {
  return {
    lat: 0,
    lon: 0,
    bearing: 0,
    distanceKm: 30,
    dxKm: 0,
    dyKm: 0,
    code: 0,
    temperature: 20,
    precipitation: 0,
    isDay: true,
    ...over,
  };
}

describe("findArrival", () => {
  it("returns null when nothing is wet", () => {
    expect(findArrival([makePoint({}), makePoint({ code: 3 })], 20, false)).toBeNull();
  });

  it("picks the nearest wet point and estimates ETA", () => {
    const arrival = findArrival(
      [
        makePoint({ distanceKm: 45, code: 61, bearing: 270 }),
        makePoint({ distanceKm: 15, code: 80, bearing: 280 }),
      ],
      30,
      false,
    );
    expect(arrival?.distanceKm).toBe(15);
    expect(arrival?.etaMin).toBe(30); // 15 km / 30 km/h = 0.5 h
  });

  it("has a null ETA when calm", () => {
    const arrival = findArrival([makePoint({ precipitation: 1, distanceKm: 20 })], 1, true);
    expect(arrival?.etaMin).toBeNull();
  });

  it("treats precipitation > 0 as wet even with a clear code", () => {
    expect(findArrival([makePoint({ precipitation: 0.5 })], 20, false)).not.toBeNull();
  });
});
