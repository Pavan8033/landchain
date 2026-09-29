import { admin, isUsingRealFirebase, memoryStore } from "../config/firebase";
import { NotificationItem } from "../types";

export async function sendNotification(params: {
  recipientUid: string;
  type: NotificationItem["type"];
  title: string;
  message: string;
  actionUrl?: string;
}): Promise<NotificationItem> {
  const notifId = `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const notif: NotificationItem = {
    id: notifId,
    recipientUid: params.recipientUid,
    type: params.type,
    title: params.title,
    message: params.message,
    actionUrl: params.actionUrl,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  if (isUsingRealFirebase) {
    try {
      await admin.firestore().collection("notifications").doc(notifId).set(notif);
    } catch (e) {
      memoryStore.setDoc("notifications", notifId, notif);
    }
  } else {
    memoryStore.setDoc("notifications", notifId, notif);
  }

  return notif;
}

export async function getUserNotifications(recipientUid: string): Promise<NotificationItem[]> {
  if (isUsingRealFirebase) {
    try {
      const snap = await admin
        .firestore()
        .collection("notifications")
        .where("recipientUid", "==", recipientUid)
        .orderBy("createdAt", "desc")
        .limit(30)
        .get();
      return snap.docs.map((d) => d.data() as NotificationItem);
    } catch (e) {
      // Fallback
    }
  }

  const all = memoryStore.listDocs("notifications", (n) => n.recipientUid === recipientUid);
  return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markNotificationAsRead(notifId: string, callerUid?: string): Promise<{ success: boolean; error?: string }> {
  if (isUsingRealFirebase) {
    try {
      const docRef = admin.firestore().collection("notifications").doc(notifId);
      const snap = await docRef.get();
      if (!snap.exists) return { success: false, error: "NOT_FOUND" };
      const data = snap.data();
      if (callerUid && data?.recipientUid && data.recipientUid !== callerUid) {
        return { success: false, error: "FORBIDDEN" };
      }
      await docRef.update({ isRead: true });
      return { success: true };
    } catch (e) {
      // Fallback
    }
  }

  const existing = memoryStore.getDoc("notifications", notifId);
  if (!existing) return { success: false, error: "NOT_FOUND" };
  if (callerUid && existing.recipientUid && existing.recipientUid !== callerUid) {
    return { success: false, error: "FORBIDDEN" };
  }
  memoryStore.updateDoc("notifications", notifId, { isRead: true });
  return { success: true };
}
