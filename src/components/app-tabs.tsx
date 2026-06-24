import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useColorScheme } from "react-native";

import { useAppearance } from "@/contexts/appearance";
import { Colors } from "@/constants/theme";

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];

  // Keď je pozadie tmavé (noc/dážď/búrka), ikony+texty zbielime, inak tmavé.
  const { isDark } = useAppearance();
  const iconColor = isDark
    ? { default: "rgba(255,255,255,0.6)", selected: "#ffffff" }
    : { default: colors.textSecondary, selected: colors.text };
  const labelStyle = isDark
    ? { default: { color: "rgba(255,255,255,0.6)" }, selected: { color: "#ffffff" } }
    : { default: { color: colors.textSecondary }, selected: { color: colors.text } };

  return (
    <NativeTabs
      // Žiadne pevné pozadie — namiesto bielej použijeme priesvitný "frosted" blur (iOS),
      // cez ktorý presvitá gradient. Na Androide blur nie je, použije sa systémové pozadie.
      blurEffect="systemUltraThinMaterial"
      indicatorColor={colors.backgroundElement}
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
