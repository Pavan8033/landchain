/**
 * LandChain - Demonstration Data Seeding Script
 * Seeds fictional demonstration land parcels, applications, transfers, and audit logs.
 *
 * Usage:
 *   npx ts-node scripts/seed-data.ts
 */

const SEED_PARCELS = [
  {
    surveyNumber: "SY-104/2B",
    state: "Karnataka",
    district: "Bengaluru Urban",
    locality: "Indiranagar, Bengaluru",
    areaSqMeters: 2400,
    landCategory: "RESIDENTIAL",
    description: "Residential prime corner plot registered under BBMP survey limits.",
    applicantWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    documents: [
      {
        documentId: "DOC-KA-001",
        title: "Khata Certificate & Title Deed",
        storagePath: "documents/seller-123/APP-2026-001/khata_cert.pdf",
        fileSize: 1048576,
        mimeType: "application/pdf",
        sha256Hash: "0x4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
      },
    ],
  },
  {
    surveyNumber: "CTS-892/A",
    state: "Maharashtra",
    district: "Pune",
    locality: "Kothrud, Pune",
    areaSqMeters: 3200,
    landCategory: "COMMERCIAL",
    description: "Commercial zoning land parcel with direct highway frontage.",
    applicantWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    documents: [
      {
        documentId: "DOC-MH-002",
        title: "7/12 Extract & Zone Sanction",
        storagePath: "documents/seller-123/APP-2026-002/7_12_extract.pdf",
        fileSize: 2097152,
        mimeType: "application/pdf",
        sha256Hash: "0x89d2a67e123fcb9a071239aa8e37bcdeff12048593a105c9382b7194628aa410",
      },
    ],
  },
  {
    surveyNumber: "PLOT-45/SEC-3",
    state: "Tamil Nadu",
    district: "Chennai",
    locality: "Adyar, Chennai",
    areaSqMeters: 1800,
    landCategory: "COMMERCIAL",
    description: "IT corridor tech-hub land record verified with CMDA registration.",
    applicantWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    documents: [
      {
        documentId: "DOC-TN-003",
        title: "Patta Chitta & CMDA Sanction",
        storagePath: "documents/buyer-456/APP-2026-003/patta_chitta.pdf",
        fileSize: 1572864,
        mimeType: "application/pdf",
        sha256Hash: "0x34a1b0c9f87d6e5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a",
      },
    ],
  },
];

async function seed() {
  const apiUrl = process.env.API_BASE_URL || "http://localhost:5000/api";
  console.log("Seeding demonstration land parcels to:", apiUrl);

  for (const p of SEED_PARCELS) {
    try {
      const res = await fetch(`${apiUrl}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer demo-token-seller",
        },
        body: JSON.stringify(p),
      });
      const data = await res.json();
      console.log(`Submitted: ${p.surveyNumber} -> ${data.data?.applicationId || data.error}`);
    } catch (e: any) {
      console.warn("Seeding error:", e.message);
    }
  }

  console.log("Seeding complete!");
}

seed();
