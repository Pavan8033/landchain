import { admin, isUsingRealFirebase, memoryStore } from "../config/firebase";
import { AuditLog } from "../types";

export async function logAuditEvent(params: {
  actorUid: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType: "APPLICATION" | "RECORD" | "TRANSFER" | "USER" | "SYSTEM";
  targetId: string;
  metadata?: Record<string, any>;
  transactionHash?: string;
}): Promise<AuditLog> {
  const logId = `AUDIT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const auditEntry: AuditLog = {
    id: logId,
    actorUid: params.actorUid,
    actorEmail: params.actorEmail,
    actorRole: params.actorRole,
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    metadata: params.metadata || {},
    transactionHash: params.transactionHash,
    timestamp: new Date().toISOString(),
  };

  if (isUsingRealFirebase) {
    try {
      await admin.firestore().collection("auditLogs").doc(logId).set(auditEntry);
    } catch (err) {
      console.error("[AuditService] Failed writing to Firestore, logging to memoryStore:", err);
      memoryStore.setDoc("auditLogs", logId, auditEntry);
    }
  } else {
    memoryStore.setDoc("auditLogs", logId, auditEntry);
  }

  console.log(`[AUDIT] [${auditEntry.action}] By: ${auditEntry.actorEmail} Target: ${auditEntry.targetId}`);
  return auditEntry;
}

export async function getAuditLogs(limitCount = 50): Promise<AuditLog[]> {
  if (isUsingRealFirebase) {
    try {
      const snap = await admin
        .firestore()
        .collection("auditLogs")
        .orderBy("timestamp", "desc")
        .limit(limitCount)
        .get();
      return snap.docs.map((d) => d.data() as AuditLog);
    } catch (e) {
      // Fallback to memoryStore
    }
  }

  const logs = memoryStore.listDocs("auditLogs");
  return logs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limitCount);
}
