// Small spherical-geometry helpers. No dependencies.

const EARTH_RADIUS_KM = 6371;

export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

// Wind direction is meteorological (the direction it blows FROM). This returns the
// direction it blows TO — one place for the FROM↔TO convention.
export function downwindBearing(fromDeg: number): number {
  return (fromDeg + 180) % 360;
}

// Destination point given a start, an initial bearing (degrees, 0 = north,
// clockwise) and a distance (km). Standard great-circle formula.
export function destinationPoint(
  lat: number,
  lon: number,
  bearingDeg: number,
  distanceKm: number,
): { lat: number; lon: number } {
  const angular = distanceKm / EARTH_RADIUS_KM; // angular distance (radians)
  const bearing = toRad(bearingDeg);
  const phi1 = toRad(lat);
  const lambda1 = toRad(lon);

  const phi2 = Math.asin(
    Math.sin(phi1) * Math.cos(angular) + Math.cos(phi1) * Math.sin(angular) * Math.cos(bearing),
  );
  const lambda2 =
    lambda1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angular) * Math.cos(phi1),
      Math.cos(angular) - Math.sin(phi1) * Math.sin(phi2),
    );

  return { lat: toDeg(phi2), lon: toDeg(lambda2) };
}
