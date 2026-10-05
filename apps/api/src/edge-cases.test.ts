import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "./app";
import { Express } from "express";
import { memoryStore } from "./config/firebase";

describe("LandChain API - Comprehensive Pin-to-Pin Edge Cases Test Suite", () => {
  let app: Express;

  const sellerHeaders = {
    Authorization: "Bearer demo-token-seller",
    "X-Demo-Role": "seller",
    "X-Demo-Uid": "seller-123",
    "X-Demo-Wallet": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  };

  const buyerHeaders = {
    Authorization: "Bearer demo-token-buyer",
    "X-Demo-Role": "buyer",
    "X-Demo-Uid": "buyer-456",
    "X-Demo-Wallet": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  };

  const govHeaders = {
    Authorization: "Bearer demo-token-government",
    "X-Demo-Role": "government",
    "X-Demo-Uid": "gov-789",
    "X-Demo-Wallet": "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  };

  beforeAll(() => {
    app = createApp() as Express;

    // Seed test lands
    memoryStore.setDoc("landRecords", "LAND-EDGE-KA-001", {
      id: "LAND-EDGE-KA-001",
      landId: "LAND-EDGE-KA-001",
      parcelNumber: "SY-EDGE-101",
      locality: "Indiranagar",
      district: "Bengaluru Urban",
      state: "Karnataka",
      areaSqMeters: 2500,
      landCategory: "RESIDENTIAL",
      description: "Edge test parcel in Bengaluru",
      currentOwnerWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      currentOwnerUid: "seller-123",
      currentOwnerEmail: "seller@landchain.demo",
      docIntegrityHash: "0x" + "a".repeat(64),
      verificationState: "VERIFIED_ON_CHAIN",
      publicationState: "PUBLISHED",
      transferCount: 0,
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    memoryStore.setDoc("landRecords", "LAND-TAMPERED-001", {
      id: "LAND-TAMPERED-001",
      landId: "LAND-TAMPERED-001",
      parcelNumber: "SY-TAMPERED-999",
      locality: "Whitefield",
      district: "Bengaluru Urban",
      state: "Karnataka",
      areaSqMeters: 5000,
      landCategory: "COMMERCIAL",
      currentOwnerWallet: "0x000000000000000000000000000000000000dEaD", // Altered locally
      currentOwnerUid: "attacker-999",
      docIntegrityHash: "0x" + "f".repeat(64), // Tampered hash
      verificationState: "VERIFIED_ON_CHAIN",
      publicationState: "PUBLISHED",
      transferCount: 0,
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    // Seed test application
    memoryStore.setDoc("landApplications", "APP-EDGE-001", {
      id: "APP-EDGE-001",
      applicationId: "APP-EDGE-001",
      applicantUid: "seller-123",
      applicantEmail: "seller@landchain.demo",
      applicantWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      surveyNumber: "SY-EDGE-APP-001",
      state: "Karnataka",
      district: "Bengaluru Urban",
      locality: "Koramangala",
      areaSqMeters: 2000,
      landCategory: "RESIDENTIAL",
      status: "PENDING_REVIEW",
      documents: [
        {
          documentId: "DOC-EDGE-1",
          title: "Title Deed",
          fileName: "Deed.pdf",
          storagePath: "/docs/deed.pdf",
          fileSize: 1024,
          mimeType: "application/pdf",
          sha256Hash: "0x" + "c".repeat(64),
        },
      ],
      createdAt: new Date().toISOString(),
    });

    // Seed test transfer
    memoryStore.setDoc("transferRequests", "TRF-EDGE-PENDING", {
      id: "TRF-EDGE-PENDING",
      transferId: "TRF-EDGE-PENDING",
      landId: "LAND-EDGE-KA-001",
      sellerUid: "seller-123",
      sellerEmail: "seller@landchain.demo",
      sellerWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      buyerUid: "buyer-456",
      buyerEmail: "buyer@landchain.demo",
      buyerWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      status: "PENDING_BUYER",
      agreedPrice: 5000000,
      currency: "INR",
      createdAt: new Date().toISOString(),
    });
  });

  describe("1. Security & Input Sanitization Edge Cases", () => {
    it("Should safely handle regex injection and special characters in search query (?q=.*+?^${}()|[]\\)", async () => {
      const res = await request(app).get("/api/records/search?q=.*+?^${}()|[]\\");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("Should safely handle SQL/NoSQL injection payloads in search query", async () => {
      const res = await request(app).get("/api/records/search?q=' OR '1'='1' --");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("Should handle extreme pagination bounds (page=99999, limit=100)", async () => {
      const res = await request(app).get("/api/records/search?page=99999&limit=100");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
      expect(res.body.pagination.page).toBe(99999);
    });

    it("Should reject application with negative areaSqMeters (400 Bad Request)", async () => {
      const res = await request(app)
        .post("/api/applications")
        .set(sellerHeaders)
        .send({
          surveyNumber: "SY-NEG-01",
          state: "Karnataka",
          district: "Bengaluru Urban",
          locality: "Jayanagar",
          areaSqMeters: -500,
          landCategory: "RESIDENTIAL",
          description: "Negative area test",
          applicantWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          documents: [
            {
              documentId: "d1",
              title: "Khata",
              fileName: "khata.pdf",
              storagePath: "docs/k.pdf",
              fileSize: 100,
              mimeType: "application/pdf",
              sha256Hash: "0x" + "1".repeat(64),
            },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("Should reject application with invalid landCategory enum (400 Bad Request)", async () => {
      const res = await request(app)
        .post("/api/applications")
        .set(sellerHeaders)
        .send({
          surveyNumber: "SY-INVALID-CAT",
          state: "Karnataka",
          district: "Bengaluru Urban",
          locality: "Jayanagar",
          areaSqMeters: 1200,
          landCategory: "INVALID_CATEGORY_XYZ",
          description: "Invalid category test",
          applicantWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          documents: [
            {
              documentId: "d1",
              title: "Khata",
              fileName: "khata.pdf",
              storagePath: "docs/k.pdf",
              fileSize: 100,
              mimeType: "application/pdf",
              sha256Hash: "0x" + "1".repeat(64),
            },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("2. Application Review Lifecycle Edge Cases", () => {
    it("Should prevent buyer from reviewing an application (403 Forbidden)", async () => {
      const res = await request(app)
        .put("/api/applications/APP-EDGE-001/review")
        .set(buyerHeaders)
        .send({ status: "APPROVED_PENDING_BLOCKCHAIN", reviewNotes: "Trying to approve as buyer" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("Should reject review for a nonexistent application (404 Not Found)", async () => {
      const res = await request(app)
        .put("/api/applications/APP-DOES-NOT-EXIST/review")
        .set(govHeaders)
        .send({ status: "REJECTED", reviewNotes: "Parcel cannot be verified in revenue records" });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("Should reject review if reviewNotes is too short or missing (400 Bad Request)", async () => {
      const res = await request(app)
        .put("/api/applications/APP-EDGE-001/review")
        .set(govHeaders)
        .send({ status: "REJECTED", reviewNotes: "no" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("Should successfully approve an application with government authority", async () => {
      const res = await request(app)
        .put("/api/applications/APP-EDGE-001/review")
        .set(govHeaders)
        .send({ status: "APPROVED_PENDING_BLOCKCHAIN", reviewNotes: "Field inspection passed successfully and boundaries verified." });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("APPROVED_PENDING_BLOCKCHAIN");
      expect(res.body.data.reviewerUid).toBe("gov-789");
    });

    it("Should reject reviewing an application that has already reached VERIFIED_ON_CHAIN (400 Bad Request)", async () => {
      memoryStore.setDoc("landApplications", "APP-EDGE-VERIFIED", {
        id: "APP-EDGE-VERIFIED",
        applicationId: "APP-EDGE-VERIFIED",
        applicantUid: "seller-123",
        status: "VERIFIED_ON_CHAIN",
        surveyNumber: "SY-ALREADY-VERIFIED",
        state: "Karnataka",
        district: "Bengaluru Urban",
        locality: "Indiranagar",
        areaSqMeters: 1500,
        landCategory: "RESIDENTIAL",
        createdAt: new Date().toISOString(),
      });

      const res = await request(app)
        .put("/api/applications/APP-EDGE-VERIFIED/review")
        .set(govHeaders)
        .send({ status: "REJECTED", reviewNotes: "Attempting to reject an already verified record" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("already verified");
    });
  });

  describe("3. Ownership Transfer Edge Cases & Integrity", () => {
    it("Should reject transfer initiation if seller is not current owner (403 OWNER_MISMATCH)", async () => {
      const res = await request(app)
        .post("/api/transfers")
        .set({
          Authorization: "Bearer demo-token-seller",
          "X-Demo-Role": "seller",
          "X-Demo-Uid": "unrelated-seller-777",
          "X-Demo-Wallet": "0x1234567890123456789012345678901234567890",
        })
        .send({
          landId: "LAND-EDGE-KA-001",
          buyerEmail: "buyer@landchain.demo",
          buyerWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          agreedPrice: 7500000,
          currency: "INR",
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("Should reject transfer initiation for a nonexistent land parcel (404 NOT_FOUND)", async () => {
      const res = await request(app)
        .post("/api/transfers")
        .set(sellerHeaders)
        .send({
          landId: "LAND-DOES-NOT-EXIST-404",
          buyerEmail: "buyer@landchain.demo",
          buyerWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          agreedPrice: 5000000,
          currency: "INR",
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("Should reject transfer initiation when another active transfer is already in progress (400 Bad Request)", async () => {
      // LAND-EDGE-KA-001 already has TRF-EDGE-PENDING in progress
      const res = await request(app)
        .post("/api/transfers")
        .set(sellerHeaders)
        .send({
          landId: "LAND-EDGE-KA-001",
          buyerEmail: "anotherbuyer@landchain.demo",
          buyerWallet: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
          agreedPrice: 6000000,
          currency: "INR",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("Should reject seller cancelling a transfer that is not their own (403 Forbidden)", async () => {
      const res = await request(app)
        .post("/api/transfers/TRF-EDGE-PENDING/cancel")
        .set({
          Authorization: "Bearer demo-token-seller",
          "X-Demo-Role": "seller",
          "X-Demo-Uid": "attacker-seller-999",
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("Should reject action on a nonexistent transfer ID (404 NOT_FOUND)", async () => {
      const res = await request(app)
        .post("/api/transfers/TRF-NONEXISTENT-999/accept")
        .set(buyerHeaders);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("4. Public Verification & Certificate Edge Cases", () => {
    it("GET /api/records/:landId/certificate for unverified land should return 400 Bad Request", async () => {
      memoryStore.setDoc("landRecords", "LAND-UNVERIFIED-01", {
        id: "LAND-UNVERIFIED-01",
        landId: "LAND-UNVERIFIED-01",
        parcelNumber: "SY-UNVER-01",
        locality: "Electronic City",
        district: "Bengaluru Urban",
        state: "Karnataka",
        areaSqMeters: 1000,
        landCategory: "INDUSTRIAL",
        currentOwnerWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        verificationState: "PENDING_VERIFICATION", // Not verified!
        publicationState: "DRAFT",
      });

      const res = await request(app).get("/api/records/LAND-UNVERIFIED-01/certificate");
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("VERIFIED_ON_CHAIN");
    });

    it("GET /api/records/:landId/certificate for non-existent land should return 404", async () => {
      const res = await request(app).get("/api/records/LAND-DOES-NOT-EXIST/certificate");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("GET /api/records/:landId/history for non-existent land should return 404", async () => {
      const res = await request(app).get("/api/records/LAND-DOES-NOT-EXIST/history");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
