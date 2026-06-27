import { Text, View } from "react-native";

type WeatherCardProps = {
  icon: string;
  city: string;
  temperature: number;
  unit: "C" | "F";
  description: string;
};

export function WeatherCard({ icon, city, temperature, unit, description }: WeatherCardProps) {
  return (
    <View className="items-center">
      <Text className="text-7xl">{icon}</Text>
      <Text className="mt-2 text-2xl font-semibold text-white">{city}</Text>
      <Text className="text-[96px] font-thin leading-none text-white">
        {temperature}°{unit}
      </Text>
      <Text className="text-xl text-white/90">{description}</Text>
    </View>
  );
}
