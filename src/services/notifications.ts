import * as Notifications from "expo-notifications";

// Keď je appka v popredí, notifikáciu aj tak zobraz ako banner (inak by sa na
// niektorých platformách ticho zahodila). Nastavuje sa raz, na úrovni modulu.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Zobrazí local notifikáciu v lište telefónu (okamžite).
 * Pri prvom volaní vyžiada povolenie. Bez povolenia ticho nič nespraví.
 */
export async function showWeatherNotification(title: string, body: string): Promise<void> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null, // null = doruč hneď
    });
  } catch {
    // Na webe / v prostredí bez podpory notifikácií len ticho preskočíme.
  }
}
