import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "./app";
import { Express } from "express";
import { setMockStorageCapability } from "./config/firebase";

describe("LandChain API Endpoints Test Suite", () => {
  let app: Express;

  beforeAll(() => {
    app = createApp() as Express;
  });

  afterAll(() => {
    setMockStorageCapability(null);
  });

  it("GET /api/health should return HEALTHY status and metadata", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("HEALTHY");
    expect(res.body.service).toContain("LandChain");
    expect(res.body.databaseMode).toBeDefined();
    expect(res.body.storageMode).toBeDefined();
    expect(res.body.storage).toBeDefined();
    expect(typeof res.body.storage.enabled).toBe("boolean");
  });

  describe("Public Records and Search", () => {
    it("GET /api/records/search should return published verified records", async () => {
      const res = await request(app).get("/api/records/search");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it("GET /api/records/LAND-KA-BLR-001 should return record details", async () => {
      const res = await request(app).get("/api/records/LAND-KA-BLR-001");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.landId).toBe("LAND-KA-BLR-001");
      expect(res.body.data.locality).toContain("Indiranagar");
    });

    it("GET /api/records/NONEXISTENT should return 404", async () => {
      const res = await request(app).get("/api/records/NONEXISTENT-999");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("GET /api/records/LAND-KA-BLR-001/certificate should generate and stream a PDF", async () => {
      const res = await request(app).get("/api/records/LAND-KA-BLR-001/certificate");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toBe("application/pdf");
      expect(res.headers["content-disposition"]).toContain("attachment");
      expect(res.body).toBeDefined();
    });
  });

  describe("Authentication and Role-Based Authorization", () => {
    it("POST /api/applications without token should return 401 Unauthorized", async () => {
      const res = await request(app).post("/api/applications").send({});
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("GET /api/audit without government role should return 403 Forbidden", async () => {
      // Seller role attempting to view audit logs
      const res = await request(app)
        .get("/api/audit")
        .set("Authorization", "Bearer demo-token-seller");
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("GET /api/audit with government role should return 200 and audit logs", async () => {
      const res = await request(app)
        .get("/api/audit")
        .set("Authorization", "Bearer demo-token-government");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("Validation and Applications", () => {
    it("POST /api/applications with invalid payload should return 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/applications")
        .set("Authorization", "Bearer demo-token-seller")
        .send({
          surveyNumber: "", // invalid
          state: "Karnataka",
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.details).toBeDefined();
    });
  });

  describe("Step 5: Buyer Explicit Consent Workflow", () => {
    it("GET /api/transfers should allow buyer to view only their own transfer requests", async () => {
      const res = await request(app)
        .get("/api/transfers")
        .set("Authorization", "Bearer demo-token-buyer");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      const transfer5230 = res.body.data.find(
        (t: any) => t.transferId === "LC-TRF-2026-5230" || t.id === "LC-TRF-2026-5230"
      );
      expect(transfer5230).toBeDefined();
      expect(transfer5230.status).toBe("PENDING_BUYER");
      expect(transfer5230.agreedPriceInr).toBe(12500000);
    });

    it("GET /api/transfers for another buyer should NOT show transfer LC-TRF-2026-5230", async () => {
      const res = await request(app)
        .get("/api/transfers")
        .set("x-demo-role", "buyer")
        .set("x-demo-uid", "unrelated-buyer-999");

      expect(res.status).toBe(200);
      const transfer5230 = res.body.data.find(
        (t: any) => t.transferId === "LC-TRF-2026-5230" || t.id === "LC-TRF-2026-5230"
      );
      expect(transfer5230).toBeUndefined();
    });

    it("POST /api/transfers/:id/accept by seller should return 403 Forbidden", async () => {
      const res = await request(app)
        .post("/api/transfers/LC-TRF-2026-5230/accept")
        .set("Authorization", "Bearer demo-token-seller");

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("POST /api/transfers/:id/accept by government authority should return 403 Forbidden", async () => {
      const res = await request(app)
        .post("/api/transfers/LC-TRF-2026-5230/accept")
        .set("Authorization", "Bearer demo-token-government");

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("POST /api/transfers/:id/accept by an uninvited buyer should return 403 Forbidden", async () => {
      const res = await request(app)
        .post("/api/transfers/LC-TRF-2026-5230/accept")
        .set("x-demo-role", "buyer")
        .set("x-demo-uid", "impostor-buyer-888");

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("POST /api/transfers/:id/accept by designated buyer transitions status to PENDING_GOVERNMENT", async () => {
      const res = await request(app)
        .post("/api/transfers/LC-TRF-2026-5230/accept")
        .set("Authorization", "Bearer demo-token-buyer");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("PENDING_GOVERNMENT");
      expect(res.body.data.buyerConsentAt).toBeDefined();
      expect(res.body.data.buyerConsentBy).toBe("buyer-456");
    });

    it("POST /api/transfers/:id/accept concurrency protection: cannot accept a non-pending transfer twice", async () => {
      const res = await request(app)
        .post("/api/transfers/LC-TRF-2026-5230/accept")
        .set("Authorization", "Bearer demo-token-buyer");

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("already accepted");
    });

    it("POST /api/transfers/:id/reject without reason should return 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/transfers/LC-TRF-2026-5231/reject")
        .set("Authorization", "Bearer demo-token-buyer")
        .send({ reason: "" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("POST /api/transfers/:id/reject with reason transitions status to REJECTED_BY_BUYER", async () => {
      const res = await request(app)
        .post("/api/transfers/LC-TRF-2026-5231/reject")
        .set("Authorization", "Bearer demo-token-buyer")
        .send({ reason: "Agreed terms do not align with survey report." });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("REJECTED_BY_BUYER");
      expect(res.body.data.buyerRejectionReason).toBe("Agreed terms do not align with survey report.");
      expect(res.body.data.buyerRejectedAt).toBeDefined();
    });

    it("GET /api/transfers for government queue should show accepted transfer as PENDING_GOVERNMENT", async () => {
      const res = await request(app)
        .get("/api/transfers")
        .set("Authorization", "Bearer demo-token-government");

      expect(res.status).toBe(200);
      const pendingGovTransfer = res.body.data.find(
        (t: any) => t.transferId === "LC-TRF-2026-5230" || t.id === "LC-TRF-2026-5230"
      );
      expect(pendingGovTransfer).toBeDefined();
      expect(pendingGovTransfer.status).toBe("PENDING_GOVERNMENT");
    });

    it("GET /api/notifications should include seller notification of buyer consent", async () => {
      const res = await request(app)
        .get("/api/notifications")
        .set("Authorization", "Bearer demo-token-seller");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      const consentNotification = res.body.data.find(
        (n: any) => n.title?.includes("Buyer Accepted") || n.message?.includes("LC-TRF-2026-5230")
      );
      expect(consentNotification).toBeDefined();
    });
  });

  describe("Step 7: Public Verification and Digital Land Certificate", () => {
    it("GET /api/records/:landId/verify should perform public 5/5 deterministic verification", async () => {
      const res = await request(app).get("/api/records/LAND-KA-BLR-804/verify");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.landId).toBe("LAND-KA-BLR-804");
      expect(res.body.data.verifiedAt).toBeDefined();
      expect(res.body.data.verificationChecklist).toBeDefined();
      expect(res.body.data.verificationChecklist.checksPassed).toBeDefined();
      expect(res.body.data.verificationChecklist.totalChecks).toBe(5);

      // Verify privacy model: no sensitive PII exposed
      expect(res.body.data.sellerEmail).toBeUndefined();
      expect(res.body.data.buyerEmail).toBeUndefined();
      expect(res.body.data.documents).toBeUndefined();
    });

    it("GET /api/records/NONEXISTENT/verify should return 404 Not Found", async () => {
      const res = await request(app).get("/api/records/LAND-DOES-NOT-EXIST/verify");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("GET /api/records/:landId/history should return public chronological ownership history", async () => {
      const res = await request(app).get("/api/records/LAND-KA-BLR-804/history");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.landId).toBe("LAND-KA-BLR-804");
      expect(Array.isArray(res.body.data.timeline)).toBe(true);
      expect(res.body.data.timeline.length).toBeGreaterThan(0);
      expect(res.body.data.timeline[0].title).toBeDefined();
    });

    it("GET /api/certificates/:landId should redirect to or stream the official digital certificate", async () => {
      const res = await request(app).get("/api/certificates/LAND-KA-BLR-804");
      // App.ts configures a 302 redirect to /api/records/:landId/certificate
      expect([200, 302]).toContain(res.status);
      if (res.status === 302) {
        expect(res.headers.location).toContain("/certificate");
      }
    });

    it("GET /api/records/LAND-KA-BLR-804/certificate should stream PDF with QR code and disclaimers", async () => {
      const res = await request(app).get("/api/records/LAND-KA-BLR-804/certificate");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toBe("application/pdf");
      expect(res.headers["content-disposition"]).toContain("LAND-KA-BLR-804");
      expect(res.body).toBeDefined();
    });
  });

  describe("Firebase Storage Optionality & Graceful Degradation (Modes A & B)", () => {
    const sellerHeaders = {
      Authorization: "Bearer demo-token-seller",
      "X-Demo-Role": "seller",
      "X-Demo-Uid": "seller-123",
      "X-Demo-Wallet": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    };

    const govHeaders = {
      Authorization: "Bearer demo-token-government",
      "X-Demo-Role": "government",
      "X-Demo-Uid": "gov-789",
      "X-Demo-Wallet": "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    };

    it("MODE B: Storage Unavailable - /api/health explicitly reports STORAGE_UNAVAILABLE and disabled", async () => {
      setMockStorageCapability({
        enabled: false,
        status: "STORAGE_UNAVAILABLE",
        bucket: "land-registry-da90e.appspot.com",
        message: "Cloud Storage bucket not provisioned on Google Cloud.",
      });

      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body.storageMode).toBe("STORAGE_UNAVAILABLE");
      expect(res.body.storage.enabled).toBe(false);
      expect(res.body.storage.status).toBe("STORAGE_UNAVAILABLE");
    });

    it("MODE B: Storage Unavailable - Seller submits application without raw storage, SHA-256 hash is recorded", async () => {
      setMockStorageCapability({
        enabled: false,
        status: "STORAGE_UNAVAILABLE",
        message: "Storage unavailable",
      });

      const appPayload = {
        surveyNumber: `SY-STOR-UNAVAIL-${Date.now().toString().slice(-4)}`,
        state: "Karnataka",
        district: "Bengaluru Urban",
        locality: "Whitefield, Bengaluru",
        areaSqMeters: 3000,
        landCategory: "RESIDENTIAL",
        description: "Test parcel submitted in Storage Unavailable Mode with SHA-256 hash proof",
        applicantWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        documents: [
          {
            documentId: `DOC-HASH-${Date.now()}`,
            title: "Khata Certificate & Title Deed",
            fileName: "Title_Deed_Sale.pdf",
            // Notice: no real storagePath required; operating in hash-only mode
            storageStatus: "STORAGE_UNAVAILABLE",
            fileSize: 204800,
            mimeType: "application/pdf",
            sha256Hash: "0x3f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
          },
        ],
      };

      const res = await request(app)
        .post("/api/applications")
        .set(sellerHeaders)
        .send(appPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("PENDING_REVIEW");
      expect(res.body.data.documents[0].sha256Hash).toBe("0x3f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945");
      expect(res.body.data.documents[0].storageStatus).toBe("STORAGE_UNAVAILABLE");
    });

    it("MODE A: Storage Available - /api/health reports AVAILABLE and enabled", async () => {
      setMockStorageCapability({
        enabled: true,
        status: "AVAILABLE",
        bucket: "land-registry-da90e.appspot.com",
      });

      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body.storageMode).toBe("AVAILABLE");
      expect(res.body.storage.enabled).toBe(true);
      expect(res.body.storage.bucket).toBe("land-registry-da90e.appspot.com");
    });

    it("MODE A: Storage Available - Seller submits application with storagePath and STORED status", async () => {
      setMockStorageCapability({
        enabled: true,
        status: "AVAILABLE",
        bucket: "land-registry-da90e.appspot.com",
      });

      const appPayload = {
        surveyNumber: `SY-STOR-AVAIL-${Date.now().toString().slice(-4)}`,
        state: "Karnataka",
        district: "Bengaluru Urban",
        locality: "Indiranagar, Bengaluru",
        areaSqMeters: 4500,
        landCategory: "COMMERCIAL",
        description: "Test parcel submitted in Storage Available Mode",
        applicantWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        documents: [
          {
            documentId: `DOC-AVAIL-${Date.now()}`,
            title: "Sale Deed Registered",
            fileName: "Registered_Deed.pdf",
            storagePath: "documents/seller-123/Registered_Deed.pdf",
            storageStatus: "STORED",
            fileSize: 1048576,
            mimeType: "application/pdf",
            sha256Hash: "0x5a53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
          },
        ],
      };

      const res = await request(app)
        .post("/api/applications")
        .set(sellerHeaders)
        .send(appPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.documents[0].storageStatus).toBe("STORED");
      expect(res.body.data.documents[0].storagePath).toBe("documents/seller-123/Registered_Deed.pdf");
    });
  });
});
