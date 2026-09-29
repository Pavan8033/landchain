import * as admin from "firebase-admin";
import * as path from "path";
import * as fs from "fs";

let isUsingRealFirebase = false;

// Attempt initializing Firebase Admin with service account JSON env, base64 env, file path, or default credentials
try {
  const isUnitTest = process.env.NODE_ENV === "test" && process.env.TEST_WITH_REAL_FIREBASE !== "true";

  if (!isUnitTest) {
    let serviceAccount: any = null;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64) {
      const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64, "base64").toString("utf-8");
      serviceAccount = JSON.parse(decoded);
    } else {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
        ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        : path.resolve(__dirname, "../../serviceAccountKey.json");

      if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
      }
    }

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`,
      });
      admin.firestore().settings({ ignoreUndefinedProperties: true });
      isUsingRealFirebase = true;
      console.log("[Firebase] Initialized with Service Account.");
    } else if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      admin.firestore().settings({ ignoreUndefinedProperties: true });
      isUsingRealFirebase = true;
      console.log("[Firebase] Initialized with Project ID.");
    } else {
      console.log("[Firebase] No credentials found. Running in resilient Academic Demo Mock mode.");
    }
  }
} catch (error) {
  console.warn("[Firebase] Initialization error, falling back to mock mode:", error);
}

export type StorageStatus = "AVAILABLE" | "STORAGE_UNAVAILABLE" | "DISABLED";

export interface StorageCapability {
  enabled: boolean;
  status: StorageStatus;
  bucket?: string;
  message?: string;
}

let mockStorageCapability: StorageCapability | null = null;
let storageAvailabilityCache: (StorageCapability & { lastChecked?: number }) | null = null;

export function setMockStorageCapability(mock: StorageCapability | null) {
  mockStorageCapability = mock;
}

export async function checkStorageAvailability(forceRefresh = false): Promise<StorageCapability> {
  if (mockStorageCapability !== null) {
    return mockStorageCapability;
  }

  if (process.env.STORAGE_DISABLED === "true") {
    return {
      enabled: false,
      status: "DISABLED",
      message: "Firebase Storage explicitly disabled via configuration.",
    };
  }

  if (!isUsingRealFirebase) {
    return {
      enabled: false,
      status: "DISABLED",
      message: "In-memory demo mode active; Cloud Storage not configured.",
    };
  }

  const now = Date.now();
  if (
    !forceRefresh &&
    storageAvailabilityCache &&
    storageAvailabilityCache.lastChecked &&
    now - storageAvailabilityCache.lastChecked < 60000
  ) {
    return {
      enabled: storageAvailabilityCache.enabled,
      status: storageAvailabilityCache.status,
      bucket: storageAvailabilityCache.bucket,
      message: storageAvailabilityCache.message,
    };
  }

  try {
    const bucket = admin.storage().bucket();
    const [exists] = await bucket.exists();
    if (exists) {
      storageAvailabilityCache = {
        enabled: true,
        status: "AVAILABLE",
        bucket: bucket.name,
        lastChecked: now,
      };
    } else {
      storageAvailabilityCache = {
        enabled: false,
        status: "STORAGE_UNAVAILABLE",
        bucket: bucket.name,
        message: `Cloud Storage bucket '${bucket.name}' is not provisioned or active on Google Cloud.`,
        lastChecked: now,
      };
    }
  } catch (err: any) {
    storageAvailabilityCache = {
      enabled: false,
      status: "STORAGE_UNAVAILABLE",
      message: err.message || "Failed to query Firebase Storage bucket.",
      lastChecked: now,
    };
  }

  return {
    enabled: storageAvailabilityCache.enabled,
    status: storageAvailabilityCache.status,
    bucket: storageAvailabilityCache.bucket,
    message: storageAvailabilityCache.message,
  };
}

export { admin, isUsingRealFirebase };

// In-Memory Database Store for robust local Academic Demo mode
class MemoryDataStore {
  private collections: Map<string, Map<string, any>> = new Map();

  constructor() {
    this.seedDemoData();
  }

  getCollection(name: string): Map<string, any> {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Map());
    }
    return this.collections.get(name)!;
  }

  setDoc(collection: string, docId: string, data: any) {
    const col = this.getCollection(collection);
    col.set(docId, { ...data, id: docId, updatedAt: new Date().toISOString() });
    return col.get(docId);
  }

  getDoc(collection: string, docId: string) {
    const col = this.getCollection(collection);
    return col.get(docId) || null;
  }

  updateDoc(collection: string, docId: string, updates: any) {
    const col = this.getCollection(collection);
    const existing = col.get(docId);
    if (!existing) return null;
    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    col.set(docId, merged);
    return merged;
  }

  listDocs(collection: string, filterFn?: (item: any) => boolean): any[] {
    const col = this.getCollection(collection);
    const all = Array.from(col.values());
    return filterFn ? all.filter(filterFn) : all;
  }

  private seedDemoData() {
    // Seed Sample Academic Users
    const users = [
      {
        uid: "seller-123",
        email: "seller@landchain.demo",
        displayName: "Rajesh Kumar (Seller)",
        role: "seller",
        walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        uid: "buyer-456",
        email: "buyer@landchain.demo",
        displayName: "Ananya Sharma (Buyer)",
        role: "buyer",
        walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        uid: "gov-789",
        email: "authority@landchain.demo",
        displayName: "Dr. K. S. Rao (Gov Registrar)",
        role: "government",
        walletAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        uid: "agent-101",
        email: "agent@landchain.demo",
        displayName: "Vikram Malhotra (Realty Agent)",
        role: "agent",
        walletAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    users.forEach((u) => this.setDoc("users", u.uid, u));

    // Seed Sample Academic Land Applications
    this.setDoc("landApplications", "APP-2026-001", {
      id: "APP-2026-001",
      applicationId: "APP-2026-001",
      applicantUid: "seller-123",
      applicantEmail: "seller@landchain.demo",
      applicantWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      surveyNumber: "SY-104/2B",
      state: "Karnataka",
      district: "Bengaluru Urban",
      locality: "Indiranagar",
      address: "12th Main Road, HAL 2nd Stage",
      areaSqMeters: 2400,
      measurementUnit: "SQ_METERS",
      landCategory: "RESIDENTIAL",
      description: "Residential prime corner plot registered under BBMP survey limits.",
      documents: [
        {
          documentId: "DOC-001",
          title: "Khata Certificate & Title Deed",
          storagePath: "documents/seller-123/APP-2026-001/khata_cert.pdf",
          fileSize: 1048576,
          mimeType: "application/pdf",
          sha256Hash: "0x4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
          uploadedAt: new Date().toISOString(),
        },
      ],
      status: "VERIFIED_ON_CHAIN",
      reviewerUid: "gov-789",
      reviewNotes: "All boundary surveys and tax compliance receipts verified with revenue department.",
      reviewedAt: new Date().toISOString(),
      onChainTxHash: "0x89e2cf4b9101c4e9301daec70f80bc2467d023a1059fba012efca812745a90e1",
      onChainBlockNumber: 42,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.setDoc("landApplications", "APP-2026-002", {
      id: "APP-2026-002",
      applicationId: "APP-2026-002",
      applicantUid: "seller-123",
      applicantEmail: "seller@landchain.demo",
      applicantWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      surveyNumber: "CTS-892/A",
      state: "Maharashtra",
      district: "Pune",
      locality: "Kothrud",
      address: "Paud Road, Survey 892",
      areaSqMeters: 3200,
      measurementUnit: "SQ_METERS",
      landCategory: "COMMERCIAL",
      description: "Commercial commercial zoning land parcel with direct highway frontage.",
      documents: [
        {
          documentId: "DOC-002",
          title: "7/12 Extract & Zone Sanction",
          storagePath: "documents/seller-123/APP-2026-002/7_12_extract.pdf",
          fileSize: 2097152,
          mimeType: "application/pdf",
          sha256Hash: "0x89d2a67e123fcb9a071239aa8e37bcdeff12048593a105c9382b7194628aa410",
          uploadedAt: new Date().toISOString(),
        },
      ],
      status: "PENDING_REVIEW",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Seed Verified On-Chain Land Records
    this.setDoc("landRecords", "LAND-KA-BLR-001", {
      id: "LAND-KA-BLR-001",
      landId: "LAND-KA-BLR-001",
      applicationId: "APP-2026-001",
      parcelNumber: "SY-104/2B",
      locality: "Indiranagar, Bengaluru",
      district: "Bengaluru Urban",
      state: "Karnataka",
      areaSqMeters: 2400,
      landCategory: "RESIDENTIAL",
      description: "Residential prime corner plot registered under BBMP survey limits.",
      currentOwnerWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      currentOwnerUid: "seller-123",
      currentOwnerEmail: "seller@landchain.demo",
      blockchainNetwork: "Hardhat Local (ChainID: 31337)",
      contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      transactionHash: "0x89e2cf4b9101c4e9301daec70f80bc2467d023a1059fba012efca812745a90e1",
      blockNumber: 42,
      docIntegrityHash: "0x4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
      verificationState: "VERIFIED_ON_CHAIN",
      publicationState: "PUBLISHED",
      transferCount: 0,
      verifiedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.setDoc("landRecords", "LAND-TN-CHN-003", {
      id: "LAND-TN-CHN-003",
      landId: "LAND-TN-CHN-003",
      applicationId: "APP-2026-003",
      parcelNumber: "PLOT-45/SEC-3",
      locality: "Adyar, Chennai",
      district: "Chennai",
      state: "Tamil Nadu",
      areaSqMeters: 1800,
      landCategory: "COMMERCIAL",
      description: "IT corridor tech-hub land record verified with CMDA registration.",
      currentOwnerWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      currentOwnerUid: "buyer-456",
      currentOwnerEmail: "buyer@landchain.demo",
      blockchainNetwork: "Hardhat Local (ChainID: 31337)",
      contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      transactionHash: "0x34a1b0c9f87d6e5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a",
      blockNumber: 44,
      docIntegrityHash: "0x34a1b0c9f87d6e5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a",
      verificationState: "VERIFIED_ON_CHAIN",
      publicationState: "PUBLISHED",
      transferCount: 1,
      verifiedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.setDoc("landRecords", "LAND-KA-BLR-804", {
      id: "LAND-KA-BLR-804",
      landId: "LAND-KA-BLR-804",
      applicationId: "APP-2026-804",
      parcelNumber: "SY-502/7A",
      locality: "Whitefield, Bengaluru",
      district: "Bengaluru Urban",
      state: "Karnataka",
      areaSqMeters: 2400,
      landCategory: "RESIDENTIAL",
      description: "Demonstration prime residential plot in Whitefield with certified municipal survey coordinates.",
      currentOwnerWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      currentOwnerUid: "seller-123",
      currentOwnerEmail: "seller@landchain.demo",
      blockchainNetwork: "Local Academic Blockchain",
      contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      transactionHash: "0xa8f7c9e1029348fbca73891048293740192837465019283746501928374650123",
      blockNumber: 48,
      docIntegrityHash: "0xa8f7c9e1029348fbca7389104829374019283746501928374650192837465012",
      verificationState: "VERIFIED_ON_CHAIN",
      publicationState: "PUBLISHED",
      transferCount: 0,
      verifiedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Seed Demo Transfer Requests for Step 5
    this.setDoc("transferRequests", "LC-TRF-2026-5230", {
      id: "LC-TRF-2026-5230",
      transferId: "LC-TRF-2026-5230",
      landId: "LAND-KA-BLR-804",
      sellerUid: "seller-123",
      sellerEmail: "seller@landchain.demo",
      sellerWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      buyerUid: "buyer-456",
      buyerEmail: "buyer@landchain.demo",
      buyerWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      agreedPrice: 12500000,
      agreedPriceInr: 12500000,
      currency: "INR",
      status: "PENDING_BUYER",
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.setDoc("transferRequests", "LC-TRF-2026-5231", {
      id: "LC-TRF-2026-5231",
      transferId: "LC-TRF-2026-5231",
      landId: "LAND-KA-BLR-001",
      sellerUid: "seller-123",
      sellerEmail: "seller@landchain.demo",
      sellerWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      buyerUid: "buyer-456",
      buyerEmail: "buyer@landchain.demo",
      buyerWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      agreedPrice: 9500000,
      agreedPriceInr: 9500000,
      currency: "INR",
      status: "PENDING_BUYER",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Seed Sample Audit Logs
    this.setDoc("auditLogs", "LOG-001", {
      id: "LOG-001",
      actorUid: "gov-789",
      actorEmail: "authority@landchain.demo",
      actorRole: "government",
      action: "LAND_VERIFIED_AND_REGISTERED_ON_CHAIN",
      targetType: "RECORD",
      targetId: "LAND-KA-BLR-001",
      transactionHash: "0x89e2cf4b9101c4e9301daec70f80bc2467d023a1059fba012efca812745a90e1",
      timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
    });
  }
}

export const memoryStore = new MemoryDataStore();
