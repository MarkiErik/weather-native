import { Fragment, useEffect, useMemo, useState } from "react";
import { Animated, Easing, type LayoutChangeEvent, Platform, Text, View } from "react-native";

import { getWeatherTheme } from "@/constants/weather-theme";
import { isWet, type Arrival, type UpwindField, type UpwindPoint } from "@/services/upwind";
import { compass8 } from "@/utils/compass";
import { computeUpwindLayout, type UpwindLayout } from "@/utils/upwind-layout";

// Fixed, non-interactive "scope": north up. The city + all sampled points are fit
// tightly and centred into the panel (no wasted space, whichever way the wind blows).
// All projection math lives in computeUpwindLayout — this file is presentational.

type Props = {
  city: string;
  cityIcon: string;
  windDirection: number; // degrees, FROM
  windSpeed: number; // km/h
} & UpwindField;

const RING_KM = [25, 50];
const RING_COLOR = "rgba(255,255,255,0.13)";

// Spoken summary so the visual scope isn't invisible to screen readers.
function summarize(city: string, calm: boolean, arrival: Arrival | null): string {
  if (arrival) {
    const eta = arrival.etaMin !== null ? `, môže prísť o ${arrival.etaMin} minút` : "";
    return `Počasie v okolí ${city}. Dážď ${arrival.distanceKm} kilometrov ${compass8(arrival.bearing)}${eta}.`;
  }
  return `Počasie v okolí ${city}. ${calm ? "Bezvetrie." : "V okolí žiadny dážď."}`;
}

function RangeRing({ km, layout }: { km: number; layout: UpwindLayout }) {
  const { cityX, cityY, pxPerKm, ux, uy } = layout;
  const r = km * pxPerKm;
  return (
    <Fragment>
      <View
        style={{
          position: "absolute",
          left: cityX - r,
          top: cityY - r,
          width: 2 * r,
          height: 2 * r,
          borderRadius: r,
          borderWidth: 1,
          borderColor: RING_COLOR,
        }}
      />
      {/* Label on the (always visible) upwind arc. */}
      <Text
        style={{
          position: "absolute",
          left: cityX - ux * r - 18,
          top: cityY - uy * r - 7,
          width: 36,
        }}
        className="text-center text-[9px] text-white/40">
        {km} km
      </Text>
    </Fragment>
  );
}

function PointMarker({ point, layout }: { point: UpwindPoint; layout: UpwindLayout }) {
  const x = layout.cityX + point.dxKm * layout.pxPerKm;
  const y = layout.cityY - point.dyKm * layout.pxPerKm;
  const wet = isWet(point);
  return (
    <View
      style={{ position: "absolute", left: x - 18, top: y - 18, width: 36 }}
      className="items-center">
      <View
        className={`h-9 w-9 items-center justify-center rounded-full ${
          wet ? "border border-sky-200/80 bg-sky-400/30" : "bg-white/10"
        }`}>
        <Text className="text-lg">{getWeatherTheme(point.code, point.isDay).icon}</Text>
      </View>
      <Text
        className={
          wet ? "text-[10px] font-semibold text-sky-100" : "text-[10px] font-medium text-white/80"
        }>
        {point.temperature}°
      </Text>
    </View>
  );
}

function CityPin({ city, icon, layout }: { city: string; icon: string; layout: UpwindLayout }) {
  return (
    <View
      style={{ position: "absolute", left: layout.cityX - 40, top: layout.cityY - 22, width: 80 }}
      className="items-center">
      <View className="h-11 w-11 items-center justify-center rounded-full border-2 border-white/80 bg-white/25">
        <Text className="text-xl">{icon}</Text>
      </View>
      <View className="mt-1 rounded-full bg-black/25 px-2 py-0.5">
        <Text numberOfLines={1} className="text-[11px] font-semibold text-white">
          {city}
        </Text>
      </View>
    </View>
  );
}

function CompassTicks({ height }: { height: number }) {
  const side = "text-[10px] text-white/30";
  return (
    <>
      <Text className={`absolute left-0 right-0 top-1.5 text-center ${side}`}>S</Text>
      <Text className={`absolute bottom-1.5 left-0 right-0 text-center ${side}`}>J</Text>
      <Text style={{ position: "absolute", left: 8, top: height / 2 - 7 }} className={side}>
        Z
      </Text>
      <Text style={{ position: "absolute", right: 8, top: height / 2 - 7 }} className={side}>
        V
      </Text>
    </>
  );
}

// A field of short dashes that drift across the whole panel in the wind direction,
// at a pace set by wind speed — like streamlines.
const STREAK_SPACING = 42; // px between lanes (perpendicular to the wind)
const STREAK_LEN = 16; // dash length

function windDuration(speed: number): number {
  if (speed < 12) return 2800; // weak — slow drift
  if (speed < 30) return 1700; // medium
  return 950; // strong — fast
}

function Streak({
  w,
  h,
  ux,
  uy,
  arrowDeg,
  duration,
  delay,
  laneOffset,
}: {
  w: number;
  h: number;
  ux: number;
  uy: number;
  arrowDeg: number;
  duration: number;
  delay: number;
  laneOffset: number; // perpendicular distance from the panel centre
}) {
  const [t] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(t, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== "web",
      }),
    );
    const id = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(id);
      loop.stop();
    };
  }, [t, duration, delay]);

  // Travel the full diagonal so a dash crosses the whole panel; start half a travel
  // upwind of centre, offset sideways into its lane.
  const travel = Math.hypot(w, h) + 40;
  const startX = w / 2 - uy * laneOffset - ux * (travel / 2);
  const startY = h / 2 + ux * laneOffset - uy * (travel / 2);
  const translateX = t.interpolate({
    inputRange: [0, 1],
    outputRange: [startX, startX + ux * travel],
  });
  const translateY = t.interpolate({
    inputRange: [0, 1],
    outputRange: [startY, startY + uy * travel],
  });
  const opacity = t.interpolate({
    inputRange: [0, 0.15, 0.85, 1],
    outputRange: [0, 0.45, 0.45, 0],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: -STREAK_LEN / 2,
        top: -1,
        width: STREAK_LEN,
        height: 2,
        borderRadius: 1,
        backgroundColor: "white",
        opacity,
        transform: [{ translateX }, { translateY }, { rotate: `${arrowDeg}deg` }],
      }}
    />
  );
}

function WindField({
  layout,
  width,
  height,
  windSpeed,
}: {
  layout: UpwindLayout;
  width: number;
  height: number;
  windSpeed: number;
}) {
  const { ux, uy, arrowDeg } = layout;
  const duration = windDuration(windSpeed);
  const half = Math.ceil(Math.hypot(width, height) / 2 / STREAK_SPACING);

  const streaks = [];
  for (let i = -half; i <= half; i++) {
    // Two staggered dashes per lane so the lane is never empty.
    for (const phase of [0, 0.5]) {
      const frac = (((i * 0.37 + phase) % 1) + 1) % 1; // 0..1, organic stagger
      streaks.push({
        key: `${i}-${phase}`,
        laneOffset: i * STREAK_SPACING,
        delay: frac * duration,
      });
    }
  }

  return (
    <>
      {streaks.map((s) => (
        <Streak
          key={s.key}
          w={width}
          h={height}
          ux={ux}
          uy={uy}
          arrowDeg={arrowDeg}
          duration={duration}
          delay={s.delay}
          laneOffset={s.laneOffset}
        />
      ))}
    </>
  );
}

export function UpwindPanel({
  city,
  cityIcon,
  windDirection,
  windSpeed,
  points,
  calm,
  arrival,
}: Props) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  function onLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    setBox({ w: width, h: height });
  }

  // Only project once we know the box size; memoised so re-renders (units/theme
  // toggles) don't recompute the layout when nothing relevant changed.
  const layout = useMemo(
    () =>
      box.w > 0 && box.h > 0 ? computeUpwindLayout(points, box.w, box.h, windDirection) : null,
    [points, box.w, box.h, windDirection],
  );

  return (
    <View className="mt-6 w-full">
      <Text className="mb-2 px-1 text-sm font-semibold text-white/80">Počasie smerujúce k vám</Text>

      <View
        onLayout={onLayout}
        accessible
        accessibilityLabel={summarize(city, calm, arrival)}
        className="aspect-[7/5] w-full overflow-hidden rounded-3xl bg-white/10">
        {layout && (
          <>
            {RING_KM.map((km) => (
              <RangeRing key={`ring-${km}`} km={km} layout={layout} />
            ))}
            <CompassTicks height={box.h} />
            {!calm && (
              <WindField layout={layout} width={box.w} height={box.h} windSpeed={windSpeed} />
            )}
            {points.map((p) => (
              <PointMarker key={`${p.bearing}-${p.distanceKm}`} point={p} layout={layout} />
            ))}
            <CityPin city={city} icon={cityIcon} layout={layout} />
          </>
        )}
      </View>

      {/* Below the panel: what's coming, the wind, and an honest caveat. */}
      {arrival ? (
        <Text className="mt-2 px-1 text-sm font-semibold text-sky-200">
          🌧 Dážď ~{arrival.distanceKm} km {compass8(arrival.bearing)}
          {arrival.etaMin !== null ? ` · môže prísť o ~${arrival.etaMin} min` : " (bezvetrie)"}
        </Text>
      ) : (
        <Text className="mt-2 px-1 text-sm text-white/70">V okolí zatiaľ žiadny dážď</Text>
      )}
      <Text className="px-1 pt-1 text-xs font-medium text-white/75">
        {calm ? "🍃 bezvetrie" : `💨 ${windSpeed} km/h · z ${compass8(windDirection)}`}
        <Text className="font-normal text-white/50"> · odhad podľa vetra</Text>
      </Text>
    </View>
  );
}
