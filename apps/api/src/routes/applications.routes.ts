import { Router, Request, Response, NextFunction } from "express";
import { ethers } from "ethers";
import { authenticate, requireRole } from "../middleware/auth";
import { admin, isUsingRealFirebase, memoryStore } from "../config/firebase";
import { CreateApplicationSchema, ReviewApplicationSchema } from "../validators/schemas";
import { logAuditEvent } from "../services/auditService";
import { sendNotification } from "../services/notificationService";
import { sendApiError } from "../utils/apiResponse";
import { LandApplication, LandRecord } from "../types";

const router = Router();

/**
 * POST /api/applications
 * Land seller submits a new land registration application
 */
router.post(
  "/",
  authenticate,
  requireRole(["seller"]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = CreateApplicationSchema.parse(req.body);
      const user = req.user!;

      // 1. Layer 1 Duplicate Protection: Check if parcel/survey is already registered on-chain or published
      let existingRecord: LandRecord | null = null;
      if (isUsingRealFirebase) {
        const snap = await admin
          .firestore()
          .collection("landRecords")
          .where("parcelNumber", "==", validated.surveyNumber)
          .limit(1)
          .get();
        if (!snap.empty) existingRecord = snap.docs[0].data() as LandRecord;
      } else {
        const list = memoryStore.listDocs("landRecords", (r: LandRecord) =>
          r.parcelNumber.toLowerCase() === validated.surveyNumber.toLowerCase()
        );
        if (list.length > 0) existingRecord = list[0];
      }

      if (existingRecord) {
        return sendApiError(
          res,
          409,
          "DUPLICATE_LAND",
          `Survey/Parcel number '${validated.surveyNumber}' is already registered as canonical land parcel '${existingRecord.landId}'.`
        );
      }

      // 2. Layer 2 Duplicate Protection: Check for active applications in review for same parcel
      let existingActiveApps: LandApplication[] = [];
      if (isUsingRealFirebase) {
        const snap = await admin
          .firestore()
          .collection("landApplications")
          .where("surveyNumber", "==", validated.surveyNumber)
          .where("status", "in", ["PENDING_REVIEW", "APPROVED_PENDING_BLOCKCHAIN"])
          .limit(1)
          .get();
        existingActiveApps = snap.docs.map((d) => d.data() as LandApplication);
      } else {
        existingActiveApps = memoryStore.listDocs("landApplications", (a: LandApplication) => 
          a.surveyNumber.toLowerCase() === validated.surveyNumber.toLowerCase() &&
          ["PENDING_REVIEW", "APPROVED_PENDING_BLOCKCHAIN"].includes(a.status)
        );
      }

      if (existingActiveApps.length > 0) {
        return sendApiError(
          res,
          409,
          "DUPLICATE_APPLICATION",
          `An active application (${existingActiveApps[0].applicationId}) is already pending review for survey number ${validated.surveyNumber}.`
        );
      }

      // Normalize wallet address
      let normalizedWallet = validated.applicantWallet;
      try {
        if (ethers.isAddress(validated.applicantWallet)) {
          normalizedWallet = ethers.getAddress(validated.applicantWallet);
        } else if (user.walletAddress && ethers.isAddress(user.walletAddress)) {
          normalizedWallet = ethers.getAddress(user.walletAddress);
        }
      } catch {
        // fallback
      }

      const appId = `LC-APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newApp: LandApplication = {
        id: appId,
        applicationId: appId,
        applicantUid: user.uid,
        applicantEmail: user.email,
        applicantWallet: normalizedWallet,
        surveyNumber: validated.surveyNumber,
        state: validated.state,
        district: validated.district,
        locality: validated.locality,
        address: validated.address,
        areaSqMeters: validated.areaSqMeters,
        measurementUnit: validated.measurementUnit,
        landCategory: validated.landCategory,
        description: validated.description,
        documents: validated.documents.map((d) => ({
          ...d,
          fileName: d.fileName || `${d.title.replace(/\s+/g, "_")}.pdf`,
          storagePath: d.storagePath || `documents/hash-only/${d.documentId}`,
          storageStatus: d.storageStatus || "HASH_ONLY",
          sha256Hash: d.sha256Hash.startsWith("0x") ? d.sha256Hash : `0x${d.sha256Hash}`,
          category: (d.category as any),
          uploadedAt: new Date().toISOString(),
        })),
        status: "PENDING_REVIEW",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isUsingRealFirebase) {
        await admin.firestore().collection("landApplications").doc(appId).set(newApp);
      } else {
        memoryStore.setDoc("landApplications", appId, newApp);
      }

      await logAuditEvent({
        actorUid: user.uid,
        actorEmail: user.email,
        actorRole: user.role,
        action: "LAND_APPLICATION_SUBMITTED",
        targetType: "APPLICATION",
        targetId: appId,
        metadata: {
          surveyNumber: validated.surveyNumber,
          locality: validated.locality,
          documentsCount: validated.documents.length,
        },
      });

      await sendNotification({
        recipientUid: user.uid,
        type: "APPLICATION_UPDATE",
        title: "Registration Application Submitted",
        message: `Your land application ${appId} for parcel ${validated.surveyNumber} has been received and is queued for government review.`,
        actionUrl: `/applications/${appId}`,
      });

      return res.status(201).json({ success: true, data: newApp });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/applications
 * List applications (government sees all; seller sees own)
 */
router.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const statusFilter = req.query.status as string | undefined;

    let apps: LandApplication[] = [];

    if (isUsingRealFirebase) {
      let query: admin.firestore.Query = admin.firestore().collection("landApplications");
      if (user.role !== "government") {
        query = query.where("applicantUid", "==", user.uid);
      }
      if (statusFilter) {
        query = query.where("status", "==", statusFilter);
      }
      query = query.orderBy("createdAt", "desc");
      const snap = await query.get();
      apps = snap.docs.map((d) => d.data() as LandApplication);
    } else {
      apps = memoryStore.listDocs("landApplications", (item) => {
        const matchesUser = user.role === "government" || item.applicantUid === user.uid;
        const matchesStatus = !statusFilter || item.status === statusFilter;
        return matchesUser && matchesStatus;
      });
      apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return res.json({ success: true, data: apps });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/applications/:id
 * Get single application details
 */
router.get("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    let app: LandApplication | null = null;
    if (isUsingRealFirebase) {
      const doc = await admin.firestore().collection("landApplications").doc(id).get();
      if (doc.exists) app = doc.data() as LandApplication;
    } else {
      app = memoryStore.getDoc("landApplications", id);
    }

    if (!app) {
      return res.status(404).json({ success: false, error: `Application ${id} not found.` });
    }

    // Authorization check
    if (user.role !== "government" && app.applicantUid !== user.uid) {
      return res.status(403).json({ success: false, error: "Unauthorized access to private land application." });
    }

    return res.json({ success: true, data: app });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/applications/:id/review
 * Government reviewer approves or rejects application
 */
router.put(
  "/:id/review",
  authenticate,
  requireRole(["government"]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = ReviewApplicationSchema.parse(req.body);
      const user = req.user!;
      const { id } = req.params;

      let app: LandApplication | null = null;
      if (isUsingRealFirebase) {
        const doc = await admin.firestore().collection("landApplications").doc(id).get();
        if (doc.exists) app = doc.data() as LandApplication;
      } else {
        app = memoryStore.getDoc("landApplications", id);
      }

      if (!app) {
        return res.status(404).json({ success: false, error: `Application ${id} not found.` });
      }

      const updates: Partial<LandApplication> = {
        status: validated.status,
        reviewNotes: validated.reviewNotes,
        reviewerUid: user.uid,
        reviewerWallet: user.walletAddress,
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (validated.onChainTxHash) updates.onChainTxHash = validated.onChainTxHash;
      if (validated.onChainBlockNumber) updates.onChainBlockNumber = validated.onChainBlockNumber;

      if (isUsingRealFirebase) {
        await admin.firestore().collection("landApplications").doc(id).update(updates);
      } else {
        memoryStore.updateDoc("landApplications", id, updates);
      }

      await logAuditEvent({
        actorUid: user.uid,
        actorEmail: user.email,
        actorRole: user.role,
        action: validated.status === "REJECTED" ? "GOVERNMENT_REJECTION" : "GOVERNMENT_APPROVAL",
        targetType: "APPLICATION",
        targetId: id,
        metadata: {
          decision: validated.status,
          notes: validated.reviewNotes,
        },
      });

      await sendNotification({
        recipientUid: app.applicantUid,
        type: "APPLICATION_UPDATE",
        title: `Application Review: ${validated.status.replace(/_/g, " ")}`,
        message: `Government reviewer decision: ${validated.status}. Notes: ${validated.reviewNotes}`,
        actionUrl: `/applications/${id}`,
      });

      return res.json({ success: true, data: { ...app, ...updates } });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/applications/:id/on-chain
 * Record confirmed blockchain transaction and create canonical LandRecord
 */
router.post(
  "/:id/on-chain",
  authenticate,
  requireRole(["government"]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { onChainTxHash, onChainBlockNumber, contractAddress, network, landId } = req.body;

      if (!onChainTxHash) {
        return res.status(400).json({ success: false, error: "Transaction hash is required." });
      }

      let app: LandApplication | null = null;
      if (isUsingRealFirebase) {
        const doc = await admin.firestore().collection("landApplications").doc(id).get();
        if (doc.exists) app = doc.data() as LandApplication;
      } else {
        app = memoryStore.getDoc("landApplications", id);
      }

      if (!app) {
        return sendApiError(res, 404, "NOT_FOUND", `Application ${id} not found.`);
      }

      if (app.status === "VERIFIED_ON_CHAIN") {
        // Idempotency: return existing record
        let existingRecord: LandRecord | null = null;
        if (isUsingRealFirebase) {
          const snap = await admin.firestore().collection("landRecords").where("applicationId", "==", app.applicationId).limit(1).get();
          if (!snap.empty) existingRecord = snap.docs[0].data() as LandRecord;
        } else {
          const list = memoryStore.listDocs("landRecords", (r: LandRecord) => r.applicationId === app!.applicationId);
          if (list.length > 0) existingRecord = list[0];
        }
        if (existingRecord) {
          return res.status(200).json({ success: true, data: existingRecord });
        }
      }

      if (app.status === "REJECTED") {
        return sendApiError(res, 400, "INVALID_STATE", "Rejected applications cannot be registered on-chain.");
      }

      // Canonical Land ID (e.g. LAND-KA-BLR-001)
      const stateCode = app.state.substring(0, 2).toUpperCase();
      const distCode = app.district.substring(0, 3).toUpperCase();
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const canonicalLandId = landId || `LAND-${stateCode}-${distCode}-${randomSuffix}`;

      // Update application
      const appUpdates = {
        status: "VERIFIED_ON_CHAIN" as const,
        onChainTxHash,
        onChainBlockNumber: onChainBlockNumber || 1,
        updatedAt: new Date().toISOString(),
      };

      if (isUsingRealFirebase) {
        await admin.firestore().collection("landApplications").doc(id).update(appUpdates);
      } else {
        memoryStore.updateDoc("landApplications", id, appUpdates);
      }

      // Create canonical LandRecord projection
      const landRecord: LandRecord = {
        id: canonicalLandId,
        landId: canonicalLandId,
        applicationId: app.applicationId,
        parcelNumber: app.surveyNumber,
        locality: app.locality,
        district: app.district,
        state: app.state,
        areaSqMeters: app.areaSqMeters,
        landCategory: app.landCategory,
        description: app.description,
        currentOwnerWallet: app.applicantWallet,
        currentOwnerUid: app.applicantUid,
        currentOwnerEmail: app.applicantEmail,
        blockchainNetwork: network || "Hardhat Local (ChainID: 31337)",
        contractAddress: contractAddress || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        transactionHash: onChainTxHash,
        blockNumber: onChainBlockNumber || 1,
        docIntegrityHash: app.documents[0]?.sha256Hash || "0x0000000000000000000000000000000000000000000000000000000000000000",
        verificationState: "VERIFIED_ON_CHAIN",
        publicationState: "PUBLISHED",
        transferCount: 0,
        verifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isUsingRealFirebase) {
        await admin.firestore().collection("landRecords").doc(canonicalLandId).set(landRecord);
      } else {
        memoryStore.setDoc("landRecords", canonicalLandId, landRecord);
      }

      await logAuditEvent({
        actorUid: req.user!.uid,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: "BLOCKCHAIN_REGISTRATION_CONFIRMED",
        targetType: "RECORD",
        targetId: canonicalLandId,
        transactionHash: onChainTxHash,
        metadata: {
          applicationId: id,
          parcelNumber: app.surveyNumber,
          blockNumber: onChainBlockNumber || 1,
          contractAddress,
        },
      });

      await sendNotification({
        recipientUid: app.applicantUid,
        type: "BLOCKCHAIN_EVENT",
        title: "Land Registered On-Chain",
        message: `Congratulations! Your land parcel is confirmed on the blockchain with ID ${canonicalLandId}.`,
        actionUrl: `/records/${canonicalLandId}`,
      });

      return res.status(201).json({ success: true, data: landRecord });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
