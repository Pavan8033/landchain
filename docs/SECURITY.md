# LandChain Security Model & Hardened Production Architecture

> **Academic Prototype Disclaimer**: LandChain is an academic demonstration prototype and is not an official government land registry or legal title conveyance system.

---

## 1. Threat Mitigation Matrix

| Threat Vector | Legacy Risk | LandChain Architectural Mitigation |
| :--- | :--- | :--- |
| **Self-Granting Privileges** | Client modifies role to `government` during signup | Client cannot set role claims; privileged roles require `adminSecret` verified server-side with Firebase Admin Custom Claims. |
| **Unauthorized Registration** | Fraudulent user registers fake parcel on-chain | `registerLand` has `onlyGovernmentVerifier` modifier. Calling from unauthorized address reverts with `UnauthorizedCaller`. |
| **Duplicate Parcel Minting** | Seller registers the same parcel twice | Smart contract tracks `_landExists[landId]`. Duplicate calls revert with `LandAlreadyRegistered`. Backend enforces multi-layer checks against existing canonical records and pending reviews. |
| **Unauthorized Ownership Transfer**| Attacker attempts to transfer victim's land | `initiateTransfer` requires `msg.sender == land.currentOwner`. Any other caller reverts with `NotCurrentOwner`. Server re-verifies on-chain ownership before creating transfer offers. |
| **Involuntary / Fraudulent Conveyance** | Seller forces transfer onto victim | `authorizeTransfer` requires state `ACCEPTED_BY_BUYER`. Government cannot authorize until buyer executes `acceptTransfer`. |
| **Transaction Replay Attack** | Attacker or stale UI resubmits already mined transaction hash | Backend checks global completed transfer transactions and rejects previously finalized transaction hashes with `409 TRANSACTION_REPLAY`. |
| **IDOR Resource Access** | User guesses notification or transfer ID belonging to another party | Server validates user identity against `recipientUid`, `sellerUid`, or `buyerUid`. Cross-tenant mutations return `403 FORBIDDEN`. |
| **Data Projection Desynchronization** | Database write fails after blockchain transaction confirms | Blockchain is authoritative. A government-only reconciliation endpoint (`/api/records/:landId/reconcile`) reads on-chain state and safely repairs the database projection. |
| **Document Alteration** | Deed scan is digitally altered after filing | File is hashed using SHA-256 before filing. Any alteration produces a mismatch with the on-chain hash. |
| **Private Data Leakage** | Personally identifiable information on ledger | PII is never written to Ethereum; public API responses sanitize emails and omit internal database identifiers. |

---

## 2. Real User Security Model

The LandChain security architecture operates under a zero-trust model:
1. **The frontend is NOT trusted**: All identities, roles, and wallets are derived server-side from verified authentication sessions. Client payloads attempting to assert `userId`, `role`, or `currentOwner` are disregarded.
2. **The database is NOT the authority for blockchain ownership**: The database is treated as an indexed read-projection. On-chain ownership is authoritative.
3. **The smart contract is authoritative for state transitions**: Transfer lifecycles follow a strict state machine (`PENDING_BUYER` -> `ACCEPTED_BY_BUYER` / `PENDING_GOVERNMENT` -> `APPROVED_PENDING_BLOCKCHAIN` -> `TRANSFERRED_ON_CHAIN`). Arbitrary transitions without prior steps revert or return `400 INVALID_STATE`.
4. **Normalized Ethereum Addresses**: All Ethereum addresses are normalized using checksum formats (`ethers.getAddress()`) to prevent casing mismatch exploits.

---

## 3. Smart Contract Access Control (`LandRegistry.sol`)

The contract uses gas-efficient custom errors and function modifiers:
- `onlyAdmin`: Restricted to contract deployer (can update government verifier address).
- `onlyGovernmentVerifier`: Restricted to authorized registrar address (can call `registerLand` and `authorizeTransfer`).
- Owner-checked operations: Functions verify `msg.sender == land.currentOwner`.
- Zero-address protection: Zero addresses for owners or buyers revert with `InvalidAddress` or `InvalidBuyerAddress`.
- Idempotency & Replay Resistance: Duplicate registrations revert with `LandAlreadyRegistered`.

---

## 4. Multi-Layer Duplicate Land Protection

Duplicate land applications are blocked at three independent layers:
- **Layer 1 (Canonical Records)**: Before creating an application, backend queries `landRecords` for existing survey/parcel numbers. Matching records return `409 DUPLICATE_LAND`.
- **Layer 2 (Pending Pipeline)**: Backend queries active `landApplications` in review. Existing submissions return `409 DUPLICATE_APPLICATION`.
- **Layer 3 (Blockchain Registry)**: The `LandRegistry.sol` smart contract checks `_landExists[landId]` mapping, reverting any collision attempt.

---

## 5. Administrative Data Reconciliation

In real-world distributed architectures, a blockchain transaction can succeed while a subsequent network failure interrupts the database projection update.
LandChain provides a strictly restricted administrative reconciliation tool:
- **Endpoint**: `POST /api/records/:landId/reconcile` (also supports `GET /api/records/:landId/reconcile`)
- **Access Control**: Authenticated Government Verifiers ONLY (`requireRole(["government"])`).
- **Behavior**:
  1. Queries authoritative on-chain state via `getLand(landId)`.
  2. Compares `onChain.currentOwner` against `record.currentOwnerWallet`.
  3. If desynchronized, safely updates the local Firestore/database projection to match the blockchain.
  4. Records an immutable audit log (`RECONCILIATION_PERFORMED`).
  5. Never alters the blockchain ledger.

---

## 6. Standardized Error Codes

All API endpoints return standardized, predictable JSON responses:

**Success Structure:**
```json
{
  "success": true,
  "data": {}
}
```

**Error Structure:**
```json
{
  "success": false,
  "error": "Human-readable error explanation",
  "code": "MACHINE_READABLE_CODE",
  "details": []
}
```

**Common Error Codes:**
- `AUTH_REQUIRED`: Missing or expired Bearer token.
- `FORBIDDEN`: User role or tenant lacks permission for requested action.
- `NOT_FOUND`: Resource does not exist.
- `VALIDATION_ERROR`: Zod schema parameter validation failed.
- `INVALID_STATE`: Workflow state machine violation.
- `DUPLICATE_LAND`: Survey/parcel is already registered on-chain.
- `DUPLICATE_APPLICATION`: Survey/parcel has an active review in progress.
- `TRANSACTION_REPLAY`: Blockchain transaction hash was previously processed.
- `OWNER_MISMATCH`: Seller does not match on-chain recorded owner.
- `BUYER_MISMATCH`: Designated buyer differs from acting party.
- `VERIFICATION_MISMATCH`: Finalized smart contract state does not match transfer parameters.
- `BLOCKCHAIN_UNAVAILABLE`: Local or remote RPC provider is offline.

---

## 7. Database & Storage Security Rules

- **Firestore Rules (`firestore.rules`):**
  - Deny access by default.
  - Prohibit clients from writing privileged fields (`role`, `status`, `onChainTxHash`, `reviewerUid`).
  - Read access to private applications and documents restricted to the owner applicant and authorized government users.
  - Public can only read records with `publicationState == 'PUBLISHED'` and `verificationState == 'VERIFIED_ON_CHAIN'`.
  - Immutable audit logs: `allow update, delete: if false;`.

- **Storage Rules (`storage.rules`):**
  - Private deeds readable only by uploader or government authority.
  - Max upload size limited to 15MB.
  - Strict MIME type enforcement (`application/pdf`, `image/jpeg`, `image/png`).
