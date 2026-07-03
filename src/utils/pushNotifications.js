import NotificationToken from "../models/NotificationToken.js";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

function buildExpoMessage(token, payload) {
  return {
    to: token.expoPushToken,
    sound: "default",
    title: payload.title,
    body: payload.body,
    data: payload.data || {},
  };
}

export async function sendPushNotificationToAccounts(accountIds, payload) {
  const uniqueAccountIds = [...new Set((accountIds || []).filter(Boolean).map(String))];
  if (!uniqueAccountIds.length) return { sent: 0 };

  const tokens = await NotificationToken.find({
    account: { $in: uniqueAccountIds },
    enabled: true,
  }).lean();

  if (!tokens.length) {
    return { sent: 0 };
  }

  const messages = tokens.map((token) => buildExpoMessage(token, payload));

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      return { sent: 0, failed: messages.length };
    }

    return { sent: messages.length };
  } catch (_error) {
    return { sent: 0, failed: messages.length };
  }
}
