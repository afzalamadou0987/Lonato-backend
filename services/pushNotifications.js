// Envoie de vraies notifications push via l'API Expo (gratuite, aucune clé requise)

async function sendPushNotification(expoPushToken, title, body, data = {}) {
  if (!expoPushToken) return null;

  const message = { to: expoPushToken, sound: "default", title, body, data };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    return await response.json();
  } catch (err) {
    console.error("Erreur envoi notification push:", err.message);
    return null;
  }
}

module.exports = { sendPushNotification };