# LandChain Backend REST API Reference

Base URL: `http://localhost:5000/api`

---

## 1. System Health
### `GET /health`
Returns system health, database mode, and blockchain connectivity.
```json
{
  "status": "HEALTHY",
  "service": "LandChain Academic API",
  "databaseMode": "IN_MEMORY_DEMO",
  "blockchain": { "connected": true, "blockNumber": 42 }
}
```

---

## 2. Authentication & Roles
### `GET /auth/profile`
Header: `Authorization: Bearer <token>`  
Returns current user profile.

### `PUT /auth/profile`
Header: `Authorization: Bearer <token>`  
Body: `{ "displayName": "string", "phoneNumber": "string", "walletAddress": "0x..." }`

### `POST /auth/set-role`
Admin endpoint to provision roles.  
Body: `{ "targetUid": "string", "targetRole": "government"|"seller"|"buyer"|"agent", "adminSecret": "string" }`

---

## 3. Land Applications
### `POST /applications`
Role: `seller`  
Body: `{ "surveyNumber": "string", "state": "string", "district": "string", "locality": "string", "areaSqMeters": 2400, "landCategory": "RESIDENTIAL", "description": "string", "applicantWallet": "0x...", "documents": [...] }`

### `GET /applications`
Returns user's applications (or all if `government`). Query: `?status=PENDING_REVIEW`

### `GET /applications/:id`
Returns application details with documents and hashes.

### `PUT /applications/:id/review`
Role: `government`  
Body: `{ "status": "APPROVED_PENDING_BLOCKCHAIN"|"REJECTED", "reviewNotes": "string" }`

### `POST /applications/:id/on-chain`
Role: `government`  
Body: `{ "onChainTxHash": "0x...", "onChainBlockNumber": 42, "contractAddress": "0x..." }`  
Creates canonical `landRecord` and sets status to `VERIFIED_ON_CHAIN`.

---

## 4. Public Records & Certificates
### `GET /records/search`
Query params: `q`, `locality`, `category`, `page`, `limit`  
Returns sanitized public records.

### `GET /records/:landId`
Returns record details with blockchain provenance.

### `GET /records/:landId/reconcile`
Cross-checks Firestore projection against Ethereum smart contract state.

### `GET /records/:landId/verify`
Public endpoint for technical verification. Reads smart contract directly and returns a deterministic 5/5 verification checklist without requiring login or MetaMask.
```json
{
  "success": true,
  "data": {
    "landId": "LAND-KA-BLR-804",
    "verificationStatus": "VERIFIED_ON_CHAIN",
    "checksPassed": 5,
    "totalChecks": 5,
    "verificationChecklist": {
      "checksPassed": 5,
      "totalChecks": 5,
      "landExistsOnChain": true,
      "ownerMatches": true,
      "parcelMatches": true,
      "docHashRegistered": true,
      "onChainVerified": true
    },
    "blockchainProof": {
      "network": "Local Academic Blockchain",
      "chainId": 31337,
      "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      "currentOwner": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    },
    "certificate": {
      "certificateNo": "CERT-LAND-KA-BLR-804-V1",
      "version": 1,
      "status": "ACTIVE",
      "qrUrl": "http://localhost:5173/verify/LAND-KA-BLR-804"
    },
    "verifiedAt": "2026-09-28T21:10:00.000Z"
  }
}
```

### `GET /records/:landId/history`
Public endpoint returning chronological ownership and conveyance milestones with block numbers and transaction hashes.

### `GET /records/:landId/certificate` or `GET /certificates/:landId`
Generates and streams cryptographic vector PDF certificate with versioning (`V1`, `V2`), active/superseded status, academic disclaimers, and embedded QR code pointing to `/verify/:landId`.

---

## 5. Ownership Transfers
### `POST /transfers`
Role: `seller`  
Body: `{ "landId": "string", "buyerEmail": "string", "buyerWallet": "0x...", "agreedPrice": 12500000 }`

### `GET /transfers`
Lists active and historical transfers for user. (Buyer sees only transfers addressed to them; Government sees all).

### `GET /transfers/:id`
Role: `buyer` | `seller` | `government`  
Retrieves transfer details, underlying land specifications, and live on-chain owner status.

### `POST /transfers/:id/accept` (Step 5 Primary Endpoint)
Role: `buyer`  
Body: `{ "notes": "string" }` (optional)  
Atomically transitions transfer status to `PENDING_GOVERNMENT`. Records buyer consent metadata (`buyerConsentAt`, `buyerConsentBy`), logs audit event `BUYER_TRANSFER_ACCEPTED`, and notifies seller.  
**Critical Constraint:** Step 5 executes NO blockchain transaction. Smart contract owner remains the seller.

### `POST /transfers/:id/reject` (Step 5 Rejection Endpoint)
Role: `buyer`  
Body: `{ "reason": "string" }` (required)  
Transitions transfer status to `REJECTED_BY_BUYER`. Records rejection reason, logs audit event `BUYER_TRANSFER_REJECTED`, and notifies seller.

### `POST /transfers/:id/government-review`
Role: `government`  
Body: `{ "action": "APPROVE"|"REJECT", "reviewNotes": "string" }`

### `POST /transfers/:id/complete` (Step 6 On-Chain Finalization)
Role: `government`  
Body: `{ "blockchainTxHash": "0x...", "blockchainBlockNumber": 46 }`  
Finalizes transfer after on-chain transaction receipt confirmed, and updates recorded owner in `landRecords`.

---

## 6. Audit & Notifications
### `GET /audit`
Role: `government`  
Returns immutable audit events (`BUYER_TRANSFER_ACCEPTED`, `BUYER_TRANSFER_REJECTED`, etc.).

### `GET /notifications`
Returns current user alerts (e.g. seller notification upon buyer acceptance).

### `PUT /notifications/:id/read`
Marks notification as read.

