import { Text, View } from "react-native";

type WeatherCardProps = {
  icon: string;
  city: string;
  temperature: number;
  unit: "C" | "F";
  description: string;
  high: number;
  low: number;
};

export function WeatherCard({
  icon,
  city,
  temperature,
  unit,
  description,
  high,
  low,
}: WeatherCardProps) {
  return (
    <View className="items-center">
      <Text className="text-7xl">{icon}</Text>
      <Text className="mt-2 text-2xl font-semibold text-white">{city}</Text>
      <Text className="text-[96px] font-thin leading-none text-white">
        {temperature}°{unit}
      </Text>
      <Text className="text-xl text-white/90">{description}</Text>
      <View className="mt-4 flex-row gap-4">
        <Text className="text-base text-white/80">H: {high}°</Text>
        <Text className="text-base text-white/80">L: {low}°</Text>
      </View>
    </View>
  );
}
