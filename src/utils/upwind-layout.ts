import { downwindBearing, toDeg, toRad } from "@/utils/geo";

// Pure projection for the upwind scope: fit the city (0,0) + all sampled points
// tightly and centred into a width×height box, one scale for both axes (no distortion).

export type UpwindLayout = {
  cityX: number;
  cityY: number;
  pxPerKm: number;
  ux: number; // downwind screen unit vector (where the wind blows TO)
  uy: number;
  arrowDeg: number; // that vector as a rotation, in degrees
};

type Offset = { dxKm: number; dyKm: number };

const MARGIN = 44; // keep icons + temps inside the box, with breathing room

export function computeUpwindLayout(
  points: Offset[],
  width: number,
  height: number,
  windDirection: number,
): UpwindLayout {
  const beta = toRad(downwindBearing(windDirection));
  const ux = Math.sin(beta);
  const uy = -Math.cos(beta);

  const dxs = [0, ...points.map((p) => p.dxKm)];
  const dys = [0, ...points.map((p) => p.dyKm)];
  const minX = Math.min(...dxs);
  const maxX = Math.max(...dxs);
  const minY = Math.min(...dys);
  const maxY = Math.max(...dys);
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const spanX = Math.max(maxX - minX, 1);
  const spanY = Math.max(maxY - minY, 1);
  const pxPerKm = Math.min(
    Math.max(width - 2 * MARGIN, 1) / spanX,
    Math.max(height - 2 * MARGIN, 1) / spanY,
  );

  return {
    pxPerKm,
    ux,
    uy,
    arrowDeg: toDeg(Math.atan2(uy, ux)),
    cityX: width / 2 - midX * pxPerKm,
    cityY: height / 2 + midY * pxPerKm,
  };
}
