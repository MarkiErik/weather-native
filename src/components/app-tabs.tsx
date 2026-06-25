import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useColorScheme } from "react-native";

import { useAppearance } from "@/contexts/appearance";
import { Colors } from "@/constants/theme";

export default function AppTabs() {
  const scheme = useColorScheme();
  // useColorScheme môže vrátiť null → ber to ako "light" (bezpečné voči Colors[null]).
  const indicatorColor = Colors[scheme === "dark" ? "dark" : "light"].backgroundElement;

  // Farby ikon/textov podľa toho, či je pozadie tmavé (noc/dážď/búrka).
  // Jedna paleta z Colors — žiadne natvrdo zapísané farby ani duplicitné ternáry.
  const { isDark } = useAppearance();
  const palette = isDark ? Colors.dark : Colors.light;
  const iconColor = { default: palette.textSecondary, selected: palette.text };
  const labelStyle = {
    default: { color: palette.textSecondary },
    selected: { color: palette.text },
  };

  return (
    <NativeTabs
      // Žiadne pevné pozadie — namiesto bielej použijeme priesvitný "frosted" blur (iOS),
      // cez ktorý presvitá gradient. Na Androide blur nie je, použije sa systémové pozadie.
      blurEffect="systemUltraThinMaterial"
      indicatorColor={indicatorColor}
      iconColor={iconColor}
      labelStyle={labelStyle}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Počasie</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/home.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <NativeTabs.Trigger.Label>Hľadať</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/explore.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Nastavenia</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/home.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
