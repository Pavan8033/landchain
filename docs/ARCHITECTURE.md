# LandChain System Architecture

## 1. System Overview

LandChain is an enterprise-grade academic prototype demonstrating decentralized land registry administration, cryptographic title integrity, and multi-party conveyance protocols on the Ethereum blockchain.

```
                           +-------------------------------------+
                           |            LANDCHAIN                |
                           |       React 18 + Vite Web App       |
                           +------------------+------------------+
                                              |
                     +------------------------+------------------------+
                     | (Web3 RPC via Ethers v6)                        | (REST API via Fetch)
                     v                                                 v
+------------------------------------+               +------------------------------------+
|         HARDHAT BLOCKCHAIN         |               |         EXPRESS BACKEND            |
|       Local Ethereum Network       |               |          Node.js + TS              |
|          (ChainID: 31337)          |               |                                    |
|                                    |               | - RBAC & ID Token Validation       |
|  LandRegistry.sol                  |               | - PDFKit Certificate Generator     |
|  - registerLand(...)               |               | - Rate Limiter & Helmet            |
|  - initiateTransfer(...)           |               | - Audit Logger                     |
|  - acceptTransfer(...)             |               +------------------+-----------------+
|  - authorizeTransfer(...)          |                                  |
|  - getLand(...)                    |                                  v
+------------------------------------+               +------------------------------------+
                                                     |    CLOUD FIRESTORE & STORAGE       |
                                                     |      (or In-Memory Demo Store)     |
                                                     |                                    |
                                                     | - users & custom claims            |
                                                     | - landApplications                 |
                                                     | - landRecords (projections)        |
                                                     | - transferRequests                 |
                                                     | - auditLogs (immutable)            |
                                                     | - private storage deeds (PDF/PNG)  |
                                                     +------------------------------------+
```

---

## 2. On-Chain vs. Off-Chain Data Separation

To respect individual data privacy, comply with storage efficiency, and avoid leaking personally identifiable information (PII) onto a public distributed ledger:

| Attribute | Storage Location | Rationale |
| :--- | :--- | :--- |
| **Canonical Land ID** | On-Chain + Off-Chain | Primary index for ownership lookup |
| **Parcel / Survey Number** | On-Chain + Off-Chain | Physical land demarcator |
| **Recorded Owner Wallet** | On-Chain + Off-Chain | Cryptographic key controlling transfer authorization |
| **Locality & Area (Sq.M)** | On-Chain + Off-Chain | Essential public parcel descriptors |
| **Document Hash (SHA-256)** | On-Chain + Off-Chain | Tamper-evident mathematical proof of deed integrity |
| **Transfer Counter** | On-Chain + Off-Chain | Provenance and conveyance history count |
| **Personal Identity / Names** | Off-Chain (Firestore) | Private; protected by RBAC |
| **Phone Numbers & Contacts** | Off-Chain (Firestore) | Private; visible only to permitted stakeholders |
| **Original Deed Files (PDF)** | Private Storage (GCS) | Stored privately with restricted access |
| **Government Review Notes**| Off-Chain (Firestore) | Internal scrutiny notes |
| **Audit Log Trail** | Off-Chain (Firestore) | Immutable operational history |

---

## 3. Multi-Party Consent Transfer Lifecycle

LandChain implements a strict **Multi-Party Protocol** where no single party can unilaterally transfer title without the explicit cryptographic consent of all three parties:

```
[SELLER]                               [BUYER]                        [GOVERNMENT REGISTRAR]
   |                                      |                                     |
   |-- 1. Initiates Transfer Request ---->|                                     |
   |   (PENDING_BUYER)                    |                                     |
   |                                      |                                     |
   |                                      |-- 2. Inspects Survey & Consents --->|
   |                                      |   (ACCEPTED_BY_BUYER)               |
   |                                      |                                     |
   |                                      |                                     |-- 3. Verifies Tax, Surveys
   |                                      |                                     |      & Document Hashes
   |                                      |                                     |
   |                                      |                                     |-- 4. Signs On-Chain Tx
   |                                      |                                     |   (authorizeTransfer)
   |<------------------- 5. Ownership Transferred to Buyer's Wallet ------------|
   |                        (TRANSFERRED_ON_CHAIN & Updated PDF Certificate)
```

1. **Stage 1 (Seller):** Current recorded owner chooses a verified parcel and specifies the buyer's wallet and agreed price. (Status: `PENDING_BUYER`)
2. **Stage 2 (Buyer - Step 5):** Prospective buyer inspects title details and on-chain ownership, checks mandatory consent, and executes `acceptTransfer` (Status: `PENDING_GOVERNMENT`) or rejects with reason (Status: `REJECTED_BY_BUYER`). **No blockchain state change occurs in Step 5.**
3. **Stage 3 (Government - Step 6):** Registrar reviews buyer-seller mutual consent, checks revenue maps, and executes `authorizeTransfer` on the smart contract via MetaMask.
4. **Stage 4 (Ledger):** The smart contract reassigns the recorded owner to the buyer, increments the transfer counter, and emits `OwnershipTransferred`.
5. **Stage 5 (Projection):** The database projection is updated from the confirmed on-chain receipt, and an updated PDF certificate (Version 2) is generated while the previous certificate is marked `SUPERSEDED`.

---

## 4. Step 7: Public Verification Engine & Digital Land Certificate

LandChain features a high-trust, read-only public verification portal designed for public citizens, legal counsels, and real estate agents without requiring authentication or Web3/MetaMask wallets:

1. **Direct Smart Contract Verification:** Queries `getLand(landId)` directly on the EVM node to corroborate the backend database projection.
2. **Deterministic 5/5 Verification Checklist:**
   - [x] Land parcel exists on-chain
   - [x] Current owner matches smart contract state
   - [x] Municipal survey / parcel number matches
   - [x] Deed integrity hash (SHA-256) matches registered hash
   - [x] Government verification state confirmed
3. **Immutable Ownership History:** Renders a clean chronological timeline from initial registration through successive conveyed blocks and transaction hashes.
4. **Dynamic PDF Certificates & QR Seals:**
   - Certificate versioning (`Version 1`, `Version 2`) reflecting title conveyance count.
   - Status tracking (`ACTIVE` for current titleholder vs. `SUPERSEDED` for historical owners).
   - Embedded verification QR code pointing directly to `http://localhost:5173/verify/{landId}`.
   - Prominent academic demonstration notice.
