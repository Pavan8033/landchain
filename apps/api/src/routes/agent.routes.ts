import { Router, Request, Response, NextFunction } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import { admin, isUsingRealFirebase, memoryStore } from "../config/firebase";

const router = Router();

/**
 * GET /api/agent/enquiries
 * List client enquiries for the authenticated agent
 */
router.get(
  "/enquiries",
  authenticate,
  requireRole(["agent"]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      let enquiries: any[] = [];
      if (isUsingRealFirebase) {
        const snap = await admin
          .firestore()
          .collection("agentEnquiries")
          .where("agentUid", "==", user.uid)
          .get();
        enquiries = snap.docs.map((d) => d.data());
      } else {
        enquiries = memoryStore.listDocs("agentEnquiries", (e) => e.agentUid === user.uid || !e.agentUid);
      }
      return res.json({ success: true, data: enquiries });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/agent/enquiries
 * Create a new enquiry for an agent
 */
router.post(
  "/enquiries",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const { landId, clientName, clientEmail, clientPhone, message } = req.body;

      const enquiryId = `ENQ-${Date.now().toString().slice(-6)}`;
      const enquiry = {
        id: enquiryId,
        enquiryId,
        landId,
        clientUid: user.uid,
        clientName: clientName || user.email,
        clientEmail: clientEmail || user.email,
        clientPhone,
        message,
        agentUid: "agent-101",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      };

      if (isUsingRealFirebase) {
        await admin.firestore().collection("agentEnquiries").doc(enquiryId).set(enquiry);
      } else {
        memoryStore.setDoc("agentEnquiries", enquiryId, enquiry);
      }

      return res.status(201).json({ success: true, data: enquiry });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
