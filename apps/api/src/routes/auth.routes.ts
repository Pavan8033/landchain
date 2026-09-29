import { Router, Request, Response, NextFunction } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import { admin, isUsingRealFirebase, memoryStore } from "../config/firebase";
import { UpdateProfileSchema, SetRoleSchema } from "../validators/schemas";
import { logAuditEvent } from "../services/auditService";

const router = Router();
const ADMIN_SECRET = process.env.ADMIN_SETUP_SECRET || "landchain-academic-secret-key-2026";

/**
 * GET /api/auth/profile
 * Get current authenticated user profile
 */
router.get("/profile", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    let profile = null;

    if (isUsingRealFirebase) {
      const doc = await admin.firestore().collection("users").doc(user.uid).get();
      if (doc.exists) {
        profile = doc.data();
      }
    } else {
      profile = memoryStore.getDoc("users", user.uid);
    }

    if (!profile) {
      // Auto-initialize profile if missing
      profile = {
        uid: user.uid,
        email: user.email,
        displayName: user.email.split("@")[0],
        role: user.role,
        walletAddress: user.walletAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (isUsingRealFirebase) {
        await admin.firestore().collection("users").doc(user.uid).set(profile);
      } else {
        memoryStore.setDoc("users", user.uid, profile);
      }
    }

    return res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/auth/profile
 * Update personal profile (name, phone, wallet)
 */
router.put("/profile", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = UpdateProfileSchema.parse(req.body);
    const user = req.user!;

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };
    if (validated.displayName !== undefined) updates.displayName = validated.displayName;
    if (validated.phoneNumber !== undefined) updates.phoneNumber = validated.phoneNumber;
    if (validated.walletAddress !== undefined) updates.walletAddress = validated.walletAddress;

    let updated = null;
    if (isUsingRealFirebase) {
      await admin.firestore().collection("users").doc(user.uid).update(updates);
      const doc = await admin.firestore().collection("users").doc(user.uid).get();
      updated = doc.data();
    } else {
      updated = memoryStore.updateDoc("users", user.uid, updates);
    }

    await logAuditEvent({
      actorUid: user.uid,
      actorEmail: user.email,
      actorRole: user.role,
      action: "USER_PROFILE_UPDATED",
      targetType: "USER",
      targetId: user.uid,
      metadata: { fields: Object.keys(updates) },
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/set-role
 * Secure administrative role provisioning (e.g. assigning 'government' role)
 * Requires verification of trusted server secret key
 */
router.post("/set-role", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = SetRoleSchema.parse(req.body);

    if (validated.adminSecret !== ADMIN_SECRET) {
      return res.status(403).json({
        success: false,
        error: "Invalid administrative setup secret key. Unauthorized role assignment.",
      });
    }

    if (isUsingRealFirebase) {
      // Set Firebase Custom Claims
      await admin.auth().setCustomUserClaims(validated.targetUid, {
        role: validated.targetRole,
        government: validated.targetRole === "government",
      });

      // Update Firestore user profile
      await admin.firestore().collection("users").doc(validated.targetUid).set(
        {
          role: validated.targetRole,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } else {
      memoryStore.updateDoc("users", validated.targetUid, {
        role: validated.targetRole,
      });
    }

    await logAuditEvent({
      actorUid: "SYSTEM_ADMIN",
      actorEmail: "admin@landchain.internal",
      actorRole: "superadmin",
      action: "USER_ROLE_PROVISIONED",
      targetType: "USER",
      targetId: validated.targetUid,
      metadata: { newRole: validated.targetRole },
    });

    return res.json({
      success: true,
      message: `User ${validated.targetUid} successfully provisioned with role '${validated.targetRole}'.`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
