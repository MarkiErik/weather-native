// 8-point compass abbreviation (Slovak) for a meteorological bearing in degrees.
const POINTS = ["S", "SV", "V", "JV", "J", "JZ", "Z", "SZ"];

export function compass8(deg: number): string {
  return POINTS[Math.round(deg / 45) % 8];
}
