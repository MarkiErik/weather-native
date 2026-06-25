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
 * Vyžiada povolenie na notifikácie. Volaj RAZ pri štarte appky — nie uprostred
 * akcie (napr. výberu mesta), aby systémový dialóg nevyskočil neočakávane.
 */
export async function requestNotificationPermission(): Promise<void> {
  try {
    await Notifications.requestPermissionsAsync();
  } catch {
    // prostredie bez podpory notifikácií (napr. web) — ticho preskočíme
  }
}

/**
 * Zobrazí local notifikáciu v lište telefónu (okamžite).
 * Povolenie iba ZISTÍ (nepýta ho), takže neblokuje a neprerušuje flow.
 */
export async function showWeatherNotification(title: string, body: string): Promise<void> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null, // null = doruč hneď
    });
  } catch {
    // na webe / v prostredí bez podpory notifikácií len ticho preskočíme
  }
}
