import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "./app";
import { Express } from "express";
import { memoryStore } from "./config/firebase";

describe("LandChain Step 10 Security & Concurrency Test Suite", () => {
  let app: Express;

  beforeAll(() => {
    app = createApp() as Express;

    // Seed test records for IDOR, Duplicate and State Machine tests
    memoryStore.setDoc("landRecords", "LAND-TEST-SEC-01", {
      id: "LAND-TEST-SEC-01",
      landId: "LAND-TEST-SEC-01",
      parcelNumber: "SY-SEC-999",
      locality: "HSR Layout",
      district: "Bengaluru Urban",
      state: "Karnataka",
      areaSqMeters: 2400,
      landCategory: "RESIDENTIAL",
      currentOwnerWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      currentOwnerUid: "seller-123",
      currentOwnerEmail: "seller@landchain.demo",
      verificationState: "VERIFIED_ON_CHAIN",
      publicationState: "PUBLISHED",
      createdAt: new Date().toISOString(),
    });

    memoryStore.setDoc("landApplications", "APP-SEC-SELLER-A", {
      id: "APP-SEC-SELLER-A",
      applicationId: "APP-SEC-SELLER-A",
      applicantUid: "seller-123",
      applicantEmail: "seller@landchain.demo",
      applicantWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      surveyNumber: "SY-APP-PENDING-1",
      state: "Karnataka",
      district: "Bengaluru Urban",
      locality: "Whitefield",
      areaSqMeters: 1800,
      landCategory: "COMMERCIAL",
      status: "PENDING_REVIEW",
      createdAt: new Date().toISOString(),
    });

    memoryStore.setDoc("notifications", "NOTIF-USER-B", {
      id: "NOTIF-USER-B",
      recipientUid: "user-target-b",
      title: "Confidential Alert",
      message: "Private security notification",
      read: false,
      createdAt: new Date().toISOString(),
    });

    memoryStore.setDoc("transferRequests", "TRF-PENDING-BUYER-TEST", {
      id: "TRF-PENDING-BUYER-TEST",
      transferId: "TRF-PENDING-BUYER-TEST",
      landId: "LAND-TEST-SEC-01",
      sellerUid: "seller-123",
      sellerEmail: "seller@landchain.demo",
      sellerWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      buyerUid: "buyer-456",
      buyerEmail: "buyer@landchain.demo",
      buyerWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      status: "PENDING_BUYER",
      createdAt: new Date().toISOString(),
    });

    memoryStore.setDoc("transferRequests", "TRF-ALREADY-PROCESSED", {
      id: "TRF-ALREADY-PROCESSED",
      transferId: "TRF-ALREADY-PROCESSED",
      landId: "LAND-TEST-SEC-01",
      sellerUid: "seller-123",
      sellerWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      buyerUid: "buyer-456",
      buyerWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      status: "TRANSFERRED_ON_CHAIN",
      blockchainTxHash: "0x111122223333444455556666777788889999aaaabbbbccccddddeeeeffff0000",
      createdAt: new Date().toISOString(),
    });
  });

  describe("1. IDOR and Access Control Hardening", () => {
    it("Should prevent User A from marking User B's notification as read (403 FORBIDDEN)", async () => {
      const res = await request(app)
        .patch("/api/notifications/NOTIF-USER-B/read")
        .set("Authorization", "Bearer demo-token-seller");

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe("FORBIDDEN");
    });

    it("Should prevent Seller B from viewing Seller A's private application (403 FORBIDDEN)", async () => {
      const res = await request(app)
        .get("/api/applications/APP-SEC-SELLER-A")
        .set("X-Demo-Role", "seller")
        .set("X-Demo-Uid", "seller-other-attacker");

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("Should reject non-government access to data reconciliation endpoint (403 FORBIDDEN)", async () => {
      const res = await request(app)
        .post("/api/records/LAND-TEST-SEC-01/reconcile")
        .set("Authorization", "Bearer demo-token-buyer");

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe("FORBIDDEN");
    });
  });

  describe("2. Duplicate Land & Application Protection", () => {
    it("Should reject new application if survey number is already registered in canonical records (409 DUPLICATE_LAND)", async () => {
      const res = await request(app)
        .post("/api/applications")
        .set("Authorization", "Bearer demo-token-seller")
        .send({
          surveyNumber: "SY-SEC-999",
          state: "Karnataka",
          district: "Bengaluru Urban",
          locality: "HSR Layout",
          areaSqMeters: 2400,
          landCategory: "RESIDENTIAL",
          description: "Duplicate survey submission test",
          applicantWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          documents: [
            {
              documentId: "doc-1",
              title: "Deed",
              storagePath: "/docs/deed.pdf",
              fileSize: 1024,
              mimeType: "application/pdf",
              sha256Hash: "0x" + "a".repeat(64),
            },
          ],
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe("DUPLICATE_LAND");
    });

    it("Should reject new application if survey number has an active application in review (409 DUPLICATE_APPLICATION)", async () => {
      const res = await request(app)
        .post("/api/applications")
        .set("Authorization", "Bearer demo-token-seller")
        .send({
          surveyNumber: "SY-APP-PENDING-1",
          state: "Karnataka",
          district: "Bengaluru Urban",
          locality: "Whitefield",
          areaSqMeters: 1800,
          landCategory: "COMMERCIAL",
          description: "Active duplicate application test",
          applicantWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          documents: [
            {
              documentId: "doc-2",
              title: "Tax Receipt",
              storagePath: "/docs/tax.pdf",
              fileSize: 2048,
              mimeType: "application/pdf",
              sha256Hash: "0x" + "b".repeat(64),
            },
          ],
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe("DUPLICATE_APPLICATION");
    });
  });

  describe("3. Concurrency & State Machine Hardening", () => {
    it("Should reject finalizing a transfer that is still in PENDING_BUYER state (400 INVALID_STATE)", async () => {
      const res = await request(app)
        .post("/api/transfers/TRF-PENDING-BUYER-TEST/complete")
        .set("Authorization", "Bearer demo-token-government")
        .send({
          blockchainTxHash: "0x22223333444455556666777788889999aaaabbbbccccddddeeeeffff00001111",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe("INVALID_STATE");
    });

    it("Should prevent transaction hash replay on different transfers (409 TRANSACTION_REPLAY)", async () => {
      memoryStore.setDoc("transferRequests", "TRF-READY-TO-FINALIZE", {
        id: "TRF-READY-TO-FINALIZE",
        transferId: "TRF-READY-TO-FINALIZE",
        landId: "LAND-TEST-SEC-01",
        sellerUid: "seller-123",
        sellerWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        buyerUid: "buyer-456",
        buyerWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        status: "APPROVED_PENDING_BLOCKCHAIN",
        createdAt: new Date().toISOString(),
      });

      const res = await request(app)
        .post("/api/transfers/TRF-READY-TO-FINALIZE/complete")
        .set("Authorization", "Bearer demo-token-government")
        .send({
          blockchainTxHash: "0x111122223333444455556666777788889999aaaabbbbccccddddeeeeffff0000",
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe("TRANSACTION_REPLAY");
    });
  });

  describe("4. Public Data Minimization and Privacy", () => {
    it("Should mask owner email and omit internal user UIDs for unauthenticated public requests", async () => {
      const res = await request(app).get("/api/records/LAND-TEST-SEC-01");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.currentOwnerUid).toBeUndefined();
      expect(res.body.data.currentOwnerEmail).toContain("***@***");
      expect(res.body.data.parcelNumber).toBe("SY-SEC-999");
    });
  });

  describe("5. Standardized Error Formats", () => {
    it("Missing token should return AUTH_REQUIRED code", async () => {
      const res = await request(app).get("/api/auth/profile");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe("AUTH_REQUIRED");
    });

    it("Unknown API route should return 404 with NOT_FOUND code", async () => {
      const res = await request(app).get("/api/non-existent-endpoint-xyz");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe("NOT_FOUND");
    });
  });
});
